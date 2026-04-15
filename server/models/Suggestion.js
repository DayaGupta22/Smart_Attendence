const mongoose = require('mongoose');

const suggestionItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['academics', 'career', 'wellness', 'skill', 'goal'],
    default: 'academics',
  },
  resourceLinks: [{ type: String }],
  estimatedMinutes: { type: Number, default: 30 },
  priority: { type: Number, default: 1 }, // 1=high, 2=medium, 3=low
});

const suggestionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timetableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable' },
    periodNumber: { type: Number },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    suggestions: [suggestionItemSchema],
    accepted: { type: Boolean, default: false },
    completedItems: [{ type: Number }], // indices of completed suggestions
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Suggestion', suggestionSchema);
