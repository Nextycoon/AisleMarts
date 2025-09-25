import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/context/AuthContext';
import AppLoader from '../src/components/AppLoader';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const { loading, hasCompletedAvatarSetup } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMainMenu, setShowMainMenu] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 AisleMarts App Initializing...');
      
      // Quick initialization steps
      setLoadingProgress(0.25);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoadingProgress(0.5);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoadingProgress(0.75);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoadingProgress(1);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check if user has completed onboarding
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      
      console.log('✅ App initialization complete');
      setIsInitializing(false);
      
      // Navigate based on onboarding status or show main menu
      if (hasCompletedOnboarding === 'true') {
        // Show main menu for user choice
        setShowMainMenu(true);
      } else {
        // Auto-navigate to onboarding
        setTimeout(() => {
          router.replace('/onboarding');
        }, 500);
      }

    } catch (error) {
      console.error('❌ Error initializing app:', error);
      setIsInitializing(false);
      setShowMainMenu(true); // Show main menu as fallback
    }
  };

  const handleNavigation = (route: string) => {
    console.log(`🎯 Navigating to ${route}`);
    router.push(route as any);
  };

  const handleQuickStart = () => {
    console.log('🚀 Quick start - going to vertical stories');
    router.push('/(tabs)/stories');
  };

  if (isInitializing) {
    return (
      <AppLoader
        message="AisleMarts"
        subMessage="Luxury Shopping Experience"
        showProgress={true}
        progress={loadingProgress}
      />
    );
  }

  if (loading) {
    return (
      <AppLoader
        message="AisleMarts"
        subMessage="Setting up your experience"
        showProgress={true}
        progress={0.8}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AisleMarts</Text>
        <Text style={styles.subtitle}>AI-Powered Social Commerce</Text>
        <Text style={styles.tagline}>TikTok-Style Stories • 0% Commission • Series A Ready</Text>
      </View>

      <View style={styles.mainContent}>
        <TouchableOpacity 
          style={[styles.primaryButton, styles.storiesButton]} 
          onPress={handleQuickStart}
        >
          <Text style={styles.primaryButtonText}>🎬 Vertical Stories</Text>
          <Text style={styles.buttonSubtext}>Experience TikTok-style shopping</Text>
        </TouchableOpacity>

        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleNavigation('/for-you')}
          >
            <Text style={styles.buttonText}>📱 For You Feed</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleNavigation('/(tabs)/home')}
          >
            <Text style={styles.buttonText}>🏠 Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleNavigation('/discover')}
          >
            <Text style={styles.buttonText}>🔍 Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleNavigation('/profile')}
          >
            <Text style={styles.buttonText}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>P0 Hardened • P1 Performance • P2 AI Rankings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    width: width * 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});