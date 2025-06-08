const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  createGuestUser,
  getUserProfile,
  updateUserProfile,
  updateUserPoints
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/guest', createGuestUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/points', protect, updateUserPoints);

module.exports = router; 