import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logoutUser, getUserPoints } = useAuth();
  const router = useRouter();
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);
  
  // User loyalty data - hardcoded to 1250 points and Silver tier
  const userPoints = 1250; // Hardcoded to 1250 points
  const lifetimePoints = 3750; // Fixed value matching the loyalty screen
  const currentTier = 'Silver'; // Hardcoded to Silver tier
  const nextTier = 'Gold';
  const pointsToNextTier = 250; // Points needed to reach Gold (1500 - 1250)
  
  const progressPercentage = 75; // (1250 - 500) / 1000 * 100 = 75%

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>

        {/* User Info */}
        <View style={styles.userInfoSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageFallback}>
              <Ionicons name="person" size={60} color="#8E6E53" />
            </View>
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera-outline" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.userName}>{user?.name || 'Emma Johnson'}</ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email || 'emma.johnson@example.com'}</ThemedText>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push({ pathname: '/account/personal-info' } as never)}
          >
            <ThemedText style={styles.editProfileButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Loyalty Points */}
        <ThemedView style={styles.loyaltyContainer}>
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyHeaderLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F4EDE4' }]}>
                <Ionicons name="star" size={24} color="#8E6E53" />
              </View>
              <View>
                <ThemedText style={styles.loyaltyTitle}>Loyalty Points</ThemedText>
                <ThemedText style={styles.loyaltyTier}>{currentTier} Member</ThemedText>
              </View>
            </View>
            {/* Show or hide points details based on state */}
            {!showLoyaltyDetails ? (
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => setShowLoyaltyDetails(true)}
              >
                <ThemedText style={styles.viewDetailsText}>View Details</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => setShowLoyaltyDetails(false)}
              >
                <ThemedText style={styles.viewDetailsText}>Hide Details</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.loyaltyPointsContainer}>
            <View style={styles.pointsCircle}>
              <ThemedText style={styles.loyaltyPointsValue}>{userPoints}</ThemedText>
              <ThemedText style={styles.loyaltyPointsLabel}>POINTS</ThemedText>
            </View>
          </View>
          
          {/* Details section that shows/hides on button press */}
          {showLoyaltyDetails && (
            <View style={styles.loyaltyDetailsContainer}>
              <View style={styles.loyaltyDetailRow}>
                <ThemedText style={styles.loyaltyDetailLabel}>Lifetime Points:</ThemedText>
                <ThemedText style={styles.loyaltyDetailValue}>{lifetimePoints}</ThemedText>
              </View>
              <View style={styles.loyaltyDetailRow}>
                <ThemedText style={styles.loyaltyDetailLabel}>Points to Next Tier:</ThemedText>
                <ThemedText style={styles.loyaltyDetailValue}>{pointsToNextTier}</ThemedText>
              </View>
              <View style={styles.loyaltyDetailRow}>
                <ThemedText style={styles.loyaltyDetailLabel}>Member Since:</ThemedText>
                <ThemedText style={styles.loyaltyDetailValue}>June 2023</ThemedText>
              </View>
              <View style={styles.tierProgressContainer}>
                <View style={styles.tierProgressBar}>
                  <View style={[styles.tierProgressFill, { width: `${progressPercentage}%` }]} />
                </View>
                <ThemedText style={styles.tierProgressText}>{Math.round(progressPercentage)}% to {nextTier || 'Max Tier'}</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.loyaltyDetailsButton}
                onPress={() => router.push({ pathname: '/loyalty' } as never)}
              >
                <ThemedText style={styles.loyaltyDetailsButtonText}>Full Loyalty Dashboard</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>

        {/* Account Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/account/personal-info' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="person-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Personal Information</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Security</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="notifications-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Notifications</ThemedText>
            </View>
            <View style={styles.switchContainer}>
              <Switch 
                trackColor={{ false: '#E6D9CC', true: '#D1C4B3' }}
                thumbColor={'#8E6E53'}
                value={true}
              />
            </View>
          </TouchableOpacity>
        </ThemedView>
        
        {/* Payment Methods */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Methods</ThemedText>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/profile/payment-methods' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="card-outline" size={20} color="#8E6E53" />
              </View>
              <View>
                <ThemedText style={styles.menuItemText}>Credit & Debit Cards</ThemedText>
                <ThemedText style={styles.menuItemSubtext}>Manage payment methods</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/payment/add-payment' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="wallet-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Add Payment Method</ThemedText>
            </View>
            <Ionicons name="add" size={20} color="#8E6E53" />
          </TouchableOpacity>
        </ThemedView>
        
        {/* Birthday & Preferences */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Birthday & Preferences</ThemedText>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/account/personal-info' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="calendar-outline" size={20} color="#8E6E53" />
              </View>
              <View>
                <ThemedText style={styles.menuItemText}>Birthday</ThemedText>
                <ThemedText style={styles.menuItemSubtext}>
                  {user?.birthday || 'Not set'}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/profile/favorite-drinks' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="cafe-outline" size={20} color="#8E6E53" />
              </View>
              <View>
                <ThemedText style={styles.menuItemText}>Favorite Drinks</ThemedText>
                <ThemedText style={styles.menuItemSubtext}>Cappuccino, Latte</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/profile/dietary-preferences' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="nutrition-outline" size={20} color="#8E6E53" />
              </View>
              <View>
                <ThemedText style={styles.menuItemText}>Dietary Preferences</ThemedText>
                <ThemedText style={styles.menuItemSubtext}>Vegetarian, No dairy</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
        </ThemedView>
        
        {/* Gift Cards */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Gift Cards</ThemedText>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/(tabs)/giftcard' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="gift-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Gift Cards Received</ThemedText>
            </View>
            <View style={styles.badgeContainer}>
              <ThemedText style={styles.badgeText}>2</ThemedText>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push({ pathname: '/(tabs)/giftcard' } as never)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="paper-plane-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Gift Cards Sent</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
        </ThemedView>
        
        {/* Support */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support</ThemedText>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Contact Support</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>FAQs</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="document-text-outline" size={20} color="#8E6E53" />
              </View>
              <ThemedText style={styles.menuItemText}>Terms & Privacy Policy</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
        </ThemedView>
        
        {/* System & Diagnostics */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>System</ThemedText>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/diagnostics')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6D9CC' }]}>
                <Ionicons name="settings-outline" size={20} color="#8E6E53" />
              </View>
              <View>
                <ThemedText style={styles.menuItemText}>System Diagnostics</ThemedText>
                <ThemedText style={styles.menuItemSubtext}>Check connectivity and login status</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B5A99A" />
          </TouchableOpacity>
        </ThemedView>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logoutUser, style: 'destructive' }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
        
        <View style={styles.versionInfo}>
          <ThemedText style={styles.versionText}>BrewArt v1.0.0</ThemedText>
          
          {/* Admin Dashboard Link */}
          <TouchableOpacity 
            style={styles.adminLink}
            onPress={() => router.push({ pathname: '/admin/login' } as never)}
          >
            <ThemedText style={styles.adminLinkText}>Admin Dashboard</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  userInfoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#BEA99A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFCF7',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8E6E53',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFCF7',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E6E53',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: '#8E6E53',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#59442B',
  },
  menuItemSubtext: {
    fontSize: 14,
    color: '#8E6E53',
    marginTop: 2,
  },
  switchContainer: {
    height: 24,
  },
  badgeContainer: {
    backgroundColor: '#8E6E53',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  versionText: {
    color: '#B5A99A',
    fontSize: 14,
    marginBottom: 16,
  },
  adminLink: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
    marginTop: 8,
  },
  adminLinkText: {
    color: '#8E6E53',
    fontWeight: '500',
  },
  loyaltyContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loyaltyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loyaltyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  loyaltyTier: {
    fontSize: 14,
    color: '#8E6E53',
  },
  viewDetailsButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F4EDE4',
    borderRadius: 20,
  },
  viewDetailsText: {
    color: '#8E6E53',
    fontWeight: '500',
  },
  loyaltyPointsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8E6E53',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyPointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loyaltyPointsLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loyaltyDetailsContainer: {
    marginTop: 16,
  },
  loyaltyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  loyaltyDetailLabel: {
    fontSize: 14,
    color: '#8E6E53',
  },
  loyaltyDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  tierProgressContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  tierProgressBar: {
    height: 12,
    backgroundColor: '#E6D9CC',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    backgroundColor: '#8E6E53',
  },
  tierProgressText: {
    fontSize: 14,
    color: '#8E6E53',
    marginTop: 4,
  },
  loyaltyDetailsButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#8E6E53',
    borderRadius: 20,
    marginTop: 16,
  },
  loyaltyDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
