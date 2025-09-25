import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/context/AuthContext';
import AppLoader from '../src/components/AppLoader';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  // Minimal app entry - bypass all complex initialization
  console.log('🚀 Minimal app entry loaded');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AisleMarts</Text>
      <Text style={styles.subtitle}>Testing Vertical Stories</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          console.log('🎯 Manual navigation to stories');
          router.push('/(tabs)/stories');
        }}
      >
        <Text style={styles.buttonText}>Go to Stories</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          console.log('🎯 Manual navigation to for-you');
          router.push('/for-you');
        }}
      >
        <Text style={styles.buttonText}>Go to For You</Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Starting app initialization...');
      
      // Quick initialization for testing
      console.log('📊 Quick initialization started...');
      setLoadingProgress(0.5);
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('📊 Almost ready...');
      setLoadingProgress(1);

      console.log('✅ Loading complete');
      setLoadingProgress(1);
      
      // For testing purposes, set onboarding as completed to test main app
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log('🧪 Testing mode: Onboarding marked as completed');
      
      // Check onboarding status
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      console.log('🔍 Onboarding status:', hasCompletedOnboarding);
      
      // Small delay to show completed loading
      setTimeout(() => {
        setIsInitializing(false);
        console.log('🎯 Initialization complete, navigating...');
        
        // Navigate based on onboarding state
        setTimeout(() => {
          if (hasCompletedOnboarding === 'true') {
            console.log('🎯 Navigating to /(tabs)/stories (VerticalStoriesScreen)');
            router.replace('/(tabs)/stories');
          } else {
            console.log('🎯 Navigating to /onboarding');
            router.replace('/onboarding');
          }
        }, 300);
      }, 400);

    } catch (error) {
      console.error('❌ Error initializing app:', error);
      setIsInitializing(false);
      router.replace('/onboarding');
    }
  };

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

  const handleNavigateTo = (route: string) => {
    console.log(`🎯 Navigating to ${route}`);
    router.push(route as any);
  };

  // Skip loading for now and go straight to main app
  if (isInitializing) {
    // Auto navigate after a short delay
    setTimeout(() => {
      console.log('🚀 Quick navigation to for-you');
      router.replace('/for-you');
    }, 1000);
    
    return (
      <AppLoader
        message="AisleMarts"
        subMessage="Luxury Shopping Experience"
        showProgress={true}
        progress={loadingProgress}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={handleDebugTap} style={styles.logoContainer}>
          <Text style={styles.logo}>AisleMarts</Text>
          <Text style={styles.tagline}>Your AI Shopping Companion</Text>
        </TouchableOpacity>

        {/* Quick Navigation for Development */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: 'rgba(232, 201, 104, 0.2)', borderColor: '#E8C968' }]} 
            onPress={() => handleNavigateTo('/onboarding')}
          >
            <Text style={[styles.navButtonText, { color: '#E8C968' }]}>🚀 New Onboarding Flow</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: 'rgba(235, 214, 160, 0.2)', borderColor: '#EBD6A0' }]} 
            onPress={() => handleNavigateTo('/working-permissions')}
          >
            <Text style={[styles.navButtonText, { color: '#EBD6A0' }]}>🛡️ Permissions System</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6' }]} 
            onPress={() => handleNavigateTo('/aisle-agent')}
          >
            <Text style={[styles.navButtonText, { color: '#3b82f6' }]}>🤖 Main App</Text>
          </TouchableOpacity>
        </View>

        {showDebug && (
          <View style={styles.debugContainer}>
            <TouchableOpacity style={styles.debugButton} onPress={handleClearStorage}>
              <Text style={styles.debugButtonText}>🗑️ Clear Storage & Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.debugButton} onPress={() => handleNavigateTo('/completion-demo')}>
              <Text style={styles.debugButtonText}>✨ View Completion Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.debugButton} onPress={() => handleNavigateTo('/ai-assistant')}>
              <Text style={styles.debugButtonText}>🧠 AI Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.debugButton} onPress={() => handleNavigateTo('/chat')}>
              <Text style={styles.debugButtonText}>💬 Messages</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  navigationContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  navButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugContainer: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  debugButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
});