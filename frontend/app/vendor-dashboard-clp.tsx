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

interface CLPMetrics {
  totalContent: number;
  totalViews: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
}

interface PPLMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  leadCost: number;
  leadConversionRate: number;
  totalSpent: number;
  roi: number;
}

interface ContentPerformance {
  id: string;
  type: 'video' | 'post' | 'review' | 'live';
  title: string;
  views: number;
  conversions: number;
  revenue: number;
  ctr: number;
}

export default function VendorDashboardCLPScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  
  // Mock data - in real app, this would come from API
  const [clpMetrics] = useState<CLPMetrics>({
    totalContent: 47,
    totalViews: 125420,
    totalConversions: 2847,
    totalRevenue: 89340,
    conversionRate: 2.27,
    averageOrderValue: 31.40,
  });

  const [pplMetrics] = useState<PPLMetrics>({
    totalLeads: 1893,
    qualifiedLeads: 1247,
    leadCost: 2.85,
    leadConversionRate: 18.7,
    totalSpent: 3555,
    roi: 251.3,
  });

  const [topContent] = useState<ContentPerformance[]>([
    {
      id: '1',
      type: 'video',
      title: 'iPhone 15 Pro Max Unboxing & Review',
      views: 24350,
      conversions: 847,
      revenue: 12400,
      ctr: 3.48,
    },
    {
      id: '2',
      type: 'live',
      title: 'Winter Fashion Live Shopping',
      views: 18920,
      conversions: 692,
      revenue: 8940,
      ctr: 3.66,
    },
    {
      id: '3',
      type: 'post',
      title: 'Best Coffee Makers Under $200',
      views: 15680,
      conversions: 428,
      revenue: 5670,
      ctr: 2.73,
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '📹';
      case 'live': return '🔴';
      case 'post': return '📝';
      case 'review': return '⭐';
      default: return '📄';
    }
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
          <Text style={styles.headerTitle}>CLP + PPL Dashboard</Text>
          <Text style={styles.headerSubtitle}>Content Lead Purchase + Pay Per Lead Analytics</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['24h', '7d', '30d', '90d'].map((period) => (
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* CLP + PPL Formula Banner */}
        <View style={styles.formulaBanner}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
            style={styles.formulaBannerGradient}
          >
            <Text style={styles.formulaBannerTitle}>⚡ CLP + PPL = YOUR SUCCESS</Text>
            <Text style={styles.formulaBannerDesc}>
              Content drives sales • Only pay for real buyers • Keep 100% revenue
            </Text>
          </LinearGradient>
        </View>

        {/* CLP Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionIcon}>📈</Text>
              <Text style={styles.sectionTitle}>Content Lead Purchase (CLP)</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{clpMetrics.totalContent}</Text>
              <Text style={styles.metricLabel}>Content Pieces</Text>
              <Text style={styles.metricChange}>+12%</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{formatNumber(clpMetrics.totalViews)}</Text>
              <Text style={styles.metricLabel}>Total Views</Text>
              <Text style={styles.metricChange}>+28%</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{formatNumber(clpMetrics.totalConversions)}</Text>
              <Text style={styles.metricLabel}>Conversions</Text>
              <Text style={styles.metricChange}>+45%</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{formatCurrency(clpMetrics.totalRevenue)}</Text>
              <Text style={styles.metricLabel}>CLP Revenue</Text>
              <Text style={styles.metricChange}>+67%</Text>
            </View>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Conversion Rate</Text>
              <Text style={styles.summaryStatValue}>{clpMetrics.conversionRate}%</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Avg Order Value</Text>
              <Text style={styles.summaryStatValue}>{formatCurrency(clpMetrics.averageOrderValue)}</Text>
            </View>
          </View>
        </View>

        {/* PPL Metrics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <Text style={styles.sectionTitle}>Pay Per Lead (PPL)</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Optimize</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{formatNumber(pplMetrics.totalLeads)}</Text>
              <Text style={styles.metricLabel}>Total Leads</Text>
              <Text style={styles.metricChange}>+34%</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{formatNumber(pplMetrics.qualifiedLeads)}</Text>
              <Text style={styles.metricLabel}>Qualified Leads</Text>
              <Text style={styles.metricChange}>+52%</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${pplMetrics.leadCost}</Text>
              <Text style={styles.metricLabel}>Cost Per Lead</Text>
              <Text style={styles.metricChangeNegative}>-18%</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{pplMetrics.roi}%</Text>
              <Text style={styles.metricLabel}>PPL ROI</Text>
              <Text style={styles.metricChange}>+89%</Text>
            </View>
          </View>

          <View style={styles.pplInsight}>
            <Text style={styles.pplInsightTitle}>🤖 AI Insight</Text>
            <Text style={styles.pplInsightText}>
              Your lead qualification rate is 65.9% (industry avg: 45%). 
              AI filtering saves you $1,247/month in wasted spend.
            </Text>
          </View>
        </View>

        {/* Top Performing Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionIcon}>🏆</Text>
              <Text style={styles.sectionTitle}>Top Performing Content</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentList}>
            {topContent.map((content) => (
              <View key={content.id} style={styles.contentItem}>
                <View style={styles.contentHeader}>
                  <Text style={styles.contentTypeIcon}>{getContentTypeIcon(content.type)}</Text>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle} numberOfLines={1}>{content.title}</Text>
                    <Text style={styles.contentType}>{content.type.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.contentMetrics}>
                  <View style={styles.contentMetricItem}>
                    <Text style={styles.contentMetricValue}>{formatNumber(content.views)}</Text>
                    <Text style={styles.contentMetricLabel}>Views</Text>
                  </View>
                  <View style={styles.contentMetricItem}>
                    <Text style={styles.contentMetricValue}>{content.conversions}</Text>
                    <Text style={styles.contentMetricLabel}>Sales</Text>
                  </View>
                  <View style={styles.contentMetricItem}>
                    <Text style={styles.contentMetricValue}>{formatCurrency(content.revenue)}</Text>
                    <Text style={styles.contentMetricLabel}>Revenue</Text>
                  </View>
                  <View style={styles.contentCtrBadge}>
                    <Text style={styles.contentCtrText}>{content.ctr}% CTR</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Revenue Summary */}
        <View style={styles.section}>
          <View style={styles.revenueSummaryCard}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
              style={styles.revenueSummaryGradient}
            >
              <Text style={styles.revenueSummaryTitle}>💰 Total Revenue (Last 7 Days)</Text>
              <Text style={styles.revenueSummaryAmount}>
                {formatCurrency(clpMetrics.totalRevenue)}
              </Text>
              <View style={styles.revenueSummaryBreakdown}>
                <View style={styles.revenueBreakdownItem}>
                  <Text style={styles.revenueBreakdownLabel}>CLP Revenue</Text>
                  <Text style={styles.revenueBreakdownValue}>{formatCurrency(clpMetrics.totalRevenue)}</Text>
                </View>
                <View style={styles.revenueBreakdownItem}>
                  <Text style={styles.revenueBreakdownLabel}>Commission Saved</Text>
                  <Text style={styles.revenueBreakdownValue}>+{formatCurrency(clpMetrics.totalRevenue * 0.15)}</Text>
                </View>
              </View>
              <Text style={styles.revenueSummaryNote}>
                🎉 You saved {formatCurrency(clpMetrics.totalRevenue * 0.15)} in commission fees vs traditional platforms!
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/vendor-content-creator')}
          >
            <LinearGradient
              colors={['#007AFF', '#0056CC']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>📹 Create Content</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/vendor-lead-manager')}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>🎯 Manage Leads</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formulaBanner: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  formulaBannerGradient: {
    padding: 20,
    alignItems: 'center',
  },
  formulaBannerTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  formulaBannerDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewAllText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pplInsight: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  pplInsightTitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pplInsightText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 18,
  },
  contentList: {
    gap: 12,
  },
  contentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  contentType: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  contentMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentMetricItem: {
    marginRight: 16,
  },
  contentMetricValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contentMetricLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  contentCtrBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  contentCtrText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '600',
  },
  revenueSummaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  revenueSummaryGradient: {
    padding: 20,
  },
  revenueSummaryTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  revenueSummaryAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  revenueSummaryBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  revenueBreakdownItem: {
    alignItems: 'center',
  },
  revenueBreakdownLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  revenueBreakdownValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  revenueSummaryNote: {
    color: '#4ECDC4',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});