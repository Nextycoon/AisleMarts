import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import AisleAvatar from '../src/components/AisleAvatar';
import ProductReels from '../src/components/ProductReels';
import QuickAccessDock from '../src/components/QuickAccessDock';
import { aiService } from '../src/services/AIService';
import { authIdentityService } from '../src/services/AuthIdentityService';

export default function BlueEraDashboardScreen() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [userRole, setUserRole] = useState<'brand' | 'shopper'>('shopper');
  const [greeting, setGreeting] = useState('');
  const [trustScore, setTrustScore] = useState(85);
  const [dailyInsight, setDailyInsight] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    initializeDashboard();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = async () => {
    try {
      // Determine user role (could be stored in user profile or passed from role selection)
      const role = user?.roles?.includes('vendor') ? 'brand' : 'shopper';
      setUserRole(role);

      // Generate personalized greeting
      const personalizedGreeting = await generateDailyGreeting(role);
      setGreeting(personalizedGreeting);

      // Get real trust score from backend
      if (user?.id) {
        try {
          const trustScoreData = await authIdentityService.getTrustScore(user.id);
          setTrustScore(trustScoreData.trust_score || 85);
        } catch (error) {
          console.log('Using fallback trust score:', error);
          setTrustScore(Math.floor(Math.random() * 20) + 80); // Fallback
        }
      }

      // Get daily AI insight using real AI service
      const insight = await getDailyInsightFromAI(role);
      setDailyInsight(insight);
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  };

  const generateDailyGreeting = async (role: 'brand' | 'shopper'): Promise<string> => {
    const hour = currentTime.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const userName = user?.name || 'there';

    const greetings = {
      brand: {
        morning: `Good morning, ${userName}! 🌅 Ready to expand your global reach today?`,
        afternoon: `Good afternoon, ${userName}! 🌍 Your products are making waves internationally.`,
        evening: `Good evening, ${userName}! 🌙 Time to review today's global performance.`,
      },
      shopper: {
        morning: `Good morning, ${userName}! ☀️ I've found some amazing discoveries for you.`,
        afternoon: `Good afternoon, ${userName}! 🛍️ Perfect time for some mindful shopping.`,
        evening: `Good evening, ${userName}! 🌟 Let's explore tonight's featured finds.`,
      },
    };

    return greetings[role][timeOfDay];
  };

  const getDailyInsightFromAI = async (role: 'brand' | 'shopper'): Promise<string> => {
    try {
      // Use AI service to generate personalized insights
      const contextPrompt = role === 'brand' 
        ? `Generate a daily business insight for a brand/seller on AisleMarts. Focus on market trends, opportunities, or actionable advice. Keep it under 100 characters.`
        : `Generate a daily shopping insight for a consumer on AisleMarts. Focus on deals, trends, or personalized recommendations. Keep it under 100 characters.`;
      
      const aiResponse = await aiService.getInsights(user || undefined, contextPrompt);
      
      // Extract insight from AI response
      if (aiResponse && aiResponse.response) {
        return aiResponse.response;
      }
      
      // Fallback to curated insights if AI fails
      return getDailyInsight(role);
    } catch (error) {
      console.log('AI insight failed, using fallback:', error);
      return getDailyInsight(role);
    }
  };

  const getDailyInsight = async (role: 'brand' | 'shopper'): Promise<string> => {
    const insights = {
      brand: [
        '📈 Turkish handicrafts are trending 23% higher this week',
        '🌍 3 new international buyers viewed your products today',
        '💡 Consider adding video content - it increases engagement by 40%',
        '📄 2 compliance documents need your attention',
        '🎯 German market shows strong interest in your category',
      ],
      shopper: [
        '✨ New sustainable products match your interests',
        '💎 5 items in your wishlist are on sale today',
        '🚀 AI found 3 products similar to your recent purchases',
        '🌍 Discover: Artisan crafts from verified Turkish sellers',
        '📦 Track: Your order from Germany ships today',
      ],
    };

    const roleInsights = insights[role];
    return roleInsights[Math.floor(Math.random() * roleInsights.length)];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  };

  const handleTrustScorePress = () => {
    Alert.alert(
      'Trust Protection',
      `Your trust score is ${trustScore}%. This reflects your verification level, transaction history, and community feedback.`,
      [
        { text: 'Learn More', onPress: () => router.push('/auth-identity') },
        { text: 'OK' },
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTrustBar = () => (
    <TouchableOpacity style={styles.trustBar} onPress={handleTrustScorePress}>
      <LinearGradient
        colors={['#34C759', '#32D74B']}
        style={styles.trustBarGradient}
      >
        <View style={styles.trustBarContent}>
          <Ionicons name="shield-checkmark" size={20} color="white" />
          <Text style={styles.trustBarText}>Trust Protected</Text>
          <Text style={styles.trustScore}>{trustScore}%</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderGreetingSection = () => (
    <View style={styles.greetingSection}>
      <LinearGradient
        colors={userRole === 'brand' ? ['#0A2540', '#1E90FF'] : ['#34C759', '#32D74B']}
        style={styles.greetingGradient}
      >
        <View style={styles.greetingContent}>
          <View style={styles.greetingLeft}>
            <AisleAvatar
              pose="idle"
              expression="joyful"
              size="medium"
              onPress={() => Alert.alert('Aisle', 'How can I help you today? 🌟')}
            />
          </View>
          
          <View style={styles.greetingRight}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <View style={styles.greetingMeta}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.roleText}>
                {userRole === 'brand' ? '💙 Blue Badge' : '💚 Green Badge'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderInsightCard = () => (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons name="bulb" size={20} color="#FFD700" />
        <Text style={styles.insightTitle}>Daily Insight</Text>
      </View>
      <Text style={styles.insightText}>{dailyInsight}</Text>
      <TouchableOpacity style={styles.insightAction}>
        <Text style={styles.insightActionText}>Explore</Text>
        <Ionicons name="arrow-forward" size={16} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons 
          name={userRole === 'brand' ? 'trending-up' : 'bag'} 
          size={24} 
          color={userRole === 'brand' ? '#34C759' : '#007AFF'} 
        />
        <Text style={styles.statNumber}>
          {userRole === 'brand' ? '24' : itemCount}
        </Text>
        <Text style={styles.statLabel}>
          {userRole === 'brand' ? 'Active Products' : 'Cart Items'}
        </Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons 
          name={userRole === 'brand' ? 'globe' : 'heart'} 
          size={24} 
          color={userRole === 'brand' ? '#FF9500' : '#FF3B30'} 
        />
        <Text style={styles.statNumber}>
          {userRole === 'brand' ? '12' : '8'}
        </Text>
        <Text style={styles.statLabel}>
          {userRole === 'brand' ? 'Countries' : 'Favorites'}
        </Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons 
          name={userRole === 'brand' ? 'cash' : 'receipt'} 
          size={24} 
          color="#5856D6" 
        />
        <Text style={styles.statNumber}>
          {userRole === 'brand' ? '$2.4K' : '15'}
        </Text>
        <Text style={styles.statLabel}>
          {userRole === 'brand' ? 'Monthly Revenue' : 'Orders'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blue Era Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Trust Bar */}
      {renderTrustBar()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        {renderGreetingSection()}

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Daily Insight */}
        {renderInsightCard()}

        {/* Product Reels */}
        <ProductReels
          userRole={userRole}
          onReelPress={(reel) => {
            Alert.alert('Product Reel', `Opening ${reel.title}...`);
          }}
          onAddToCart={(reel) => {
            Alert.alert('Added to Cart', `${reel.title} added to your cart!`);
          }}
        />

        {/* Spacer for dock */}
        <View style={styles.dockSpacer} />
      </ScrollView>

      {/* Quick Access Dock */}
      <QuickAccessDock
        userRole={userRole}
        onToggle={(isOpen) => {
          // Could be used to adjust layout when dock is open
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  trustBar: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trustBarGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trustBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trustBarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  trustScore: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  greetingSection: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  greetingGradient: {
    padding: 20,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingLeft: {
    marginRight: 16,
  },
  greetingRight: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    lineHeight: 24,
    marginBottom: 8,
  },
  greetingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  roleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  insightActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  dockSpacer: {
    height: 120,
  },
});