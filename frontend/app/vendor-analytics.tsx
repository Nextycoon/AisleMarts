import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface AnalyticsData {
  clpMetrics: {
    totalRevenue: number;
    totalViews: number;
    conversionRate: number;
    topContent: any[];
  };
  pplMetrics: {
    totalLeads: number;
    qualifiedLeads: number;
    costPerLead: number;
    roi: number;
  };
  comparison: {
    vsAmazon: number;
    vsShopify: number;
    vsFacebook: number;
  };
  predictions: {
    nextMonth: number;
    nextQuarter: number;
    yearEnd: number;
  };
}

export default function VendorAnalyticsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  const [analyticsData] = useState<AnalyticsData>({
    clpMetrics: {
      totalRevenue: 89340,
      totalViews: 425680,
      conversionRate: 2.84,
      topContent: [
        { title: 'iPhone Review', revenue: 12400, type: 'video' },
        { title: 'Fashion Live', revenue: 8940, type: 'live' },
        { title: 'Coffee Guide', revenue: 5670, type: 'post' },
      ],
    },
    pplMetrics: {
      totalLeads: 1893,
      qualifiedLeads: 1247,
      costPerLead: 2.85,
      roi: 251.3,
    },
    comparison: {
      vsAmazon: 15.2, // Percentage saved
      vsShopify: 12.8,
      vsFacebook: 68.4,
    },
    predictions: {
      nextMonth: 120500,
      nextQuarter: 387200,
      yearEnd: 1200000,
    },
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'clp', name: 'CLP Analytics', icon: '📈' },
    { id: 'ppl', name: 'PPL Analytics', icon: '🎯' },
    { id: 'comparison', name: 'Platform Comparison', icon: '⚖️' },
    { id: 'predictions', name: 'AI Predictions', icon: '🔮' },
  ];

  const periods = ['7d', '30d', '90d', '1y'];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Revenue Summary */}
      <View style={styles.section}>
        <View style={styles.revenueSummaryCard}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
            style={styles.revenueSummaryGradient}
          >
            <Text style={styles.revenueSummaryTitle}>💰 Total Revenue ({selectedPeriod})</Text>
            <Text style={styles.revenueSummaryAmount}>
              {formatCurrency(analyticsData.clpMetrics.totalRevenue)}
            </Text>
            <Text style={styles.revenueSummarySubtitle}>
              🎉 100% kept • ${formatCurrency(analyticsData.clpMetrics.totalRevenue * 0.15)} saved in fees
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>👁️</Text>
            <Text style={styles.metricValue}>{formatNumber(analyticsData.clpMetrics.totalViews)}</Text>
            <Text style={styles.metricLabel}>Total Views</Text>
            <Text style={styles.metricChange}>+34%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>🎯</Text>
            <Text style={styles.metricValue}>{analyticsData.clpMetrics.conversionRate}%</Text>
            <Text style={styles.metricLabel}>Conversion Rate</Text>
            <Text style={styles.metricChange}>+12%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💰</Text>
            <Text style={styles.metricValue}>${analyticsData.pplMetrics.costPerLead}</Text>
            <Text style={styles.metricLabel}>Cost Per Lead</Text>
            <Text style={styles.metricChangeNegative}>-23%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>📈</Text>
            <Text style={styles.metricValue}>{analyticsData.pplMetrics.roi}%</Text>
            <Text style={styles.metricLabel}>ROI</Text>
            <Text style={styles.metricChange}>+89%</Text>
          </View>
        </View>
      </View>

      {/* Top Performing Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Top Performing Content</Text>
        <View style={styles.topContentList}>
          {analyticsData.clpMetrics.topContent.map((content, index) => (
            <View key={index} style={styles.topContentItem}>
              <View style={styles.topContentRank}>
                <Text style={styles.topContentRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topContentInfo}>
                <Text style={styles.topContentTitle}>{content.title}</Text>
                <Text style={styles.topContentType}>{content.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.topContentRevenue}>{formatCurrency(content.revenue)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCLPAnalytics = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Content Lead Purchase Analytics</Text>
        
        {/* CLP Performance Chart Placeholder */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderTitle}>CLP Revenue Trend</Text>
          <View style={styles.chartBars}>
            {[65, 78, 45, 89, 92, 76, 85].map((height, index) => (
              <View key={index} style={styles.chartBarContainer}>
                <View style={[styles.chartBar, { height: height }]} />
                <Text style={styles.chartBarLabel}>W{index + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content Type Performance */}
        <Text style={styles.subsectionTitle}>Content Type Performance</Text>
        <View style={styles.contentTypeGrid}>
          {[
            { type: 'Video', revenue: 45600, conversion: 3.2, icon: '📹' },
            { type: 'Live', revenue: 28900, conversion: 4.8, icon: '🔴' },
            { type: 'Post', revenue: 12400, conversion: 2.1, icon: '📝' },
            { type: 'Review', revenue: 8440, conversion: 2.9, icon: '⭐' },
          ].map((content, index) => (
            <View key={index} style={styles.contentTypeCard}>
              <Text style={styles.contentTypeIcon}>{content.icon}</Text>
              <Text style={styles.contentTypeName}>{content.type}</Text>
              <Text style={styles.contentTypeRevenue}>{formatCurrency(content.revenue)}</Text>
              <Text style={styles.contentTypeConversion}>{content.conversion}% CVR</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPPLAnalytics = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Pay Per Lead Analytics</Text>
        
        {/* Lead Quality Distribution */}
        <View style={styles.leadQualityCard}>
          <Text style={styles.subsectionTitle}>Lead Quality Distribution</Text>
          <View style={styles.leadQualityBars}>
            <View style={styles.leadQualityBar}>
              <View style={[styles.leadQualityFill, { width: '85%', backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.leadQualityLabel}>High Quality (85%)</Text>
            </View>
            <View style={styles.leadQualityBar}>
              <View style={[styles.leadQualityFill, { width: '12%', backgroundColor: '#FFE66D' }]} />
              <Text style={styles.leadQualityLabel}>Medium Quality (12%)</Text>
            </View>
            <View style={styles.leadQualityBar}>
              <View style={[styles.leadQualityFill, { width: '3%', backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.leadQualityLabel}>Low Quality (3%)</Text>
            </View>
          </View>
        </View>

        {/* PPL Performance Metrics */}
        <View style={styles.pplMetricsGrid}>
          <View style={styles.pplMetricCard}>
            <Text style={styles.pplMetricTitle}>Total Leads Generated</Text>
            <Text style={styles.pplMetricValue}>{analyticsData.pplMetrics.totalLeads}</Text>
            <Text style={styles.pplMetricNote}>AI-filtered from 3,247 raw leads</Text>
          </View>
          
          <View style={styles.pplMetricCard}>
            <Text style={styles.pplMetricTitle}>Qualification Rate</Text>
            <Text style={styles.pplMetricValue}>
              {((analyticsData.pplMetrics.qualifiedLeads / analyticsData.pplMetrics.totalLeads) * 100).toFixed(1)}%
            </Text>
            <Text style={styles.pplMetricNote}>Industry average: 45%</Text>
          </View>
          
          <View style={styles.pplMetricCard}>
            <Text style={styles.pplMetricTitle}>Cost Savings</Text>
            <Text style={styles.pplMetricValue}>${formatCurrency(5240)}</Text>
            <Text style={styles.pplMetricNote}>vs traditional lead generation</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderComparison = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚖️ Platform Comparison</Text>
        
        {/* Savings Calculator */}
        <View style={styles.savingsCard}>
          <LinearGradient
            colors={['rgba(78, 205, 196, 0.2)', 'rgba(78, 205, 196, 0.1)']}
            style={styles.savingsGradient}
          >
            <Text style={styles.savingsTitle}>💰 Your Savings with AisleMarts</Text>
            
            {[
              { platform: 'Amazon', fee: '15%', savings: analyticsData.comparison.vsAmazon, color: '#FF9500' },
              { platform: 'Shopify', fee: '12%', savings: analyticsData.comparison.vsShopify, color: '#96BF48' },
              { platform: 'Facebook Ads', fee: '68%', savings: analyticsData.comparison.vsFacebook, color: '#1877F2' },
            ].map((platform, index) => (
              <View key={index} style={styles.platformComparison}>
                <View style={styles.platformInfo}>
                  <Text style={styles.platformName}>vs {platform.platform}</Text>
                  <Text style={styles.platformFee}>{platform.fee} fees</Text>
                </View>
                <View style={styles.platformSavings}>
                  <Text style={styles.platformSavingsAmount}>
                    ${formatCurrency(platform.savings * 1000)}
                  </Text>
                  <Text style={styles.platformSavingsLabel}>saved monthly</Text>
                </View>
              </View>
            ))}
            
            <View style={styles.totalSavings}>
              <Text style={styles.totalSavingsTitle}>Total Monthly Savings</Text>
              <Text style={styles.totalSavingsAmount}>
                ${formatCurrency((analyticsData.comparison.vsAmazon + 
                  analyticsData.comparison.vsShopify + 
                  analyticsData.comparison.vsFacebook) * 1000)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* ROI Comparison */}
        <View style={styles.roiComparisonCard}>
          <Text style={styles.subsectionTitle}>ROI Comparison</Text>
          <View style={styles.roiComparisonBars}>
            {[
              { platform: 'AisleMarts', roi: 251, color: '#4ECDC4' },
              { platform: 'Amazon', roi: 120, color: '#FF9500' },
              { platform: 'Shopify', roi: 145, color: '#96BF48' },
              { platform: 'Facebook', roi: 89, color: '#1877F2' },
            ].map((platform, index) => (
              <View key={index} style={styles.roiComparisonItem}>
                <Text style={styles.roiPlatformName}>{platform.platform}</Text>
                <View style={styles.roiBar}>
                  <View 
                    style={[
                      styles.roiBarFill, 
                      { width: `${(platform.roi / 251) * 100}%`, backgroundColor: platform.color }
                    ]} 
                  />
                </View>
                <Text style={styles.roiPercentage}>{platform.roi}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderPredictions = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔮 AI Revenue Predictions</Text>
        
        {/* Prediction Cards */}
        <View style={styles.predictionsGrid}>
          <View style={styles.predictionCard}>
            <Text style={styles.predictionPeriod}>Next Month</Text>
            <Text style={styles.predictionAmount}>
              {formatCurrency(analyticsData.predictions.nextMonth)}
            </Text>
            <Text style={styles.predictionConfidence}>92% confidence</Text>
          </View>
          
          <View style={styles.predictionCard}>
            <Text style={styles.predictionPeriod}>Next Quarter</Text>
            <Text style={styles.predictionAmount}>
              {formatCurrency(analyticsData.predictions.nextQuarter)}
            </Text>
            <Text style={styles.predictionConfidence}>87% confidence</Text>
          </View>
          
          <View style={styles.predictionCard}>
            <Text style={styles.predictionPeriod}>Year End</Text>
            <Text style={styles.predictionAmount}>
              {formatCurrency(analyticsData.predictions.yearEnd)}
            </Text>
            <Text style={styles.predictionConfidence}>78% confidence</Text>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.aiInsightsCard}>
          <Text style={styles.subsectionTitle}>🤖 AI-Powered Insights</Text>
          <View style={styles.aiInsightsList}>
            {[
              {
                title: 'Optimal Content Strategy',
                insight: 'Focus on video content for 34% higher conversions. Peak posting time: 7:30 PM.',
                impact: 'High',
              },
              {
                title: 'Lead Quality Optimization',
                insight: 'Current qualification rate is 23% above industry average. Maintain current targeting.',
                impact: 'Medium',
              },
              {
                title: 'Revenue Growth Opportunity',
                insight: 'Live streaming could increase revenue by 45% based on current audience engagement.',
                impact: 'High',
              },
            ].map((insight, index) => (
              <View key={index} style={styles.aiInsightItem}>
                <View style={styles.aiInsightHeader}>
                  <Text style={styles.aiInsightTitle}>{insight.title}</Text>
                  <View style={[
                    styles.impactBadge,
                    { backgroundColor: insight.impact === 'High' ? '#4ECDC4' : '#FFE66D' + '20' }
                  ]}>
                    <Text style={[
                      styles.impactText,
                      { color: insight.impact === 'High' ? '#4ECDC4' : '#FFE66D' }
                    ]}>
                      {insight.impact}
                    </Text>
                  </View>
                </View>
                <Text style={styles.aiInsightText}>{insight.insight}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview': return renderOverview();
      case 'clp': return renderCLPAnalytics();
      case 'ppl': return renderPPLAnalytics();
      case 'comparison': return renderComparison();
      case 'predictions': return renderPredictions();
      default: return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>CLP + PPL Analytics</Text>
          <Text style={styles.headerSubtitle}>Deep Business Intelligence</Text>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.selectedPeriodButton
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.selectedPeriodButtonText
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsRow}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  selectedTab === tab.id && styles.selectedTab
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === tab.id && styles.selectedTabText
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedPeriodButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  periodButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  tabNavigation: {
    paddingBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  tabIcon: {
    fontSize: 14,
  },
  tabButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subsectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  revenueSummaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  revenueSummaryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  revenueSummaryTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  revenueSummaryAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  revenueSummarySubtitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricChange: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  metricChangeNegative: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  topContentList: {
    gap: 12,
  },
  topContentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topContentRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topContentRankText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  topContentInfo: {
    flex: 1,
  },
  topContentTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  topContentType: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  topContentRevenue: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  chartPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartPlaceholderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 80,
  },
  chartBarContainer: {
    alignItems: 'center',
  },
  chartBar: {
    width: 20,
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
    marginBottom: 4,
  },
  chartBarLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  contentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contentTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contentTypeName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentTypeRevenue: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  contentTypeConversion: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  leadQualityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  leadQualityBars: {
    gap: 12,
  },
  leadQualityBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadQualityFill: {
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  leadQualityLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  pplMetricsGrid: {
    gap: 12,
  },
  pplMetricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pplMetricTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pplMetricValue: {
    color: '#4ECDC4',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  pplMetricNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  savingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  savingsGradient: {
    padding: 20,
  },
  savingsTitle: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  platformComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformInfo: {},
  platformName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  platformFee: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  platformSavings: {
    alignItems: 'flex-end',
  },
  platformSavingsAmount: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  platformSavingsLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  totalSavings: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
    alignItems: 'center',
  },
  totalSavingsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalSavingsAmount: {
    color: '#4ECDC4',
    fontSize: 24,
    fontWeight: '700',
  },
  roiComparisonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roiComparisonBars: {
    gap: 16,
  },
  roiComparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roiPlatformName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  roiBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  roiBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  roiPercentage: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  predictionsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  predictionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  predictionPeriod: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  predictionAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  predictionConfidence: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  aiInsightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiInsightsList: {
    gap: 16,
  },
  aiInsightItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 16,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiInsightTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
  },
  aiInsightText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 18,
  },
});