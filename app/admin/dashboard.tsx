import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { orderService } from '@/services/OrderService';

// Sample summary data for other stats
const dashboardSummary = {
  revenue: {
    today: 1250,
    thisWeek: 8750,
    thisMonth: 32500
  },
  customers: {
    total: 386,
    new: 42
  },
  loyalty: {
    totalMembers: 245,
    bronze: 150,
    silver: 68,
    gold: 27
  },
  popularItems: [
    { name: 'Cappuccino', sales: 87 },
    { name: 'Croissant', sales: 64 },
    { name: 'Latte', sales: 56 },
    { name: 'Blueberry Muffin', sales: 42 }
  ]
};

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0
  });
  
  // Check admin session and load order data
  useEffect(() => {
    const verifyAdminSession = async () => {
      try {
        const session = await AsyncStorage.getItem('adminSession');
        if (session !== 'true') {
          // Redirect to login if not authenticated
          router.replace('/admin/login');
        } else {
          await loadOrderData();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Session verification error', error);
        router.replace('/admin/login');
      }
    };
    
    verifyAdminSession();
    
    // Set up interval to refresh order data every 10 seconds
    const refreshInterval = setInterval(loadOrderData, 10000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [router]);
  
  const loadOrderData = async () => {
    try {
      const orders = await orderService.getAllOrders();
      
      // Count orders by status
      const stats = {
        pending: 0,
        processing: 0,
        completed: 0
      };
      
      orders.forEach(order => {
        if (stats[order.status] !== undefined) {
          stats[order.status]++;
        }
      });
      
      setOrderStats(stats);
    } catch (error) {
      console.error('Error loading order data:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('adminSession');
      router.replace('/admin/login');
    } catch (error) {
      console.error('Logout error', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#8E6E53" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeTitle}>
          Welcome to Admin Dashboard
        </ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>
          Manage your coffee shop operations
        </ThemedText>
      </View>
      
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cash-outline" size={28} color="#8E6E53" />
          </View>
          <ThemedText style={styles.statValue}>${dashboardSummary.revenue.today}</ThemedText>
          <ThemedText style={styles.statLabel}>Today's Revenue</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cart-outline" size={28} color="#8E6E53" />
          </View>
          <ThemedText style={styles.statValue}>{orderStats.pending + orderStats.processing}</ThemedText>
          <ThemedText style={styles.statLabel}>Active Orders</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="people-outline" size={28} color="#8E6E53" />
          </View>
          <ThemedText style={styles.statValue}>{dashboardSummary.customers.new}</ThemedText>
          <ThemedText style={styles.statLabel}>New Customers</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="star-outline" size={28} color="#8E6E53" />
          </View>
          <ThemedText style={styles.statValue}>{dashboardSummary.loyalty.totalMembers}</ThemedText>
          <ThemedText style={styles.statLabel}>Loyalty Members</ThemedText>
        </ThemedView>
      </View>
      
      {/* Admin Features */}
      <ThemedText style={styles.sectionTitle}>Management</ThemedText>
      <View style={styles.featuresContainer}>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => router.push('/admin/orders')}
        >
          <View style={[styles.featureIconContainer, { backgroundColor: '#FFE9E5' }]}>
            <Ionicons name="receipt-outline" size={32} color="#FF6B6B" />
            {orderStats.pending > 0 && (
              <View style={styles.notificationBadge}>
                <ThemedText style={styles.notificationText}>{orderStats.pending}</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureTitle}>
              Orders
              {orderStats.pending > 0 && <ThemedText style={styles.pendingText}> ({orderStats.pending} pending)</ThemedText>}
            </ThemedText>
            <ThemedText style={styles.featureSubtitle}>Manage orders and track status</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D1C4B3" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => router.push('/admin/customers')}
        >
          <View style={[styles.featureIconContainer, { backgroundColor: '#E7F5FF' }]}>
            <Ionicons name="people" size={32} color="#4DABF7" />
          </View>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureTitle}>Customers</ThemedText>
            <ThemedText style={styles.featureSubtitle}>View and manage customer profiles</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D1C4B3" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => router.push('/admin/loyalty')}
        >
          <View style={[styles.featureIconContainer, { backgroundColor: '#FFF7E5' }]}>
            <Ionicons name="star" size={32} color="#FFC107" />
          </View>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureTitle}>Loyalty</ThemedText>
            <ThemedText style={styles.featureSubtitle}>Analyze loyalty program statistics</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D1C4B3" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureCard}>
          <View style={[styles.featureIconContainer, { backgroundColor: '#E6F8E9' }]}>
            <Ionicons name="cafe" size={32} color="#51CF66" />
          </View>
          <View style={styles.featureContent}>
            <ThemedText style={styles.featureTitle}>Menu</ThemedText>
            <ThemedText style={styles.featureSubtitle}>Update products and pricing</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D1C4B3" />
        </TouchableOpacity>
      </View>
      
      {/* Order Summary Section */}
      <ThemedText style={styles.sectionTitle}>Orders Summary</ThemedText>
      <ThemedView style={styles.orderSummaryContainer}>
        <View style={styles.orderSummaryItem}>
          <View style={[styles.orderStatusIndicator, styles.pendingIndicator]} />
          <ThemedText style={styles.orderStatusLabel}>Pending</ThemedText>
          <ThemedText style={styles.orderStatusCount}>{orderStats.pending}</ThemedText>
        </View>
        
        <View style={styles.orderSummaryItem}>
          <View style={[styles.orderStatusIndicator, styles.processingIndicator]} />
          <ThemedText style={styles.orderStatusLabel}>Processing</ThemedText>
          <ThemedText style={styles.orderStatusCount}>{orderStats.processing}</ThemedText>
        </View>
        
        <View style={styles.orderSummaryItem}>
          <View style={[styles.orderStatusIndicator, styles.completedIndicator]} />
          <ThemedText style={styles.orderStatusLabel}>Completed</ThemedText>
          <ThemedText style={styles.orderStatusCount}>{orderStats.completed}</ThemedText>
        </View>
      </ThemedView>
      
      {/* Popular Items */}
      <ThemedText style={styles.sectionTitle}>Popular Items</ThemedText>
      <ThemedView style={styles.popularContainer}>
        {dashboardSummary.popularItems.map((item, index) => (
          <View key={index} style={[
            styles.popularItem,
            index === dashboardSummary.popularItems.length - 1 && { borderBottomWidth: 0 }
          ]}>
            <View style={styles.popularRank}>
              <ThemedText style={styles.popularRankText}>{index + 1}</ThemedText>
            </View>
            <ThemedText style={styles.popularName}>{item.name}</ThemedText>
            <ThemedText style={styles.popularSales}>{item.sales} sold</ThemedText>
          </View>
        ))}
      </ThemedView>
      
      {/* Performance Summary */}
      <ThemedText style={styles.sectionTitle}>Month Summary</ThemedText>
      <ThemedView style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Total Revenue</ThemedText>
            <ThemedText style={styles.summaryValue}>${dashboardSummary.revenue.thisMonth}</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Total Orders</ThemedText>
            <ThemedText style={styles.summaryValue}>{orderStats.pending + orderStats.processing + orderStats.completed}</ThemedText>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Loyalty Distribution</ThemedText>
            <View style={styles.loyaltyDistribution}>
              <View style={[styles.loyaltyBar, styles.bronzeBar, { flex: dashboardSummary.loyalty.bronze }]} />
              <View style={[styles.loyaltyBar, styles.silverBar, { flex: dashboardSummary.loyalty.silver }]} />
              <View style={[styles.loyaltyBar, styles.goldBar, { flex: dashboardSummary.loyalty.gold }]} />
            </View>
            <View style={styles.loyaltyLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#CD7F32' }]} />
                <ThemedText style={styles.legendText}>Bronze</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#C0C0C0' }]} />
                <ThemedText style={styles.legendText}>Silver</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
                <ThemedText style={styles.legendText}>Gold</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryLabel}>Customer Growth</ThemedText>
            <ThemedText style={styles.growthValue}>+{Math.round((dashboardSummary.customers.new / dashboardSummary.customers.total) * 100)}%</ThemedText>
            <ThemedText style={styles.growthText}>from last month</ThemedText>
          </View>
        </View>
      </ThemedView>
      
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>BrewArt Admin Dashboard v1.0</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#F4EDE4',
    paddingTop: 20,
    paddingBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8E6E53',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    marginTop: -30,
  },
  statCard: {
    width: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: '2%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E6E53',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    paddingHorizontal: 20,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#8E6E53',
  },
  popularContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  popularRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  popularRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8E6E53',
  },
  popularName: {
    flex: 1,
    fontSize: 16,
    color: '#3C2A15',
  },
  popularSales: {
    fontSize: 14,
    color: '#8E6E53',
  },
  summaryContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  loyaltyDistribution: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  loyaltyBar: {
    height: '100%',
  },
  bronzeBar: {
    backgroundColor: '#CD7F32',
  },
  silverBar: {
    backgroundColor: '#C0C0C0',
  },
  goldBar: {
    backgroundColor: '#FFD700',
  },
  loyaltyLegend: {
    flexDirection: 'row',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#8E6E53',
  },
  growthValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#43A047',
  },
  growthText: {
    fontSize: 12,
    color: '#8E6E53',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#B5A99A',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#FF6B6B',
    fontWeight: 'normal',
  },
  orderSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  orderSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  orderStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  pendingIndicator: {
    backgroundColor: '#FF9800',
  },
  processingIndicator: {
    backgroundColor: '#4DABF7',
  },
  completedIndicator: {
    backgroundColor: '#51CF66',
  },
  orderStatusLabel: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 4,
  },
  orderStatusCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
}); 