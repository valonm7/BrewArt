import { apiRequest } from './api';

// Get all gift cards (admin only)
export const getAllGiftCards = async () => {
  try {
    const response = await apiRequest('/giftcards', 'GET', null, true);
    return { success: true, giftCards: response };
  } catch (error) {
    console.error('Failed to fetch gift cards:', error.message);
    return { success: false, message: error.message };
  }
};

// Create a new gift card (admin only)
export const createGiftCard = async (giftCardData) => {
  try {
    const response = await apiRequest('/giftcards', 'POST', giftCardData, true);
    return { success: true, giftCard: response };
  } catch (error) {
    console.error('Failed to create gift card:', error.message);
    return { success: false, message: error.message };
  }
};

// Redeem a gift card (apply to user's account)
export const redeemGiftCard = async (code) => {
  try {
    const response = await apiRequest('/giftcards/redeem', 'POST', { code }, true);
    return { success: true, result: response };
  } catch (error) {
    console.error('Failed to redeem gift card:', error.message);
    return { success: false, message: error.message };
  }
};

// Verify a gift card (check if valid without redeeming)
export const verifyGiftCard = async (code) => {
  try {
    const response = await apiRequest('/giftcards/verify', 'POST', { code });
    return { success: true, isValid: response.isValid, amount: response.amount };
  } catch (error) {
    console.error('Failed to verify gift card:', error.message);
    return { success: false, message: error.message };
  }
};

// Get gift cards associated with the current user
export const getUserGiftCards = async () => {
  try {
    const response = await apiRequest('/giftcards/user', 'GET', null, true);
    return { success: true, giftCards: response };
  } catch (error) {
    console.error('Failed to fetch user gift cards:', error.message);
    return { success: false, message: error.message };
  }
};

// Send a gift card to another user
export const sendGiftCard = async (giftCardData) => {
  try {
    const response = await apiRequest('/giftcards/send', 'POST', giftCardData, true);
    return { success: true, giftCard: response };
  } catch (error) {
    console.error('Failed to send gift card:', error.message);
    return { success: false, message: error.message };
  }
}; 