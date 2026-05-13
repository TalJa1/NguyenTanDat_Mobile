import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.inner}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#93c5fd', fontWeight: '500', marginTop: 2 },
});
