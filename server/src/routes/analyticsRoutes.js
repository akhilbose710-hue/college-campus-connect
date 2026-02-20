const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const {
    dailyAttendance,
    monthlyAttendance,
    departmentReports,
    studentRiskAlerts
} = require('../controllers/analyticsController');
const router = express.Router();
router.use(authMiddleware);
router.get(
    '/attendance/daily',
    requireRole('SUPER_ADMIN', 'PRINCIPAL', 'HOD'),
    dailyAttendance
);
router.get(
    '/attendance/monthly',
    requireRole('SUPER_ADMIN', 'PRINCIPAL', 'HOD'),
    monthlyAttendance
);
router.get(
    '/departments',
    requireRole('SUPER_ADMIN', 'PRINCIPAL', 'HOD'),
    departmentReports
);
router.get(
    '/students/risk',
    requireRole('SUPER_ADMIN', 'PRINCIPAL', 'HOD', 'STAFF'),
    studentRiskAlerts
);
module.exports = router;
