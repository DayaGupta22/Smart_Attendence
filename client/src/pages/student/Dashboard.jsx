import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ScanLine, Lightbulb, Target, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedRes, attRes, routineRes] = await Promise.allSettled([
          api.get('/timetable/today'),
          api.get('/attendance/student/me'),
          api.get('/routine/today'),
        ]);
        if (schedRes.status === 'fulfilled') setSchedule(schedRes.value.data.data.schedule || []);
        if (attRes.status === 'fulfilled') setAttendanceStats(attRes.value.data.data.subjectStats || []);
        if (routineRes.status === 'fulfilled') setRoutine(routineRes.value.data.data.routine);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overallAttendance = attendanceStats.length
    ? Math.round(attendanceStats.reduce((s, a) => s + a.percentage, 0) / attendanceStats.length)
    : null;

  const completedItems = routine?.schedule.filter((s) => s.status === 'completed').length || 0;
  const totalItems = routine?.schedule.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-primary-600" />}
          label="Attendance"
          value={overallAttendance !== null ? `${overallAttendance}%` : '—'}
          sub="Overall"
          color="primary"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-success-500" />}
          label="Today's Classes"
          value={schedule.filter((p) => !p.isFree).length}
          sub={`${schedule.filter((p) => p.isFree).length} free periods`}
          color="success"
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-warning-500" />}
          label="Routine"
          value={`${completedItems}/${totalItems}`}
          sub="tasks done"
          color="warning"
        />
        <StatCard
          icon={<Lightbulb className="w-5 h-5 text-purple-500" />}
          label="Free Periods"
          value={schedule.filter((p) => p.isFree).length}
          sub="with suggestions"
          color="purple"
        />
      </div>

      {/* Today's schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600" />
            Today's Schedule
          </h2>
          <Link to="/student/timetable" className="text-xs text-primary-600 hover:underline">View full</Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : schedule.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No classes scheduled today</p>
        ) : (
          <div className="space-y-2">
            {schedule.map((period, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${period.isFree ? 'bg-amber-50' : 'bg-gray-50'}`}>
                <span className="text-xs font-mono text-gray-500 w-24 flex-shrink-0">{period.startTime} – {period.endTime}</span>
                <span className={`text-sm font-medium ${period.isFree ? 'text-amber-700' : 'text-gray-800'}`}>
                  {period.isFree ? 'Free Period' : period.subject}
                </span>
                {period.isFree && (
                  <Link to="/student/suggestions" className="ml-auto text-xs text-amber-600 hover:underline">
                    Get suggestions
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/student/attendance/scan', icon: ScanLine, label: 'Scan QR', color: 'bg-primary-50 text-primary-700' },
            { to: '/student/suggestions',    icon: Lightbulb, label: 'Suggestions', color: 'bg-amber-50 text-amber-700' },
            { to: '/student/routine',         icon: Clock,     label: 'Routine', color: 'bg-green-50 text-green-700' },
            { to: '/student/goals',           icon: Target,    label: 'Goals', color: 'bg-purple-50 text-purple-700' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className={`card flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow ${color}`}>
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Attendance per subject */}
      {attendanceStats.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Attendance by Subject</h2>
          <div className="space-y-3">
            {attendanceStats.map((stat) => (
              <div key={stat.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{stat.subject}</span>
                  <span className={`font-medium ${stat.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                    {stat.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stat.percentage < 75 ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                {stat.percentage < 75 && (
                  <p className="text-xs text-red-500 mt-0.5">Below 75% threshold</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  const bg = { primary: 'bg-primary-50', success: 'bg-green-50', warning: 'bg-amber-50', purple: 'bg-purple-50' };
  return (
    <div className={`card ${bg[color]} border-0`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
