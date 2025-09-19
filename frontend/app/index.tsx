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
    // Check if user has completed onboarding
    const checkOnboarding = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        
        // Force navigation after maximum 3 seconds to prevent infinite loading
        const forceNavTimer = setTimeout(() => {
          console.log('🚨 Force navigation after 3 seconds');
          if (hasCompletedOnboarding === 'true') {
            router.replace('/aisle-agent');
          } else {
            router.replace('/onboarding');
          }
        }, 3000);

        if (!loading) {
          clearTimeout(forceNavTimer);
          // Navigate based on onboarding state after loading is complete
          setTimeout(() => {
            if (hasCompletedOnboarding === 'true') {
              router.replace('/aisle-agent');
            } else {
              router.replace('/onboarding');
            }
          }, 1000); // Small delay to show loading screen
        }

        return () => clearTimeout(forceNavTimer);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        router.replace('/onboarding');
      }
    };

    checkOnboarding();
  }, [loading]);

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

  const handleGoToOnboarding = () => {
    console.log('🎯 Navigating to new onboarding flow');
    router.push('/onboarding');
  };

  const handleGoToPermissions = () => {
    console.log('🛡️ Navigating to working permissions');
    router.push('/working-permissions');
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

        {/* Always show permissions test button */}
        <View style={styles.debugContainer}>
          <TouchableOpacity style={[styles.debugButton, { borderColor: '#EBD6A0', backgroundColor: 'rgba(235, 214, 160, 0.2)' }]} onPress={handleGoToPermissions}>
            <Text style={[styles.debugButtonText, { color: '#EBD6A0' }]}>🛡️ Test Permissions System</Text>
          </TouchableOpacity>
        </View>

        {showDebug && (
          <View style={[styles.debugContainer, { bottom: 160 }]}>
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
  debugContainer: {
    position: 'absolute',
    bottom: 100,
    left: 32,
    right: 32,
    gap: 12,
  },
  debugButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});