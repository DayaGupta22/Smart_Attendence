import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, ScanLine, ClipboardList,
  Lightbulb, ListTodo, Target, User, LogOut,
  Users, BarChart3, Settings,
} from 'lucide-react';

const studentNav = [
  { to: '/student/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/timetable',         icon: Calendar,        label: 'Timetable' },
  { to: '/student/attendance/scan',   icon: ScanLine,        label: 'Mark Attendance' },
  { to: '/student/attendance/history',icon: ClipboardList,   label: 'My Attendance' },
  { to: '/student/suggestions',       icon: Lightbulb,       label: 'Suggestions' },
  { to: '/student/routine',           icon: ListTodo,        label: 'Daily Routine' },
  { to: '/student/goals',             icon: Target,          label: 'Goals' },
  { to: '/student/profile',           icon: User,            label: 'Profile' },
];

const teacherNav = [
  { to: '/teacher/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/attendance/live',   icon: Users,           label: 'Live Attendance' },
  { to: '/teacher/reports',           icon: BarChart3,       label: 'Reports' },
];

const adminNav = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/timetable',  icon: Settings,        label: 'Timetables' },
  { to: '/admin/reports',    icon: BarChart3,       label: 'Reports' },
];

const navByRole = { student: studentNav, teacher: teacherNav, admin: adminNav };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = navByRole[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">SmartAttend</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role} Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full px-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
