import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
  const { loading, hasCompletedAvatarSetup } = useAuth();
  const [showDebug, setShowDebug] = React.useState(false);

  React.useEffect(() => {
    // Force navigation after maximum 5 seconds to prevent infinite loading
    const forceNavTimer = setTimeout(() => {
      console.log('🚨 Force navigation after 5 seconds');
      router.replace('/aisle-avatar');
    }, 5000);

    if (!loading) {
      clearTimeout(forceNavTimer);
      // Navigate based on auth state after loading is complete
      setTimeout(() => {
        if (hasCompletedAvatarSetup) {
          router.replace('/aisle-agent');
        } else {
          router.replace('/aisle-avatar');
        }
      }, 1000); // Small delay to show loading screen
    }

    return () => clearTimeout(forceNavTimer);
  }, [loading, hasCompletedAvatarSetup]);

  const handleDebugTap = () => {
    setShowDebug(true);
  };

  const handleClearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('🗑️ AsyncStorage cleared');
      router.replace('/aisle-avatar');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  const handleGoToCompletion = () => {
    router.replace('/completion-demo');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <TouchableOpacity onPress={handleDebugTap}>
          <Text style={styles.logo}>AisleMarts</Text>
        </TouchableOpacity>
        <Text style={styles.tagline}>Your AI Shopping Companion</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4facfe" />
          <Text style={styles.loadingText}>
            {loading ? 'Initializing...' : 'Welcome!'}
          </Text>
        </View>

        {showDebug && (
          <View style={styles.debugContainer}>
            <TouchableOpacity style={styles.debugButton} onPress={handleClearStorage}>
              <Text style={styles.debugButtonText}>Clear Storage & Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.debugButton} onPress={handleGoToCompletion}>
              <Text style={styles.debugButtonText}>View Completion Demo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 48,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});