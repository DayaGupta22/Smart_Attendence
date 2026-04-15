const Goal = require('../models/Goal');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ studentId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    return sendSuccess(res, { goals });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, description, category, deadline, milestones } = req.body;
    if (!title) return sendError(res, 'Title required', 400);

    const goal = await Goal.create({
      studentId: req.user._id,
      title, description, category,
      deadline: deadline ? new Date(deadline) : undefined,
      milestones: milestones || [],
    });

    return sendSuccess(res, { goal }, 'Goal created', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!goal) return sendError(res, 'Goal not found', 404);

    const allowed = ['title', 'description', 'category', 'deadline', 'milestones', 'isActive'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) goal[f] = req.body[f]; });

    goal.recalculateProgress();
    if (goal.progress === 100) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    await goal.save();
    return sendSuccess(res, { goal }, 'Goal updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// PATCH /api/goals/:id/milestone/:milestoneIndex — toggle milestone
const toggleMilestone = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!goal) return sendError(res, 'Goal not found', 404);

    const idx = Number(req.params.milestoneIndex);
    if (!goal.milestones[idx]) return sendError(res, 'Milestone not found', 404);

    goal.milestones[idx].isCompleted = !goal.milestones[idx].isCompleted;
    goal.milestones[idx].completedAt = goal.milestones[idx].isCompleted ? new Date() : null;
    goal.recalculateProgress();

    await goal.save();
    return sendSuccess(res, { goal }, 'Milestone updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// DELETE /api/goals/:id — soft delete
const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndUpdate({ _id: req.params.id, studentId: req.user._id }, { isActive: false });
    return sendSuccess(res, {}, 'Goal removed');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getGoals, createGoal, updateGoal, toggleMilestone, deleteGoal };
