import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TeacherReportPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', subject: '' });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.subject) params.set('subject', filters.subject);
      const { data } = await api.get(`/attendance/report?${params}`);
      setRecords(data.data.records || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  // Aggregate by date for chart
  const chartData = Object.entries(
    records.reduce((acc, r) => {
      if (!acc[r.date]) acc[r.date] = { date: r.date, present: 0, absent: 0 };
      r.isPresent ? acc[r.date].present++ : acc[r.date].absent++;
      return acc;
    }, {})
  ).map(([, v]) => v).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">From</label>
            <input type="date" className="input" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To</label>
            <input type="date" className="input" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Subject</label>
            <input className="input" placeholder="e.g. Data Structures" value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })} />
          </div>
          <div className="flex items-end">
            <button onClick={fetchReport} disabled={loading} className="btn-primary w-full">
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4,4,0,0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
                : records.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No records found</td></tr>
                : records.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.studentId?.name}</p>
                      <p className="text-xs text-gray-400">{r.studentId?.rollNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.date}</td>
                    <td className="px-4 py-3 text-gray-600">{r.subject}</td>
                    <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs capitalize">{r.method}</span></td>
                    <td className="px-4 py-3">
                      {r.isPresent ? <span className="badge-present">Present</span> : <span className="badge-absent">Absent</span>}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
