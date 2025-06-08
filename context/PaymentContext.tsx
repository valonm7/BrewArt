import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash';
  details: {
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
    cvv?: string;
    lastFourDigits?: string;
    brand?: 'visa' | 'mastercard' | 'amex' | 'discover';
    email?: string;
  };
  isDefault: boolean;
}

interface PaymentContextType {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id' | 'isDefault'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  selectPaymentMethod: (paymentMethod: PaymentMethod | null) => void;
}

const PaymentContext = createContext<PaymentContextType | null>(null);

interface PaymentProviderProps {
  children: ReactNode;
}

// Sample payment methods for demo
const samplePaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit_card',
    details: {
      lastFourDigits: '4242',
      brand: 'visa',
      cardholderName: 'John Doe',
      expiryDate: '09/25'
    },
    isDefault: true
  },
  {
    id: '2',
    type: 'credit_card',
    details: {
      lastFourDigits: '5678',
      brand: 'mastercard',
      cardholderName: 'John Doe',
      expiryDate: '12/24'
    },
    isDefault: false
  },
  {
    id: '3',
    type: 'paypal',
    details: {
      email: 'john.doe@example.com'
    },
    isDefault: false
  }
];

export const PaymentProvider = ({ children }: PaymentProviderProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Load payment methods on initialization
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const savedPaymentMethods = await AsyncStorage.getItem('paymentMethods');
        if (savedPaymentMethods) {
          const methods = JSON.parse(savedPaymentMethods) as PaymentMethod[];
          setPaymentMethods(methods);
          
          // Set the default payment method as selected
          const defaultMethod = methods.find(method => method.isDefault);
          if (defaultMethod) {
            setSelectedPaymentMethod(defaultMethod);
          } else if (methods.length > 0) {
            setSelectedPaymentMethod(methods[0]);
          }
        } else {
          // Use sample data for demo
          setPaymentMethods(samplePaymentMethods);
          setSelectedPaymentMethod(samplePaymentMethods[0]);
          await AsyncStorage.setItem('paymentMethods', JSON.stringify(samplePaymentMethods));
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
        // Fallback to sample data
        setPaymentMethods(samplePaymentMethods);
        setSelectedPaymentMethod(samplePaymentMethods[0]);
      }
    };

    loadPaymentMethods();
  }, []);

  const savePaymentMethods = async (methods: PaymentMethod[]) => {
    try {
      await AsyncStorage.setItem('paymentMethods', JSON.stringify(methods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
    }
  };

  const addPaymentMethod = async (newMethod: Omit<PaymentMethod, 'id' | 'isDefault'>) => {
    const newPaymentMethod: PaymentMethod = {
      ...newMethod,
      id: Date.now().toString(),
      isDefault: paymentMethods.length === 0 // Make it default if it's the first one
    };

    const updatedMethods = [...paymentMethods, newPaymentMethod];
    setPaymentMethods(updatedMethods);
    
    // If it's the first or set as default, select it
    if (newPaymentMethod.isDefault) {
      setSelectedPaymentMethod(newPaymentMethod);
    }

    await savePaymentMethods(updatedMethods);
  };

  const removePaymentMethod = async (id: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== id);
    
    // If the removed method was the selected one, select another one
    if (selectedPaymentMethod && selectedPaymentMethod.id === id) {
      const defaultMethod = updatedMethods.find(method => method.isDefault);
      setSelectedPaymentMethod(defaultMethod || updatedMethods[0] || null);
    }
    
    // If the removed method was the default and we have other methods, make the first one default
    if (updatedMethods.length > 0 && paymentMethods.find(m => m.id === id)?.isDefault) {
      updatedMethods[0].isDefault = true;
    }
    
    setPaymentMethods(updatedMethods);
    await savePaymentMethods(updatedMethods);
  };

  const setDefaultPaymentMethod = async (id: string) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    
    setPaymentMethods(updatedMethods);
    
    // Also select this payment method
    const newDefaultMethod = updatedMethods.find(method => method.id === id) || null;
    setSelectedPaymentMethod(newDefaultMethod);
    
    await savePaymentMethods(updatedMethods);
  };

  const selectPaymentMethod = (paymentMethod: PaymentMethod | null) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentMethods,
        selectedPaymentMethod,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        selectPaymentMethod
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 