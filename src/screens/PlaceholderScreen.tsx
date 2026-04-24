import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function PlaceholderScreen({
  route,
}: {
  route: { params?: { label?: string } };
}) {
  const label = route.params?.label ?? 'Screen';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.text}>This tab is ready for your next screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PlaceholderScreen;
