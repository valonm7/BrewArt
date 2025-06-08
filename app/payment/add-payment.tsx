import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { usePayment } from '@/context/PaymentContext';

export default function AddPaymentScreen() {
  const router = useRouter();
  const { addPaymentMethod } = usePayment();

  const [paymentType, setPaymentType] = useState<'credit_card' | 'paypal' | 'cash'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');
  const [makeDefault, setMakeDefault] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const validateCreditCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    
    if (!cardholderName) {
      Alert.alert('Invalid Name', 'Please enter the cardholder name');
      return false;
    }
    
    // Simple MM/YY validation
    if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Alert.alert('Invalid Date', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV code');
      return false;
    }
    
    return true;
  };
  
  const validatePayPal = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleAddPayment = async () => {
    try {
      setIsLoading(true);
      
      if (paymentType === 'credit_card' && !validateCreditCard()) {
        setIsLoading(false);
        return;
      }
      
      if (paymentType === 'paypal' && !validatePayPal()) {
        setIsLoading(false);
        return;
      }
      
      if (paymentType === 'credit_card') {
        const lastFourDigits = cardNumber.replace(/\s/g, '').slice(-4);
        // Detect card brand based on first digit
        const firstDigit = cardNumber.replace(/\s/g, '')[0];
        let brand: 'visa' | 'mastercard' | 'amex' | 'discover' = 'visa';
        
        if (firstDigit === '4') brand = 'visa';
        else if (firstDigit === '5') brand = 'mastercard';
        else if (firstDigit === '3') brand = 'amex';
        else if (firstDigit === '6') brand = 'discover';
        
        await addPaymentMethod({
          type: 'credit_card',
          details: {
            cardNumber: cardNumber.replace(/\s/g, ''),
            cardholderName,
            expiryDate,
            cvv,
            lastFourDigits,
            brand
          }
        });
      } else if (paymentType === 'paypal') {
        await addPaymentMethod({
          type: 'paypal',
          details: {
            email
          }
        });
      } else if (paymentType === 'cash') {
        await addPaymentMethod({
          type: 'cash',
          details: {}
        });
      }
      
      router.back();
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = cleaned.slice(0, 16);
    // Add spaces after every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 4 digits
    const limited = cleaned.slice(0, 4);
    // Add slash after first 2 digits
    if (limited.length > 2) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    
    return limited;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen 
        options={{
          title: 'Add Payment Method',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#3C2A15" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.paymentTypeContainer}>
          <ThemedText style={styles.sectionTitle}>Payment Type</ThemedText>
          
          <View style={styles.paymentTypeButtons}>
            <TouchableOpacity 
              style={[
                styles.paymentTypeButton,
                paymentType === 'credit_card' && styles.activePaymentType
              ]}
              onPress={() => setPaymentType('credit_card')}
            >
              <Ionicons 
                name="card-outline" 
                size={24} 
                color={paymentType === 'credit_card' ? '#FFFFFF' : '#8E6E53'} 
              />
              <ThemedText style={[
                styles.paymentTypeText,
                paymentType === 'credit_card' && styles.activePaymentTypeText
              ]}>
                Card
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentTypeButton,
                paymentType === 'paypal' && styles.activePaymentType
              ]}
              onPress={() => setPaymentType('paypal')}
            >
              <Ionicons 
                name="logo-paypal" 
                size={24} 
                color={paymentType === 'paypal' ? '#FFFFFF' : '#8E6E53'} 
              />
              <ThemedText style={[
                styles.paymentTypeText,
                paymentType === 'paypal' && styles.activePaymentTypeText
              ]}>
                PayPal
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentTypeButton,
                paymentType === 'cash' && styles.activePaymentType
              ]}
              onPress={() => setPaymentType('cash')}
            >
              <Ionicons 
                name="cash-outline" 
                size={24} 
                color={paymentType === 'cash' ? '#FFFFFF' : '#8E6E53'} 
              />
              <ThemedText style={[
                styles.paymentTypeText,
                paymentType === 'cash' && styles.activePaymentTypeText
              ]}>
                Cash
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        {paymentType === 'credit_card' && (
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Card Details</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Card Number</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#B5A99A"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19} // 16 digits + 3 spaces
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Cardholder Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#B5A99A"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <ThemedText style={styles.inputLabel}>Expiry Date</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#B5A99A"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5} // MM/YY
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>CVV</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#B5A99A"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}
        
        {paymentType === 'paypal' && (
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>PayPal Details</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#B5A99A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        )}
        
        {paymentType === 'cash' && (
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Cash Payment</ThemedText>
            <ThemedText style={styles.cashDescription}>
              Pay with cash when you pick up your order at the café counter.
            </ThemedText>
          </View>
        )}
        
        <View style={styles.switchContainer}>
          <ThemedText style={styles.switchLabel}>Make Default Payment Method</ThemedText>
          <Switch
            value={makeDefault}
            onValueChange={setMakeDefault}
            trackColor={{ false: '#E6D9CC', true: '#8E6E53' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleAddPayment}
          disabled={isLoading}
        >
          <ThemedText style={styles.saveButtonText}>
            {isLoading ? 'Adding...' : 'Add Payment Method'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  paymentTypeContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 15,
  },
  paymentTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4EDE4',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
  },
  activePaymentType: {
    backgroundColor: '#8E6E53',
  },
  paymentTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E6E53',
    marginTop: 8,
  },
  activePaymentTypeText: {
    color: '#FFFFFF',
  },
  formSection: {
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6D9CC',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#3C2A15',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  switchLabel: {
    fontSize: 16,
    color: '#3C2A15',
  },
  saveButton: {
    backgroundColor: '#8E6E53',
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cashDescription: {
    fontSize: 16,
    color: '#8E6E53',
    lineHeight: 24,
    padding: 15,
    backgroundColor: '#F4EDE4',
    borderRadius: 10,
  },
}); 