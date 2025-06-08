import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { PaymentMethod, usePayment } from '@/context/PaymentContext';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { paymentMethods, removePaymentMethod, setDefaultPaymentMethod } = usePayment();

  const getPaymentMethodIcon = (type: PaymentMethod['type'], brand?: PaymentMethod['details']['brand']) => {
    switch (type) {
      case 'credit_card':
        if (brand === 'visa') return 'card-outline';
        if (brand === 'mastercard') return 'card-outline';
        if (brand === 'amex') return 'card-outline';
        if (brand === 'discover') return 'card-outline';
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'apple_pay':
        return 'logo-apple';
      case 'google_pay':
        return 'logo-google';
      case 'cash':
        return 'cash-outline';
      default:
        return 'card-outline';
    }
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method.type) {
      case 'credit_card':
        return `${method.details.brand?.toUpperCase() || 'Card'} •••• ${method.details.lastFourDigits}`;
      case 'paypal':
        return `PayPal (${method.details.email})`;
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      case 'cash':
        return 'Cash';
      default:
        return 'Unknown Payment Method';
    }
  };

  const handleAddPaymentMethod = () => {
    router.push('/payment/add-payment');
  };

  const handleMakeDefault = (id: string) => {
    setDefaultPaymentMethod(id);
    Alert.alert('Default Updated', 'Your default payment method has been updated.');
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            await removePaymentMethod(id);
            Alert.alert('Removed', 'Your payment method has been removed.');
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Payment Methods',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#3C2A15" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content}>
        <ThemedText style={styles.description}>
          Manage your payment methods for faster checkout.
        </ThemedText>
        
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={60} color="#E6D9CC" />
            <ThemedText style={styles.emptyText}>
              No payment methods added yet
            </ThemedText>
          </View>
        ) : (
          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentMethod}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodLeft}>
                    <View style={styles.methodIconContainer}>
                      <Ionicons 
                        name={getPaymentMethodIcon(method.type, method.details.brand) as any} 
                        size={24} 
                        color="#8E6E53" 
                      />
                    </View>
                    <View>
                      <ThemedText style={styles.methodName}>
                        {getPaymentMethodName(method)}
                      </ThemedText>
                      {method.details.expiryDate && (
                        <ThemedText style={styles.methodExpiry}>
                          Expires {method.details.expiryDate}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <ThemedText style={styles.defaultText}>Default</ThemedText>
                    </View>
                  )}
                </View>
                
                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity 
                      style={styles.methodAction}
                      onPress={() => handleMakeDefault(method.id)}
                    >
                      <Ionicons name="star-outline" size={16} color="#8E6E53" />
                      <ThemedText style={styles.methodActionText}>
                        Make Default
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.methodAction, styles.removeAction]}
                    onPress={() => handleRemove(method.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                    <ThemedText style={styles.removeActionText}>
                      Remove
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Add Payment Method</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
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
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#8E6E53',
    marginBottom: 20,
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E6E53',
    marginTop: 16,
  },
  methodsContainer: {
    marginBottom: 20,
  },
  paymentMethod: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C2A15',
  },
  methodExpiry: {
    fontSize: 14,
    color: '#8E6E53',
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: '#51CF66',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  methodActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F4EDE4',
    paddingTop: 12,
  },
  methodAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  methodActionText: {
    fontSize: 14,
    color: '#8E6E53',
    marginLeft: 6,
  },
  removeAction: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  removeActionText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 6,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E6D9CC',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8E6E53',
    borderRadius: 25,
    paddingVertical: 15,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 