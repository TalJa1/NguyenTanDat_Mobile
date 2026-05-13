import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuideScreen from '../screens/GuideScreen';
import GuideDetailScreen from '../screens/GuideDetailScreen';

export type GuideStackParamList = {
  GuideMain: undefined;
  GuideDetail: {
    guideId: string;
    title: string;
    category: 'cleaning' | 'classification' | 'emergency';
  };
};

const Stack = createNativeStackNavigator<GuideStackParamList>();

function GuideStack() {
  return (
    <Stack.Navigator
      initialRouteName="GuideMain"
      screenOptions={{
        headerStyle: { backgroundColor: '#1d4ed8' },
        headerTintColor: '#ffffff',
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen
        name="GuideMain"
        component={GuideScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </Stack.Navigator>
  );
}

export default GuideStack;