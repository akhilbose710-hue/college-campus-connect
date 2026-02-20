const db = require('../models/db');
async function getDailyAttendance({ from, to }) {
    const result = await db.query(
        `SELECT date,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'PRESENT') AS present
       FROM attendance
      WHERE date BETWEEN $1::date AND $2::date
      GROUP BY date
      ORDER BY date`,
        [from, to]
    );
    return result.rows.map((r) => ({
        date: r.date,
        total: Number(r.total),
        present: Number(r.present),
        percentage: r.total ? Number(r.present) / Number(r.total) * 100 : 0
    }));
}
async function getMonthlyAttendance({ year }) {
    const result = await db.query(
        `SELECT date_trunc('month', date) AS month,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'PRESENT') AS present
       FROM attendance
      WHERE EXTRACT(YEAR FROM date) = $1
      GROUP BY month
      ORDER BY month`,
        [year]
    );
    return result.rows.map((r) => ({
        month: r.month,
        total: Number(r.total),
        present: Number(r.present),
        percentage: r.total ? Number(r.present) / Number(r.total) * 100 : 0
    }));
}
async function getDepartmentAttendance({ from, to }) {
    const result = await db.query(
        `SELECT d.id,
            d.name,
            COUNT(a.id) AS total,
            COUNT(a.id) FILTER (WHERE a.status = 'PRESENT') AS present
       FROM departments d
       JOIN students s ON s.department_id = d.id
       JOIN attendance a ON a.student_id = s.id
      WHERE a.date BETWEEN $1::date AND $2::date
      GROUP BY d.id, d.name
      ORDER BY d.name`,
        [from, to]
    );
    return result.rows.map((r) => ({
        departmentId: r.id,
        departmentName: r.name,
        total: Number(r.total),
        present: Number(r.present),
        percentage: r.total ? Number(r.present) / Number(r.total) * 100 : 0
    }));
}
async function getStudentRisk({ from, to, threshold }) {
    const result = await db.query(
        `SELECT s.id,
            s.full_name,
            d.name AS department_name,
            COUNT(a.id) AS total,
            COUNT(a.id) FILTER (WHERE a.status = 'PRESENT') AS present
       FROM students s
       LEFT JOIN departments d ON d.id = s.department_id
       JOIN attendance a ON a.student_id = s.id
      WHERE a.date BETWEEN $1::date AND $2::date
      GROUP BY s.id, s.full_name, d.name
      HAVING COUNT(a.id) > 0
      ORDER BY s.full_name`,
        [from, to]
    );
    return result.rows
        .map((r) => {
            const total = Number(r.total);
            const present = Number(r.present);
            const pct = total ? (present / total) * 100 : 0;
            return {
                studentId: r.id,
                name: r.full_name,
                departmentName: r.department_name,
                total,
                present,
                percentage: pct
            };
        })
        .filter((r) => r.percentage < threshold);
}
module.exports = {
    getDailyAttendance,
    getMonthlyAttendance,
    getDepartmentAttendance,
    getStudentRisk
};
