import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

export default function ManageRolesTab({ departments }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ userId: '', role: 'HOD', departmentCode: '' });
    const [staff, setStaff] = useState([]);
    useEffect(() => {
        fetchStaff();
    }, []);
    const fetchStaff = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/staff`);
            const data = await res.json();
            setStaff(data.staff || []);
        } catch (err) {
            console.error(err);
        }
    };
    const handleAssign = async (e) => {
        e.preventDefault();
        if (!formData.userId) return alert('Select a staff member');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/assign-role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) alert('Role assigned successfully');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Assign Administrative Roles</h3>
            <form onSubmit={handleAssign} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Staff Member</label>
                    <select value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 bg-slate-50">
                        <option value="">Select Staff</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 bg-slate-50">
                            <option value="HOD">Department Head (HOD)</option>
                            <option value="PRINCIPAL">College Principal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Target Department</label>
                        <select disabled={formData.role === 'PRINCIPAL'} value={formData.departmentCode} onChange={e => setFormData({ ...formData, departmentCode: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 bg-slate-50 disabled:opacity-50">
                            <option value="">Select Dept (for HOD)</option>
                            {departments.map(dept => <option key={dept.id} value={dept.code}>{dept.name}</option>)}
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                    {loading ? 'Processing...' : 'Assign Role & Grant Permissions'}
                </button>
            </form>
        </div>
    );
}
