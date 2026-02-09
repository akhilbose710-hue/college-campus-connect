import React, { useState } from 'react';
import { Building2, ChevronRight, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function AddStudentTab({ departments, staffList }) {
    const [view, setView] = useState('depts');
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classes, setClasses] = useState([]);
    const [classStudents, setClassStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '', name: '', dob: '', admissionNo: ''
    });
    const fetchClasses = async (deptCode) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/classes?departmentCode=${deptCode}`);
            const data = await res.json();
            setClasses(data.classes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const fetchClassStudents = async (classId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/classes/${classId}/students`);
            const data = await res.json();
            if (data.students) setClassStudents(data.students);
        } catch (err) {
            console.error(err);
        }
    };
    const handleCreateClass = async (e) => {
        e.preventDefault();
        const className = e.currentTarget.classNameInput.value;
        const tutorId = e.currentTarget.tutorId.value;
        const semester = e.currentTarget.semester.value;
        const batch = e.currentTarget.batch.value;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: className, department_code: selectedDept.code, tutor_id: tutorId || null, semester, batch })
            });
            if (res.ok) {
                alert('Class created successfully');
                e.target.reset();
                fetchClasses(selectedDept.code);
            } else {
                const data = await res.json();
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Failed to create class');
        }
    };
    const handleDeleteClass = async (classId, className) => {
        if (!window.confirm(`Are you sure you want to delete class ${className}? All student enrollments for this class will be cleared.`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/classes/${classId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Class deleted successfully');
                fetchClasses(selectedDept.code);
            } else {
                const data = await res.json();
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Failed to delete class');
        }
    };
    const handleUpdateTutor = async (tutorId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/classes/${selectedClass.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...selectedClass, tutor_id: tutorId || null })
            });
            if (res.ok) {
                alert('Tutor updated');
                fetchClasses(selectedDept.code);
            }
        } catch (err) {
            alert('Failed to update tutor');
        }
    };
    const handleRemoveStudent = async (studentId, name) => {
        if (!window.confirm(`Remove ${name} from ${selectedClass.name}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/classes/students/${studentId}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Student removed');
                fetchClassStudents(selectedClass.id);
            }
        } catch (err) {
            alert('Failed to remove student');
        }
    };
    const handleAddStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    role: 'STUDENT',
                    metadata: {
                        departmentCode: selectedDept.code,
                        class_id: selectedClass.id,
                        dob: formData.dob,
                        semester: formData.semester || selectedClass.semester,
                        admissionNo: formData.admissionNo
                    }
                })
            });
            if (res.ok) {
                alert('Student added successfully');
                setFormData({ ...formData, email: '', name: '', dob: '', admissionNo: '', semester: '' });
                fetchClassStudents(selectedClass.id);
            } else {
                const data = await res.json();
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Failed to add student');
        } finally {
            setLoading(false);
        }
    };
    if (view === 'depts') {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.map(dept => (
                        <div
                            key={dept.id}
                            onClick={() => { setSelectedDept(dept); fetchClasses(dept.code); setView('classes'); }}
                            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-primary-500 hover:shadow-md transition-all text-center"
                        >
                            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Building2 size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900">{dept.name}</h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{dept.code}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    if (view === 'classes') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <button onClick={() => setView('depts')} className="hover:text-primary-600">Departments</button>
                    <ChevronRight size={14} />
                    <span className="font-bold text-slate-900">{selectedDept.name}</span>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-6 text-xl font-bold text-slate-900">Create New Class</h3>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Class Name</label>
                                <input name="classNameInput" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500" placeholder="e.g. CS S7 A batch" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Semester</label>
                                    <select name="semester" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>S{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch</label>
                                    <input name="batch" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none" placeholder="e.g. A" defaultValue="A" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Tutor</label>
                                <select name="tutorId" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none bg-white">
                                    <option value="">Select a Tutor</option>
                                    {staffList.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800">Create Class</button>
                        </form>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Existing Classes</h3>
                        <div className="grid gap-4">
                            {classes.map(cls => (
                                <div key={cls.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-primary-400 transition-all">
                                    <div onClick={() => { setSelectedClass(cls); fetchClassStudents(cls.id); setView('management'); }} className="flex-1 cursor-pointer">
                                        <div className="font-bold text-slate-900">S{cls.semester} - {cls.name}</div>
                                        <div className="text-xs text-slate-500">Tutor: {cls.tutor?.full_name || 'Not assigned'}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id, cls.name); }}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronRight size={18} className="text-slate-400" />
                                    </div>
                                </div>
                            ))}
                            {classes.length === 0 && <p className="text-center py-10 text-slate-400 italic">No classes found in this department.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (view === 'management') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <button onClick={() => setView('depts')} className="hover:text-primary-600">Departments</button>
                    <ChevronRight size={14} />
                    <button onClick={() => setView('classes')} className="hover:text-primary-600">{selectedDept.name}</button>
                    <ChevronRight size={14} />
                    <span className="font-bold text-slate-900">{selectedClass.name}</span>
                </div>
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="col-span-1 space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-slate-900">Class Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assigned Tutor</label>
                                    <select
                                        value={selectedClass.tutor_id || ''}
                                        onChange={(e) => handleUpdateTutor(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none bg-slate-50"
                                    >
                                        <option value="">No Tutor</option>
                                        {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-slate-900">Add Student</h3>
                            <form onSubmit={handleAddStudent} className="space-y-4">
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none" placeholder="Full Name" />
                                <input required value={formData.admissionNo} onChange={e => setFormData({ ...formData, admissionNo: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none" placeholder="Admission Number" />
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none" placeholder="Email" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="date" required value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="8"
                                        placeholder="Sem (Opt)"
                                        value={formData.semester || ''}
                                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                                        title="Override default class semester if needed"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700">Add Student</button>
                            </form>
                        </div>
                    </div>
                    <div className="col-span-1 lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Enrolled Students ({classStudents.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Name</th>
                                        <th className="px-6 py-4 font-semibold">Admission #</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classStudents.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{s.name}</div>
                                                <div className="text-xs text-slate-500">{s.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">{s.admission_number}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleRemoveStudent(s.id, s.name)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {classStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic">No students enrolled in this class.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
