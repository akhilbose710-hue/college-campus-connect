import { API_BASE_URL } from '../../config';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Building2, GraduationCap, BookOpen, Briefcase, Calendar } from 'lucide-react';
import UsersListTab from '../../components/dashboard/UsersListTab';
import DepartmentsTab from '../../components/dashboard/DepartmentsTab';
import AddStudentTab from '../../components/dashboard/AddStudentTab';
import AddCourseTab from '../../components/dashboard/AddCourseTab';
import TimetableTab from '../../components/dashboard/TimetableTab';
import AddStaffTab from '../../components/dashboard/AddStaffTab';

export default function PrincipalDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';

  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchStaff();
  }, []);

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
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'add-student', label: 'Add Student/Class', icon: GraduationCap },
    { id: 'add-course', label: 'Add Course', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'add-staff', label: 'Add Staff', icon: Briefcase },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {tabs.find(t => t.id === activeTab)?.label || 'Principal Dashboard'}
        </h1>
        <p className="text-slate-500 mt-1">
          {activeTab === 'users' && 'Manage all students and staff members in one place.'}
          {activeTab === 'departments' && 'Organize and manage faculty departments.'}
          {activeTab === 'add-student' && 'Manage departments, classes and student registration.'}
          {activeTab === 'add-course' && 'Define academic courses and subjects per department.'}
          {activeTab === 'timetable' && 'Construct and manage weekly schedules for classes.'}
          {activeTab === 'add-staff' && 'Onboard new faculty and administrative staff.'}
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
        {activeTab === 'users' && <UsersListTab />}
        {activeTab === 'departments' && <DepartmentsTab departments={departments} onUpdate={fetchDepartments} />}
        {activeTab === 'add-student' && <AddStudentTab departments={departments} staffList={staffList} />}
        {activeTab === 'add-course' && <AddCourseTab departments={departments} />}
        {activeTab === 'timetable' && <TimetableTab departments={departments} staffList={staffList} />}
        {activeTab === 'add-staff' && <AddStaffTab departments={departments} />}
      </div>
    </div>
  );
}