import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useAuth } from '../src/context/AuthContext';
// import AppLoader from '../src/components/AppLoader';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  // const { loading, hasCompletedAvatarSetup } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showMainMenu, setShowMainMenu] = useState(false);
  
  // Mock auth state for now
  const loading = false;
  const hasCompletedAvatarSetup = true;

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
    backgroundColor: '#0f0f0f',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#A0A0A0',
    marginBottom: 8,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  primaryButton: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  storiesButton: {
    backgroundColor: '#6366F1',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#E0E0FF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 6,
    width: (width - 56) / 2, // Two buttons per row with spacing
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});