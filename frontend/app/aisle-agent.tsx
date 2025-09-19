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
  ];

  const dashboardStats: DashboardStat[] = [
    { label: 'Orders', value: '12', change: '+2', isPositive: true },
    { label: 'Wishlist', value: '47', change: '+5', isPositive: true },
    { label: 'Rewards', value: '2,450', change: '+120', isPositive: true },
    { label: 'Level', value: 'Gold', change: '92%', isPositive: true },
  ];

  // Mock featured products
  const featuredProducts = [
    {
      id: '1',
      name: 'Classic Leather Handbag',
      brand: 'Hermès',
      price: 3200,
      originalPrice: 3800,
      currency: 'USD',
      category: 'handbags',
      rating: 4.8,
      isLiked: true,
      isNew: true,
      discount: 15,
      availability: 'in-stock' as const,
    },
    {
      id: '2',
      name: 'Luxury Swiss Watch',
      brand: 'Rolex',
      price: 8500,
      currency: 'USD',
      category: 'watches',
      rating: 4.9,
      isLiked: false,
      availability: 'limited' as const,
    },
    {
      id: '3',
      name: 'Designer Silk Scarf',
      brand: 'Louis Vuitton',
      price: 450,
      currency: 'USD',
      category: 'accessories',
      rating: 4.7,
      isLiked: false,
      availability: 'pre-order' as const,
    },
    {
      id: '4',
      name: 'Premium Cologne',
      brand: 'Tom Ford',
      price: 280,
      originalPrice: 350,
      currency: 'USD',
      category: 'fragrance',
      rating: 4.6,
      isLiked: true,
      discount: 20,
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
              <Text style={styles.headerSubtitle}>Ready for luxury shopping?</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
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
        <View style={styles.conversationSection}>
          <View style={styles.conversationCard}>
            <Text style={styles.conversationTitle}>Meet Aisle - Your AI Shopping Expert</Text>
            
            {/* Aisle Identity Message */}
            <View style={styles.aisleIdentityBanner}>
              <View style={styles.aisleIdentityHeader}>
                <Text style={styles.aisleIdentityIcon}>🤖</Text>
                <Text style={styles.aisleIdentityLabel}>Powered by OpenAI ChatGPT-5</Text>
              </View>
              <Text style={styles.aisleIdentityMessage}>
                Aisle is an OpenAI ChatGPT‑5 AI Agent specialized in commerce and shopping — bringing the right products to the right customers, 24/7/365, in every language and market.
              </Text>
            </View>
            
            <Text style={styles.conversationText}>
              Good evening! Welcome to AisleMarts Premium. I'm your personal AI shopping companion ready to help you discover amazing products, find exclusive deals, and make luxury shopping effortless.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.title}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.actionContent}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginRight: 8,
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e5e5',
  },
  
  // Prominent Aisle Identity Section Styles
  aisleIdentitySection: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  
  aisleIdentityCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  aisleAvatarIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  
  aisleIdentityInfo: {
    flex: 1,
  },
  
  aisleIdentityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a855f7',
    marginBottom: 4,
  },
  
  aisleIdentityTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4d4d8',
  },
  
  aisleIdentityStatement: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  aisleCapabilities: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  aisleCapability: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4d4d8',
    textAlign: 'center',
  },
  
  avatarSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
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
    color: '#ffffff',
  },
  
  voiceButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  voiceButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 200,
  },
  
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  
  voiceButtonTextActive: {
    color: '#0f0f23',
  },
  
  statusContainer: {
    alignItems: 'center',
  },
  
  statusBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f59e0b',
  },
  
  conversationSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  
  conversationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  conversationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  
  // Aisle Identity Banner Styles
  aisleIdentityBanner: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  
  aisleIdentityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  aisleIdentityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  
  aisleIdentityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a855f7',
  },
  
  aisleIdentityMessage: {
    fontSize: 13,
    fontWeight: '400',
    color: '#e5e5e5',
    lineHeight: 18,
  },
  
  conversationText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#d4d4d8',
    lineHeight: 24,
  },
  
  actionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  
  actionItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    aspectRatio: 1,
  },
  
  actionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  actionSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#a1a1a3',
    textAlign: 'center',
  },
});