import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { FileText, Loader2, Award, Ban } from 'lucide-react';

export default function StudentSeriesExam() {
  const { user } = useAuth();
  const [examNumber, setExamNumber] = useState(1);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMarks();
    }
  }, [user, examNumber]);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/series-exam/student-marks?studentId=${user.id}&examNumber=${examNumber}`);
      if (res.ok) {
        const data = await res.json();
        setMarks(data.marks || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Series Exam Results</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Review your performance across subjects.</p>
        </div>
        
        <div className="w-full md:w-64 relative z-10">
          <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
          <select
            value={examNumber}
            onChange={(e) => setExamNumber(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all outline-none font-bold text-slate-800 appearance-none shadow-sm cursor-pointer"
          >
            <option value={1}>Series Exam 1</option>
            <option value={2}>Series Exam 2</option>
            <option value={3}>Series Exam 3</option>
            <option value={4}>Series Exam 4</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-black uppercase">
            Select
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <span className="font-bold tracking-widest uppercase text-[10px]">Loading Marks...</span>
        </div>
      ) : marks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marks.map((mark) => (
            <div key={mark.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="flex items-start justify-between mb-8 z-10 relative">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{mark.subject?.code}</div>
                  <div className="text-lg font-bold text-slate-800 leading-tight">{mark.subject?.name}</div>
                </div>
              </div>

              <div className="flex items-end justify-between z-10 relative">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Score</div>
                  {mark.status === 'ABSENT' ? (
                     <div className="flex items-center gap-2 text-red-500">
                        <Ban size={24} />
                        <span className="text-2xl font-black">ABSENT</span>
                     </div>
                  ) : (
                     <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{mark.obtained_mark}</span>
                        <span className="text-sm font-bold text-slate-400">/ {mark.total_mark}</span>
                     </div>
                  )}
                </div>
                {mark.status === 'PRESENT' && (
                  <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <Award size={24} />
                  </div>
                )}
              </div>
              
              {/* Progress bar visual */}
              {mark.status === 'PRESENT' && (
                <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(Number(mark.obtained_mark) / Number(mark.total_mark)) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
            <FileText size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Not Marked Yet</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm">
            Your marks for Series Exam {examNumber} have not been published by your instructors yet. Check back later.
          </p>
        </div>
      )}
    </div>
  );
}
