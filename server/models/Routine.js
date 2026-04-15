const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  timeSlot: { type: String, required: true }, // e.g. "09:00-10:00"
  type: {
    type: String,
    enum: ['class', 'free', 'goal', 'break', 'custom'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
    default: 'pending',
  },
  linkedGoalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null,
  },
  notes: { type: String, default: '' },
});

const routineSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    schedule: [scheduleItemSchema],
    productivityScore: { type: Number, default: 0 }, // computed at end of day
    reflection: { type: String, default: '' },
  },
  { timestamps: true }
);

routineSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Routine', routineSchema);
