import React from 'react';
import { Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import AssistantScreen from '../screens/AssistantScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: string; inactive: string }> = {
  Home:      { active: '🏠', inactive: '🏡' },
  Assistant: { active: '🤖', inactive: '🧠' },
  History:   { active: '🕒', inactive: '📜' },
  Guide:     { active: '📘', inactive: '📗' },
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Trang Chủ',
  Assistant: 'Trợ lý',
  History: 'Lịch sử',
  Guide: 'Hướng dẫn',
};

function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
        tabBarActiveTintColor: '#1f6feb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20 }}>
            {focused
              ? ICONS[route.name]?.active
              : ICONS[route.name]?.inactive}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Assistant" component={AssistantScreen} />
      <Tab.Screen
        name="History"
        component={PlaceholderScreen}
        initialParams={{ label: 'Lịch sử' }}
      />
      <Tab.Screen
        name="Guide"
        component={PlaceholderScreen}
        initialParams={{ label: 'Hướng dẫn' }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
