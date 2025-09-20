import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ExecutiveDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'kpis' | 'commerce' | 'ai' | 'alerts'>('kpis');
  const [kpiData, setKpiData] = useState<any>({});
  const [commerceMetrics, setCommerceMetrics] = useState<any>(null);
  const [aiPerformance, setAiPerformance] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [overallHealth, setOverallHealth] = useState<string>('good');

  const fetchKPIDashboard = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/dashboard/kpis`);
      const data = await response.json();
      setKpiData(data.kpis || {});
      setOverallHealth(data.overall_health || 'good');
    } catch (error) {
      console.error('Failed to fetch KPI dashboard:', error);
    }
  };

  const fetchCommerceMetrics = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/dashboard/commerce`);
      const data = await response.json();
      setCommerceMetrics(data.commerce_metrics);
    } catch (error) {
      console.error('Failed to fetch commerce metrics:', error);
    }
  };

  const fetchAIPerformance = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/dashboard/ai-performance`);
      const data = await response.json();
      setAiPerformance(data.ai_performance);
    } catch (error) {
      console.error('Failed to fetch AI performance:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/dashboard/alerts`);
      const data = await response.json();
      setAlerts(data.active_alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchKPIDashboard(),
      fetchCommerceMetrics(),
      fetchAIPerformance(),
      fetchAlerts()
    ]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FFC107';
      case 'needs_attention': return '#FF5722';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': case 'on_track': return '#4CAF50';
      case 'at_risk': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading Executive Dashboard...</Text>
      </View>
    );
  }

  const renderKPIsTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
    }>
      {/* Brand Promise Header */}
      <View style={styles.brandHeader}>
        <Text style={styles.brandTitle}>🌍 AisleMarts Global Impact</Text>
        <Text style={styles.brandSubtitle}>We bring all global markets in one aisle for you</Text>
        <View style={styles.brandPromises}>
          <View style={styles.brandPromise}>
            <Text style={styles.promiseTitle}>For Business</Text>
            <Text style={styles.promiseText}>The Market in Your Pocket</Text>
          </View>
          <View style={styles.brandPromise}>
            <Text style={styles.promiseTitle}>For Shoppers</Text>
            <Text style={styles.promiseText}>Everything in Your Hand</Text>
          </View>
        </View>
      </View>

      {/* Overall Health */}
      <View style={styles.healthCard}>
        <LinearGradient 
          colors={[getHealthColor(overallHealth) + '20', getHealthColor(overallHealth) + '10']} 
          style={styles.healthGradient}
        >
          <Text style={styles.healthTitle}>Business Health</Text>
          <Text style={[styles.healthStatus, { color: getHealthColor(overallHealth) }]}>
            {overallHealth.toUpperCase()}
          </Text>
          <Text style={styles.healthDescription}>
            Overall performance across all key metrics
          </Text>
        </LinearGradient>
      </View>

      {/* KPIs Grid */}
      <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
      <View style={styles.kpiGrid}>
        {Object.entries(kpiData).map(([kpiId, kpi]: [string, any]) => (
          <View key={kpiId} style={styles.kpiCard}>
            <LinearGradient 
              colors={[getStatusColor(kpi.status) + '20', getStatusColor(kpi.status) + '10']} 
              style={styles.kpiGradient}
            >
              <Text style={styles.kpiName}>{kpi.name}</Text>
              <Text style={styles.kpiValue}>{kpi.formatted_current}</Text>
              <Text style={styles.kpiTarget}>Target: {kpi.formatted_target}</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(kpi.progress * 100, 100)}%`,
                      backgroundColor: getStatusColor(kpi.status)
                    }
                  ]} 
                />
              </View>
              
              <View style={styles.kpiFooter}>
                <Text style={[styles.kpiStatus, { color: getStatusColor(kpi.status) }]}>
                  {kpi.status.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.kpiProgress}>
                  {(kpi.progress * 100).toFixed(1)}%
                </Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Executive Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>⟳</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'kpis', label: 'KPIs', icon: '📊' },
          { key: 'commerce', label: 'Commerce', icon: '💰' },
          { key: 'ai', label: 'AI Performance', icon: '🤖' },
          { key: 'alerts', label: 'Alerts', icon: '🚨' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'kpis' && renderKPIsTab()}
      {activeTab === 'commerce' && (
        <ScrollView style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Commerce Performance</Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Commerce metrics coming soon...</Text>
          </View>
        </ScrollView>
      )}
      {activeTab === 'ai' && (
        <ScrollView style={styles.tabContent}>
          <Text style={styles.sectionTitle}>AI Performance</Text>
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>AI performance metrics coming soon...</Text>
          </View>
        </ScrollView>
      )}
      {activeTab === 'alerts' && (
        <ScrollView style={styles.tabContent}>
          <Text style={styles.sectionTitle}>System Alerts</Text>
          {alerts.length === 0 ? (
            <View style={styles.noAlertsCard}>
              <Text style={styles.noAlertsIcon}>✅</Text>
              <Text style={styles.noAlertsTitle}>All Systems Operational</Text>
              <Text style={styles.noAlertsText}>
                No active alerts. All systems are running smoothly.
              </Text>
            </View>
          ) : (
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <View key={alert.id} style={styles.alertCard}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#D4AF37',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  brandHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 16,
  },
  brandPromises: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandPromise: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  promiseTitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  promiseText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  healthCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  healthGradient: {
    padding: 20,
    alignItems: 'center',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  healthStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  healthDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: (width - 56) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  kpiGradient: {
    padding: 16,
  },
  kpiName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kpiTarget: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  kpiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  kpiProgress: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  noAlertsCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  noAlertsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noAlertsTitle: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  alertMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});