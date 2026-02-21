import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Building2, LayoutGrid, BookOpen, Users, Download } from 'lucide-react';

export default function ReportsAnalytics() {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/departments`);
      const data = await res.json();
      if (res.ok) setDepartments(data.departments);
    } catch (error) { }
  };

  const fetchClassesAndSubjects = async (dept) => {
    setSelectedDept(dept);
    setSelectedClass(null);
    setSelectedSubject(null);
    setClasses([]);
    setSubjects([]);
    setAttendance([]);

    try {
      const classRes = await fetch(`${API_BASE_URL}/admin/classes?departmentCode=${dept.code}`);
      const classData = await classRes.json();
      if (classRes.ok) setClasses(classData.classes);

      const subjRes = await fetch(`${API_BASE_URL}/admin/subjects?departmentCode=${dept.code}`);
      const subjData = await subjRes.json();
      if (subjRes.ok) setSubjects(subjData.subjects);
    } catch (error) { }
  };

  const selectClass = (cls) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setAttendance([]);
  };

  const fetchSubjectAttendance = async (subj) => {
    setSelectedSubject(subj);
    setAttendance([]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/subject-attendance?classId=${selectedClass.id}&subjectId=${subj.id}`);
      const data = await res.json();
      if (res.ok) setAttendance(data.attendance);
    } catch (error) { } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!attendance || attendance.length === 0) return;

    const headers = ['No.', 'Admission No', 'Student Name', 'Total Classes', 'Attended', 'Percentage'];
    const csvRows = [headers.join(',')];

    attendance.forEach((s, idx) => {
      const row = [
        idx + 1,
        s.admission,
        `"${s.name}"`,
        s.total,
        s.present,
        `${s.percentage}%`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const safeDept = selectedDept?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'dept';
    const safeClass = selectedClass?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'class';
    const safeSubj = selectedSubject?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'subject';

    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeDept}_${safeClass}_${safeSubj}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const classSubjects = selectedClass ? subjects.filter(s => s.semester === selectedClass.semester) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500 mt-1">Drill down through departments, classes, and subjects to view detailed student attendance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 border-r border-slate-200 pr-0 lg:pr-6 space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <Building2 size={18} /> Departments
          </h2>
          <div className="space-y-2">
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => fetchClassesAndSubjects(dept)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${selectedDept?.id === dept.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 border-r border-slate-200 pr-0 lg:pr-6 space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <LayoutGrid size={18} /> Classes
          </h2>
          {!selectedDept ? (
            <p className="text-xs text-slate-400">Select a department first</p>
          ) : classes.length === 0 ? (
            <p className="text-xs text-slate-400">No classes found</p>
          ) : (
            <div className="space-y-2">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => selectClass(cls)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${selectedClass?.id === cls.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                >
                  {cls.name} <span className="text-[10px] text-slate-400 block font-normal text-left">Sem {cls.semester}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 pr-0 lg:pr-6 space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <BookOpen size={18} /> Subjects
          </h2>
          {!selectedClass ? (
            <p className="text-xs text-slate-400">Select a class first</p>
          ) : classSubjects.length === 0 ? (
            <p className="text-xs text-slate-400">No subjects found</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {classSubjects.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => fetchSubjectAttendance(subj)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${selectedSubject?.id === subj.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                >
                  {subj.name} <span className="text-[10px] text-slate-400 block font-normal font-mono text-left">{subj.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 xl:col-span-4 mt-6 border-t border-slate-200 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                <Users size={20} className="text-emerald-600" /> Attendance Report
              </h2>
              {selectedSubject && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:inline-block">{selectedClass.name} &bull; {selectedSubject.name}</span>}
            </div>
            {selectedSubject && attendance.length > 0 && (
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm hover:shadow-md"
              >
                <Download size={16} /> Download CSV
              </button>
            )}
          </div>

          {!selectedSubject ? (
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
              <p className="text-slate-400 font-medium text-sm">Select a department, class, and subject to view the attendance report.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center">No.</th>
                      <th className="px-6 py-4">Admission No</th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4 text-center">Total Classes</th>
                      <th className="px-6 py-4 text-center">Attended</th>
                      <th className="px-6 py-4 text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-600">{s.admission}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">{s.total}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{s.present}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.percentage >= 75 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {s.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No attendance records found for this subject.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
