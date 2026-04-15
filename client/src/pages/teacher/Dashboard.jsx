import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, BarChart3, QrCode } from 'lucide-react';
import { format } from 'date-fns';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    api.get(`/attendance/report?from=${today}&to=${today}`)
      .then(({ data }) => setReport(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name} · {format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-primary-50 border-0">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="text-xs text-gray-500">Today's Records</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '—' : report?.total || 0}</p>
          <p className="text-xs text-gray-400">attendance entries</p>
        </div>

        <Link to="/teacher/attendance/live" className="card bg-green-50 border-0 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="w-5 h-5 text-green-600" />
            <span className="text-xs text-gray-500">Quick Action</span>
          </div>
          <p className="text-lg font-bold text-gray-900">Start Live Attendance</p>
          <p className="text-xs text-gray-400">Generate QR for your class</p>
        </Link>

        <Link to="/teacher/reports" className="card bg-purple-50 border-0 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-gray-500">Analytics</span>
          </div>
          <p className="text-lg font-bold text-gray-900">View Reports</p>
          <p className="text-xs text-gray-400">Full attendance analytics</p>
        </Link>
      </div>
    </div>
  );
}
