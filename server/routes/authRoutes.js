const express = require('express');
const router = express.Router();
const { register, login, refresh, getMe, registerFace, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/face-register', protect, registerFace);
router.put('/profile', protect, updateProfile);

module.exports = router;
