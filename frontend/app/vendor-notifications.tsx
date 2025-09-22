import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  type: 'lead' | 'sale' | 'content' | 'system' | 'ai_insight';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
}

interface NotificationSettings {
  leads: boolean;
  sales: boolean;
  contentPerformance: boolean;
  aiInsights: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export default function VendorNotificationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'lead',
      title: '🎯 New Qualified Lead',
      message: 'Sarah Johnson (92% match) interested in iPhone 15 Pro Max. Estimated value: $1,299',
      timestamp: '2 minutes ago',
      read: false,
      priority: 'urgent',
      data: { leadId: 'lead_1', value: 1299 }
    },
    {
      id: '2',
      type: 'sale',
      title: '💰 Sale Completed',
      message: 'Mike Chen purchased Winter Coat Collection for $250. CLP conversion successful!',
      timestamp: '15 minutes ago',
      read: false,
      priority: 'high',
      data: { orderId: 'order_123', amount: 250 }
    },
    {
      id: '3',
      type: 'ai_insight',
      title: '🤖 AI Performance Insight',
      message: 'Your video content performs 34% better at 7:30 PM. Schedule next post for optimal reach.',
      timestamp: '1 hour ago',
      read: false,
      priority: 'medium',
      data: { insight: 'posting_time', impact: 'high' }
    },
    {
      id: '4',
      type: 'content',
      title: '📹 Content Milestone',
      message: 'Your "iPhone Review" video reached 10K views! Generated 156 leads and $4,200 revenue.',
      timestamp: '3 hours ago',
      read: true,
      priority: 'high',
      data: { contentId: 'video_1', views: 10000, revenue: 4200 }
    },
    {
      id: '5',
      type: 'system',
      title: '🚀 CLP + PPL System Update',
      message: 'New AI lead qualification improvements deployed. 23% better accuracy expected.',
      timestamp: '6 hours ago',
      read: true,
      priority: 'medium',
      data: { updateVersion: '2.1.0' }
    },
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    leads: true,
    sales: true,
    contentPerformance: true,
    aiInsights: true,
    systemUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const tabs = [
    { id: 'all', name: 'All', count: notifications.length },
    { id: 'unread', name: 'Unread', count: notifications.filter(n => !n.read).length },
    { id: 'leads', name: 'Leads', count: notifications.filter(n => n.type === 'lead').length },
    { id: 'sales', name: 'Sales', count: notifications.filter(n => n.type === 'sale').length },
    { id: 'ai', name: 'AI Insights', count: notifications.filter(n => n.type === 'ai_insight').length },
  ];

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread': return !notification.read;
      case 'leads': return notification.type === 'lead';
      case 'sales': return notification.type === 'sale';
      case 'ai': return notification.type === 'ai_insight';
      default: return true;
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead': return '🎯';
      case 'sale': return '💰';
      case 'content': return '📹';
      case 'ai_insight': return '🤖';
      case 'system': return '🚀';
      default: return '📱';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'lead':
        router.push('/vendor-lead-manager');
        break;
      case 'sale':
        router.push('/vendor-dashboard-clp');
        break;
      case 'content':
        router.push('/vendor-analytics');
        break;
      case 'ai_insight':
        router.push('/vendor-content-creator');
        break;
      default:
        break;
    }
  };

  const renderNotification = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIconContainer}>
          <Text style={styles.notificationIcon}>{getNotificationIcon(notification.type)}</Text>
          {!notification.read && (
            <View style={styles.unreadDot} />
          )}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
        </View>
        <View style={styles.notificationActions}>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(notification.priority) + '20' }
          ]}>
            <Text style={[
              styles.priorityText,
              { color: getPriorityColor(notification.priority) }
            ]}>
              {notification.priority.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteNotification(notification.id)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>Notification Preferences</Text>
      
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Content & Performance</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>New Qualified Leads</Text>
          <Switch
            value={settings.leads}
            onValueChange={(value) => setSettings({...settings, leads: value})}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ECDC4' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sales & Conversions</Text>
          <Switch
            value={settings.sales}
            onValueChange={(value) => setSettings({...settings, sales: value})}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ECDC4' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Content Performance</Text>
          <Switch
            value={settings.contentPerformance}
            onValueChange={(value) => setSettings({...settings, contentPerformance: value})}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ECDC4' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>AI Insights & Tips</Text>
          <Switch
            value={settings.aiInsights}
            onValueChange={(value) => setSettings({...settings, aiInsights: value})}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ECDC4' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Delivery Methods</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={settings.pushNotifications}
            onValueChange={(value) => setSettings({...settings, pushNotifications: value})}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ECDC4' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email Notifications</Text>
          <Switch
            value={settings.emailNotifications}
            onValueChange={(value) => setSettings({...settings, emailNotifications: value})}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ECDC4' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS Notifications</Text>
          <Switch
            value={settings.smsNotifications}
            onValueChange={(value) => setSettings({...settings, smsNotifications: value})}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#4ECDC4' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Real-time CLP + PPL Updates</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {!showSettings && (
        <>
          {/* Action Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Text style={styles.markAllButtonText}>Mark All Read</Text>
            </TouchableOpacity>
            <Text style={styles.notificationCount}>
              {notifications.filter(n => !n.read).length} unread
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tabsRow}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.tabButton,
                      activeTab === tab.id && styles.activeTab
                    ]}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <Text style={[
                      styles.tabButtonText,
                      activeTab === tab.id && styles.activeTabText
                    ]}>
                      {tab.name} ({tab.count})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.notificationsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.notificationsContent}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(renderNotification)
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>🔔</Text>
                  <Text style={styles.emptyStateTitle}>No Notifications</Text>
                  <Text style={styles.emptyStateText}>
                    You're all caught up! New notifications will appear here.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </>
      )}

      {showSettings && renderSettings()}
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  markAllButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllButtonText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  tabsContainer: {
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
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  tabButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(78, 205, 196, 0.05)',
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
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
  notificationMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  notificationActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
});