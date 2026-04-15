const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Timetable',
      required: true,
    },
    periodNumber: { type: Number, required: true },
    subject: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    method: {
      type: String,
      enum: ['qr', 'face', 'ble', 'wifi', 'manual'],
      required: true,
    },
    isPresent: { type: Boolean, default: true },
    markedAt: { type: Date, default: Date.now },
    qrToken: { type: String, default: '' }, // token used for QR verification
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    }, // teacher who manually verified
    locationMeta: {
      lat: Number,
      lng: Number,
      bleBeaconId: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student + period + date
attendanceSchema.index(
  { studentId: 1, timetableId: 1, periodNumber: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
