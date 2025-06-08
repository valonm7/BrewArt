import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { PaymentSelector } from '@/components/PaymentSelector';
import { ThemedText } from '@/components/ThemedText';
import { useCart } from '@/context/CartContext';
import { usePayment } from '@/context/PaymentContext';

export default function CartScreen() {
  const { 
    cartItems, 
    tableInfo, 
    removeFromCart, 
    updateQuantity, 
    updateSpecialInstructions,
    getSubtotal,
    getTax,
    getTotal,
    clearCart,
    placeOrder
  } = useCart();
  const { selectedPaymentMethod } = usePayment();
  const [orderNotes, setOrderNotes] = useState('');
  const [isEditingNote, setIsEditingNote] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState('');

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleEditNote = (itemId: number, currentNote: string = '') => {
    setIsEditingNote(itemId);
    setEditedNote(currentNote);
  };

  const handleSaveNote = (itemId: number) => {
    updateSpecialInstructions(itemId, editedNote);
    setIsEditingNote(null);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method before placing your order.');
      return;
    }

    Alert.alert(
      'Place Order',
      'Your order will be sent to the kitchen. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Place Order', 
          onPress: async () => {
            // Use the placeOrder method which will save the order to be visible in admin dashboard
            const success = await placeOrder('Guest', orderNotes);
            
            if (success) {
              Alert.alert(
                'Order Confirmed!',
                'Your order has been sent to the kitchen. You can check its status in the orders section, and it will be reviewed by our staff immediately.',
                [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      router.push('/(tabs)');
                    }
                  }
                ]
              );
            } else {
              Alert.alert(
                'Error',
                'There was a problem placing your order. Please try again.'
              );
            }
          } 
        }
      ]
    );
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Your Cart',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#F4EDE4',
            },
            headerTintColor: '#3C2A15',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#E6D9CC" />
          <ThemedText style={styles.emptyTitle}>Your cart is empty</ThemedText>
          <ThemedText style={styles.emptyText}>
            Add items from the menu to get started
          </ThemedText>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <ThemedText style={styles.browseButtonText}>Browse Menu</ThemedText>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Your Cart',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F4EDE4',
          },
          headerTintColor: '#3C2A15',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <View style={styles.container}>
        {tableInfo && (
          <View style={styles.tableInfo}>
            <Ionicons name="restaurant-outline" size={16} color="#8E6E53" />
            <ThemedText style={styles.tableInfoText}>Table {tableInfo.tableNumber}</ThemedText>
          </View>
        )}
        
        <ScrollView style={styles.itemsContainer}>
          {cartItems.map((item) => (
            <View key={`${item.id}-${item.size}`} style={styles.cartItem}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.id, item.size)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemDetails}>
                <View style={styles.quantityAndSizeContainer}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Ionicons 
                        name="remove" 
                        size={18} 
                        color={item.quantity > 1 ? '#8E6E53' : '#B5A99A'} 
                      />
                    </TouchableOpacity>
                    <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={18} color="#8E6E53" />
                    </TouchableOpacity>
                  </View>
                  {item.size && (
                    <ThemedText style={styles.sizeNextToQuantity}>
                      {item.size.charAt(0).toUpperCase() + item.size.slice(1)}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={styles.itemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </ThemedText>
              </View>
              
              {isEditingNote === item.id ? (
                <View style={styles.noteEditContainer}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Special instructions..."
                    placeholderTextColor="#B5A99A"
                    value={editedNote}
                    onChangeText={setEditedNote}
                    multiline
                  />
                  <TouchableOpacity 
                    style={styles.saveNoteButton}
                    onPress={() => handleSaveNote(item.id)}
                  >
                    <ThemedText style={styles.saveNoteText}>Save</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.noteContainer}
                  onPress={() => handleEditNote(item.id, item.specialInstructions)}
                >
                  <Ionicons name="create-outline" size={16} color="#8E6E53" style={styles.noteIcon} />
                  <ThemedText style={styles.noteText}>
                    {item.specialInstructions || 'Add special instructions'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <View style={styles.orderNotesContainer}>
            <ThemedText style={styles.orderNotesLabel}>Order Notes</ThemedText>
            <TextInput
              style={styles.orderNotesInput}
              placeholder="Any notes for your entire order?"
              placeholderTextColor="#B5A99A"
              value={orderNotes}
              onChangeText={setOrderNotes}
              multiline
            />
          </View>
          
          <PaymentSelector />
        </ScrollView>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
            <ThemedText style={styles.summaryValue}>{formatCurrency(getSubtotal())}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Tax</ThemedText>
            <ThemedText style={styles.summaryValue}>{formatCurrency(getTax())}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>{formatCurrency(getTotal())}</ThemedText>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.placeOrderButton,
              !selectedPaymentMethod && styles.disabledButton
            ]}
            onPress={handlePlaceOrder}
            disabled={!selectedPaymentMethod}
          >
            <ThemedText style={styles.placeOrderText}>
              {selectedPaymentMethod ? 'Place Order' : 'Select Payment Method'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFCF7',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E6E53',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#8E6E53',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F4EDE4',
    borderBottomWidth: 1,
    borderBottomColor: '#E6D9CC',
  },
  tableInfoText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8E6E53',
  },
  itemsContainer: {
    flex: 1,
    padding: 15,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  removeButton: {
    padding: 5,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityAndSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C2A15',
    paddingHorizontal: 10,
  },
  sizeNextToQuantity: {
    fontSize: 14,
    color: '#8E6E53',
    marginLeft: 10,
    fontWeight: '500',
    backgroundColor: '#F9F5F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2A15',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  noteIcon: {
    marginRight: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#8E6E53',
    fontStyle: 'italic',
  },
  noteEditContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#F4EDE4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#3C2A15',
  },
  saveNoteButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#8E6E53',
    borderRadius: 8,
  },
  saveNoteText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  orderNotesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  orderNotesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 10,
  },
  orderNotesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D9CC',
    padding: 12,
    fontSize: 14,
    color: '#3C2A15',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E6D9CC',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E6E53',
  },
  summaryValue: {
    fontSize: 14,
    color: '#3C2A15',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6D9CC',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  placeOrderButton: {
    backgroundColor: '#8E6E53',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#B5A99A',
  },
}); 