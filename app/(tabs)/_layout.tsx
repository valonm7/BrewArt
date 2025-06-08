import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8E6E53',
        tabBarInactiveTintColor: '#B5A99A',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <View style={{ backgroundColor: '#F4EDE4', flex: 1 }} />,
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 10,
        },
        tabBarStyle: {
          backgroundColor: '#F4EDE4',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: 'Order Now',
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="giftcard"
        options={{
          title: 'Giftcard',
          tabBarIcon: ({ color }) => <Ionicons name="gift-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
