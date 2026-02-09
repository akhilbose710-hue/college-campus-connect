import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, color }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl p-3 ${color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">30 Days</span>
            </div>
            <div>
                <div className="text-3xl font-bold text-slate-900">{value}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">{title}</div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                {trend}
            </div>
        </div>
    );
}
