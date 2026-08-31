import React, { useEffect, useState } from 'react';
import { manufacturerApi } from '../services/api';
import { Manufacturer } from '../types';
import { Factory, Plus, Search, MapPin, Mail, Phone, ShieldCheck, X } from 'lucide-react';

export const ManufacturersPage: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const loadData = () => {
    manufacturerApi.list()
      .then(setManufacturers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await manufacturerApi.create({
        name,
        code,
        contact_person: contactPerson,
        email,
        phone,
        address,
        license_number: licenseNumber,
        country: 'India'
      });
      setShowModal(false);
      setName(''); setCode(''); setContactPerson(''); setEmail(''); setPhone(''); setAddress(''); setLicenseNumber('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register manufacturer');
    }
  };

  const filtered = manufacturers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Factory className="w-5 h-5 text-blue-700" />
            <span>Manufacturer Registry</span>
          </h1>
          <p className="text-xs text-slate-500">Authorized scale & weighing instrument manufacturers (Legal Metrology Dept)</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Manufacturer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by manufacturer name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* Manufacturer Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading manufacturers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((mfg) => (
            <div key={mfg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {mfg.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{mfg.name}</h3>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{mfg.address || 'Address not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{mfg.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{mfg.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500 font-mono flex justify-between">
                <span>License:</span>
                <span className="font-bold text-slate-700">{mfg.license_number || 'LM/PENDING'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Register Manufacturer</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" placeholder="e.g. Mettler Toledo India" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mfg Code</label>
                  <input required value={code} onChange={e => setCode(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" placeholder="MFG-METTLER" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">License No.</label>
                  <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" placeholder="LM/IND/2026/01" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" placeholder="Full Name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" placeholder="+91-..." />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" rows={2} placeholder="Factory / Registered address" />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold">Save Manufacturer</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
