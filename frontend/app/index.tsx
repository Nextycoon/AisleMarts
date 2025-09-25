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
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 2,
    textAlign: 'center',
  },
  loadingTagline: {
    fontSize: 18,
    color: '#A0A0A0',
    marginBottom: 60,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressContainer: {
    width: width * 0.8,
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  progressText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingFeatures: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Main App Styles
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#A0A0A0',
    marginBottom: 12,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  // Hero Button (Vertical Stories)
  heroButton: {
    borderRadius: 20,
    marginBottom: 30,
    overflow: 'hidden',
  },
  storiesButton: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E0E0FF',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Feature Grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureButton: {
    width: (width - 52) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureSubtext: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },

  // Secondary Features
  secondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  secondaryButton: {
    width: (width - 52) / 2,
    backgroundColor: '#151515',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  secondaryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  footerBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});