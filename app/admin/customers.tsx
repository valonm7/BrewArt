import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';

// Sample customer data
const sampleCustomers = [
  {
    id: '1',
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    phone: '+1 (555) 123-4567',
    loyaltyTier: 'gold',
    loyaltyPoints: 1250,
    orders: 42,
    lastVisit: '2023-12-03',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    id: '2',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '+1 (555) 234-5678',
    loyaltyTier: 'silver',
    loyaltyPoints: 720,
    orders: 25,
    lastVisit: '2023-12-10',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    id: '3',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '+1 (555) 345-6789',
    loyaltyTier: 'bronze',
    loyaltyPoints: 380,
    orders: 15,
    lastVisit: '2023-12-15',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+1 (555) 456-7890',
    loyaltyTier: 'gold',
    loyaltyPoints: 1560,
    orders: 53,
    lastVisit: '2023-12-05',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    email: 'jessica.t@example.com',
    phone: '+1 (555) 567-8901',
    loyaltyTier: 'bronze',
    loyaltyPoints: 210,
    orders: 8,
    lastVisit: '2023-12-18',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg'
  },
  {
    id: '6',
    name: 'Robert Brown',
    email: 'robert.b@example.com',
    phone: '+1 (555) 678-9012',
    loyaltyTier: 'silver',
    loyaltyPoints: 620,
    orders: 22,
    lastVisit: '2023-12-08',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg'
  },
  {
    id: '7',
    name: 'Amanda Garcia',
    email: 'amanda.g@example.com',
    phone: '+1 (555) 789-0123',
    loyaltyTier: 'bronze',
    loyaltyPoints: 300,
    orders: 12,
    lastVisit: '2023-12-12',
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg'
  },
  {
    id: '8',
    name: 'James Lee',
    email: 'james.lee@example.com',
    phone: '+1 (555) 890-1234',
    loyaltyTier: 'silver',
    loyaltyPoints: 580,
    orders: 19,
    lastVisit: '2023-12-09',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
  }
];

export default function AdminCustomersScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState(sampleCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState(sampleCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  
  // Check admin session
  useEffect(() => {
    const verifyAdminSession = async () => {
      try {
        const session = await AsyncStorage.getItem('adminSession');
        if (session !== 'true') {
          // Redirect to login if not authenticated
          router.replace('/admin/login');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Session verification error', error);
        router.replace('/admin/login');
      }
    };
    
    verifyAdminSession();
  }, [router]);

  // Apply search and filters
  useEffect(() => {
    let result = [...customers];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );
    }
    
    // Apply tier filter
    if (filterOption !== 'all') {
      result = result.filter(customer => customer.loyaltyTier === filterOption);
    }
    
    setFilteredCustomers(result);
  }, [searchQuery, filterOption, customers]);

  const handleCustomerPress = (customer) => {
    setSelectedCustomer(customer);
    setModalVisible(true);
  };

  const renderLoyaltyBadge = (tier) => {
    let bgColor, textColor, icon;
    
    switch(tier) {
      case 'gold':
        bgColor = '#FFF7E5';
        textColor = '#FFAB00';
        icon = 'star';
        break;
      case 'silver':
        bgColor = '#F5F5F5';
        textColor = '#757575';
        icon = 'star-half';
        break;
      case 'bronze':
        bgColor = '#FFF0E6';
        textColor = '#B87A62';
        icon = 'star-outline';
        break;
      default:
        bgColor = '#F5F5F5';
        textColor = '#757575';
        icon = 'star-outline';
    }
    
    return (
      <View style={[styles.loyaltyBadge, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={14} color={textColor} style={{ marginRight: 4 }} />
        <ThemedText style={[styles.loyaltyText, { color: textColor }]}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </ThemedText>
      </View>
    );
  };

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.customerCard}
      onPress={() => handleCustomerPress(item)}
    >
      <Image 
        source={{ uri: item.avatar }} 
        style={styles.avatar}
      />
      <View style={styles.customerInfo}>
        <ThemedText style={styles.customerName}>{item.name}</ThemedText>
        <ThemedText style={styles.customerEmail}>{item.email}</ThemedText>
        <View style={styles.customerDetails}>
          {renderLoyaltyBadge(item.loyaltyTier)}
          <View style={styles.customerStat}>
            <Ionicons name="cafe-outline" size={14} color="#8E6E53" />
            <ThemedText style={styles.statText}>{item.orders} orders</ThemedText>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#D1C4B3" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Customer Management',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="#3C2A15" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color="#8E6E53" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor="#B5A99A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={22} color="#8E6E53" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filterOption === 'all' && styles.activeFilter]}
          onPress={() => setFilterOption('all')}
        >
          <ThemedText style={[styles.filterText, filterOption === 'all' && styles.activeFilterText]}>
            All
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filterOption === 'gold' && styles.activeFilter]}
          onPress={() => setFilterOption('gold')}
        >
          <ThemedText style={[styles.filterText, filterOption === 'gold' && styles.activeFilterText]}>
            Gold
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filterOption === 'silver' && styles.activeFilter]}
          onPress={() => setFilterOption('silver')}
        >
          <ThemedText style={[styles.filterText, filterOption === 'silver' && styles.activeFilterText]}>
            Silver
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filterOption === 'bronze' && styles.activeFilter]}
          onPress={() => setFilterOption('bronze')}
        >
          <ThemedText style={[styles.filterText, filterOption === 'bronze' && styles.activeFilterText]}>
            Bronze
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ThemedText style={styles.resultCount}>
        {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
      </ThemedText>
      
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Customer Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedCustomer && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Customer Details</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#3C2A15" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.customerProfile}>
                <Image 
                  source={{ uri: selectedCustomer.avatar }} 
                  style={styles.profileAvatar}
                />
                <View style={styles.profileInfo}>
                  <ThemedText style={styles.profileName}>{selectedCustomer.name}</ThemedText>
                  <View style={styles.profileBadge}>
                    {renderLoyaltyBadge(selectedCustomer.loyaltyTier)}
                  </View>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={22} color="#8E6E53" />
                  <ThemedText style={styles.detailText}>{selectedCustomer.email}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={22} color="#8E6E53" />
                  <ThemedText style={styles.detailText}>{selectedCustomer.phone}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={22} color="#8E6E53" />
                  <ThemedText style={styles.detailText}>Last visit: {selectedCustomer.lastVisit}</ThemedText>
                </View>
              </View>
              
              <View style={styles.statsSection}>
                <View style={styles.statCard}>
                  <ThemedText style={styles.statValue}>{selectedCustomer.orders}</ThemedText>
                  <ThemedText style={styles.statLabel}>Orders</ThemedText>
                </View>
                <View style={styles.statCard}>
                  <ThemedText style={styles.statValue}>{selectedCustomer.loyaltyPoints}</ThemedText>
                  <ThemedText style={styles.statLabel}>Points</ThemedText>
                </View>
                <View style={styles.statCard}>
                  <ThemedText style={styles.statValue}>${(selectedCustomer.orders * 15).toFixed(2)}</ThemedText>
                  <ThemedText style={styles.statLabel}>Spent</ThemedText>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F4EDE4' }]}>
                  <Ionicons name="mail" size={22} color="#8E6E53" />
                  <ThemedText style={styles.actionButtonText}>Message</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#8E6E53' }]}>
                  <Ionicons name="create-outline" size={22} color="#FFFFFF" />
                  <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Edit Profile</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#F4EDE4',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#3C2A15',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFCF7',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F4EDE4',
  },
  activeFilter: {
    backgroundColor: '#8E6E53',
  },
  filterText: {
    fontSize: 14,
    color: '#8E6E53',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 14,
    color: '#8E6E53',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  customerEmail: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 4,
  },
  customerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  loyaltyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#8E6E53',
    marginLeft: 4,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  customerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: 'row',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#3C2A15',
    marginLeft: 12,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F4EDE4',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E6E53',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#8E6E53',
  },
}); 