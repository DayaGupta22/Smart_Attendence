const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const goalSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['academic', 'career', 'personal', 'skill'],
      default: 'academic',
    },
    deadline: { type: Date },
    milestones: [milestoneSchema],
    progress: { type: Number, default: 0, min: 0, max: 100 }, // percentage
    isActive: { type: Boolean, default: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-calculate progress from milestones
goalSchema.methods.recalculateProgress = function () {
  if (this.milestones.length === 0) return;
  const done = this.milestones.filter((m) => m.isCompleted).length;
  this.progress = Math.round((done / this.milestones.length) * 100);
};

module.exports = mongoose.model('Goal', goalSchema);
