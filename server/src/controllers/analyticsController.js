const createError = require('http-errors');
const {
    getDailyAttendance,
    getMonthlyAttendance,
    getDepartmentAttendance,
    getStudentRisk
} = require('../services/analyticsService');
function parseDate(value, name) {
    if (!value) throw createError(400, `${name} is required`);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) throw createError(400, `Invalid ${name}`);
    return value;
}
async function dailyAttendance(req, res, next) {
    try {
        const from = parseDate(req.query.from, 'from');
        const to = parseDate(req.query.to, 'to');
        const data = await getDailyAttendance({ from, to });
        if (req.query.format === 'csv') {
            const header = 'date,total,present,percentage\n';
            const rows = data
                .map((r) => `${r.date.toISOString().slice(0, 10)},${r.total},${r.present},${r.percentage.toFixed(2)}`)
                .join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="daily-attendance.csv"');
            return res.send(header + rows);
        }
        return res.json({ data });
    } catch (err) {
        return next(err);
    }
}
async function monthlyAttendance(req, res, next) {
    try {
        const year = Number.parseInt(req.query.year, 10);
        if (!year) throw createError(400, 'year is required');
        const data = await getMonthlyAttendance({ year });
        return res.json({ data });
    } catch (err) {
        return next(err);
    }
}
async function departmentReports(req, res, next) {
    try {
        const from = parseDate(req.query.from, 'from');
        const to = parseDate(req.query.to, 'to');
        const data = await getDepartmentAttendance({ from, to });
        if (req.query.format === 'csv') {
            const header = 'department,total,present,percentage\n';
            const rows = data
                .map((r) => `${r.departmentName},${r.total},${r.present},${r.percentage.toFixed(2)}`)
                .join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="department-attendance.csv"');
            return res.send(header + rows);
        }
        return res.json({ data });
    } catch (err) {
        return next(err);
    }
}
async function studentRiskAlerts(req, res, next) {
    try {
        const from = parseDate(req.query.from, 'from');
        const to = parseDate(req.query.to, 'to');
        const threshold = Number.parseFloat(req.query.threshold || '75');
        const data = await getStudentRisk({ from, to, threshold });
        if (req.query.format === 'csv') {
            const header = 'student,department,total,present,percentage\n';
            const rows = data
                .map(
                    (r) =>
                        `${r.name},${r.departmentName || ''},${r.total},${r.present},${r.percentage.toFixed(2)}`
                )
                .join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="student-risk.csv"');
            return res.send(header + rows);
        }
        return res.json({ data });
    } catch (err) {
        return next(err);
    }
}
module.exports = {
    dailyAttendance,
    monthlyAttendance,
    departmentReports,
    studentRiskAlerts
};
