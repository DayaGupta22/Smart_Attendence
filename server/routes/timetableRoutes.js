const express = require('express');
const router = express.Router();
const {
  getTimetable, getTodaySchedule, getFreePeriods, createTimetable, deleteTimetable,
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

router.get('/', protect, getTimetable);
router.get('/today', protect, getTodaySchedule);
router.get('/free-periods', protect, roleGuard('student'), getFreePeriods);
router.post('/', protect, roleGuard('admin', 'teacher'), createTimetable);
router.delete('/:id', protect, roleGuard('admin'), deleteTimetable);

module.exports = router;
