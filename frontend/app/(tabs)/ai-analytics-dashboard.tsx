import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';

interface RetentionMetrics {
  total_users: number;
  active_users: number;
  retention_rates: {
    day_1: number;
    day_7: number;
    day_30: number;
  };
  churn_rate: number;
  engagement_metrics: {
    daily_active_users: number;
    dau_mau_ratio: number;
  };
}

interface AIInsight {
  category: string;
  recommendation: string;
  expected_impact: string;
  priority: string;
}

interface UserSegment {
  segment_id: string;
  name: string;
  size: number;
  percentage: number;
  characteristics: {
    avg_ltv: number;
    retention_score: number;
  };
}

interface AnalyticsDashboardData {
  retention_metrics: RetentionMetrics;
  ai_insights: string[];
  optimization_recommendations: AIInsight[];
  predictive_analytics: any;
  model_performance: Record<string, number>;
  user_segments: UserSegment[];
}

export default function AIAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');

  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch retention dashboard
      const retentionResponse = await fetch(
        `${backendUrl}/api/ai-analytics/dashboard/retention?date_range=${selectedPeriod}`
      );
      const retentionData = await retentionResponse.json();
      
      // Fetch user segments
      const segmentsResponse = await fetch(`${backendUrl}/api/ai-analytics/segments/users`);
      const segmentsData = await segmentsResponse.json();
      
      // Fetch optimization recommendations
      const optimizationResponse = await fetch(
        `${backendUrl}/api/ai-analytics/optimization/recommendations?focus_area=retention`
      );
      const optimizationData = await optimizationResponse.json();

      setData({
        retention_metrics: retentionData.retention_metrics,
        ai_insights: retentionData.ai_insights || [],
        optimization_recommendations: optimizationData.recommendations || [],
        predictive_analytics: retentionData.predictive_analytics,
        model_performance: retentionData.model_performance || {},
        user_segments: segmentsData.segments || []
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffa500';
      case 'low': return '#4CAF50';
      default: return '#666666';
    }
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading AI Analytics Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Analytics Dashboard</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Period selector */}
        <View style={styles.periodSelector}>
          {['last_7_days', 'last_30_days', 'last_90_days'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.replace('_', ' ').replace('last ', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        {data?.retention_metrics && (
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>📊 Key Retention Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {data.retention_metrics.total_users?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.metricLabel}>Total Users</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {data.retention_metrics.active_users?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.metricLabel}>Active Users</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {((data.retention_metrics.retention_rates?.day_30 || 0) * 100).toFixed(1)}%
                </Text>
                <Text style={styles.metricLabel}>30-Day Retention</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {((data.retention_metrics.churn_rate || 0) * 100).toFixed(1)}%
                </Text>
                <Text style={styles.metricLabel}>Churn Rate</Text>
              </View>
            </View>
          </View>
        )}

        {/* Retention Rates Breakdown */}
        {data?.retention_metrics?.retention_rates && (
          <View style={styles.retentionContainer}>
            <Text style={styles.sectionTitle}>📈 Retention Breakdown</Text>
            {Object.entries(data.retention_metrics.retention_rates).map(([period, rate]) => (
              <View key={period} style={styles.retentionRow}>
                <Text style={styles.retentionPeriod}>
                  {period.replace('_', '-').toUpperCase()}
                </Text>
                <View style={styles.retentionBar}>
                  <View style={[styles.retentionFill, { width: `${rate * 100}%` }]} />
                </View>
                <Text style={styles.retentionValue}>{(rate * 100).toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* AI Model Performance */}
        {data?.model_performance && Object.keys(data.model_performance).length > 0 && (
          <View style={styles.modelsContainer}>
            <Text style={styles.sectionTitle}>🤖 AI Model Performance</Text>
            {Object.entries(data.model_performance).map(([model, performance]) => (
              <View key={model} style={styles.modelCard}>
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>
                    {model.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.modelScore}>{(performance * 100).toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${performance * 100}%` }]} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* User Segments */}
        {data?.user_segments && data.user_segments.length > 0 && (
          <View style={styles.segmentsContainer}>
            <Text style={styles.sectionTitle}>👥 User Segments</Text>
            {data.user_segments.map((segment) => (
              <View key={segment.segment_id} style={styles.segmentCard}>
                <View style={styles.segmentHeader}>
                  <Text style={styles.segmentName}>{segment.name}</Text>
                  <Text style={styles.segmentSize}>{segment.percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.segmentDetails}>
                  <Text style={styles.segmentDetail}>
                    👤 {segment.size.toLocaleString()} users
                  </Text>
                  <Text style={styles.segmentDetail}>
                    💰 ${segment.characteristics.avg_ltv.toFixed(0)} avg LTV
                  </Text>
                  <Text style={styles.segmentDetail}>
                    📊 {(segment.characteristics.retention_score * 100).toFixed(0)}% retention score
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* AI Insights */}
        {data?.ai_insights && data.ai_insights.length > 0 && (
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>💡 AI Insights</Text>
            {data.ai_insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Optimization Recommendations */}
        {data?.optimization_recommendations && data.optimization_recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>🎯 AI Recommendations</Text>
            {data.optimization_recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationCategory}>
                    {rec.category.toUpperCase()}
                  </Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(rec.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.recommendationText}>{rec.recommendation}</Text>
                <Text style={styles.recommendationImpact}>
                  Expected Impact: {rec.expected_impact}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Predictive Analytics */}
        {data?.predictive_analytics && (
          <View style={styles.predictiveContainer}>
            <Text style={styles.sectionTitle}>🔮 Predictive Analytics</Text>
            <View style={styles.predictiveCard}>
              <Text style={styles.predictiveTitle}>Next 30 Days Forecast</Text>
              <View style={styles.predictiveMetrics}>
                <View style={styles.predictiveMetric}>
                  <Text style={styles.predictiveValue}>
                    {data.predictive_analytics.next_30_days?.predicted_new_users?.toLocaleString() || 'N/A'}
                  </Text>
                  <Text style={styles.predictiveLabel}>New Users</Text>
                </View>
                <View style={styles.predictiveMetric}>
                  <Text style={styles.predictiveValue}>
                    ${(data.predictive_analytics.next_30_days?.predicted_revenue || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.predictiveLabel}>Revenue</Text>
                </View>
              </View>
              <Text style={styles.confidenceText}>
                Confidence: {((data.predictive_analytics.next_30_days?.confidence || 0) * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  periodButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  periodButtonText: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#000000',
  },
  metricsContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  metricValue: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  retentionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  retentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  retentionPeriod: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    width: 60,
  },
  retentionBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  retentionFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  retentionValue: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  modelsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modelCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modelScore: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  segmentsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  segmentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  segmentSize: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  segmentDetails: {
    gap: 4,
  },
  segmentDetail: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  insightsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  insightCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    borderWidth: 1,
    borderColor: '#333333',
  },
  insightText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recommendationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationCategory: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendationText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationImpact: {
    color: '#CCCCCC',
    fontSize: 12,
    fontStyle: 'italic',
  },
  predictiveContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  predictiveCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  predictiveTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  predictiveMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  predictiveMetric: {
    alignItems: 'center',
  },
  predictiveValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  predictiveLabel: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  confidenceText: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});