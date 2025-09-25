import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://aislemarts.preview.emergentagent.com';
const { width } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    total_clicks: number;
    total_conversions: number;
    total_earnings: number;
    avg_conversion_rate: number;
    click_trend: Array<{ date: string; clicks: number }>;
    earning_trend: Array<{ date: string; earnings: number }>;
  };
  top_links: Array<{
    id: string;
    title: string;
    clicks: number;
    conversions: number;
    earnings: number;
    conversion_rate: number;
    created_at: string;
  }>;
  performance_by_source: Array<{
    source: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
  recent_activity: Array<{
    type: 'click' | 'conversion';
    link_title: string;
    amount?: number;
    timestamp: string;
    source?: string;
  }>;
}

const timeRanges = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'All', value: 'all' },
];

export default function AffiliateAnalyticsScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/affiliate/analytics/affiliate_001?period=${selectedTimeRange}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics(false);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (rate: number) => {
    return (rate * 100).toFixed(1) + '%';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => {/* Share analytics report */}}
        >
          <Ionicons name="share-outline" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Selector */}
        <View style={styles.timeRangeSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.timeRangeButton,
                  selectedTimeRange === range.value && styles.activeTimeRange
                ]}
                onPress={() => setSelectedTimeRange(range.value)}
              >
                <Text style={[
                  styles.timeRangeText,
                  selectedTimeRange === range.value && styles.activeTimeRangeText
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>📊 Performance Overview</Text>
          
          <View style={styles.overviewGrid}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.overviewCard}
            >
              <View style={styles.overviewCardContent}>
                <Text style={styles.overviewValue}>
                  {formatNumber(data?.overview.total_clicks || 0)}
                </Text>
                <Text style={styles.overviewLabel}>Total Clicks</Text>
                <View style={styles.trendIndicator}>
                  <Ionicons name="trending-up" size={16} color="white" />
                  <Text style={styles.trendText}>+12.5%</Text>
                </View>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['#fa709a', '#fee140']}
              style={styles.overviewCard}
            >
              <View style={styles.overviewCardContent}>
                <Text style={styles.overviewValue}>
                  {formatNumber(data?.overview.total_conversions || 0)}
                </Text>
                <Text style={styles.overviewLabel}>Conversions</Text>
                <View style={styles.trendIndicator}>
                  <Ionicons name="trending-up" size={16} color="white" />
                  <Text style={styles.trendText}>+8.3%</Text>
                </View>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['#a8edea', '#fed6e3']}
              style={styles.overviewCard}
            >
              <View style={styles.overviewCardContent}>
                <Text style={styles.overviewValue}>
                  {formatCurrency(data?.overview.total_earnings || 0)}
                </Text>
                <Text style={styles.overviewLabel}>Total Earnings</Text>
                <View style={styles.trendIndicator}>
                  <Ionicons name="trending-up" size={16} color="white" />
                  <Text style={styles.trendText}>+15.2%</Text>
                </View>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['#ffecd2', '#fcb69f']}
              style={styles.overviewCard}
            >
              <View style={styles.overviewCardContent}>
                <Text style={styles.overviewValue}>
                  {formatPercentage(data?.overview.avg_conversion_rate || 0)}
                </Text>
                <Text style={styles.overviewLabel}>Conversion Rate</Text>
                <View style={styles.trendIndicator}>
                  <Ionicons name="trending-down" size={16} color="white" />
                  <Text style={styles.trendText}>-2.1%</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Top Performing Links */}
        <View style={styles.topLinksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Top Performing Links</Text>
            <TouchableOpacity onPress={() => router.push('/affiliate/links')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {data?.top_links?.slice(0, 5).map((link, index) => (
            <View key={link.id} style={styles.linkCard}>
              <View style={styles.linkHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.linkInfo}>
                  <Text style={styles.linkTitle} numberOfLines={2}>{link.title}</Text>
                  <Text style={styles.linkDate}>Created: {getTimeAgo(link.created_at)}</Text>
                </View>
              </View>

              <View style={styles.linkMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{formatNumber(link.clicks)}</Text>
                  <Text style={styles.metricLabel}>Clicks</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{formatNumber(link.conversions)}</Text>
                  <Text style={styles.metricLabel}>Sales</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{formatPercentage(link.conversion_rate)}</Text>
                  <Text style={styles.metricLabel}>CVR</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={[styles.metricValue, styles.earningsValue]}>
                    {formatCurrency(link.earnings)}
                  </Text>
                  <Text style={styles.metricLabel}>Earned</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Performance by Source */}
        <View style={styles.sourceSection}>
          <Text style={styles.sectionTitle}>📱 Traffic Sources</Text>
          
          {data?.performance_by_source?.map((source) => {
            const totalClicks = data.performance_by_source.reduce((sum, s) => sum + s.clicks, 0);
            const percentage = totalClicks > 0 ? (source.clicks / totalClicks) * 100 : 0;
            
            return (
              <View key={source.source} style={styles.sourceCard}>
                <View style={styles.sourceHeader}>
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceName}>{source.source}</Text>
                    <Text style={styles.sourcePercentage}>{percentage.toFixed(1)}% of traffic</Text>
                  </View>
                  <Text style={styles.sourceEarnings}>{formatCurrency(source.earnings)}</Text>
                </View>
                
                <View style={styles.sourceProgress}>
                  <View style={[styles.sourceProgressFill, { width: `${percentage}%` }]} />
                </View>
                
                <View style={styles.sourceStats}>
                  <Text style={styles.sourceStatText}>
                    {formatNumber(source.clicks)} clicks • {formatNumber(source.conversions)} sales
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>⚡ Recent Activity</Text>
          
          {data?.recent_activity?.slice(0, 10).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[
                styles.activityIcon,
                activity.type === 'conversion' ? styles.conversionIcon : styles.clickIcon
              ]}>
                <Ionicons 
                  name={activity.type === 'conversion' ? 'bag' : 'eye'} 
                  size={16} 
                  color="white" 
                />
              </View>
              
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {activity.type === 'conversion' ? 'Sale Generated' : 'Link Clicked'}
                </Text>
                <Text style={styles.activityDescription} numberOfLines={1}>
                  {activity.link_title}
                  {activity.source && ` • from ${activity.source}`}
                </Text>
                <Text style={styles.activityTime}>{getTimeAgo(activity.timestamp)}</Text>
              </View>
              
              {activity.type === 'conversion' && activity.amount && (
                <Text style={styles.activityEarnings}>
                  +{formatCurrency(activity.amount)}
                </Text>
              )}
            </View>
          ))}

          {(!data?.recent_activity || data.recent_activity.length === 0) && (
            <View style={styles.noActivity}>
              <Ionicons name="time-outline" size={48} color="#ccc" />
              <Text style={styles.noActivityText}>No recent activity</Text>
              <Text style={styles.noActivitySubtext}>Your activity will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timeRangeSection: {
    paddingVertical: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeTimeRange: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTimeRangeText: {
    color: 'white',
  },
  overviewSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    borderRadius: 16,
    padding: 16,
  },
  overviewCardContent: {
    position: 'relative',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  topLinksSection: {
    marginBottom: 32,
  },
  linkCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linkHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  linkDate: {
    fontSize: 12,
    color: '#999',
  },
  linkMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  earningsValue: {
    color: '#34C759',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  sourceSection: {
    marginBottom: 32,
  },
  sourceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sourcePercentage: {
    fontSize: 14,
    color: '#666',
  },
  sourceEarnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  sourceProgress: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  sourceProgressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  sourceStats: {
    marginTop: 4,
  },
  sourceStatText: {
    fontSize: 12,
    color: '#999',
  },
  activitySection: {
    marginBottom: 32,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clickIcon: {
    backgroundColor: '#667eea',
  },
  conversionIcon: {
    backgroundColor: '#34C759',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityEarnings: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34C759',
  },
  noActivity: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noActivityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  noActivitySubtext: {
    fontSize: 14,
    color: '#666',
  },
});