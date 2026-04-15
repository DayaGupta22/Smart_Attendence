const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "10:00"
  subject: { type: String, default: '' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  roomNo: { type: String, default: '' },
  isFree: { type: Boolean, default: false },
});

const timetableSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    section: { type: String, default: 'A' },
    weekDay: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    academicYear: { type: String, required: true }, // e.g. "2025-26"
    periods: [periodSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate timetable entries
timetableSchema.index(
  { department: 1, semester: 1, section: 1, weekDay: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
