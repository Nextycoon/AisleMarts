import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAwareness } from '../lib/awarenessContext';

const { width, height } = Dimensions.get('window');

export default function AwarenessEnhancedHomeScreen() {
  const {
    profile,
    adaptiveResponse,
    isLoading,
    error,
    formatCurrency,
    formatDateTime,
    getLocalizedContent,
    shouldShowFeature,
    updatePreferences
  } = useAwareness();

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  // Generate contextual greeting
  const getContextualGreeting = () => {
    if (!profile?.time_context) return getLocalizedContent('welcome');
    
    const timeCategory = profile.time_context.time_category;
    const userName = profile.user_context?.preferences?.name || 'Valued Customer';
    
    const greetings = {
      morning: `🌅 Good morning, ${userName}!`,
      afternoon: `☀️ Good afternoon, ${userName}!`,
      evening: `🌆 Good evening, ${userName}!`,
      night: `🌙 Good evening, ${userName}!`
    };
    
    return greetings[timeCategory] || `Welcome to AisleMarts, ${userName}!`;
  };

  // Get awareness-based quick actions
  const getAdaptiveQuickActions = () => {
    const baseActions = [
      {
        icon: 'chatbubbles',
        title: getLocalizedContent('chat'),
        subtitle: 'Direct messaging & chat',
        onPress: () => router.push('/chat'),
        feature: 'dm_chat'
      },
      {
        icon: 'call',
        title: 'Calls',
        subtitle: 'Voice & video calls',
        onPress: () => router.push('/calls'),
        feature: 'calls'
      },
      {
        icon: 'tv',
        title: 'Channels',
        subtitle: 'Creator & vendor channels',
        onPress: () => router.push('/channels'),
        feature: 'channels'
      },
      {
        icon: 'radio',
        title: getLocalizedContent('live_sale'),
        subtitle: 'Live shopping events',
        onPress: () => router.push('/livesale'),
        feature: 'live_sale'
      },
      {
        icon: 'people',
        title: 'Business Leads',
        subtitle: 'Sales funnel management',
        onPress: () => router.push('/business/leads'),
        feature: 'business_leads'
      },
      {
        icon: 'sparkles',
        title: 'AI Assistant',
        subtitle: 'Luxury shopping AI',
        onPress: () => router.push('/ai-assistant'),
        feature: 'ai_assistant'
      }
    ];

    // Filter actions based on awareness context
    return baseActions.filter(action => shouldShowFeature(action.feature));
  };

  // Get contextual recommendations
  const getContextualRecommendations = () => {
    if (!adaptiveResponse?.recommendations) return [];
    return adaptiveResponse.recommendations.slice(0, 3);
  };

  // Get time-based status message
  const getStatusMessage = () => {
    if (!profile?.time_context) return 'Premium Service Active';
    
    const { time_category, is_weekend, business_hours } = profile.time_context;
    
    if (!business_hours && !is_weekend) {
      return 'After Hours - Premium Support Available';
    } else if (is_weekend) {
      return 'Weekend Premium Mode';
    } else if (time_category === 'morning') {
      return 'Morning Fresh Deals Available';
    } else if (time_category === 'evening') {
      return 'Evening Exclusive Access';
    }
    
    return 'Premium Service Active';
  };

  // Handle language change
  const handleLanguageChange = async (language: string) => {
    try {
      await updatePreferences({ language });
      setShowLanguageSelector(false);
    } catch (error) {
      console.error('Language change failed:', error);
    }
  };

  // Handle currency change
  const handleCurrencyChange = async (currency: string) => {
    try {
      await updatePreferences({ currency });
      setShowCurrencySelector(false);
    } catch (error) {
      console.error('Currency change failed:', error);
    }
  };

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  const supportedCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Initializing Awareness Engine...</Text>
          <Text style={styles.loadingSubtext}>Detecting your preferences</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF4444" />
          <Text style={styles.errorText}>Awareness Engine Error</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Awareness Status Header */}
        <View style={styles.awarenessHeader}>
          <View style={styles.awarenessInfo}>
            <Text style={styles.awarenessTitle}>🧠 AisleMarts Intelligence</Text>
            <Text style={styles.awarenessSubtitle}>
              {profile?.location_context?.city}, {profile?.location_context?.country} • {formatDateTime(new Date())}
            </Text>
          </View>
          <View style={styles.awarenessControls}>
            <TouchableOpacity
              style={styles.awarenessButton}
              onPress={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              <Ionicons name="language" size={20} color="#D4AF37" />
              <Text style={styles.awarenessButtonText}>{profile?.language?.toUpperCase() || 'EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.awarenessButton}
              onPress={() => setShowCurrencySelector(!showCurrencySelector)}
            >
              <Ionicons name="card" size={20} color="#D4AF37" />
              <Text style={styles.awarenessButtonText}>
                {profile?.currency_context?.primary_currency || 'USD'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Selector */}
        {showLanguageSelector && (
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Select Language</Text>
            {supportedLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.selectorItem,
                  profile?.language === lang.code && styles.selectorItemActive
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.selectorFlag}>{lang.flag}</Text>
                <Text style={styles.selectorText}>{lang.name}</Text>
                {profile?.language === lang.code && (
                  <Ionicons name="checkmark" size={20} color="#D4AF37" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Currency Selector */}
        {showCurrencySelector && (
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Select Currency</Text>
            {supportedCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.selectorItem,
                  profile?.currency_context?.primary_currency === currency.code && styles.selectorItemActive
                ]}
                onPress={() => handleCurrencyChange(currency.code)}
              >
                <Text style={styles.selectorSymbol}>{currency.symbol}</Text>
                <Text style={styles.selectorText}>{currency.name}</Text>
                {profile?.currency_context?.primary_currency === currency.code && (
                  <Ionicons name="checkmark" size={20} color="#D4AF37" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Contextual Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{getContextualGreeting()}</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{getStatusMessage()}</Text>
            </View>
          </View>
        </View>

        {/* Personalization Score */}
        {profile?.personalization_score && (
          <View style={styles.personalizationCard}>
            <View style={styles.personalizationHeader}>
              <Ionicons name="analytics" size={24} color="#D4AF37" />
              <Text style={styles.personalizationTitle}>Personalization Score</Text>
            </View>
            <View style={styles.personalizationBar}>
              <View 
                style={[
                  styles.personalizationFill,
                  { width: `${profile.personalization_score * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.personalizationText}>
              {Math.round(profile.personalization_score * 100)}% - {
                profile.personalization_score > 0.8 ? 'Excellent' :
                profile.personalization_score > 0.6 ? 'Good' :
                profile.personalization_score > 0.4 ? 'Fair' : 'Basic'
              } personalization
            </Text>
          </View>
        )}

        {/* Contextual Recommendations */}
        {getContextualRecommendations().length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>🎯 Smart Recommendations</Text>
            {getContextualRecommendations().map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationReason}>{rec.reason}</Text>
                <View style={styles.recommendationProducts}>
                  {rec.products?.slice(0, 3).map((product, i) => (
                    <View key={i} style={styles.productTag}>
                      <Text style={styles.productTagText}>{product}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Aisle Identity Section */}
        <View style={styles.aisleIdentitySection}>
          <View style={styles.aisleIdentityCard}>
            <View style={styles.aisleIdentityHeader}>
              <View style={styles.aisleAvatarContainer}>
                <Text style={styles.aisleAvatarIcon}>🤖</Text>
              </View>
              <View style={styles.aisleIdentityInfo}>
                <Text style={styles.aisleIdentityName}>Aisle AI Assistant</Text>
                <Text style={styles.aisleIdentityTagline}>Context-Aware Shopping Intelligence</Text>
              </View>
            </View>
            <Text style={styles.aisleIdentityStatement}>
              Your personal AI shopping assistant, powered by advanced awareness technology that adapts to your location, time, preferences, and cultural context for the perfect luxury experience.
            </Text>
            <View style={styles.aisleCapabilities}>
              <Text style={styles.aisleCapability}>🌍 Location Aware</Text>
              <Text style={styles.aisleCapability}>🕒 Time Adaptive</Text>
              <Text style={styles.aisleCapability}>💱 Currency Smart</Text>
              <Text style={styles.aisleCapability}>🗣️ Multi-Language</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {getAdaptiveQuickActions().map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon as any} size={24} color="#D4AF37" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contextual Notifications */}
        {adaptiveResponse?.notifications?.length > 0 && (
          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>📢 Context Updates</Text>
            {adaptiveResponse.notifications.map((notification, index) => (
              <View key={index} style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationPriority}>{notification.priority}</Text>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#999999',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtext: {
    color: '#999999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  awarenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  awarenessInfo: {
    flex: 1,
  },
  awarenessTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  awarenessSubtitle: {
    color: '#999999',
    fontSize: 12,
    marginTop: 2,
  },
  awarenessControls: {
    flexDirection: 'row',
    gap: 8,
  },
  awarenessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  awarenessButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  selectorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  selectorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  selectorItemActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  selectorFlag: {
    fontSize: 24,
  },
  selectorSymbol: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
    color: '#D4AF37',
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
    marginRight: 6,
  },
  statusText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  personalizationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
  },
  personalizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  personalizationTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  personalizationBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  personalizationFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  personalizationText: {
    color: '#999999',
    fontSize: 14,
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationReason: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 12,
  },
  recommendationProducts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productTagText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  aisleIdentitySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  aisleIdentityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  aisleIdentityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aisleAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aisleAvatarIcon: {
    fontSize: 32,
  },
  aisleIdentityInfo: {
    flex: 1,
  },
  aisleIdentityName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  aisleIdentityTagline: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  aisleIdentityStatement: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  aisleCapabilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  aisleCapability: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: (width - 56) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
  },
  notificationsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationPriority: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  notificationMessage: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});