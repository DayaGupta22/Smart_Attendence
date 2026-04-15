const express = require('express');
const router = express.Router();
const { getTodayRoutine, updateRoutineItem, addRoutineItem, saveReflection } = require('../controllers/routineController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

router.use(protect, roleGuard('student'));
router.get('/today', getTodayRoutine);
router.put('/today/item/:itemIndex', updateRoutineItem);
router.post('/today/item', addRoutineItem);
router.post('/today/reflection', saveReflection);

module.exports = router;
