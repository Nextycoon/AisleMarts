import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  useEffect(() => {
    console.log('🚀 IndexScreen: Direct navigation for testing');
    
    // Direct navigation to Avatar screen for testing
    const timer = setTimeout(() => {
      console.log('➡️  Navigating to Avatar screen');
      router.replace('/aisle-avatar');
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.loadingText}>Loading AisleMarts...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0F14',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
});