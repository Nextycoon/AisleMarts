import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useUser } from '../src/state/user';
import { colors, tierLabel } from '../src/theme/tokens';
import { GradientBackdrop } from '../src/components/GradientBackdrop';
import { Glass } from '../src/components/Glass';
import RoleSwitcher from '../src/components/RoleSwitcher';
import TierSwitcher from '../src/components/TierSwitcher';

const greet = (name: string) => {
  const h = new Date().getHours();
  const p = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  return `Good ${p}, ${name} — I'm Aisle.\nWhat can I bring you today?`;
};

export default function AisleAgentScreen() {
  const router = useRouter();
  const { name, role, tier, setName } = useUser();
  const [query, setQuery] = useState('');
  const message = useMemo(() => greet(name), [name]);

  const quick = [
    role === 'shopper' ? 'Noise-canceling earbuds' : 'Bulk shipping labels',
    role === 'seller' ? 'Inventory optimizer' : 'Gift ideas under $50',
    'What\'s trending for me?'
  ];

  const handleNavigateHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/cinematic-home?q=${encodeURIComponent(query || 'Show me recommendations')}`);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
      <GradientBackdrop />
      
      <View style={styles.head}>
        <Text style={styles.brand}>AisleMarts</Text>
        <Text style={styles.kicker}>{tierLabel[tier]} • {role.toUpperCase()}</Text>
        
        {/* Role Switcher */}
        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <RoleSwitcher />
        </View>

        {/* Tier Switcher */}
        <View style={{ marginTop: 8 }}>
          <TierSwitcher />
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(60)} style={{ paddingHorizontal: 20 }}>
        <Text style={styles.title}>{message}</Text>
      </Animated.View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <Glass style={styles.inputWrap}>
          <TextInput
            placeholder="Type or speak…"
            placeholderTextColor={colors.gray}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
            onSubmitEditing={handleNavigateHome}
            returnKeyType="go"
          />
          <TouchableOpacity
            onPress={handleNavigateHome}
            style={styles.cta}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Go</Text>
          </TouchableOpacity>
        </Glass>

        <View style={styles.chips}>
          {quick.map((t, i) => (
            <TouchableOpacity key={i} onPress={() => setQuery(t)} style={styles.chip}>
              <Text style={styles.chipText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.nameRow}>
          <Text style={{ color: colors.gray }}>Not {name}? </Text>
          <TouchableOpacity onPress={() => setName(name === 'Alex' ? 'Jordan' : 'Alex')}>
            <Text style={{ color: colors.text, textDecorationLine: 'underline' }}>Switch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, paddingTop: 64 },
  head: { paddingHorizontal: 20, marginBottom: 8 },
  brand: { color: colors.text, fontWeight: '800', fontSize: 18, letterSpacing: 1 },
  kicker: { color: colors.gray, marginTop: 4 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', lineHeight: 34 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  input: { flex: 1, padding: 12, color: colors.text, fontSize: 16 },
  cta: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginLeft: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { 
    backgroundColor: colors.glass.primary, 
    borderRadius: 14, 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderWidth: 1, 
    borderColor: colors.border.primary 
  },
  chipText: { color: colors.text, fontSize: 13 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 }
});