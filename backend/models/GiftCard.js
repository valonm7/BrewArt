const mongoose = require('mongoose');

const giftCardSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceRemaining: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default to 1 year from creation
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      return expiry;
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redemptionDate: {
    type: Date
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['regular', 'birthday', 'points'],
    default: 'regular'
  }
}, {
  timestamps: true
});

const GiftCard = mongoose.model('GiftCard', giftCardSchema);

module.exports = GiftCard; 