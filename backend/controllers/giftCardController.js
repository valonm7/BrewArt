const GiftCard = require('../models/GiftCard');
const User = require('../models/User');

// Generate a random gift card code
const generateGiftCardCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3 || i === 7) code += '-';
  }
  return code;
};

// @desc    Create a new gift card
// @route   POST /api/giftcards
// @access  Private/Admin
const createGiftCard = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid amount' });
    }
    
    // Generate unique code
    let code = generateGiftCardCode();
    let codeExists = await GiftCard.findOne({ code });
    
    // Ensure code is unique
    while (codeExists) {
      code = generateGiftCardCode();
      codeExists = await GiftCard.findOne({ code });
    }
    
    const giftCard = await GiftCard.create({
      code,
      amount,
      balanceRemaining: amount,
      createdBy: req.user._id
    });
    
    res.status(201).json(giftCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all gift cards
// @route   GET /api/giftcards
// @access  Private/Admin
const getAllGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find({})
      .populate('createdBy', 'name email')
      .populate('redeemedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(giftCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get gift cards for current user
// @route   GET /api/giftcards/user
// @access  Private
const getUserGiftCards = async (req, res) => {
  try {
    // Find gift cards where user is either the creator or the recipient
    const giftCards = await GiftCard.find({
      $or: [
        { createdBy: req.user._id },
        { redeemedBy: req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('redeemedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(giftCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify a gift card (check if valid)
// @route   POST /api/giftcards/verify
// @access  Public
const verifyGiftCard = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Please provide a gift card code' });
    }
    
    const giftCard = await GiftCard.findOne({ code });
    
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found', isValid: false });
    }
    
    if (!giftCard.isActive) {
      return res.status(400).json({ message: 'Gift card is inactive', isValid: false });
    }
    
    if (giftCard.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Gift card has expired', isValid: false });
    }
    
    if (giftCard.balanceRemaining <= 0) {
      return res.status(400).json({ message: 'Gift card has no remaining balance', isValid: false });
    }
    
    res.json({ 
      isValid: true, 
      amount: giftCard.balanceRemaining,
      expiresAt: giftCard.expiresAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Redeem a gift card
// @route   POST /api/giftcards/redeem
// @access  Private
const redeemGiftCard = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Please provide a gift card code' });
    }
    
    const giftCard = await GiftCard.findOne({ code });
    
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }
    
    if (!giftCard.isActive) {
      return res.status(400).json({ message: 'Gift card is inactive' });
    }
    
    if (giftCard.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Gift card has expired' });
    }
    
    if (giftCard.balanceRemaining <= 0) {
      return res.status(400).json({ message: 'Gift card has no remaining balance' });
    }
    
    // If the gift card hasn't been redeemed by anyone yet, assign it to this user
    if (!giftCard.redeemedBy) {
      giftCard.redeemedBy = req.user._id;
      giftCard.redemptionDate = new Date();
    } 
    // If it's already been redeemed by someone else, don't allow
    else if (giftCard.redeemedBy.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'This gift card has already been redeemed by another user' });
    }
    
    res.json({
      message: 'Gift card redeemed successfully',
      giftCard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Use gift card balance
// @route   POST /api/giftcards/use
// @access  Private
const useGiftCardBalance = async (req, res) => {
  try {
    const { code, amount } = req.body;
    
    if (!code || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid code and amount' });
    }
    
    const giftCard = await GiftCard.findOne({ code, redeemedBy: req.user._id });
    
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found or not redeemed by you' });
    }
    
    if (!giftCard.isActive) {
      return res.status(400).json({ message: 'Gift card is inactive' });
    }
    
    if (giftCard.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Gift card has expired' });
    }
    
    if (giftCard.balanceRemaining < amount) {
      return res.status(400).json({ 
        message: 'Insufficient gift card balance',
        availableBalance: giftCard.balanceRemaining
      });
    }
    
    // Reduce the balance
    giftCard.balanceRemaining -= amount;
    
    // If balance is now zero, mark as inactive
    if (giftCard.balanceRemaining === 0) {
      giftCard.isActive = false;
    }
    
    await giftCard.save();
    
    res.json({
      message: 'Gift card balance used successfully',
      amountUsed: amount,
      remainingBalance: giftCard.balanceRemaining,
      giftCard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a gift card to another user
// @route   POST /api/giftcards/send
// @access  Private
const sendGiftCard = async (req, res) => {
  try {
    const { amount, recipientEmail, recipientName, message, type = 'regular' } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid amount' });
    }
    
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Please provide a recipient email' });
    }
    
    // Find recipient by email
    const recipient = await User.findOne({ email: recipientEmail });
    
    // Generate unique code
    let code = generateGiftCardCode();
    let codeExists = await GiftCard.findOne({ code });
    
    // Ensure code is unique
    while (codeExists) {
      code = generateGiftCardCode();
      codeExists = await GiftCard.findOne({ code });
    }
    
    // Create gift card
    const giftCard = await GiftCard.create({
      code,
      amount,
      balanceRemaining: amount,
      isActive: true,
      createdBy: req.user._id,
      redeemedBy: recipient ? recipient._id : null,
      message,
      type
    });
    
    // If we found a recipient, populate the user fields for the response
    const populatedGiftCard = await GiftCard.findById(giftCard._id)
      .populate('createdBy', 'name email')
      .populate('redeemedBy', 'name email');
    
    res.status(201).json(populatedGiftCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGiftCard,
  getAllGiftCards,
  getUserGiftCards,
  verifyGiftCard,
  redeemGiftCard,
  useGiftCardBalance,
  sendGiftCard
}; 