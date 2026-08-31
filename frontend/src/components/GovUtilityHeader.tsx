import React from 'react';
import { Eye, ShieldCheck } from 'lucide-react';

interface GovUtilityHeaderProps {
  fontSize?: 'sm' | 'base' | 'lg';
  setFontSize?: (size: 'sm' | 'base' | 'lg') => void;
  isHighContrast: boolean;
  setIsHighContrast: (contrast: boolean) => void;
}

export const GovUtilityHeader: React.FC<GovUtilityHeaderProps> = ({
  isHighContrast,
  setIsHighContrast,
}) => {
  return (
    <div className="w-full bg-slate-900 text-slate-200 border-b border-slate-800 text-xs">
      {/* Top Tricolor Ribbon Accent */}
      <div className="gov-tricolor-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
        
        {/* Left: Official Government Identifier */}
        <div className="flex items-center space-x-3 overflow-hidden text-[11px]">
          <div className="flex items-center space-x-1.5 font-bold text-amber-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>भारत सरकार | GOVT OF INDIA</span>
          </div>
        </div>

        {/* Right: High Contrast Accessibility Control */}
        <div className="flex items-center space-x-4 ml-auto text-[11px]">
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`flex items-center space-x-1 px-2.5 py-0.5 rounded border text-[11px] font-medium transition ${
              isHighContrast
                ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle High Contrast Mode for Screen Accessibility"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHighContrast ? 'Standard Mode' : 'High Contrast'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
