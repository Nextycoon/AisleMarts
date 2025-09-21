import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';
import { RewardsAPI, NotificationPreferences } from '../lib/RewardsAPI';

interface NotificationItem {
  type: string;
  title: string;
  body: string;
  ts: string;
  cta?: string;
  status?: string;
}

const mockNotifications: Record<string, NotificationItem[]> = {
  system: [
    {
      type: 'notice',
      title: 'Policy Update',
      body: 'Updated vendor rules effective next week.',
      ts: '2025-09-20T08:04:00Z'
    },
    {
      type: 'kyc',
      title: 'KYC Required',
      body: 'Verify identity to enable withdrawals.',
      ts: '2025-09-19T14:30:00Z',
      cta: 'Verify Now'
    },
    {
      type: 'security',
      title: 'Security Alert',
      body: 'New login detected from unknown device.',
      ts: '2025-09-18T22:15:00Z',
      cta: 'Review'
    }
  ],
  transactions: [
    {
      type: 'payout',
      title: 'Payout Processing',
      body: 'Your AisleCoins withdrawal is being processed.',
      ts: '2025-09-20T10:15:00Z',
      status: 'in_progress'
    },
    {
      type: 'order',
      title: 'Order Settled',
      body: 'Weekly missions updated. Check Rewards Dashboard.',
      ts: '2025-09-20T09:30:00Z',
      cta: 'View Rewards'
    },
    {
      type: 'refund',
      title: 'Refund Processed',
      body: 'Your refund of $45.99 has been processed.',
      ts: '2025-09-19T16:45:00Z'
    }
  ],
  campaigns: [
    {
      type: 'campaign',
      title: 'BlueWave Competition',
      body: "You're entered! Winners announced Friday.",
      ts: '2025-09-20T12:00:00Z',
      cta: 'See Details'
    },
    {
      type: 'bonus',
      title: 'Streak Bonus Unlocked',
      body: '7-day selling streak—Vendor Star +1!',
      ts: '2025-09-19T18:20:00Z',
      cta: 'View Ledger'
    },
    {
      type: 'seasonal',
      title: 'Winter Sale Campaign',
      body: 'Join our winter sale and earn 2x BlueWave Points!',
      ts: '2025-09-18T09:00:00Z',
      cta: 'Join Now'
    }
  ],
  activity: [
    {
      type: 'follow',
      title: 'New Follower',
      body: '@NovaBrands started following you.',
      ts: '2025-09-20T11:45:00Z'
    },
    {
      type: 'coupon',
      title: 'Cashback Received',
      body: '$5 Cashback credited for yesterday\'s sales.',
      ts: '2025-09-20T08:30:00Z',
      cta: 'View Wallet'
    },
    {
      type: 'mention',
      title: 'Mentioned in Comment',
      body: '@FashionLover mentioned you in a comment.',
      ts: '2025-09-19T20:10:00Z',
      cta: 'View Comment'
    }
  ]
};

export default function NotificationCenter() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<string>('system');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    ads_support: true,
    vendor_updates: true,
    publisher_plans: false,
    series_campaigns: true,
    email: true,
    push: true,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const tabs = [
    { key: 'system', label: 'System', icon: '⚙️' },
    { key: 'transactions', label: 'Transactions', icon: '💳' },
    { key: 'campaigns', label: 'Campaigns', icon: '🎯' },
    { key: 'activity', label: 'Activity', icon: '🔔' },
  ];

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await RewardsAPI.getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Load preferences error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      setSavingPrefs(true);
      const newPrefs = { ...preferences, [key]: value };
      setPreferences(newPrefs);
      
      await RewardsAPI.setNotificationPreferences(newPrefs);
    } catch (error) {
      console.error('Update preference error:', error);
      Alert.alert('Error', 'Failed to update notification preference');
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSavingPrefs(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotificationPreferences();
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string): string => {
    const icons: Record<string, string> = {
      notice: '📋',
      kyc: '🆔',
      security: '🔒',
      payout: '💰',
      order: '📦',
      refund: '💸',
      campaign: '🏆',
      bonus: '⭐',
      seasonal: '❄️',
      follow: '👤',
      coupon: '🎫',
      mention: '💬',
    };
    return icons[type] || '🔔';
  };

  const renderNotificationItem = (item: NotificationItem, index: number) => (
    <View key={index} style={styles.notificationItem}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <Text style={styles.notificationTime}>{formatTime(item.ts)}</Text>
        </View>
        {item.status && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'in_progress' ? '#FF9500' : '#34C759' }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'in_progress' ? 'Processing' : 'Complete'}
            </Text>
          </View>
        )}
      </View>
      {item.cta && (
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>{item.cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPreferenceToggle = (
    key: keyof NotificationPreferences,
    label: string,
    description: string
  ) => (
    <View key={key} style={styles.preferenceItem}>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={preferences[key]}
        onValueChange={(value) => updatePreference(key, value)}
        trackColor={{ false: '#3A3A3C', true: '#0066CC' }}
        thumbColor={preferences[key] ? '#FFFFFF' : '#FFFFFF'}
        disabled={savingPrefs}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
        <TabNavigator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.preferencesContainer}>
            {renderPreferenceToggle(
              'ads_support',
              'Ads Support',
              'Notifications about advertising opportunities and promotions'
            )}
            {renderPreferenceToggle(
              'vendor_updates',
              'Vendor Marketplace Updates',
              'Updates about marketplace features and vendor tools'
            )}
            {renderPreferenceToggle(
              'publisher_plans',
              'Publisher Plans',
              'Information about publisher subscription plans and benefits'
            )}
            {renderPreferenceToggle(
              'series_campaigns',
              'Series & Campaigns',
              'Notifications about seasonal campaigns and special events'
            )}
            {renderPreferenceToggle(
              'email',
              'Email Notifications',
              'Receive notifications via email'
            )}
            {renderPreferenceToggle(
              'push',
              'Push Notifications',
              'Receive push notifications on your device'
            )}
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tabs.find(t => t.key === activeTab)?.label} Notifications
          </Text>
          <View style={styles.notificationsContainer}>
            {mockNotifications[activeTab]?.length > 0 ? (
              mockNotifications[activeTab].map((item, index) => 
                renderNotificationItem(item, index)
              )
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔔</Text>
                <Text style={styles.emptyStateTitle}>No notifications</Text>
                <Text style={styles.emptyStateText}>
                  You're all caught up! No new notifications in this category.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {savingPrefs && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color="#0066CC" />
          <Text style={styles.savingText}>Saving preferences...</Text>
        </View>
      )}

      <TabNavigator />
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
  },
  loadingText: {
    color: '#FFFFFF',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabScrollContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: '#0066CC',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferencesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  preferenceContent: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 16,
  },
  notificationsContainer: {
    gap: 12,
  },
  notificationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationTime: {
    color: '#666666',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  savingOverlay: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 8,
  },
});