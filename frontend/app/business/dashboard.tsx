import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface KPICard {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface Alert {
  id: string;
  type: 'low_stock' | 'spike' | 'viral' | 'payment_failed';
  title: string;
  message: string;
  time: string;
  icon: string;
  color: string;
}

export default function BusinessDashboard() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d'>('7d');

  const kpiCards: KPICard[] = [
    {
      title: 'Views',
      value: '127.3K',
      change: 12.5,
      icon: '👁️',
      color: '#4ECDC4',
    },
    {
      title: 'Watch Time',
      value: '2.8h',
      change: 8.7,
      icon: '⏱️',
      color: '#45B7D1',
    },
    {
      title: 'CTR',
      value: '4.2%',
      change: -2.1,
      icon: '🎯',
      color: '#F7DC6F',
    },
    {
      title: 'Followers',
      value: '94.2K',
      change: 5.8,
      icon: '👥',
      color: '#BB8FCE',
    },
    {
      title: 'Saves',
      value: '8.9K',
      change: 15.2,
      icon: '🔖',
      color: '#85C1E9',
    },
    {
      title: 'Shares',
      value: '3.4K',
      change: 22.1,
      icon: '📤',
      color: '#F8C471',
    },
    {
      title: 'Conversion Rate',
      value: '3.8%',
      change: 7.3,
      icon: '💰',
      color: '#D4AF37',
    },
    {
      title: 'GMV',
      value: '€45.7K',
      change: 18.4,
      icon: '💸',
      color: '#82E0AA',
    },
    {
      title: 'AOV',
      value: '€127.50',
      change: -3.2,
      icon: '🛒',
      color: '#F1948A',
    },
    {
      title: 'Refund Rate',
      value: '2.1%',
      change: -1.8,
      icon: '↩️',
      color: '#AED6F1',
    },
    {
      title: 'CSAT',
      value: '4.6⭐',
      change: 0.3,
      icon: '⭐',
      color: '#FADBD8',
    },
    {
      title: 'Revenue',
      value: '€42.3K',
      change: 16.7,
      icon: '📈',
      color: '#D5DBDB',
    },
  ];

  const alerts: Alert[] = [
    {
      id: '1',
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Wireless Headphones Pro - Only 3 units left',
      time: '5m ago',
      icon: '📦',
      color: '#FF9500',
    },
    {
      id: '2',
      type: 'viral',
      title: 'Viral Post Detected',
      message: 'Your latest post is trending! 🔥',
      time: '12m ago',
      icon: '🚀',
      color: '#FF3B30',
    },
    {
      id: '3',
      type: 'spike',
      title: 'Traffic Spike',
      message: '+287% increase in product views',
      time: '23m ago',
      icon: '📊',
      color: '#34C759',
    },
  ];

  const renderTimeFilter = () => (
    <View style={styles.timeFilterContainer}>
      {(['today', '7d', '30d'] as const).map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.timeFilterButton,
            timeFilter === filter && styles.timeFilterActive,
          ]}
          onPress={() => setTimeFilter(filter)}
        >
          <Text
            style={[
              styles.timeFilterText,
              timeFilter === filter && styles.timeFilterActiveText,
            ]}
          >
            {filter === 'today' ? 'Today' : filter === '7d' ? '7 Days' : '30 Days'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderKPICard = (kpi: KPICard, index: number) => (
    <View key={index} style={[styles.kpiCard, { borderLeftColor: kpi.color }]}>
      <View style={styles.kpiHeader}>
        <Text style={styles.kpiIcon}>{kpi.icon}</Text>
        <View style={[styles.changeIndicator, { 
          backgroundColor: kpi.change >= 0 ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)',
        }]}>
          <Text style={[styles.changeText, { 
            color: kpi.change >= 0 ? '#34C759' : '#FF3B30',
          }]}>
            {kpi.change >= 0 ? '+' : ''}{kpi.change}%
          </Text>
        </View>
      </View>
      <Text style={styles.kpiValue}>{kpi.value}</Text>
      <Text style={styles.kpiTitle}>{kpi.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⭐ Business Dashboard</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/business/notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>@LuxeFashion</Text>
          <Text style={styles.businessType}>Premium Fashion Brand</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Time Filter */}
        <View style={styles.section}>
          {renderTimeFilter()}
        </View>

        {/* KPI Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.kpiGrid}>
            {kpiCards.map((kpi, index) => renderKPICard(kpi, index))}
          </View>
        </View>

        {/* Conversion Funnel Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversion Funnel</Text>
          <View style={styles.funnelChart}>
            <View style={styles.funnelStep}>
              <View style={[styles.funnelBar, { width: '100%', backgroundColor: '#4ECDC4' }]}>
                <Text style={styles.funnelLabel}>Impressions</Text>
                <Text style={styles.funnelValue}>127.3K</Text>
              </View>
            </View>
            <View style={styles.funnelStep}>
              <View style={[styles.funnelBar, { width: '85%', backgroundColor: '#45B7D1' }]}>
                <Text style={styles.funnelLabel}>Engagement</Text>
                <Text style={styles.funnelValue}>108.2K</Text>
              </View>
            </View>
            <View style={styles.funnelStep}>
              <View style={[styles.funnelBar, { width: '45%', backgroundColor: '#F7DC6F' }]}>
                <Text style={styles.funnelLabel}>Cart Adds</Text>
                <Text style={styles.funnelValue}>57.3K</Text>
              </View>
            </View>
            <View style={styles.funnelStep}>
              <View style={[styles.funnelBar, { width: '12%', backgroundColor: '#D4AF37' }]}>
                <Text style={styles.funnelLabel}>Purchases</Text>
                <Text style={styles.funnelValue}>15.2K</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚨 Alerts</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {alerts.map(alert => (
            <TouchableOpacity key={alert.id} style={styles.alertCard}>
              <View style={[styles.alertIcon, { backgroundColor: alert.color + '20' }]}>
                <Text style={styles.alertIconText}>{alert.icon}</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <TouchableOpacity style={styles.alertAction}>
                <Text style={styles.alertActionText}>›</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* FX Snapshot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💱 Currency Snapshot</Text>
          <View style={styles.fxContainer}>
            <View style={styles.fxRow}>
              <Text style={styles.fxLabel}>Local Currency</Text>
              <Text style={styles.fxValue}>EUR (Euro)</Text>
            </View>
            <View style={styles.fxRow}>
              <Text style={styles.fxLabel}>Top Shopper Currency</Text>
              <Text style={styles.fxValue}>USD (+34% of sales)</Text>
            </View>
            <View style={styles.fxRow}>
              <Text style={styles.fxLabel}>FX Impact</Text>
              <Text style={[styles.fxValue, { color: '#34C759' }]}>+€2.1K this week</Text>
            </View>
          </View>
        </View>

        {/* Language Mix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Language Mix</Text>
          <View style={styles.languageMix}>
            <View style={styles.languageBar}>
              <View style={[styles.languageSegment, { width: '45%', backgroundColor: '#D4AF37' }]} />
              <View style={[styles.languageSegment, { width: '25%', backgroundColor: '#4ECDC4' }]} />
              <View style={[styles.languageSegment, { width: '15%', backgroundColor: '#FF9500' }]} />
              <View style={[styles.languageSegment, { width: '10%', backgroundColor: '#BB8FCE' }]} />
              <View style={[styles.languageSegment, { width: '5%', backgroundColor: '#F1948A' }]} />
            </View>
            <View style={styles.languageLabels}>
              <Text style={styles.languageLabel}>🇬🇧 English 45%</Text>
              <Text style={styles.languageLabel}>🇩🇪 Deutsch 25%</Text>
              <Text style={styles.languageLabel}>🇫🇷 Français 15%</Text>
              <Text style={styles.languageLabel}>🇪🇸 Español 10%</Text>
              <Text style={styles.languageLabel}>🇮🇹 Italiano 5%</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/business/content')}
            >
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionText}>Create Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/business/orders')}
            >
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionText}>Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/business/growth')}
            >
              <Text style={styles.quickActionIcon}>📈</Text>
              <Text style={styles.quickActionText}>Boost Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/live-commerce')}
            >
              <Text style={styles.quickActionIcon}>🔴</Text>
              <Text style={styles.quickActionText}>Go Live</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    fontSize: 32,
    color: '#D4AF37',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  businessInfo: {
    alignItems: 'center',
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllButton: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  timeFilterActive: {
    backgroundColor: '#D4AF37',
  },
  timeFilterText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  timeFilterActiveText: {
    color: '#000000',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  kpiCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiIcon: {
    fontSize: 20,
  },
  changeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  funnelChart: {
    paddingHorizontal: 20,
  },
  funnelStep: {
    marginBottom: 12,
  },
  funnelBar: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  funnelLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  funnelValue: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 18,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertMessage: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
  },
  alertTime: {
    color: '#999999',
    fontSize: 12,
  },
  alertAction: {
    padding: 8,
  },
  alertActionText: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '300',
  },
  fxContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  fxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fxLabel: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  fxValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  languageMix: {
    paddingHorizontal: 20,
  },
  languageBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  languageSegment: {
    height: '100%',
  },
  languageLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageLabel: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});