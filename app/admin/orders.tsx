import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Order, orderService } from '@/services/OrderService';

export default function AdminOrdersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load orders when component mounts
  useEffect(() => {
    loadOrders();
  }, []);
  
  // Function to load orders from the service
  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load sample orders for Valon
  const loadSampleOrders = async () => {
    setLoading(true);
    try {
      const { addSampleOrders } = require('@/services/OrderService');
      await addSampleOrders();
      await loadOrders();
    } catch (error) {
      console.error('Error adding sample orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'processing' | 'completed') => {
    const success = await orderService.updateOrderStatus(orderId, newStatus);
    if (success) {
      // Refresh orders list
      loadOrders();
    }
  };
  
  // Render order item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push(`/admin/order-detail?id=${item.id}` as any)}
    >
      <View style={styles.orderHeader}>
        <ThemedText style={styles.orderNumber}>Order #{item.id}</ThemedText>
        <View style={[
          styles.orderStatusBadge,
          item.status === 'pending' ? styles.statusPending : 
          item.status === 'processing' ? styles.statusProcessing : 
          styles.statusCompleted
        ]}>
          <ThemedText style={styles.orderStatusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.orderCustomerRow}>
        <Ionicons name="person-outline" size={16} color="#8E6E53" />
        <ThemedText style={styles.orderCustomer}>{item.customer}</ThemedText>
      </View>
      
      <View style={styles.orderTimeRow}>
        <Ionicons name="time-outline" size={16} color="#8E6E53" />
        <ThemedText style={styles.orderTime}>{formatDate(item.date)}</ThemedText>
      </View>
      
      {item.tableNumber && (
        <View style={styles.orderTableRow}>
          <Ionicons name="restaurant-outline" size={16} color="#8E6E53" />
          <ThemedText style={styles.orderTable}>Table {item.tableNumber}</ThemedText>
        </View>
      )}
      
      <View style={styles.orderItems}>
        <ThemedText style={styles.orderItemText}>{item.items}</ThemedText>
      </View>
      
      <View style={styles.orderFooter}>
        <ThemedText style={styles.orderTotal}>${item.total.toFixed(2)}</ThemedText>
        <View style={styles.orderActions}>
          {item.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.statusButton, styles.processingButton]}
              onPress={() => handleStatusChange(item.id, 'processing')}
            >
              <ThemedText style={styles.statusButtonText}>Start Processing</ThemedText>
            </TouchableOpacity>
          )}
          
          {item.status === 'processing' && (
            <TouchableOpacity 
              style={[styles.statusButton, styles.completedButton]}
              onPress={() => handleStatusChange(item.id, 'completed')}
            >
              <ThemedText style={styles.statusButtonText}>Mark Completed</ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.viewOrderButton}
            onPress={() => router.push(`/admin/order-detail?id=${item.id}` as any)}
          >
            <ThemedText style={styles.viewOrderButtonText}>View Details</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Orders Management',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                style={[styles.headerButton, { marginRight: 10 }]} 
                onPress={loadSampleOrders}
              >
                <Ionicons name="add-circle-outline" size={24} color="#8E6E53" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={loadOrders}
              >
                <Ionicons name="refresh" size={24} color="#8E6E53" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E6E53" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer or order ID"
            placeholderTextColor="#B5A99A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
          onPress={() => setFilterStatus('all')}
        >
          <ThemedText style={[styles.filterText, filterStatus === 'all' && styles.activeFilterText]}>
            All
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'pending' && styles.activeFilter]}
          onPress={() => setFilterStatus('pending')}
        >
          <ThemedText style={[styles.filterText, filterStatus === 'pending' && styles.activeFilterText]}>
            Pending
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'processing' && styles.activeFilter]}
          onPress={() => setFilterStatus('processing')}
        >
          <ThemedText style={[styles.filterText, filterStatus === 'processing' && styles.activeFilterText]}>
            Processing
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'completed' && styles.activeFilter]}
          onPress={() => setFilterStatus('completed')}
        >
          <ThemedText style={[styles.filterText, filterStatus === 'completed' && styles.activeFilterText]}>
            Completed
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.sampleOrdersButton}
        onPress={loadSampleOrders}
      >
        <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
        <ThemedText style={styles.sampleOrdersButtonText}>Add Sample Orders</ThemedText>
      </TouchableOpacity>
      
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.ordersList}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#E6D9CC" />
            <ThemedText style={styles.emptyTitle}>
              {loading ? 'Loading orders...' : 'No orders found'}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {!loading && 'Any new orders will appear here'}
            </ThemedText>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#F4EDE4',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#3C2A15',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F4EDE4',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'white',
  },
  activeFilter: {
    backgroundColor: '#8E6E53',
  },
  filterText: {
    fontSize: 14,
    color: '#8E6E53',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  orderStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F4EDE4',
  },
  statusPending: {
    backgroundColor: '#FFF0E0',
  },
  statusProcessing: {
    backgroundColor: '#E7F5FF',
  },
  statusCompleted: {
    backgroundColor: '#E6F8E9',
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8E6E53',
  },
  orderCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderCustomer: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3C2A15',
  },
  orderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderTime: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E6E53',
  },
  orderTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderTable: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E6E53',
  },
  orderItems: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F4EDE4',
    marginVertical: 8,
  },
  orderItemText: {
    fontSize: 14,
    color: '#3C2A15',
  },
  orderFooter: {
    marginTop: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 8,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    flex: 1,
    alignItems: 'center',
  },
  processingButton: {
    backgroundColor: '#E7F5FF',
  },
  completedButton: {
    backgroundColor: '#E6F8E9',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3C2A15',
  },
  viewOrderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F4EDE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewOrderButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8E6E53',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E6E53',
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
  },
  sampleOrdersButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#8E6E53',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 0,
  },
  sampleOrdersButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 