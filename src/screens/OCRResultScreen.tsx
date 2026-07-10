/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import { SERVER_URL } from '@env';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { ScanStackParamList } from '../navigation/ScanStack';

export const SCAN_HISTORY_KEY = '@ocr_scan_history';

export interface ScanRecord {
  id: string;
  imageUri: string;
  text: string;
  takenAt: string;
  latitude: number | null;
  longitude: number | null;
}

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Quyền truy cập vị trí',
      message: 'Ứng dụng cần quyền vị trí để lưu vị trí chụp ảnh.',
      buttonPositive: 'Đồng ý',
      buttonNegative: 'Từ chối',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

type Props = {
  navigation: NativeStackNavigationProp<ScanStackParamList, 'OCRResult'>;
  route: RouteProp<ScanStackParamList, 'OCRResult'>;
};

export default function OCRResultScreen({ navigation, route }: Props) {
  const { imageUri } = route.params;
  const [recognizing, setRecognizing] = useState(true);
  const [editedText, setEditedText] = useState('');
  const [saving, setSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [locating, setLocating] = useState(true);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    runOCR();
    fetchLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLocation = async () => {
    setLocating(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocating(false);
        return;
      }
      Geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setLocating(false);
        },
        err => {
          console.log('[LOCATION ERROR]', err.code, err.message);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch {
      setLocating(false);
    }
  };

  const runOCR = async () => {
    try {
      const filePath = imageUri.startsWith('file://') ? imageUri.slice(7) : imageUri;
      const imageBase64 = await RNFS.readFile(filePath, 'base64');
      console.log('[OCR] Image base64 length:', imageBase64.length, 'chars (~', Math.round(imageBase64.length / 1024), 'KB)');
      console.log('[OCR] Sending to:', `${SERVER_URL}/ocr`);
      const { data } = await axios.post<{ text: string }>(
        `${SERVER_URL}/ocr`,
        { image_base64: imageBase64 },
        { headers: { 'Content-Type': 'application/json' }, timeout: 120000 },
      );
      console.log('[OCR] Response:', data);
      const text = (data.text ?? '').trim();
      setEditedText(text);
      setCharCount(text.length);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log('[OCR ERROR]', err.code, err.message, err.response?.status, JSON.stringify(err.response?.data));
      } else {
        console.log('[OCR ERROR]', err instanceof Error ? err.message : String(err));
      }
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Lỗi OCR', `Chi tiết lỗi:\n${msg}`);
      setEditedText('');
    } finally {
      setRecognizing(false);
    }
  };

  const handleTextChange = useCallback((text: string) => {
    setEditedText(text);
    setCharCount(text.length);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      const history: ScanRecord[] = raw ? JSON.parse(raw) : [];
      const parsedLat = parseFloat(latitude);
      const parsedLng = parseFloat(longitude);
      const record: ScanRecord = {
        id: Date.now().toString(),
        imageUri,
        text: editedText,
        takenAt: new Date().toISOString(),
        latitude: Number.isFinite(parsedLat) ? parsedLat : null,
        longitude: Number.isFinite(parsedLng) ? parsedLng : null,
      };
      history.unshift(record);
      await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history));
      Alert.alert('Đã lưu', 'Kết quả scan đã được lưu vào lịch sử.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert('Bỏ qua?', 'Kết quả scan sẽ không được lưu.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bỏ qua',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kết quả scan</Text>
          <View style={{ width: 90 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Image preview */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>📷 Ảnh đã chụp</Text>
            </View>
          </View>

          {/* OCR result card */}
          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <Text style={styles.resultCardTitle}>📄 Văn bản nhận diện</Text>
              {!recognizing && (
                <Text style={styles.editHint}>Nhấn để chỉnh sửa</Text>
              )}
            </View>

            {recognizing ? (
              <View style={styles.loadingOCR}>
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text style={styles.loadingText}>
                  Đang nhận diện văn bản...
                </Text>
                <Text style={styles.loadingSubText}>
                  Vui lòng chờ trong giây lát
                </Text>
              </View>
            ) : (
              <>
                {editedText.length === 0 && (
                  <View style={styles.emptyOCR}>
                    <Text style={styles.emptyOCRIcon}>🔍</Text>
                    <Text style={styles.emptyOCRText}>
                      Không nhận diện được văn bản. Hãy thử chụp lại với ánh
                      sáng tốt hơn.
                    </Text>
                  </View>
                )}
                <TextInput
                  style={[
                    styles.textInput,
                    editedText.length === 0 && styles.textInputEmpty,
                  ]}
                  value={editedText}
                  onChangeText={handleTextChange}
                  multiline
                  textAlignVertical="top"
                  placeholder="Không có văn bản nào được nhận diện..."
                  placeholderTextColor="#9ca3af"
                  scrollEnabled={false}
                />
                <Text style={styles.charCount}>{charCount} ký tự</Text>
              </>
            )}
          </View>

          {/* Location card */}
          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <Text style={styles.resultCardTitle}>📍 Vị trí chụp</Text>
              <TouchableOpacity onPress={fetchLocation} disabled={locating}>
                <Text style={styles.editHint}>
                  {locating ? 'Đang lấy vị trí...' : 'Lấy lại vị trí'}
                </Text>
              </TouchableOpacity>
            </View>
            {locating ? (
              <View style={styles.loadingOCR}>
                <ActivityIndicator size="small" color="#1d4ed8" />
                <Text style={styles.loadingSubText}>Đang xác định vị trí...</Text>
              </View>
            ) : (
              <View style={styles.locationRow}>
                <View style={styles.locationField}>
                  <Text style={styles.locationLabel}>Vĩ độ (lat)</Text>
                  <TextInput
                    style={styles.locationInput}
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numbers-and-punctuation"
                    placeholder="—"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.locationField}>
                  <Text style={styles.locationLabel}>Kinh độ (long)</Text>
                  <TextInput
                    style={styles.locationInput}
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numbers-and-punctuation"
                    placeholder="—"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Metadata preview */}
          {!recognizing && (
            <View style={styles.metaCard}>
              <Text style={styles.metaTitle}>📋 Thông tin lưu trữ</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Thời gian:</Text>
                <Text style={styles.metaValue}>
                  {new Date().toLocaleString('vi-VN')}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Trạng thái:</Text>
                <Text style={[styles.metaValue, { color: '#059669' }]}>
                  ✓ Sẵn sàng lưu
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
            <Text style={styles.discardText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (recognizing || saving) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={recognizing || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>💾 Lưu vào lịch sử</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { paddingVertical: 4 },
  backText: { color: '#93c5fd', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  scrollContent: { padding: 16 },

  imageContainer: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  imagePreview: {
    width: '100%',
    height: 220,
    backgroundColor: '#e2e8f0',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  imageBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  editHint: { fontSize: 12, color: '#1d4ed8', fontWeight: '500' },

  loadingOCR: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  loadingSubText: { fontSize: 13, color: '#9ca3af' },

  emptyOCR: {
    alignItems: 'center',
    paddingBottom: 8,
    gap: 8,
  },
  emptyOCRIcon: { fontSize: 32 },
  emptyOCRText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  textInput: {
    minHeight: 130,
    fontSize: 15,
    color: '#111827',
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  textInputEmpty: { minHeight: 80 },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 6,
  },

  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationField: { flex: 1 },
  locationLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f8fafc',
  },

  metaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaLabel: { fontSize: 13, color: '#6b7280' },
  metaValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  discardBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingVertical: 14,
    alignItems: 'center',
  },
  discardText: { color: '#6b7280', fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#93c5fd' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
