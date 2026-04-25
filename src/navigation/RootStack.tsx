import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import NameInputScreen from '../screens/NameInputScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  NameInput: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="NameInput" component={NameInputScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
    </Stack.Navigator>
  );
}

export default RootStack;
