import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  const { loading, hasCompletedAvatarSetup } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!hasCompletedAvatarSetup) {
        // Redirect to Avatar setup
        router.replace('/aisle-avatar');
      } else {
        // Redirect to main home screen
        router.replace('/home');
      }
    }
  }, [loading, hasCompletedAvatarSetup]);

  // Show loading screen while checking avatar setup
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ActivityIndicator size="large" color="#667eea" />
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
});