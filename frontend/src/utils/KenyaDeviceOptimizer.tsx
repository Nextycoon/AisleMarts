import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, PixelRatio } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kenya's most common mobile devices and screen specs
const KENYA_DEVICE_PROFILES = {
  // Budget Android phones (most common in Kenya)
  budget_android: {
    screenWidth: 360,
    screenHeight: 640,
    pixelRatio: 2,
    ram: '2GB',
    storage: '16GB',
    network: '3G/4G',
    optimizations: {
      reducedAnimations: true,
      compressedImages: true,
      simplifiedUI: true,
      offlineFirst: true
    }
  },
  
  // Mid-range Android (Samsung A-series, common in Kenya)
  midrange_android: {
    screenWidth: 390,
    screenHeight: 844,
    pixelRatio: 2.5,
    ram: '4GB',
    storage: '64GB',
    network: '4G',
    optimizations: {
      reducedAnimations: false,
      compressedImages: true,
      simplifiedUI: false,
      offlineFirst: true
    }
  },
  
  // iPhone (less common but growing)
  iphone: {
    screenWidth: 390,
    screenHeight: 844,
    pixelRatio: 3,
    ram: '4GB+',
    storage: '64GB+',
    network: '4G/5G',
    optimizations: {
      reducedAnimations: false,
      compressedImages: false,
      simplifiedUI: false,
      offlineFirst: false
    }
  }
};

interface DeviceOptimization {
  reducedAnimations: boolean;
  compressedImages: boolean;
  simplifiedUI: boolean;
  offlineFirst: boolean;
  deviceProfile: keyof typeof KENYA_DEVICE_PROFILES;
  networkOptimized: boolean;
}

interface KenyaDeviceContextType {
  deviceProfile: keyof typeof KENYA_DEVICE_PROFILES;
  optimizations: DeviceOptimization;
  isLowEndDevice: boolean;
  screenDimensions: { width: number; height: number };
  pixelRatio: number;
  enabledOptimizations: string[];
}

// Device detection logic for Kenya market
export const detectKenyaDevice = (): keyof typeof KENYA_DEVICE_PROFILES => {
  const { width, height } = Dimensions.get('window');
  const pixelRatio = PixelRatio.get();
  
  // Budget Android detection (most common in Kenya)
  if (width <= 360 && pixelRatio <= 2 && Platform.OS === 'android') {
    return 'budget_android';
  }
  
  // iPhone detection
  if (Platform.OS === 'ios') {
    return 'iphone';
  }
  
  // Default to mid-range Android
  return 'midrange_android';
};

// Performance optimization utilities
export class KenyaPerformanceOptimizer {
  
  // Image optimization for Kenya's network conditions
  static optimizeImageForKenya(imageUri: string, deviceProfile: keyof typeof KENYA_DEVICE_PROFILES): string {
    const profile = KENYA_DEVICE_PROFILES[deviceProfile];
    
    if (profile.optimizations.compressedImages) {
      // Add compression parameters for 3G/slow 4G networks
      const quality = deviceProfile === 'budget_android' ? 60 : 80;
      const maxWidth = profile.screenWidth;
      
      // In a real app, you'd use image CDN with query parameters
      return `${imageUri}?q=${quality}&w=${maxWidth}&format=webp`;
    }
    
    return imageUri;
  }
  
  // Animation configuration for device capabilities
  static getAnimationConfig(deviceProfile: keyof typeof KENYA_DEVICE_PROFILES) {
    const profile = KENYA_DEVICE_PROFILES[deviceProfile];
    
    if (profile.optimizations.reducedAnimations) {
      return {
        duration: 150,
        useNativeDriver: true,
        easing: 'linear'
      };
    }
    
    return {
      duration: 300,
      useNativeDriver: true,
      easing: 'ease-out'
    };
  }
  
  // Network request optimization
  static getNetworkConfig(deviceProfile: keyof typeof KENYA_DEVICE_PROFILES) {
    const profile = KENYA_DEVICE_PROFILES[deviceProfile];
    
    return {
      timeout: profile.network === '3G/4G' ? 15000 : 10000, // Longer timeout for 3G
      retries: profile.network === '3G/4G' ? 3 : 2,
      cacheEnabled: profile.optimizations.offlineFirst,
      compression: profile.optimizations.compressedImages
    };
  }
  
  // Memory management for low-end devices
  static shouldLazyLoad(deviceProfile: keyof typeof KENYA_DEVICE_PROFILES): boolean {
    const profile = KENYA_DEVICE_PROFILES[deviceProfile];
    return profile.ram === '2GB' || profile.optimizations.simplifiedUI;
  }
  
  // UI complexity decisions
  static getUIComplexity(deviceProfile: keyof typeof KENYA_DEVICE_PROFILES) {
    const profile = KENYA_DEVICE_PROFILES[deviceProfile];
    
    return {
      showAnimations: !profile.optimizations.reducedAnimations,
      showShadows: deviceProfile !== 'budget_android',
      showBlur: deviceProfile === 'iphone',
      maxSimultaneousImages: deviceProfile === 'budget_android' ? 6 : 12,
      enableHaptics: Platform.OS === 'ios' || deviceProfile === 'midrange_android'
    };
  }
}

// React hook for Kenya device optimization
export const useKenyaDeviceOptimization = (): KenyaDeviceContextType => {
  const [deviceProfile, setDeviceProfile] = useState<keyof typeof KENYA_DEVICE_PROFILES>('midrange_android');
  const [optimizations, setOptimizations] = useState<DeviceOptimization>({
    reducedAnimations: false,
    compressedImages: true,
    simplifiedUI: false,
    offlineFirst: true,
    deviceProfile: 'midrange_android',
    networkOptimized: true
  });

  useEffect(() => {
    initializeDeviceOptimization();
  }, []);

  const initializeDeviceOptimization = async () => {
    // Detect device type
    const detectedProfile = detectKenyaDevice();
    setDeviceProfile(detectedProfile);
    
    // Get profile-specific optimizations
    const profile = KENYA_DEVICE_PROFILES[detectedProfile];
    const newOptimizations: DeviceOptimization = {
      ...profile.optimizations,
      deviceProfile: detectedProfile,
      networkOptimized: profile.network.includes('3G')
    };
    
    setOptimizations(newOptimizations);
    
    // Save for future sessions
    try {
      await AsyncStorage.setItem('kenya_device_profile', detectedProfile);
      await AsyncStorage.setItem('kenya_optimizations', JSON.stringify(newOptimizations));
    } catch (error) {
      console.error('Failed to save device optimization settings:', error);
    }
  };

  const screenDimensions = Dimensions.get('window');
  const pixelRatio = PixelRatio.get();
  const isLowEndDevice = deviceProfile === 'budget_android';
  
  const enabledOptimizations = Object.entries(optimizations)
    .filter(([key, value]) => value === true && key !== 'deviceProfile')
    .map(([key]) => key);

  return {
    deviceProfile,
    optimizations,
    isLowEndDevice,
    screenDimensions,
    pixelRatio,
    enabledOptimizations
  };
};

// Kenya-specific performance monitoring
export class KenyaPerformanceMonitor {
  private static startTimes: Map<string, number> = new Map();
  
  static startTimer(label: string) {
    this.startTimes.set(label, Date.now());
  }
  
  static endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.startTimes.delete(label);
    
    // Log performance for analytics
    console.log(`Kenya Performance [${label}]: ${duration}ms`);
    
    return duration;
  }
  
  // Monitor app start time for Kenya devices
  static async logAppStartTime(deviceProfile: keyof typeof KENYA_DEVICE_PROFILES) {
    const startTime = await AsyncStorage.getItem('app_start_time');
    if (startTime) {
      const duration = Date.now() - parseInt(startTime);
      console.log(`Kenya App Start Time [${deviceProfile}]: ${duration}ms`);
      
      // Remove after logging
      await AsyncStorage.removeItem('app_start_time');
      
      return duration;
    }
    return 0;
  }
}

// Kenya market-specific constants
export const KENYA_MARKET_CONFIG = {
  currency: 'KES',
  languages: ['en', 'sw'], // English and Swahili
  timeZone: 'Africa/Nairobi',
  phoneFormat: '+254',
  paymentMethods: ['mpesa', 'card'],
  networkConditions: {
    excellent: '4G/5G',
    good: '4G',
    poor: '3G/2G'
  },
  commonScreenSizes: [
    { width: 360, height: 640 }, // Budget Android
    { width: 390, height: 844 }, // Mid-range
    { width: 414, height: 896 }  // Premium
  ]
};

// Export for use in components
export default {
  KENYA_DEVICE_PROFILES,
  KenyaPerformanceOptimizer,
  useKenyaDeviceOptimization,
  KenyaPerformanceMonitor,
  KENYA_MARKET_CONFIG,
  detectKenyaDevice
};