import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useAuth } from '../src/context/AuthContext';
// import AppLoader from '../src/components/AppLoader';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  console.log('🚀 AisleMarts app entry loaded');
  
  const handleStoriesPress = () => {
    console.log('🎯 Manual navigation to stories');
    router.push('/(tabs)/stories');
  };

  const handleForYouPress = () => {
    console.log('🎯 Manual navigation to for-you'); 
    router.push('/for-you');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>AisleMarts</Text>
      <Text style={styles.subtitle}>Testing Vertical Stories</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleStoriesPress}
      >
        <Text style={styles.buttonText}>Go to Stories</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleForYouPress}
      >
        <Text style={styles.buttonText}>Go to For You</Text>
      </TouchableOpacity>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 40,
  },
  progressBar: {
    width: width * 0.7,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  progressText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
});