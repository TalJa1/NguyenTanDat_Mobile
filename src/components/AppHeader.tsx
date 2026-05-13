import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  left?: boolean | React.ReactNode;
}

export default function AppHeader({ title, subtitle, right, left }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const leftNode =
    left === true ? (
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backArrow}>
          <Icon name="arrow-back" size={20}/>
        </Text>
      </TouchableOpacity>
    ) : (
      left ?? null
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.inner}>
        {leftNode}
        <View
          style={[
            styles.textBlock,
            leftNode ? styles.textBlockWithLeft : undefined,
          ]}
        >
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
  textBlockWithLeft: { marginLeft: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#93c5fd', fontWeight: '500', marginTop: 2 },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 28, color: '#ffffff', lineHeight: 32 },
});
