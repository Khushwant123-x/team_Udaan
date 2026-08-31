import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { AccuracyClass } from '../types';

interface MpeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MpeCalculatorModal: React.FC<MpeCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>('CLASS_III');
  const [scaleIntervalE, setScaleIntervalE] = useState<number>(0.005);
  const [load, setLoad] = useState<number>(5.0);
  const [unit, setUnit] = useState<string>('kg');

  if (!isOpen) return null;

  // Calculate MPE
  const loadInE = scaleIntervalE > 0 ? load / scaleIntervalE : 0;
  
  let mpeFactorInE = 1.5;
  if (accuracyClass === 'CLASS_I') {
    if (loadInE <= 50000) mpeFactorInE = 0.5;
    else if (loadInE <= 200000) mpeFactorInE = 1.0;
    else mpeFactorInE = 1.5;
  } else if (accuracyClass === 'CLASS_II') {
    if (loadInE <= 5000) mpeFactorInE = 0.5;
    else if (loadInE <= 20000) mpeFactorInE = 1.0;
    else mpeFactorInE = 1.5;
  } else if (accuracyClass === 'CLASS_III') {
    if (loadInE <= 500) mpeFactorInE = 0.5;
    else if (loadInE <= 2000) mpeFactorInE = 1.0;
    else mpeFactorInE = 1.5;
  } else if (accuracyClass === 'CLASS_IIII') {
    if (loadInE <= 50) mpeFactorInE = 0.5;
    else if (loadInE <= 200) mpeFactorInE = 1.0;
    else mpeFactorInE = 1.5;
  }

  const absoluteMpe = mpeFactorInE * scaleIntervalE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">OIML R 76 MPE Live Calculator</h3>
              <p className="text-xs text-slate-400">Maximum Permissible Error (Initial Verification)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Accuracy Class</label>
              <select
                value={accuracyClass}
                onChange={(e) => setAccuracyClass(e.target.value as AccuracyClass)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLASS_I">Class I (Special)</option>
                <option value="CLASS_II">Class II (High)</option>
                <option value="CLASS_III">Class III (Medium)</option>
                <option value="CLASS_IIII">Class IIII (Ordinary)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="mg">Milligrams (mg)</option>
                <option value="t">Tons (t)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Interval (e)</label>
              <input
                type="number"
                step="any"
                value={scaleIntervalE}
                onChange={(e) => setScaleIntervalE(parseFloat(e.target.value) || 0)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 0.005"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Applied Load (m)</label>
              <input
                type="number"
                step="any"
                value={load}
                onChange={(e) => setLoad(parseFloat(e.target.value) || 0)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5.0"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl p-4 shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs text-blue-200 border-b border-blue-800/80 pb-2">
              <span>Load in scale intervals (m / e):</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{loadInE.toFixed(1)} e</span>
            </div>

            <div className="flex items-center justify-between text-xs text-blue-200 border-b border-blue-800/80 pb-2">
              <span>OIML R 76 Tier Allowance:</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">±{mpeFactorInE} e</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-slate-400">Maximum Permissible Error (MPE)</p>
                <p className="text-xs text-slate-300">Absolute Tolerance</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-extrabold text-white">±{absoluteMpe.toFixed(5)}</span>
                <span className="text-xs text-blue-300 ml-1 font-semibold">{unit}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
};
