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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const GlobalMonetizationDashboard = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock API base URL (in production, this would come from environment variables)
  const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulated API calls - in production these would be real API calls
      const mockData = {
        totalRevenue: 2847693.45,
        totalStreams: 8,
        monthlyGrowth: 24.7,
        topPerformingStream: 'Commission-Based Revenue',
        revenueStreams: [
          {
            id: 'commission',
            name: 'Commission-Based Revenue',
            description: '0% Commission Model with Pay-per-Lead',
            revenue: 1247583.22,
            growth: 18.5,
            color: '#D4AF37',
            icon: 'cash-outline'
          },
          {
            id: 'subscriptions',
            name: 'Subscription Services',
            description: 'Premium Tiers & Recurring Billing',
            revenue: 487293.67,
            growth: 32.1,
            color: '#4A90E2',
            icon: 'card-outline'
          },
          {
            id: 'advertising',
            name: 'Advertising & Sponsored Content',
            description: 'Campaign Management & Ad Revenue',
            revenue: 398574.89,
            growth: 15.8,
            color: '#E94B3C',
            icon: 'megaphone-outline'
          },
          {
            id: 'vendor_services',
            name: 'Vendor Services Platform',
            description: 'Premium Tools & Advanced Features',
            revenue: 285492.73,
            growth: 28.3,
            color: '#50C878',
            icon: 'storefront-outline'
          },
          {
            id: 'financial',
            name: 'Financial Services',
            description: 'Payments & Micro-lending',
            revenue: 187364.94,
            growth: 41.2,
            color: '#9B59B6',
            icon: 'wallet-outline'
          },
          {
            id: 'data',
            name: 'Data Monetization',
            description: 'Insights & Analytics Services',
            revenue: 145829.35,
            growth: 22.9,
            color: '#F39C12',
            icon: 'analytics-outline'
          },
          {
            id: 'partnerships',
            name: 'Partnership Revenue',
            description: 'Strategic Alliances & Collaborations',
            revenue: 67438.92,
            growth: 19.4,
            color: '#1ABC9C',
            icon: 'people-outline'
          },
          {
            id: 'transactions',
            name: 'Transaction Fees',
            description: 'Processing & Service Fees',
            revenue: 27115.73,
            growth: 8.7,
            color: '#95A5A6',
            icon: 'receipt-outline'
          }
        ],
        analytics: {
          conversionRate: 3.8,
          avgOrderValue: 157.42,
          customerLifetimeValue: 842.33,
          churnRate: 2.1
        }
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load monetization data');
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

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const periodOptions = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Monetization Data...</Text>
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
        <Text style={styles.headerTitle}>Global Monetization</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Revenue Overview */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.overviewContent}>
            <View style={styles.totalRevenueContainer}>
              <Text style={styles.totalRevenue}>
                {formatCurrency(dashboardData?.totalRevenue || 0)}
              </Text>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={16} color="#50C878" />
                <Text style={styles.growthText}>
                  {formatPercentage(dashboardData?.monthlyGrowth || 0)}
                </Text>
              </View>
            </View>
            <Text style={styles.overviewSubtext}>
              {dashboardData?.totalStreams || 0} Revenue Streams Active
            </Text>
          </View>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periodOptions.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Streams */}
        <Text style={styles.sectionTitle}>Revenue Streams</Text>
        {dashboardData?.revenueStreams?.map((stream: any, index: number) => (
          <TouchableOpacity key={stream.id} style={styles.streamCard}>
            <LinearGradient
              colors={['#1a1a1a', '#2d2d2d']}
              style={styles.streamCardContent}
            >
              <View style={styles.streamHeader}>
                <View style={[styles.streamIcon, { backgroundColor: stream.color + '20' }]}>
                  <Ionicons name={stream.icon} size={24} color={stream.color} />
                </View>
                <View style={styles.streamInfo}>
                  <Text style={styles.streamName}>{stream.name}</Text>
                  <Text style={styles.streamDescription}>{stream.description}</Text>
                </View>
                <View style={styles.streamMetrics}>
                  <Text style={styles.streamRevenue}>
                    {formatCurrency(stream.revenue)}
                  </Text>
                  <View style={[styles.growthBadge, styles.streamGrowth]}>
                    <Ionicons 
                      name={stream.growth > 0 ? "trending-up" : "trending-down"} 
                      size={14} 
                      color={stream.growth > 0 ? "#50C878" : "#E94B3C"} 
                    />
                    <Text style={[
                      styles.growthText,
                      { color: stream.growth > 0 ? "#50C878" : "#E94B3C" }
                    ]}>
                      {formatPercentage(stream.growth)}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Analytics Summary */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.analyticsCard}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {dashboardData?.analytics?.conversionRate || 0}%
              </Text>
              <Text style={styles.metricLabel}>Conversion Rate</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatCurrency(dashboardData?.analytics?.avgOrderValue || 0)}
              </Text>
              <Text style={styles.metricLabel}>Avg Order Value</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {formatCurrency(dashboardData?.analytics?.customerLifetimeValue || 0)}
              </Text>
              <Text style={styles.metricLabel}>Customer LTV</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {dashboardData?.analytics?.churnRate || 0}%
              </Text>
              <Text style={styles.metricLabel}>Churn Rate</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.actionButtonGradient}>
              <Ionicons name="analytics" size={20} color="#000000" />
              <Text style={styles.actionButtonText}>Detailed Analytics</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.actionButtonGradient}>
              <Ionicons name="settings" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Configure Streams
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
  overviewContent: {
    alignItems: 'center',
  },
  totalRevenueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRevenue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D4AF37',
    marginRight: 12,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(80, 200, 120, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#50C878',
    marginLeft: 4,
  },
  overviewSubtext: {
    fontSize: 14,
    color: '#888888',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#D4AF37',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  periodButtonTextActive: {
    color: '#000000',
  },
  streamCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  streamCardContent: {
    padding: 16,
  },
  streamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streamInfo: {
    flex: 1,
  },
  streamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streamDescription: {
    fontSize: 12,
    color: '#888888',
  },
  streamMetrics: {
    alignItems: 'flex-end',
  },
  streamRevenue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  streamGrowth: {
    backgroundColor: 'rgba(80, 200, 120, 0.1)',
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
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
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

export default GlobalMonetizationDashboard;