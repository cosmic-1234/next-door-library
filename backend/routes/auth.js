const express = require('express');
const router = express.Router();
const { register, login, getMe, sendOtp } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
