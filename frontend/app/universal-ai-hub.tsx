import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface SystemStatus {
  system_name: string;
  status: string;
  version: string;
  platforms_connected: number;
  ai_agents_deployed: number;
  capabilities: string[];
  performance_metrics: {
    data_collection_rate: string;
    prediction_accuracy: string;
    platform_response_time: string;
    ai_agent_success_rate: string;
  };
}

interface PlatformInfo {
  name: string;
  status: string;
  capabilities: string[];
  category: string;
}

export default function UniversalAIHubScreen() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [platforms, setPlatforms] = useState<Record<string, PlatformInfo>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'analytics' | 'assistant'>('overview');

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/universal-ai/health`);
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/universal-ai/platforms`);
      const data = await response.json();
      setPlatforms(data.platforms || {});
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchSystemStatus(), fetchPlatforms()]);
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

  const handleProductSearch = () => {
    router.push('/universal-ai-hub/search');
  };

  const handleMarketAnalytics = () => {
    router.push('/universal-ai-hub/analytics');
  };

  const handleAIAssistant = () => {
    router.push('/universal-ai-hub/assistant');
  };

  const handleVisualSearch = () => {
    Alert.alert('Visual Search', 'Take a photo or upload an image to find similar products across all platforms');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Initializing AI Hub...</Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
    }>
      {/* System Status Card */}
      <View style={styles.statusCard}>
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.05)']}
          style={styles.cardGradient}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>🌍 Universal Commerce AI Hub</Text>
            <View style={[styles.statusBadge, systemStatus?.status === 'operational' && styles.statusActive]}>
              <Text style={styles.statusBadgeText}>
                {systemStatus?.status?.toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{systemStatus?.platforms_connected || 0}</Text>
              <Text style={styles.metricLabel}>Platforms Connected</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{systemStatus?.ai_agents_deployed || 0}</Text>
              <Text style={styles.metricLabel}>AI Agents Active</Text>
            </View>
          </View>

          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Data Collection</Text>
              <Text style={styles.performanceValue}>
                {systemStatus?.performance_metrics?.data_collection_rate || 'N/A'}
              </Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>AI Accuracy</Text>
              <Text style={styles.performanceValue}>
                {systemStatus?.performance_metrics?.prediction_accuracy || 'N/A'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>AI-Powered Features</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={handleProductSearch}>
          <LinearGradient colors={['rgba(0, 100, 200, 0.1)', 'rgba(0, 100, 200, 0.05)']} style={styles.actionGradient}>
            <Text style={styles.actionIcon}>🔍</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Universal Product Search</Text>
              <Text style={styles.actionSubtitle}>Search across all connected platforms</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleVisualSearch}>
          <LinearGradient colors={['rgba(150, 0, 150, 0.1)', 'rgba(150, 0, 150, 0.05)']} style={styles.actionGradient}>
            <Text style={styles.actionIcon}>📷</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Visual Search & Discovery</Text>
              <Text style={styles.actionSubtitle}>Find products using images</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleMarketAnalytics}>
          <LinearGradient colors={['rgba(0, 150, 100, 0.1)', 'rgba(0, 150, 100, 0.05)']} style={styles.actionGradient}>
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Predictive Analytics</Text>
              <Text style={styles.actionSubtitle}>Market trends and insights</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleAIAssistant}>
          <LinearGradient colors={['rgba(200, 100, 0, 0.1)', 'rgba(200, 100, 0, 0.05)']} style={styles.actionGradient}>
            <Text style={styles.actionIcon}>🤖</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>AI Assistant</Text>
              <Text style={styles.actionSubtitle}>Multilingual commerce support</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPlatformsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Connected Platforms</Text>
      <Text style={styles.sectionSubtitle}>{Object.keys(platforms).length} platforms integrated</Text>
      
      {Object.entries(platforms).map(([platformKey, platform]) => (
        <View key={platformKey} style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <Text style={styles.platformName}>{platform.name}</Text>
            <View style={[
              styles.platformStatus,
              platform.status === 'connected' ? styles.statusConnected : styles.statusDisconnected
            ]}>
              <Text style={styles.platformStatusText}>
                {platform.status === 'connected' ? '🟢 Connected' : '🔴 Offline'}
              </Text>
            </View>
          </View>
          <Text style={styles.platformCategory}>{platform.category}</Text>
          <Text style={styles.platformCapabilities}>
            {platform.capabilities?.join(', ') || 'No capabilities listed'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Global Analytics</Text>
      
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Market Intelligence</Text>
        <Text style={styles.analyticsDescription}>
          Real-time market analysis across all connected platforms
        </Text>
        <TouchableOpacity style={styles.analyticsButton} onPress={handleMarketAnalytics}>
          <Text style={styles.analyticsButtonText}>View Detailed Analytics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Trend Predictions</Text>
        <Text style={styles.analyticsDescription}>
          AI-powered forecasting for market trends and demand
        </Text>
        <TouchableOpacity style={styles.analyticsButton}>
          <Text style={styles.analyticsButtonText}>Generate Predictions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAssistantTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>AI Assistant</Text>
      
      <View style={styles.assistantCard}>
        <Text style={styles.assistantTitle}>🤖 Universal Commerce Assistant</Text>
        <Text style={styles.assistantDescription}>
          Get help with product questions, order status, returns, and more across all platforms
        </Text>
        
        <View style={styles.assistantFeatures}>
          <Text style={styles.featureTitle}>Supported Languages:</Text>
          <Text style={styles.featureText}>English, Spanish, French, German, Chinese, Japanese, Arabic, Turkish, Portuguese</Text>
          
          <Text style={styles.featureTitle}>Capabilities:</Text>
          <Text style={styles.featureText}>• Product Q&A • Order Status • Returns & Warranty • Shipping Info • Store Locator • Price Comparison</Text>
        </View>
        
        <TouchableOpacity style={styles.assistantButton} onPress={handleAIAssistant}>
          <Text style={styles.assistantButtonText}>Start Chat</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Universal AI Hub</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview', icon: '🏠' },
          { key: 'platforms', label: 'Platforms', icon: '🌐' },
          { key: 'analytics', label: 'Analytics', icon: '📊' },
          { key: 'assistant', label: 'Assistant', icon: '🤖' }
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
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'platforms' && renderPlatformsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'assistant' && renderAssistantTab()}
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
  headerSpacer: {
    width: 40,
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
  statusCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  statusActive: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  metricLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {},
  performanceLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  platformCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  platformStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusConnected: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  statusDisconnected: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  platformStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  platformCategory: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 4,
  },
  platformCapabilities: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  analyticsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  analyticsDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  analyticsButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyticsButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  assistantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  assistantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  assistantDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 24,
  },
  assistantFeatures: {
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
    marginTop: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  assistantButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  assistantButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
  },
});