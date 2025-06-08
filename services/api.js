import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Helper function to determine the API base URL
const getApiBaseUrl = () => {
  // For iOS simulators, use localhost
  if (Platform.OS === 'ios' && Platform.isPad === false && !__DEV__) {
    return 'http://localhost:5001/api';
  } 
  // For Android emulators or physical devices, use the IP address
  return 'http://192.168.1.7:5001/api';
};

// Use the helper function to set the base URL
const API_BASE_URL = getApiBaseUrl();

// Track server connection status
let serverConnectionStatus = {
  isConnected: false,
  lastChecked: null,
  error: null
};

// Function to check server connection
export const checkServerConnection = async () => {
  try {
    const start = Date.now();
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}`);
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      serverConnectionStatus = {
        isConnected: true,
        lastChecked: new Date(),
        error: null,
        responseTime
      };
      return { success: true, responseTime };
    } else {
      serverConnectionStatus = {
        isConnected: false,
        lastChecked: new Date(),
        error: 'Server responded with an error status',
        responseTime
      };
      return { success: false, error: 'Server error', responseTime };
    }
  } catch (error) {
    serverConnectionStatus = {
      isConnected: false,
      lastChecked: new Date(),
      error: error.message
    };
    return { success: false, error: error.message };
  }
};

// Get the current server connection status
export const getServerStatus = () => {
  return serverConnectionStatus;
};

// Utility to get the auth token
export const getToken = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    console.log('Retrieved userData from storage:', userData);
    
    if (userData) {
      const parsedData = JSON.parse(userData);
      console.log('Parsed user data token:', parsedData.token ? 'Has token' : 'No token');
      
      if (parsedData.token) {
        return parsedData.token;
      } else {
        console.warn('User data exists but no token is present');
      }
    } else {
      console.warn('No user data found in AsyncStorage');
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Base API request function
export const apiRequest = async (endpoint, method = 'GET', data = null, requiresAuth = false) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if required
    if (requiresAuth) {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method,
      headers,
    };
    
    // Add body data for non-GET requests
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    console.log(`Making ${method} request to ${url}`);
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Something went wrong');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Simple test function to verify backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}`);
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error connecting to backend:', error);
    throw error;
  }
};
