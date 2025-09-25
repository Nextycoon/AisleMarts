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
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://aislemarts.preview.emergentagent.com';

interface AffiliateLink {
  id: string;
  title: string;
  description: string;
  url: string;
  campaign_id?: string;
  campaign_title?: string;
  commission_rate: number;
  commission_type: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversion_rate: number;
  status: string;
  created_at: string;
  expires_at?: string;
}

interface LinksResponse {
  links: AffiliateLink[];
  total: number;
  active_count: number;
  inactive_count: number;
}

export default function AffiliateLinksScreen() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, active_count: 0, inactive_count: 0 });
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchLinks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const response = await fetch(`${API_BASE}/api/affiliate/links/creator/affiliate_001`);
      if (response.ok) {
        const data: LinksResponse = await response.json();
        setLinks(data.links || []);
        setStats({
          total: data.total,
          active_count: data.active_count,
          inactive_count: data.inactive_count,
        });
      }
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
      Alert.alert('Error', 'Failed to load your links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLinks(false);
    setRefreshing(false);
  };

  const handleCopyLink = async (link: AffiliateLink) => {
    try {
      await Clipboard.setStringAsync(link.url);
      Alert.alert('Copied!', 'Link copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleShareLink = async (link: AffiliateLink) => {
    try {
      await Share.share({
        message: `Check out this amazing deal: ${link.title}\n\n${link.url}`,
        title: link.title,
      });
    } catch (error) {
      console.error('Error sharing link:', error);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'paused': return '#FF9500';
      case 'expired': return '#FF3B30';
      default: return '#999';
    }
  };

  const filteredLinks = links.filter(link => {
    if (filter === 'all') return true;
    if (filter === 'active') return link.status === 'active';
    if (filter === 'inactive') return link.status !== 'active';
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Links</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading your links...</Text>
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
        <Text style={styles.headerTitle}>My Affiliate Links</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/affiliate/links/create')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Links</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.active_count}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF9500' }]}>{stats.inactive_count}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
            All ({stats.total})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.activeFilterTab]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterTabText, filter === 'active' && styles.activeFilterTabText]}>
            Active ({stats.active_count})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'inactive' && styles.activeFilterTab]}
          onPress={() => setFilter('inactive')}
        >
          <Text style={[styles.filterTabText, filter === 'inactive' && styles.activeFilterTabText]}>
            Inactive ({stats.inactive_count})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Links List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredLinks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="link-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Links Found</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'all' 
                ? 'Create your first affiliate link to start earning!'
                : `No ${filter} links found.`}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/affiliate/links/create')}
            >
              <Text style={styles.createButtonText}>Create First Link</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredLinks.map((link) => (
            <View key={link.id} style={styles.linkCard}>
              {/* Link Header */}
              <View style={styles.linkHeader}>
                <View style={styles.linkTitleContainer}>
                  <Text style={styles.linkTitle} numberOfLines={2}>{link.title}</Text>
                  {link.campaign_title && (
                    <Text style={styles.campaignLabel}>Campaign: {link.campaign_title}</Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(link.status) }]}>
                  <Text style={styles.statusText}>{link.status.toUpperCase()}</Text>
                </View>
              </View>

              {/* Link Description */}
              <Text style={styles.linkDescription} numberOfLines={3}>
                {link.description}
              </Text>

              {/* Performance Stats */}
              <View style={styles.performanceSection}>
                <View style={styles.performanceRow}>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.metricValue}>{formatNumber(link.clicks)}</Text>
                    <Text style={styles.metricLabel}>Clicks</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.metricValue}>{formatNumber(link.conversions)}</Text>
                    <Text style={styles.metricLabel}>Sales</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Text style={styles.metricValue}>{formatPercentage(link.conversion_rate)}</Text>
                    <Text style={styles.metricLabel}>CVR</Text>
                  </View>
                  <View style={styles.performanceMetric}>
                    <Text style={[styles.metricValue, styles.earningsValue]}>
                      {formatCurrency(link.earnings)}
                    </Text>
                    <Text style={styles.metricLabel}>Earned</Text>
                  </View>
                </View>
              </View>

              {/* Commission Info */}
              <View style={styles.commissionSection}>
                <View style={styles.commissionInfo}>
                  <Text style={styles.commissionRate}>
                    {formatPercentage(link.commission_rate)} {link.commission_type}
                  </Text>
                  <Text style={styles.commissionLabel}>Commission Rate</Text>
                </View>
                <Text style={styles.createdDate}>Created: {formatDate(link.created_at)}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCopyLink(link)}
                >
                  <Ionicons name="copy-outline" size={16} color="#667eea" />
                  <Text style={styles.actionButtonText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShareLink(link)}
                >
                  <Ionicons name="share-outline" size={16} color="#667eea" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/affiliate/links/${link.id}/analytics`)}
                >
                  <Ionicons name="bar-chart-outline" size={16} color="#667eea" />
                  <Text style={styles.actionButtonText}>Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/affiliate/links/${link.id}/edit`)}
                >
                  <Ionicons name="pencil-outline" size={16} color="#667eea" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Expiry Warning */}
              {link.expires_at && new Date(link.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                <View style={styles.expiryWarning}>
                  <Ionicons name="warning-outline" size={16} color="#FF9500" />
                  <Text style={styles.expiryText}>
                    Expires: {formatDate(link.expires_at)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
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
  addButton: {
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
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterTab: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  linkTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  campaignLabel: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  linkDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  performanceSection: {
    marginBottom: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceMetric: {
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
  commissionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commissionInfo: {
    alignItems: 'flex-start',
  },
  commissionRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 2,
  },
  commissionLabel: {
    fontSize: 12,
    color: '#666',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    gap: 6,
  },
  expiryText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
});