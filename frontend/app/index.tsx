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