const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// IMPORTANT: Add middleware to check if requester is SUPER_ADMIN (omitted for now for simplicity, but strictly needed in prod)

router.get('/stats', adminController.getStats);
router.post('/users', adminController.createUser);
router.post('/users/bulk', adminController.bulkCreateUsers);
router.post('/promote', adminController.promoteStudents);

module.exports = router;
