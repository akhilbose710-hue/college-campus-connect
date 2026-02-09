import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendanceView from './pages/AttendanceView';
import StudentProfile from './pages/StudentProfile';
import StaffProfile from './pages/StaffProfile';
import AdminPanel from './pages/AdminPanel';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';
import PrincipalDashboard from './pages/dashboards/PrincipalDashboard';
import DeviceManagement from './pages/DeviceManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Unauthorized from './pages/Unauthorized';
import MyCourses from './pages/MyCourses';
import ClassSchedules from './pages/ClassSchedules';
import ActivitySurvey from './pages/ActivitySurvey';
import ApplicationForms from './pages/ApplicationForms';
import LeaveApplications from './pages/LeaveApplications';
import MarkAttendance from './pages/MarkAttendance';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance" element={<AttendanceView />} />
              <Route path="/students/:id" element={<StudentProfile />} />
              <Route path="/staff/:id" element={<StaffProfile />} />
              <Route path="/reports" element={<ReportsAnalytics />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/schedule" element={<ClassSchedules />} />
              <Route path="/survey" element={<ActivitySurvey />} />
              <Route path="/forms" element={<ApplicationForms />} />
              <Route path="/leave" element={<LeaveApplications />} />
              <Route element={<RoleRoute allowedRoles={['STAFF', 'LECTURER', 'HOD', 'PRINCIPAL']} />}>
                <Route path="/mark-attendance" element={<MarkAttendance />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'IT_ADMIN']} />}>
                <Route path="/admin" element={<SuperAdminDashboard />} />
                <Route path="/devices" element={<DeviceManagement />} />
              </Route>
              <Route element={<RoleRoute allowedRoles={['PRINCIPAL']} />}>
                <Route path="/principal" element={<PrincipalDashboard />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}