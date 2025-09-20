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

interface GlobalAnalytics {
  global_metrics: {
    total_products_tracked: number;
    platforms_monitored: number;
    ai_agents_active: number;
    data_points_per_hour: number;
    prediction_accuracy: number;
    cross_platform_correlation: number;
  };
  platform_performance: Record<string, {
    response_time_ms: number;
    data_quality_score: number;
    integration_health: string;
    ai_agent_efficiency: number;
  }>;
  market_insights: {
    trending_categories: string[];
    price_volatility_index: number;
    demand_forecast_confidence: number;
    supply_chain_optimization: string;
    competitive_advantage_score: number;
  };
  ai_performance: {
    models_deployed: number;
    prediction_models_accuracy: Record<string, number>;
    auto_optimization_rate: number;
    cross_platform_learning: string;
  };
}

interface TrendPrediction {
  prediction_request: {
    category: string;
    timeframe_days: number;
    generated_at: string;
  };
  ai_model_info: {
    model_type: string;
    accuracy: number;
    data_sources: number;
    features_analyzed: string[];
  };
  predictions: Array<{
    date: string;
    predicted_growth: number;
    confidence: number;
  }>;
  key_insights: string[];
}

export default function UniversalAnalyticsScreen() {
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [trendPredictions, setTrendPredictions] = useState<TrendPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'platforms'>('overview');

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/universal-ai/analytics/global`);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchTrendPredictions = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/universal-ai/trends/predict?category=electronics&timeframe=30`, {
        method: 'POST'
      });
      const data = await response.json();
      setTrendPredictions(data);
    } catch (error) {
      console.error('Failed to fetch trend predictions:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchTrendPredictions()]);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
    }>
      {/* Global Metrics */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Global Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <LinearGradient colors={['rgba(0, 100, 200, 0.2)', 'rgba(0, 100, 200, 0.1)']} style={styles.metricGradient}>
              <Text style={styles.metricValue}>
                {analytics?.global_metrics.total_products_tracked?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.metricLabel}>Products Tracked</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.metricCard}>
            <LinearGradient colors={['rgba(0, 150, 100, 0.2)', 'rgba(0, 150, 100, 0.1)']} style={styles.metricGradient}>
              <Text style={styles.metricValue}>
                {analytics?.global_metrics.platforms_monitored || '0'}
              </Text>
              <Text style={styles.metricLabel}>Platforms</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.metricCard}>
            <LinearGradient colors={['rgba(150, 0, 150, 0.2)', 'rgba(150, 0, 150, 0.1)']} style={styles.metricGradient}>
              <Text style={styles.metricValue}>
                {analytics?.global_metrics.ai_agents_active || '0'}
              </Text>
              <Text style={styles.metricLabel}>AI Agents</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.metricCard}>
            <LinearGradient colors={['rgba(200, 100, 0, 0.2)', 'rgba(200, 100, 0, 0.1)']} style={styles.metricGradient}>
              <Text style={styles.metricValue}>
                {analytics?.global_metrics.prediction_accuracy?.toFixed(1) || '0'}%
              </Text>
              <Text style={styles.metricLabel}>AI Accuracy</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Market Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Market Insights</Text>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Trending Categories</Text>
          <View style={styles.categoriesContainer}>
            {analytics?.market_insights.trending_categories?.map((category, index) => (
              <View key={index} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            )) || []}
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Market Health</Text>
          <View style={styles.healthMetrics}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Price Volatility</Text>
              <Text style={styles.healthValue}>
                {(analytics?.market_insights.price_volatility_index * 100)?.toFixed(1) || '0'}%
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Demand Confidence</Text>
              <Text style={styles.healthValue}>
                {(analytics?.market_insights.demand_forecast_confidence * 100)?.toFixed(1) || '0'}%
              </Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Competitive Score</Text>
              <Text style={styles.healthValue}>
                {(analytics?.market_insights.competitive_advantage_score * 100)?.toFixed(1) || '0'}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* AI Performance */}
      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>AI Performance</Text>
        
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>Prediction Models</Text>
          {Object.entries(analytics?.ai_performance.prediction_models_accuracy || {}).map(([model, accuracy]) => (
            <View key={model} style={styles.modelRow}>
              <Text style={styles.modelName}>{model.replace('_', ' ').toUpperCase()}</Text>
              <View style={styles.accuracyBar}>
                <View style={[styles.accuracyFill, { width: `${accuracy * 100}%` }]} />
                <Text style={styles.accuracyText}>{(accuracy * 100).toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderTrendsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Trend Predictions</Text>
      
      {trendPredictions && (
        <>
          {/* Model Info */}
          <View style={styles.modelInfoCard}>
            <Text style={styles.modelInfoTitle}>AI Model Information</Text>
            <View style={styles.modelInfoRow}>
              <Text style={styles.modelInfoLabel}>Model Type:</Text>
              <Text style={styles.modelInfoValue}>{trendPredictions.ai_model_info.model_type}</Text>
            </View>
            <View style={styles.modelInfoRow}>
              <Text style={styles.modelInfoLabel}>Accuracy:</Text>
              <Text style={styles.modelInfoValue}>{(trendPredictions.ai_model_info.accuracy * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.modelInfoRow}>
              <Text style={styles.modelInfoLabel}>Data Sources:</Text>
              <Text style={styles.modelInfoValue}>{trendPredictions.ai_model_info.data_sources}</Text>
            </View>
          </View>

          {/* Predictions Chart */}
          <View style={styles.predictionsCard}>
            <Text style={styles.predictionsTitle}>30-Day Growth Predictions</Text>
            <View style={styles.chartContainer}>
              {trendPredictions.predictions.slice(0, 10).map((prediction, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={[
                    styles.chartFill,
                    {
                      height: `${Math.abs(prediction.predicted_growth) * 500}%`,
                      backgroundColor: prediction.predicted_growth > 0 ? '#4CAF50' : '#F44336'
                    }
                  ]} />
                  <Text style={styles.chartLabel}>{index + 1}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Key Insights */}
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Key Insights</Text>
            {trendPredictions.key_insights.map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <Text style={styles.insightBullet}>🔍</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderPlatformsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Platform Performance</Text>
      
      {Object.entries(analytics?.platform_performance || {}).slice(0, 10).map(([platform, performance]) => (
        <View key={platform} style={styles.platformCard}>
          <View style={styles.platformHeader}>
            <Text style={styles.platformName}>{platform.toUpperCase()}</Text>
            <View style={[
              styles.healthBadge,
              performance.integration_health === 'excellent' ? styles.healthExcellent : styles.healthGood
            ]}>
              <Text style={styles.healthBadgeText}>{performance.integration_health}</Text>
            </View>
          </View>
          
          <View style={styles.performanceMetrics}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Response Time</Text>
              <Text style={styles.performanceValue}>{performance.response_time_ms}ms</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Data Quality</Text>
              <Text style={styles.performanceValue}>{(performance.data_quality_score * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>AI Efficiency</Text>
              <Text style={styles.performanceValue}>{(performance.ai_agent_efficiency * 100).toFixed(1)}%</Text>
            </View>
          </View>
        </View>
      ))}
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
        <Text style={styles.headerTitle}>Predictive Analytics</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'trends', label: 'Trends', icon: '📈' },
          { key: 'platforms', label: 'Platforms', icon: '🌐' }
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
      {activeTab === 'trends' && renderTrendsTab()}
      {activeTab === 'platforms' && renderPlatformsTab()}
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
    fontSize: 18,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  metricsSection: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 56) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  healthMetrics: {
    gap: 8,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  healthValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  aiSection: {
    marginBottom: 24,
  },
  aiCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modelRow: {
    marginBottom: 12,
  },
  modelName: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  accuracyBar: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  accuracyText: {
    position: 'absolute',
    right: 8,
    top: 2,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modelInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modelInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modelInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modelInfoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  modelInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  predictionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartFill: {
    width: '80%',
    minHeight: 2,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
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
    marginBottom: 12,
  },
  platformName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  healthExcellent: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  healthGood: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  healthBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
});