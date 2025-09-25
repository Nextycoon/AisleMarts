import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 AisleMarts - Series A Ready Commerce Platform');
      
      // Progressive loading simulation
      const loadingSteps = [
        { progress: 0.2, message: 'Initializing AI Commerce Engine...', delay: 400 },
        { progress: 0.4, message: 'Connecting to Global Marketplace...', delay: 400 },
        { progress: 0.6, message: 'Loading Creator Networks...', delay: 400 },
        { progress: 0.8, message: 'Setting up 0% Commission Platform...', delay: 400 },
        { progress: 1.0, message: 'Ready for Luxury Commerce...', delay: 500 }
      ];

      for (const step of loadingSteps) {
        console.log(`📊 ${step.message}`);
        setLoadingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      console.log('✅ AisleMarts Platform Ready');
      setIsInitializing(false);

    } catch (error) {
      console.error('❌ Initialization error:', error);
      setIsInitializing(false);
    }
  };

  const handleNavigation = (route: string, label: string) => {
    console.log(`🎯 Navigating to ${label}: ${route}`);
    router.push(route as any);
  };

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingTitle}>AisleMarts</Text>
          <Text style={styles.loadingTagline}>AI-Powered Global Commerce</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${loadingProgress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(loadingProgress * 100)}%</Text>
          </View>
          
          <Text style={styles.loadingFeatures}>
            TikTok-Style Stories • 0% Commission • Series A Ready
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AisleMarts</Text>
        <Text style={styles.subtitle}>AI-Powered Global Commerce</Text>
        <Text style={styles.tagline}>
          🌍 Global Marketplace • 🤖 AI Rankings • 💳 0% Commission
        </Text>
      </View>

      {/* Main Features */}
      <View style={styles.mainContent}>
        {/* Hero Feature - Vertical Stories */}
        <TouchableOpacity 
          style={[styles.heroButton, styles.storiesButton]} 
          onPress={() => handleNavigation('/(tabs)/stories', 'Vertical Stories')}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji}>🎬</Text>
            <Text style={styles.heroTitle}>Vertical Stories</Text>
            <Text style={styles.heroSubtitle}>TikTok-Style Shopping Experience</Text>
          </View>
        </TouchableOpacity>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={() => handleNavigation('/for-you', 'For You Feed')}
          >
            <Text style={styles.featureEmoji}>📱</Text>
            <Text style={styles.featureText}>For You</Text>
            <Text style={styles.featureSubtext}>Personalized</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={() => handleNavigation('/(tabs)/home', 'Home Dashboard')}
          >
            <Text style={styles.featureEmoji}>🏠</Text>
            <Text style={styles.featureText}>Home</Text>
            <Text style={styles.featureSubtext}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={() => handleNavigation('/discover', 'Discover')}
          >
            <Text style={styles.featureEmoji}>🔍</Text>
            <Text style={styles.featureText}>Discover</Text>
            <Text style={styles.featureSubtext}>Explore</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton} 
            onPress={() => handleNavigation('/profile', 'Profile')}
          >
            <Text style={styles.featureEmoji}>👤</Text>
            <Text style={styles.featureText}>Profile</Text>
            <Text style={styles.featureSubtext}>Account</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Features */}
        <View style={styles.secondaryGrid}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => handleNavigation('/marketplace', 'Marketplace')}
          >
            <Text style={styles.secondaryEmoji}>🛍️</Text>
            <Text style={styles.secondaryText}>Marketplace</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => handleNavigation('/creators', 'Creators Hub')}
          >
            <Text style={styles.secondaryEmoji}>⭐</Text>
            <Text style={styles.secondaryText}>Creators</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBadge}>🏆 Series A Ready</Text>
        <Text style={styles.footerText}>
          P0 Hardened • P1 Performance • P2 AI Rankings
        </Text>
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