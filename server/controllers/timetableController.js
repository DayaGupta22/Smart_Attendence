const Timetable = require('../models/Timetable');
const { sendSuccess, sendError } = require('../utils/response');
const { todayString, getDayName } = require('../utils/dateHelpers');

// GET /api/timetable — query: department, semester, section, academicYear
const getTimetable = async (req, res) => {
  try {
    const { department, semester, section, academicYear } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);
    if (section) filter.section = section;
    if (academicYear) filter.academicYear = academicYear;
    filter.isActive = true;

    const timetables = await Timetable.find(filter).populate('periods.teacherId', 'name email');
    return sendSuccess(res, { timetables });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/timetable/today — student's schedule for today
const getTodaySchedule = async (req, res) => {
  try {
    const user = req.user;
    const dayName = getDayName();

    const timetable = await Timetable.findOne({
      department: user.department,
      semester: user.semester,
      weekDay: dayName,
      isActive: true,
    }).populate('periods.teacherId', 'name email');

    if (!timetable) {
      return sendSuccess(res, { schedule: [], dayName, date: todayString() }, 'No schedule for today');
    }

    return sendSuccess(res, { schedule: timetable.periods, dayName, date: todayString(), timetableId: timetable._id });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/timetable/free-periods — free periods for today
const getFreePeriods = async (req, res) => {
  try {
    const user = req.user;
    const dayName = getDayName();

    const timetable = await Timetable.findOne({
      department: user.department,
      semester: user.semester,
      weekDay: dayName,
      isActive: true,
    });

    if (!timetable) return sendSuccess(res, { freePeriods: [] });

    const freePeriods = timetable.periods.filter((p) => p.isFree);
    return sendSuccess(res, { freePeriods, timetableId: timetable._id });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/timetable — admin creates/replaces a timetable entry
const createTimetable = async (req, res) => {
  try {
    const { department, semester, section, weekDay, academicYear, periods } = req.body;
    if (!department || !semester || !weekDay || !academicYear || !periods) {
      return sendError(res, 'department, semester, weekDay, academicYear, periods are required', 400);
    }

    const timetable = await Timetable.findOneAndUpdate(
      { department, semester, section: section || 'A', weekDay, academicYear },
      { periods, isActive: true },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { timetable }, 'Timetable saved', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// DELETE /api/timetable/:id — soft delete
const deleteTimetable = async (req, res) => {
  try {
    await Timetable.findByIdAndUpdate(req.params.id, { isActive: false });
    return sendSuccess(res, {}, 'Timetable deactivated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getTimetable, getTodaySchedule, getFreePeriods, createTimetable, deleteTimetable };
