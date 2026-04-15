const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const { generateQRSession, validateQRToken } = require('../services/qrService');
const { sendSuccess, sendError } = require('../utils/response');
const { todayString } = require('../utils/dateHelpers');

// POST /api/attendance/qr-generate — teacher generates QR for a period
const generateQR = async (req, res) => {
  try {
    const { timetableId, periodNumber } = req.body;
    if (!timetableId || !periodNumber) {
      return sendError(res, 'timetableId and periodNumber required', 400);
    }

    const session = await generateQRSession({
      timetableId,
      periodNumber,
      teacherId: req.user._id,
    });

    // Emit to classroom socket room
    const io = req.app.get('io');
    io.to(`classroom-${timetableId}-${periodNumber}`).emit('qr:generated', {
      token: session.token,
      qrDataURL: session.qrDataURL,
      expiresAt: session.expiresAt,
    });

    return sendSuccess(res, session, 'QR generated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/attendance/qr-scan — student scans QR to mark attendance
const markByQR = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 'QR token required', 400);

    const session = validateQRToken(token);
    if (!session) return sendError(res, 'Invalid or expired QR code', 400);

    const timetable = await Timetable.findById(session.timetableId);
    if (!timetable) return sendError(res, 'Timetable not found', 404);

    const period = timetable.periods.find((p) => p.periodNumber === session.periodNumber);
    if (!period) return sendError(res, 'Period not found', 404);

    const date = todayString();
    const existing = await Attendance.findOne({
      studentId: req.user._id,
      timetableId: session.timetableId,
      periodNumber: session.periodNumber,
      date,
    });
    if (existing) return sendError(res, 'Attendance already marked', 409);

    const attendance = await Attendance.create({
      studentId: req.user._id,
      timetableId: session.timetableId,
      periodNumber: session.periodNumber,
      subject: period.subject,
      date,
      method: 'qr',
      qrToken: token,
    });

    // Broadcast real-time update to classroom screen
    const io = req.app.get('io');
    io.to(`classroom-${session.timetableId}-${session.periodNumber}`).emit('attendance:marked', {
      studentId: req.user._id,
      studentName: req.user.name,
      method: 'qr',
      markedAt: attendance.markedAt,
    });

    return sendSuccess(res, { attendance }, 'Attendance marked successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/attendance/face-verify — mark via face recognition
const markByFace = async (req, res) => {
  try {
    const { timetableId, periodNumber, descriptor } = req.body;
    if (!timetableId || !periodNumber || !descriptor) {
      return sendError(res, 'timetableId, periodNumber, descriptor required', 400);
    }

    // Fetch user with face descriptors for server-side cross-validation
    const user = await User.findById(req.user._id);
    if (!user.faceDescriptors || user.faceDescriptors.length === 0) {
      return sendError(res, 'No face registered. Please register your face first.', 400);
    }

    // Euclidean distance check (simplified — face-api.js does detailed matching client-side)
    const euclidean = (a, b) => Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
    const THRESHOLD = 0.6;
    const isMatch = user.faceDescriptors.some(
      (stored) => euclidean(stored, descriptor) < THRESHOLD
    );

    if (!isMatch) return sendError(res, 'Face verification failed', 401);

    const timetable = await Timetable.findById(timetableId);
    const period = timetable?.periods.find((p) => p.periodNumber === periodNumber);
    if (!period) return sendError(res, 'Period not found', 404);

    const date = todayString();
    const existing = await Attendance.findOne({ studentId: req.user._id, timetableId, periodNumber, date });
    if (existing) return sendError(res, 'Attendance already marked', 409);

    const attendance = await Attendance.create({
      studentId: req.user._id,
      timetableId,
      periodNumber,
      subject: period.subject,
      date,
      method: 'face',
    });

    const io = req.app.get('io');
    io.to(`classroom-${timetableId}-${periodNumber}`).emit('attendance:marked', {
      studentId: req.user._id,
      studentName: req.user.name,
      method: 'face',
      markedAt: attendance.markedAt,
    });

    return sendSuccess(res, { attendance }, 'Attendance marked via face recognition');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/attendance/today/:timetableId/:periodNumber — live class attendance
const getLiveAttendance = async (req, res) => {
  try {
    const { timetableId, periodNumber } = req.params;
    const date = todayString();

    const records = await Attendance.find({
      timetableId,
      periodNumber: Number(periodNumber),
      date,
    }).populate('studentId', 'name rollNumber');

    const timetable = await Timetable.findById(timetableId);
    const allStudents = await User.find({
      department: timetable.department,
      semester: timetable.semester,
      role: 'student',
      isActive: true,
    }).select('name rollNumber _id');

    const presentIds = new Set(records.map((r) => String(r.studentId._id)));
    const summary = allStudents.map((s) => ({
      studentId: s._id,
      name: s.name,
      rollNumber: s.rollNumber,
      isPresent: presentIds.has(String(s._id)),
      method: records.find((r) => String(r.studentId._id) === String(s._id))?.method || null,
    }));

    return sendSuccess(res, {
      summary,
      presentCount: records.length,
      totalCount: allStudents.length,
      date,
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/attendance/student/:id — student's attendance history
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id === 'me' ? req.user._id : req.params.id;
    const { from, to, subject } = req.query;

    const filter = { studentId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    if (subject) filter.subject = subject;

    const records = await Attendance.find(filter).sort({ date: -1 });

    // Compute percentage per subject
    const subjectMap = {};
    records.forEach((r) => {
      if (!subjectMap[r.subject]) subjectMap[r.subject] = { present: 0, total: 0 };
      subjectMap[r.subject].total++;
      if (r.isPresent) subjectMap[r.subject].present++;
    });

    const subjectStats = Object.entries(subjectMap).map(([sub, s]) => ({
      subject: sub,
      present: s.present,
      total: s.total,
      percentage: Math.round((s.present / s.total) * 100),
    }));

    return sendSuccess(res, { records, subjectStats });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/attendance/report — admin/teacher level report
const getReport = async (req, res) => {
  try {
    const { department, semester, subject, from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    if (subject) filter.subject = subject;

    // Filter by department/semester via timetable
    if (department || semester) {
      const timetables = await Timetable.find({
        ...(department && { department }),
        ...(semester && { semester: Number(semester) }),
      }).select('_id');
      filter.timetableId = { $in: timetables.map((t) => t._id) };
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'name rollNumber department semester')
      .sort({ date: -1 });

    return sendSuccess(res, { records, total: records.length });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/attendance/manual — teacher manually marks absent/present
const markManual = async (req, res) => {
  try {
    const { studentId, timetableId, periodNumber, date, isPresent } = req.body;

    const timetable = await Timetable.findById(timetableId);
    const period = timetable?.periods.find((p) => p.periodNumber === periodNumber);
    if (!period) return sendError(res, 'Period not found', 404);

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, timetableId, periodNumber, date },
      { isPresent, method: 'manual', verifiedBy: req.user._id },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { attendance }, 'Attendance updated manually');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { generateQR, markByQR, markByFace, getLiveAttendance, getStudentAttendance, getReport, markManual };
