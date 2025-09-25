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
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// API configuration
const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://aislefeed.preview.emergentagent.com';

interface WalletData {
  user_id: string;
  balance: number;
  currency: string;
  cashback_earned: number;
  loyalty_points: number;
  is_verified: boolean;
}

interface SuperAppService {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  user_rating: number;
}

interface DashboardMetrics {
  total_wallet_users: number;
  total_transactions: number;
  platform_commission: number;
  avg_creator_earnings: number;
}

const SuperAppDashboard: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [services, setServices] = useState<SuperAppService[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet data
      const walletResponse = await fetch(`${API_BASE}/api/super-app/wallet/current_user`);
      const wallet = await walletResponse.json();
      setWalletData(wallet);

      // Fetch available services
      const servicesResponse = await fetch(`${API_BASE}/api/super-app/services`);
      const servicesData = await servicesResponse.json();
      setServices(servicesData);

      // Fetch platform metrics
      const metricsResponse = await fetch(`${API_BASE}/api/super-app/analytics/metrics`);
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleServicePress = (serviceId: string) => {
    switch (serviceId) {
      case 'aislepay':
        router.push('/wallet-management');
        break;
      case 'aisle_eats':
        router.push('/food-delivery');
        break;
      case 'aisle_travel':
        router.push('/travel-booking');
        break;
      case 'aisle_entertainment':
        router.push('/entertainment-tickets');
        break;
      case 'aisle_bills':
        router.push('/bill-payments');
        break;
      default:
        Alert.alert('Coming Soon', `${serviceId} service will be available soon!`);
    }
  };

  const handleWalletTopUp = () => {
    Alert.alert('Wallet Top-Up', 'Redirecting to payment gateway...', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: () => router.push('/wallet-topup') }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading Super App...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#1a1a1a', '#000000']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>AisleMarts Super App</Text>
          <Text style={styles.headerSubtitle}>Your Everything Platform</Text>
        </LinearGradient>

        {/* Wallet Card */}
        <View style={styles.section}>
          <BlurView intensity={20} tint="dark" style={styles.walletCard}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
              style={styles.walletGradient}
            >
              <View style={styles.walletHeader}>
                <Text style={styles.walletTitle}>💳 AislePay Wallet</Text>
                <Text style={styles.walletBadge}>
                  {walletData?.is_verified ? '✅ Verified' : '⚠️ Unverified'}
                </Text>
              </View>
              
              <View style={styles.walletContent}>
                <Text style={styles.walletBalance}>
                  ${walletData?.balance?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.walletCurrency}>{walletData?.currency || 'USD'}</Text>
              </View>

              <View style={styles.walletStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{walletData?.cashback_earned?.toFixed(2) || '0.00'}</Text>
                  <Text style={styles.statLabel}>Cashback Earned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{walletData?.loyalty_points || 0}</Text>
                  <Text style={styles.statLabel}>Loyalty Points</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.topUpButton} onPress={handleWalletTopUp}>
                <Text style={styles.topUpButtonText}>💰 Top Up Wallet</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Super App Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServicePress(service.id)}
              >
                <BlurView intensity={15} tint="dark" style={styles.serviceBlur}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <View style={styles.serviceFooter}>
                    <Text style={styles.serviceRating}>⭐ {service.user_rating.toFixed(1)}</Text>
                    <Text style={[styles.serviceStatus, service.is_active ? styles.activeStatus : styles.inactiveStatus]}>
                      {service.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Assistant Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.aiAssistantCard} onPress={() => router.push('/ai-assistant')}>
            <BlurView intensity={20} tint="dark" style={styles.aiAssistantBlur}>
              <LinearGradient
                colors={['rgba(138, 43, 226, 0.3)', 'rgba(75, 0, 130, 0.2)']}
                style={styles.aiAssistantGradient}
              >
                <Text style={styles.aiAssistantIcon}>🤖</Text>
                <Text style={styles.aiAssistantTitle}>AI Personal Assistant</Text>
                <Text style={styles.aiAssistantDescription}>
                  Get personalized recommendations, book services, and manage your lifestyle
                </Text>
                <Text style={styles.aiAssistantCTA}>Tap to chat with your AI →</Text>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Platform Metrics */}
        {metrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Platform Insights</Text>
            <BlurView intensity={15} tint="dark" style={styles.metricsCard}>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{(metrics.total_wallet_users / 1000).toFixed(1)}K</Text>
                  <Text style={styles.metricLabel}>Active Users</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>${(metrics.total_transactions / 1000000).toFixed(1)}M</Text>
                  <Text style={styles.metricLabel}>Transactions</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>${metrics.platform_commission.toFixed(0)}</Text>
                  <Text style={styles.metricLabel}>Revenue</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>${metrics.avg_creator_earnings.toFixed(0)}</Text>
                  <Text style={styles.metricLabel}>Avg Earnings</Text>
                </View>
              </View>
            </BlurView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/p2p-transfer')}>
              <Text style={styles.quickActionIcon}>💸</Text>
              <Text style={styles.quickActionText}>Send Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/bill-scanner')}>
              <Text style={styles.quickActionIcon}>📷</Text>
              <Text style={styles.quickActionText}>Scan Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/loyalty-rewards')}>
              <Text style={styles.quickActionIcon}>🎁</Text>
              <Text style={styles.quickActionText}>Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/transaction-history')}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  walletCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  walletGradient: {
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  walletBadge: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  walletContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  walletBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  walletCurrency: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 4,
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
  },
  topUpButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  topUpButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceBlur: {
    padding: 16,
  },
  serviceIcon: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 11,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceRating: {
    fontSize: 10,
    color: '#D4AF37',
  },
  serviceStatus: {
    fontSize: 8,
  },
  activeStatus: {
    color: '#4CAF50',
  },
  inactiveStatus: {
    color: '#F44336',
  },
  aiAssistantCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiAssistantBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiAssistantGradient: {
    padding: 20,
    alignItems: 'center',
  },
  aiAssistantIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  aiAssistantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  aiAssistantDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 16,
  },
  aiAssistantCTA: {
    fontSize: 14,
    color: '#BB86FC',
    fontWeight: '600',
  },
  metricsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  metricLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: (width - 64) / 4,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 10,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default SuperAppDashboard;