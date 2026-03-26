const express = require('express');
const router = express.Router();
const seriesExamController = require('../controllers/seriesExamController');

router.get('/staff-subjects', seriesExamController.getStaffSubjects);
router.get('/students', seriesExamController.getClassStudents);
router.get('/marks', seriesExamController.getMarks);
router.post('/marks', seriesExamController.saveMarks);
router.get('/student-marks', seriesExamController.getStudentMarks);

module.exports = router;
