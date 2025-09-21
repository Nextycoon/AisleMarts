import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import EnhancedProductCard from '../src/components/EnhancedProductCard';
import RatesHealthTile from '../components/currency/RatesHealthTile';
import TabNavigator from './navigation/TabNavigator';

const { width, height } = Dimensions.get('window');

interface QuickAction {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: number;
  gradient: string[];
}

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export default function AisleAgentScreen() {
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState('Alex'); // This would come from auth context
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Animate components in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    // Pulse animation for voice button
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isListening]);

  const handleVoicePress = () => {
    setIsListening(!isListening);
    // Here you would integrate with speech recognition
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions: QuickAction[] = [
    {
      icon: '💬',
      title: 'Messages',
      subtitle: 'Direct messaging & chat',
      onPress: () => router.push('/chat'),
      badge: 3,
      gradient: ['#667eea', '#764ba2'],
    },
    {
      icon: '📞',
      title: 'Calls',
      subtitle: 'Voice & video calls',
      onPress: () => router.push('/calls'),
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      icon: '📺',
      title: 'Channels',
      subtitle: 'Creator & vendor channels',
      onPress: () => router.push('/channels'),
      gradient: ['#4facfe', '#00f2fe'],
    },
    {
      icon: '🔴',
      title: 'LiveSale',
      subtitle: 'Live shopping events',
      onPress: () => router.push('/livesale'),
      badge: 2,
      gradient: ['#43e97b', '#38f9d7'],
    },
    {
      icon: '🧠',
      title: 'AI Assistant',
      subtitle: 'Smart recommendations',
      onPress: () => router.push('/ai-assistant'),
      gradient: ['#fa709a', '#fee140'],
    },
    {
      icon: '🎯',
      title: 'Mood Cart',
      subtitle: 'AI-powered shopping',
      onPress: () => router.push('/mood-to-cart'),
      gradient: ['#a8edea', '#fed6e3'],
    },
    {
      icon: '🛒',
      title: 'Shopping Cart',
      subtitle: 'View cart & checkout',
      onPress: () => router.push('/cart'),
      badge: 3,
      gradient: ['#10b981', '#34d399'],
    },
    {
      icon: '💱',
      title: 'Currency Fusion v2',
      subtitle: 'Live global rates + crypto',
      onPress: () => router.push('/currency-fusion-dashboard-v2'),
      badge: 'NEW',
      gradient: ['#ffecd2', '#fcb69f'],
    },
    {
      icon: '🌍',
      title: 'Universal AI Hub',
      subtitle: 'Global commerce intelligence',
      onPress: () => router.push('/universal-ai-hub'),
      badge: 'AI',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      icon: '📊',
      title: 'Executive Dashboard',
      subtitle: 'Business metrics & KPIs',
      onPress: () => router.push('/executive-dashboard'),
      badge: 'C-SUITE',
      gradient: ['#ff9a9e', '#fecfef'],
    },
    {
      icon: '🎯',
      title: 'Rewards System',
      subtitle: 'Missions, streaks & gamification',
      onPress: () => router.push('/rewards'),
      badge: 'NEW',
      gradient: ['#0066CC', '#4A90E2'],
    },
    {
      icon: '🔔',
      title: 'Notifications',
      subtitle: 'Alerts & preferences',
      onPress: () => router.push('/notifications'),
      badge: 5,
      gradient: ['#667eea', '#764ba2'],
    },
    {
      icon: '🎬',
      title: 'Series A Demo Mode',
      subtitle: 'Investor presentation ready',
      onPress: () => router.push('/demo-mode'),
      badge: 'INVESTOR',
      gradient: ['#ff9a9e', '#fecfef'],
    },
    {
      icon: '🎤',
      title: 'Voice Assistant',
      subtitle: 'AI-powered shopping help',
      onPress: () => router.push('/voice-assistant'),
      badge: 'AI',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      icon: '🥽',
      title: 'AR Experience',
      subtitle: 'Try products in AR/VR',
      onPress: () => router.push('/ar-experience'),
      badge: 'NEW',
      gradient: ['#4facfe', '#00f2fe'],
    },
    {
      icon: '🎨',
      title: 'Creator Economy',
      subtitle: 'Content monetization hub',
      onPress: () => router.push('/creator-economy'),
      badge: 'CREATOR',
      gradient: ['#fa709a', '#fee140'],
    },
    {
      icon: '🌱',
      title: 'Sustainability',
      subtitle: 'Eco-friendly shopping',
      onPress: () => router.push('/sustainability'),
      badge: 'ECO',
      gradient: ['#43e97b', '#38f9d7'],
    },
    {
      icon: '👑',
      title: 'Premium Membership',
      subtitle: 'Exclusive luxury benefits',
      onPress: () => router.push('/premium-membership'),
      badge: 'LUXURY',
      gradient: ['#ffecd2', '#fcb69f'],
    },
  ];

  const dashboardStats: DashboardStat[] = [
    { label: 'Orders', value: '12', change: '+2', isPositive: true },
    { label: 'Wishlist', value: '47', change: '+5', isPositive: true },
    { label: 'AisleCoins', value: '1,250', change: '+75', isPositive: true },
    { label: 'League', value: 'Gold', change: '92%', isPositive: true },
  ];

  // Global luxury products showcasing Currency-Infinity Engine
  const featuredProducts = [
    {
      id: '1',
      name: 'Milan Designer Handbag',
      brand: 'Bottega Veneta',
      price: 2800,
      originalPrice: 3200,
      currency: 'EUR',
      category: 'handbags',
      rating: 4.9,
      isLiked: true,
      isNew: true,
      discount: 15,
      availability: 'in-stock' as const,
    },
    {
      id: '2',
      name: 'Swiss Luxury Watch',
      brand: 'Patek Philippe',
      price: 28500,
      currency: 'CHF',
      category: 'watches',
      rating: 4.9,
      isLiked: false,
      availability: 'limited' as const,
    },
    {
      id: '3',
      name: 'Tokyo Premium Kimono',
      brand: 'Kitsuke',
      price: 650000,
      currency: 'JPY',
      category: 'fashion',
      rating: 4.8,
      isLiked: false,
      availability: 'pre-order' as const,
    },
    {
      id: '4',
      name: 'Dubai Gold Jewelry',
      brand: 'Damas',
      price: 8500,
      originalPrice: 10000,
      currency: 'AED',
      category: 'jewelry',
      rating: 4.7,
      isLiked: true,
      discount: 15,
      availability: 'in-stock' as const,
    },
    {
      id: '5',
      name: 'London Cashmere Coat',
      brand: 'Burberry',
      price: 1200,
      currency: 'GBP',
      category: 'fashion',
      rating: 4.8,
      isLiked: false,
      availability: 'in-stock' as const,
    },
    {
      id: '6',
      name: 'Seoul Tech Gadget',
      brand: 'Samsung Galaxy',
      price: 1890000,
      currency: 'KRW',
      category: 'tech',
      rating: 4.6,
      isLiked: true,
      availability: 'in-stock' as const,
    },
  ];

  const renderQuickAction = (action: QuickAction, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.quickActionCard}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={action.gradient}
        style={styles.quickActionGradient}
      >
        <View style={styles.quickActionContent}>
          <View style={styles.quickActionHeader}>
            <Text style={styles.quickActionIcon}>{action.icon}</Text>
            {action.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{action.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.quickActionTitle}>{action.title}</Text>
          <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderDashboardStat = (stat: DashboardStat, index: number) => (
    <View key={index} style={styles.statCard}>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <Text style={[
        styles.statChange,
        { color: stat.isPositive ? '#4ade80' : '#f87171' }
      ]}>
        {stat.change}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Health Tile */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
              <Text style={styles.headerSubtitle}>One lifestyle. Both worlds. Real meets virtual.</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
          
          {/* Currency Health Tile */}
          <RatesHealthTile />
        </View>

        {/* Dashboard Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Dashboard</Text>
          <View style={styles.statsGrid}>
            {dashboardStats.map(renderDashboardStat)}
          </View>
        </View>

        {/* AI Voice Assistant */}
        <View style={styles.voiceSection}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.2)', 'rgba(232, 201, 104, 0.1)']}
            style={styles.voiceCard}
          >
            <View style={styles.voiceContent}>
              <Text style={styles.voiceTitle}>AI Shopping Assistant</Text>
              <Text style={styles.voiceSubtitle}>Powered by ChatGPT-5</Text>
            </View>
            
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive
                ]}
                onPress={handleVoicePress}
              >
                <LinearGradient
                  colors={isListening ? ['#ff6b6b', '#4ecdc4'] : ['#D4AF37', '#E8C968']}
                  style={styles.voiceButtonGradient}
                >
                  <Text style={styles.voiceButtonIcon}>
                    {isListening ? '🎤' : '🤖'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={({ item }) => (
              <EnhancedProductCard
                product={item}
                onPress={(product) => router.push(`/product/${product.id}`)}
                onLike={(product) => console.log('Liked:', product.name)}
                onAddToCart={(product) => console.log('Added to cart:', product.name)}
                style={{ marginRight: 16 }}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsListContent}
          />
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 32 }} />
      </Animated.ScrollView>
      
      <TabNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  statChange: {
    fontSize: 10,
    fontWeight: '600',
  },
  voiceSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  voiceCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  voiceContent: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#D4AF37',
  },
  voiceButton: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  voiceButtonActive: {
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  voiceButtonGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonIcon: {
    fontSize: 28,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    minHeight: 120,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 32,
  },
  badge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  productsSection: {
    marginBottom: 32,
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  productsListContent: {
    paddingLeft: 20,
  },
});