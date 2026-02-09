import React, { useState } from 'react';
import { Building2, ChevronRight, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function TimetableTab({ departments, staffList }) {
    const [view, setView] = useState('depts');
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classes, setClasses] = useState([]);
    const [timetable, setTimetable] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [editingSlot, setEditingSlot] = useState(null);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
        { id: 1, time: '09:00 - 09:50' },
        { id: 2, time: '09:50 - 10:40' },
        { id: 'break1', label: 'Break', duration: '15m' },
        { id: 3, time: '10:55 - 11:45' },
        { id: 4, time: '11:45 - 12:35' },
        { id: 'lunch', label: 'Lunch', duration: '60m' },
        { id: 5, time: '13:35 - 14:25' },
        { id: 6, time: '14:25 - 15:15' },
        { id: 'break2', label: 'Break', duration: '25m' },
        { id: 7, time: '15:40 - 16:20' }
    ];
    const fetchClasses = async (code) => {
        const res = await fetch(`${API_BASE_URL}/admin/classes?departmentCode=${code}`);
        const data = await res.json();
        setClasses(data.classes || []);
    };
    const fetchTimetable = async (classId) => {
        const res = await fetch(`${API_BASE_URL}/admin/timetable?classId=${classId}`);
        const data = await res.json();
        const map = {};
        (data.timetable || []).forEach(t => {
            map[`${t.day_of_week}-${t.period}`] = t;
        });
        setTimetable(map);
    };
    const fetchSubjects = async (deptCode) => {
        const res = await fetch(`${API_BASE_URL}/admin/subjects?departmentCode=${deptCode}`);
        const data = await res.json();
        setSubjects(data.subjects || []);
    };
    const handleUpdateSlot = async (subjectId, staffId) => {
        if (!editingSlot) return;
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
                fetchTimetable(selectedClass.id);
                setEditingSlot(null);
            }
        } catch (err) { alert('Update failed'); }
    };
    const handleReset = async () => {
        if (!window.confirm('Reset entire timetable for this class?')) return;
        await fetch(`${API_BASE_URL}/admin/timetable/${selectedClass.id}`, { method: 'DELETE' });
        fetchTimetable(selectedClass.id);
    };
    if (view === 'depts') {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map(dept => (
                    <div key={dept.id} onClick={() => { setSelectedDept(dept); fetchClasses(dept.code); setView('classes'); }} className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:border-primary-500 transition-all text-center group">
                        <Building2 size={40} className="mx-auto mb-4 text-slate-400 group-hover:text-primary-500" />
                        <h3 className="font-bold text-slate-900">{dept.name}</h3>
                        <p className="text-xs text-slate-500 mt-2">{dept.code}</p>
                    </div>
                ))}
            </div>
        );
    }
    if (view === 'classes') {
        return (
            <div className="space-y-6">
                <button onClick={() => setView('depts')} className="flex items-center gap-2 text-primary-600 font-bold"><ChevronRight className="rotate-180" size={18} /> Back to Departments</button>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {classes.map(cls => (
                        <div key={cls.id} onClick={() => { setSelectedClass(cls); fetchTimetable(cls.id); fetchSubjects(selectedDept.code); setView('grid'); }} className="cursor-pointer p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                            <div className="font-bold">S{cls.semester} - {cls.name}</div>
                            <div className="text-xs text-slate-500 mt-1">Class Timetable</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={() => setView('classes')} className="flex items-center gap-2 text-primary-600 font-bold"><ChevronRight className="rotate-180" size={18} /> Back to Classes</button>
                <div className="flex gap-4">
                    <button onClick={handleReset} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50">Reset Timetable</button>
                    <button className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-200">Save Changes</button>
                </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="px-4 py-6 text-left font-bold uppercase text-xs tracking-wider border-r border-slate-800">Day / Period</th>
                                {periods.map((p, idx) => (
                                    <th key={idx} className={`px-4 py-6 text-center text-xs font-bold uppercase tracking-wider ${p.label ? 'bg-slate-800/50 w-20' : ''}`}>
                                        {p.time || p.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((day, dayIdx) => (
                                <tr key={dayIdx} className="border-b border-slate-100">
                                    <td className="px-4 py-8 bg-slate-50 font-bold text-slate-900 border-r border-slate-200">{day}</td>
                                    {periods.map((p, pIdx) => {
                                        if (p.label) return <td key={pIdx} className="bg-slate-50/50 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{p.label}</td>;
                                        const slot = timetable[`${dayIdx}-${p.id}`];
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
            {editingSlot && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h4 className="text-xl font-bold mb-6 text-slate-900">Assign Slot</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                                <select id="subSelect" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary-500 font-medium">
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Lecturer</label>
                                <select id="staffSelect" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary-500 font-medium">
                                    <option value="">Select Lecturer</option>
                                    {staffList.filter(s => s.deptCode === selectedDept.code).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setEditingSlot(null)} className="flex-1 py-4 font-bold text-slate-500 rounded-2xl hover:bg-slate-50">Cancel</button>
                                <button onClick={() => handleUpdateSlot(document.getElementById('subSelect').value, document.getElementById('staffSelect').value)} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800">Assign</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
