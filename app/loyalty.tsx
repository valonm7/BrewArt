import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Define types
interface LoyaltyTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
  type: 'earned' | 'redeemed';
}

export default function LoyaltyScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('activity'); // 'activity', 'rewards', 'tiers'

  // Sample user loyalty data
  const userLoyalty = {
    currentPoints: 1250,
    lifetimePoints: 3750,
    currentTier: 'Silver',
    nextTier: 'Gold',
    pointsToNextTier: 1250,
    transactions: [
      {
        id: '1',
        date: '2023-07-10',
        description: 'Purchase: 2x Cappuccino, 1x Croissant',
        points: 125,
        type: 'earned' as const,
      },
      {
        id: '2',
        date: '2023-07-05',
        description: 'Redeem: Free Pastry',
        points: -200,
        type: 'redeemed' as const,
      },
      {
        id: '3',
        date: '2023-07-02',
        description: 'Purchase: 1x Large Americano',
        points: 65,
        type: 'earned' as const,
      },
      {
        id: '4',
        date: '2023-06-28',
        description: 'Birthday Bonus',
        points: 500,
        type: 'earned' as const,
      },
      {
        id: '5',
        date: '2023-06-20',
        description: 'Purchase: 1x Latte, 1x Blueberry Muffin',
        points: 95,
        type: 'earned' as const,
      },
      {
        id: '6',
        date: '2023-06-15',
        description: 'Redeem: Free Coffee',
        points: -300,
        type: 'redeemed' as const,
      },
    ],
    availableRewards: [
      { id: '1', name: 'Free Coffee', pointsCost: 300, description: 'Enjoy any coffee of your choice for free.' },
      { id: '2', name: 'Free Pastry', pointsCost: 200, description: 'Treat yourself to any pastry on display.' },
      { id: '3', name: '50% Off Any Drink', pointsCost: 150, description: 'Get half off on your next drink purchase.' },
    ],
    tierBenefits: {
      Bronze: ['Earn 5 points per $1 spent', 'Birthday reward', 'Special seasonal offers'],
      Silver: ['Earn 7 points per $1 spent', 'Free size upgrade once a week', 'Birthday double points', 'Special seasonal offers'],
      Gold: ['Earn 10 points per $1 spent', 'Free size upgrade twice a week', 'Free refill on brewed coffee', 'Birthday triple points', 'Special seasonal offers', 'Priority service'],
    }
  };

  // Calculate tier progress percentage
  const tierProgressPercentage = (userLoyalty.lifetimePoints % 5000) / 5000 * 100;

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: LoyaltyTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <ThemedText style={styles.transactionDate}>{formatDate(item.date)}</ThemedText>
        <ThemedText 
          style={[
            styles.transactionPoints, 
            item.type === 'earned' ? styles.pointsEarned : styles.pointsRedeemed
          ]}
        >
          {item.type === 'earned' ? '+' : ''}{item.points} pts
        </ThemedText>
      </View>
      <ThemedText style={styles.transactionDescription}>{item.description}</ThemedText>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          // This screen will be accessible through navigation but won't appear in the tab bar
        }} 
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>My Loyalty</ThemedText>
        </View>

        {/* Loyalty Card */}
        <ThemedView style={styles.loyaltyCard}>
          <View style={styles.loyaltyCardHeader}>
            <View>
              <ThemedText style={styles.loyaltyTierTitle}>{userLoyalty.currentTier} Member</ThemedText>
              <ThemedText style={styles.memberSinceText}>Member since June 2023</ThemedText>
            </View>
            <View style={[
              styles.tierBadge,
              userLoyalty.currentTier === 'Bronze' ? styles.bronzeBadge : 
              userLoyalty.currentTier === 'Silver' ? styles.silverBadge : styles.goldBadge
            ]}>
              <ThemedText style={styles.tierBadgeText}>{userLoyalty.currentTier}</ThemedText>
            </View>
          </View>
          
          <View style={styles.pointsRow}>
            <View style={styles.pointsContainer}>
              <ThemedText style={styles.pointsValue}>{userLoyalty.currentPoints}</ThemedText>
              <ThemedText style={styles.pointsLabel}>Available Points</ThemedText>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsContainer}>
              <ThemedText style={styles.pointsValue}>{userLoyalty.lifetimePoints}</ThemedText>
              <ThemedText style={styles.pointsLabel}>Lifetime Points</ThemedText>
            </View>
          </View>

          <View style={styles.tierProgressContainer}>
            <View style={styles.tierProgressBar}>
              <View 
                style={[
                  styles.tierProgressFill, 
                  { width: `${tierProgressPercentage}%` },
                  userLoyalty.currentTier === 'Bronze' ? styles.bronzeProgress : 
                  userLoyalty.currentTier === 'Silver' ? styles.silverProgress : styles.goldProgress
                ]} 
              />
            </View>
            <ThemedText style={styles.tierProgressText}>
              {userLoyalty.pointsToNextTier} points to reach {userLoyalty.nextTier}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <ThemedText 
              style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}
            >
              Activity
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'rewards' && styles.activeTab]}
            onPress={() => setActiveTab('rewards')}
          >
            <ThemedText 
              style={[styles.tabText, activeTab === 'rewards' && styles.activeTabText]}
            >
              Rewards
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'tiers' && styles.activeTab]}
            onPress={() => setActiveTab('tiers')}
          >
            <ThemedText 
              style={[styles.tabText, activeTab === 'tiers' && styles.activeTabText]}
            >
              Tiers
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'activity' && (
          <FlatList
            data={userLoyalty.transactions}
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.transactionsList}
            ListHeaderComponent={
              <ThemedText style={styles.sectionTitle}>Transaction History</ThemedText>
            }
          />
        )}

        {activeTab === 'rewards' && (
          <ScrollView contentContainerStyle={styles.rewardsContainer}>
            <ThemedText style={styles.sectionTitle}>Available Rewards</ThemedText>
            
            {userLoyalty.availableRewards.map(reward => (
              <ThemedView key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardCardContent}>
                  <View style={styles.rewardIconContainer}>
                    <Ionicons 
                      name={reward.name.includes('Coffee') ? 'cafe' : reward.name.includes('Pastry') ? 'restaurant' : 'ticket'} 
                      size={24} 
                      color="#8E6E53" 
                    />
                  </View>
                  <View style={styles.rewardTextContainer}>
                    <ThemedText style={styles.rewardName}>{reward.name}</ThemedText>
                    <ThemedText style={styles.rewardDescription}>{reward.description}</ThemedText>
                  </View>
                  <View style={styles.rewardPoints}>
                    <ThemedText style={styles.rewardPointsText}>{reward.pointsCost} pts</ThemedText>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.redeemButton,
                    userLoyalty.currentPoints < reward.pointsCost && styles.disabledButton
                  ]}
                  disabled={userLoyalty.currentPoints < reward.pointsCost}
                >
                  <ThemedText style={styles.redeemButtonText}>Redeem</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ScrollView>
        )}

        {activeTab === 'tiers' && (
          <ScrollView contentContainerStyle={styles.tiersContainer}>
            <ThemedText style={styles.sectionTitle}>Tier Benefits</ThemedText>
            
            {Object.entries(userLoyalty.tierBenefits).map(([tier, benefits]) => (
              <ThemedView 
                key={tier} 
                style={[
                  styles.tierCard,
                  userLoyalty.currentTier === tier && styles.currentTierCard,
                  tier === 'Bronze' ? styles.bronzeTierCard : 
                  tier === 'Silver' ? styles.silverTierCard : styles.goldTierCard
                ]}
              >
                <View style={styles.tierCardHeader}>
                  <ThemedText style={styles.tierName}>{tier}</ThemedText>
                  {userLoyalty.currentTier === tier && (
                    <View style={styles.currentTierBadge}>
                      <ThemedText style={styles.currentTierBadgeText}>Current</ThemedText>
                    </View>
                  )}
                </View>
                <View style={styles.tierBenefitsList}>
                  {benefits.map((benefit, index) => (
                    <View key={index} style={styles.tierBenefitItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#8E6E53" style={styles.benefitIcon} />
                      <ThemedText style={styles.tierBenefitText}>{benefit}</ThemedText>
                    </View>
                  ))}
                </View>
              </ThemedView>
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5F1',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F4EDE4',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  loyaltyCard: {
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
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
    marginBottom: 20,
  },
  loyaltyTierTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  memberSinceText: {
    fontSize: 14,
    color: '#8E6E53',
    marginTop: 4,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bronzeBadge: {
    backgroundColor: 'rgba(205, 127, 50, 0.15)',
  },
  silverBadge: {
    backgroundColor: 'rgba(192, 192, 192, 0.15)',
  },
  goldBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  tierBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C2A15',
  },
  pointsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  pointsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pointsDivider: {
    width: 1,
    backgroundColor: '#E6D9CC',
    marginHorizontal: 15,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#8E6E53',
  },
  tierProgressContainer: {
    marginBottom: 10,
  },
  tierProgressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bronzeProgress: {
    backgroundColor: '#CD7F32',
  },
  silverProgress: {
    backgroundColor: '#C0C0C0',
  },
  goldProgress: {
    backgroundColor: '#FFD700',
  },
  tierProgressText: {
    fontSize: 12,
    color: '#8E6E53',
    textAlign: 'right',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#F4EDE4',
  },
  tabText: {
    fontSize: 16,
    color: '#8E6E53',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#3C2A15',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  transactionsList: {
    paddingTop: 20,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#8E6E53',
  },
  transactionPoints: {
    fontSize: 14,
    fontWeight: '600',
  },
  pointsEarned: {
    color: '#43A047',
  },
  pointsRedeemed: {
    color: '#E53935',
  },
  transactionDescription: {
    fontSize: 16,
    color: '#3C2A15',
  },
  rewardsContainer: {
    paddingVertical: 20,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rewardCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#8E6E53',
  },
  rewardPoints: {
    backgroundColor: '#F4EDE4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  rewardPointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E6E53',
  },
  redeemButton: {
    backgroundColor: '#8E6E53',
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1C4B3',
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tiersContainer: {
    paddingVertical: 20,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
  },
  currentTierCard: {
    backgroundColor: '#FFF8E1',
  },
  bronzeTierCard: {
    borderLeftColor: '#CD7F32',
  },
  silverTierCard: {
    borderLeftColor: '#C0C0C0',
  },
  goldTierCard: {
    borderLeftColor: '#FFD700',
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  currentTierBadge: {
    backgroundColor: '#8E6E53',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentTierBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tierBenefitsList: {
    marginTop: 8,
  },
  tierBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    marginRight: 8,
  },
  tierBenefitText: {
    fontSize: 14,
    color: '#59442B',
  },
}); 