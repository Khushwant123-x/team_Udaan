import React, { useEffect, useState } from 'react';
import { instrumentApi, manufacturerApi } from '../services/api';
import { Instrument, Manufacturer, AccuracyClass } from '../types';
import { Scale, Plus, Search, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const InstrumentsPage: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [manufacturerId, setManufacturerId] = useState<number>(0);
  const [modelName, setModelName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>('CLASS_III');
  const [maxCapacity, setMaxCapacity] = useState<number>(15.0);
  const [minCapacity, setMinCapacity] = useState<number>(0.1);
  const [verificationIntervalE, setVerificationIntervalE] = useState<number>(0.005);
  const [actualIntervalD, setActualIntervalD] = useState<number>(0.005);
  const [unit, setUnit] = useState('kg');

  const loadData = async () => {
    try {
      const [insts, mfgs] = await Promise.all([instrumentApi.list(), manufacturerApi.list()]);
      setInstruments(insts);
      setManufacturers(mfgs);
      if (mfgs.length > 0) setManufacturerId(mfgs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await instrumentApi.create({
        manufacturer_id: manufacturerId,
        model_name: modelName,
        serial_number: serialNumber,
        accuracy_class: accuracyClass,
        max_capacity: maxCapacity,
        min_capacity: minCapacity,
        verification_scale_interval: verificationIntervalE,
        actual_scale_interval: actualIntervalD,
        unit: unit,
      });
      setShowModal(false);
      setModelName(''); setSerialNumber('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register instrument model');
    }
  };

  const filtered = instruments.filter(inst =>
    inst.model_name.toLowerCase().includes(search.toLowerCase()) ||
    inst.serial_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-blue-700" />
            <span>Weighing Instrument Model Registry</span>
          </h1>
          <p className="text-xs text-slate-500">Registered NAWI Models & Specifications as per OIML R 76 Technical Requirements</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register Instrument Model</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by model name or serial number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Model & Serial No</th>
              <th className="py-3.5 px-4">Manufacturer</th>
              <th className="py-3.5 px-4">Accuracy Class</th>
              <th className="py-3.5 px-4">Max / Min Capacity</th>
              <th className="py-3.5 px-4">Intervals (e / d)</th>
              <th className="py-3.5 px-4 text-right">Reg Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((inst) => (
              <tr key={inst.id} className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900">{inst.model_name}</p>
                  <p className="text-[11px] font-mono text-slate-500">SN: {inst.serial_number}</p>
                </td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  {inst.manufacturer?.name || 'N/A'}
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">
                    {inst.accuracy_class}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono">
                  <p className="text-slate-800">Max: {inst.max_capacity} {inst.unit}</p>
                  <p className="text-[11px] text-slate-500">Min: {inst.min_capacity} {inst.unit}</p>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-700">
                  <p>e = {inst.verification_scale_interval} {inst.unit}</p>
                  <p className="text-[11px] text-slate-500">d = {inst.actual_scale_interval} {inst.unit}</p>
                </td>
                <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                  {inst.created_at.split('T')[0]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Register Weighing Instrument Model</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                <select
                  value={manufacturerId}
                  onChange={e => setManufacturerId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                >
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Name</label>
                  <input required value={modelName} onChange={e => setModelName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" placeholder="e.g. Platform Scale PS-50" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input required value={serialNumber} onChange={e => setSerialNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" placeholder="SN-2026-001" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accuracy Class (OIML R76)</label>
                  <select value={accuracyClass} onChange={e => setAccuracyClass(e.target.value as AccuracyClass)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-blue-900">
                    <option value="CLASS_I">Class I (Special)</option>
                    <option value="CLASS_II">Class II (High)</option>
                    <option value="CLASS_III">Class III (Medium)</option>
                    <option value="CLASS_IIII">Class IIII (Ordinary)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measurement</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs">
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="mg">Milligrams (mg)</option>
                    <option value="t">Tons (t)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity (Max)</label>
                  <input type="number" step="any" required value={maxCapacity} onChange={e => setMaxCapacity(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Capacity (Min)</label>
                  <input type="number" step="any" required value={minCapacity} onChange={e => setMinCapacity(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Verification Interval (e)</label>
                  <input type="number" step="any" required value={verificationIntervalE} onChange={e => setVerificationIntervalE(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Actual Interval (d)</label>
                  <input type="number" step="any" required value={actualIntervalD} onChange={e => setActualIntervalD(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold">Save Instrument</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
