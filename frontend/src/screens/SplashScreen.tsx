import React, { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate to main app after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#007BFF', '#0056D2']} style={styles.fill}>
      <View style={styles.center}>
        <Text style={styles.logo}>AisleMarts</Text>
        <Text style={styles.line}>🛒 AI 🤖 for Shopping 🛍️</Text>
        <Text style={styles.sub}>Smarter. Faster. Everywhere.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  logo: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  line: { fontSize: 18, color: '#fff' },
  sub: { fontSize: 16, color: '#E6EDF3' }
});