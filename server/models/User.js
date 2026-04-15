const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    profilePhoto: { type: String, default: '' },
    // Face recognition descriptors (array of Float32Array serialized as plain arrays)
    faceDescriptors: { type: [[Number]], default: [] },
    // Bluetooth beacon ID for proximity attendance
    bluetoothId: { type: String, default: '' },
    department: { type: String, required: true },
    semester: { type: Number, min: 1, max: 8 }, // students only
    rollNumber: { type: String }, // students only
    employeeId: { type: String }, // teachers/admins only
    // Personalization for AI suggestions
    interests: [{ type: String }],
    strengths: [{ type: String }],
    weakSubjects: [{ type: String }],
    careerGoals: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.faceDescriptors;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
