import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { FileText, Save, CheckCircle2, UserX, AlertCircle, Loader2, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

export default function FacultySeriesExam() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState('');
  const [examNumber, setExamNumber] = useState(1);
  const [totalMark, setTotalMark] = useState(50);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marksData, setMarksData] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchSubjects();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/series-exam/staff-subjects?staffId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedConfig) {
      fetchStudentsAndMarks();
    } else {
      setStudents([]);
      setMarksData({});
    }
  }, [selectedConfig, examNumber]);

  const fetchStudentsAndMarks = async () => {
    const [classId, subjectId] = selectedConfig.split('_');
    setLoading(true);
    try {
      const studRes = await fetch(`${API_BASE_URL}/series-exam/students?classId=${classId}`);
      let studList = [];
      if (studRes.ok) {
        const d = await studRes.json();
        studList = d.students || [];
      }

      const marksRes = await fetch(`${API_BASE_URL}/series-exam/marks?classId=${classId}&subjectId=${subjectId}&examNumber=${examNumber}`);
      let existingMarks = {};
      if (marksRes.ok) {
        const m = await marksRes.json();
        (m.marks || []).forEach(record => {
           existingMarks[record.student_id] = {
             obtained_mark: record.obtained_mark !== null ? record.obtained_mark : '',
             status: record.status
           };
           // Optionally set total mark from the first record if exists
           if (record.total_mark && totalMark === 50) {
              setTotalMark(record.total_mark);
           }
        });
      }

      const initialMarks = {};
      studList.forEach(s => {
         if (existingMarks[s.id]) {
            initialMarks[s.id] = existingMarks[s.id];
         } else {
            initialMarks[s.id] = { obtained_mark: '', status: 'PRESENT' };
         }
      });
      
      setStudents(studList);
      setMarksData(initialMarks);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksData(prev => ({
       ...prev,
       [studentId]: {
          ...prev[studentId],
          [field]: value,
          ...(field === 'status' && value === 'ABSENT' ? { obtained_mark: '' } : {})
       }
    }));
  };

  const handleSave = async () => {
    if (!selectedConfig) return;
    const [classId, subjectId] = selectedConfig.split('_');
    
    // Validate
    for (const s of students) {
       const rec = marksData[s.id];
       if (rec.status === 'PRESENT' && (rec.obtained_mark === '' || rec.obtained_mark === null)) {
          setMessage({ type: 'error', text: `Please enter marks for ${s.name} (${s.admission_number})` });
          return;
       }
       if (rec.status === 'PRESENT' && Number(rec.obtained_mark) > Number(totalMark)) {
          setMessage({ type: 'error', text: `Marks cannot exceed Total Mark for ${s.name}` });
          return;
       }
    }

    setSaving(true);
    setMessage(null);

    const records = students.map(s => {
       const rec = marksData[s.id];
       return {
          student_id: s.id,
          class_id: classId,
          subject_id: subjectId,
          series_exam_number: Number(examNumber),
          total_mark: Number(totalMark),
          obtained_mark: rec.status === 'PRESENT' ? Number(rec.obtained_mark) : null,
          status: rec.status,
          marked_by: user.id
       };
    });

    try {
      const res = await fetch(`${API_BASE_URL}/series-exam/marks`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ records })
      });
      if (res.ok) {
         setMessage({ type: 'success', text: 'Marks saved successfully!' });
         setTimeout(() => setMessage(null), 3000);
      } else {
         const d = await res.json();
         setMessage({ type: 'error', text: d.error || 'Failed to save' });
      }
    } catch(err) {
       setMessage({ type: 'error', text: 'Network Error' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Series Exam Marks</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage intern marks accurately and easily.</p>
        </div>
        {selectedConfig && (
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save All Marks
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-bold text-sm tracking-wide">{message.text}</span>
        </div>
      )}

      {/* Configuration Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="flex-1 w-full space-y-2 z-10">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Select Class & Subject</label>
          <div className="relative">
            <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedConfig}
              onChange={(e) => setSelectedConfig(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none font-semibold text-slate-700 appearance-none shadow-sm cursor-pointer"
            >
              <option value="" disabled>Choose subject...</option>
              {subjects.map(s => (
                <option key={`${s.classId}_${s.subjectId}`} value={`${s.classId}_${s.subjectId}`}>
                  {s.className} - {s.subjectName} ({s.subjectCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full md:w-48 space-y-2 z-10">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Series Exam</label>
          <div className="relative">
            <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={examNumber}
              onChange={(e) => setExamNumber(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none font-semibold text-slate-700 appearance-none shadow-sm cursor-pointer"
            >
              <option value={1}>Exam 1</option>
              <option value={2}>Exam 2</option>
              <option value={3}>Exam 3</option>
              <option value={4}>Exam 4</option>
            </select>
          </div>
        </div>

        <div className="w-full md:w-32 space-y-2 z-10">
          <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Total Mark</label>
          <input
            type="number"
            value={totalMark}
            onChange={(e) => setTotalMark(e.target.value)}
            min="1"
            className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none font-bold text-slate-800 shadow-sm text-center"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 size={32} className="animate-spin text-primary-500" />
          <span className="font-bold tracking-widest uppercase text-[10px]">Loading Students...</span>
        </div>
      ) : selectedConfig && students.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="grid grid-cols-12 gap-4 p-5 bg-slate-50 border-b border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-1 text-center">No</div>
            <div className="col-span-3">Reg No</div>
            <div className="col-span-4">Student Name</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Mark (/{totalMark})</div>
          </div>
          <div className="divide-y divide-slate-100/80 max-h-[600px] overflow-y-auto">
            {students.map((student, idx) => (
              <div key={student.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors group">
                <div className="col-span-1 text-center font-bold text-slate-400 text-sm">
                  {idx + 1}
                </div>
                <div className="col-span-3">
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-xs">{student.admission_number}</span>
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                    {student.name.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-900 text-sm truncate">{student.name}</span>
                </div>
                <div className="col-span-2 flex justify-center">
                  <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                      onClick={() => handleMarkChange(student.id, 'status', 'PRESENT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${marksData[student.id]?.status === 'PRESENT' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      P
                    </button>
                    <button
                      onClick={() => handleMarkChange(student.id, 'status', 'ABSENT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${marksData[student.id]?.status === 'ABSENT' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      AB
                    </button>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center relative">
                  <input
                    type="number"
                    max={totalMark}
                    min="0"
                    disabled={marksData[student.id]?.status === 'ABSENT'}
                    value={marksData[student.id]?.obtained_mark}
                    onChange={(e) => handleMarkChange(student.id, 'obtained_mark', e.target.value)}
                    placeholder="-"
                    className={`w-20 text-center font-black text-lg p-2 rounded-xl transition-all border border-transparent outline-none
                      ${marksData[student.id]?.status === 'ABSENT' ? 'bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-slate-800 shadow-sm'}
                    `}
                  />
                  {marksData[student.id]?.status === 'PRESENT' && (marksData[student.id]?.obtained_mark === '' || marksData[student.id]?.obtained_mark === null) && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedConfig ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm gap-4">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
            <GraduationCap size={32} className="text-slate-300" />
          </div>
          <span className="font-bold tracking-widest uppercase text-xs">No Students Found</span>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 gap-4">
          <ArrowRight size={32} className="text-slate-300 animate-bounce-x" />
          <span className="font-bold tracking-widest uppercase text-xs">Select options above to begin</span>
        </div>
      )}
    </div>
  );
}
