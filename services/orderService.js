import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

// Helper function to generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', orderData);
    
    // Call the backend API to create the order
    const response = await apiRequest('/orders', 'POST', orderData, true);
    console.log('Order created with ID:', response.id);
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Fallback to localStorage if API fails
    console.log('Falling back to local storage for order creation');
    return createOrderLocally(orderData);
  }
};

// Fallback function to create orders locally
const createOrderLocally = async (orderData) => {
  try {
    const orderId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const orderWithTimestamp = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    const existingOrdersString = await AsyncStorage.getItem('orders');
    const existingOrders = existingOrdersString ? JSON.parse(existingOrdersString) : [];
    
    const updatedOrders = [...existingOrders, orderWithTimestamp];
    await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    return orderWithTimestamp;
  } catch (error) {
    console.error('Error creating local order:', error);
    throw error;
  }
};

// Get all orders for admin dashboard
export const getAllOrders = async () => {
  try {
    console.log('Fetching all orders...');
    
    // Call the backend API to get all orders
    const response = await apiRequest('/orders/admin', 'GET', null, true);
    console.log('Fetched orders from API:', response);
    return response;
  } catch (error) {
    console.error('Error getting orders from API:', error);
    
    // Fallback to localStorage if API fails
    console.log('Falling back to local storage for getting orders');
    return getAllOrdersLocally();
  }
};

// Fallback function to get orders locally
const getAllOrdersLocally = async () => {
  try {
    const ordersString = await AsyncStorage.getItem('orders');
    
    if (!ordersString) {
      return [];
    }
    
    const orders = JSON.parse(ordersString);
    // Sort by createdAt in descending order
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return orders;
  } catch (error) {
    console.error('Error getting local orders:', error);
    return [];
  }
};

// Get orders for a specific user
export const getUserOrders = async (userId) => {
  try {
    // Call the backend API to get user orders
    const response = await apiRequest('/orders/user', 'GET', null, true);
    return response;
  } catch (error) {
    console.error('Error getting user orders from API:', error);
    
    // Fallback to localStorage if API fails
    console.log('Falling back to local storage for getting user orders');
    return getUserOrdersLocally(userId);
  }
};

// Fallback function to get user orders locally
const getUserOrdersLocally = async (userId) => {
  try {
    const ordersString = await AsyncStorage.getItem('orders');
    
    if (!ordersString) {
      return [];
    }
    
    const allOrders = JSON.parse(ordersString);
    // Filter by userId and sort by createdAt
    const userOrders = allOrders
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return userOrders;
  } catch (error) {
    console.error('Error getting local user orders:', error);
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // Call the backend API to update order status
    const response = await apiRequest(`/orders/${orderId}/status`, 'PUT', { status: newStatus }, true);
    return response;
  } catch (error) {
    console.error('Error updating order status in API:', error);
    
    // Fallback to localStorage if API fails
    console.log('Falling back to local storage for updating order status');
    return updateOrderStatusLocally(orderId, newStatus);
  }
};

// Fallback function to update order status locally
const updateOrderStatusLocally = async (orderId, newStatus) => {
  try {
    const ordersString = await AsyncStorage.getItem('orders');
    
    if (!ordersString) {
      throw new Error('No orders found');
    }
    
    const allOrders = JSON.parse(ordersString);
    const updatedOrders = allOrders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });
    
    await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    const updatedOrder = updatedOrders.find(order => order.id === orderId);
    return updatedOrder;
  } catch (error) {
    console.error('Error updating local order status:', error);
    throw error;
  }
}; 