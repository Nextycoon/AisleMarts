import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface DashboardMetrics {
  gmv: {
    total: number;
    daily: number;
    growth: number;
  };
  users: {
    dau: number;
    mau: number;
    ratio: number;
  };
  creators: {
    active: number;
    posts_today: number;
    engagement_rate: number;
  };
  conversion: {
    view_to_cart: number;
    cart_to_checkout: number;
    shop_the_look_ctr: number;
  };
  ai: {
    mood_carts_generated: number;
    avg_response_time: number;
    success_rate: number;
  };
  recent_activity: {
    time: string;
    type: 'purchase' | 'post' | 'mood_cart' | 'signup';
    value: string;
    amount?: number;
  }[];
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  // Generate simulated real-time data for investor demos
  const generateMetrics = (): DashboardMetrics => {
    const baseGMV = 47850;
    const variance = Math.random() * 2000 - 1000; // ±$1000 variance
    
    return {
      gmv: {
        total: baseGMV + variance,
        daily: 3250 + Math.random() * 500,
        growth: 23.5 + Math.random() * 5
      },
      users: {
        dau: 1247 + Math.floor(Math.random() * 50),
        mau: 15630 + Math.floor(Math.random() * 200),
        ratio: 8.0 + Math.random() * 2
      },
      creators: {
        active: 89 + Math.floor(Math.random() * 10),
        posts_today: 156 + Math.floor(Math.random() * 20),
        engagement_rate: 34.2 + Math.random() * 5
      },
      conversion: {
        view_to_cart: 18.5 + Math.random() * 3,
        cart_to_checkout: 12.3 + Math.random() * 2,
        shop_the_look_ctr: 31.8 + Math.random() * 4
      },
      ai: {
        mood_carts_generated: 432 + Math.floor(Math.random() * 20),
        avg_response_time: 7.2 + Math.random() * 1.5,
        success_rate: 94.8 + Math.random() * 3
      },
      recent_activity: [
        { time: '2 sec ago', type: 'purchase', value: 'Luxury Silk Dress', amount: 599 },
        { time: '15 sec ago', type: 'mood_cart', value: 'Luxurious mood cart generated' },
        { time: '32 sec ago', type: 'post', value: 'New fashion post by @EmmaStyle' },
        { time: '45 sec ago', type: 'purchase', value: 'Smart Watch Pro', amount: 299 },
        { time: '1 min ago', type: 'signup', value: 'New creator joined from Instagram' },
        { time: '2 min ago', type: 'mood_cart', value: 'Minimalist mood cart generated' },
        { time: '3 min ago', type: 'purchase', value: 'Home Decor Bundle', amount: 189 },
      ]
    };
  };

  useEffect(() => {
    // Initial load
    setMetrics(generateMetrics());

    // Live updates every 5 seconds when in live mode
    const interval = setInterval(() => {
      if (liveMode) {
        setMetrics(generateMetrics());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [liveMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setMetrics(generateMetrics());
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.floor(num));
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const renderMetricCard = (title: string, value: string, subtitle: string, growth?: number, color = '#E8C968') => (
    <View style={styles.metricCard}>
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.metricCardGradient}
      >
        <View style={styles.metricCardHeader}>
          <Text style={styles.metricTitle}>{title}</Text>
          {growth !== undefined && (
            <View style={[styles.growthBadge, { backgroundColor: growth > 0 ? '#4CAF50' : '#F44336' }]}>
              <Text style={styles.growthText}>
                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </View>
  );

  const renderActivityItem = (activity: DashboardMetrics['recent_activity'][0]) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'purchase': return '💰';
        case 'post': return '📱';
        case 'mood_cart': return '🤖';
        case 'signup': return '👤';
        default: return '📊';
      }
    };

    const getActivityColor = (type: string) => {
      switch (type) {
        case 'purchase': return '#4CAF50';
        case 'post': return '#2196F3';
        case 'mood_cart': return '#FF9800';
        case 'signup': return '#9C27B0';
        default: return '#E8C968';
      }
    };

    return (
      <View key={`${activity.time}-${activity.value}`} style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
          <Text style={styles.activityIconText}>{getActivityIcon(activity.type)}</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityValue}>{activity.value}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
        {activity.amount && (
          <Text style={styles.activityAmount}>{formatCurrency(activity.amount)}</Text>
        )}
      </View>
    );
  };

  if (!metrics) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#0C0F14', '#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.titleBadge}
          >
            <Text style={styles.titleBadgeText}>NORTH STAR</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time Series A metrics</Text>
        </View>
        <TouchableOpacity
          style={[styles.liveToggle, liveMode && styles.liveToggleActive]}
          onPress={() => setLiveMode(!liveMode)}
        >
          <View style={[styles.liveDot, liveMode && styles.liveDotActive]} />
          <Text style={[styles.liveText, liveMode && styles.liveTextActive]}>
            {liveMode ? 'LIVE' : 'PAUSED'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E8C968"
            colors={['#E8C968']}
          />
        }
      >
        {/* GMV Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Revenue Metrics</Text>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Total GMV',
              formatCurrency(metrics.gmv.total),
              'Gross Merchandise Value',
              metrics.gmv.growth,
              '#4CAF50'
            )}
            {renderMetricCard(
              'Daily Revenue',
              formatCurrency(metrics.gmv.daily),
              'Last 24 hours',
              undefined,
              '#2196F3'
            )}
          </View>
        </View>

        {/* User Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 User Engagement</Text>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'DAU',
              formatNumber(metrics.users.dau),
              'Daily Active Users',
              undefined,
              '#FF9800'
            )}
            {renderMetricCard(
              'DAU/MAU',
              formatPercentage(metrics.users.ratio),
              `${formatNumber(metrics.users.mau)} Monthly Active`,
              undefined,
              '#9C27B0'
            )}
          </View>
        </View>

        {/* Creator Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎥 Creator Performance</Text>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Active Creators',
              formatNumber(metrics.creators.active),
              'Creating content today',
              undefined,
              '#E91E63'
            )}
            {renderMetricCard(
              'Posts Today',
              formatNumber(metrics.creators.posts_today),
              `${formatPercentage(metrics.creators.engagement_rate)} engagement`,
              undefined,
              '#673AB7'
            )}
          </View>
        </View>

        {/* Conversion Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ Conversion Funnel</Text>
          <View style={styles.conversionFunnel}>
            <View style={styles.funnelStep}>
              <Text style={styles.funnelLabel}>Shop the Look CTR</Text>
              <Text style={styles.funnelValue}>{formatPercentage(metrics.conversion.shop_the_look_ctr)}</Text>
            </View>
            <Text style={styles.funnelArrow}>→</Text>
            <View style={styles.funnelStep}>
              <Text style={styles.funnelLabel}>View to Cart</Text>
              <Text style={styles.funnelValue}>{formatPercentage(metrics.conversion.view_to_cart)}</Text>
            </View>
            <Text style={styles.funnelArrow}>→</Text>
            <View style={styles.funnelStep}>
              <Text style={styles.funnelLabel}>Cart to Checkout</Text>
              <Text style={styles.funnelValue}>{formatPercentage(metrics.conversion.cart_to_checkout)}</Text>
            </View>
          </View>
        </View>

        {/* AI Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI Performance</Text>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Mood Carts',
              formatNumber(metrics.ai.mood_carts_generated),
              'Generated today',
              undefined,
              '#00BCD4'
            )}
            {renderMetricCard(
              'Response Time',
              `${metrics.ai.avg_response_time.toFixed(1)}s`,
              `${formatPercentage(metrics.ai.success_rate)} success rate`,
              undefined,
              '#4CAF50'
            )}
          </View>
        </View>

        {/* Live Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Live Activity</Text>
          <View style={styles.activityFeed}>
            {metrics.recent_activity.map(renderActivityItem)}
          </View>
        </View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  liveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  liveToggleActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  liveDotActive: {
    backgroundColor: '#4CAF50',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  liveTextActive: {
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  growthBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  growthText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  conversionFunnel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  funnelStep: {
    alignItems: 'center',
    flex: 1,
  },
  funnelLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textAlign: 'center',
  },
  funnelValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8C968',
  },
  funnelArrow: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  activityFeed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    fontSize: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
});