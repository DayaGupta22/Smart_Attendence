const express = require('express');
const router = express.Router();
const {
  generateQR, markByQR, markByFace,
  getLiveAttendance, getStudentAttendance, getReport, markManual,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

router.post('/qr-generate', protect, roleGuard('teacher', 'admin'), generateQR);
router.post('/qr-scan', protect, roleGuard('student'), markByQR);
router.post('/face-verify', protect, roleGuard('student'), markByFace);
router.post('/manual', protect, roleGuard('teacher', 'admin'), markManual);
router.get('/today/:timetableId/:periodNumber', protect, roleGuard('teacher', 'admin'), getLiveAttendance);
router.get('/student/:id', protect, getStudentAttendance);
router.get('/report', protect, roleGuard('teacher', 'admin'), getReport);

module.exports = router;
