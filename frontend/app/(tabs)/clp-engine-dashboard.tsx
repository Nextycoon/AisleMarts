import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const CLPEngineDashboard = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const mockData = {
        overview: {
          totalRevenue: 1847293.45,
          conversionRate: 9.4,
          avgEngagementScore: 0.87,
          clpEfficiency: 89.2,
          activeOptimizations: 47,
          revenueGrowth: 34.7
        },
        contentPerformance: {
          topContent: [
            {
              id: 'content_1',
              title: 'Luxury Fashion Showcase',
              type: 'video',
              views: 45892,
              engagementScore: 0.94,
              conversionRate: 12.3,
              revenue: 23450.67,
              clpScore: 0.91
            },
            {
              id: 'content_2', 
              title: 'Tech Gadget Review',
              type: 'carousel',
              views: 32145,
              engagementScore: 0.89,
              conversionRate: 10.8,
              revenue: 18734.23,
              clpScore: 0.87
            },
            {
              id: 'content_3',
              title: 'Home Decor Inspiration',
              type: 'image',
              views: 28976,
              engagementScore: 0.82,
              conversionRate: 8.4,
              revenue: 15623.89,
              clpScore: 0.83
            }
          ],
          contentTypePerformance: {
            video: { conversionRate: 11.2, revenue: 567890.23, efficiency: 0.89 },
            image: { conversionRate: 7.8, revenue: 345678.91, efficiency: 0.76 },
            carousel: { conversionRate: 9.6, revenue: 456789.12, efficiency: 0.84 },
            product_showcase: { conversionRate: 15.3, revenue: 678901.34, efficiency: 0.93 }
          }
        },
        infiniteDiscovery: {
          personalizationScore: 0.91,
          feedEngagementRate: 0.23,
          userSatisfactionScore: 0.88,
          discoveryEfficiency: 0.85,
          activeUsers: 45782,
          avgSessionDuration: 847, // seconds
          contentRelevanceScore: 0.92
        },
        conversionAnalytics: {
          funnelStages: {
            contentView: { users: 45890, conversionRate: 100 },
            productInterest: { users: 18356, conversionRate: 40.0 },
            consideration: { users: 7342, conversionRate: 16.0 },
            purchaseIntent: { users: 2203, conversionRate: 4.8 },
            purchase: { users: 661, conversionRate: 1.4 }
          },
          avgTimeToConversion: 1247, // seconds
          touchpointsAvg: 4.2,
          attributionAccuracy: 0.84
        },
        aiOptimization: {
          optimizationsDeployed: 156,
          successRate: 0.91,
          avgPerformanceImprovement: 23.4,
          realtimeOptimizations: 28,
          modelAccuracy: 0.94,
          learningVelocity: 'accelerating'
        },
        recentOptimizations: [
          {
            id: 'opt_1',
            type: 'Content Ranking',
            improvement: '+28% engagement',
            confidence: 0.92,
            status: 'deployed'
          },
          {
            id: 'opt_2',
            type: 'Product Placement',
            improvement: '+15% conversion',
            confidence: 0.87,
            status: 'testing'
          },
          {
            id: 'opt_3',
            type: 'Personalization',
            improvement: '+22% relevance',
            confidence: 0.89,
            status: 'deployed'
          }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading CLP dashboard data:', error);
      Alert.alert('Error', 'Failed to load CLP engine data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
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

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'speedometer' },
    { key: 'content', label: 'Content', icon: 'film' },
    { key: 'discovery', label: 'Discovery', icon: 'search' },
    { key: 'optimization', label: 'AI Optimization', icon: 'bulb' }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.loadingGradient}>
            <Text style={styles.loadingTitle}>CLP Engine</Text>
            <Text style={styles.loadingSubtitle}>Content → Lead → Purchase</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>CLP Engine</Text>
          <Text style={styles.headerSubtitle}>Content Lead Purchase</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="analytics-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CLP Formula Banner */}
        <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.formulaBanner}>
          <Text style={styles.formulaText}>CLP + PPL = AisleMarts</Text>
          <Text style={styles.formulaSubtext}>
            Content Lead Purchase + Pay Per Lead = Infinite Revenue Loop
          </Text>
        </LinearGradient>

        {/* Key Metrics Overview */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatCurrency(dashboardData?.overview.totalRevenue || 0)}
              </Text>
              <Text style={styles.metricLabel}>Total CLP Revenue</Text>
              <View style={styles.changeIndicator}>
                <Ionicons name="trending-up" size={14} color="#50C878" />
                <Text style={styles.changeText}>+{formatPercentage(dashboardData?.overview.revenueGrowth || 0)}</Text>
              </View>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatPercentage(dashboardData?.overview.conversionRate || 0)}
              </Text>
              <Text style={styles.metricLabel}>Conversion Rate</Text>
              <View style={styles.changeIndicator}>
                <Ionicons name="trending-up" size={14} color="#50C878" />
                <Text style={styles.changeText}>+2.8% vs market</Text>
              </View>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {Math.round((dashboardData?.overview.avgEngagementScore || 0) * 100)}
              </Text>
              <Text style={styles.metricLabel}>Engagement Score</Text>
              <View style={styles.changeIndicator}>
                <Ionicons name="star" size={14} color="#D4AF37" />
                <Text style={styles.changeText}>Excellent</Text>
              </View>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatPercentage(dashboardData?.overview.clpEfficiency || 0)}
              </Text>
              <Text style={styles.metricLabel}>CLP Efficiency</Text>
              <View style={styles.changeIndicator}>
                <Ionicons name="checkmark-circle" size={14} color="#50C878" />
                <Text style={styles.changeText}>Optimized</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.key ? '#000000' : '#888888'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View>
            <Text style={styles.sectionTitle}>Conversion Funnel</Text>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.funnelCard}>
              {Object.entries(dashboardData?.conversionAnalytics.funnelStages || {}).map(([stage, data]: [string, any], index) => (
                <View key={stage} style={styles.funnelStage}>
                  <View style={styles.funnelStageHeader}>
                    <Text style={styles.funnelStageName}>{stage.replace(/([A-Z])/g, ' $1').toLowerCase()}</Text>
                    <Text style={styles.funnelStageRate}>
                      {formatPercentage(data.conversionRate)}
                    </Text>
                  </View>
                  <View style={styles.funnelBar}>
                    <View 
                      style={[
                        styles.funnelBarFill, 
                        { width: `${data.conversionRate}%`, backgroundColor: `hsl(${120 - index * 20}, 70%, 50%)` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.funnelUsers}>{data.users.toLocaleString()} users</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        )}

        {activeTab === 'content' && (
          <View>
            <Text style={styles.sectionTitle}>Top Performing Content</Text>
            {dashboardData?.contentPerformance.topContent.map((content: any) => (
              <TouchableOpacity key={content.id} style={styles.contentCard}>
                <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.contentCardContent}>
                  <View style={styles.contentHeader}>
                    <View style={styles.contentTypeIcon}>
                      <Ionicons 
                        name={content.type === 'video' ? 'play' : content.type === 'carousel' ? 'albums' : 'image'} 
                        size={20} 
                        color="#D4AF37" 
                      />
                    </View>
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>{content.title}</Text>
                      <Text style={styles.contentType}>{content.type}</Text>
                    </View>
                    <View style={styles.contentScore}>
                      <Text style={styles.clpScoreValue}>{Math.round(content.clpScore * 100)}</Text>
                      <Text style={styles.clpScoreLabel}>CLP Score</Text>
                    </View>
                  </View>
                  
                  <View style={styles.contentMetrics}>
                    <View style={styles.contentMetric}>
                      <Text style={styles.contentMetricValue}>{content.views.toLocaleString()}</Text>
                      <Text style={styles.contentMetricLabel}>Views</Text>
                    </View>
                    <View style={styles.contentMetric}>
                      <Text style={styles.contentMetricValue}>{formatPercentage(content.conversionRate)}</Text>
                      <Text style={styles.contentMetricLabel}>Conversion</Text>
                    </View>
                    <View style={styles.contentMetric}>
                      <Text style={styles.contentMetricValue}>{formatCurrency(content.revenue)}</Text>
                      <Text style={styles.contentMetricLabel}>Revenue</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'discovery' && (
          <View>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.discoveryCard}>
              <Text style={styles.sectionTitle}>Infinite Discovery Engine</Text>
              <View style={styles.discoveryMetrics}>
                <View style={styles.discoveryMetric}>
                  <Text style={styles.discoveryValue}>
                    {Math.round((dashboardData?.infiniteDiscovery.personalizationScore || 0) * 100)}%
                  </Text>
                  <Text style={styles.discoveryLabel}>Personalization</Text>
                </View>
                <View style={styles.discoveryMetric}>
                  <Text style={styles.discoveryValue}>
                    {formatPercentage(dashboardData?.infiniteDiscovery.feedEngagementRate * 100 || 0)}
                  </Text>
                  <Text style={styles.discoveryLabel}>Feed Engagement</Text>
                </View>
                <View style={styles.discoveryMetric}>
                  <Text style={styles.discoveryValue}>
                    {Math.round(dashboardData?.infiniteDiscovery.avgSessionDuration / 60 || 0)}m
                  </Text>
                  <Text style={styles.discoveryLabel}>Avg Session</Text>
                </View>
                <View style={styles.discoveryMetric}>
                  <Text style={styles.discoveryValue}>
                    {Math.round((dashboardData?.infiniteDiscovery.contentRelevanceScore || 0) * 100)}%
                  </Text>
                  <Text style={styles.discoveryLabel}>Relevance</Text>
                </View>
              </View>
              
              <View style={styles.discoveryInsights}>
                <View style={styles.insightItem}>
                  <Ionicons name="bulb" size={16} color="#4A90E2" />
                  <Text style={styles.insightText}>
                    Infinite scroll algorithm achieving 23% engagement rate
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Ionicons name="trending-up" size={16} color="#50C878" />
                  <Text style={styles.insightText}>
                    User satisfaction improved by 34% with AI personalization
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Ionicons name="star" size={16} color="#D4AF37" />
                  <Text style={styles.insightText}>
                    Content relevance score at industry-leading 92%
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {activeTab === 'optimization' && (
          <View>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.optimizationCard}>
              <Text style={styles.sectionTitle}>AI Optimization Engine</Text>
              <View style={styles.optimizationOverview}>
                <View style={styles.optimizationStat}>
                  <Text style={styles.optimizationValue}>{dashboardData?.aiOptimization.optimizationsDeployed}</Text>
                  <Text style={styles.optimizationLabel}>Deployed</Text>
                </View>
                <View style={styles.optimizationStat}>
                  <Text style={styles.optimizationValue}>{formatPercentage(dashboardData?.aiOptimization.successRate * 100 || 0)}</Text>
                  <Text style={styles.optimizationLabel}>Success Rate</Text>
                </View>
                <View style={styles.optimizationStat}>
                  <Text style={styles.optimizationValue}>+{formatPercentage(dashboardData?.aiOptimization.avgPerformanceImprovement || 0)}</Text>
                  <Text style={styles.optimizationLabel}>Avg Improvement</Text>
                </View>
                <View style={styles.optimizationStat}>
                  <Text style={styles.optimizationValue}>{Math.round((dashboardData?.aiOptimization.modelAccuracy || 0) * 100)}%</Text>
                  <Text style={styles.optimizationLabel}>Model Accuracy</Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Recent Optimizations</Text>
            {dashboardData?.recentOptimizations.map((opt: any, index: number) => (
              <View key={opt.id} style={styles.optimizationItem}>
                <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.optimizationItemContent}>
                  <View style={styles.optimizationHeader}>
                    <View style={[styles.optimizationStatus, { 
                      backgroundColor: opt.status === 'deployed' ? '#50C878' : '#FFA500' 
                    }]} />
                    <Text style={styles.optimizationType}>{opt.type}</Text>
                    <Text style={styles.optimizationConfidence}>
                      {Math.round(opt.confidence * 100)}% confidence
                    </Text>
                  </View>
                  <Text style={styles.optimizationImprovement}>{opt.improvement}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.actionButtonGradient}>
              <Ionicons name="flash" size={20} color="#000000" />
              <Text style={styles.actionButtonText}>Optimize Now</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.actionButtonGradient}>
              <Ionicons name="analytics" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Deep Analytics
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
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
    padding: 40,
  },
  loadingGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formulaBanner: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  formulaText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formulaSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  metricsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4AF37',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 8,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 10,
    color: '#50C878',
    marginLeft: 4,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#000000',
  },
  funnelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  funnelStage: {
    marginBottom: 16,
  },
  funnelStageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  funnelStageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  funnelStageRate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  funnelBar: {
    height: 8,
    backgroundColor: '#2d2d2d',
    borderRadius: 4,
    marginBottom: 4,
  },
  funnelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  funnelUsers: {
    fontSize: 12,
    color: '#888888',
  },
  contentCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentCardContent: {
    padding: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contentType: {
    fontSize: 12,
    color: '#888888',
    textTransform: 'capitalize',
  },
  contentScore: {
    alignItems: 'center',
  },
  clpScoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D4AF37',
  },
  clpScoreLabel: {
    fontSize: 10,
    color: '#888888',
  },
  contentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentMetric: {
    alignItems: 'center',
  },
  contentMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contentMetricLabel: {
    fontSize: 10,
    color: '#888888',
  },
  discoveryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  discoveryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  discoveryMetric: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  discoveryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A90E2',
    marginBottom: 4,
  },
  discoveryLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  discoveryInsights: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 12,
    flex: 1,
  },
  optimizationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  optimizationOverview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optimizationStat: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  optimizationValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#9B59B6',
    marginBottom: 4,
  },
  optimizationLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  optimizationItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optimizationItemContent: {
    padding: 16,
  },
  optimizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optimizationStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  optimizationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  optimizationConfidence: {
    fontSize: 12,
    color: '#888888',
  },
  optimizationImprovement: {
    fontSize: 16,
    fontWeight: '700',
    color: '#50C878',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
});

export default CLPEngineDashboard;