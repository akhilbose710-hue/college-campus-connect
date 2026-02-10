import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle2,
    Save,
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Search,
    Check,
    X,
    AlertCircle,
    LayoutGrid,
    ChevronRight,
    History,
    Camera,
    StopCircle
} from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';

export default function MarkAttendance() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [schedule, setSchedule] = useState([]);
    const [activeSlot, setActiveSlot] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSheet, setLoadingSheet] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [classEmbeddings, setClassEmbeddings] = useState([]);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    useEffect(() => {
        fetchTeacherSchedule();
    }, [user]);

    useEffect(() => {
        if (activeSlot) {
            fetchAttendanceSheet();
        } else {
            setStudents([]);
        }
    }, [activeSlot, date]);

    const fetchTeacherSchedule = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/admin/staff-dashboard-data?staffId=${user.id}`);
            if (!res.ok) throw new Error('Failed to fetch schedule');
            const result = await res.json();
            setSchedule(result.timetable || []);
            const paramClass = searchParams.get('classId');
            const paramPeriod = searchParams.get('period');
            if (paramClass && paramPeriod) {
                const initialSlot = (result.timetable || []).find(s =>
                    s.class_id === paramClass && s.period === parseInt(paramPeriod)
                );
                if (initialSlot) setActiveSlot(initialSlot);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceSheet = async () => {
        try {
            setLoadingSheet(true);
            const res = await fetch(`${API_BASE_URL}/admin/attendance-sheet?classId=${activeSlot.class_id}&date=${date}&period=${activeSlot.period}`);
            if (!res.ok) throw new Error('Failed to fetch attendance sheet');
            const data = await res.json();
            setStudents(data.students.map(s => ({ ...s, status: s.status || null })));
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoadingSheet(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
    };

    const markAll = (status) => {
        setStudents(prev => prev.map(s => ({ ...s, status })));
    };

    const handleSave = async () => {
        if (!activeSlot) return;
        try {
            setSaving(true);
            const records = students.filter(s => s.status).map(s => ({
                student_id: s.id,
                class_id: activeSlot.class_id,
                subject_id: activeSlot.subject_id,
                period: activeSlot.period,
                date: date,
                status: s.status,
                marked_by: user.id
            }));
            const res = await fetch(`${API_BASE_URL}/admin/mark-attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ records })
            });
            if (!res.ok) throw new Error('Failed to save attendance');
            setMessage({ type: 'success', text: 'Attendance records updated successfully!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const dayIdx = (new Date(date).getDay() + 6) % 7;
    const sessionsToday = schedule.filter(s => s.day_of_week === dayIdx).sort((a, b) => a.period - b.period);
    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admission?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all text-sm font-bold group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Control Center
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Attendance Ledger</h1>
                        <p className="text-sm text-slate-500 font-semibold tracking-tight">Record or modify student attendance across sessions</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3 px-3">
                        <Calendar size={18} className="text-primary-600" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setActiveSlot(null);
                            }}
                            className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 outline-none focus:ring-0 w-36 cursor-pointer"
                        />
                    </div>
                    <div className="h-8 w-px bg-slate-100 hidden sm:block" />
                    <div className="flex items-center gap-2 px-3">
                        <History size={18} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past Entry</span>
                    </div>
                </div>
            </div>
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border-2 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-red-50 text-red-700 border-red-100/50'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <p className="text-sm font-black tracking-tight">{message.text}</p>
                </div>
            )}

            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Available Sessions for {new Date(date).toLocaleDateString(undefined, { weekday: 'long' })}</h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{sessionsToday.length} Teaching Hours</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sessionsToday.map(slot => (
                        <button
                            key={`${slot.class_id}-${slot.period}`}
                            onClick={() => setActiveSlot(slot)}
                            className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${activeSlot?.id === slot.id
                                ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-200 scale-[1.02]'
                                : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-lg'
                                }`}
                        >
                            <div className={`absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all ${activeSlot?.id === slot.id ? 'opacity-100' : ''}`}>
                                <ChevronRight size={16} />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black ${activeSlot?.id === slot.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    P{slot.period}
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest ${activeSlot?.id === slot.id ? 'text-white/80' : 'text-slate-400'
                                    }`}>
                                    {slot.subject?.code}
                                </div>
                            </div>
                            <div className="text-xs font-black leading-tight mb-2 line-clamp-1">{slot.subject?.name}</div>
                            <div className="flex items-center gap-1.5">
                                <LayoutGrid size={12} className={activeSlot?.id === slot.id ? 'text-white/50' : 'text-slate-300'} />
                                <span className={`text-[10px] font-bold uppercase tracking-tight ${activeSlot?.id === slot.id ? 'text-white/90' : 'text-slate-500'
                                    }`}>{slot.class?.name}</span>
                            </div>
                        </button>
                    ))}
                    {sessionsToday.length === 0 && (
                        <div className="col-span-full py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <Clock size={40} className="text-slate-300 mb-3" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No assigned teaching hours for this day</p>
                        </div>
                    )}
                </div>
            </section>

            {activeSlot && (
                <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-100 animate-in slide-in-from-bottom-6 duration-500">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                {activeSlot.subject?.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Users size={14} className="text-primary-500" /> {students.length} Registered Students</span>
                                <span className="flex items-center gap-2"><Clock size={14} className="text-primary-500" /> Session: Period {activeSlot.period}</span>
                                <span className="flex items-center gap-2"><LayoutGrid size={14} className="text-primary-500" /> {activeSlot.class?.name}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:w-80">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="Seach by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3.5 text-sm font-bold border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-500 transition-all placeholder:text-slate-300"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowCamera(true)}
                                    className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-5 py-4 rounded-2xl border-2 border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all shadow-sm shadow-indigo-50 flex items-center gap-2"
                                >
                                    <Camera size={16} />
                                    AI Mark
                                </button>
                                <button
                                    onClick={() => markAll('PRESENT')}
                                    className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-5 py-4 rounded-2xl border-2 border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all shadow-sm shadow-emerald-50"
                                >
                                    Mark All PR
                                </button>
                                <button
                                    onClick={() => markAll('ABSENT')}
                                    className="flex-1 sm:flex-none text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-5 py-4 rounded-2xl border-2 border-red-100 hover:bg-red-100 active:scale-95 transition-all shadow-sm shadow-red-50"
                                >
                                    Mark All AB
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        {loadingSheet && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-primary-600" />
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20">No.</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student, idx) => (
                                        <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6">
                                                <span className="text-xs font-black text-slate-300 group-hover:text-slate-900 transition-all">{(idx + 1).toString().padStart(2, '0')}</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-primary-600 font-black text-sm border-2 border-white shadow-inner">
                                                        {student.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 group-hover:text-primary-700 transition-colors">{student.name}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-all">{student.admission}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                        className={`flex h-12 w-20 items-center justify-center rounded-2xl transition-all shadow-sm border-2 ${student.status === 'PRESENT'
                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-100 scale-105'
                                                            : 'bg-white border-slate-100 text-slate-300 hover:border-emerald-200 hover:text-emerald-500 hover:bg-emerald-50/30'
                                                            }`}
                                                    >
                                                        {student.status === 'PRESENT' ? <Check size={22} strokeWidth={4} /> : <span className="text-[10px] font-black uppercase tracking-widest">PR</span>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                        className={`flex h-12 w-20 items-center justify-center rounded-2xl transition-all shadow-sm border-2 ${student.status === 'ABSENT'
                                                            ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-100 scale-105'
                                                            : 'bg-white border-slate-100 text-slate-300 hover:border-red-200 hover:text-red-500 hover:bg-red-50/30'
                                                            }`}
                                                    >
                                                        {student.status === 'ABSENT' ? <X size={22} strokeWidth={4} /> : <span className="text-[10px] font-black uppercase tracking-widest">AB</span>}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredStudents.length === 0 && !loadingSheet && (
                            <div className="p-20 text-center">
                                <Users size={64} className="mx-auto mb-6 text-slate-100" />
                                <p className="font-black text-slate-400 uppercase tracking-widest text-sm italic">No students identified in this registry</p>
                            </div>
                        )}
                    </div>
                    <div className="p-8 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-800">
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">{students.filter(s => s.status === 'PRESENT').length} Present</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                                <span className="text-[10px] font-black text-red-100 uppercase tracking-widest">{students.filter(s => s.status === 'ABSENT').length} Absent</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || students.length === 0}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-primary-50 hover:text-primary-700 active:scale-95 transition-all disabled:opacity-20 group"
                        >
                            {saving ? <div className="h-4 w-4 animate-spin border-4 border-slate-900/20 border-t-slate-900 rounded-full" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                            {saving ? 'Transmitting...' : 'Commit Records'}
                        </button>
                    </div>
                </section>
            )
            }
            {
                !activeSlot && !loading && (
                    <div className="text-center py-24 animate-in fade-in zoom-in duration-500">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 mb-6 border-b-4 border-slate-200">
                            <LayoutGrid size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase">Ready to Ledger</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto mb-8">Select a teaching hour from the grid above to begin recording</p>
                    </div>
                )
            }
            {
                showCamera && (
                    <VideoAttendanceModal
                        classId={activeSlot?.class_id}
                        onClose={() => setShowCamera(false)}
                        students={students}
                        onMatch={(studentId) => handleStatusChange(studentId, 'PRESENT')}
                        onScanComplete={(matchedIds, registeredIds) => {
                            setStudents(prev => prev.map(s => {
                                if (!registeredIds.includes(s.id)) return s;
                                if (matchedIds.includes(s.id)) return { ...s, status: 'PRESENT' };
                                return { ...s, status: 'ABSENT' };
                            }));
                            setShowCamera(false);
                        }}
                    />
                )
            }
        </div >
    );
}

function VideoAttendanceModal({ classId, onClose, students, onMatch, onScanComplete }) {
    const [loading, setLoading] = useState(true);
    const [labeledDescriptors, setLabeledDescriptors] = useState([]);
    const webcamRef = React.useRef(null);
    const [detectedName, setDetectedName] = useState('');
    const matchedIdsRef = React.useRef(new Set());

    // Fix: Add isMounted ref to avoid memory leak and error state updates
    const isMounted = React.useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        const init = async () => {
            const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
            ]);

            if (!isMounted.current) return;

            const res = await fetch(`${API_BASE_URL}/admin/class-embeddings?classId=${classId}`);
            const { embeddings } = await res.json();

            if (isMounted.current && embeddings.length > 0) {
                const descriptors = embeddings.map(e =>
                    new faceapi.LabeledFaceDescriptors(e.student_id, [new Float32Array(e.embedding)])
                );
                setLabeledDescriptors(descriptors);
            }
            if (isMounted.current) setLoading(false);
        };
        init();
    }, [classId]);

    // Ref for tracking detection consistency to prevent false positives
    const detectionStatsRef = React.useRef({});

    // Fix: Replaced setInterval with recursive setTimeout to prevent race conditions in TFJS backend
    useEffect(() => {
        if (loading || labeledDescriptors.length === 0) return;

        let timeoutId;
        const CONFIRMATION_THRESHOLD = 5; // Require 5 consistent detections
        const MATCH_THRESHOLD = 0.45; // Stricter threshold (lower is stricter)

        const scan = async () => {
            if (!isMounted.current) return;

            try {
                if (webcamRef.current?.video?.readyState === 4) {
                    const video = webcamRef.current.video;
                    // Check video dimensions to avoid "n2 is undefined" error in backend
                    if (video.videoWidth > 0 && video.videoHeight > 0) {
                        // Use slightly higher score threshold for detector to reduce noise
                        const detections = await faceapi.detectAllFaces(
                            video,
                            new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
                        ).withFaceLandmarks().withFaceDescriptors();

                        if (isMounted.current && detections.length > 0) {
                            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, MATCH_THRESHOLD);

                            detections.forEach(d => {
                                const match = faceMatcher.findBestMatch(d.descriptor);
                                if (match.label !== 'unknown') {
                                    // Update detection stats
                                    const currentStats = detectionStatsRef.current[match.label] || { count: 0, lastSeen: 0 };
                                    const now = Date.now();

                                    // Reset count if not seen for a while (e.g., 2 seconds) to ensure consecutive-ish detection
                                    if (now - currentStats.lastSeen > 2000) {
                                        currentStats.count = 0;
                                    }

                                    currentStats.count += 1;
                                    currentStats.lastSeen = now;
                                    detectionStatsRef.current[match.label] = currentStats;

                                    // Only Confirm if threshold reached
                                    if (currentStats.count >= CONFIRMATION_THRESHOLD) {
                                        const student = students.find(s => s.id === match.label);
                                        if (student) {
                                            setDetectedName(student.name);
                                            if (!matchedIdsRef.current.has(match.label)) {
                                                matchedIdsRef.current.add(match.label);
                                                onMatch(match.label);
                                            }
                                            // Clear name display after delay
                                            setTimeout(() => {
                                                if (isMounted.current) setDetectedName('');
                                            }, 2000);
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Face scan error", err);
            } finally {
                if (isMounted.current) {
                    timeoutId = setTimeout(scan, 100); // 100ms delay for smoother tracking
                }
            }
        };

        scan();
        return () => clearTimeout(timeoutId);
    }, [loading, labeledDescriptors, students, onMatch]);

    const handleFinish = () => {
        const registeredIds = labeledDescriptors.map(d => d.label);
        const matchedIds = Array.from(matchedIdsRef.current);
        onScanComplete(matchedIds, registeredIds);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-3xl max-w-2xl w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-900">AI Attendance Scanner</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            <div className="text-center">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto mb-4" />
                                <p className="font-bold">Loading Models & Data...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                videoConstraints={{ facingMode: "environment" }}
                            />
                            {detectedName && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                    Marked: {detectedName}
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                                Live Scanning
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleFinish}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        <StopCircle size={18} />
                        Finish Scanning
                    </button>
                </div>
            </div>
        </div>
    );
}