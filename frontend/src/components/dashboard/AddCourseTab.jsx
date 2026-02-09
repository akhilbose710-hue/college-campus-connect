import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

export default function AddCourseTab({ departments }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ code: '', name: '', department: departments[0]?.code || '', semester: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', semester: '' });
    useEffect(() => {
        fetchSubjects();
    }, []);
    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/subjects`);
            const data = await res.json();
            setSubjects(data.subjects || []);
        } catch (err) { console.error(err); }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Course added');
                setFormData({ ...formData, code: '', name: '', semester: '' });
                fetchSubjects();
            }
        } catch (err) { alert('Failed to add course'); }
        finally { setLoading(false); }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        try {
            await fetch(`${API_BASE_URL}/admin/subjects/${id}`, { method: 'DELETE' });
            fetchSubjects();
        } catch (err) { console.error(err); }
    };
    const startEdit = (subject) => {
        setEditingId(subject.id);
        setEditForm({ name: subject.name, semester: subject.semester || '' });
    };
    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', semester: '' });
    };
    const handleUpdate = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/subjects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                alert('Updated successfully');
                setEditingId(null);
                fetchSubjects();
            } else {
                alert('Update failed');
            }
        } catch (err) { alert('Update failed'); }
    };
    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-6">Add New Course</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="Course Code (e.g. CS301)" className="p-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                        <input required placeholder="Course Name" className="p-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-3 rounded-xl border border-slate-200 outline-none" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                            {departments.map(d => <option key={d.id} value={d.code}>{d.name}</option>)}
                        </select>
                        <input type="number" placeholder="Semester (Optional)" className="p-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} />
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Add Course</button>
                </form>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Dept</th>
                            <th className="px-6 py-4">Sem</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {subjects.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold">{s.code}</td>
                                <td className="px-6 py-4">
                                    {editingId === s.id ? (
                                        <input
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full p-1 border rounded"
                                        />
                                    ) : (
                                        s.name
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold">{s.department}</td>
                                <td className="px-6 py-4 text-xs font-semibold">
                                    {editingId === s.id ? (
                                        <input
                                            type="number"
                                            value={editForm.semester}
                                            onChange={e => setEditForm({ ...editForm, semester: e.target.value })}
                                            className="w-16 p-1 border rounded"
                                        />
                                    ) : (
                                        s.semester || 'NA'
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === s.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleUpdate(s.id)} className="text-emerald-600 font-bold hover:underline">Save</button>
                                            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => startEdit(s)} className="text-blue-500 hover:text-blue-700 font-medium">Edit</button>
                                            <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600">Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
