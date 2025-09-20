import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const { width, height } = Dimensions.get('window');

interface FusionDashboardI18nProps {
  userName?: string;
}

export default function FusionDashboardI18n({ userName = 'Alex' }: FusionDashboardI18nProps) {
  const { t, i18n } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isRTL = i18n.dir() === 'rtl';

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

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Language Switcher */}
      <View style={[styles.languageSwitcher, isRTL && styles.languageSwitcherRTL]}>
        <LanguageSwitcher compact={true} />
      </View>
      
      {/* Header Badge */}
      <View style={styles.headerBadge}>
        <Text style={styles.badgeText}>🌍 AisleMarts • {t('digitalLifestyleUniverse')}</Text>
      </View>

      {/* Main Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>{t('welcomeToYourDigitalLifestyle', { name: userName })}</Text>
        <Text style={styles.subtitle}>{t('oneLifestyleBothWorlds')}</Text>
      </View>

      {/* Fusion Dashboard Layout */}
      <View style={[styles.dashboardLayout, isRTL && styles.dashboardLayoutRTL]}>
        
        {/* Real World Side */}
        <View style={styles.worldSection}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.2)', 'rgba(232, 201, 104, 0.1)']}
            style={styles.worldCard}
          >
            <Text style={styles.worldTitle}>{t('realWorld')}</Text>
            <Text style={styles.worldIcon}>🏪</Text>
            
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🛍️</Text>
                <Text style={styles.activityText}>{t('milanBoutique')}</Text>
                <Text style={styles.activityStatus}>{t('active')}</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>☕</Text>
                <Text style={styles.activityText}>{t('cafeMeeting')}</Text>
                <Text style={styles.activityStatus}>2:30 PM</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>👥</Text>
                <Text style={styles.activityText}>{t('friendsChat')}</Text>
                <Text style={styles.activityStatus}>{t('messages_count', { count: 3 })}</Text>
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
            <Text style={styles.fusionTitle}>{t('fusionZone')}</Text>
            <Text style={styles.fusionIcon}>⚡</Text>
            
            <View style={styles.fusionServices}>
              <TouchableOpacity style={styles.fusionService}>
                <Text style={styles.serviceIcon}>🤖</Text>
                <Text style={styles.serviceText}>{t('aiAssistant')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.fusionService}>
                <Text style={styles.serviceIcon}>∞</Text>
                <Text style={styles.serviceText}>{t('cloudHub')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.fusionService}>
                <Text style={styles.serviceIcon}>✨</Text>
                <Text style={styles.serviceText}>{t('lifestyleAds')}</Text>
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
            <Text style={styles.worldTitle}>{t('virtualWorld')}</Text>
            <Text style={styles.worldIcon}>🎮</Text>
            
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>👗</Text>
                <Text style={styles.activityText}>{t('avatarCloset')}</Text>
                <Text style={styles.activityStatus}>{t('updated')}</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🌐</Text>
                <Text style={styles.activityText}>{t('virtualHangout')}</Text>
                <Text style={styles.activityStatus}>{t('live')}</Text>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🤖</Text>
                <Text style={styles.activityText}>{t('aiCommunity')}</Text>
                <Text style={styles.activityStatus}>5 {t('online')}</Text>
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
        <Text style={styles.taglineText}>{t('whereRealMeetsVirtual')}</Text>
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
  languageSwitcher: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  languageSwitcherRTL: {
    right: 'auto',
    left: 20,
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
  dashboardLayoutRTL: {
    flexDirection: 'row-reverse',
  },
  worldSection: {
    width: '35%',
  },
  worldCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    minHeight: 300,
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
  activityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
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
    minHeight: 300,
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
  },
});