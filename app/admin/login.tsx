import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// In a real app, these would be stored securely in a backend
const ADMIN_CODE = '123456';
const ADMIN_CREDENTIALS = {
  email: 'admin@brewart.com',
  password: 'admin123'
};

export default function AdminLoginScreen() {
  const [loginMethod, setLoginMethod] = useState('credentials'); // 'code' or 'credentials'
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCodeLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simple validation
      if (code.trim() === '') {
        Alert.alert('Error', 'Please enter the admin code');
        setIsLoading(false);
        return;
      }
      
      // Verify the admin code
      if (code === ADMIN_CODE) {
        // Store admin session
        await AsyncStorage.setItem('adminSession', 'true');
        
        // Navigate to admin dashboard
        router.replace('/admin/dashboard');
      } else {
        Alert.alert('Error', 'Invalid admin code');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Admin login error', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simple validation
      if (email.trim() === '' || password.trim() === '') {
        Alert.alert('Error', 'Please enter both email and password');
        setIsLoading(false);
        return;
      }
      
      // Verify credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Store admin session
        await AsyncStorage.setItem('adminSession', 'true');
        
        // Navigate to admin dashboard
        router.replace('/admin/dashboard');
      } else {
        Alert.alert('Error', 'Invalid email or password');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Admin login error', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (loginMethod === 'code') {
      handleCodeLogin();
    } else {
      handleCredentialsLogin();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Stack.Screen 
        options={{
          title: 'Admin Login',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-outline" size={60} color="#8E6E53" />
        </View>
        
        <ThemedText style={styles.title}>Admin Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>Login with your admin credentials</ThemedText>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, loginMethod === 'credentials' && styles.activeToggle]}
            onPress={() => setLoginMethod('credentials')}
          >
            <ThemedText style={[styles.toggleText, loginMethod === 'credentials' && styles.activeToggleText]}>
              Email & Password
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, loginMethod === 'code' && styles.activeToggle]}
            onPress={() => setLoginMethod('code')}
          >
            <ThemedText style={[styles.toggleText, loginMethod === 'code' && styles.activeToggleText]}>
              Code
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {loginMethod === 'code' ? (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Enter admin code"
              placeholderTextColor="#B5A99A"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            <ThemedText style={styles.infoText}>
              Enter the 6-digit code provided by your administrator
            </ThemedText>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Admin Email"
              placeholderTextColor="#B5A99A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#B5A99A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <ThemedText style={styles.infoText}>
              Use your admin credentials to access the dashboard
            </ThemedText>
          </>
        )}
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <ThemedText style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>
            Back to Main App
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F4EDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C2A15',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E6E53',
    marginBottom: 24,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4EDE4',
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#8E6E53',
  },
  activeToggleText: {
    fontWeight: '600',
    color: '#3C2A15',
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6D9CC',
    fontSize: 16,
    color: '#3C2A15',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#8E6E53',
    marginBottom: 24,
    textAlign: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#8E6E53',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#8E6E53',
    fontSize: 14,
  },
}); 