import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  const { loading, hasCompletedAvatarSetup } = useAuth();

  useEffect(() => {
    console.log('IndexScreen - loading:', loading, 'hasCompletedAvatarSetup:', hasCompletedAvatarSetup);
    
    // Add a short delay then navigate regardless of loading state
    const navigationTimer = setTimeout(() => {
      console.log('Navigation timer triggered');
      
      if (hasCompletedAvatarSetup) {
        console.log('Avatar setup complete, redirecting to home');
        router.replace('/home');
      } else {
        console.log('No avatar setup, redirecting to avatar screen');
        router.replace('/avatar-test');
      }
    }, loading ? 2000 : 500); // 2s if still loading, 500ms if ready

    return () => clearTimeout(navigationTimer);
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
      <Text style={styles.loadingText}>
        {loading ? 'Setting up your experience...' : 'Almost ready!'}
      </Text>
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