import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from '../screens/CameraScreen';
import OCRResultScreen from '../screens/OCRResultScreen';

export type ScanStackParamList = {
  CameraMain: undefined;
  OCRResult: { imageUri: string };
};

const Stack = createNativeStackNavigator<ScanStackParamList>();

export default function ScanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CameraMain" component={CameraScreen} />
      <Stack.Screen name="OCRResult" component={OCRResultScreen} />
    </Stack.Navigator>
  );
}
