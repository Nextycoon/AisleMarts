/**
 * AppLoader - Enhanced loading component with luxury animations
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AppLoaderProps {
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  progress?: number;
}

export default function AppLoader({ 
  message = "AisleMarts", 
  subMessage = "Luxury Shopping Experience",
  showProgress = false,
  progress = 0
}: AppLoaderProps) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(-width)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer effect
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: width,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, []);

  useEffect(() => {
    if (showProgress) {
      Animated.timing(progressWidth, {
        toValue: progress * width * 0.8,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, showProgress]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated background particles */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {/* Logo with animations */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['#D4AF37', '#FFD700', '#E8C968']}
            style={styles.logoGradient}
          >
            <Text style={styles.logo}>{message}</Text>
          </LinearGradient>
          
          {/* Shimmer overlay */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerX }],
              },
            ]}
          />
        </Animated.View>

        <Text style={styles.subMessage}>{subMessage}</Text>

        {/* Progress bar */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((i) => (
              <LoadingDot key={i} delay={i * 200} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.loadingDot,
        { opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#D4AF37',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 2,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 16,
  },
  logoGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: width * 0.3,
  },
  subMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '500',
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
  },
});