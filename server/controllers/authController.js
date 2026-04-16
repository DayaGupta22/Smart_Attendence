const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      name, email, password, role, department, semester,
      rollNumber, employeeId, interests, strengths, careerGoals, weakSubjects,
    } = req.body;

    if (!name || !email || !password || !department) {
      return sendError(res, 'name, email, password, department are required', 400);
    }

    const exists = await User.findOne({ email });
    if (exists) return sendError(res, 'Email already registered', 409);

    const user = await User.create({
      name, email,
      passwordHash: password, // pre-save hook hashes it
      role: role || 'student',
      department,
      semester,
      rollNumber,
      employeeId,
      interests: interests || [],
      strengths: strengths || [],
      careerGoals: careerGoals || [],
      weakSubjects: weakSubjects || [],
    });

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    return sendSuccess(res, { accessToken, refreshToken, user: user.toSafeObject() }, 'Registered successfully', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) return sendError(res, 'Email and password required', 400);

    const user = await User.findOne({ email });
    
    if (!user || !user.isActive) return sendError(res, 'Invalid credentials', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid credentials', 401);

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    
    const refreshToken = generateRefreshToken({ id: user._id });
    console.log(refreshToken)
    return sendSuccess(res, { accessToken, refreshToken, user: user.toSafeObject() }, 'Login successful');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 400);

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) return sendError(res, 'User not found', 401);

    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
    return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (err) {
    return sendError(res, 'Invalid refresh token', 401);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
};

// POST /api/auth/face-register
const registerFace = async (req, res) => {
  try {
    const { descriptors } = req.body; // Array of float arrays from face-api.js
    if (!descriptors || !Array.isArray(descriptors)) {
      return sendError(res, 'descriptors array required', 400);
    }

    await User.findByIdAndUpdate(req.user._id, { faceDescriptors: descriptors });
    return sendSuccess(res, {}, 'Face registered successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'interests', 'strengths', 'careerGoals', 'weakSubjects', 'bluetoothId', 'profilePhoto'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash -faceDescriptors');
    return sendSuccess(res, { user }, 'Profile updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = { register, login, refresh, getMe, registerFace, updateProfile };
