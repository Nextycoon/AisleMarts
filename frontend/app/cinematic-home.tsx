import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// Temporarily disabled to fix HostFunction error
// import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '../src/state/user';
import { colors, tierLabel } from '../src/theme/tokens';
import { GradientBackdrop } from '../src/components/GradientBackdrop';
import { Metric } from '../src/components/Metric';
import { Glass } from '../src/components/Glass';

const rowsForRole = (role: string, tier: string) => {
  if (role === 'seller') {
    return [
      { label: 'Conversion Rate', value: '3.2%' },
      { label: 'Orders Today', value: '128' },
      { label: 'Forecast 30d', value: '+14%' },
    ];
  }
  if (role === 'shopper') {
    return [
      { label: 'Personalized Deals', value: '7' },
      { label: 'Cart Value', value: '$142' },
      { label: 'Tier Perks', value: tierLabel[tier as any] },
    ];
  }
  return [
    { label: 'Buyer Insights', value: 'Top 5' },
    { label: 'Seller Ops', value: '3 alerts' },
    { label: 'AI Suggestions', value: '9' },
  ];
};

export default function CinematicHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { role, tier } = useUser();
  const query = params.q as string | undefined;
  const metrics = rowsForRole(role, tier);

  return (
    <View style={styles.wrap}>
      <GradientBackdrop />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 64 }}>
        <View style={styles.header}>
          <Text style={styles.h1}>Welcome back</Text>
          <Text style={styles.sub}>
            {query ? `Results for: "${query}"` : 'Your role-aware dashboard'}
          </Text>
        </View>

        <Animated.View entering={FadeInUp} style={{ marginTop: 8 }}>
          {metrics.map(m => <Metric key={m.label} label={m.label} value={m.value} />)}
        </Animated.View>

        <Glass style={{ padding: 16, marginTop: 12 }}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.action}>
              <Text style={styles.actionText}>🔎 Smart Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action}>
              <Text style={styles.actionText}>✨ AI Suggestions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action}>
              <Text style={styles.actionText}>📦 Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action}>
              <Text style={styles.actionText}>📈 Analytics</Text>
            </TouchableOpacity>
          </View>
        </Glass>

        <TouchableOpacity 
          onPress={() => router.push('/aisle-agent')} 
          style={{ alignSelf: 'center', marginTop: 18 }}
        >
          <Text style={{ color: colors.gray, textDecorationLine: 'underline' }}>
            Talk to Aisle again
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  header: { marginBottom: 8 },
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  sub: { color: colors.gray, marginTop: 4 },
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { 
    backgroundColor: colors.glass.primary, 
    borderRadius: 12, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: colors.border.primary 
  },
  actionText: { color: colors.text }
});