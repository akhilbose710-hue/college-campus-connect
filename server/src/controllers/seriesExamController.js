const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

let supabaseAdmin;
if (config.supabase.serviceKey) {
    supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } });
}

const ensureDb = (res) => {
    if (!supabaseAdmin) {
        res.status(503).json({ error: 'Database configuration missing (Service Key)' });
        return false;
    }
    return true;
};

exports.getStaffSubjects = async (req, res, next) => {
    if (!ensureDb(res)) return;
    try {
        const { staffId } = req.query;
        if (!staffId) return res.status(400).json({ error: 'staffId is required' });

        const { data, error } = await supabaseAdmin
            .from('timetables')
            .select('class_id, subject_id, class:classes(name, semester), subject:subjects(name, code)')
            .eq('staff_id', staffId);

        if (error) throw error;

        // Ensure unique class-subject pairs
        const uniqueKeys = new Set();
        const subjects = [];

        (data || []).forEach(item => {
            if (item.class_id && item.subject_id) {
                const key = `${item.class_id}-${item.subject_id}`;
                if (!uniqueKeys.has(key)) {
                    uniqueKeys.add(key);
                    subjects.push({
                        classId: item.class_id,
                        className: item.class?.name,
                        semester: item.class?.semester,
                        subjectId: item.subject_id,
                        subjectName: item.subject?.name,
                        subjectCode: item.subject?.code
                    });
                }
            }
        });

        res.json({ subjects });
    } catch (error) {
        next(error);
    }
};

exports.getClassStudents = async (req, res, next) => {
    if (!ensureDb(res)) return;
    try {
        const { classId } = req.query;
        if (!classId) return res.status(400).json({ error: 'classId is required' });

        const { data, error } = await supabaseAdmin
            .from('students')
            .select('id, user_id, admission_number, users(full_name)')
            .eq('class_id', classId);

        if (error) throw error;

        const formatted = (data || []).map(s => ({
            id: s.id,
            userId: s.user_id,
            admission_number: s.admission_number,
            name: s.users?.full_name || 'N/A'
        }));
        
        // Sort by admission number
        formatted.sort((a,b) => a.admission_number.localeCompare(b.admission_number));

        res.json({ students: formatted });
    } catch (error) {
        next(error);
    }
};

exports.getMarks = async (req, res, next) => {
    if (!ensureDb(res)) return;
    try {
        const { classId, subjectId, examNumber } = req.query;
        if (!classId || !subjectId || !examNumber) {
            return res.status(400).json({ error: 'classId, subjectId, and examNumber are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('series_exam_marks')
            .select('*')
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .eq('series_exam_number', examNumber);

        if (error) throw error;

        res.json({ marks: data || [] });
    } catch (error) {
        next(error);
    }
};

exports.saveMarks = async (req, res, next) => {
    if (!ensureDb(res)) return;
    try {
        const { records } = req.body;
        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty records' });
        }

        // Validate records
        for (const rec of records) {
            if (rec.status === 'PRESENT' && (rec.obtained_mark === undefined || rec.obtained_mark === null)) {
                return res.status(400).json({ error: `Mark missing for a student` });
            }
            if (rec.status === 'ABSENT') {
                rec.obtained_mark = null;
            }
        }

        const { error } = await supabaseAdmin
            .from('series_exam_marks')
            .upsert(records, { onConflict: 'student_id,subject_id,class_id,series_exam_number' });

        if (error) throw error;

        res.json({ message: 'Marks saved successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getStudentMarks = async (req, res, next) => {
    if (!ensureDb(res)) return;
    try {
        const { studentId, examNumber } = req.query;
        if (!studentId || !examNumber) {
            return res.status(400).json({ error: 'studentId and examNumber are required' });
        }

        // Try to fetch student by user_id first
        const { data: studentData, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id')
            .eq('user_id', studentId)
            .single();

        let actualStudentId = studentId;
        if (!studentError && studentData) {
             actualStudentId = studentData.id;
        }

        const { data, error } = await supabaseAdmin
            .from('series_exam_marks')
            .select('*, subject:subjects(name, code)')
            .eq('student_id', actualStudentId)
            .eq('series_exam_number', examNumber);

        if (error) throw error;

        res.json({ marks: data || [] });
    } catch (error) {
        next(error);
    }
};
