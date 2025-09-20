import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface UsageData {
  app: string;
  minutes: number;
  category: 'shopping' | 'education' | 'social' | 'entertainment';
  color: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  progress: number;
  description: string;
}

export default function ScreenTimeWellbeingScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [animatedValue] = useState(new Animated.Value(0));

  const todayUsage: UsageData[] = [
    { app: 'AisleMarts Shopping', minutes: 45, category: 'shopping', color: '#0066CC' },
    { app: 'Learning Hub', minutes: 30, category: 'education', color: '#4A90E2' },
    { app: 'Family Chat', minutes: 25, category: 'social', color: '#7B68EE' },
    { app: 'Videos', minutes: 60, category: 'entertainment', color: '#87CEEB' },
  ];

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Sleep Hours',
      icon: '💤',
      earned: true,
      progress: 100,
      description: '8+ hours sleep for 7 days',
    },
    {
      id: '2',
      name: 'Screen Time',
      icon: '⏱️',
      earned: false,
      progress: 75,
      description: 'Stay under daily limit',
    },
    {
      id: '3',
      name: 'Digital Wellbeing',
      icon: '📱',
      earned: false,
      progress: 60,
      description: 'Take regular breaks',
    },
    {
      id: '4',
      name: 'Safety Tools',
      icon: '🛡️',
      earned: true,
      progress: 100,
      description: 'Use all safety features',
    },
    {
      id: '5',
      name: 'Family Trust',
      icon: '🏠',
      earned: false,
      progress: 85,
      description: 'Build family connection',
    },
  ];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const totalMinutes = todayUsage.reduce((sum, item) => sum + item.minutes, 0);
  const maxUsage = Math.max(...todayUsage.map(item => item.minutes));

  const renderUsageBar = (item: UsageData, index: number) => {
    const percentage = (item.minutes / maxUsage) * 100;
    
    return (
      <Animated.View
        key={item.app}
        style={[
          styles.usageBar,
          {
            opacity: animatedValue,
            transform: [{
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-width, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.usageBarInfo}>
          <Text style={styles.appName}>{item.app}</Text>
          <Text style={styles.usageTime}>{item.minutes}m</Text>
        </View>
        <View style={styles.barContainer}>
          <Animated.View
            style={[
              styles.bar,
              {
                backgroundColor: item.color,
                width: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${percentage}%`],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  };

  const renderBadge = (badge: Badge) => (
    <TouchableOpacity
      key={badge.id}
      style={[
        styles.badgeCard,
        badge.earned && styles.badgeEarned,
      ]}
      onPress={() => router.push(`/family/badge/${badge.id}`)}
    >
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <Text style={styles.badgeName}>{badge.name}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${badge.progress}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{badge.progress}%</Text>
      </View>
      {badge.earned && (
        <View style={styles.earnedBadge}>
          <Text style={styles.earnedText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Screen Time & Wellbeing</Text>
        <TouchableOpacity onPress={() => router.push('/family/settings')}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Screen Time</Text>
          <Text style={styles.totalTime}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</Text>
          <Text style={styles.summarySubtitle}>
            {totalMinutes < 120 ? '✅ Great job staying under your limit!' :
             totalMinutes < 180 ? '⚠️ Close to your daily limit' :
             '❌ Over your daily limit'}
          </Text>
        </View>

        {/* Usage Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Usage Breakdown</Text>
          <View style={styles.usageChart}>
            {todayUsage.map((item, index) => renderUsageBar(item, index))}
          </View>
        </View>

        {/* Wellbeing Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellbeing Insights</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>🎯</Text>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Smart Spending</Text>
                <Text style={styles.insightDescription}>
                  You've saved $45 this week by comparing prices
                </Text>
              </View>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>🛡️</Text>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Safety Score</Text>
                <Text style={styles.insightDescription}>
                  100% of your purchases were from verified sellers
                </Text>
              </View>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>📚</Text>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Learning Time</Text>
                <Text style={styles.insightDescription}>
                  30 minutes spent on educational content today
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badges & Missions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges & Missions</Text>
            <TouchableOpacity onPress={() => router.push('/family/missions')}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesGrid}>
            {badges.map(renderBadge)}
          </View>
        </View>

        {/* Break Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Break Reminders</Text>
          <View style={styles.reminderCard}>
            <Text style={styles.reminderIcon}>⏰</Text>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Take a 5-minute break</Text>
              <Text style={styles.reminderDescription}>
                You've been shopping for 45 minutes. Time for a quick break!
              </Text>
            </View>
            <TouchableOpacity style={styles.reminderButton}>
              <Text style={styles.reminderButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Family Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Connection</Text>
          <TouchableOpacity 
            style={styles.familyCard}
            onPress={() => router.push('/family/dashboard')}
          >
            <Text style={styles.familyIcon}>👨‍👩‍👧‍👦</Text>
            <View style={styles.familyContent}>
              <Text style={styles.familyTitle}>Connect with Family</Text>
              <Text style={styles.familyDescription}>
                Share your progress and see how your family is doing
              </Text>
            </View>
            <Text style={styles.familyArrow}>›</Text>
          </TouchableOpacity>
        </View>

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
  settingsButton: {
    fontSize: 20,
    color: '#8E95A3',
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  periodButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E95A3',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E95A3',
    marginBottom: 8,
  },
  totalTime: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066CC',
  },
  usageChart: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  usageBar: {
    marginBottom: 16,
  },
  usageBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  usageTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#E6F3FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  badgeCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    position: 'relative',
  },
  badgeEarned: {
    borderColor: '#4A90E2',
    backgroundColor: '#E6F3FF',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E6F3FF',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066CC',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E95A3',
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  reminderIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  reminderButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reminderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  familyIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  familyContent: {
    flex: 1,
  },
  familyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  familyDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  familyArrow: {
    fontSize: 24,
    color: '#0066CC',
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 100,
  },
});