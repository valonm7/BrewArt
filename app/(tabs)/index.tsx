import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Define types for menu items
interface MenuItem {
  id: number;
  name: string;
  image: any;  // Changed to 'any' type to support require statements
  price?: number;
  size?: string;
}

// Sample trending items data
const trendingItems: MenuItem[] = [
  { id: 1, name: 'Caramel Macchiato', image: require('../../assets/menu/caramel-machiato.jpg'), price: 4.99 },
  { id: 2, name: 'Cappuccino', image: require('../../assets/menu/cappucino.jpg'), price: 4.50 },
  { id: 3, name: 'Latte', image: require('../../assets/menu/latte.jpg'), price: 4.75 },
];

// Sample favorites data
const favorites: MenuItem[] = [
  { id: 1, name: 'Americano', image: require('../../assets/menu/americano.jpg'), size: 'Large' },
  { id: 2, name: 'Cappuccino', image: require('../../assets/menu/cappucino.jpg'), size: 'Medium' },
];

// Sample recent orders
const recentOrders: MenuItem[] = [
  { id: 1, name: 'Caramel Macchiato', image: require('../../assets/menu/caramel-machiato.jpg'), price: 4.99, size: 'Medium' },
  { id: 2, name: 'Blueberry Muffin', image: require('../../assets/menu/blueberry-muffin.jpg'), price: 2.50 },
];

// Loyalty tiers
const tiers = [
  { name: 'Bronze', min: 0, max: 499, color: '#CD7F32' },
  { name: 'Silver', min: 500, max: 1499, color: '#C0C0C0' },
  { name: 'Gold', min: 1500, max: Infinity, color: '#FFD700' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, getUserPoints } = useAuth();
  const { favorites } = useFavorites();
  const [greeting, setGreeting] = useState('');
  // Hardcode points to 1250 for Silver tier
  const [userPoints, setUserPoints] = useState(1250);
  const [currentTier, setCurrentTier] = useState<typeof tiers[0] | null>(null);
  const [pointsToNextTier, setPointsToNextTier] = useState(0);
  const steamAnimationRef = useRef(null);
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
    
    // Hardcode points to 1250 (Silver tier)
    setUserPoints(1250);
    
    // Determine current tier - hardcode to Silver
    const silverTier = tiers.find(t => t.name === 'Silver') || tiers[1];
    setCurrentTier(silverTier);
    
    // Calculate points to next tier
    const pointsToGold = tiers[2].min - 1250;
    setPointsToNextTier(pointsToGold);
  }, []);

  const handleOrderNow = () => {
    // Navigate to menu screen
    router.push('/(tabs)/menu');
  };

  const handleSendGift = () => {
    // Navigate to gift card screen
    router.push('/(tabs)/giftcard');
  };

  const handleTableOrder = () => {
    // Navigate to order screen with table scanning
    router.push('/scan-table');
  };

  const handleOpenChatbot = () => {
    // Navigate to chatbot
    router.push('/chatbot');
  };
  
  const handleOrderAgain = (item: MenuItem) => {
    // Navigate to menu with the selected item
    router.push({
      pathname: '/(tabs)/menu',
      params: { highlightItem: item.id }
    });
  };
  
  const handleGiftCards = () => {
    // Navigate to gift cards
    router.push('/(tabs)/giftcard');
  };
  
  const handleLoyalty = () => {
    // Navigate to user loyalty program
    router.push('/loyalty');
  };
  
  const handleViewTrendingItem = (item: MenuItem) => {
    // Navigate to item detail or add to cart
    router.push({
      pathname: '/(tabs)/menu',
      params: { highlightItem: item.id }
    });
  };
  
  const handleViewReceipt = (orderId: number) => {
    // Navigate to order details
    router.push({
      pathname: '/(tabs)/orders',
      params: { id: orderId }
    });
  };
  
  const navigateToOrderTab = () => {
    // Navigate to order tab
    router.push('/(tabs)/order');
  };
  
  const renderLoyaltyCard = () => {
    if (!currentTier) return null;
    
    const progressPercentage = currentTier.name !== 'Gold' 
      ? ((userPoints - currentTier.min) / (currentTier.max - currentTier.min)) * 100
      : 100;
      
    return (
      <TouchableOpacity 
        style={styles.loyaltyCard}
        onPress={handleLoyalty}
      >
        <View style={styles.loyaltyCardHeader}>
          <View style={styles.loyaltyInfo}>
            <ThemedText style={styles.loyaltyTitle}>My Rewards</ThemedText>
            <View style={[styles.tierBadge, { backgroundColor: currentTier.color }]}>
              <ThemedText style={styles.tierText}>{currentTier.name}</ThemedText>
            </View>
          </View>
          <View style={styles.pointsCircle}>
            <ThemedText style={styles.pointsValue}>{userPoints}</ThemedText>
            <ThemedText style={styles.pointsLabel}>POINTS</ThemedText>
          </View>
        </View>
        
        {pointsToNextTier > 0 && (
          <View style={styles.progressContainer}>
            <ThemedText style={styles.progressText}>
              {pointsToNextTier} points to next tier
            </ThemedText>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${Math.min(100, progressPercentage)}%` }
                ]} 
              />
            </View>
          </View>
        )}
        
        <View style={styles.loyaltyCardFooter}>
          <Ionicons name="arrow-forward" size={16} color="#8E6E53" />
          <ThemedText style={styles.viewDetailsText}>View Details</ThemedText>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with greeting and logo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.greetingText}>{greeting}</ThemedText>
            <ThemedText style={styles.usernameText}>{user?.name || 'Coffee Lover'}</ThemedText>
          </View>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="cafe" size={24} color="#67513C" />
              <View style={styles.steamContainer}>
                <LottieView
                  ref={steamAnimationRef}
                  source={require('../../assets/animations/coffee-steam.json')}
                  autoPlay
                  loop={true}
                  style={styles.steamAnimation}
                />
              </View>
            </View>
            <ThemedText style={styles.cafeNameText}>BrewArt</ThemedText>
          </View>
        </View>
      </View>

      {/* Main content area - Clickable to navigate to order tab */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={navigateToOrderTab}
        style={styles.mainContent}
      >
        {/* Loyalty Card */}
        {renderLoyaltyCard()}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.primaryActionButton} 
            onPress={handleOrderNow}
          >
            <Ionicons name="cafe-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.primaryActionText}>Order Now</ThemedText>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryActionButton} onPress={handleTableOrder}>
              <View style={styles.secondaryActionIcon}>
                <Ionicons name="qr-code-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.secondaryActionText}>Table</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryActionButton} onPress={handleGiftCards}>
              <View style={styles.secondaryActionIcon}>
                <Ionicons name="gift-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.secondaryActionText}>Gift</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryActionButton} onPress={handleLoyalty}>
              <View style={styles.secondaryActionIcon}>
                <Ionicons name="star-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.secondaryActionText}>Rewards</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Orders</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          
          {recentOrders.map(item => (
            <View key={item.id} style={styles.recentOrderItem}>
              <View style={styles.orderItemLeft}>
                <View style={styles.orderImageContainer}>
                  <Image 
                    source={item.image} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.orderDetails}>
                  <ThemedText style={styles.orderItemName}>{item.name}</ThemedText>
                  {item.size && (
                    <ThemedText style={styles.orderItemSize}>{item.size}</ThemedText>
                  )}
                  <ThemedText style={styles.orderItemPrice}>${item.price?.toFixed(2)}</ThemedText>
                </View>
              </View>
              <View style={styles.orderActions}>
                <TouchableOpacity 
                  style={styles.receiptButton}
                  onPress={() => handleViewReceipt(item.id)}
                >
                  <Ionicons name="receipt-outline" size={16} color="#8E6E53" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.orderAgainButton}
                  onPress={() => handleOrderAgain(item)}
                >
                  <ThemedText style={styles.orderAgainText}>Order Again</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ThemedView>

        {/* Trending Section */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Popular Today</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
              <ThemedText style={styles.viewAllText}>See Menu</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
            {trendingItems.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.trendingItem}
                onPress={() => handleViewTrendingItem(item)}
              >
                <View style={styles.trendingImageContainer}>
                  <Image 
                    source={item.image} 
                    style={styles.trendingImage}
                    resizeMode="cover"
                  />
                </View>
                <ThemedText style={styles.trendingName}>{item.name}</ThemedText>
                <ThemedText style={styles.trendingPrice}>${item.price?.toFixed(2) || ''}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Favorites */}
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Your Favorites</ThemedText>
            <TouchableOpacity onPress={() => router.push('/profile/favorite-drinks')}>
              <ThemedText style={styles.viewAllText}>Edit</ThemedText>
            </TouchableOpacity>
          </View>
          
          {favorites.length === 0 ? (
            <View style={styles.emptyFavoritesContainer}>
              <Ionicons name="heart-outline" size={40} color="#E6D9CC" />
              <ThemedText style={styles.emptyFavoritesText}>No favorites yet</ThemedText>
              <ThemedText style={styles.emptyFavoritesSubText}>
                Tap 'Edit' to add your favorite items
              </ThemedText>
            </View>
          ) : (
            favorites.map(item => (
              <View key={item.id} style={styles.favoriteItem}>
                <View style={styles.favoriteImageContainer}>
                  <Image 
                    source={item.image} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.favoriteDetails}>
                  <ThemedText style={styles.favoriteName}>{item.name}</ThemedText>
                  {item.size && (
                    <ThemedText style={styles.favoriteSize}>{item.size}</ThemedText>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.orderAgainButton}
                  onPress={() => handleOrderAgain(item)}
                >
                  <ThemedText style={styles.orderAgainText}>Order</ThemedText>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ThemedView>

        {/* Special Offers */}
        <ThemedView style={styles.offerContainer}>
          <Ionicons name="gift-outline" size={24} color="#FF6B6B" />
          <ThemedText style={styles.offerText}>
            Get a free cookie with your next coffee 🍪
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </ScrollView>
      
      {/* Floating Action Button for Chatbot */}
      <TouchableOpacity 
        style={styles.chatbotFab}
        onPress={handleOpenChatbot}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F4EDE4',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#8E6E53',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
    overflow: 'visible',
    borderWidth: 2,
    borderColor: '#8E6E53',
  },
  steamContainer: {
    position: 'absolute',
    top: -25,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steamAnimation: {
    width: 60,
    height: 60,
    position: 'absolute',
    zIndex: 5,
    top: -5,
  },
  cafeNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#59442B',
  },
  loyaltyCard: {
    margin: 20,
    marginTop: -10,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loyaltyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loyaltyInfo: {
    flex: 1,
  },
  loyaltyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointsCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8E6E53',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F4EDE4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8E6E53',
    borderRadius: 4,
  },
  loyaltyCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#8E6E53',
    fontWeight: '500',
    marginLeft: 4,
  },
  quickActionsContainer: {
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8E6E53',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryActionButton: {
    alignItems: 'center',
    width: '30%',
  },
  secondaryActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    color: '#59442B',
  },
  sectionContainer: {
    margin: 20,
    marginTop: 10,
    marginBottom: 15,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  viewAllText: {
    fontSize: 14,
    color: '#8E6E53',
    fontWeight: '500',
  },
  recentOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F4EDE4',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
  },
  orderItemSize: {
    fontSize: 14,
    color: '#8E6E53',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E6E53',
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  orderAgainButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#8E6E53',
    borderRadius: 20,
  },
  orderAgainText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  trendingScroll: {
    marginBottom: 12,
  },
  trendingItem: {
    marginRight: 15,
    width: 150,
  },
  trendingImageContainer: {
    height: 150,
    width: 150,
    backgroundColor: '#F4EDE4',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
  },
  trendingPrice: {
    fontSize: 14,
    color: '#8E6E53',
    marginTop: 4,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  favoriteImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F4EDE4',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteDetails: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
  },
  favoriteSize: {
    fontSize: 14,
    color: '#8E6E53',
  },
  offerContainer: {
    margin: 20,
    marginTop: 5,
    padding: 16,
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  offerText: {
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
    color: '#3C2A15',
  },
  chatbotFab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8E6E53',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  emptyFavoritesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D9CC',
  },
  emptyFavoritesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E6E53',
    marginTop: 12,
  },
  emptyFavoritesSubText: {
    fontSize: 14,
    color: '#B5A99A',
    marginTop: 4,
    textAlign: 'center',
  },
});
