import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest('/users/register', 'POST', userData);
    
    // Store user data in AsyncStorage including the JWT token
    await AsyncStorage.setItem('userData', JSON.stringify(response));
    
    return { success: true, user: response };
  } catch (error) {
    console.error('Registration failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Login a user
export const loginUser = async (email, password) => {
  try {
    const response = await apiRequest('/users/login', 'POST', { email, password });
    
    // Store user data in AsyncStorage including the JWT token
    await AsyncStorage.setItem('userData', JSON.stringify(response));
    
    return { success: true, user: response };
  } catch (error) {
    console.error('Login failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Continue as guest
export const continueAsGuest = async () => {
  try {
    const response = await apiRequest('/users/guest', 'POST');
    
    // Store guest user data in AsyncStorage including the JWT token
    await AsyncStorage.setItem('userData', JSON.stringify(response));
    
    return { success: true, user: response };
  } catch (error) {
    console.error('Guest login failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Logout a user
export const logoutUser = async () => {
  try {
    // Simply remove the user data from AsyncStorage
    await AsyncStorage.removeItem('userData');
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiRequest('/users/profile', 'GET', null, true);
    return { success: true, user: response };
  } catch (error) {
    console.error('Get profile failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiRequest('/users/profile', 'PUT', userData, true);
    
    // Update the stored user data
    const currentUserData = await AsyncStorage.getItem('userData');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      const updatedData = { ...parsedData, ...response };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
    }
    
    return { success: true, user: response };
  } catch (error) {
    console.error('Update profile failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Update user points
export const updatePoints = async (points, action = 'add') => {
  try {
    const response = await apiRequest('/users/points', 'PUT', { points, action }, true);
    
    // Update points in the stored user data
    const currentUserData = await AsyncStorage.getItem('userData');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      parsedData.points = response.points;
      await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
    }
    
    return { success: true, points: response.points };
  } catch (error) {
    console.error('Update points failed:', error.message);
    return { success: false, message: error.message };
  }
}; 