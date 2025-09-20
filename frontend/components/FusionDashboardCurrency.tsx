import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCurrency } from '../hooks/useCurrency';

const { width, height } = Dimensions.get('window');

interface FusionDashboardCurrencyProps {
  userName?: string;
}

export default function FusionDashboardCurrency({ userName = 'Alex' }: FusionDashboardCurrencyProps) {
  const { currentCurrency, formatCurrency, isLoading, getCurrencyInfo } = useCurrency();
  const [prices, setPrices] = useState({
    milanBag: 2500,
    premiumSubscription: 99,
    aiConsultation: 150,
    virtualOutfit: 45,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currencyInfo = getCurrencyInfo();

  useEffect(() => {
    // Start animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulsing fusion zone
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Flowing data animation
    Animated.loop(
      Animated.timing(flowAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🌍 Initializing Currency-Infinity Engine...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Currency Badge */}
      <View style={styles.currencyBadge}>
        <Text style={styles.currencyBadgeText}>
          💱 Currency: {currentCurrency} {currencyInfo?.symbol || ''}
        </Text>
      </View>
      
      {/* Header Badge */}
      <View style={styles.headerBadge}>
        <Text style={styles.badgeText}>🌍 AisleMarts • The Digital Lifestyle Universe</Text>
      </View>

      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{getGreeting()}, {userName}!</Text>
        <Text style={styles.subtitle}>One lifestyle. Both worlds. Universal currency.</Text>
      </View>

      {/* Fusion Dashboard Layout */}
      <View style={styles.dashboardLayout}>
        
        {/* Real World Side */}
        <View style={styles.worldSection}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.2)', 'rgba(232, 201, 104, 0.1)']}
            style={styles.worldCard}
          >
            <Text style={styles.worldTitle}>REAL WORLD</Text>
            <Text style={styles.worldIcon}>🏪</Text>
            
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🛍️</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Milan Boutique</Text>
                  <Text style={styles.priceText}>{formatCurrency(prices.milanBag)}</Text>
                </View>
                <Text style={styles.activityStatus}>Active</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>☕</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Café Meeting</Text>
                  <Text style={styles.priceText}>{formatCurrency(25)}</Text>
                </View>
                <Text style={styles.activityStatus}>2:30 PM</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>👥</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Friends Chat</Text>
                  <Text style={styles.priceText}>Free</Text>
                </View>
                <Text style={styles.activityStatus}>3 msgs</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Fusion Zone Center */}
        <Animated.View style={[styles.fusionZone, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.3)', 'rgba(15, 111, 255, 0.2)']}
            style={styles.fusionCard}
          >
            <Text style={styles.fusionTitle}>FUSION ZONE</Text>
            <Text style={styles.fusionIcon}>⚡</Text>
            
            <View style={styles.fusionServices}>
              <TouchableOpacity style={styles.fusionService}>
                <Text style={styles.serviceIcon}>🤖</Text>
                <Text style={styles.serviceText}>AI Assistant</Text>
                <Text style={styles.servicePrice}>{formatCurrency(prices.aiConsultation)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.fusionService}>
                <Text style={styles.serviceIcon}>∞</Text>
                <Text style={styles.serviceText}>Cloud Hub</Text>
                <Text style={styles.servicePrice}>{formatCurrency(prices.premiumSubscription)}/mo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.fusionService}>
                <Text style={styles.serviceIcon}>✨</Text>
                <Text style={styles.serviceText}>Lifestyle Ads</Text>
                <Text style={styles.servicePrice}>Premium</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Virtual World Side */}
        <View style={styles.worldSection}>
          <LinearGradient
            colors={['rgba(15, 111, 255, 0.2)', 'rgba(139, 69, 255, 0.1)']}
            style={styles.worldCard}
          >
            <Text style={styles.worldTitle}>VIRTUAL WORLD</Text>
            <Text style={styles.worldIcon}>🎮</Text>
            
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>👗</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Avatar Closet</Text>
                  <Text style={styles.priceText}>{formatCurrency(prices.virtualOutfit)}</Text>
                </View>
                <Text style={styles.activityStatus}>Updated</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🌐</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Virtual Hangout</Text>
                  <Text style={styles.priceText}>Free</Text>
                </View>
                <Text style={styles.activityStatus}>Live</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🤖</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>AI Community</Text>
                  <Text style={styles.priceText}>{formatCurrency(19)}/mo</Text>
                </View>
                <Text style={styles.activityStatus}>5 online</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Flow Arrows */}
      <Animated.View style={[styles.flowArrow, styles.leftArrow, {
        opacity: flowAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.3, 1, 0.3]
        })
      }]}>
        <Text style={styles.arrowText}>←→</Text>
      </Animated.View>
      
      <Animated.View style={[styles.flowArrow, styles.rightArrow, {
        opacity: flowAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.3, 1, 0.3]
        })
      }]}>
        <Text style={styles.arrowText}>←→</Text>
      </Animated.View>

      {/* Bottom Tagline */}
      <View style={styles.bottomTagline}>
        <Text style={styles.taglineText}>
          Where real meets virtual, and every currency is native.
        </Text>
        <Text style={styles.currencyInfo}>
          💱 Auto-detected: {currencyInfo?.name || 'USD'} • {Object.keys(require('../lib/currencyEngine').currencies).length}+ currencies supported
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  currencyBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    zIndex: 1000,
  },
  currencyBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
  },
  headerBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 20,
    marginBottom: 30,
  },
  badgeText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
  dashboardLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
    marginBottom: 40,
  },
  worldSection: {
    width: '35%',
  },
  worldCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    minHeight: 320,
  },
  worldTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  worldIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 20,
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  activityIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  priceText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activityStatus: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '600',
  },
  fusionZone: {
    width: '25%',
    alignItems: 'center',
  },
  fusionCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
    minHeight: 320,
    width: '100%',
    alignItems: 'center',
  },
  fusionTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  fusionIcon: {
    fontSize: 50,
    textAlign: 'center',
    marginBottom: 20,
  },
  fusionServices: {
    gap: 15,
    width: '100%',
  },
  fusionService: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  serviceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  serviceText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  servicePrice: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  flowArrow: {
    position: 'absolute',
    top: '50%',
  },
  leftArrow: {
    left: '32%',
  },
  rightArrow: {
    right: '32%',
  },
  arrowText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
  },
  bottomTagline: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  taglineText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  currencyInfo: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});