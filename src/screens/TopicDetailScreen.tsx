import React, { useEffect, useState } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../navigation/HomeStack';
import { waterTopics } from '../data/waterTopics';
import { getStorageValue, setStorageValue, removeStorageValue } from '../storage/storage';

type TopicDetailRouteProp = RouteProp<HomeStackParamList, 'TopicDetail'>;

function TopicDetailScreen({ route }: { route: TopicDetailRouteProp }) {
  const { topicId } = route.params;
  const topic = waterTopics.find((item) => item.id === topicId);
  const [note, setNote] = useState('');
  const [loadingNote, setLoadingNote] = useState(true);

  useEffect(() => {
    async function loadNote() {
      try {
        const savedNote = await getStorageValue(`@topic_note_${topicId}`);
        setNote(savedNote ?? '');
      } catch (error) {
        console.warn('Lỗi khi tải ghi chú', error);
      } finally {
        setLoadingNote(false);
      }
    }

    loadNote();
  }, [topicId]);

  const handleSaveNote = async () => {
    try {
      await setStorageValue(`@topic_note_${topicId}`, note);
      Alert.alert('Lưu thành công', 'Ghi chú của bạn đã được lưu trên thiết bị.');
    } catch (error) {
      console.warn('Lỗi khi lưu ghi chú', error);
      Alert.alert('Lỗi', 'Không thể lưu ghi chú. Vui lòng thử lại.');
    }
  };

  const handleClearNote = async () => {
    try {
      await removeStorageValue(`@topic_note_${topicId}`);
      setNote('');
      Alert.alert('Đã xoá', 'Ghi chú đã được xoá khỏi bộ nhớ thiết bị.');
    } catch (error) {
      console.warn('Lỗi khi xoá ghi chú', error);
      Alert.alert('Lỗi', 'Không thể xoá ghi chú. Vui lòng thử lại.');
    }
  };

  if (!topic) {
    return (
      <View style={styles.missingContainer}>
        <Text style={styles.missingText}>Chủ đề không tồn tại.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
          <Text style={styles.topicOverview}>{topic.overview}</Text>
        </View>

        {topic.details.map((detail) => (
          <View key={detail.heading} style={styles.detailCard}>
            <Text style={styles.detailHeading}>{detail.heading}</Text>
            <Text style={styles.detailBody}>{detail.body}</Text>
          </View>
        ))}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Ghi chú cá nhân</Text>
          <Text style={styles.noteDescription}>
            Bạn có thể lưu lại thông tin quan trọng cho chủ đề này. Ghi chú được lưu cục bộ trên thiết bị.
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú của bạn..."
            placeholderTextColor="#9ca3af"
            multiline
            style={styles.noteInput}
          />
          <View style={styles.buttonRow}>
            <Pressable style={styles.saveButton} onPress={handleSaveNote}>
              <Text style={styles.buttonText}>Lưu</Text>
            </Pressable>
            <Pressable style={styles.clearButton} onPress={handleClearNote}>
              <Text style={styles.clearButtonText}>Xóa</Text>
            </Pressable>
          </View>
          {!loadingNote && note.length === 0 && (
            <Text style={styles.noteHint}>Chưa có ghi chú. Bạn có thể thêm ghi chú ở đây.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  missingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  missingText: { fontSize: 18, color: '#374151', textAlign: 'center' },
  headerCard: {
    backgroundColor: '#1e40af',
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
  },
  topicTitle: { color: '#ffffff', fontSize: 26, fontWeight: '800', marginBottom: 10 },
  topicSubtitle: { color: '#bfdbfe', fontSize: 16, marginBottom: 12 },
  topicOverview: { color: '#dbeafe', fontSize: 15, lineHeight: 22 },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  detailHeading: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  detailBody: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  noteCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
  },
  noteTitle: { fontSize: 18, fontWeight: '700', color: '#1d4ed8', marginBottom: 8 },
  noteDescription: { color: '#1e40af', lineHeight: 22, marginBottom: 16 },
  noteInput: {
    minHeight: 120,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    color: '#111827',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 16,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1d4ed8',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  clearButtonText: { color: '#1d4ed8', fontWeight: '700', fontSize: 15 },
  noteHint: { color: '#475569', marginTop: 12, fontSize: 14 },
});

export default TopicDetailScreen;
