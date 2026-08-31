import React from 'react';
import { Cpu, Sparkles, ShieldCheck } from 'lucide-react';

interface PrototypeLogoProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PrototypeLogo: React.FC<PrototypeLogoProps> = ({ variant = 'compact', className = '' }) => {
  if (variant === 'full') {
    return (
      <div className={`flex items-center space-x-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-2 px-3 rounded-xl border border-amber-500/40 shadow-lg ${className}`}>
        <div className="relative flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 p-2 rounded-lg shadow-md font-bold shrink-0">
          <Cpu className="w-5 h-5 text-slate-950 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-mono font-black text-amber-400 tracking-wider uppercase">
              SIH-26035 PROTOTYPE
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/40">
              v1.0 LIVE
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-100 leading-tight">
            NAWI Type Evaluation System
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 bg-slate-950/90 text-slate-100 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-md ${className}`}>
      <div className="relative flex items-center justify-center bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-sm font-black shrink-0">
        <Sparkles className="w-4 h-4 text-slate-950" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="text-left font-mono">
        <div className="flex items-center space-x-1">
          <span className="text-[11px] font-extrabold text-amber-400 tracking-wider">
            PROTOTYPE
          </span>
          <span className="text-[9px] bg-blue-900 text-blue-300 px-1 py-0.2 rounded font-bold">
            SIH 26035
          </span>
        </div>
        <span className="text-[9px] text-slate-400 block font-medium">OIML R 76 Evaluation Engine</span>
      </div>
    </div>
  );
};
