import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LayoutDashboard, Users, Building2, GraduationCap, Upload, Plus, FileSpreadsheet, AlertTriangle, Trash2, Edit } from 'lucide-react';
// import api from '../../services/api';
// Note: We might need to extend api.js to call our new endpoints, or use axios directly

// Mock chart data for now (real stats will come for total counts)
const chartData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 180 },
  { month: 'Mar', users: 260 },
  { month: 'Apr', users: 320 },
  { month: 'May', users: 410 }
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, activeDevices: 14, attendance: '94.3%' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Direct fetch to our new backend
      const response = await fetch('http://localhost:5000/api/admin/stats');
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

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>

        <div className="flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {['overview', 'users', 'departments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === tab
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab === 'overview' && <LayoutDashboard size={16} />}
              {tab === 'users' && <Users size={16} />}
              {tab === 'departments' && <Building2 size={16} />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'overview' && <OverviewTab stats={stats} />}
      {activeTab === 'users' && <UserManagementTab />}
      {activeTab === 'departments' && <DepartmentsTab />}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS (Defined here for efficiency, could be separate files)
// ----------------------------------------------------------------------

function OverviewTab({ stats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Users</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
          <p className="mt-1 text-xs text-green-600">Actual count from DB</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Devices</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats.activeDevices}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Today's Attendance</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{stats.attendance}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
          <p className="text-xs text-slate-500">New joins over last 5 months</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} dy={10} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip cursor={{ stroke: '#cbd5e1' }} />
              <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function UserManagementTab() {
  const [userType, setUserType] = useState('student'); // student | staff
  const [loading, setLoading] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteResult, setPromoteResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '', name: '', department: 'Computer Science', semester: '1', role: 'STUDENT', tutor: ''
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        email: formData.email,
        password: 'password123',
        name: formData.name,
        role: userType === 'staff' ? 'STAFF' : 'STUDENT',
        metadata: {
          department: formData.department,
          semester: userType === 'student' ? `${formData.semester} Semester` : null,
          tutor: userType === 'student' ? formData.tutor : null
        }
      };

      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to create user');

      alert('User created successfully!');
      setFormData(prev => ({ ...prev, email: '', name: '' }));
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!window.confirm("Are you sure? This will promote ALL students to the next semester and graduate (delete) those in the 8th semester.")) return;
    setPromoteLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/promote', { method: 'POST' });
      const data = await res.json();
      setPromoteResult(data);
      alert(`Success! Promoted: ${data.promoted}, Graduated: ${data.graduated}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      // Simple CSV Parser: email,name,dept,semester
      const lines = text.split('\n');
      const users = [];

      lines.forEach(line => {
        const [email, name, dept, semester] = line.split(',').map(s => s?.trim());
        if (email && email.includes('@')) {
          users.push({
            email, name,
            role: 'STUDENT',
            metadata: { department: dept || 'General', semester: semester || '1st Semester' }
          });
        }
      });

      if (users.length > 0) {
        if (!window.confirm(`Found ${users.length} users. Upload now?`)) return;

        setLoading(true);
        try {
          const res = await fetch('http://localhost:5000/api/admin/users/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users })
          });
          const data = await res.json();
          alert(`Bulk upload complete. Success: ${data.results.success}, Failed: ${data.results.failed}`);
        } catch (err) {
          alert("Upload failed: " + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        alert("No valid users found in CSV. Format: email,name,dept,semester");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {/* Tab Switchers */}
        <div className={`cursor-pointer rounded-xl border p-4 transition-all w-48 ${userType === 'student' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'bg-white hover:bg-slate-50'}`}
          onClick={() => setUserType('student')}>
          <div className="font-semibold text-slate-900">Students</div>
          <div className="text-xs text-slate-500">Add & Promote</div>
        </div>
        <div className={`cursor-pointer rounded-xl border p-4 transition-all w-48 ${userType === 'staff' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'bg-white hover:bg-slate-50'}`}
          onClick={() => setUserType('staff')}>
          <div className="font-semibold text-slate-900">Staff</div>
          <div className="text-xs text-slate-500">Manage Principals/HODs</div>
        </div>
      </div>

      {/* Forms */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Add Single {userType === 'student' ? 'Student' : 'Staff'}</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Department</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                <option>Computer Science</option>
                <option>Electronics</option>
                <option>Mechanical</option>
                <option>Civil</option>
              </select>
            </div>

            {userType === 'student' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Semester</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Tutor (Name)</label>
                  <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={formData.tutor} onChange={e => setFormData({ ...formData, tutor: e.target.value })} placeholder="Dr. Alan Reji" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-700">Full Name</label>
              <input type="text" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Email</label>
              <input type="email" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              {loading ? 'Adding...' : `Add ${userType === 'student' ? 'Student' : 'Staff'}`}
            </button>
          </form>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          {userType === 'student' ? (
            <>
              {/* Bulk Upload */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Bulk Upload</h3>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">Click or Drag CSV file here</p>
                  <p className="text-xs text-slate-400">email,name,dept,semester</p>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Promote */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                <h3 className="mb-2 text-lg font-bold text-amber-900">End of Semester Actions</h3>
                <p className="mb-4 text-sm text-amber-800">Promote all students to next semester. 8th semester students will be graduated (removed).</p>
                <button onClick={handlePromote} disabled={promoteLoading} className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                  {promoteLoading ? 'Processing...' : <><GraduationCap size={18} /> Promote All Students</>}
                </button>
              </div>
            </>
          ) : (
            /* Staff Specific Actions */
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Staff Management</h3>
              <p className="text-sm text-slate-500 mb-4">Select a staff from the list (mock) to assign HOD or Principal roles.</p>

              <div className="space-y-2">
                {/* Mock Staff List for UI Demo */}
                <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="text-sm font-medium">Prof. Smith</div>
                  <div className="flex gap-2">
                    <button className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">Make HOD</button>
                    <button className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100">Make Principal</button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="text-sm font-medium">Dr. Alan Reji</div>
                  <div className="flex gap-2">
                    <button className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">Make HOD</button>
                    <button className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100">Make Principal</button>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 italic">Note: Role assignment logic connects to the same backend update endpoints.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartmentsTab() {
  // Basic UI for adding departments. In a full DB version, this would fetch from 'departments' table.
  const [depts, setDepts] = useState(['Computer Science', 'Electronics', 'Mechanical', 'Civil']);
  const [newDept, setNewDept] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newDept) {
      setDepts([...depts, newDept]);
      setNewDept('');
      setIsAdding(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Departments</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 flex gap-2">
          <input autoFocus type="text" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Department Name" value={newDept} onChange={e => setNewDept(e.target.value)} />
          <button onClick={handleAdd} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
        </div>
      )}

      <div className="space-y-3">
        {depts.map(dept => (
          <div key={dept} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 hover:bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Building2 size={20} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{dept}</div>
                <div className="text-xs text-slate-500">HOD: Not Assigned</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-blue-600" title="Edit"><Edit size={16} /></button>
              <button className="p-2 text-slate-400 hover:text-red-600" title="Delete" onClick={() => setDepts(depts.filter(d => d !== dept))}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}