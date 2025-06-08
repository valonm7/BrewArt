const express = require('express');
const router = express.Router();
const {
  createGiftCard,
  getAllGiftCards,
  getUserGiftCards,
  verifyGiftCard,
  redeemGiftCard,
  useGiftCardBalance,
  sendGiftCard
} = require('../controllers/giftCardController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route
router.post('/verify', verifyGiftCard);

// User routes
router.post('/redeem', protect, redeemGiftCard);
router.post('/use', protect, useGiftCardBalance);
router.get('/user', protect, getUserGiftCards);
router.post('/send', protect, sendGiftCard);

// Admin routes
router.route('/')
  .get(protect, admin, getAllGiftCards)
  .post(protect, admin, createGiftCard);

module.exports = router; 