import React from 'react';
import { AshokaEmblem } from './AshokaEmblem';
import { ShieldCheck, ExternalLink, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export const GovFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-12">
      {/* Top Banner Accent */}
      <div className="gov-tricolor-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Ministry Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-3">
              <AshokaEmblem className="text-amber-400 w-9 h-9 shrink-0" size={36} />
              <div>
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">भारत सरकार</p>
                <h4 className="text-sm font-extrabold text-white leading-snug">Legal Metrology Portal</h4>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated Type Evaluation & Test Report Generation System for Non-Automatic Weighing Instruments (NAWI) as per OIML R 76-1:2006.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-amber-300/90 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>STQC & GIGW Compliance Verified</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2.5 text-xs">
            <h5 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5 text-amber-400">
              Government Links
            </h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://consumeraffairs.nic.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>Ministry of Consumer Affairs</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://oiml.org" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>OIML Recommendation R 76</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>Digital India Initiative</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Standards & Guidelines */}
          <div className="space-y-2.5 text-xs">
            <h5 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5 text-amber-400">
              Metrology Standards
            </h5>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Legal Metrology Act, 2009</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Legal Metrology (General) Rules, 2011</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>OIML R 76-1:2006 (Non-Automatic)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Accuracy Classes I, II, III & IIII</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Department Contact */}
          <div className="space-y-2.5 text-xs">
            <h5 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5 text-amber-400">
              Department Contact
            </h5>
            <div className="space-y-2 text-slate-400 text-[11px]">
              <p className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Krishi Bhawan / NPL Campus, New Delhi - 110001</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Toll Free Helpdesk: 1800-11-4000</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>dir-lm@nic.in / nawi-support@gov.in</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & NIC Branding */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} <strong>Legal Metrology Division</strong>, Department of Consumer Affairs, Government of India. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 font-mono">
            <span>Designed & Developed for Govt of India</span>
            <span className="bg-slate-800 border border-slate-700 text-amber-400 px-2 py-0.5 rounded text-[10px]">
              GIGW v2.0 Compliant
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
