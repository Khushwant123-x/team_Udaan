import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { DashboardStats } from '../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { FileCheck, FileX, Clock, Scale, Factory, Award, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#047857', '#BE123C', '#D97706', '#1E3A8A'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const metrics = stats?.metrics;
  const pieData = [
    { name: 'Approved', value: metrics?.approved_sessions || 0 },
    { name: 'Rejected', value: metrics?.rejected_sessions || 0 },
    { name: 'Under Review', value: metrics?.under_review || 0 },
    { name: 'In Progress', value: metrics?.in_progress || 0 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Executive Ministry Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="gov-tricolor-bar absolute top-0 left-0 right-0" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>National Metrology Intelligence & Type Approval Analytics</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-100">
              Department Evaluation Overview
            </h1>
            <p className="text-xs text-blue-200 mt-1">
              National Physical Laboratory / Legal Metrology Central Repository — OIML R 76 Compliance Engine
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/40 px-5 py-3 rounded-xl text-right">
            <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">
              National Verification Compliance Rate
            </span>
            <span className="text-3xl font-black text-amber-400 font-mono">{metrics?.approval_rate}%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Evaluated Sessions</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">{metrics?.total_sessions}</p>
          </div>
          <div className="bg-blue-900 text-white p-3 rounded-xl shadow-inner">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved Certificates</p>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{metrics?.approved_sessions}</p>
          </div>
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-black text-amber-700 font-mono mt-1">{metrics?.under_review}</p>
          </div>
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-200">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Rejected Models</p>
            <p className="text-2xl font-black text-rose-700 font-mono mt-1">{metrics?.rejected_sessions}</p>
          </div>
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-200">
            <FileX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Session Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <TrendingUp className="w-4 h-4 text-blue-800" />
            <span>Test Session Status Breakdown</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Class Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Scale className="w-4 h-4 text-blue-800" />
            <span>Instruments Evaluated by Accuracy Class</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.class_breakdown || []}>
                <XAxis dataKey="accuracy_class" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0A2540" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Gazette Style Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            Recent Government Test Evaluations
          </h3>
          <Link to="/sessions" className="text-xs font-bold text-amber-300 hover:text-white transition">
            View Complete Registry →
          </Link>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              <th className="py-3 px-4">Session Code</th>
              <th className="py-3 px-4">Instrument Model</th>
              <th className="py-3 px-4">Evaluation Date</th>
              <th className="py-3 px-4">Verification Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {stats?.recent_sessions.map((sess) => (
              <tr key={sess.id} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-mono font-bold text-blue-900">{sess.session_code}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{sess.model_name}</td>
                <td className="py-3 px-4 text-slate-600">{sess.test_date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    sess.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    sess.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {sess.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link to={`/test-wizard/${sess.id}`} className="text-xs font-bold text-blue-800 hover:underline">
                    Inspect Report →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
