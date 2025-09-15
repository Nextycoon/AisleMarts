import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../src/screens/SplashScreen';
import AvatarHomeScreen from '../src/screens/AvatarHomeScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('has_launched');
      
      if (!hasLaunched) {
        // First time launch - show splash
        setShowSplash(true);
        await AsyncStorage.setItem('has_launched', 'true');
        
        // Auto-hide splash after 2.5 seconds
        setTimeout(() => {
          setShowSplash(false);
          setIsLoading(false);
        }, 2500);
      } else {
        // Skip splash for subsequent launches
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }

  // Main app content - AI-First AvatarHome as default
  return <AvatarHomeScreen />;
}