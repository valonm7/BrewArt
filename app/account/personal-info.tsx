import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';

export default function PersonalInfoScreen() {
  const { user, updateBirthday, updateName } = useAuth();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  
  useEffect(() => {
    if (user) {
      // Split name into first and last name (assuming format is "First Last")
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      
      setEmail(user.email || '');
      setBirthday(user.birthday || '');
    }
  }, [user]);
  
  const updateUserInfo = async () => {
    // Validate inputs
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }
    
    try {
      // Update name (combining first and last name)
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateName(fullName);
      
      // Update birthday if provided
      if (birthday) {
        if (!validateDate(birthday)) {
          Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
          return;
        }
        await updateBirthday(birthday);
      }
      
      Alert.alert('Success', 'Your information has been updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating user info', error);
      Alert.alert('Error', 'Failed to update your information. Please try again.');
    }
  };
  
  // Simple date validation
  const validateDate = (date: string) => {
    // Basic format check (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    // Check if it's a valid date
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };
  
  // Format birthday input (YYYY-MM-DD)
  const formatBirthday = (text: string) => {
    // Remove any non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Format as YYYY-MM-DD
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{
          title: 'Personal Information',
          headerBackTitle: 'Profile',
          headerStyle: { backgroundColor: '#F4EDE4' },
          headerTintColor: '#3C2A15',
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>First Name</ThemedText>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Your first name"
              placeholderTextColor="#B5A99A"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Last Name</ThemedText>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Your last name"
              placeholderTextColor="#B5A99A"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email Address</ThemedText>
            <TextInput
              style={[styles.input, { opacity: 0.7 }]}
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
            <ThemedText style={styles.helperText}>
              Email address cannot be changed
            </ThemedText>
          </View>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Birthday (YYYY-MM-DD)</ThemedText>
            <TextInput
              style={styles.input}
              value={birthday}
              onChangeText={(text) => setBirthday(formatBirthday(text))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#B5A99A"
              maxLength={10}
            />
            <ThemedText style={styles.helperText}>
              Your birthday helps us celebrate with you!
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={updateUserInfo}
          >
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF7',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C2A15',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6D9CC',
    color: '#3C2A15',
  },
  helperText: {
    fontSize: 12,
    color: '#8E6E53',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#8E6E53',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 