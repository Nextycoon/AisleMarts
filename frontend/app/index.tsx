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
        { progress: 0.2, message: 'Loading user preferences...', delay: 400 },
        { progress: 0.4, message: 'Connecting to services...', delay: 400 },
        { progress: 0.6, message: 'Initializing awareness engine...', delay: 400 },
        { progress: 0.8, message: 'Setting up luxury experience...', delay: 400 },
        { progress: 1.0, message: 'Ready...', delay: 500 }
      ];

      for (const step of loadingSteps) {
        console.log(`📊 ${step.message}`);
        setLoadingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      console.log('✅ AisleMarts Platform Ready');
      setIsInitializing(false);
      
      // Auto-navigate to for-you after loading completes
      setTimeout(() => {
        console.log('🎯 Auto-navigating to For You feed');
        router.replace('/for-you');
      }, 800);

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
          <Text style={styles.loadingTagline}>Connecting Global Commerce</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${loadingProgress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(loadingProgress * 100)}%</Text>
          </View>
          
          <Text style={styles.brandMessage}>Your Global Marketplace Network</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      <Text style={styles.title}>AisleMarts</Text>
      <Text style={styles.subtitle}>Testing Vertical Stories</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleNavigation('/(tabs)/stories', 'Stories')}
      >
        <Text style={styles.buttonText}>Go to Stories</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleNavigation('/for-you', 'For You')}
      >
        <Text style={styles.buttonText}>Go to For You</Text>
      </TouchableOpacity>
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
  brandMessage: {
    fontSize: 16,
    color: '#6366F1',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 20,
  },

  // Main App Styles
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
});