import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MenuItem, useCart } from '@/context/CartContext';

// Sample menu categories and items
const menuCategories = [
  { id: 'coffee', name: 'Coffee', icon: 'cafe-outline' as const },
  { id: 'tea', name: 'Tea', icon: 'leaf-outline' as const },
  { id: 'pastries', name: 'Pastries', icon: 'nutrition-outline' as const },
  { id: 'breakfast', name: 'Breakfast', icon: 'sunny-outline' as const },
  { id: 'lunch', name: 'Lunch', icon: 'restaurant-outline' as const },
];

const menuItems: { [key: string]: MenuItem[] } = {
  coffee: [
    { id: 1, name: 'Espresso', price: 2.99, description: 'Rich and bold single shot', image: require('../../assets/menu/espresso.jpg') },
    { id: 2, name: 'Cappuccino', price: 4.50, description: 'Espresso with steamed milk and foam', image: require('../../assets/menu/cappucino.jpg') },
    { id: 3, name: 'Latte', price: 4.75, description: 'Espresso with steamed milk', image: require('../../assets/menu/latte.jpg') },
    { id: 4, name: 'Americano', price: 3.25, description: 'Espresso with hot water', image: require('../../assets/menu/americano.jpg') },
  ],
  tea: [
    { id: 5, name: 'Green Tea', price: 3.50, description: 'Light and refreshing classic green tea', image: require('../../assets/menu/green-tea.jpeg') },
    { id: 6, name: 'Earl Grey', price: 3.50, description: 'Black tea with bergamot oil', image: require('../../assets/menu/earl-grey.jpg') },
  ],
  pastries: [
    { id: 7, name: 'Croissant', price: 3.25, description: 'Buttery, flaky pastry', image: require('../../assets/menu/croissant.jpeg') },
    { id: 8, name: 'Cinnamon Roll', price: 4.25, description: 'Sweet roll with cinnamon sugar', image: require('../../assets/menu/connamon-roll.jpeg') },
  ],
  breakfast: [
    { id: 9, name: 'Avocado Toast', price: 8.50, description: 'Whole grain toast with avocado', image: require('../../assets/menu/avocado-toast.jpg') },
    { id: 10, name: 'Breakfast Sandwich', price: 7.25, description: 'Egg, cheese and bacon on brioche', image: require('../../assets/menu/breakfast-sandwich.jpg') },
  ],
  lunch: [
    { id: 11, name: 'Chicken Sandwich', price: 9.95, description: 'Grilled chicken with lettuce and tomato', image: require('../../assets/menu/chicken-sandwitch.jpg') },
    { id: 12, name: 'Caesar Salad', price: 8.75, description: 'Fresh romaine with our house dressing', image: require('../../assets/menu/cesar-salad.jpg') },
  ],
};

export default function OrderScreen() {
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { addToCart, getItemCount, tableInfo, cartItems, clearCart } = useCart();
  const router = useRouter();
  const [orderNotes, setOrderNotes] = useState('');
  
  // Size price modifiers
  const sizePriceModifiers = {
    small: -0.50,
    medium: 0,
    large: 1.00
  };
  
  // Calculate adjusted price based on selected size
  const getAdjustedPrice = (basePrice: number) => {
    return basePrice + sizePriceModifiers[selectedSize];
  };
  
  const handleAddToCart = () => {
    if (selectedItem) {
      // Adjust the item price based on size
      const adjustedItem = {
        ...selectedItem,
        price: getAdjustedPrice(selectedItem.price),
      };
      
      addToCart(adjustedItem, quantity, specialInstructions, selectedSize);
      setModalVisible(false);
      // Reset values for next selection
      setQuantity(1);
      setSelectedSize('medium');
      setSpecialInstructions('');
      setSelectedItem(null);
    }
  };
  
  const handleItemPress = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedSize('medium'); // Reset to medium for each new item
    setModalVisible(true);
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }
    
    Alert.alert(
      'Order Placed',
      'Your order has been successfully placed!',
      [
        { 
          text: 'OK', 
          onPress: () => {
            clearCart();
            setOrderNotes('');
          }
        }
      ]
    );
  };

  const handleScanTable = () => {
    router.push({
      pathname: "/scan-table",
      params: { directScan: "true" }
    });
  };

  // Add a function to calculate the total order amount
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Check if a table has been scanned
  if (!tableInfo) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen 
          options={{ 
            headerShown: true, 
            title: 'Order',
            headerStyle: {
              backgroundColor: '#F4EDE4',
            },
            headerTintColor: '#3C2A15',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <View style={styles.noTableContainer}>
          <Ionicons name="qr-code-outline" size={60} color="#8E6E53" style={styles.noTableIcon} />
          <ThemedText style={styles.noTableTitle}>No Table Selected</ThemedText>
          <ThemedText style={styles.noTableDescription}>
            Please scan a table QR code to start ordering
          </ThemedText>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={handleScanTable}
          >
            <ThemedText style={styles.scanButtonText}>Scan Table QR Code</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Order',
          headerStyle: {
            backgroundColor: '#F4EDE4',
          },
          headerTintColor: '#3C2A15',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      
      <View style={styles.tableInfoContainer}>
        <Ionicons name="restaurant-outline" size={16} color="#8E6E53" />
        <ThemedText style={styles.tableInfoText}>Table {tableInfo.tableNumber}</ThemedText>
      </View>
      
      {/* Cart button */}
      {getItemCount() > 0 && (
        <TouchableOpacity style={styles.cartButton} onPress={handleViewCart}>
          <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
          <View style={styles.cartBadge}>
            <ThemedText style={styles.cartBadgeText}>{getItemCount()}</ThemedText>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Place Order Floating Button */}
      {getItemCount() > 0 && (
        <TouchableOpacity 
          style={styles.floatingOrderButton} 
          onPress={handlePlaceOrder}
        >
          <ThemedText style={styles.floatingOrderButtonText}>
            Place Order: ${calculateTotal().toFixed(2)}
          </ThemedText>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      
      {/* Order Summary at top */}
      {cartItems.length > 0 && (
        <View style={styles.orderSummary}>
          <ThemedText style={styles.orderSummaryTitle}>Current Order</ThemedText>
          <ScrollView style={styles.orderItemsContainer}>
            {cartItems.map((item) => (
              <View key={`${item.id}-${item.size}`} style={styles.orderItem}>
                <ThemedText style={styles.orderItemName}>
                  {item.quantity}x {item.size && `${item.size} `}{item.name}
                </ThemedText>
                <ThemedText style={styles.orderItemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
          
          {/* Add order total */}
          <View style={styles.orderTotalContainer}>
            <ThemedText style={styles.orderTotalLabel}>Total:</ThemedText>
            <ThemedText style={styles.orderTotalAmount}>${calculateTotal().toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.orderNotesContainer}>
            <ThemedText style={styles.orderNotesLabel}>Order Notes:</ThemedText>
            <TextInput
              style={styles.orderNotesInput}
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Add any special requests for your order..."
              placeholderTextColor="#B5A99A"
              multiline
            />
          </View>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}>
          {menuCategories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryButton, 
                selectedCategory === category.id ? styles.categoryButtonActive : null
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Ionicons 
                name={category.icon} 
                size={22} 
                color={selectedCategory === category.id ? '#FFFFFF' : '#8E6E53'} 
              />
              <ThemedText 
                style={[
                  styles.categoryText, 
                  selectedCategory === category.id ? styles.categoryTextActive : null
                ]}>
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Menu Items */}
        <View style={styles.menuItemsContainer}>
          <ThemedText style={styles.sectionTitle}>
            {menuCategories.find(c => c.id === selectedCategory)?.name}
          </ThemedText>
          
          {menuItems[selectedCategory].map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.menuItemContent}>
                <ThemedText style={styles.menuItemName}>{item.name}</ThemedText>
                <ThemedText style={styles.menuItemDescription}>{item.description}</ThemedText>
                <ThemedText style={styles.menuItemPrice}>${item.price.toFixed(2)}</ThemedText>
              </View>
              <Image source={item.image} style={styles.menuItemImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Item Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#8E6E53" />
            </TouchableOpacity>
            
            {selectedItem && (
              <>
                <View style={styles.modalImageContainer}>
                  <Image source={selectedItem.image} style={styles.modalImage} resizeMode="cover" />
                </View>
                
                <ThemedText style={styles.modalItemName}>{selectedItem.name}</ThemedText>
                <ThemedText style={styles.modalItemDescription}>{selectedItem.description}</ThemedText>
                
                {/* Size Selector - Add this section */}
                <View style={styles.sizeSelectorContainer}>
                  <ThemedText style={styles.sizeLabel}>Size</ThemedText>
                  <View style={styles.sizeOptions}>
                    <TouchableOpacity 
                      style={[
                        styles.sizeButton, 
                        selectedSize === 'small' && styles.selectedSizeButton
                      ]}
                      onPress={() => setSelectedSize('small')}
                    >
                      <ThemedText style={[
                        styles.sizeButtonText,
                        selectedSize === 'small' && styles.selectedSizeText
                      ]}>Small</ThemedText>
                      <ThemedText style={[
                        styles.sizePriceText,
                        selectedSize === 'small' && styles.selectedSizeText
                      ]}>${(selectedItem.price + sizePriceModifiers.small).toFixed(2)}</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.sizeButton, 
                        selectedSize === 'medium' && styles.selectedSizeButton
                      ]}
                      onPress={() => setSelectedSize('medium')}
                    >
                      <ThemedText style={[
                        styles.sizeButtonText,
                        selectedSize === 'medium' && styles.selectedSizeText
                      ]}>Medium</ThemedText>
                      <ThemedText style={[
                        styles.sizePriceText,
                        selectedSize === 'medium' && styles.selectedSizeText
                      ]}>${(selectedItem.price + sizePriceModifiers.medium).toFixed(2)}</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.sizeButton, 
                        selectedSize === 'large' && styles.selectedSizeButton
                      ]}
                      onPress={() => setSelectedSize('large')}
                    >
                      <ThemedText style={[
                        styles.sizeButtonText,
                        selectedSize === 'large' && styles.selectedSizeText
                      ]}>Large</ThemedText>
                      <ThemedText style={[
                        styles.sizePriceText,
                        selectedSize === 'large' && styles.selectedSizeText
                      ]}>${(selectedItem.price + sizePriceModifiers.large).toFixed(2)}</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <ThemedText style={styles.modalItemPrice}>
                  ${getAdjustedPrice(selectedItem.price).toFixed(2)}
                </ThemedText>
                
                <View style={styles.quantitySelectorContainer}>
                  <ThemedText style={styles.quantityLabel}>Quantity</ThemedText>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={decrementQuantity}
                    >
                      <Ionicons name="remove" size={20} color="#8E6E53" />
                    </TouchableOpacity>
                    <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={incrementQuantity}
                    >
                      <Ionicons name="add" size={20} color="#8E6E53" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <ThemedText style={styles.specialInstructionsLabel}>Special Instructions</ThemedText>
                <TextInput
                  style={styles.specialInstructionsInput}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  placeholder="Any special requests for this item?"
                  placeholderTextColor="#B5A99A"
                  multiline
                />
                
                <TouchableOpacity 
                  style={styles.addToCartButton}
                  onPress={handleAddToCart}
                >
                  <ThemedText style={styles.addToCartButtonText}>
                    Add {selectedSize} {selectedItem.name} - ${(getAdjustedPrice(selectedItem.price) * quantity).toFixed(2)}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#F4EDE4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  tableInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EDE4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DED0',
  },
  tableInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E6E53',
    fontWeight: '500',
  },
  noTableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTableIcon: {
    marginBottom: 20,
  },
  noTableTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 10,
  },
  noTableDescription: {
    fontSize: 16,
    color: '#8E6E53',
    textAlign: 'center',
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#8E6E53',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8E6E53',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingOrderButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 100,
    backgroundColor: '#59442B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
  floatingOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  categoryButton: {
    backgroundColor: '#F4EDE4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#8E6E53',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E6E53',
  },
  categoryTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 15,
  },
  menuItemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItemContent: {
    flex: 1,
    paddingRight: 10,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C2A15',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F4EDE4',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F4EDE4',
  },
  modalItemName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 8,
  },
  modalItemDescription: {
    fontSize: 16,
    color: '#8E6E53',
    marginBottom: 12,
  },
  modalItemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 20,
  },
  quantitySelectorContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
  },
  specialInstructionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 8,
  },
  specialInstructionsInput: {
    backgroundColor: '#F4EDE4',
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: '#3C2A15',
  },
  addToCartButton: {
    backgroundColor: '#8E6E53',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 10,
  },
  orderItemsContainer: {
    maxHeight: 150,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  orderItemName: {
    fontSize: 14,
    color: '#3C2A15',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C2A15',
  },
  orderNotesContainer: {
    marginTop: 15,
  },
  orderNotesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 5,
  },
  orderNotesInput: {
    backgroundColor: '#F4EDE4',
    borderRadius: 12,
    padding: 10,
    height: 60,
    textAlignVertical: 'top',
    color: '#3C2A15',
  },
  orderTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4EDE4',
    marginTop: 5,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  orderTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E6E53',
  },
  sizeSelectorContainer: {
    marginBottom: 20,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F4EDE4',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sizeButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedSizeButton: {
    backgroundColor: '#8E6E53',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  selectedSizeText: {
    color: 'white',
  },
  sizePriceText: {
    fontSize: 12,
    color: '#8E6E53',
  },
});