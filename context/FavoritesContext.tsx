import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Import menu items from menu file
import { MenuItem } from './CartContext';

// Define the type for our FavoritesContext
interface FavoritesContextType {
  favorites: MenuItem[];
  addFavorite: (item: MenuItem) => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (item: MenuItem) => Promise<void>;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Sample initial favorites (will be replaced by AsyncStorage data)
const initialFavorites: MenuItem[] = [
  { id: 1, name: 'Americano', price: 3.25, image: require('../assets/menu/americano.jpg'), size: 'large', description: 'Espresso with hot water' },
  { id: 2, name: 'Cappuccino', price: 4.50, image: require('../assets/menu/cappucino.jpg'), size: 'medium', description: 'Espresso with steamed milk and foam' },
];

// Create a provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<MenuItem[]>(initialFavorites);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever they change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };

    saveFavorites();
  }, [favorites]);

  // Add a favorite item
  const addFavorite = async (item: MenuItem) => {
    // Check if already a favorite
    if (!favorites.some(fav => fav.id === item.id)) {
      const newFavorites = [...favorites, item];
      setFavorites(newFavorites);
    }
  };

  // Remove a favorite item
  const removeFavorite = async (id: number) => {
    const newFavorites = favorites.filter(item => item.id !== id);
    setFavorites(newFavorites);
  };

  // Check if an item is a favorite
  const isFavorite = (id: number) => {
    return favorites.some(item => item.id === id);
  };

  // Toggle favorite status
  const toggleFavorite = async (item: MenuItem) => {
    if (isFavorite(item.id)) {
      await removeFavorite(item.id);
    } else {
      await addFavorite(item);
    }
  };

  // Context value
  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use the context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 