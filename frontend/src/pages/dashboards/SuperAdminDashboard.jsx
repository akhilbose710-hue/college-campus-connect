import { API_BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, GraduationCap, BookOpen, Briefcase, Shield, Calendar } from 'lucide-react';
import OverviewTab from '../../components/dashboard/OverviewTab';
import UsersListTab from '../../components/dashboard/UsersListTab';
import DepartmentsTab from '../../components/dashboard/DepartmentsTab';
import ManageRolesTab from '../../components/dashboard/ManageRolesTab';
import AddStudentTab from '../../components/dashboard/AddStudentTab';
import AddCourseTab from '../../components/dashboard/AddCourseTab';
import TimetableTab from '../../components/dashboard/TimetableTab';
import AddStaffTab from '../../components/dashboard/AddStaffTab';
import PromoteTab from '../../components/dashboard/PromoteTab';

export default function SuperAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState({ totalUsers: 0, activeDevices: 14, attendance: '94.3%' });
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchDepartments();
    fetchStaff();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`);
      const data = await response.json();
      if (data.totalUsers) {
        setStats(prev => ({ ...prev, totalUsers: data.totalUsers }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/departments`);
      const data = await response.json();
      if (data.departments) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/staff`);
      const data = await response.json();
      if (data.staff) {
        setStaffList(data.staff);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'manage-roles', label: 'Manage Roles', icon: Shield },
    { id: 'add-student', label: 'Add Student/Class', icon: GraduationCap },
    { id: 'add-course', label: 'Add Course', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'add-staff', label: 'Add Staff', icon: Briefcase },
    { id: 'promote', label: 'Promote Students', icon: GraduationCap },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
        </h1>
        <p className="text-slate-500 mt-1">
          {activeTab === 'overview' && 'Real-time overview of your campus operations.'}
          {activeTab === 'users' && 'Manage all students and staff members in one place.'}
          {activeTab === 'departments' && 'Organize and manage faculty departments.'}
          {activeTab === 'manage-roles' && 'Assign HOD and Principal roles to staff.'}
          {activeTab === 'add-student' && 'Manage departments, classes and student registration.'}
          {activeTab === 'add-course' && 'Define academic courses and subjects per department.'}
          {activeTab === 'timetable' && 'Construct and manage weekly schedules for classes.'}
          {activeTab === 'add-staff' && 'Onboard new faculty and administrative staff.'}
          {activeTab === 'promote' && 'Perform bulk semester promotion for students.'}
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'users' && <UsersListTab />}
        {activeTab === 'departments' && <DepartmentsTab departments={departments} onUpdate={fetchDepartments} />}
        {activeTab === 'manage-roles' && <ManageRolesTab departments={departments} />}
        {activeTab === 'add-student' && <AddStudentTab departments={departments} staffList={staffList} />}
        {activeTab === 'add-course' && <AddCourseTab departments={departments} />}
        {activeTab === 'timetable' && <TimetableTab departments={departments} staffList={staffList} />}
        {activeTab === 'add-staff' && <AddStaffTab departments={departments} />}
        {activeTab === 'promote' && <PromoteTab />}
      </div>
    </div>
  );
}