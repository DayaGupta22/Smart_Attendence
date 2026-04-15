const Routine = require('../models/Routine');
const Timetable = require('../models/Timetable');
const { sendSuccess, sendError } = require('../utils/response');
const { todayString, getDayName } = require('../utils/dateHelpers');

// GET /api/routine/today — fetch or auto-build today's routine
const getTodayRoutine = async (req, res) => {
  try {
    const date = todayString();
    let routine = await Routine.findOne({ studentId: req.user._id, date }).populate('schedule.linkedGoalId', 'title');
    if (routine) return sendSuccess(res, { routine });

    // Auto-build from timetable
    const dayName = getDayName();
    const timetable = await Timetable.findOne({
      department: req.user.department,
      semester: req.user.semester,
      weekDay: dayName,
      isActive: true,
    });

    const schedule = [];
    if (timetable) {
      timetable.periods.forEach((p) => {
        schedule.push({
          timeSlot: `${p.startTime}-${p.endTime}`,
          type: p.isFree ? 'free' : 'class',
          title: p.isFree ? 'Free Period' : p.subject,
          status: 'pending',
        });
      });
    } else {
      schedule.push({ timeSlot: '09:00-17:00', type: 'custom', title: 'No timetable today', status: 'pending' });
    }

    routine = await Routine.create({ studentId: req.user._id, date, schedule });
    return sendSuccess(res, { routine }, 'Routine generated from timetable');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// PUT /api/routine/today/item/:itemIndex — update status or notes of an item
const updateRoutineItem = async (req, res) => {
  try {
    const date = todayString();
    const routine = await Routine.findOne({ studentId: req.user._id, date });
    if (!routine) return sendError(res, 'Routine not found', 404);

    const idx = Number(req.params.itemIndex);
    if (!routine.schedule[idx]) return sendError(res, 'Item not found', 404);

    const allowed = ['status', 'notes', 'title', 'linkedGoalId'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) routine.schedule[idx][f] = req.body[f]; });

    // Compute productivity score: % of non-class items completed
    const trackable = routine.schedule.filter((s) => s.type !== 'class');
    if (trackable.length > 0) {
      const done = trackable.filter((s) => s.status === 'completed').length;
      routine.productivityScore = Math.round((done / trackable.length) * 100);
    }

    await routine.save();
    return sendSuccess(res, { routine }, 'Routine updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/routine/today/item — add a custom item
const addRoutineItem = async (req, res) => {
  try {
    const date = todayString();
    const routine = await Routine.findOne({ studentId: req.user._id, date });
    if (!routine) return sendError(res, 'Routine not found', 404);

    const { timeSlot, type, title, description, linkedGoalId } = req.body;
    if (!timeSlot || !title) return sendError(res, 'timeSlot and title required', 400);

    routine.schedule.push({ timeSlot, type: type || 'custom', title, description, linkedGoalId });
    await routine.save();
    return sendSuccess(res, { routine }, 'Item added');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/routine/today/reflection
const saveReflection = async (req, res) => {
  try {
    const date = todayString();
    const { reflection } = req.body;
    const routine = await Routine.findOneAndUpdate(
      { studentId: req.user._id, date },
      { reflection },
      { new: true }
    );
    return sendSuccess(res, { routine }, 'Reflection saved');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getTodayRoutine, updateRoutineItem, addRoutineItem, saveReflection };
