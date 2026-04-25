import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootStack';
import { getStorageValue } from '../storage/storage';

type WelcomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Quan trắc nước</Text>
        <Text style={styles.subtitle}>
          Chào mừng bạn đến với ứng dụng quan trắc nước.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default WelcomeScreen;
