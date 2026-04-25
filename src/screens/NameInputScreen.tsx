import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStack';
import { getStorageValue, setStorageValue } from '../storage/storage';

const STORAGE_KEY = '@user_name';

type NameInputNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NameInput'>;

function NameInputScreen() {
  const navigation = useNavigation<NameInputNavigationProp>();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadName() {
      try {
        const storedName = await getStorageValue(STORAGE_KEY);
        if (storedName) {
          navigation.replace('MainTabs');
        }
      } catch (error) {
        console.warn('Lỗi khi đọc tên người dùng', error);
      } finally {
        setLoading(false);
      }
    }

    loadName();
  }, [navigation]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Tên bắt buộc', 'Vui lòng nhập tên của bạn để tiếp tục.');
      return;
    }

    try {
      await setStorageValue(STORAGE_KEY, trimmedName);
      navigation.replace('MainTabs');
    } catch (error) {
      console.warn('Lỗi khi lưu tên', error);
      Alert.alert('Lỗi', 'Không thể lưu tên. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang chuẩn bị...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Nhập tên của bạn</Text>
          <Text style={styles.subtitle}>
            Tên này sẽ được lưu lại để cá nhân hóa trải nghiệm của bạn.
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên của bạn"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Lưu và tiếp tục</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  loadingText: { color: '#475569', fontSize: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1d4ed8', marginBottom: 12 },
  subtitle: { color: '#475569', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  input: {
    height: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});

export default NameInputScreen;
