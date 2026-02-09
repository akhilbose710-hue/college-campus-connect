import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, Shield, CheckCircle } from 'lucide-react';
import StatCard from './StatCard';

const chartData = [{ month: 'Jan', users: 120 }, { month: 'Feb', users: 180 }, { month: 'Mar', users: 260 }, { month: 'Apr', users: 320 }, { month: 'May', users: 410 }];

export default function OverviewTab({ stats }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="+12% from last month" color="bg-blue-500" />
                <StatCard title="Active Devices" value={stats.activeDevices} icon={Shield} trend="+2 new this week" color="bg-emerald-500" />
                <StatCard title="Avg. Attendance" value={stats.attendance} icon={CheckCircle} trend="Consistent" color="bg-purple-500" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
                        <p className="text-sm text-slate-500">New joins over the last 5 months</p>
                    </div>
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View Report</button>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} dy={10} tick={{ fill: '#64748B', fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#cbd5e1' }} />
                            <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
