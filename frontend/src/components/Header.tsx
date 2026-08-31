import React from 'react';
import { User } from '../types';
import { LogOut, Calculator, Shield } from 'lucide-react';
import { AshokaEmblem } from './AshokaEmblem';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenMpeCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenMpeCalculator }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 py-2 flex items-center justify-between">
        
        {/* Left Branding with Ashoka Emblem & Ministry Titles */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-slate-950 p-1.5 rounded-xl border border-amber-500/40 shadow-inner flex items-center justify-center">
            <AshokaEmblem className="text-amber-400 w-9 h-9 shrink-0" size={36} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">
                भारत सरकार | GOVT OF INDIA
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-300 font-medium">
                उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-100 leading-tight flex items-center gap-2">
              <span>National Legal Metrology Portal</span>
              <span className="hidden md:inline-block text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 uppercase font-semibold">
                OIML R 76-1:2006
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls & User Badge */}
        <div className="flex items-center space-x-3.5">
          
          <button
            onClick={onOpenMpeCalculator}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-md border border-blue-500/50"
            title="Open Interactive MPE Calculator"
          >
            <Calculator className="w-4 h-4 text-blue-200" />
            <span className="hidden sm:inline">Live MPE Calculator</span>
            <span className="sm:hidden">MPE</span>
          </button>

          {user && (
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-100 flex items-center justify-end gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.full_name}</span>
                </p>
                <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-amber-300 font-mono font-semibold uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {user.role} ({user.lab_code})
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out of Portal"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition border border-transparent hover:border-slate-700"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
