import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { waterTopics } from '../data/waterTopics';
import { HomeStackParamList } from '../navigation/HomeStack';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Không tìm thấy chủ đề phù hợp.</Text>
    </View>
  );
}

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');

  const filteredTopics = useMemo(
    () =>
      waterTopics.filter((topic) => {
        const search = searchText.trim().toLowerCase();
        if (!search) {
          return true;
        }

        return [topic.title, topic.subtitle, topic.overview]
          .join(' ')
          .toLowerCase()
          .includes(search);
      }),
    [searchText]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['#0f172a', '#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroLabel}>Quan Trắc Nước</Text>
        <Text style={styles.heroTitle}>Thông tin về chất lượng nước</Text>
        <Text style={styles.heroText}>
          Khám phá dữ liệu về pH, khoáng chất, độ cứng, độ đục và lời khuyên quan trắc nước. Chạm vào mỗi chủ đề để đọc chi tiết và lưu ghi chú.
        </Text>
      </LinearGradient>

      <View style={styles.searchCard}>
        <Text style={styles.sectionTitle}>Tìm chủ đề</Text>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Nhập từ khóa, ví dụ: pH, khoáng chất, độ đục"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>Các chủ đề chính</Text>
      <FlatList
        data={filteredTopics}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.topicList}
        renderItem={({ item }) => (
          <Pressable
            style={styles.topicCard}
            onPress={() =>
              navigation.navigate('TopicDetail', {
                topicId: item.id,
                title: item.title,
              })
            }
          >
            <View style={styles.topicHeader}>
              <Text style={styles.topicTitle}>{item.title}</Text>
              <Text style={styles.topicBadge}>Chi tiết</Text>
            </View>
            <Text style={styles.topicSubtitle}>{item.subtitle}</Text>
            <Text style={styles.topicOverview}>{item.overview}</Text>
            <Text style={styles.topicHighlight}>{item.highlight}</Text>
          </Pressable>
        )}
        ListEmptyComponent={EmptyState}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 32 },
  heroCard: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  heroLabel: { color: '#bfdbfe', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  heroTitle: { color: '#ffffff', fontSize: 28, fontWeight: '800', marginBottom: 14 },
  heroText: { color: '#dbeafe', fontSize: 16, lineHeight: 24 },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#111827',
    fontSize: 15,
  },
  topicList: { paddingBottom: 20 },
  topicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginRight: 12 },
  topicBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  topicSubtitle: {
    color: '#475569',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 10,
    lineHeight: 22,
  },
  topicOverview: { color: '#334155', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  topicHighlight: { color: '#1d4ed8', fontSize: 14, fontWeight: '700' },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: '#64748b', fontSize: 15 },
});

export default HomeScreen;
