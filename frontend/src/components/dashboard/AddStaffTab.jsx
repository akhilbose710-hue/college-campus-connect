import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function AddStaffTab({ departments }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '', name: '', departmentCode: departments[0]?.code || '', role: 'LECTURER', dob: '', employeeId: ''
    });
    useEffect(() => {
        if (departments.length > 0 && !formData.departmentCode) {
            setFormData(prev => ({ ...prev, departmentCode: departments[0].code }));
        }
    }, [departments]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, name: formData.name, role: formData.role, metadata: { departmentCode: formData.departmentCode, dob: formData.dob, employeeId: formData.employeeId } })
            });
            if (!response.ok) throw new Error('Failed to add staff');
            alert('Staff added successfully!');
            setFormData({ ...formData, email: '', name: '', dob: '', employeeId: '' });
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-xl font-bold text-slate-900">Add New Staff Member</h3>
                <form onSubmit={handleCreate} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                            <input type="text" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Dr. Sarah Connor" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Staff Employee ID</label>
                            <input type="text" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} placeholder="e.g. EMP123" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input type="date" required className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-500" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                            <input type="email" required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="staff@college.edu" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                            <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none" value={formData.departmentCode} onChange={e => setFormData({ ...formData, departmentCode: e.target.value })}>
                                {departments.map(dept => <option key={dept.id} value={dept.code}>{dept.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Designation</label>
                            <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="LECTURER">Lecturer</option>
                                <option value="ASST_PROF">Asst. Professor</option>
                                <option value="HOD">HOD</option>
                                <option value="PRINCIPAL">Principal</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white disabled:opacity-70">
                        {loading ? 'Processing...' : 'Add Staff Member'}
                    </button>
                </form>
            </div>
        </div>
    );
}
