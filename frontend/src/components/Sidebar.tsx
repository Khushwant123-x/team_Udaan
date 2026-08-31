import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Factory, Scale, FileSpreadsheet, ShieldAlert, Award } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Manufacturers Registry', path: '/manufacturers', icon: Factory },
    { label: 'Instrument Models', path: '/instruments', icon: Scale },
    { label: 'Test Evaluations', path: '/sessions', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-6rem)] flex flex-col justify-between p-4 shadow-sm shrink-0">
      <div className="space-y-6">
        
        {/* Navigation Category */}
        <div>
          <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
            Ministry Portal Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-sm border-l-4 border-amber-500 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Legal Metrology Official Reference Card */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-slate-200 p-4 rounded-xl text-xs space-y-2.5 border border-slate-800 shadow-md">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-[11px]">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>OIML R 76-1 Standard</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Automated Maximum Permissible Error (MPE) calculation & evaluation for Accuracy Classes <strong>I, II, III & IIII</strong>.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Legal Metrology Rules</span>
            <span className="text-emerald-400 font-bold">VERIFIED</span>
          </div>
        </div>

      </div>

      {/* Access Authorization Badge */}
      {user && (
        <div className="border-t border-slate-200 pt-3.5 text-[11px] text-slate-600">
          <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <ShieldAlert className="w-4 h-4 text-blue-800 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Authorized Scope</span>
              <span className="font-bold text-slate-800 truncate block">{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
