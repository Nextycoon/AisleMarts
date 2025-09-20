import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'teen' | 'adult';
  age?: number;
  avatar: string;
  isOnline: boolean;
  safetyScore: number;
  screenTimeToday: number;
  spendingToday: number;
  budgetLimit: number;
}

interface FamilyInsight {
  id: string;
  type: 'achievement' | 'warning' | 'tip' | 'celebration';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

interface FamilyActivity {
  id: string;
  memberId: string;
  memberName: string;
  type: 'purchase' | 'screen_time' | 'badge_earned' | 'limit_exceeded';
  description: string;
  timestamp: string;
  amount?: number;
}

export default function FamilyDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'insights' | 'activity'>('overview');

  const familyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Mom (Sarah)',
      role: 'parent',
      age: 42,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=150',
      isOnline: true,
      safetyScore: 95,
      screenTimeToday: 180, // 3 hours
      spendingToday: 45.50,
      budgetLimit: 200,
    },
    {
      id: '2',
      name: 'Dad (Michael)',
      role: 'parent',
      age: 45,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isOnline: false,
      safetyScore: 88,
      screenTimeToday: 120, // 2 hours
      spendingToday: 0,
      budgetLimit: 150,
    },
    {
      id: '3',
      name: 'Emma (Teen)',
      role: 'teen',
      age: 16,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      isOnline: true,
      safetyScore: 92,
      screenTimeToday: 165, // 2h 45m
      spendingToday: 25.00,
      budgetLimit: 50,
    },
    {
      id: '4',
      name: 'Alex (Teen)',
      role: 'teen',
      age: 14,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isOnline: true,
      safetyScore: 85,
      screenTimeToday: 210, // 3h 30m (exceeded)
      spendingToday: 15.75,
      budgetLimit: 40,
    },
  ];

  const familyInsights: FamilyInsight[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'Family Screen Time Goal Achieved',
      description: 'Everyone stayed under their daily screen time limits for 5 days in a row!',
      icon: '🎯',
      priority: 'high',
      actionRequired: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Alex Exceeded Screen Time',
      description: 'Alex has used 3h 30m today (limit: 3h). Consider a break reminder.',
      icon: '⚠️',
      priority: 'medium',
      actionRequired: true,
    },
    {
      id: '3',
      type: 'tip',
      title: 'Family Savings Opportunity',
      description: 'Price comparison saved your family $127 this month!',
      icon: '💰',
      priority: 'low',
      actionRequired: false,
    },
    {
      id: '4',
      type: 'celebration',
      title: 'Emma Earned Safety Badge',
      description: 'Emma completed the "Smart Shopper" challenge by comparing prices on 10 products.',
      icon: '🏆',
      priority: 'medium',
      actionRequired: false,
    },
  ];

  const familyActivity: FamilyActivity[] = [
    {
      id: '1',
      memberId: '3',
      memberName: 'Emma',
      type: 'badge_earned',
      description: 'earned Smart Shopper badge',
      timestamp: '30 min ago',
    },
    {
      id: '2',
      memberId: '1',
      memberName: 'Mom',
      type: 'purchase',
      description: 'approved Alex\'s purchase request',
      timestamp: '1h ago',
      amount: 15.75,
    },
    {
      id: '3',
      memberId: '4',
      memberName: 'Alex',
      type: 'limit_exceeded',
      description: 'exceeded daily screen time limit',
      timestamp: '2h ago',
    },
    {
      id: '4',
      memberId: '2',
      memberName: 'Dad',
      type: 'screen_time',
      description: 'took a healthy break after 2 hours',
      timestamp: '3h ago',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderFamilyOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Family Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>91</Text>
          <Text style={styles.statLabel}>Family Safety Score</Text>
          <Text style={styles.statTrend}>+3 this week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>€86.25</Text>
          <Text style={styles.statLabel}>Total Spending Today</Text>
          <Text style={styles.statTrend}>Under budget</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>11h 15m</Text>
          <Text style={styles.statLabel}>Family Screen Time</Text>
          <Text style={styles.statTrend}>Within limits</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/family/screen-time')}
          >
            <Text style={styles.quickActionIcon}>⏰</Text>
            <Text style={styles.quickActionText}>Screen Time</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/family/budget')}
          >
            <Text style={styles.quickActionIcon}>💰</Text>
            <Text style={styles.quickActionText}>Budgets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/family/badges')}
          >
            <Text style={styles.quickActionIcon}>🏆</Text>
            <Text style={styles.quickActionText}>Badges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/family/settings')}
          >
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Insights */}
      <View style={styles.topInsightsContainer}>
        <Text style={styles.sectionTitle}>Family Insights</Text>
        {familyInsights.slice(0, 2).map((insight) => (
          <TouchableOpacity key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
            {insight.actionRequired && (
              <View style={styles.actionRequiredBadge}>
                <Text style={styles.actionRequiredText}>!</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFamilyMembers = () => (
    <View style={styles.membersContainer}>
      {familyMembers.map((member) => (
        <TouchableOpacity
          key={member.id}
          style={styles.memberCard}
          onPress={() => router.push(`/family/member/${member.id}`)}
        >
          <View style={styles.memberHeader}>
            <View style={styles.memberAvatarContainer}>
              <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
              {member.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.memberBasicInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>
                {member.role === 'parent' ? '👑 Parent' : 
                 member.role === 'teen' ? '👤 Teen' : '👤 Adult'}
                {member.age && ` • ${member.age} years`}
              </Text>
            </View>
            <View style={styles.safetyScoreContainer}>
              <Text style={styles.safetyScore}>{member.safetyScore}</Text>
              <Text style={styles.safetyScoreLabel}>Safety</Text>
            </View>
          </View>

          <View style={styles.memberStats}>
            <View style={styles.memberStat}>
              <Text style={styles.memberStatLabel}>Screen Time</Text>
              <Text style={[
                styles.memberStatValue,
                member.screenTimeToday > (member.role === 'teen' ? 180 : 300) && styles.memberStatExceeded
              ]}>
                {Math.floor(member.screenTimeToday / 60)}h {member.screenTimeToday % 60}m
              </Text>
            </View>
            <View style={styles.memberStatDivider} />
            <View style={styles.memberStat}>
              <Text style={styles.memberStatLabel}>Spending</Text>
              <Text style={styles.memberStatValue}>€{member.spendingToday.toFixed(2)}</Text>
            </View>
            <View style={styles.memberStatDivider} />
            <View style={styles.memberStat}>
              <Text style={styles.memberStatLabel}>Budget Left</Text>
              <Text style={styles.memberStatValue}>
                €{(member.budgetLimit - member.spendingToday).toFixed(2)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInsights = () => (
    <View style={styles.insightsContainer}>
      {familyInsights.map((insight) => (
        <TouchableOpacity key={insight.id} style={styles.insightCard}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
          <View style={styles.insightContent}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: 
                  insight.priority === 'high' ? '#FF3B30' :
                  insight.priority === 'medium' ? '#FF9500' : '#34C759'
                }
              ]}>
                <Text style={styles.priorityText}>
                  {insight.priority.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
          {insight.actionRequired && (
            <View style={styles.actionRequiredBadge}>
              <Text style={styles.actionRequiredText}>!</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActivity = () => (
    <View style={styles.activityContainer}>
      {familyActivity.map((activity) => (
        <View key={activity.id} style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Text style={styles.activityIconText}>
              {activity.type === 'purchase' ? '💳' :
               activity.type === 'screen_time' ? '⏰' :
               activity.type === 'badge_earned' ? '🏆' : '⚠️'}
            </Text>
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>
              <Text style={styles.activityMember}>{activity.memberName}</Text>
              {' '}
              {activity.description}
              {activity.amount && ` (€${activity.amount.toFixed(2)})`}
            </Text>
            <Text style={styles.activityTime}>{activity.timestamp}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/family/invite')}>
          <Text style={styles.inviteButton}>👥+</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'members', label: 'Members' },
          { key: 'insights', label: 'Insights' },
          { key: 'activity', label: 'Activity' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderFamilyOverview()}
        {activeTab === 'members' && renderFamilyMembers()}
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'activity' && renderActivity()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
  },
  backButton: {
    fontSize: 32,
    color: '#0066CC',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  inviteButton: {
    fontSize: 20,
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#0066CC',
  },
  tabButtonText: {
    color: '#8E95A3',
    fontSize: 12,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E95A3',
    textAlign: 'center',
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 10,
    color: '#34C759',
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2C3E50',
    textAlign: 'center',
  },
  topInsightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionRequiredBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRequiredText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  membersContainer: {
    padding: 20,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberBasicInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#8E95A3',
  },
  safetyScoreContainer: {
    alignItems: 'center',
  },
  safetyScore: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066CC',
  },
  safetyScoreLabel: {
    fontSize: 10,
    color: '#8E95A3',
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberStat: {
    flex: 1,
    alignItems: 'center',
  },
  memberStatLabel: {
    fontSize: 12,
    color: '#8E95A3',
    marginBottom: 4,
  },
  memberStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  memberStatExceeded: {
    color: '#FF3B30',
  },
  memberStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E6F3FF',
    marginHorizontal: 12,
  },
  insightsContainer: {
    padding: 20,
  },
  activityContainer: {
    padding: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  activityMember: {
    fontWeight: '600',
    color: '#0066CC',
  },
  activityTime: {
    fontSize: 12,
    color: '#8E95A3',
  },
  bottomSpacing: {
    height: 20,
  },
});