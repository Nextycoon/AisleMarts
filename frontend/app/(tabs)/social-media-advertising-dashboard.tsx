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

const SocialMediaAdvertisingDashboard = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('campaigns');

  // Mock API base URL (in production, this would come from environment variables)
  const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulated comprehensive social media advertising data
      const mockData = {
        overview: {
          totalCampaigns: 24,
          activeCampaigns: 18,
          totalSpend: 87543.67,
          totalRevenue: 342876.45,
          overallRoas: 3.92,
          totalImpressions: 12847392,
          totalClicks: 89473,
          totalConversions: 3821
        },
        platforms: {
          facebook: {
            name: 'Facebook',
            icon: 'logo-facebook',
            color: '#1877f2',
            campaigns: 6,
            spend: 23450.23,
            revenue: 89234.56,
            roas: 3.8,
            impressions: 3245789,
            clicks: 21453,
            conversions: 987,
            status: 'connected'
          },
          instagram: {
            name: 'Instagram',
            icon: 'logo-instagram',
            color: '#E4405F',
            campaigns: 5,
            spend: 19876.45,
            revenue: 94567.23,
            roas: 4.76,
            impressions: 2987654,
            clicks: 18765,
            conversions: 1243,
            status: 'connected'
          },
          tiktok: {
            name: 'TikTok',
            icon: 'musical-notes',
            color: '#ff0050',
            campaigns: 4,
            spend: 15634.78,
            revenue: 78934.12,
            roas: 5.05,
            impressions: 4567890,
            clicks: 32145,
            conversions: 876,
            status: 'connected'
          },
          youtube: {
            name: 'YouTube',
            icon: 'logo-youtube',
            color: '#FF0000',
            campaigns: 3,
            spend: 12543.89,
            revenue: 52678.34,
            roas: 4.2,
            impressions: 1234567,
            clicks: 9876,
            conversions: 543,
            status: 'connected'
          },
          twitter: {
            name: 'X (Twitter)',
            icon: 'logo-twitter',
            color: '#000000',
            campaigns: 2,
            spend: 7894.32,
            revenue: 23456.78,
            roas: 2.97,
            impressions: 567890,
            clicks: 4321,
            conversions: 123,
            status: 'connected'
          },
          linkedin: {
            name: 'LinkedIn',
            icon: 'logo-linkedin',
            color: '#0077B5',
            campaigns: 2,
            spend: 4567.23,
            revenue: 8765.43,
            roas: 1.92,
            impressions: 234567,
            clicks: 1876,
            conversions: 34,
            status: 'connected'
          },
          pinterest: {
            name: 'Pinterest',
            icon: 'logo-pinterest',
            color: '#BD081C',
            campaigns: 1,
            spend: 2345.67,
            revenue: 6789.12,
            roas: 2.89,
            impressions: 345678,
            clicks: 2345,
            conversions: 89,
            status: 'connected'
          },
          snapchat: {
            name: 'Snapchat',
            icon: 'flash',
            color: '#FFFC00',
            campaigns: 1,
            spend: 1231.10,
            revenue: 2450.87,
            roas: 1.99,
            impressions: 123456,
            clicks: 987,
            conversions: 26,
            status: 'syncing'
          }
        },
        influencerMarketplace: {
          totalInfluencers: 2847,
          activeCollaborations: 156,
          avgRoas: 4.23,
          totalReach: 45987432,
          topTiers: {
            nano: 1203,
            micro: 892,
            macro: 543,
            mega: 156,
            celebrity: 53
          }
        },
        aiOptimization: {
          recommendationsToday: 47,
          avgImprovementRate: 23.4,
          activeOptimizations: 89,
          automatedBudgetAdjustments: 12
        },
        recentRecommendations: [
          {
            id: '1',
            title: 'Expand TikTok Lookalike Audiences',
            impact: '+28% conversions',
            priority: 'high',
            platform: 'tiktok'
          },
          {
            id: '2', 
            title: 'Test Video Creatives on Instagram',
            impact: '+34% engagement',
            priority: 'high',
            platform: 'instagram'
          },
          {
            id: '3',
            title: 'Optimize Facebook Bid Strategy',
            impact: '+15% ROAS',
            priority: 'medium',
            platform: 'facebook'
          }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load social media advertising data');
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#50C878';
      default: return '#888888';
    }
  };

  const tabs = [
    { key: 'campaigns', label: 'Campaigns', icon: 'megaphone' },
    { key: 'influencers', label: 'Influencers', icon: 'people' },
    { key: 'analytics', label: 'Analytics', icon: 'analytics' },
    { key: 'ai-optimization', label: 'AI', icon: 'sparkles' }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Social Media Advertising...</Text>
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
        <Text style={styles.headerTitle}>Social Media Advertising</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Overview Stats */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Campaign Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData?.overview.activeCampaigns}</Text>
              <Text style={styles.statLabel}>Active Campaigns</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(dashboardData?.overview.totalRevenue || 0)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData?.overview.overallRoas?.toFixed(2)}x</Text>
              <Text style={styles.statLabel}>Overall ROAS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(dashboardData?.overview.totalImpressions || 0)}</Text>
              <Text style={styles.statLabel}>Impressions</Text>
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
                size={20} 
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
        {activeTab === 'campaigns' && (
          <View>
            <Text style={styles.sectionTitle}>Platform Performance</Text>
            {Object.entries(dashboardData?.platforms || {}).map(([key, platform]: [string, any]) => (
              <TouchableOpacity key={key} style={styles.platformCard}>
                <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.platformCardContent}>
                  <View style={styles.platformHeader}>
                    <View style={styles.platformIconContainer}>
                      <View style={[styles.platformIcon, { backgroundColor: platform.color + '20' }]}>
                        <Ionicons name={platform.icon} size={24} color={platform.color} />
                      </View>
                      <View style={styles.platformInfo}>
                        <Text style={styles.platformName}>{platform.name}</Text>
                        <View style={styles.platformStatus}>
                          <View style={[
                            styles.statusDot, 
                            { backgroundColor: platform.status === 'connected' ? '#50C878' : '#FFA500' }
                          ]} />
                          <Text style={styles.statusText}>{platform.status}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.platformMetrics}>
                      <Text style={styles.platformRevenue}>
                        {formatCurrency(platform.revenue)}
                      </Text>
                      <Text style={styles.platformRoas}>
                        {platform.roas?.toFixed(2)}x ROAS
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.platformStats}>
                    <View style={styles.platformStat}>
                      <Text style={styles.platformStatValue}>{platform.campaigns}</Text>
                      <Text style={styles.platformStatLabel}>Campaigns</Text>
                    </View>
                    <View style={styles.platformStat}>
                      <Text style={styles.platformStatValue}>{formatNumber(platform.impressions)}</Text>
                      <Text style={styles.platformStatLabel}>Impressions</Text>
                    </View>
                    <View style={styles.platformStat}>
                      <Text style={styles.platformStatValue}>{formatNumber(platform.clicks)}</Text>
                      <Text style={styles.platformStatLabel}>Clicks</Text>
                    </View>
                    <View style={styles.platformStat}>
                      <Text style={styles.platformStatValue}>{platform.conversions}</Text>
                      <Text style={styles.platformStatLabel}>Conversions</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'influencers' && (
          <View>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Influencer Marketplace</Text>
              <View style={styles.influencerOverview}>
                <View style={styles.influencerStat}>
                  <Text style={styles.influencerStatValue}>
                    {dashboardData?.influencerMarketplace.totalInfluencers?.toLocaleString()}
                  </Text>
                  <Text style={styles.influencerStatLabel}>Total Influencers</Text>
                </View>
                <View style={styles.influencerStat}>
                  <Text style={styles.influencerStatValue}>
                    {dashboardData?.influencerMarketplace.activeCollaborations}
                  </Text>
                  <Text style={styles.influencerStatLabel}>Active Collaborations</Text>
                </View>
                <View style={styles.influencerStat}>
                  <Text style={styles.influencerStatValue}>
                    {dashboardData?.influencerMarketplace.avgRoas?.toFixed(2)}x
                  </Text>
                  <Text style={styles.influencerStatLabel}>Avg ROAS</Text>
                </View>
                <View style={styles.influencerStat}>
                  <Text style={styles.influencerStatValue}>
                    {formatNumber(dashboardData?.influencerMarketplace.totalReach || 0)}
                  </Text>
                  <Text style={styles.influencerStatLabel}>Total Reach</Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Influencer Tiers</Text>
            {Object.entries(dashboardData?.influencerMarketplace.topTiers || {}).map(([tier, count]: [string, any]) => (
              <View key={tier} style={styles.tierCard}>
                <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.tierCardContent}>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierName}>{tier.charAt(0).toUpperCase() + tier.slice(1)} Influencers</Text>
                    <Text style={styles.tierCount}>{count.toLocaleString()} available</Text>
                  </View>
                  <TouchableOpacity style={styles.tierButton}>
                    <Text style={styles.tierButtonText}>Browse</Text>
                    <Ionicons name="arrow-forward" size={16} color="#D4AF37" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'analytics' && (
          <View>
            <Text style={styles.sectionTitle}>Performance Analytics</Text>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.analyticsCard}>
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>
                    {formatCurrency(dashboardData?.overview.totalSpend || 0)}
                  </Text>
                  <Text style={styles.analyticsLabel}>Total Spend</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>
                    {((dashboardData?.overview.totalClicks / dashboardData?.overview.totalImpressions) * 100).toFixed(2)}%
                  </Text>
                  <Text style={styles.analyticsLabel}>CTR</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>
                    {((dashboardData?.overview.totalConversions / dashboardData?.overview.totalClicks) * 100).toFixed(2)}%
                  </Text>
                  <Text style={styles.analyticsLabel}>Conversion Rate</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>
                    {formatCurrency((dashboardData?.overview.totalSpend / dashboardData?.overview.totalConversions) || 0)}
                  </Text>
                  <Text style={styles.analyticsLabel}>CPA</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {activeTab === 'ai-optimization' && (
          <View>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.aiCard}>
              <Text style={styles.sectionTitle}>AI Optimization Engine</Text>
              <View style={styles.aiStats}>
                <View style={styles.aiStat}>
                  <Text style={styles.aiStatValue}>{dashboardData?.aiOptimization.recommendationsToday}</Text>
                  <Text style={styles.aiStatLabel}>Recommendations Today</Text>
                </View>
                <View style={styles.aiStat}>
                  <Text style={styles.aiStatValue}>{dashboardData?.aiOptimization.avgImprovementRate}%</Text>
                  <Text style={styles.aiStatLabel}>Avg Improvement</Text>
                </View>
                <View style={styles.aiStat}>
                  <Text style={styles.aiStatValue}>{dashboardData?.aiOptimization.activeOptimizations}</Text>
                  <Text style={styles.aiStatLabel}>Active Optimizations</Text>
                </View>
                <View style={styles.aiStat}>
                  <Text style={styles.aiStatValue}>{dashboardData?.aiOptimization.automatedBudgetAdjustments}</Text>
                  <Text style={styles.aiStatLabel}>Auto Adjustments</Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Recent AI Recommendations</Text>
            {dashboardData?.recentRecommendations.map((recommendation: any) => (
              <TouchableOpacity key={recommendation.id} style={styles.recommendationCard}>
                <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.recommendationContent}>
                  <View style={styles.recommendationHeader}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) }]}>
                      <Text style={styles.priorityText}>{recommendation.priority.toUpperCase()}</Text>
                    </View>
                    <View style={styles.platformBadge}>
                      <Ionicons 
                        name={dashboardData.platforms[recommendation.platform]?.icon || 'globe'} 
                        size={16} 
                        color={dashboardData.platforms[recommendation.platform]?.color || '#888888'} 
                      />
                    </View>
                  </View>
                  <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                  <Text style={styles.recommendationImpact}>{recommendation.impact}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.actionButtonGradient}>
              <Ionicons name="add" size={20} color="#000000" />
              <Text style={styles.actionButtonText}>Create Campaign</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.actionButtonGradient}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Find Influencers
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
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  settingsButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  overviewCard: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#000000',
  },
  platformCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  platformCardContent: {
    padding: 16,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  platformIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  platformStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#888888',
    textTransform: 'capitalize',
  },
  platformMetrics: {
    alignItems: 'flex-end',
  },
  platformRevenue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  platformRoas: {
    fontSize: 12,
    color: '#50C878',
  },
  platformStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformStat: {
    alignItems: 'center',
  },
  platformStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  platformStatLabel: {
    fontSize: 10,
    color: '#888888',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  influencerOverview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  influencerStat: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  influencerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  influencerStatLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  tierCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tierCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tierCount: {
    fontSize: 12,
    color: '#888888',
  },
  tierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tierButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginRight: 4,
  },
  analyticsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  aiCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  aiStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  aiStat: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 4,
  },
  aiStatLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  recommendationCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recommendationContent: {
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  platformBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2d2d2d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendationImpact: {
    fontSize: 14,
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

export default SocialMediaAdvertisingDashboard;