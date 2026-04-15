import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Shared layout
import AppLayout from './components/AppLayout';
import LoadingScreen from './components/LoadingScreen';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import TimetablePage from './pages/student/TimetablePage';
import AttendanceScanPage from './pages/student/AttendanceScanPage';
import AttendanceHistoryPage from './pages/student/AttendanceHistoryPage';
import SuggestionsPage from './pages/student/SuggestionsPage';
import RoutinePage from './pages/student/RoutinePage';
import GoalsPage from './pages/student/GoalsPage';
import ProfilePage from './pages/student/ProfilePage';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import LiveAttendancePage from './pages/teacher/LiveAttendancePage';
import TeacherReportPage from './pages/teacher/ReportPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageTimetablePage from './pages/admin/ManageTimetablePage';
import AdminReportPage from './pages/admin/ReportPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Role-aware dashboard redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Role-aware redirect */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="attendance/scan" element={<AttendanceScanPage />} />
        <Route path="attendance/history" element={<AttendanceHistoryPage />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="routine" element={<RoutinePage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Teacher routes */}
      <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="attendance/live" element={<LiveAttendancePage />} />
        <Route path="reports" element={<TeacherReportPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="timetable" element={<ManageTimetablePage />} />
        <Route path="reports" element={<AdminReportPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
