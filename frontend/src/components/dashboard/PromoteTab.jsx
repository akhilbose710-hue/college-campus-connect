import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function PromoteTab() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const handlePromote = async () => {
        if (!window.confirm('CRITICAL: This will promote every student to the next semester and graduate S8 students. This cannot be undone. Proceed?')) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/promote`, { method: 'POST' });
            const data = await res.json();
            setResults(data);
        } catch (err) {
            alert('Promotion failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-3xl mx-auto text-center space-y-8 py-10">
            <div className="mx-auto h-24 w-24 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <BookOpen size={48} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900">Academic Year Promotion</h3>
                <p className="max-w-md mx-auto text-slate-500 mt-2">
                    Bulk promote all students to the next semester. Students in S8 will be automatically graduated and archived.
                </p>
            </div>
            <button onClick={handlePromote} disabled={loading} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70">
                {loading ? 'Processing Promotion...' : 'Start Promotion Process'}
            </button>
            {results && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 animate-in fade-in duration-500">
                    <h4 className="font-bold text-lg mb-2">Promotion Successful!</h4>
                    <p className="text-sm">Classes Updated: <span className="font-bold">{results.promotedClasses}</span></p>
                    <p className="text-sm">Students Graduated: <span className="font-bold">{results.graduatedStudents}</span></p>
                </div>
            )}
        </div>
    );
}
