import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getStorageValue, setStorageValue } from '../storage/storage';

const STORAGE_KEY = '@home_visit_count';

function HomeScreen() {
  const [visitCount, setVisitCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCount() {
      try {
        const savedValue = await getStorageValue(STORAGE_KEY);
        setVisitCount(savedValue ? Number(savedValue) : 0);
      } catch (error) {
        console.warn('Failed to load visit count', error);
      } finally {
        setLoading(false);
      }
    }

    loadCount();
  }, []);

  const handleIncrement = async () => {
    const nextCount = visitCount + 1;
    setVisitCount(nextCount);

    try {
      await setStorageValue(STORAGE_KEY, String(nextCount));
    } catch (error) {
      console.warn('Failed to save visit count', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.description}>
        This is the first tab of the bottom navigation. AsyncStorage persists your data across reloads.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Saved visit count</Text>
        <Text style={styles.cardValue}>{loading ? 'Loading…' : visitCount}</Text>
        <Pressable style={styles.button} onPress={handleIncrement}>
          <Text style={styles.buttonText}>Increment and Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default HomeScreen;
