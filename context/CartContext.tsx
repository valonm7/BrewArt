import { orderService } from '@/services/OrderService';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { GiftCard, useGiftCards } from './GiftCardContext';

// Define types
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: ImageSourcePropType;
  category?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface CartItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface TableInfo {
  tableNumber: string;
  scannedAt: Date;
}

interface CartContextType {
  cartItems: CartItem[];
  tableInfo: TableInfo | null;
  addToCart: (item: MenuItem, quantity?: number, specialInstructions?: string, size?: 'small' | 'medium' | 'large') => void;
  removeFromCart: (itemId: number, size?: 'small' | 'medium' | 'large') => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateSpecialInstructions: (itemId: number, instructions: string) => void;
  clearCart: () => void;
  setTableInfo: (info: TableInfo) => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  activeGiftCard: GiftCard | null;
  setActiveGiftCard: (giftCard: GiftCard | null) => void;
  getDiscountAmount: () => number;
  placeOrder: (customerName?: string, notes?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

// Inner provider that has access to GiftCardContext
const InnerCartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [activeGiftCard, setActiveGiftCard] = useState<GiftCard | null>(null);
  const { markGiftCardAsUsed } = useGiftCards();

  const addToCart = (item: MenuItem, quantity: number = 1, specialInstructions: string = '', size: 'small' | 'medium' | 'large' = 'medium') => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.size === size
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        updatedItems[existingItemIndex].specialInstructions = specialInstructions || 
          updatedItems[existingItemIndex].specialInstructions;
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { ...item, quantity, specialInstructions, size }];
      }
    });
  };

  const removeFromCart = (itemId: number, size?: 'small' | 'medium' | 'large') => {
    if (size) {
      // Remove specific item with matching id and size
      setCartItems(prevItems => prevItems.filter(item => !(item.id === itemId && item.size === size)));
    } else {
      // Remove all items with matching id regardless of size
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(1, quantity) } 
          : item
      )
    );
  };

  const updateSpecialInstructions = (itemId: number, instructions: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, specialInstructions: instructions } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setActiveGiftCard(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    if (!activeGiftCard) return 0;
    
    // Handle percentage discount
    if (activeGiftCard.percentOff) {
      return getSubtotal() * (activeGiftCard.percentOff / 100);
    }
    
    // Handle fixed amount discount (don't discount more than the subtotal)
    return Math.min(activeGiftCard.amount, getSubtotal());
  };

  const getTax = () => {
    const subtotalAfterDiscount = getSubtotal() - getDiscountAmount();
    return subtotalAfterDiscount * 0.08; // 8% tax rate
  };

  const getTotal = () => {
    return getSubtotal() - getDiscountAmount() + getTax();
  };
  
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // New method to place an order using OrderService
  const placeOrder = async (customerName: string = 'Guest', notes?: string): Promise<boolean> => {
    if (cartItems.length === 0) {
      return false;
    }
    
    try {
      // Get total with all calculations (subtotal, discount, tax)
      const total = getTotal();
      const subtotal = getSubtotal();
      const tax = getTax();
      const discount = getDiscountAmount();
      
      // Create order using OrderService
      await orderService.createOrder(
        cartItems, 
        total, 
        tableInfo, 
        customerName,
        notes,
        {
          subtotal,
          tax,
          discount,
          discountSource: activeGiftCard ? 'Gift Card' : undefined,
          paymentMethod: 'Credit Card' // This would ideally come from a payment context
        }
      );
      
      // If using a gift card, mark it as used
      if (activeGiftCard) {
        markGiftCardAsUsed(activeGiftCard.id);
      }
      
      // Clear the cart after successful order placement
      clearCart();
      
      return true;
    } catch (error) {
      console.error('Error placing order:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        tableInfo,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSpecialInstructions,
        clearCart,
        setTableInfo,
        getSubtotal,
        getTax,
        getTotal,
        getItemCount,
        activeGiftCard,
        setActiveGiftCard,
        getDiscountAmount,
        placeOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Wrap the inner provider to ensure GiftCardContext is available
export const CartProvider = ({ children }: CartProviderProps) => {
  return (
    <InnerCartProvider>
      {children}
    </InnerCartProvider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};