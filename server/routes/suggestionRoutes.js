const express = require('express');
const router = express.Router();
const { getTodaySuggestions, generateForPeriod, submitFeedback } = require('../controllers/suggestionController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

router.get('/today', protect, roleGuard('student'), getTodaySuggestions);
router.post('/generate', protect, roleGuard('student'), generateForPeriod);
router.post('/feedback', protect, roleGuard('student'), submitFeedback);

module.exports = router;
