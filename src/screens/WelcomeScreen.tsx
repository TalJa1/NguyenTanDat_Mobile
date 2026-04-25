import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStack';
import { getStorageValue } from '../storage/storage';

type WelcomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

const welcomeImage = require('../assets/welcome.png');

function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavigationProp>();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function navigateNext() {
      try {
        const storedName = await getStorageValue('@user_name');
        timeoutId = setTimeout(() => {
          if (storedName) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('NameInput');
          }
        }, 2000);
      } catch (error) {
        console.warn('Lỗi khi kiểm tra tên người dùng', error);
        navigation.replace('NameInput');
      }
    }

    navigateNext();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.imageWrapper}>
        <Image source={welcomeImage} style={styles.image} resizeMode="cover" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default WelcomeScreen;
