const express = require('express');
const router = express.Router();
const {
  registerUser,
  sendRegistrationOtp,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  createClub
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/create-club', protect, admin, createClub);

module.exports = router;
