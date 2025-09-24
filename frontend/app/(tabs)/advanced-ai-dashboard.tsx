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
  Dimensions,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// API configuration
const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://infinity-stories.preview.emergentagent.com';

interface AIModelStatus {
  status: string;
  version: string;
  accuracy: number;
  processing_capacity: string;
}

interface DashboardOverview {
  ai_system_health: {
    overall_status: string;
    model_performance: Record<string, number>;
    processing_speed: {
      avg_response_time_ms: number;
      throughput_per_hour: number;
      success_rate: number;
    };
  };
  intelligence_metrics: {
    visual_recognitions_processed: number;
    behavior_profiles_analyzed: number;
    trends_predicted: number;
    content_pieces_generated: number;
    insights_discovered: number;
  };
  personalization_stats: {
    total_recommendations_generated: number;
    avg_relevance_score: number;
    recommendation_click_through_rate: number;
    personalization_satisfaction: number;
  };
  business_impact: {
    ai_driven_conversions: number;
    revenue_attribution: number;
    cost_optimization: number;
    efficiency_gains: number;
  };
}

const AdvancedAIDashboard: React.FC = () => {
  const [aiModels, setAiModels] = useState<Record<string, AIModelStatus>>({});
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'analytics' | 'tools'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [aiToolModal, setAiToolModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const fetchAIData = async () => {
    try {
      setLoading(true);

      // Fetch AI models status
      const modelsResponse = await fetch(`${API_BASE}/api/advanced-ai/models/status`);
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setAiModels(modelsData.models || {});
      }

      // Fetch dashboard overview
      const overviewResponse = await fetch(`${API_BASE}/api/advanced-ai/dashboard/overview`);
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setDashboardData(overviewData);
      }

    } catch (error) {
      console.error('Failed to fetch AI data:', error);
      Alert.alert('Error', 'Failed to load AI dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAIData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAIData();
  }, []);

  const analyzeImage = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/advanced-ai/visual/recognize?image_url=${encodeURIComponent(imageUrl)}&analysis_depth=standard&include_price_estimation=true&include_style_analysis=true`,
        { method: 'POST' }
      );

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        Alert.alert('Analysis Complete', 'Visual analysis completed successfully!');
      } else {
        Alert.alert('Error', 'Failed to analyze image');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error during image analysis');
    }
  };

  const getModelStatusColor = (accuracy: number) => {
    if (accuracy >= 0.95) return '#4CAF50';
    if (accuracy >= 0.85) return '#FF9800';
    return '#F44336';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🤖 AI System Overview</Text>
      
      {dashboardData && (
        <>
          {/* System Health */}
          <BlurView intensity={15} tint="dark" style={styles.healthCard}>
            <Text style={styles.cardTitle}>System Health: {dashboardData.ai_system_health.overall_status}</Text>
            <View style={styles.healthMetrics}>
              <View style={styles.healthMetric}>
                <Text style={styles.metricValue}>{(dashboardData.ai_system_health.processing_speed.success_rate * 100).toFixed(1)}%</Text>
                <Text style={styles.metricLabel}>Success Rate</Text>
              </View>
              <View style={styles.healthMetric}>
                <Text style={styles.metricValue}>{formatNumber(dashboardData.ai_system_health.processing_speed.throughput_per_hour)}</Text>
                <Text style={styles.metricLabel}>Req/Hour</Text>
              </View>
              <View style={styles.healthMetric}>
                <Text style={styles.metricValue}>{dashboardData.ai_system_health.processing_speed.avg_response_time_ms}ms</Text>
                <Text style={styles.metricLabel}>Avg Response</Text>
              </View>
            </View>
          </BlurView>

          {/* Intelligence Metrics */}
          <BlurView intensity={15} tint="dark" style={styles.metricsCard}>
            <Text style={styles.cardTitle}>🧠 Intelligence Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.bigNumber}>{formatNumber(dashboardData.intelligence_metrics.visual_recognitions_processed)}</Text>
                <Text style={styles.metricText}>Visual Analyses</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.bigNumber}>{formatNumber(dashboardData.intelligence_metrics.behavior_profiles_analyzed)}</Text>
                <Text style={styles.metricText}>Behavior Profiles</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.bigNumber}>{formatNumber(dashboardData.intelligence_metrics.trends_predicted)}</Text>
                <Text style={styles.metricText}>Trends Predicted</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.bigNumber}>{formatNumber(dashboardData.intelligence_metrics.content_pieces_generated)}</Text>
                <Text style={styles.metricText}>Content Generated</Text>
              </View>
            </View>
          </BlurView>

          {/* Business Impact */}
          <BlurView intensity={15} tint="dark" style={styles.impactCard}>
            <Text style={styles.cardTitle}>💰 Business Impact</Text>
            <View style={styles.impactGrid}>
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>${(dashboardData.business_impact.revenue_attribution / 1000000).toFixed(1)}M</Text>
                <Text style={styles.impactLabel}>Revenue Attribution</Text>
              </View>
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>{formatNumber(dashboardData.business_impact.ai_driven_conversions)}</Text>
                <Text style={styles.impactLabel}>AI Conversions</Text>
              </View>
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>${(dashboardData.business_impact.cost_optimization / 1000000).toFixed(1)}M</Text>
                <Text style={styles.impactLabel}>Cost Savings</Text>
              </View>
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>{(dashboardData.business_impact.efficiency_gains * 100).toFixed(0)}%</Text>
                <Text style={styles.impactLabel}>Efficiency Gain</Text>
              </View>
            </View>
          </BlurView>
        </>
      )}
    </View>
  );

  const renderModelsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🤖 AI Models Status</Text>
      
      {Object.entries(aiModels).map(([modelName, model]) => (
        <TouchableOpacity
          key={modelName}
          style={styles.modelCard}
          onPress={() => setSelectedModel(selectedModel === modelName ? null : modelName)}
        >
          <BlurView intensity={15} tint="dark" style={styles.modelBlur}>
            <View style={styles.modelHeader}>
              <Text style={styles.modelName}>{modelName.replace(/_/g, ' ').toUpperCase()}</Text>
              <View style={[styles.statusDot, { backgroundColor: getModelStatusColor(model.accuracy) }]} />
            </View>
            
            <Text style={styles.modelVersion}>Version: {model.version}</Text>
            <View style={styles.modelMetrics}>
              <Text style={styles.modelMetric}>Accuracy: {(model.accuracy * 100).toFixed(1)}%</Text>
              <Text style={styles.modelMetric}>Capacity: {model.processing_capacity}</Text>
            </View>
            
            {selectedModel === modelName && (
              <View style={styles.modelDetails}>
                <Text style={styles.detailsTitle}>Model Details</Text>
                <Text style={styles.detailText}>Status: {model.status}</Text>
                <Text style={styles.detailText}>Last Updated: Today</Text>
                <Text style={styles.detailText}>Performance: Excellent</Text>
              </View>
            )}
          </BlurView>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAnalyticsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>📊 AI Analytics</Text>
      
      {dashboardData && (
        <>
          <BlurView intensity={15} tint="dark" style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Personalization Performance</Text>
            <View style={styles.personalizedMetrics}>
              <View style={styles.personalizedMetric}>
                <Text style={styles.personalizedValue}>{formatNumber(dashboardData.personalization_stats.total_recommendations_generated)}</Text>
                <Text style={styles.personalizedLabel}>Recommendations</Text>
              </View>
              <View style={styles.personalizedMetric}>
                <Text style={styles.personalizedValue}>{(dashboardData.personalization_stats.avg_relevance_score * 100).toFixed(0)}%</Text>
                <Text style={styles.personalizedLabel}>Relevance Score</Text>
              </View>
              <View style={styles.personalizedMetric}>
                <Text style={styles.personalizedValue}>{(dashboardData.personalization_stats.recommendation_click_through_rate * 100).toFixed(1)}%</Text>
                <Text style={styles.personalizedLabel}>Click Through</Text>
              </View>
              <View style={styles.personalizedMetric}>
                <Text style={styles.personalizedValue}>{(dashboardData.personalization_stats.personalization_satisfaction * 100).toFixed(0)}%</Text>
                <Text style={styles.personalizedLabel}>Satisfaction</Text>
              </View>
            </View>
          </BlurView>

          <BlurView intensity={15} tint="dark" style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Model Performance Overview</Text>
            {Object.entries(dashboardData.ai_system_health.model_performance).map(([model, performance]) => (
              <View key={model} style={styles.performanceRow}>
                <Text style={styles.performanceModel}>{model.replace(/_/g, ' ')}</Text>
                <View style={styles.performanceBar}>
                  <View 
                    style={[
                      styles.performanceFill, 
                      { 
                        width: `${performance * 100}%`,
                        backgroundColor: getModelStatusColor(performance)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.performanceValue}>{(performance * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </BlurView>
        </>
      )}
    </View>
  );

  const renderToolsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🛠️ AI Tools</Text>
      
      <TouchableOpacity style={styles.toolCard} onPress={() => setAiToolModal(true)}>
        <BlurView intensity={15} tint="dark" style={styles.toolBlur}>
          <Text style={styles.toolIcon}>👁️</Text>
          <Text style={styles.toolTitle}>Visual Product Recognition</Text>
          <Text style={styles.toolDescription}>Analyze product images with AI</Text>
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/ai-content-generator')}>
        <BlurView intensity={15} tint="dark" style={styles.toolBlur}>
          <Text style={styles.toolIcon}>✍️</Text>
          <Text style={styles.toolTitle}>AI Content Generator</Text>
          <Text style={styles.toolDescription}>Generate social commerce content</Text>
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/trend-predictor')}>
        <BlurView intensity={15} tint="dark" style={styles.toolBlur}>
          <Text style={styles.toolIcon}>📈</Text>
          <Text style={styles.toolTitle}>Trend Predictor</Text>
          <Text style={styles.toolDescription}>Predict market trends with AI</Text>
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toolCard} onPress={() => router.push('/behavior-analyzer')}>
        <BlurView intensity={15} tint="dark" style={styles.toolBlur}>
          <Text style={styles.toolIcon}>🧠</Text>
          <Text style={styles.toolTitle}>Behavior Analyzer</Text>
          <Text style={styles.toolDescription}>Analyze user behavior patterns</Text>
        </BlurView>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading Advanced AI Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Advanced AI Engine</Text>
        <Text style={styles.headerSubtitle}>Intelligence • Analysis • Optimization</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'models', label: 'Models', icon: '🤖' },
          { key: 'analytics', label: 'Analytics', icon: '📈' },
          { key: 'tools', label: 'Tools', icon: '🛠️' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTabIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'models' && renderModelsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'tools' && renderToolsTab()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* AI Tool Modal */}
      <Modal visible={aiToolModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Visual Product Recognition</Text>
            
            <TextInput
              style={styles.imageInput}
              placeholder="Enter image URL..."
              placeholderTextColor="#888"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            {analysisResult && (
              <View style={styles.analysisResults}>
                <Text style={styles.resultsTitle}>Analysis Results:</Text>
                <Text style={styles.resultText}>
                  Confidence: {analysisResult.confidence_scores?.overall?.toFixed(2) || 'N/A'}
                </Text>
                <Text style={styles.resultText}>
                  Products Found: {analysisResult.detected_products?.length || 0}
                </Text>
                {analysisResult.price_estimation && (
                  <Text style={styles.resultText}>
                    Price Estimate: ${analysisResult.price_estimation.predicted_usd?.toFixed(2)}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
                <Text style={styles.buttonText}>Analyze Image</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => {
                  setAiToolModal(false);
                  setImageUrl('');
                  setAnalysisResult(null);
                }}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
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
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  activeTabIcon: {
    color: '#D4AF37',
  },
  activeTabText: {
    color: '#D4AF37',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  healthCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 12,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthMetric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
  },
  metricsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricBox: {
    width: (width - 64) / 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  metricText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 4,
  },
  impactCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactItem: {
    width: (width - 64) / 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  impactLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 4,
  },
  modelCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modelBlur: {
    padding: 16,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modelVersion: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  modelMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modelMetric: {
    fontSize: 12,
    color: '#D4AF37',
  },
  modelDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  analyticsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  personalizedMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  personalizedMetric: {
    width: (width - 64) / 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  personalizedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8A2BE2',
  },
  personalizedLabel: {
    fontSize: 11,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 4,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceModel: {
    fontSize: 12,
    color: '#FFFFFF',
    width: 100,
  },
  performanceBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  performanceFill: {
    height: '100%',
    borderRadius: 4,
  },
  performanceValue: {
    fontSize: 12,
    color: '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  toolCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toolBlur: {
    padding: 16,
    alignItems: 'center',
  },
  toolIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: width * 0.9,
    padding: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  analysisResults: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default AdvancedAIDashboard;