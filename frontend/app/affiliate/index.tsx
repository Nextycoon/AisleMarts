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

interface AffiliateStats {
  total_earnings: number;
  pending_earnings: number;
  available_earnings: number;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  active_links: number;
  top_performing_link?: {
    id: string;
    title: string;
    clicks: number;
    conversions: number;
    earnings: number;
  };
  recent_activity: Array<{
    type: 'click' | 'conversion' | 'payout';
    amount?: number;
    timestamp: string;
    link_title?: string;
  }>;
  earnings_trend: Array<{
    date: string;
    amount: number;
  }>;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  commission_rate: number;
  commission_type: string;
  status: string;
  product_count: number;
  created_at: string;
}

export default function AffiliateHomeScreen() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Fetch affiliate stats
      const statsResponse = await fetch(`${API_BASE}/api/affiliate/stats/creator/affiliate_001`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch available campaigns
      const campaignsResponse = await fetch(`${API_BASE}/api/affiliate/campaigns?limit=6`);
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.campaigns || []);
      }

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(false);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return (rate * 100).toFixed(1) + '%';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Creator Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, Creator! 🎉</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/affiliate/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings Overview */}
        <View style={styles.earningsSection}>
          <Text style={styles.sectionTitle}>💰 Your Earnings</Text>
          
          <View style={styles.earningsGrid}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={[styles.earningsCard, styles.totalEarningsCard]}
            >
              <View style={styles.earningsCardContent}>
                <Text style={styles.earningsAmount}>
                  {formatCurrency(stats?.total_earnings || 0)}
                </Text>
                <Text style={styles.earningsLabel}>Total Earned</Text>
                <View style={styles.earningsIcon}>
                  <Ionicons name="trending-up" size={24} color="white" />
                </View>
              </View>
            </LinearGradient>

            <View style={styles.earningsRow}>
              <View style={[styles.earningsCard, styles.pendingCard]}>
                <Text style={styles.earningsAmountSmall}>
                  {formatCurrency(stats?.pending_earnings || 0)}
                </Text>
                <Text style={styles.earningsLabelSmall}>Pending</Text>
              </View>
              
              <View style={[styles.earningsCard, styles.availableCard]}>
                <Text style={styles.earningsAmountSmall}>
                  {formatCurrency(stats?.available_earnings || 0)}
                </Text>
                <Text style={styles.earningsLabelSmall}>Available</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.payoutButton}
            onPress={() => router.push('/affiliate/payout')}
          >
            <Ionicons name="card-outline" size={20} color="white" />
            <Text style={styles.payoutButtonText}>Request Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Performance</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="eye-outline" size={28} color="#667eea" />
              </View>
              <Text style={styles.statValue}>{formatNumber(stats?.total_clicks || 0)}</Text>
              <Text style={styles.statLabel}>Total Clicks</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="bag-outline" size={28} color="#34C759" />
              </View>
              <Text style={styles.statValue}>{formatNumber(stats?.total_conversions || 0)}</Text>
              <Text style={styles.statLabel}>Conversions</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="analytics-outline" size={28} color="#FF9500" />
              </View>
              <Text style={styles.statValue}>{formatPercentage(stats?.conversion_rate || 0)}</Text>
              <Text style={styles.statLabel}>CVR</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="link-outline" size={28} color="#8E44AD" />
              </View>
              <Text style={styles.statValue}>{formatNumber(stats?.active_links || 0)}</Text>
              <Text style={styles.statLabel}>Active Links</Text>
            </View>
          </View>
        </View>

        {/* Top Performing Link */}
        {stats?.top_performing_link && (
          <View style={styles.topLinkSection}>
            <Text style={styles.sectionTitle}>⭐ Top Performer</Text>
            
            <View style={styles.topLinkCard}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.topLinkGradient}
              >
                <View style={styles.topLinkContent}>
                  <View style={styles.topLinkHeader}>
                    <Text style={styles.topLinkTitle} numberOfLines={2}>
                      {stats.top_performing_link.title}
                    </Text>
                    <View style={styles.crownIcon}>
                      <Ionicons name="trophy" size={20} color="#FFD700" />
                    </View>
                  </View>
                  
                  <View style={styles.topLinkStats}>
                    <View style={styles.topLinkStat}>
                      <Text style={styles.topLinkStatValue}>
                        {formatNumber(stats.top_performing_link.clicks)}
                      </Text>
                      <Text style={styles.topLinkStatLabel}>Clicks</Text>
                    </View>
                    <View style={styles.topLinkStat}>
                      <Text style={styles.topLinkStatValue}>
                        {formatNumber(stats.top_performing_link.conversions)}
                      </Text>
                      <Text style={styles.topLinkStatLabel}>Sales</Text>
                    </View>
                    <View style={styles.topLinkStat}>
                      <Text style={styles.topLinkStatValue}>
                        {formatCurrency(stats.top_performing_link.earnings)}
                      </Text>
                      <Text style={styles.topLinkStatLabel}>Earned</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Available Campaigns */}
        <View style={styles.campaignsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Hot Campaigns</Text>
            <TouchableOpacity onPress={() => router.push('/affiliate/campaigns')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.campaignsScroll}>
            {campaigns.map((campaign) => (
              <TouchableOpacity
                key={campaign.id}
                style={styles.campaignCard}
                onPress={() => router.push(`/affiliate/campaigns/${campaign.id}`)}
              >
                <View style={styles.campaignHeader}>
                  <Text style={styles.campaignTitle} numberOfLines={2}>{campaign.title}</Text>
                  <View style={[
                    styles.campaignStatus,
                    campaign.status === 'active' ? styles.activeStatus : styles.inactiveStatus
                  ]}>
                    <Text style={styles.campaignStatusText}>{campaign.status.toUpperCase()}</Text>
                  </View>
                </View>
                
                <Text style={styles.campaignDescription} numberOfLines={3}>
                  {campaign.description}
                </Text>
                
                <View style={styles.campaignFooter}>
                  <View style={styles.commissionInfo}>
                    <Text style={styles.commissionRate}>
                      {formatPercentage(campaign.commission_rate)}
                    </Text>
                    <Text style={styles.commissionLabel}>Commission</Text>
                  </View>
                  <Text style={styles.productCount}>{campaign.product_count} products</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {campaigns.length === 0 && (
              <View style={styles.noCampaigns}>
                <Ionicons name="megaphone-outline" size={48} color="#ccc" />
                <Text style={styles.noCampaignsText}>No campaigns available right now</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/affiliate/links/create')}
            >
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.actionButtonGradient}>
                <Ionicons name="add-circle-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Create Link</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/affiliate/analytics')}
            >
              <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.actionButtonGradient}>
                <Ionicons name="bar-chart-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/affiliate/links')}
            >
              <LinearGradient colors={['#fa709a', '#fee140']} style={styles.actionButtonGradient}>
                <Ionicons name="link-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>My Links</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/affiliate/wallet')}
            >
              <LinearGradient colors={['#a8edea', '#fed6e3']} style={styles.actionButtonGradient}>
                <Ionicons name="wallet-outline" size={24} color="white" />
                <Text style={styles.actionButtonText}>Wallet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: -10,
  },
  earningsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  earningsGrid: {
    marginBottom: 16,
  },
  totalEarningsCard: {
    marginBottom: 12,
  },
  earningsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
  },
  earningsCardContent: {
    position: 'relative',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  earningsIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pendingCard: {
    flex: 1,
    backgroundColor: '#FF9500',
    alignItems: 'center',
  },
  availableCard: {
    flex: 1,
    backgroundColor: '#34C759',
    alignItems: 'center',
  },
  earningsAmountSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  earningsLabelSmall: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  payoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  topLinkSection: {
    marginBottom: 32,
  },
  topLinkCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  topLinkGradient: {
    padding: 20,
  },
  topLinkContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
  },
  topLinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  topLinkTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  crownIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topLinkStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  topLinkStat: {
    alignItems: 'center',
  },
  topLinkStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  topLinkStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  campaignsSection: {
    marginBottom: 32,
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
  campaignsScroll: {
    paddingLeft: 0,
  },
  campaignCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  campaignStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeStatus: {
    backgroundColor: '#E8F5E8',
  },
  inactiveStatus: {
    backgroundColor: '#FFF2E8',
  },
  campaignStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#34C759',
  },
  campaignDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commissionInfo: {
    alignItems: 'flex-start',
  },
  commissionRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 2,
  },
  commissionLabel: {
    fontSize: 12,
    color: '#666',
  },
  productCount: {
    fontSize: 12,
    color: '#999',
  },
  noCampaigns: {
    width: width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noCampaignsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 56) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});