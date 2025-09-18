import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  SlideInUp,
  SlideInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  interpolate
} from 'react-native-reanimated';
import { LuxuryButton } from '../src/components/LuxuryButton';
import { LuxuryCard } from '../src/components/LuxuryCard';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../src/theme/luxuryTokens';

const { width, height } = Dimensions.get('window');

export default function AisleAgentScreen() {
  const [isListening, setIsListening] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState(0);
  
  // Animation values
  const pulseAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0);
  const floatAnim = useSharedValue(0);

  const greetings = [
    "Good evening! Welcome to AisleMarts Premium",
    "I'm Aisle, your luxury shopping companion",
    "How can I elevate your shopping experience today?"
  ];

  useEffect(() => {
    // Cinematic breathing animation for the AI avatar
    pulseAnim.value = withRepeat(
      withTiming(1.1, { duration: 2000 }),
      -1,
      true
    );
    
    // Subtle floating animation
    floatAnim.value = withRepeat(
      withTiming(10, { duration: 3000 }),
      -1,
      true
    );
    
    // Glow effect
    glowAnim.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnim.value },
      { translateY: interpolate(floatAnim.value, [0, 10], [-5, 5]) }
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowAnim.value, [0, 1], [0.3, 0.8]),
  }));

  const handleVoicePress = () => {
    setIsListening(!isListening);
  };

  const quickActions = [
    {
      icon: '🔥',
      title: 'Trending',
      subtitle: 'Hot deals & new arrivals',
      gradient: [colors.primary[500], colors.primary[600]],
      onPress: () => console.log('Trending pressed')
    },
    {
      icon: '📍',
      title: 'Nearby',
      subtitle: 'Local boutiques & stores',
      gradient: [colors.gold[500], colors.gold[600]],
      onPress: () => console.log('Nearby pressed')
    },
    {
      icon: '🛒',
      title: 'Shop',
      subtitle: 'Browse premium brands',
      gradient: [colors.platinum[400], colors.platinum[500]],
      onPress: () => console.log('Shop pressed')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Cinematic Background */}
      <LinearGradient
        colors={[
          colors.fashion.midnight,
          colors.fashion.charcoal,
          colors.primary[900],
          colors.fashion.smokeGray
        ]}
        locations={[0, 0.4, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Background Elements */}
      <Animated.View 
        style={[styles.backgroundElement, styles.element1]}
        entering={FadeIn.delay(500)}
      />
      <Animated.View 
        style={[styles.backgroundElement, styles.element2]}
        entering={FadeIn.delay(700)}
      />

      {/* Header */}
      <Animated.View 
        style={styles.header}
        entering={SlideInDown.delay(200)}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Shopping Assistant</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Premium Mode</Text>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        
        {/* AI Avatar Section */}
        <Animated.View 
          style={styles.avatarSection}
          entering={SlideInUp.delay(400)}
        >
          <Animated.View style={[styles.avatarGlow, animatedGlowStyle]} />
          
          <Animated.View 
            style={[styles.avatarContainer, animatedAvatarStyle]}
          >
            <LinearGradient
              colors={[colors.primary[400], colors.primary[600], colors.gold[500]]}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
            </LinearGradient>
          </Animated.View>
          
          <Animated.View 
            style={styles.voiceButton}
            entering={FadeIn.delay(600)}
          >
            <LuxuryButton
              title={isListening ? "Listening..." : "Tap to talk with me!"}
              onPress={handleVoicePress}
              variant={isListening ? "luxury" : "glass"}
              size="md"
              style={styles.voiceButtonStyle}
            />
          </Animated.View>
          
          <Animated.View 
            style={styles.statusContainer}
            entering={FadeIn.delay(800)}
          >
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>• {isListening ? 'Listening' : 'Ready'}</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Conversation Section */}
        <Animated.View 
          style={styles.conversationSection}
          entering={SlideInUp.delay(600)}
        >
          <LuxuryCard variant="glass" style={styles.conversationCard}>
            <Text style={styles.conversationTitle}>Conversation</Text>
            <Text style={styles.conversationText}>
              Good evening! Welcome to AisleMarts Premium. I'm your personal AI shopping companion. I'm here to help you discover amazing products, find exclusive deals, and make luxury shopping effortless.
            </Text>
          </LuxuryCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          style={styles.actionsSection}
          entering={SlideInUp.delay(800)}
        >
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View 
                key={action.title}
                entering={SlideInUp.delay(1000 + index * 100)}
                style={styles.actionItem}
              >
                <LuxuryButton
                  title=""
                  onPress={action.onPress}
                  variant="glass"
                  style={styles.actionButton}
                >
                  <View style={styles.actionContent}>
                    <LinearGradient
                      colors={action.gradient}
                      style={styles.actionGradient}
                    />
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                </LuxuryButton>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fashion.midnight,
  },
  
  backgroundElement: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.05,
  },
  
  element1: {
    width: 300,
    height: 300,
    backgroundColor: colors.primary[500],
    top: -50,
    right: -100,
  },
  
  element2: {
    width: 250,
    height: 250,
    backgroundColor: colors.gold[500],
    bottom: 50,
    left: -75,
  },
  
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: Platform.OS === 'ios' ? spacing[2] : spacing[8],
    paddingBottom: spacing[4],
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.semibold,
    color: colors.dark.text,
  },
  
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold[500],
    marginRight: spacing[2],
  },
  
  statusText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.platinum[300],
  },
  
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[8],
  },
  
  avatarGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing[6],
  },
  
  avatarGradient: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarIcon: {
    fontSize: 40,
    color: colors.dark.text,
  },
  
  voiceButton: {
    marginBottom: spacing[4],
  },
  
  voiceButtonStyle: {
    paddingHorizontal: spacing[8],
    minWidth: 200,
  },
  
  statusContainer: {
    alignItems: 'center',
  },
  
  statusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gold[500],
  },
  
  statusBadgeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.medium,
    color: colors.gold[400],
  },
  
  conversationSection: {
    marginBottom: spacing[8],
  },
  
  conversationCard: {
    padding: spacing[6],
  },
  
  conversationTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.semibold,
    color: colors.dark.text,
    marginBottom: spacing[4],
  },
  
  conversationText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.normal,
    color: colors.platinum[300],
    lineHeight: typography.leading.relaxed * typography.sizes.base,
  },
  
  actionsSection: {
    flex: 1,
  },
  
  actionsTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.semibold,
    color: colors.dark.text,
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  
  actionItem: {
    flex: 1,
  },
  
  actionButton: {
    aspectRatio: 1,
    padding: 0,
  },
  
  actionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  actionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderRadius: borderRadius.sm,
  },
  
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing[2],
  },
  
  actionTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.semibold,
    color: colors.dark.text,
    marginBottom: spacing[1],
  },
  
  actionSubtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.body,
    fontWeight: typography.weights.normal,
    color: colors.platinum[400],
    textAlign: 'center',
  },
});