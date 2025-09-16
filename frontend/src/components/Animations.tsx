/**
 * Micro-interactions & Animation System
 * Smooth transitions, loading skeletons, and success animations
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  Dimensions,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// **LOADING SKELETONS**

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: SkeletonProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );
}

// Pickup window skeleton
export function PickupWindowSkeleton() {
  return (
    <View style={styles.windowSkeleton}>
      <View style={styles.windowSkeletonHeader}>
        <SkeletonLoader width={120} height={24} borderRadius={6} />
        <SkeletonLoader width={60} height={20} borderRadius={10} />
      </View>
      
      <View style={styles.windowSkeletonStats}>
        <View style={styles.windowSkeletonStat}>
          <SkeletonLoader width={30} height={20} borderRadius={4} />
          <SkeletonLoader width={50} height={14} borderRadius={4} />
        </View>
        <View style={styles.windowSkeletonStat}>
          <SkeletonLoader width={30} height={20} borderRadius={4} />
          <SkeletonLoader width={50} height={14} borderRadius={4} />
        </View>
        <View style={styles.windowSkeletonStat}>
          <SkeletonLoader width={30} height={20} borderRadius={4} />
          <SkeletonLoader width={50} height={14} borderRadius={4} />
        </View>
      </View>
      
      <SkeletonLoader width="100%" height={6} borderRadius={3} style={{ marginTop: 12 }} />
    </View>
  );
}

// Reservation item skeleton
export function ReservationSkeleton() {
  return (
    <View style={styles.reservationSkeleton}>
      <View style={styles.reservationSkeletonHeader}>
        <SkeletonLoader width={80} height={20} borderRadius={10} />
        <SkeletonLoader width={100} height={16} borderRadius={4} />
      </View>
      
      <View style={styles.reservationSkeletonItems}>
        <View style={styles.reservationSkeletonItem}>
          <SkeletonLoader width={120} height={16} borderRadius={4} />
          <SkeletonLoader width={40} height={16} borderRadius={4} />
        </View>
        <View style={styles.reservationSkeletonItem}>
          <SkeletonLoader width={140} height={16} borderRadius={4} />
          <SkeletonLoader width={40} height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

// **SUCCESS ANIMATIONS**

interface SuccessCheckmarkProps {
  size?: number;
  color?: string;
  onAnimationComplete?: () => void;
  visible?: boolean;
}

export function SuccessCheckmark({ 
  size = 60, 
  color = '#34C759',
  onAnimationComplete,
  visible = true
}: SuccessCheckmarkProps) {
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Scale and fade in animation
      Animated.parallel([
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Optional completion callback
        if (onAnimationComplete) {
          setTimeout(onAnimationComplete, 500);
        }
      });
    }
  }, [visible, scaleAnimation, opacityAnimation, onAnimationComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successCheckmark,
        {
          transform: [{ scale: scaleAnimation }],
          opacity: opacityAnimation,
        },
      ]}
    >
      <View
        style={[
          styles.successCircle,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: color 
          },
        ]}
      >
        <Ionicons 
          name="checkmark" 
          size={size * 0.6} 
          color="white" 
        />
      </View>
    </Animated.View>
  );
}

// **FADE TRANSITIONS**

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

export function FadeInView({ 
  children, 
  delay = 0, 
  duration = 300,
  style 
}: FadeInViewProps) {
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnimation, delay, duration]);

  return (
    <Animated.View style={[{ opacity: fadeAnimation }, style]}>
      {children}
    </Animated.View>
  );
}

// **SLIDE TRANSITIONS**

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  distance?: number;
  style?: any;
}

export function SlideInView({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 300,
  distance = 50,
  style 
}: SlideInViewProps) {
  const slideAnimation = useRef(new Animated.Value(distance)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnimation, opacityAnimation, delay, duration]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: slideAnimation }];
      case 'right':  
        return [{ translateX: Animated.multiply(slideAnimation, -1) }];
      case 'up':
        return [{ translateY: slideAnimation }];
      case 'down':
        return [{ translateY: Animated.multiply(slideAnimation, -1) }];
      default:
        return [{ translateY: slideAnimation }];
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: opacityAnimation,
          transform: getTransform(),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

// **PROGRESS INDICATORS**

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  style?: any;
}

export function ProgressBar({
  progress,
  height = 8,
  backgroundColor = '#f0f0f0',
  progressColor = '#007AFF',
  animated = true,
  style
}: ProgressBarProps) {
  const widthAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnimation, {
        toValue: progress,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Can't use native driver for width animations
      }).start();
    } else {
      widthAnimation.setValue(progress);
    }
  }, [progress, animated, widthAnimation]);

  const animatedWidth = widthAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.progressBar,
        {
          backgroundColor,
          height,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: progressColor,
            height,
            borderRadius: height / 2,
            width: animatedWidth,
          },
        ]}
      />
    </View>
  );
}

// **BOUNCE ANIMATION FOR BUTTONS**

interface BounceButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}

export function BounceButton({ 
  children, 
  onPress, 
  style,
  disabled = false 
}: BounceButtonProps) {
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    if (disabled) return;
    
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      setTimeout(onPress, 100);
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnimation }],
        },
        style,
      ]}
    >
      <View 
        onTouchEnd={animatePress}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Skeleton styles
  skeleton: {
    backgroundColor: '#e1e5e9',
  },
  
  windowSkeleton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  windowSkeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  windowSkeletonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  windowSkeletonStat: {
    alignItems: 'center',
    gap: 6,
  },
  
  reservationSkeleton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  reservationSkeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  reservationSkeletonItems: {
    gap: 8,
  },
  
  reservationSkeletonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Success animation styles
  successCheckmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  successCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // Progress bar styles
  progressBar: {
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
  },
});

export default {
  SkeletonLoader,
  PickupWindowSkeleton,
  ReservationSkeleton,
  SuccessCheckmark,
  FadeInView,
  SlideInView,
  ProgressBar,
  BounceButton,
};