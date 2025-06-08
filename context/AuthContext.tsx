import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

interface User {
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
  birthday?: string; // Format: 'YYYY-MM-DD'
  points: number;
  isGuest?: boolean; // Flag to identify guest users
  token?: string; // JWT token for authentication
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  registerUser: (userData: User & { password: string }) => Promise<{ success: boolean; message?: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => Promise<void>;
  updatePoints: (points: number) => Promise<void>;
  updateBirthday: (birthday: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  getUserPoints: () => number;
  continueAsGuest: () => Promise<void>; // New function for guest login
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUser(parsedData);
      }
    } catch (error) {
      console.error('Error checking authentication status', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (userData: User & { password: string }) => {
    try {
      setIsLoading(true);
      
      // Create initialization data for new user
      const newUserData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        birthday: userData.birthday,
        points: 0, // Initialize with zero points
        favoriteDrinks: [], // Initialize with empty favorites
        dietaryPreferences: [] // Initialize with empty preferences
      };
      
      // Use the authService to register the user with the backend
      const result = await authService.registerUser(newUserData);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Error registering user', error);
      return { success: false, message: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Use the authService to login with the backend
      const result = await authService.loginUser(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Error logging in', error);
      return { success: false, message: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logoutUser();
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const updatePoints = async (pointsToAdd: number) => {
    if (!user) return;
    
    try {
      const action = pointsToAdd >= 0 ? 'add' : 'subtract';
      const pointsValue = Math.abs(pointsToAdd);
      
      const result = await authService.updatePoints(pointsValue, action);
      
      if (result.success) {
        // Get updated user profile
        const profileResult = await authService.getUserProfile();
        if (profileResult.success) {
          setUser(profileResult.user);
        }
      }
    } catch (error) {
      console.error('Error updating points', error);
    }
  };
  
  const updateBirthday = async (birthday: string) => {
    if (!user) return;
    
    try {
      const result = await authService.updateUserProfile({ birthday });
      
      if (result.success && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error updating birthday', error);
    }
  };
  
  const updateName = async (name: string) => {
    if (!user) return;
    
    try {
      const result = await authService.updateUserProfile({ name });
      
      if (result.success && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error updating name', error);
    }
  };
  
  const getUserPoints = () => {
    if (!user) return 0;
    return user.points;
  };

  // Function to continue as guest
  const continueAsGuest = async () => {
    try {
      setIsLoading(true);
      
      const result = await authService.continueAsGuest();
      
      if (result.success && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error setting up guest user', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading,
        registerUser,
        loginUser, 
        logoutUser,
        updatePoints,
        updateBirthday,
        updateName,
        getUserPoints,
        continueAsGuest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 