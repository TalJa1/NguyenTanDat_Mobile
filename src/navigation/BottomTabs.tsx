import React from 'react';
import { Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: string; inactive: string }> = {
  Home:          { active: '🏠', inactive: '🏡' },
  Search:        { active: '🔍', inactive: '🔎' },
  Notifications: { active: '🔔', inactive: '🔕' },
  Profile:       { active: '👤', inactive: '👥' },
};

function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Search"
        component={PlaceholderScreen}
        initialParams={{ label: 'Search' }}
      />
      <Tab.Screen
        name="Notifications"
        component={PlaceholderScreen}
        initialParams={{ label: 'Notifications' }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        initialParams={{ label: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
