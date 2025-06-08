import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useFavorites } from '@/context/FavoritesContext';

// Get all menu items (flattened from the categories)
const getAllMenuItems = () => {
  const menuItems = [
    { id: 1, name: 'Espresso', price: 2.99, description: 'Rich and bold single shot', image: require('../../assets/menu/espresso.jpg') },
    { id: 2, name: 'Cappuccino', price: 4.50, description: 'Espresso with steamed milk and foam', image: require('../../assets/menu/cappucino.jpg') },
    { id: 3, name: 'Latte', price: 4.75, description: 'Espresso with steamed milk', image: require('../../assets/menu/latte.jpg') },
    { id: 4, name: 'Americano', price: 3.25, description: 'Espresso with hot water', image: require('../../assets/menu/americano.jpg') },
    { id: 5, name: 'Green Tea', price: 3.50, description: 'Light and refreshing classic green tea', image: require('../../assets/menu/green-tea.jpeg') },
    { id: 6, name: 'Earl Grey', price: 3.50, description: 'Black tea with bergamot oil', image: require('../../assets/menu/earl-grey.jpg') },
    { id: 7, name: 'Croissant', price: 3.25, description: 'Buttery, flaky pastry', image: require('../../assets/menu/croissant.jpeg') },
    { id: 8, name: 'Cinnamon Roll', price: 4.25, description: 'Sweet roll with cinnamon sugar', image: require('../../assets/menu/connamon-roll.jpeg') },
    { id: 9, name: 'Blueberry Muffin', price: 3.95, description: 'Fluffy muffin with blueberries', image: require('../../assets/menu/blueberry-muffin.jpg') },
  ];
  return menuItems;
};

export default function FavoriteDrinksScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [allItems, setAllItems] = useState(getAllMenuItems());
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Manage Favorites',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F4EDE4',
          },
          headerTintColor: '#3C2A15',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#3C2A15" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ThemedText style={styles.instructionText}>
        Select your favorite drinks and treats. These will appear on your home screen for quick ordering.
      </ThemedText>
      
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Current Favorites</ThemedText>
        {favorites.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="cafe" size={50} color="#E6D9CC" />
            <ThemedText style={styles.emptyStateText}>No favorites yet</ThemedText>
            <ThemedText style={styles.emptyStateSubText}>
              Add favorites from the list below
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.favoriteItem}
                onPress={() => toggleFavorite(item)}
              >
                <View style={styles.favoriteImageContainer}>
                  <Image 
                    source={item.image} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.favoriteDetails}>
                  <ThemedText style={styles.favoriteName}>{item.name}</ThemedText>
                  <ThemedText style={styles.favoriteDescription}>{item.description}</ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => toggleFavorite(item)}
                >
                  <Ionicons name="heart" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            style={styles.favoritesList}
          />
        )}
      </View>
      
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>Add to Favorites</ThemedText>
        <FlatList
          data={allItems.filter(item => !isFavorite(item.id))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => toggleFavorite(item)}
            >
              <View style={styles.favoriteImageContainer}>
                <Image 
                  source={item.image} 
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.favoriteDetails}>
                <ThemedText style={styles.favoriteName}>{item.name}</ThemedText>
                <ThemedText style={styles.favoriteDescription}>{item.description}</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => toggleFavorite(item)}
              >
                <Ionicons name="heart-outline" size={24} color="#8E6E53" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          style={styles.menuList}
        />
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
  instructionText: {
    fontSize: 16,
    color: '#8E6E53',
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 12,
    marginTop: 10,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E6E53',
    marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#B5A99A',
    marginTop: 4,
  },
  favoritesList: {
    maxHeight: 220,
  },
  menuList: {
    marginBottom: 20,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  favoriteImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F4EDE4',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  favoriteDetails: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#8E6E53',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
}); 