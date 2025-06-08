import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { PaymentMethod, usePayment } from '@/context/PaymentContext';
import { ThemedText } from './ThemedText';

interface PaymentSelectorProps {
  onPaymentChange?: (method: PaymentMethod) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ onPaymentChange }) => {
  const { paymentMethods, selectedPaymentMethod, selectPaymentMethod } = usePayment();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectPayment = (method: PaymentMethod) => {
    selectPaymentMethod(method);
    setModalVisible(false);
    if (onPaymentChange) {
      onPaymentChange(method);
    }
  };

  const handleAddPaymentMethod = () => {
    setModalVisible(false);
    router.push('/payment/add-payment');
  };

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

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Payment Method</ThemedText>
      
      <TouchableOpacity 
        style={styles.selectedMethod}
        onPress={() => setModalVisible(true)}
      >
        {selectedPaymentMethod ? (
          <>
            <View style={styles.paymentIcon}>
              <Ionicons 
                name={getPaymentMethodIcon(
                  selectedPaymentMethod.type, 
                  selectedPaymentMethod.details.brand
                ) as any} 
                size={24} 
                color="#8E6E53" 
              />
            </View>
            <View style={styles.paymentDetails}>
              <ThemedText style={styles.paymentName}>
                {getPaymentMethodName(selectedPaymentMethod)}
              </ThemedText>
              {selectedPaymentMethod.details.expiryDate && (
                <ThemedText style={styles.expiryDate}>
                  Expires {selectedPaymentMethod.details.expiryDate}
                </ThemedText>
              )}
            </View>
          </>
        ) : (
          <ThemedText style={styles.noMethodText}>
            Select Payment Method
          </ThemedText>
        )}
        <Ionicons name="chevron-forward" size={20} color="#8E6E53" />
      </TouchableOpacity>

      {/* Payment Method Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Payment Method</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#8E6E53" />
              </TouchableOpacity>
            </View>

            {paymentMethods.map((method) => (
              <TouchableOpacity 
                key={method.id}
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod?.id === method.id && styles.selectedOption
                ]}
                onPress={() => handleSelectPayment(method)}
              >
                <View style={styles.paymentOptionIcon}>
                  <Ionicons 
                    name={getPaymentMethodIcon(method.type, method.details.brand) as any} 
                    size={24} 
                    color={selectedPaymentMethod?.id === method.id ? "#FFFFFF" : "#8E6E53"} 
                  />
                </View>
                <View style={styles.paymentOptionDetails}>
                  <ThemedText style={[
                    styles.paymentOptionName,
                    selectedPaymentMethod?.id === method.id && styles.selectedOptionText
                  ]}>
                    {getPaymentMethodName(method)}
                  </ThemedText>
                  {method.details.expiryDate && (
                    <ThemedText style={[
                      styles.paymentOptionExpiry,
                      selectedPaymentMethod?.id === method.id && styles.selectedOptionText
                    ]}>
                      Expires {method.details.expiryDate}
                    </ThemedText>
                  )}
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <ThemedText style={styles.defaultText}>Default</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.addPaymentButton}
              onPress={handleAddPaymentMethod}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addPaymentText}>
                Add New Payment Method
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 8,
  },
  selectedMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D9CC',
    padding: 15,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C2A15',
  },
  expiryDate: {
    fontSize: 12,
    color: '#8E6E53',
    marginTop: 4,
  },
  noMethodText: {
    flex: 1,
    fontSize: 16,
    color: '#8E6E53',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EDE4',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  closeButton: {
    padding: 5,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F5F0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#8E6E53',
  },
  paymentOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentOptionDetails: {
    flex: 1,
  },
  paymentOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C2A15',
  },
  paymentOptionExpiry: {
    fontSize: 12,
    color: '#8E6E53',
    marginTop: 4,
  },
  selectedOptionText: {
    color: '#FFFFFF',
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
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8E6E53',
    borderRadius: 25,
    paddingVertical: 15,
    marginTop: 10,
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
}); 