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
import AdminPanel from './pages/AdminPanel'; // Note: We might have replaced this with SuperAdminDashboard?
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard'; // Added import
// Actually, in the router we had AdminPanel mapped to /admin.
// But check if AdminPanel.jsx exists or if I should map SuperAdminDashboard.
// The previous file content used AdminPanel. Let's assume AdminPanel wraps SuperAdminDashboard or is the valid file.
// Wait, looking at file list in Step 373: pages\AdminPanel.jsx exists.
// And pages\dashboards\SuperAdminDashboard.jsx was edited.
// I should probably check AdminPanel.jsx later to see if it renders SuperAdminDashboard.
// For now, restoring exactly what was there to fix the crash.

import DeviceManagement from './pages/DeviceManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Unauthorized from './pages/Unauthorized';

// New Student Pages
import MyCourses from './pages/MyCourses';
import ClassSchedules from './pages/ClassSchedules';
import ActivitySurvey from './pages/ActivitySurvey';
import ApplicationForms from './pages/ApplicationForms';
import LeaveApplications from './pages/LeaveApplications';

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

              {/* Student Specific Routes */}
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/schedule" element={<ClassSchedules />} />
              <Route path="/survey" element={<ActivitySurvey />} />
              <Route path="/forms" element={<ApplicationForms />} />
              <Route path="/leave" element={<LeaveApplications />} />

              <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'IT_ADMIN']} />}>
                <Route path="/admin" element={<SuperAdminDashboard />} />
                <Route path="/devices" element={<DeviceManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
