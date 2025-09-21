import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from '../navigation/TabNavigator';
import { RewardsAPI, SystemStats } from '../../lib/RewardsAPI';

const { width } = Dimensions.get('window');

export default function RewardsAnalytics() {
  const router = useRouter();
  
  // State
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    loadAnalyticsData();
    startAnimations();
  }, [selectedTimeframe]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadAnalyticsData = async () => {
    try {
      const data = await RewardsAPI.getSystemStats();
      setStats(data);
    } catch (error) {
      console.error('Analytics load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderTimeframeSelector = () => {
    const timeframes = [
      { key: '7d', label: '7 Days' },
      { key: '30d', label: '30 Days' },
      { key: '90d', label: '90 Days' },
      { key: 'all', label: 'All Time' }
    ] as const;

    return (
      <View style={styles.timeframeContainer}>
        {timeframes.map((timeframe) => (
          <TouchableOpacity
            key={timeframe.key}
            style={[
              styles.timeframeChip,
              selectedTimeframe === timeframe.key && styles.activeTimeframeChip
            ]}
            onPress={() => setSelectedTimeframe(timeframe.key)}
          >
            <Text style={[
              styles.timeframeText,
              selectedTimeframe === timeframe.key && styles.activeTimeframeText
            ]}>
              {timeframe.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMetricCard = (title: string, value: number, subtitle: string, color: string, trend?: number) => (
    <Animated.View 
      style={[
        styles.metricCard,
        { borderLeftColor: color, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        {trend !== undefined && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#34C759' : '#FF3B30' }]}>
            <Text style={styles.trendText}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.metricValue, { color }]}>{formatNumber(value)}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </Animated.View>
  );

  const renderEngagementChart = () => {
    if (!stats) return null;

    const engagementData = [
      { label: 'Daily Active', value: Math.floor(stats.activeRewardsUsers * 0.6), color: '#0066CC' },
      { label: 'Weekly Active', value: Math.floor(stats.activeRewardsUsers * 0.85), color: '#4A90E2' },
      { label: 'Monthly Active', value: stats.activeRewardsUsers, color: '#34C759' },
    ];

    const maxValue = Math.max(...engagementData.map(d => d.value));

    return (
      <Animated.View 
        style={[styles.chartContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.chartTitle}>User Engagement</Text>
        <View style={styles.chart}>
          {engagementData.map((item, index) => (
            <View key={index} style={styles.chartItem}>
              <View style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: (item.value / maxValue) * 100,
                      backgroundColor: item.color 
                    }
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{item.label}</Text>
              <Text style={[styles.chartValue, { color: item.color }]}>
                {formatNumber(item.value)}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderLeagueDistribution = () => {
    if (!stats) return null;

    const leagues = [
      { name: 'Bronze', count: stats.leagueDistribution.Bronze, color: '#CD7F32', icon: '🥉' },
      { name: 'Silver', count: stats.leagueDistribution.Silver, color: '#C0C0C0', icon: '🥈' },
      { name: 'Gold', count: stats.leagueDistribution.Gold, color: '#FFD700', icon: '🥇' },
      { name: 'Platinum', count: stats.leagueDistribution.Platinum, color: '#E5E4E2', icon: '💎' },
    ];

    const total = leagues.reduce((sum, league) => sum + league.count, 0);

    return (
      <Animated.View 
        style={[styles.distributionContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.distributionTitle}>League Distribution</Text>
        <View style={styles.distributionList}>
          {leagues.map((league, index) => {
            const percentage = (league.count / total) * 100;
            return (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionHeader}>
                  <View style={styles.distributionLeague}>
                    <Text style={styles.leagueIcon}>{league.icon}</Text>
                    <Text style={styles.leagueName}>{league.name}</Text>
                  </View>
                  <Text style={styles.distributionCount}>{formatNumber(league.count)}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        width: `${percentage}%`,
                        backgroundColor: league.color 
                      }
                    ]}
                  />
                </View>
                <Text style={styles.distributionPercentage}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderRevenueMetrics = () => {
    if (!stats) return null;

    const mockRevenue = {
      totalRevenue: 125000,
      withdrawalFees: 8500,
      premiumSubscriptions: 45000,
      transactionFees: 71500
    };

    return (
      <Animated.View 
        style={[styles.revenueContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.revenueTitle}>Revenue Analytics</Text>
        <View style={styles.revenueGrid}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueValue}>${formatNumber(mockRevenue.totalRevenue)}</Text>
            <Text style={styles.revenueGrowth}>+12.5% vs last month</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Withdrawal Fees</Text>
            <Text style={styles.revenueValue}>${formatNumber(mockRevenue.withdrawalFees)}</Text>
            <Text style={styles.revenueGrowth}>+8.3% vs last month</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Premium Subs</Text>
            <Text style={styles.revenueValue}>${formatNumber(mockRevenue.premiumSubscriptions)}</Text>
            <Text style={styles.revenueGrowth}>+25.7% vs last month</Text>
          </View>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Transaction Fees</Text>
            <Text style={styles.revenueValue}>${formatNumber(mockRevenue.transactionFees)}</Text>
            <Text style={styles.revenueGrowth}>+15.2% vs last month</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
        <TabNavigator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Rewards Analytics</Text>
          <Text style={styles.headerSubtitle}>Platform performance insights</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Timeframe Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeframe</Text>
          {renderTimeframeSelector()}
        </View>

        {/* Key Metrics */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              {renderMetricCard(
                'Total Users',
                stats.totalUsers,
                'Platform registered users',
                '#0066CC',
                12.5
              )}
              {renderMetricCard(
                'Active Rewards Users',
                stats.activeRewardsUsers,
                'Engaged with rewards',
                '#34C759',
                18.7
              )}
              {renderMetricCard(
                'Avg Engagement',
                stats.averageEngagement,
                'Out of 5.0 rating',
                '#FF9500',
                5.3
              )}
              {renderMetricCard(
                'Withdrawal Requests',
                stats.withdrawalRequests.pending + stats.withdrawalRequests.completedThisMonth,
                'This month',
                '#4A90E2',
                22.1
              )}
            </View>
          </View>
        )}

        {/* Engagement Chart */}
        {renderEngagementChart()}

        {/* League Distribution */}
        {renderLeagueDistribution()}

        {/* Revenue Metrics */}
        {renderRevenueMetrics()}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TabNavigator />
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
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    minWidth: 60,
  },
  backButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    minWidth: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeframeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTimeframeChip: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  timeframeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTimeframeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  metricsGrid: {
    gap: 16,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSubtitle: {
    color: '#666666',
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 32,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 80,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartBar: {
    width: '100%',
    borderRadius: 15,
    minHeight: 4,
  },
  chartLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  distributionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 32,
  },
  distributionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  distributionList: {
    gap: 16,
  },
  distributionItem: {
    gap: 8,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLeague: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leagueIcon: {
    fontSize: 16,
  },
  leagueName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  distributionCount: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  distributionPercentage: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'right',
  },
  revenueContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 32,
  },
  revenueTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  revenueItem: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: (width - 64) / 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.3)',
  },
  revenueLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 8,
  },
  revenueValue: {
    color: '#0066CC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  revenueGrowth: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '500',
  },
});