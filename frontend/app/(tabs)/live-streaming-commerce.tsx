import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';

interface Stream {
  id: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended';
  host_name: string;
  analytics: {
    total_viewers: number;
    total_revenue: number;
    engagement_rate: number;
  };
  created_at: string;
}

interface AIInsight {
  type: string;
  message: string;
  confidence: number;
  action_recommendation?: string;
}

interface LiveStreamingData {
  streams: Stream[];
  ai_insights: string[];
  platform_metrics: {
    total_streams: number;
    active_streams: number;
    total_revenue: number;
    ai_model_performance: Record<string, number>;
  };
}

export default function LiveStreamingCommerce() {
  const [data, setData] = useState<LiveStreamingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch streams
      const streamsResponse = await fetch(`${backendUrl}/api/live-streaming/streams?limit=10`);
      const streamsData = await streamsResponse.json();
      
      // Fetch platform metrics
      const metricsResponse = await fetch(`${backendUrl}/api/live-streaming/analytics/performance`);
      const metricsData = await metricsResponse.json();
      
      // Fetch health check for AI insights
      const healthResponse = await fetch(`${backendUrl}/api/live-streaming/health`);
      const healthData = await healthResponse.json();

      setData({
        streams: streamsData.streams || [],
        ai_insights: healthData.features || [],
        platform_metrics: metricsData.platform_metrics || {
          total_streams: 0,
          active_streams: 0,
          total_revenue: 0,
          ai_model_performance: {}
        }
      });
    } catch (error) {
      console.error('Error fetching live streaming data:', error);
      Alert.alert('Error', 'Failed to load live streaming data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createNewStream = () => {
    Alert.alert(
      'Create Live Stream',
      'Create a new live streaming session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              const response = await fetch(`${backendUrl}/api/live-streaming/streams`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title: `Live Stream ${new Date().toLocaleTimeString()}`,
                  description: 'AI-powered live commerce stream',
                  category: 'commerce',
                  products: []
                })
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Live stream created successfully!');
                fetchData();
              } else {
                Alert.alert('Error', 'Failed to create stream');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to create stream');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#ff4444';
      case 'scheduled': return '#ffa500';
      case 'ended': return '#666666';
      default: return '#666666';
    }
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading Live Streaming Dashboard...</Text>
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
          <Text style={styles.headerTitle}>Live Streaming Commerce</Text>
          <TouchableOpacity onPress={createNewStream} style={styles.createButton}>
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        {/* AI-Powered Platform Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>🤖 AI Analytics Dashboard</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.platform_metrics.total_streams || 0}</Text>
              <Text style={styles.metricLabel}>Total Streams</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data?.platform_metrics.active_streams || 0}</Text>
              <Text style={styles.metricLabel}>Live Now</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${(data?.platform_metrics.total_revenue || 0).toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Revenue</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Object.keys(data?.platform_metrics.ai_model_performance || {}).length}
              </Text>
              <Text style={styles.metricLabel}>AI Models</Text>
            </View>
          </View>
        </View>

        {/* AI Model Performance */}
        {data?.platform_metrics.ai_model_performance && (
          <View style={styles.aiModelsContainer}>
            <Text style={styles.sectionTitle}>🧠 AI Model Performance</Text>
            {Object.entries(data.platform_metrics.ai_model_performance).map(([model, performance]) => (
              <View key={model} style={styles.modelCard}>
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>{model.replace(/_/g, ' ').toUpperCase()}</Text>
                  <Text style={styles.modelPerformance}>{(performance * 100).toFixed(1)}%</Text>
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

        {/* AI Features */}
        {data?.ai_insights && data.ai_insights.length > 0 && (
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>✨ AI-Powered Features</Text>
            {data.ai_insights.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureText}>• {feature.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Streams */}
        <View style={styles.streamsContainer}>
          <Text style={styles.sectionTitle}>📡 Recent Streams</Text>
          {data?.streams && data.streams.length > 0 ? (
            data.streams.map((stream) => (
              <TouchableOpacity key={stream.id} style={styles.streamCard}>
                <View style={styles.streamHeader}>
                  <View style={styles.streamInfo}>
                    <Text style={styles.streamTitle}>{stream.title}</Text>
                    <Text style={styles.streamHost}>by {stream.host_name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(stream.status) }]}>
                    <Text style={styles.statusText}>{stream.status.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.streamMetrics}>
                  <View style={styles.metric}>
                    <Text style={styles.metricNumber}>{stream.analytics.total_viewers}</Text>
                    <Text style={styles.metricText}>Viewers</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricNumber}>${stream.analytics.total_revenue.toFixed(0)}</Text>
                    <Text style={styles.metricText}>Revenue</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricNumber}>{(stream.analytics.engagement_rate * 100).toFixed(1)}%</Text>
                    <Text style={styles.metricText}>Engagement</Text>
                  </View>
                </View>
                
                <Text style={styles.streamDate}>
                  {new Date(stream.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Streams Yet</Text>
              <Text style={styles.emptyStateText}>Create your first AI-powered live stream</Text>
              <TouchableOpacity onPress={createNewStream} style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Analytics Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>🎯 AI Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              AI models are analyzing viewer behavior patterns to optimize stream performance and revenue generation.
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Real-time personalization engine adapts content recommendations based on audience engagement.
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Predictive analytics forecast optimal streaming times and product showcase moments.
            </Text>
          </View>
        </View>

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
  createButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  aiModelsContainer: {
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
  modelPerformance: {
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
  featuresContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  featureText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  streamsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  streamCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  streamInfo: {
    flex: 1,
  },
  streamTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streamHost: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  streamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  metric: {
    alignItems: 'center',
  },
  metricNumber: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  streamDate: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
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
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderLeftWidth: 4,
  },
  insightText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
});