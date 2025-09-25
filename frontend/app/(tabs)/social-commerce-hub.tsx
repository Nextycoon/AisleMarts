import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
  FlatList
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// API configuration
const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://aislemart-shop.preview.emergentagent.com';

interface ShoppableContent {
  id: string;
  creator_name: string;
  title: string;
  description: string;
  media_urls: string[];
  engagement_count: number;
  view_count: number;
  revenue_generated: number;
  conversion_rate: number;
  hashtags: string[];
}

interface InfluencerProfile {
  user_id: string;
  username: string;
  display_name: string;
  tier: string;
  follower_count: number;
  engagement_rate: number;
  specialties: string[];
  is_verified: boolean;
}

interface SocialCommerceMetrics {
  platform_metrics: {
    total_shoppable_content: number;
    total_influencers: number;
    active_campaigns: number;
    total_revenue: number;
  };
  content_metrics: {
    avg_engagement_rate: number;
    avg_conversion_rate: number;
  };
}

const SocialCommerceHub: React.FC = () => {
  const [trendingContent, setTrendingContent] = useState<ShoppableContent[]>([]);
  const [topInfluencers, setTopInfluencers] = useState<InfluencerProfile[]>([]);
  const [metrics, setMetrics] = useState<SocialCommerceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'creators' | 'campaigns' | 'analytics'>('feed');

  const fetchSocialCommerceData = async () => {
    try {
      setLoading(true);
      
      // Fetch trending content
      const contentResponse = await fetch(`${API_BASE}/api/social-commerce/content/trending?limit=10`);
      if (contentResponse.ok) {
        const content = await contentResponse.json();
        setTrendingContent(content);
      }

      // Fetch top influencers
      const influencersResponse = await fetch(`${API_BASE}/api/social-commerce/influencers/search?limit=8`);
      if (influencersResponse.ok) {
        const influencers = await influencersResponse.json();
        setTopInfluencers(influencers);
      }

      // Fetch platform metrics
      const metricsResponse = await fetch(`${API_BASE}/api/social-commerce/analytics/platform`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

    } catch (error) {
      console.error('Failed to fetch social commerce data:', error);
      Alert.alert('Error', 'Failed to load social commerce data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSocialCommerceData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSocialCommerceData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderContentCard = ({ item }: { item: ShoppableContent }) => (
    <TouchableOpacity style={styles.contentCard} onPress={() => router.push(`/content/${item.id}`)}>
      <BlurView intensity={15} tint="dark" style={styles.contentBlur}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentCreator}>@{item.creator_name}</Text>
          <Text style={styles.contentRevenue}>${item.revenue_generated.toFixed(0)}</Text>
        </View>
        
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.contentStats}>
          <Text style={styles.statText}>👁️ {formatNumber(item.view_count)}</Text>
          <Text style={styles.statText}>❤️ {formatNumber(item.engagement_count)}</Text>
          <Text style={styles.statText}>📈 {(item.conversion_rate * 100).toFixed(1)}%</Text>
        </View>
        
        <View style={styles.hashtags}>
          {item.hashtags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderInfluencerCard = ({ item }: { item: InfluencerProfile }) => (
    <TouchableOpacity style={styles.influencerCard} onPress={() => router.push(`/influencer/${item.user_id}`)}>
      <BlurView intensity={15} tint="dark" style={styles.influencerBlur}>
        <View style={styles.influencerHeader}>
          <Text style={styles.influencerName}>{item.display_name}</Text>
          {item.is_verified && <Text style={styles.verifiedBadge}>✅</Text>}
        </View>
        
        <Text style={styles.influencerUsername}>@{item.username}</Text>
        <Text style={styles.influencerTier}>{item.tier.toUpperCase()} TIER</Text>
        
        <View style={styles.influencerStats}>
          <Text style={styles.followerCount}>{formatNumber(item.follower_count)} followers</Text>
          <Text style={styles.engagementRate}>{(item.engagement_rate * 100).toFixed(1)}% engagement</Text>
        </View>
        
        <View style={styles.specialties}>
          {item.specialties.slice(0, 2).map((specialty, index) => (
            <Text key={index} style={styles.specialty}>{specialty}</Text>
          ))}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🔥 Trending Content</Text>
            <FlatList
              data={trendingContent}
              renderItem={renderContentCard}
              keyExtractor={(item) => item.id}
              numColumns={1}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        );
      
      case 'creators':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>⭐ Top Creators</Text>
            <FlatList
              data={topInfluencers}
              renderItem={renderInfluencerCard}
              keyExtractor={(item) => item.user_id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
            />
          </View>
        );
      
      case 'campaigns':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🎯 Active Campaigns</Text>
            <View style={styles.comingSoonCard}>
              <BlurView intensity={15} tint="dark" style={styles.comingSoonBlur}>
                <Text style={styles.comingSoonIcon}>🚀</Text>
                <Text style={styles.comingSoonTitle}>Campaign Management</Text>
                <Text style={styles.comingSoonText}>
                  Advanced campaign creation and management tools coming soon!
                </Text>
                <TouchableOpacity style={styles.notifyButton} onPress={() => Alert.alert('Notification', 'You will be notified when this feature is available!')}>
                  <Text style={styles.notifyButtonText}>Notify Me</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </View>
        );
      
      case 'analytics':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>📊 Platform Analytics</Text>
            {metrics && (
              <View style={styles.analyticsGrid}>
                <BlurView intensity={15} tint="dark" style={styles.analyticsCard}>
                  <Text style={styles.analyticsValue}>{metrics.platform_metrics.total_shoppable_content}</Text>
                  <Text style={styles.analyticsLabel}>Shoppable Content</Text>
                </BlurView>
                
                <BlurView intensity={15} tint="dark" style={styles.analyticsCard}>
                  <Text style={styles.analyticsValue}>{metrics.platform_metrics.total_influencers}</Text>
                  <Text style={styles.analyticsLabel}>Active Creators</Text>
                </BlurView>
                
                <BlurView intensity={15} tint="dark" style={styles.analyticsCard}>
                  <Text style={styles.analyticsValue}>{metrics.platform_metrics.active_campaigns}</Text>
                  <Text style={styles.analyticsLabel}>Live Campaigns</Text>
                </BlurView>
                
                <BlurView intensity={15} tint="dark" style={styles.analyticsCard}>
                  <Text style={styles.analyticsValue}>${(metrics.platform_metrics.total_revenue / 1000).toFixed(0)}K</Text>
                  <Text style={styles.analyticsLabel}>Revenue Generated</Text>
                </BlurView>
                
                <BlurView intensity={15} tint="dark" style={[styles.analyticsCard, styles.fullWidth]}>
                  <Text style={styles.analyticsValue}>{(metrics.content_metrics.avg_engagement_rate * 100).toFixed(1)}%</Text>
                  <Text style={styles.analyticsLabel}>Avg Engagement Rate</Text>
                </BlurView>
                
                <BlurView intensity={15} tint="dark" style={[styles.analyticsCard, styles.fullWidth]}>
                  <Text style={styles.analyticsValue}>{(metrics.content_metrics.avg_conversion_rate * 100).toFixed(2)}%</Text>
                  <Text style={styles.analyticsLabel}>Avg Conversion Rate</Text>
                </BlurView>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading Social Commerce...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ Social Commerce Hub</Text>
        <Text style={styles.headerSubtitle}>Discover • Create • Monetize</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'feed', label: '🔥 Feed', icon: '🔥' },
          { key: 'creators', label: '⭐ Creators', icon: '⭐' },
          { key: 'campaigns', label: '🎯 Campaigns', icon: '🎯' },
          { key: 'analytics', label: '📊 Analytics', icon: '📊' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        {renderTabContent()}
        
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/create-content')}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.actionGradient}>
              <Text style={styles.actionButtonText}>📸 Create Content</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/become-creator')}>
            <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.actionGradient}>
              <Text style={styles.actionButtonText}>⭐ Become Creator</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  tabText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#D4AF37',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  contentCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentBlur: {
    padding: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentCreator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  contentRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  contentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtag: {
    fontSize: 12,
    color: '#8A2BE2',
    marginRight: 8,
  },
  influencerCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  influencerBlur: {
    padding: 12,
  },
  influencerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  influencerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 12,
  },
  influencerUsername: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  influencerTier: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  influencerStats: {
    marginBottom: 8,
  },
  followerCount: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  engagementRate: {
    fontSize: 11,
    color: '#4CAF50',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialty: {
    fontSize: 10,
    color: '#8A2BE2',
    marginRight: 4,
    marginBottom: 2,
  },
  row: {
    justifyContent: 'space-between',
  },
  comingSoonCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  comingSoonBlur: {
    padding: 32,
    alignItems: 'center',
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  notifyButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  notifyButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: (width - 40) / 2,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullWidth: {
    width: width - 32,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default SocialCommerceHub;