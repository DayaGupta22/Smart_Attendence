const Suggestion = require('../models/Suggestion');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const { generateSuggestions } = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/response');
const { todayString, getDayName } = require('../utils/dateHelpers');

// GET /api/suggestions/today — fetch or generate today's suggestions for free periods
const getTodaySuggestions = async (req, res) => {
  try {
    const date = todayString();
    const existing = await Suggestion.find({ studentId: req.user._id, date });
    if (existing.length > 0) return sendSuccess(res, { suggestions: existing });

    // No suggestions yet — generate them
    const dayName = getDayName();
    const timetable = await Timetable.findOne({
      department: req.user.department,
      semester: req.user.semester,
      weekDay: dayName,
      isActive: true,
    });

    if (!timetable) return sendSuccess(res, { suggestions: [] }, 'No timetable for today');

    const freePeriods = timetable.periods.filter((p) => p.isFree);
    if (freePeriods.length === 0) return sendSuccess(res, { suggestions: [] }, 'No free periods today');

    const student = await User.findById(req.user._id);
    const created = [];

    for (const period of freePeriods) {
      const [sh, sm] = period.startTime.split(':').map(Number);
      const [eh, em] = period.endTime.split(':').map(Number);
      const duration = (eh * 60 + em) - (sh * 60 + sm);

      const items = await generateSuggestions({ student, freePeriodDuration: duration, date });

      const doc = await Suggestion.create({
        studentId: req.user._id,
        timetableId: timetable._id,
        periodNumber: period.periodNumber,
        date,
        suggestions: items,
      });
      created.push(doc);
    }

    return sendSuccess(res, { suggestions: created }, 'Suggestions generated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/suggestions/generate — manually trigger suggestion for a specific period
const generateForPeriod = async (req, res) => {
  try {
    const { timetableId, periodNumber } = req.body;
    const date = todayString();

    const timetable = await Timetable.findById(timetableId);
    const period = timetable?.periods.find((p) => p.periodNumber === periodNumber);
    if (!period) return sendError(res, 'Period not found', 404);

    const [sh, sm] = period.startTime.split(':').map(Number);
    const [eh, em] = period.endTime.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);

    const student = await User.findById(req.user._id);
    const items = await generateSuggestions({ student, freePeriodDuration: duration, date });

    const doc = await Suggestion.findOneAndUpdate(
      { studentId: req.user._id, timetableId, periodNumber, date },
      { suggestions: items },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { suggestion: doc }, 'Suggestions generated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/suggestions/feedback — student rates a suggestion
const submitFeedback = async (req, res) => {
  try {
    const { suggestionId, rating, comment, completedItems } = req.body;
    const doc = await Suggestion.findOneAndUpdate(
      { _id: suggestionId, studentId: req.user._id },
      { feedback: { rating, comment }, completedItems: completedItems || [], accepted: true },
      { new: true }
    );
    if (!doc) return sendError(res, 'Suggestion not found', 404);
    return sendSuccess(res, { suggestion: doc }, 'Feedback saved');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { getTodaySuggestions, generateForPeriod, submitFeedback };
