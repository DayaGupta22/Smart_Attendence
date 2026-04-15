import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';

export default function AttendanceHistoryPage() {
  const [stats, setStats] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    api.get('/attendance/student/me').then(({ data }) => {
      setStats(data.data.subjectStats || []);
      setRecords(data.data.records || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filterSubject ? records.filter((r) => r.subject === filterSubject) : records;
  const subjects = [...new Set(records.map((r) => r.subject))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
      </div>

      {/* Subject-wise stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading
          ? [1,2,3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
          : stats.map((stat) => (
            <div key={stat.subject} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate">{stat.subject}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: stat.percentage < 75 ? '#ef4444' : '#22c55e' }}>
                    {stat.percentage}%
                  </p>
                  <p className="text-xs text-gray-400">{stat.present}/{stat.total} classes</p>
                </div>
                {stat.percentage < 75
                  ? <TrendingDown className="w-5 h-5 text-red-500 mt-1" />
                  : <TrendingUp className="w-5 h-5 text-green-500 mt-1" />}
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stat.percentage < 75 ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          ))
        }
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <select
          className="input max-w-xs"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} records</span>
      </div>

      {/* Records table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Period</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No records found</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{r.date}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.subject}</td>
                    <td className="px-4 py-3 text-gray-500">P{r.periodNumber}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs capitalize">{r.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.isPresent
                        ? <span className="badge-present">Present</span>
                        : <span className="badge-absent">Absent</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
