import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi } from '../services/api';
import { TestSession, User } from '../types';
import { Scale, CheckCircle2, XCircle, Download, FileText, ArrowLeft, Plus, Trash2, Save, Award, ShieldAlert } from 'lucide-react';

interface TestWizardPageProps {
  user?: User;
}

export const TestWizardPage: React.FC<TestWizardPageProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SPAN' | 'ECCENTRICITY' | 'REPEATABILITY' | 'DISCRIMINATION' | 'TEMPERATURE' | 'SAFETY'>('SPAN');

  // Weighing Span Form State
  const [spanPoints, setSpanPoints] = useState<Array<{ load: number; indication: number }>>([
    { load: 0, indication: 0 },
    { load: 2.5, indication: 2.500 },
    { load: 5.0, indication: 5.002 },
    { load: 10.0, indication: 10.003 },
    { load: 15.0, indication: 15.005 },
  ]);

  // Eccentricity Form State
  const [eccentricLoad, setEccentricLoad] = useState<number>(5.0);
  const [eccPositions, setEccPositions] = useState([
    { position: '1 - Center', indication: 5.000 },
    { position: '2 - Front Left', indication: 5.002 },
    { position: '3 - Front Right', indication: 5.001 },
    { position: '4 - Back Left', indication: 4.999 },
    { position: '5 - Back Right', indication: 5.000 },
  ]);

  // Repeatability Form State
  const [repeatabilityLoad, setRepeatabilityLoad] = useState<number>(5.0);
  const [repeatabilityReadings, setRepeatabilityReadings] = useState<number[]>([5.000, 5.002, 5.001]);

  // Discrimination Form State
  const [discBaseLoad, setDiscBaseLoad] = useState<number>(5.0);
  const [discIndicationBefore, setDiscIndicationBefore] = useState<number>(5.000);
  const [discAddedLoad, setDiscAddedLoad] = useState<number>(0.007);
  const [discIndicationAfter, setDiscIndicationAfter] = useState<number>(5.005);

  // Safety Form State
  const [overloadLoad, setOverloadLoad] = useState<number>(15.045);
  const [blankedOnOverload, setBlankedOnOverload] = useState<boolean>(true);

  const loadSession = () => {
    if (!id) return;
    sessionApi.get(Number(id))
      .then(setSession)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  if (loading || !session) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading test session wizard...</div>;
  }

  const e = session.instrument?.verification_scale_interval || 0.005;
  const unit = session.instrument?.unit || 'kg';
  const accClass = session.instrument?.accuracy_class || 'CLASS_III';

  const handleApprove = async () => {
    try {
      const updated = await sessionApi.update(session.id, { status: 'APPROVED' });
      setSession(updated);
      alert('Report APPROVED successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve session');
    }
  };

  const handleReject = async () => {
    try {
      const updated = await sessionApi.update(session.id, { status: 'REJECTED' });
      setSession(updated);
      alert('Report REJECTED.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject session');
    }
  };

  // Save Span Observations
  const handleSaveSpan = async () => {
    try {
      await sessionApi.recordObservation(session.id, 'SPAN', { points: spanPoints });
      alert('Span test observations recorded successfully!');
      loadSession();
    } catch (err: any) {
      alert('Failed to save span observations');
    }
  };

  // Save Eccentricity Observations
  const handleSaveEccentricity = async () => {
    try {
      await sessionApi.recordObservation(session.id, 'ECCENTRICITY', {
        test_load: eccentricLoad,
        positions: eccPositions
      });
      alert('Eccentricity test observations recorded successfully!');
      loadSession();
    } catch (err: any) {
      alert('Failed to save eccentricity observations');
    }
  };

  // Save Repeatability Observations
  const handleSaveRepeatability = async () => {
    try {
      await sessionApi.recordObservation(session.id, 'REPEATABILITY', {
        load: repeatabilityLoad,
        readings: repeatabilityReadings
      });
      alert('Repeatability test observations recorded successfully!');
      loadSession();
    } catch (err: any) {
      alert('Failed to save repeatability observations');
    }
  };

  // Save Discrimination
  const handleSaveDiscrimination = async () => {
    try {
      await sessionApi.recordObservation(session.id, 'DISCRIMINATION', {
        base_load: discBaseLoad,
        indication_before: discIndicationBefore,
        added_load: discAddedLoad,
        indication_after: discIndicationAfter
      });
      alert('Discrimination test observations recorded successfully!');
      loadSession();
    } catch (err: any) {
      alert('Failed to save discrimination observations');
    }
  };

  // Save Safety & Overload
  const handleSaveSafety = async () => {
    try {
      await sessionApi.recordObservation(session.id, 'SAFETY', {
        overload_load: overloadLoad,
        blanked_on_overload: blankedOnOverload
      });
      alert('Safety & Overload test recorded successfully!');
      loadSession();
    } catch (err: any) {
      alert('Failed to save safety test observations');
    }
  };

  // Trigger Overall Evaluation
  const handleFinalizeEvaluation = async () => {
    try {
      const updated = await sessionApi.evaluateSession(session.id);
      setSession(updated);
      alert(`OIML R 76 Evaluation Completed! Final Status: ${updated.overall_pass ? 'APPROVED' : 'REJECTED'}`);
    } catch (err: any) {
      alert('Failed to run final evaluation');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Session Specs */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/sessions')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold bg-blue-900 text-blue-300 px-2.5 py-0.5 rounded border border-blue-800">
                {session.session_code}
              </span>
              <h1 className="text-xl font-bold text-white mt-1">
                OIML R 76 Type Approval Test Observation Form
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {(user?.role === 'ADMIN' || user?.role === 'REVIEWER') && session.status !== 'APPROVED' && (
              <>
                <button
                  onClick={handleApprove}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Report</span>
                </button>
                <button
                  onClick={handleReject}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Report</span>
                </button>
              </>
            )}

            <button
              onClick={handleFinalizeEvaluation}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>Run Final Compliance Check</span>
            </button>

            <button onClick={() => sessionApi.downloadPdf(session.id)} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>

            <button onClick={() => sessionApi.downloadDocx(session.id)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>DOCX</span>
            </button>
          </div>
        </div>

        {/* Instrument Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">Instrument Model</span>
            <span className="font-bold text-blue-300">{session.instrument?.model_name}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">Accuracy Class</span>
            <span className="font-bold text-amber-400">{accClass}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">Max Capacity (Max)</span>
            <span className="text-slate-200">{session.instrument?.max_capacity} {unit}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">Scale Interval (e)</span>
            <span className="text-slate-200">{e} {unit}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase">Overall Status</span>
            <span className={`font-bold ${session.overall_pass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {session.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'SPAN', label: '1. Weighing Span & Linearity' },
          { key: 'ECCENTRICITY', label: '2. Eccentric Load Test' },
          { key: 'REPEATABILITY', label: '3. Repeatability Test' },
          { key: 'DISCRIMINATION', label: '4. Discrimination Test' },
          { key: 'SAFETY', label: '5. Safety & Overload Check' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-blue-700 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WEIGHING SPAN & LINEARITY */}
      {activeTab === 'SPAN' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Weighing Span & Error of Indication Test</h3>
              <p className="text-xs text-slate-500">Record load vs indication values across working range (Min to Max)</p>
            </div>
            <button
              onClick={() => setSpanPoints([...spanPoints, { load: 0, indication: 0 }])}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Load Point</span>
            </button>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Applied Load ({unit})</th>
                <th className="py-3 px-4">Indication ({unit})</th>
                <th className="py-3 px-4">Indication Error E</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {spanPoints.map((pt, idx) => {
                const err = pt.indication - pt.load;
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        step="any"
                        value={pt.load}
                        onChange={(e) => {
                          const updated = [...spanPoints];
                          updated[idx].load = parseFloat(e.target.value) || 0;
                          setSpanPoints(updated);
                        }}
                        className="bg-slate-50 border border-slate-300 rounded p-1.5 w-32"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        step="any"
                        value={pt.indication}
                        onChange={(e) => {
                          const updated = [...spanPoints];
                          updated[idx].indication = parseFloat(e.target.value) || 0;
                          setSpanPoints(updated);
                        }}
                        className="bg-slate-50 border border-slate-300 rounded p-1.5 w-32"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-bold">
                      {err >= 0 ? `+${err.toFixed(4)}` : err.toFixed(4)} {unit}
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => setSpanPoints(spanPoints.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveSpan}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Span Observations</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ECCENTRICITY TEST */}
      {activeTab === 'ECCENTRICITY' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Eccentric Load Test (Off-Center Load Evaluation)</h3>
              <p className="text-xs text-slate-500">Record indication at 5 off-center positions (approx 1/3 or 1/4 Max)</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Test Load ({unit}):</span>
              <input
                type="number"
                step="any"
                value={eccentricLoad}
                onChange={(e) => setEccentricLoad(parseFloat(e.target.value) || 0)}
                className="bg-slate-50 border border-slate-300 rounded p-1.5 w-28 text-xs font-mono"
              />
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Indication ({unit})</th>
                <th className="py-3 px-4">Error E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {eccPositions.map((pos, idx) => {
                const err = pos.indication - eccentricLoad;
                return (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{pos.position}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        step="any"
                        value={pos.indication}
                        onChange={(e) => {
                          const updated = [...eccPositions];
                          updated[idx].indication = parseFloat(e.target.value) || 0;
                          setEccPositions(updated);
                        }}
                        className="bg-slate-50 border border-slate-300 rounded p-1.5 w-36"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {err >= 0 ? `+${err.toFixed(4)}` : err.toFixed(4)} {unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveEccentricity}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Eccentricity Observations</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: REPEATABILITY TEST */}
      {activeTab === 'REPEATABILITY' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Repeatability Test</h3>
              <p className="text-xs text-slate-500">Minimum 3 readings at identical load. Max difference must not exceed MPE.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Test Load ({unit}):</span>
              <input
                type="number"
                step="any"
                value={repeatabilityLoad}
                onChange={(e) => setRepeatabilityLoad(parseFloat(e.target.value) || 0)}
                className="bg-slate-50 border border-slate-300 rounded p-1.5 w-28 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            {repeatabilityReadings.map((val, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <span className="text-xs font-semibold text-slate-700 w-24">Reading #{idx + 1}:</span>
                <input
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => {
                    const updated = [...repeatabilityReadings];
                    updated[idx] = parseFloat(e.target.value) || 0;
                    setRepeatabilityReadings(updated);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono w-40"
                />
              </div>
            ))}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl font-mono text-xs text-slate-700 flex justify-between border border-slate-200">
            <span>Max Reading Difference:</span>
            <span className="font-bold text-blue-900">
              {(Math.max(...repeatabilityReadings) - Math.min(...repeatabilityReadings)).toFixed(4)} {unit}
            </span>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveRepeatability}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Repeatability Readings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: DISCRIMINATION TEST */}
      {activeTab === 'DISCRIMINATION' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Discrimination Test</h3>
            <p className="text-xs text-slate-500">Placing 1.4e extra load must cause unambiguous change of indication (+1e)</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Equilibrium Load ({unit})</label>
              <input type="number" step="any" value={discBaseLoad} onChange={e => setDiscBaseLoad(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Indication Before ({unit})</label>
              <input type="number" step="any" value={discIndicationBefore} onChange={e => setDiscIndicationBefore(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Added Small Weight (1.4e) ({unit})</label>
              <input type="number" step="any" value={discAddedLoad} onChange={e => setDiscAddedLoad(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Indication After ({unit})</label>
              <input type="number" step="any" value={discIndicationAfter} onChange={e => setDiscIndicationAfter(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono" />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveDiscrimination}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Discrimination Test</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY & OVERLOAD CHECK */}
      {activeTab === 'SAFETY' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Safety & Overload Protection Verification</h3>
            <p className="text-xs text-slate-500">Instrument display must cut off / blank out at Max + 9e load</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Overload Test Load Applied ({unit})</label>
              <input type="number" step="any" value={overloadLoad} onChange={e => setOverloadLoad(Number(e.target.value))} className="w-64 bg-slate-50 border border-slate-300 rounded p-2 font-mono" />
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="blanked"
                checked={blankedOnOverload}
                onChange={e => setBlankedOnOverload(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="blanked" className="font-semibold text-slate-800 cursor-pointer">
                Instrument display blanked out / displayed overload error code successfully at &gt; Max + 9e
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveSafety}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Safety Test</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
