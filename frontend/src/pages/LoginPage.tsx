import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  AlertCircle,
  Wrench,
  UserPlus,
  FileText,
  Settings,
  UserCheck,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { authApi } from '../services/api';
import { AshokaEmblem } from '../components/AshokaEmblem';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<'officer' | 'technician' | 'reviewer'>('officer');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'officer' | 'technician' | 'reviewer') => {
    setSelectedRole(role);
    if (role === 'officer') {
      setUsername('admin');
      setPassword('Admin@123');
    } else if (role === 'technician') {
      setUsername('tech1');
      setPassword('Tech@123');
    } else if (role === 'reviewer') {
      setUsername('reviewer1');
      setPassword('Reviewer@123');
    }
  };

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
    <div className="min-h-screen nawi-farm-bg flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Decorative backdrop elements */}
      <div className="absolute top-12 left-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-12 right-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glass Card Container */}
      <div className="max-w-[480px] w-full nawi-glass-card rounded-[28px] p-6 sm:p-9 shadow-2xl space-y-6 relative border border-white/90 animate-in zoom-in-95 duration-300">
        
        {/* Ashoka Emblem & Title Section */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <AshokaEmblem className="w-12 h-12 text-[#0A2540]" size={48} />
          </div>

          <h1 className="text-2xl sm:text-[26px] font-black text-[#0A2540] tracking-tight leading-none">
            NAWI Test Report Generator
          </h1>
          
          <p className="text-xs font-semibold text-slate-600 leading-tight">
            Digital Test Report Generation & Management System
          </p>

          <p className="text-xs font-bold text-blue-800 tracking-wide">
            As per OIML Recommendation R-76
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up / Register */}
        <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2.5 px-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'signin'
                ? 'bg-white text-blue-700 shadow-md'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-600" />
            <span>Sign In</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 px-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'signup'
                ? 'bg-white text-blue-700 shadow-md'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Sign Up / Register</span>
          </button>
        </div>

        {/* Divider Header: SIGN IN AS */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
            SIGN IN AS
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Role Selection Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          
          {/* Test Officer */}
          <button
            type="button"
            onClick={() => handleRoleSelect('officer')}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
              selectedRole === 'officer'
                ? 'bg-blue-50/90 border-2 border-blue-500 text-blue-900 shadow-sm font-extrabold scale-[1.02]'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 font-semibold'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedRole === 'officer' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight">Test Officer</span>
          </button>

          {/* Technician */}
          <button
            type="button"
            onClick={() => handleRoleSelect('technician')}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
              selectedRole === 'technician'
                ? 'bg-blue-50/90 border-2 border-blue-500 text-blue-900 shadow-sm font-extrabold scale-[1.02]'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 font-semibold'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedRole === 'technician' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight">Technician</span>
          </button>

          {/* Reviewer */}
          <button
            type="button"
            onClick={() => handleRoleSelect('reviewer')}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
              selectedRole === 'reviewer'
                ? 'bg-blue-50/90 border-2 border-blue-500 text-blue-900 shadow-sm font-extrabold scale-[1.02]'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 font-semibold'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedRole === 'reviewer' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight">Reviewer</span>
          </button>

        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Official Username / Officer ID</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="Enter Officer ID"
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Authorization Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="Enter Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#0070f3] hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating Officer...' : 'SIGN IN TO OFFICIAL PORTAL'}</span>
          </button>

        </form>

        {/* Footer Security Badge & Subtext */}
        <div className="pt-2 text-center border-t border-slate-200/80 space-y-0.5">
          <p className="text-xs font-bold text-blue-900 flex items-center justify-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-600 inline-block" />
            <span>Secure Digital Test Reporting Infrastructure</span>
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">
            Based on OIML Recommendation R-76
          </p>
        </div>

      </div>

    </div>
  );
};
