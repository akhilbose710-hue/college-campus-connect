import React, { useState } from 'react';
import { Plus, Building2, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function DepartmentsTab({ departments, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                onUpdate();
                setShowForm(false);
                setFormData({ name: '', code: '' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete department ${name}? This will remove all linked data.`)) return;
        try {
            await fetch(`${API_BASE_URL}/admin/departments/${id}`, { method: 'DELETE' });
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Manage Departments</h3>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700">
                    <Plus size={18} />
                    {showForm ? 'Cancel' : 'Add Department'}
                </button>
            </div>
            {showForm && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department Name</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500" placeholder="e.g. Mechanical Engineering" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Code</label>
                            <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500" placeholder="e.g. ME" />
                        </div>
                        <button type="submit" disabled={loading} className="rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-70">
                            {loading ? 'Creating...' : 'Create Department'}
                        </button>
                    </form>
                </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map(dept => (
                    <div key={dept.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-primary-500 hover:shadow-md transition-all">
                        <button onClick={() => handleDelete(dept.id, dept.name)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                            <XCircle size={18} />
                        </button>
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4">
                            <Building2 size={32} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-center">{dept.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold text-center">{dept.code}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
