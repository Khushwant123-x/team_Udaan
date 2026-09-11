import React, { useState } from 'react';
import { Lock, User as UserIcon, AlertCircle, KeyRound, Award } from 'lucide-react';
import { authApi } from '../services/api';
import { PrototypeSeal } from '../components/PrototypeSeal';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please verify government portal credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-900/50 relative overflow-hidden" 
    style={{ backgroundImage: "url('/photo.jpeg')"}}>
      
      {/* Standalone PROTOTYPE Seal Sticker - Positioned directly below "English / हिन्दी" text on top-right */}
      <div className="absolute top-3 right-4 sm:right-8 lg:right-16 z-30 transform hover:rotate-6 hover:scale-105 transition-transform duration-300 drop-shadow-2xl pointer-events-auto">
        <PrototypeSeal size={175} />
      </div>

      {/* Main Portal Container: Centered G2G Form Card */}
      <div className="max-w-md mx-auto w-full pt-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-9 space-y-6 relative overflow-hidden">
          
          {/* Top Tricolor Accent Line */}
          <div className="absolute top-0 left-0 right-0 gov-tricolor-bar" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>G2G Officer Sign-In Portal</span>
            </div>
            <span className="text-[10px] bg-blue-950 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-800 font-semibold">
              SSL SECURED
            </span>
          </div>

          {error && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 text-xs p-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Official Username / Lab Officer ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter officer username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Authorization Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-lg text-xs tracking-wider uppercase transition shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating with Central Registry...' : 'Sign In to Official Portal'}
            </button>
          </form>

          {/* Preset Roles Helper */}
          <div className="border-t border-slate-800 pt-4 text-slate-400 text-[11px] space-y-2">
            <p className="font-bold text-amber-400 flex items-center justify-between">
              <span>Quick Test Role Selectors:</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('Admin@123'); }}
                className="bg-slate-950 hover:bg-slate-800 text-amber-300 p-1.5 rounded border border-slate-800 text-center font-bold transition hover:border-amber-500"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => { setUsername('tech1'); setPassword('Tech@123'); }}
                className="bg-slate-950 hover:bg-slate-800 text-emerald-300 p-1.5 rounded border border-slate-800 text-center font-bold transition hover:border-emerald-500"
              >
                TECHNICIAN
              </button>
              <button
                type="button"
                onClick={() => { setUsername('reviewer1'); setPassword('Reviewer@123'); }}
                className="bg-slate-950 hover:bg-slate-800 text-blue-300 p-1.5 rounded border border-slate-800 text-center font-bold transition hover:border-blue-500"
              >
                REVIEWER
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
