const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal, toggleMilestone, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

router.use(protect, roleGuard('student'));
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.patch('/:id/milestone/:milestoneIndex', toggleMilestone);
router.delete('/:id', deleteGoal);

module.exports = router;
