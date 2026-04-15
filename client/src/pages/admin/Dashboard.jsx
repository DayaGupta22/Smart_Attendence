import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LayoutDashboard, Users, Calendar, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/report').then(({ data }) => {
      setStats({ totalRecords: data.data.total });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: 'Total Attendance Records', value: loading ? '—' : stats.totalRecords, color: 'primary' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`card bg-${color}-50 border-0`}>
            <Icon className={`w-5 h-5 text-${color}-600 mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/timetable" className="card hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Timetables</p>
            <p className="text-sm text-gray-400">Create and edit class schedules</p>
          </div>
        </Link>
        <Link to="/admin/reports" className="card hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Attendance Reports</p>
            <p className="text-sm text-gray-400">Institution-wide analytics</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
