import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MenuItem } from '@/context/CartContext';

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

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState('coffee');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Menu',
          headerStyle: {
            backgroundColor: '#F4EDE4',
          },
          headerTintColor: '#3C2A15',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      
      <ScrollView style={styles.content}>
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}>
          {menuCategories.map((category) => (
            <View 
              key={category.id}
              style={[
                styles.categoryButton, 
                selectedCategory === category.id ? styles.categoryButtonActive : null
              ]}
              onTouchEnd={() => setSelectedCategory(category.id)}
            >
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
            </View>
          ))}
        </ScrollView>
        
        {/* Menu Description */}
        <View style={styles.menuDescriptionContainer}>
          <ThemedText style={styles.menuDescription}>
            Browse our full menu. To place an order, please visit a store or scan your table's QR code.
          </ThemedText>
        </View>
        
        {/* Menu Items */}
        <View style={styles.menuItemsContainer}>
          <ThemedText style={styles.sectionTitle}>
            {menuCategories.find(c => c.id === selectedCategory)?.name}
          </ThemedText>
          
          {menuItems[selectedCategory].map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <ThemedText style={styles.menuItemName}>{item.name}</ThemedText>
                <ThemedText style={styles.menuItemDescription}>{item.description}</ThemedText>
                <ThemedText style={styles.menuItemPrice}>${item.price.toFixed(2)}</ThemedText>
              </View>
              <Image 
                source={item.image} 
                style={styles.menuItemImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
        
        {/* Store Hours */}
        <View style={styles.storeInfoSection}>
          <ThemedText style={styles.sectionTitle}>Store Hours</ThemedText>
          <View style={styles.hoursContainer}>
            <View style={styles.hourRow}>
              <ThemedText style={styles.hourDay}>Monday - Friday</ThemedText>
              <ThemedText style={styles.hourTime}>6:00 AM - 8:00 PM</ThemedText>
            </View>
            <View style={styles.hourRow}>
              <ThemedText style={styles.hourDay}>Saturday</ThemedText>
              <ThemedText style={styles.hourTime}>7:00 AM - 9:00 PM</ThemedText>
            </View>
            <View style={styles.hourRow}>
              <ThemedText style={styles.hourDay}>Sunday</ThemedText>
              <ThemedText style={styles.hourTime}>7:00 AM - 6:00 PM</ThemedText>
            </View>
          </View>
        </View>
        
        {/* Location Info */}
        <View style={styles.storeInfoSection}>
          <ThemedText style={styles.sectionTitle}>Location</ThemedText>
          <View style={styles.locationContainer}>
            <ThemedText style={styles.locationName}>Tirana, Xhamllik</ThemedText>
            <ThemedText style={styles.locationAddress}>Rruga Dervish Hima, Tirana, Albania</ThemedText>
            <ThemedText style={styles.locationPhone}>(+355) 68 924 3751</ThemedText>
          </View>
        </View>
      </ScrollView>
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
  menuDescriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#F4EDE4',
  },
  menuDescription: {
    fontSize: 14,
    color: '#8E6E53',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 15,
  },
  menuItemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  storeInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
  },
  hoursContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EDE4',
  },
  hourDay: {
    fontSize: 14,
    color: '#3C2A15',
    fontWeight: '500',
  },
  hourTime: {
    fontSize: 14,
    color: '#8E6E53',
  },
  locationContainer: {
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
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 5,
  },
  locationAddress: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 3,
  },
  locationPhone: {
    fontSize: 14,
    color: '#8E6E53',
  },
});