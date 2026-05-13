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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextRecognition from 'react-native-text-recognition';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { ScanStackParamList } from '../navigation/ScanStack';

export const SCAN_HISTORY_KEY = '@ocr_scan_history';

export interface ScanRecord {
  id: string;
  imageUri: string;
  text: string;
  takenAt: string;
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

  useEffect(() => {
    runOCR();
  }, []);

  const runOCR = async () => {
    try {
      const lines = await TextRecognition.recognize(imageUri);
      const text = (lines ?? []).join('\n').trim();
      setEditedText(text);
      setCharCount(text.length);
    } catch {
      Alert.alert('Lỗi OCR', 'Không thể nhận diện văn bản từ ảnh này.');
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
      const record: ScanRecord = {
        id: Date.now().toString(),
        imageUri,
        text: editedText,
        takenAt: new Date().toISOString(),
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
      { text: 'Bỏ qua', style: 'destructive', onPress: () => navigation.goBack() },
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
          <TouchableOpacity onPress={handleDiscard} style={styles.backBtn}>
            <Text style={styles.backText}>← Quay lại</Text>
          </TouchableOpacity>
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
                <Text style={styles.loadingText}>Đang nhận diện văn bản...</Text>
                <Text style={styles.loadingSubText}>Vui lòng chờ trong giây lát</Text>
              </View>
            ) : (
              <>
                {editedText.length === 0 && (
                  <View style={styles.emptyOCR}>
                    <Text style={styles.emptyOCRIcon}>🔍</Text>
                    <Text style={styles.emptyOCRText}>
                      Không nhận diện được văn bản. Hãy thử chụp lại với ánh sáng tốt hơn.
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
            <Text style={styles.discardText}>Bỏ qua</Text>
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
  metaTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaLabel: { fontSize: 13, color: '#6b7280' },
  metaValue: { fontSize: 13, color: '#111827', fontWeight: '500', flexShrink: 1, textAlign: 'right', marginLeft: 8 },

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
