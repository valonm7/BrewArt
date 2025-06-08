import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { sendGiftCard as apiSendGiftCard, createGiftCard, getUserGiftCards, redeemGiftCard, verifyGiftCard } from '../services/giftCardService';
import { useAuth } from './AuthContext';

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balanceRemaining: number;
  isActive: boolean;
  expiresAt: string;
  expiryDate?: string; // Alias for expiresAt used in UI
  createdBy?: {
    name?: string;
    email?: string;
    _id?: string;
  };
  redeemedBy?: {
    name?: string;
    email?: string;
    _id?: string;
  };
  from?: string; // Sender name
  to?: string; // Recipient name
  redemptionDate?: string;
  createdAt: string;
  updatedAt: string;
  type?: 'birthday' | 'points' | 'regular';
  message?: string;
  used?: boolean; // Whether the gift card has been used
}

interface GiftCardContextType {
  giftCards: GiftCard[];
  loading: boolean;
  addGiftCard: (card: Omit<GiftCard, 'id' | 'createdAt'>) => Promise<void>;
  markGiftCardAsUsed: (id: string) => Promise<void>;
  checkForBirthdayGiftCard: () => Promise<boolean>;
  checkForPointsGiftCard: () => Promise<boolean>;
  getActiveGiftCards: () => GiftCard[];
  verifyGiftCardCode: (code: string) => Promise<{isValid: boolean, amount?: number}>;
  redeemGiftCardCode: (code: string) => Promise<boolean>;
  refreshGiftCards: () => Promise<void>;
  getSentGiftCards: () => GiftCard[];
  getReceivedGiftCards: () => GiftCard[];
  sendGiftCard: (recipientEmail: string, recipientName: string, card: Partial<GiftCard>) => Promise<boolean>;
}

const GiftCardContext = createContext<GiftCardContextType | null>(null);

interface GiftCardProviderProps {
  children: ReactNode;
}

export const GiftCardProvider = ({ children }: GiftCardProviderProps) => {
  const { user, updatePoints } = useAuth();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Load gift cards on mount
  useEffect(() => {
    loadGiftCards();
  }, [user?.email]);
  
  // Check for special gift cards when user changes
  useEffect(() => {
    if (user) {
      checkForBirthdayGiftCard();
      checkForPointsGiftCard();
    }
  }, [user]);

  const loadGiftCards = async () => {
    if (!user) {
      setGiftCards([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // First try to get gift cards from API
      try {
        const response = await getUserGiftCards();
        
        if (response.success && response.giftCards) {
          setGiftCards(response.giftCards);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('API error getting gift cards, falling back to local storage:', error);
      }
      
      // Fallback to local storage if API fails
      const giftCardsString = await AsyncStorage.getItem(`giftCards_${user.email}`);
      if (giftCardsString) {
        const loadedCards = JSON.parse(giftCardsString);
        setGiftCards(loadedCards);
      } else {
        // For development - provide sample data when no gift cards are found
        const sampleCards: GiftCard[] = [
          {
            id: '1',
            code: 'SAMPLE-CARD-123',
            amount: 25,
            balanceRemaining: 25,
            isActive: true,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'regular',
            message: 'Sample gift card for testing',
            from: 'BrewArt Coffee',
            to: user.name,
            used: false
          },
          {
            id: '2',
            code: 'BIRTHDAY-2024',
            amount: 10,
            balanceRemaining: 10,
            isActive: true,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'birthday',
            message: 'Happy Birthday! Enjoy a treat on us.',
            from: 'BrewArt Coffee',
            to: user.name,
            used: false
          }
        ];
        setGiftCards(sampleCards);
        // Save sample cards to local storage for next time
        await saveGiftCardsLocally(sampleCards);
      }
    } catch (error) {
      console.error('Error loading gift cards', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshGiftCards = async () => {
    await loadGiftCards();
  };

  const saveGiftCardsLocally = async (cards: GiftCard[]) => {
    if (!user?.email) return;
    
    try {
      await AsyncStorage.setItem(`giftCards_${user.email}`, JSON.stringify(cards));
    } catch (error) {
      console.error('Error saving gift cards', error);
    }
  };

  const addGiftCard = async (card: Omit<GiftCard, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Try to create gift card via API first
      const response = await createGiftCard({
        amount: card.amount,
        message: card.message || ''
      });
      
      if (response.success && response.giftCard) {
        // Refresh gift cards list from server
        await refreshGiftCards();
        return;
      }
      
      // Fallback to local storage if API fails
      const newCard: GiftCard = {
        ...card,
        id: Date.now().toString(),
        code: generateRandomCode(),
        balanceRemaining: card.amount,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedCards = [...giftCards, newCard];
      setGiftCards(updatedCards);
      await saveGiftCardsLocally(updatedCards);
    } catch (error) {
      console.error('Error adding gift card', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3 || i === 7) code += '-';
    }
    return code;
  };

  const markGiftCardAsUsed = async (id: string) => {
    try {
      setLoading(true);
      
      // API call to use gift card balance will be implemented here
      // For now we're updating locally
      
      const updatedCards = giftCards.map(card => 
        card.id === id 
          ? { 
              ...card, 
              balanceRemaining: 0,
              isActive: false,
              used: true
            } 
          : card
      );
      
      setGiftCards(updatedCards);
      await saveGiftCardsLocally(updatedCards);
    } catch (error) {
      console.error('Error marking gift card as used', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if it's the user's birthday and create a gift card if needed
  const checkForBirthdayGiftCard = async () => {
    if (!user?.birthday) return false;
    
    const today = new Date();
    const userBirthday = new Date(user.birthday);
    
    // Check if today is the user's birthday (month and day match)
    const isBirthday = 
      today.getMonth() === userBirthday.getMonth() && 
      today.getDate() === userBirthday.getDate();
    
    if (isBirthday) {
      // Check if we already gave a birthday gift card this year
      const thisYear = today.getFullYear();
      const alreadyGaveBirthdayGiftCard = giftCards.some(card => 
        card.type === 'birthday' && 
        new Date(card.createdAt).getFullYear() === thisYear
      );
      
      if (!alreadyGaveBirthdayGiftCard) {
        // Create a new birthday gift card
        await addGiftCard({
          type: 'birthday',
          amount: 10, // $10 discount
          balanceRemaining: 10,
          code: generateRandomCode(),
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          message: 'Happy Birthday! Enjoy a treat on us.'
        });
        
        return true;
      }
    }
    
    return false;
  };

  // Check if user has enough points for a gift card
  const checkForPointsGiftCard = async () => {
    if (!user) return false;
    
    const pointsThreshold = 200; // Points needed for a gift card
    
    if (user.points >= pointsThreshold) {
      // Create a points-based gift card
      await addGiftCard({
        type: 'points',
        amount: 15, // $15 discount
        balanceRemaining: 15,
        code: generateRandomCode(),
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        message: 'Your loyalty points have been converted to this gift card.'
      });
      
      // Deduct points used for the gift card
      await updatePoints(-pointsThreshold);
      
      return true;
    }
    
    return false;
  };

  // Get active (non-expired, non-used) gift cards
  const getActiveGiftCards = () => {
    const now = new Date();
    return giftCards.filter(card => 
      card.isActive && card.balanceRemaining > 0 && new Date(card.expiresAt) > now
    );
  };
  
  // Get gift cards sent to others
  const getSentGiftCards = () => {
    return giftCards
      .filter(card => card.createdBy?.email === user?.email)
      .map(card => ({
        ...card,
        from: user?.name,
        to: card.redeemedBy?.name,
        expiryDate: card.expiresAt,
        used: !card.isActive || card.balanceRemaining <= 0
      }));
  };
  
  // Get gift cards received from others
  const getReceivedGiftCards = () => {
    return giftCards
      .filter(card => card.redeemedBy?.email === user?.email || 
        !card.createdBy || // Cards created by the system
        card.createdBy?.email !== user?.email) // Not created by current user
      .map(card => ({
        ...card,
        from: card.createdBy?.name || 'BrewArt Coffee',
        to: user?.name,
        expiryDate: card.expiresAt,
        used: !card.isActive || card.balanceRemaining <= 0
      }));
  };
  
  // Send a gift card to another user
  const sendGiftCard = async (recipientEmail: string, recipientName: string, card: Partial<GiftCard>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Send gift card via API
      const response = await apiSendGiftCard({
        recipientEmail,
        recipientName,
        amount: card.amount || 0,
        message: card.message || '',
        type: card.type || 'regular'
      });
      
      if (response.success && response.giftCard) {
        // Refresh gift cards to include the newly sent card
        await refreshGiftCards();
        return true;
      }
      
      // Fallback to local storage if API fails
      const expiryDate = card.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      
      // Create a new gift card with recipient info
      const newCard: GiftCard = {
        id: Date.now().toString(),
        code: generateRandomCode(),
        amount: card.amount || 0,
        balanceRemaining: card.amount || 0,
        isActive: true,
        expiresAt: expiryDate,
        expiryDate: expiryDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: card.type || 'regular',
        message: card.message || '',
        used: false,
        createdBy: { 
          email: user.email,
          name: user.name 
        },
        redeemedBy: { 
          email: recipientEmail,
          name: recipientName 
        },
        from: user.name,
        to: recipientName
      };
      
      // Add to the gift cards array
      const updatedCards = [...giftCards, newCard];
      setGiftCards(updatedCards);
      await saveGiftCardsLocally(updatedCards);
      
      return true;
    } catch (error) {
      console.error('Error sending gift card', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Verify a gift card code
  const verifyGiftCardCode = async (code: string) => {
    try {
      const response = await verifyGiftCard(code);
      
      if (response.success) {
        return {
          isValid: response.isValid,
          amount: response.amount
        };
      }
      
      // Fallback to local check if API fails
      const card = giftCards.find(c => c.code === code);
      if (card && card.isActive && card.balanceRemaining > 0 && new Date(card.expiresAt) > new Date()) {
        return { isValid: true, amount: card.balanceRemaining };
      }
      
      return { isValid: false };
    } catch (error) {
      console.error('Error verifying gift card', error);
      return { isValid: false };
    }
  };
  
  // Redeem a gift card code
  const redeemGiftCardCode = async (code: string) => {
    if (!user) return false;
    
    try {
      const response = await redeemGiftCard(code);
      
      if (response.success) {
        // Refresh gift cards after redemption
        await refreshGiftCards();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error redeeming gift card', error);
      return false;
    }
  };

  // Final return of provider
  return (
    <GiftCardContext.Provider 
      value={{
        giftCards,
        loading,
        addGiftCard,
        markGiftCardAsUsed,
        checkForBirthdayGiftCard,
        checkForPointsGiftCard,
        getActiveGiftCards,
        verifyGiftCardCode,
        redeemGiftCardCode,
        refreshGiftCards,
        getSentGiftCards,
        getReceivedGiftCards,
        sendGiftCard
      }}
    >
      {children}
    </GiftCardContext.Provider>
  );
};

export const useGiftCards = () => {
  const context = useContext(GiftCardContext);
  if (!context) {
    throw new Error('useGiftCards must be used within a GiftCardProvider');
  }
  return context;
}; 