/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import AppHeader from '../components/AppHeader';
import { useFocusEffect } from '@react-navigation/native';
import { SCAN_HISTORY_KEY } from './OCRResultScreen';
import type { ScanRecord } from './OCRResultScreen';

function buildMapHtml(latitude: number, longitude: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([${latitude}, ${longitude}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    L.marker([${latitude}, ${longitude}]).addTo(map);
  </script>
</body>
</html>`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function textPreview(text: string, maxLen = 90): string {
  if (!text.trim()) { return '(Không có văn bản)'; }
  return text.length > maxLen ? `${text.slice(0, maxLen).trimEnd()}…` : text;
}

export default function ScanHistoryScreen() {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ScanRecord | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      const list: ScanRecord[] = raw ? JSON.parse(raw) : [];
      setRecords(list);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xoá scan?', 'Bản ghi này sẽ bị xoá vĩnh viễn.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          const updated = records.filter(r => r.id !== id);
          setRecords(updated);
          await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (records.length === 0) { return; }
    Alert.alert('Xoá tất cả?', 'Toàn bộ lịch sử scan sẽ bị xoá.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xoá tất cả',
        style: 'destructive',
        onPress: async () => {
          setRecords([]);
          await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
        },
      },
    ]);
  };

  const openDetail = (record: ScanRecord) => {
    setSelected(record);
    setEditText(record.text);
  };

  const handleUpdateText = async () => {
    if (!selected) { return; }
    setSaving(true);
    try {
      const updated = records.map(r =>
        r.id === selected.id ? { ...r, text: editText } : r
      );
      setRecords(updated);
      await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
      setSelected(null);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: ScanRecord }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openDetail(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUri }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardDateRow}>
          <Text style={styles.cardDate}>📅 {formatDate(item.takenAt)}</Text>
          <Text style={styles.cardTime}>🕒 {formatTime(item.takenAt)}</Text>
        </View>
        <Text style={styles.cardText}>{textPreview(item.text)}</Text>
        {item.latitude != null && item.longitude != null && (
          <TouchableOpacity
            style={styles.locationBadge}
            onPress={() =>
              setMapCoords({ latitude: item.latitude as number, longitude: item.longitude as number })
            }
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.locationBadgeText}>
              📍 {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.cardChars}>{item.text.length} ký tự</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteBtnText}>🗑️ Xoá</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppHeader
        title="Lịch sử Scan"
        subtitle={records.length > 0 ? `${records.length} kết quả đã lưu` : 'Chưa có bản ghi nào'}
        right={
          records.length > 0 ? (
            <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
              <Text style={styles.clearAllText}>Xoá tất cả</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text style={styles.centredText}>Đang tải...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.centred}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Chưa có lịch sử scan</Text>
          <Text style={styles.emptySub}>
            Hãy dùng tab Scan để chụp ảnh và nhận diện văn bản.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Detail / Edit modal */}
      <Modal
        visible={selected !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết scan</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              {selected && (
                <>
                  <Image
                    source={{ uri: selected.imageUri }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  <View style={styles.modalMeta}>
                    <Text style={styles.modalMetaText}>
                      📅 {formatDate(selected.takenAt)}  🕒 {formatTime(selected.takenAt)}
                    </Text>
                  </View>
                  {selected.latitude != null && selected.longitude != null && (
                    <TouchableOpacity
                      style={styles.modalLocationRow}
                      onPress={() =>
                        setMapCoords({
                          latitude: selected.latitude as number,
                          longitude: selected.longitude as number,
                        })
                      }
                    >
                      <Text style={styles.modalLocationText}>
                        📍 {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
                      </Text>
                      <Text style={styles.modalLocationLink}>Xem bản đồ ›</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.modalSectionTitle}>Văn bản (có thể chỉnh sửa)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                    textAlignVertical="top"
                    placeholder="Không có văn bản..."
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.modalCharCount}>{editText.length} ký tự</Text>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.modalCancelText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
                onPress={handleUpdateText}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalSaveText}>💾 Lưu chỉnh sửa</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Map modal */}
      <Modal
        visible={mapCoords !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMapCoords(null)}
      >
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vị trí trên bản đồ</Text>
              <TouchableOpacity onPress={() => setMapCoords(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {mapCoords && (
              <WebView
                style={styles.mapWebView}
                originWhitelist={['*']}
                source={{ html: buildMapHtml(mapCoords.latitude, mapCoords.longitude) }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  clearAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: 12,
  },
  clearAllText: { color: '#fca5a5', fontSize: 13, fontWeight: '600' },

  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  centredText: { color: '#6b7280', fontSize: 14, marginTop: 8 },
  emptyIcon: { fontSize: 56, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySub: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },

  listContent: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  thumbnail: { width: 90, height: 110, backgroundColor: '#e2e8f0' },
  cardContent: { flex: 1, padding: 12 },
  cardDateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  cardDate: { fontSize: 12, color: '#374151', fontWeight: '600' },
  cardTime: { fontSize: 12, color: '#6b7280' },
  cardText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardChars: { fontSize: 11, color: '#9ca3af' },
  locationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  locationBadgeText: { fontSize: 11, color: '#1d4ed8', fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    flex: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 18, color: '#6b7280', fontWeight: '600' },
  modalContent: { padding: 20 },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
  },
  modalMeta: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  modalMetaText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  modalLocationText: { fontSize: 13, color: '#1d4ed8', fontWeight: '500', flexShrink: 1 },
  modalLocationLink: { fontSize: 13, color: '#1d4ed8', fontWeight: '700', marginLeft: 8 },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  mapModalSheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    height: '70%',
    overflow: 'hidden',
  },
  mapWebView: { flex: 1 },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  modalTextInput: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    lineHeight: 22,
    backgroundColor: '#f8fafc',
  },
  modalCharCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: { color: '#6b7280', fontSize: 15, fontWeight: '600' },
  modalSaveBtn: {
    flex: 2,
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
