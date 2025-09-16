/**
 * Motion System - Luxury Animations with Accessibility
 * Respects reduced motion preferences for battery life and accessibility
 */

import { AccessibilityInfo, Platform } from 'react-native';

// Initialize reduced motion detection
let isReduceMotionEnabled = false;

// Check system preferences for reduced motion
const initializeMotionPreferences = async () => {
  try {
    if (Platform.OS !== 'web') {
      isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled() || false;
    }
  } catch (error) {
    console.warn('Failed to detect reduced motion preference:', error);
    isReduceMotionEnabled = false;
  }
};

// Initialize on import
initializeMotionPreferences();

// Motion presets that respect accessibility
export const motion = {
  // Duration values
  duration: {
    fast: isReduceMotionEnabled ? 0 : 200,      // Quick interactions
    normal: isReduceMotionEnabled ? 0 : 300,    // Standard transitions  
    slow: isReduceMotionEnabled ? 0 : 500,      // Cinematic reveals
    hero: isReduceMotionEnabled ? 0 : 800,      // Hero animations
  },

  // Spring configurations
  spring: {
    gentle: isReduceMotionEnabled 
      ? { tension: 0, friction: 0 }
      : { tension: 120, friction: 14 },
    
    bouncy: isReduceMotionEnabled
      ? { tension: 0, friction: 0 }
      : { tension: 200, friction: 12 },
      
    snappy: isReduceMotionEnabled
      ? { tension: 0, friction: 0 }
      : { tension: 300, friction: 20 },
  },

  // Easing curves
  easing: {
    ease: 'ease-out',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    dramatic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Common animation presets
  presets: {
    fadeIn: {
      duration: isReduceMotionEnabled ? 0 : 300,
      useNativeDriver: true,
    },
    
    slideUp: {
      duration: isReduceMotionEnabled ? 0 : 400,
      useNativeDriver: true,
    },
    
    scaleIn: {
      duration: isReduceMotionEnabled ? 0 : 250,
      useNativeDriver: true,
    },
    
    heroReveal: {
      duration: isReduceMotionEnabled ? 0 : 800,
      useNativeDriver: true,
    },
  }
};

// Utility functions
export const getMotionConfig = (animationType: 'fade' | 'slide' | 'scale' | 'hero' = 'fade') => {
  switch (animationType) {
    case 'slide':
      return motion.presets.slideUp;
    case 'scale':
      return motion.presets.scaleIn;
    case 'hero':
      return motion.presets.heroReveal;
    default:
      return motion.presets.fadeIn;
  }
};

// Check if animations should be disabled
export const shouldAnimate = () => !isReduceMotionEnabled;

// Dynamic motion values that can be used in components
export const getDuration = (type: 'fast' | 'normal' | 'slow' | 'hero') => {
  return motion.duration[type];
};

export const getSpring = (type: 'gentle' | 'bouncy' | 'snappy') => {
  return motion.spring[type];
};

// Update motion preferences (for settings screen)
export const updateMotionPreferences = async () => {
  await initializeMotionPreferences();
  return isReduceMotionEnabled;
};

export default motion;