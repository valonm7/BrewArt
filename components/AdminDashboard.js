import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addSampleOrders, getAllOrders, updateOrderStatus } from '../services/orderService';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getAllOrders();
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh orders after update
      loadOrders();
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    }
  };

  // Function to load sample orders
  const loadSampleOrders = async () => {
    try {
      setLoading(true);
      await addSampleOrders();
      await loadOrders();
    } catch (err) {
      setError('Failed to add sample orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    // Handle Firestore Timestamp with toDate method
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleString();
    } 
    // Handle ISO string date
    else if (typeof date === 'string') {
      return new Date(date).toLocaleString();
    } 
    // Handle Date object
    else if (date instanceof Date) {
      return date.toLocaleString();
    } 
    else {
      return 'Invalid date format';
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>Order #{item.id}</Text>
      <Text style={styles.orderInfo}>Customer: {item.customer}</Text>
      <Text style={styles.orderInfo}>Status: {item.status}</Text>
      <Text style={styles.orderInfo}>
        Date: {formatDate(item.date || item.createdAt)}
      </Text>
      
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Items:</Text>
        <Text style={styles.itemsList}>{item.items}</Text>
      </View>
      
      {item.tableNumber && (
        <Text style={styles.orderInfo}>Table: #{item.tableNumber}</Text>
      )}
      
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Details:</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Subtotal:</Text>
          <Text style={styles.paymentValue}>${item.subtotal?.toFixed(2) || item.total?.toFixed(2)}</Text>
        </View>
        {item.discount > 0 && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Discount:</Text>
            <Text style={styles.paymentValue}>-${item.discount?.toFixed(2)}</Text>
          </View>
        )}
        {item.tax > 0 && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tax:</Text>
            <Text style={styles.paymentValue}>${item.tax?.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Total:</Text>
          <Text style={[styles.paymentValue, styles.totalValue]}>${item.total?.toFixed(2)}</Text>
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
      
      <View style={styles.statusButtons}>
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'pending' && styles.activeStatus]}
          onPress={() => handleStatusUpdate(item.id, 'pending')}
        >
          <Text style={styles.buttonText}>Pending</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'preparing' && styles.activeStatus]}
          onPress={() => handleStatusUpdate(item.id, 'preparing')}
        >
          <Text style={styles.buttonText}>Preparing</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'ready' && styles.activeStatus]}
          onPress={() => handleStatusUpdate(item.id, 'ready')}
        >
          <Text style={styles.buttonText}>Ready</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.statusButton, item.status === 'completed' && styles.activeStatus]}
          onPress={() => handleStatusUpdate(item.id, 'completed')}
        >
          <Text style={styles.buttonText}>Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.toolbarContainer}>
        <TouchableOpacity 
          style={styles.sampleOrdersButton}
          onPress={loadSampleOrders}
        >
          <Text style={styles.sampleOrdersButtonText}>Load Sample Orders (Valon)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadOrders}
        >
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 14,
    color: '#333',
  },
  paymentSection: {
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  notesSection: {
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statusButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    alignItems: 'center',
  },
  activeStatus: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#333',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  toolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  sampleOrdersButton: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  sampleOrdersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
});

export default AdminDashboard; 