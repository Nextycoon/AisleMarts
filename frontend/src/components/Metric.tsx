import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Glass } from './Glass';
import { colors } from '../theme/tokens';

export const Metric = ({ label, value }: { label: string; value: string }) => (
  <Animated.View entering={FadeInUp.springify().damping(14)} style={{ marginBottom: 12 }}>
    <Glass style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Glass>
  </Animated.View>
);

const styles = StyleSheet.create({
  card: { padding: 16 },
  value: { color: colors.text, fontSize: 28, fontWeight: '700' },
  label: { color: colors.gray, marginTop: 4 }
});