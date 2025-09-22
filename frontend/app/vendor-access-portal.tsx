import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface VendorQuickStats {
  totalRevenue: number;
  pendingLeads: number;
  activeProducts: number;
  conversionRate: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  badge?: number;
  color: string[];
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'sale' | 'content' | 'insight';
  title: string;
  description: string;
  timestamp: string;
  value?: number;
}

export default function VendorAccessPortalScreen() {
  const router = useRouter();
  const [isVendor, setIsVendor] = useState(true); // In real app, check user auth/roles

  const [quickStats] = useState<VendorQuickStats>({
    totalRevenue: 89340,
    pendingLeads: 23,
    activeProducts: 42,
    conversionRate: 18.7,
  });

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'CLP + PPL Dashboard',
      description: 'View revenue, leads & analytics',
      icon: '📊',
      route: '/vendor-dashboard-clp',
      color: ['#4ECDC4', '#44A08D'],
    },
    {
      id: '2',
      title: 'Create Content',
      description: 'AI-powered content creator',
      icon: '📹',
      route: '/vendor-content-creator',
      color: ['#FF6B6B', '#FF8E8E'],
    },
    {
      id: '3',
      title: 'Manage Leads',
      description: 'PPL lead management system',
      icon: '🎯',
      route: '/vendor-lead-manager',
      badge: quickStats.pendingLeads,
      color: ['#FFE66D', '#FFCC02'],
    },
    {
      id: '4',
      title: 'Marketplace',
      description: 'Product listings & integration',
      icon: '🛍️',
      route: '/vendor-marketplace-integration',
      color: ['#A8E6CF', '#7FCDCD'],
    },
    {
      id: '5',
      title: 'Analytics',
      description: 'Deep business intelligence',
      icon: '📈',
      route: '/vendor-analytics',
      color: ['#DDA0DD', '#DA70D6'],
    },
    {
      id: '6',
      title: 'Notifications',
      description: 'Real-time updates & alerts',
      icon: '🔔',
      route: '/vendor-notifications',
      badge: 5,
      color: ['#87CEEB', '#4682B4'],
    },
  ];

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'lead',
      title: 'New Qualified Lead',
      description: 'Sarah Johnson interested in iPhone 15 Pro Max',
      timestamp: '5 minutes ago',
      value: 1299,
    },
    {
      id: '2',
      type: 'sale',
      title: 'Sale Completed',
      description: 'Winter coat purchase via CLP content',
      timestamp: '32 minutes ago',
      value: 299,
    },
    {
      id: '3',
      type: 'insight',
      title: 'AI Performance Insight',
      description: 'Video content performs 34% better at 7:30 PM',
      timestamp: '2 hours ago',
    },
    {
      id: '4',
      type: 'content',
      title: 'Content Milestone',
      description: 'iPhone review video reached 10K views',
      timestamp: '4 hours ago',
    },
  ]);

  const becomeVendor = () => {
    Alert.alert(
      'Become a Vendor',
      'Ready to start selling with 0% commission and keep 100% of your revenue?',
      [
        { text: 'Learn More', onPress: () => router.push('/vendor-onboarding') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead': return '🎯';
      case 'sale': return '💰';
      case 'content': return '📹';
      case 'insight': return '🤖';
      default: return '📱';
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

  if (!isVendor) {
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
            <Text style={styles.headerTitle}>Vendor Portal</Text>
            <Text style={styles.headerSubtitle}>Start selling with AisleMarts</Text>
          </View>
        </View>

        {/* Become Vendor CTA */}
        <View style={styles.becomeVendorContainer}>
          <View style={styles.becomeVendorCard}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
              style={styles.becomeVendorGradient}
            >
              <Text style={styles.becomeVendorTitle}>🚀 Become an AisleMarts Vendor</Text>
              <Text style={styles.becomeVendorSubtitle}>
                Join the world's first 0% commission marketplace
              </Text>
              
              <View style={styles.becomeVendorBenefits}>
                <View style={styles.benefit}>
                  <Text style={styles.benefitIcon}>💰</Text>
                  <Text style={styles.benefitText}>Keep 100% Revenue</Text>
                </View>
                <View style={styles.benefit}>
                  <Text style={styles.benefitIcon}>🎯</Text>
                  <Text style={styles.benefitText}>Pay Only for Results</Text>
                </View>
                <View style={styles.benefit}>
                  <Text style={styles.benefitIcon}>🤖</Text>
                  <Text style={styles.benefitText}>AI-Powered Tools</Text>
                </View>
                <View style={styles.benefit}>
                  <Text style={styles.benefitIcon}>🌍</Text>
                  <Text style={styles.benefitText}>Global Reach</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.becomeVendorButton} onPress={becomeVendor}>
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.becomeVendorButtonGradient}
                >
                  <Text style={styles.becomeVendorButtonText}>🎁 Start Free Trial</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresPreview}>
            <Text style={styles.featuresTitle}>What You'll Get</Text>
            <View style={styles.featuresList}>
              {[
                { icon: '📊', title: 'CLP + PPL Dashboard', desc: 'Real-time revenue & lead tracking' },
                { icon: '📹', title: 'AI Content Creator', desc: 'Generate high-converting content' },
                { icon: '🎯', title: 'Smart Lead Manager', desc: 'Only pay for qualified buyers' },
                { icon: '📈', title: 'Advanced Analytics', desc: 'Deep business intelligence' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Vendor Portal</Text>
          <Text style={styles.headerSubtitle}>CLP + PPL Command Center</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/vendor-notifications')}
        >
          <Text style={styles.profileButtonText}>🔔</Text>
          {quickStats.pendingLeads > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{quickStats.pendingLeads}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.quickStatsCard}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
            style={styles.quickStatsGradient}
          >
            <Text style={styles.quickStatsTitle}>💎 Today's Performance</Text>
            <View style={styles.quickStatsGrid}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{formatCurrency(quickStats.totalRevenue)}</Text>
                <Text style={styles.quickStatLabel}>Total Revenue</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{quickStats.pendingLeads}</Text>
                <Text style={styles.quickStatLabel}>Pending Leads</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{quickStats.activeProducts}</Text>
                <Text style={styles.quickStatLabel}>Active Products</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>{quickStats.conversionRate}%</Text>
                <Text style={styles.quickStatLabel}>Conversion</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
              >
                <LinearGradient
                  colors={action.color}
                  style={styles.quickActionGradient}
                >
                  <View style={styles.quickActionHeader}>
                    <Text style={styles.quickActionIcon}>{action.icon}</Text>
                    {action.badge && (
                      <View style={styles.actionBadge}>
                        <Text style={styles.actionBadgeText}>{action.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityIcon}>{getActivityIcon(activity.type)}</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
                </View>
                {activity.value && (
                  <Text style={styles.activityValue}>{formatCurrency(activity.value)}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* CLP + PPL Explainer */}
        <View style={styles.section}>
          <View style={styles.explainerCard}>
            <LinearGradient
              colors={['rgba(78, 205, 196, 0.1)', 'rgba(78, 205, 196, 0.05)']}
              style={styles.explainerGradient}
            >
              <Text style={styles.explainerTitle}>⚡ CLP + PPL = Your Success</Text>
              <View style={styles.explainerContent}>
                <View style={styles.explainerItem}>
                  <Text style={styles.explainerIcon}>📈</Text>
                  <View style={styles.explainerText}>
                    <Text style={styles.explainerLabel}>Content Lead Purchase (CLP)</Text>
                    <Text style={styles.explainerDesc}>Every post, video, live stream = direct sales</Text>
                  </View>
                </View>
                <View style={styles.explainerItem}>
                  <Text style={styles.explainerIcon}>🎯</Text>
                  <View style={styles.explainerText}>
                    <Text style={styles.explainerLabel}>Pay Per Lead (PPL)</Text>
                    <Text style={styles.explainerDesc}>Only pay for AI-qualified buyers</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Success Stories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Success Stories</Text>
          <View style={styles.successStories}>
            {[
              { name: 'Tech Guru Emma', savings: 15200, increase: 34 },
              { name: 'Fashion Forward Co.', savings: 28400, increase: 67 },
              { name: 'Gadget Master Pro', savings: 9800, increase: 23 },
            ].map((story, index) => (
              <View key={index} style={styles.successStoryItem}>
                <Text style={styles.successStoryName}>{story.name}</Text>
                <Text style={styles.successStorySavings}>
                  Saved ${story.savings.toLocaleString()}/month
                </Text>
                <Text style={styles.successStoryIncrease}>
                  {story.increase}% revenue increase
                </Text>
              </View>
            ))}
          </View>
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileButtonText: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickStatsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
  },
  quickStatsGradient: {
    padding: 20,
  },
  quickStatsTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickStatLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    minHeight: 120,
  },
  quickActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  actionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickActionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    lineHeight: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  activityTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  activityValue: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '700',
  },
  explainerCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  explainerGradient: {
    padding: 20,
  },
  explainerTitle: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  explainerContent: {
    gap: 16,
  },
  explainerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  explainerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  explainerText: {
    flex: 1,
  },
  explainerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  explainerDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  successStories: {
    gap: 12,
  },
  successStoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  successStoryName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  successStorySavings: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  successStoryIncrease: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  // Become Vendor Styles
  becomeVendorContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  becomeVendorCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  becomeVendorGradient: {
    padding: 24,
    alignItems: 'center',
  },
  becomeVendorTitle: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  becomeVendorSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  becomeVendorBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  benefit: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  becomeVendorButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  becomeVendorButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  becomeVendorButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  featuresPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});