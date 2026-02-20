import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  TrendingUp,
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  FileClock,
  BookOpen,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { id: 1, time: '09:00 - 09:50' },
  { id: 2, time: '09:50 - 10:40' },
  { id: 'break1', label: 'Break' },
  { id: 3, time: '10:55 - 11:45' },
  { id: 4, time: '11:45 - 12:35' },
  { id: 'lunch', label: 'Lunch' },
  { id: 5, time: '13:35 - 14:25' },
  { id: 6, time: '14:25 - 15:15' },
  { id: 'break2', label: 'Break' },
  { id: 7, time: '15:40 - 16:20' }
];

const attendanceData = [
  { day: 'Mon', attendance: 93 },
  { day: 'Tue', attendance: 95 },
  { day: 'Wed', attendance: 91 },
  { day: 'Thu', attendance: 96 },
  { day: 'Fri', attendance: 94 }
];

export default function StaffDashboard() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ tutorship: null, timetable: [], students: [], hodData: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // HOD Specific States
  const activeTab = searchParams.get('tab') || 'overview';
  const [selectedClass, setSelectedClass] = useState(null);
  const [classTimetable, setClassTimetable] = useState({});
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSubject, setNewSubject] = useState({ code: '', name: '', credits: 3, semester: 1 });

  const primaryRole = roles[0];
  const isHOD = roles.includes('HOD');
  const isPrincipal = roles.includes('PRINCIPAL');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/staff-dashboard-data?staffId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTimetable = async (classId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/timetable?classId=${classId}`);
      const result = await res.json();
      const map = {};
      (result.timetable || []).forEach(t => {
        map[`${t.day_of_week}-${t.period}`] = t;
      });
      setClassTimetable(map);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTimetable = async (subjectId, staffId) => {
    if (!editingSlot || !selectedClass) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClass.id,
          day_of_week: editingSlot.day,
          period: editingSlot.period,
          subject_id: subjectId,
          staff_id: staffId
        })
      });
      if (res.ok) {
        fetchClassTimetable(selectedClass.id);
        setEditingSlot(null);
      }
    } catch (err) { alert('Update failed'); }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!data.hodData?.deptCode) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSubject, department: data.hodData.deptCode })
      });
      if (res.ok) {
        alert('Subject Added');
        setNewSubject({ code: '', name: '', credits: 3, semester: 1 });
        fetchDashboardData(); // Refresh to get new subjects list
      }
    } catch (err) { alert('Failed to add subject'); }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await fetch(`${API_BASE_URL}/admin/subjects/${id}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (err) { alert('Failed to delete'); }
  }

  const getSlot = (dayIdx, periodId) => {
    // For PERSONAL staff timetable
    return data.timetable.find(t => t.day_of_week === dayIdx && t.period === periodId);
  };

  const filteredStudents = data.students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admission?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weekDays = React.useMemo(() => {
    const today = new Date();
    let currentDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayIdx);
    return DAYS.map((day, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      return {
        name: day,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isoDate: `${year}-${month}-${dateNum}`
      };
    });
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" />
        <p className="text-sm font-medium text-slate-500 font-sans">Syncing your workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.user_metadata?.full_name || 'Faculty Member'}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isHOD ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
              {primaryRole}
            </span>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
            <Calendar size={14} className="text-primary-500" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

      </div>

      {isHOD && activeTab === 'overview' && data.hodData && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', val: data.hodData.stats.totalStudents, icon: Users, color: 'blue' },
            { label: 'Total Staff', val: data.hodData.stats.totalStaff, icon: ShieldCheck, color: 'indigo' },
            { label: 'Avg Attendance', val: data.hodData.stats.avgAttendance, icon: UserCheck, color: 'emerald' },
            { label: 'Active Classes', val: data.hodData.stats.activeClasses, icon: LayoutGrid, color: 'orange' }
          ].map(stat => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={22} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</div>
                <div className="text-xl font-bold text-slate-900">{stat.val}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {isHOD && activeTab === 'staff' && data.hodData && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900">Department Staff</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Designation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.hodData.staff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                    <td className="px-6 py-4 text-slate-600">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold uppercase">{s.designation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isHOD && activeTab === 'students' && data.hodData && (
        <section className="space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.hodData.classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`px-6 py-3 rounded-xl border font-bold text-sm whitespace-nowrap transition-all ${selectedClass?.id === cls.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                {cls.name}
              </button>
            ))}
          </div>
          {selectedClass && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">{selectedClass.name} Students</h3>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{data.hodData.students.filter(s => s.classId === selectedClass.id).length} Students</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Admission No</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.hodData.students.filter(s => s.classId === selectedClass.id).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-slate-500">{s.admission}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                        <td className="px-6 py-4 text-slate-600">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {isHOD && activeTab === 'subjects' && data.hodData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6">
              <h3 className="font-bold text-lg text-slate-900 mb-6">Add New Subject</h3>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Subject Code</label>
                  <input required value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-bold text-slate-900" placeholder="e.g. CS101" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Subject Name</label>
                  <input required value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-bold text-slate-900" placeholder="e.g. Intro to CS" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Credits</label>
                    <input type="number" required value={newSubject.credits} onChange={e => setNewSubject({ ...newSubject, credits: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Semester</label>
                    <input type="number" required value={newSubject.semester} onChange={e => setNewSubject({ ...newSubject, semester: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-bold text-slate-900" />
                  </div>
                </div>
                <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">Add Subject</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4 text-center">Cred</th>
                      <th className="px-6 py-4 text-center">Sem</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.hodData.subjects.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">{s.code}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                        <td className="px-6 py-4 text-center"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{s.credits}</span></td>
                        <td className="px-6 py-4 text-center"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">S{s.semester}</span></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteSubject(s.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHOD && activeTab === 'timetable' && data.hodData && (
        <section className="space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.hodData.classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => { setSelectedClass(cls); fetchClassTimetable(cls.id); }}
                className={`px-6 py-3 rounded-xl border font-bold text-sm whitespace-nowrap transition-all ${selectedClass?.id === cls.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                {cls.name}
              </button>
            ))}
          </div>
          {selectedClass && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="px-4 py-6 text-left font-bold uppercase text-xs tracking-wider border-r border-slate-800">Day / Period</th>
                      {PERIODS.map((p, idx) => (
                        <th key={idx} className={`px-4 py-6 text-center text-xs font-bold uppercase tracking-wider ${p.label ? 'bg-slate-800/50 w-20' : ''}`}>
                          {p.time || p.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, dayIdx) => (
                      <tr key={dayIdx} className="border-b border-slate-100">
                        <td className="px-4 py-8 bg-slate-50 font-bold text-slate-900 border-r border-slate-200">{day}</td>
                        {PERIODS.map((p, pIdx) => {
                          if (p.label) return <td key={pIdx} className="bg-slate-50/50 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{p.label}</td>;
                          const slot = classTimetable[`${dayIdx}-${p.id}`];
                          return (
                            <td key={pIdx} className="p-2 border-r border-slate-100 min-w-[160px]">
                              <div
                                onClick={() => setEditingSlot({ day: dayIdx, period: p.id })}
                                className={`h-full min-h-[100px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 transition-all cursor-pointer ${slot ? 'border-primary-100 bg-primary-50/30' : 'border-slate-100 hover:border-primary-200 hover:bg-slate-50'}`}
                              >
                                {slot ? (
                                  <>
                                    <div className="font-bold text-slate-900 text-sm text-center">{slot.subject?.name}</div>
                                    <div className="text-xs text-primary-600 font-bold mt-1 bg-white px-2 py-0.5 rounded-full shadow-sm">{slot.staff?.full_name}</div>
                                    <div className="text-[10px] text-slate-400 font-medium mt-2 uppercase tracking-tighter">{slot.subject?.code}</div>
                                  </>
                                ) : (
                                  <Plus size={20} className="text-slate-300" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {editingSlot && isHOD && activeTab === 'timetable' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold mb-6 text-slate-900">Assign Slot</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <select id="subSelect" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary-500 font-medium">
                  <option value="">Select Subject</option>
                  {data.hodData.subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lecturer</label>
                <select id="staffSelect" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary-500 font-medium">
                  <option value="">Select Lecturer</option>
                  {/* Include HOD in the list if needed, or just staff */}
                  <option value={user.id}>Me ({user.user_metadata?.full_name})</option>
                  {data.hodData.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setEditingSlot(null)} className="flex-1 py-4 font-bold text-slate-500 rounded-2xl hover:bg-slate-50">Cancel</button>
                <button onClick={() => handleUpdateTimetable(document.getElementById('subSelect').value, document.getElementById('staffSelect').value)} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Default View for All Staff (My Schedule) */}
      {(!isHOD || activeTab === 'overview') && (
        <>


          {data.tutorship && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100/50">
              <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-primary-600 shadow-sm ring-4 ring-primary-50">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 leading-none">Tutorship: {data.tutorship.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-extrabold text-primary-600 tracking-tighter uppercase">{data.tutorship.batch}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Sem {data.tutorship.semester}</span>
                    </div>
                  </div>
                </div>
                <div className="relative hidden sm:block">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Find student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 outline-none w-56 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="p-4 overflow-x-auto whitespace-nowrap scrollbar-hide bg-slate-50/20">
                <div className="flex gap-4 min-w-min px-2 py-1">
                  {filteredStudents.map(student => (
                    <div key={student.id} className="inline-flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-2xl min-w-[210px] group hover:border-primary-200 hover:ring-4 hover:ring-primary-50 transition-all cursor-pointer shadow-sm active:scale-95">
                      <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 font-bold text-sm shadow-inner group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        {student.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-primary-700 transition-colors truncate">{student.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">{student.admission}</div>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="text-xs text-slate-400 py-4 italic px-4 font-semibold">No students found matching your search.</div>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Teaching Schedule</h2>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28 border-r border-slate-100">Day</th>
                      {PERIODS.map(p => (
                        <th key={p.id} className={`p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center border-r border-slate-100 last:border-r-0 ${p.label ? 'bg-slate-100/50 w-8' : ''}`}>
                          {p.label || `P${p.id}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weekDays.map((dayObj, dIdx) => (
                      <tr key={dayObj.name} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 font-bold text-slate-600 text-[11px] uppercase tracking-wider border-r border-slate-100 bg-slate-50/20">
                          <div>{dayObj.name}</div>
                          <div className="text-[9px] text-slate-400 font-medium tracking-normal normal-case mt-0.5">{dayObj.dateStr}</div>
                        </td>
                        {PERIODS.map(p => {
                          if (p.label) return <td key={p.id} className="bg-slate-50/30"></td>;
                          const slot = getSlot(dIdx, p.id);
                          return (
                            <td key={p.id} className="p-3 border-r border-slate-100 last:border-r-0 h-28 min-w-[160px]">
                              {slot ? (
                                <button
                                  onClick={() => navigate(`/mark-attendance?classId=${slot.class_id}&period=${p.id}&subjectId=${slot.subject_id}&date=${dayObj.isoDate}`)}
                                  className="w-full h-full p-4 rounded-2xl bg-white text-left border border-slate-200 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-100 hover:scale-[1.03] transition-all group/slot relative overflow-hidden ring-0 hover:ring-2 hover:ring-primary-100"
                                >
                                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/slot:opacity-100 transition-all translate-x-2 group-hover/slot:translate-x-0">
                                    <ArrowRight size={14} className="text-primary-600" />
                                  </div>
                                  <div className="text-[9px] font-black text-primary-600 uppercase tracking-tighter mb-1.5 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                                    {slot.subject?.code}
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">{slot.subject?.name}</div>
                                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    <div className="flex items-center gap-1">
                                      <LayoutGrid size={11} className="text-slate-300" />
                                      {slot.class?.name}
                                    </div>
                                    {slot.class?.semester && (
                                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] text-slate-500">S{slot.class.semester}</span>
                                    )}
                                  </div>
                                </button>
                              ) : (
                                <div className="w-full h-full border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[9px] font-black text-slate-300 uppercase letter-spacing-2">Free</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}