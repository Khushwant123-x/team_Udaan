import React, { useEffect, useState } from 'react';
import { sessionApi, instrumentApi } from '../services/api';
import { TestSession, Instrument, SessionStatus, User } from '../types';
import { FileSpreadsheet, Plus, Filter, FileText, Download, Play, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SessionsPageProps {
  user?: User;
}

export const SessionsPage: React.FC<SessionsPageProps> = ({ user }) => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Session Form
  const [instrumentId, setInstrumentId] = useState<number>(0);
  const [temperatureC, setTemperatureC] = useState<number>(20.0);
  const [humidityPercent, setHumidityPercent] = useState<number>(50.0);
  const [pressureHpa, setPressureHpa] = useState<number>(1013.25);
  const [remarks, setRemarks] = useState<string>('');

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [sessList, instList] = await Promise.all([
        sessionApi.list(statusFilter || undefined),
        instrumentApi.list()
      ]);
      setSessions(sessList);
      setInstruments(instList);
      if (instList.length > 0) setInstrumentId(instList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSess = await sessionApi.create({
        instrument_id: instrumentId,
        temperature_c: temperatureC,
        humidity_percent: humidityPercent,
        pressure_hpa: pressureHpa,
        remarks: remarks
      });
      setShowModal(false);
      navigate(`/test-wizard/${newSess.id}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create test session');
    }
  };

  const handleApprove = async (sessionId: number) => {
    try {
      await sessionApi.update(sessionId, { status: 'APPROVED' });
      alert('Test session APPROVED successfully!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve session');
    }
  };

  const handleReject = async (sessionId: number) => {
    try {
      await sessionApi.update(sessionId, { status: 'REJECTED' });
      alert('Test session REJECTED.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject session');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <span>Test Sessions & Evaluation Reports</span>
          </h1>
          <p className="text-xs text-slate-500">Record observations, trigger OIML R76 compliance evaluation & generate certificates</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Test Session</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center space-x-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Session Code</th>
              <th className="py-3.5 px-4">Instrument Model</th>
              <th className="py-3.5 px-4">Testing Officer</th>
              <th className="py-3.5 px-4">Environmental Conditions</th>
              <th className="py-3.5 px-4">Status & Compliance</th>
              <th className="py-3.5 px-4 text-right">Actions / Export</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sessions.map((sess) => (
              <tr key={sess.id} className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4">
                  <p className="font-mono font-bold text-blue-900">{sess.session_code}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{sess.test_date.split('T')[0]}</p>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-800">{sess.instrument?.model_name || 'N/A'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SN: {sess.instrument?.serial_number} ({sess.instrument?.accuracy_class})
                  </p>
                </td>

                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  {sess.technician?.full_name || 'Official Technician'}
                </td>

                <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                  <p>{sess.temperature_c} °C | {sess.humidity_percent} % RH</p>
                  <p className="text-slate-400">{sess.pressure_hpa} hPa</p>
                </td>

                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    sess.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    sess.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {sess.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {sess.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                    {sess.status !== 'APPROVED' && sess.status !== 'REJECTED' && <Clock className="w-3 h-3 text-amber-600" />}
                    <span>{sess.status}</span>
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right space-x-2">
                  {(user?.role === 'ADMIN' || user?.role === 'REVIEWER') && sess.status !== 'APPROVED' && (
                    <>
                      <button
                        onClick={() => handleApprove(sess.id)}
                        className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                        title="Approve Report"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(sess.id)}
                        className="inline-flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                        title="Reject Report"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  <Link
                    to={`/test-wizard/${sess.id}`}
                    className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Enter Data / Wizard</span>
                  </Link>

                  <button
                    onClick={() => sessionApi.downloadPdf(sess.id)}
                    className="inline-flex items-center space-x-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                    title="Download Official PDF Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => sessionApi.downloadDocx(sess.id)}
                    className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                    title="Download Editable Word DOCX Report"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>DOCX</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Session Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Create New OIML R76 Test Session</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Instrument Model</label>
                <select
                  value={instrumentId}
                  onChange={e => setInstrumentId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                >
                  {instruments.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.model_name} (SN: {inst.serial_number}) — {inst.accuracy_class}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temp (°C)</label>
                  <input type="number" step="0.1" value={temperatureC} onChange={e => setTemperatureC(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Humidity (%)</label>
                  <input type="number" step="0.1" value={humidityPercent} onChange={e => setHumidityPercent(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pressure (hPa)</label>
                  <input type="number" step="0.1" value={pressureHpa} onChange={e => setPressureHpa(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Laboratory Remarks</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs" rows={2} placeholder="Optional notes before test execution..." />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold">Start Session & Launch Wizard</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
