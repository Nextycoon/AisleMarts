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
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  target: number;
  reward: string;
  points: number;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

export default function ChallengesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');

  const challenges: Challenge[] = [
    // Daily Challenges
    {
      id: 'd1',
      title: 'Daily Login',
      description: 'Open the app for 3 consecutive days',
      icon: '📱',
      type: 'daily',
      progress: 2,
      target: 3,
      reward: 'Points',
      points: 100,
      timeLeft: '18h 32m',
      difficulty: 'easy',
      completed: false,
    },
    {
      id: 'd2',
      title: 'Social Butterfly',
      description: 'Like 10 posts and write 2 reviews',
      icon: '🦋',
      type: 'daily',
      progress: 7,
      target: 12,
      reward: 'Spin Token',
      points: 75,
      timeLeft: '18h 32m',
      difficulty: 'medium',
      completed: false,
    },
    {
      id: 'd3',
      title: 'Window Shopper',
      description: 'Browse 5 different categories',
      icon: '🛍️',
      type: 'daily',
      progress: 5,
      target: 5,
      reward: 'Points',
      points: 50,
      timeLeft: '18h 32m',
      difficulty: 'easy',
      completed: true,
    },

    // Weekly Challenges
    {
      id: 'w1',
      title: 'Fashion Forward',
      description: 'Purchase 3 items from Fashion category',
      icon: '👗',
      type: 'weekly',
      progress: 1,
      target: 3,
      reward: '10% Coupon',
      points: 300,
      timeLeft: '4d 12h',
      difficulty: 'medium',
      completed: false,
    },
    {
      id: 'w2',
      title: 'Review Master',
      description: 'Write 15 helpful reviews',
      icon: '✍️',
      type: 'weekly',
      progress: 8,
      target: 15,
      reward: 'Free Shipping',
      points: 250,
      timeLeft: '4d 12h',
      difficulty: 'hard',
      completed: false,
    },
    {
      id: 'w3',
      title: 'Streak Keeper',
      description: 'Maintain 7-day login streak',
      icon: '🔥',
      type: 'weekly',
      progress: 4,
      target: 7,
      reward: 'Premium Badge',
      points: 500,
      timeLeft: '4d 12h',
      difficulty: 'medium',
      completed: false,
    },

    // Special Challenges
    {
      id: 's1',
      title: 'Holiday Shopper',
      description: 'Make 5 purchases during holiday season',
      icon: '🎄',
      type: 'special',
      progress: 2,
      target: 5,
      reward: 'Mystery Box',
      points: 1000,
      timeLeft: '12d 5h',
      difficulty: 'medium',
      completed: false,
    },
    {
      id: 's2',
      title: 'Influencer',
      description: 'Get 50 likes on your review photos',
      icon: '📸',
      type: 'special',
      progress: 23,
      target: 50,
      reward: 'VIP Status',
      points: 750,
      timeLeft: '20d 14h',
      difficulty: 'hard',
      completed: false,
    },
  ];

  const filteredChallenges = challenges.filter(challenge => challenge.type === activeTab);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#CCCCCC';
    }
  };

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  const handleClaimReward = (challengeId: string) => {
    console.log('Claiming reward for challenge:', challengeId);
    // Handle reward claiming logic here
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Challenges</Text>
          <TouchableOpacity onPress={() => router.push('/rewards/history')}>
            <Text style={styles.historyButton}>🏆</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Info */}
        <View style={styles.infoSection}>
          <Text style={styles.mainTitle}>🎯 Complete Challenges</Text>
          <Text style={styles.subtitle}>
            Earn points, badges, and exclusive rewards by completing daily, weekly, and special challenges!
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(['daily', 'weekly', 'special'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {challenges.filter(c => c.type === tab && !c.completed).length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Challenges List */}
        <View style={styles.challengesSection}>
          {filteredChallenges.map((challenge) => (
            <View
              key={challenge.id}
              style={[
                styles.challengeCard,
                challenge.completed && styles.completedCard
              ]}
            >
              
              {/* Challenge Header */}
              <View style={styles.challengeHeader}>
                <View style={styles.challengeIconContainer}>
                  <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <View style={styles.challengeMeta}>
                  <View 
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(challenge.difficulty) }
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {challenge.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {challenge.progress} / {challenge.target}
                  </Text>
                  <Text style={styles.timeLeft}>⏰ {challenge.timeLeft}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { width: `${getProgressPercentage(challenge.progress, challenge.target)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round(getProgressPercentage(challenge.progress, challenge.target))}%
                  </Text>
                </View>
              </View>

              {/* Reward Section */}
              <View style={styles.rewardSection}>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardLabel}>Reward:</Text>
                  <Text style={styles.rewardText}>{challenge.reward}</Text>
                  <Text style={styles.rewardPoints}>+{challenge.points} pts</Text>
                </View>
                
                {challenge.completed ? (
                  <TouchableOpacity 
                    style={styles.claimButton}
                    onPress={() => handleClaimReward(challenge.id)}
                  >
                    <Text style={styles.claimButtonText}>CLAIM</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.progressButton}>
                    <Text style={styles.progressButtonText}>
                      {Math.round(getProgressPercentage(challenge.progress, challenge.target))}%
                    </Text>
                  </View>
                )}
              </View>

              {/* Completion Badge */}
              {challenge.completed && (
                <View style={styles.completionBadge}>
                  <Text style={styles.completionText}>✓ COMPLETED</Text>
                </View>
              )}

            </View>
          ))}
        </View>

        {/* Achievement Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statNumber}>
                {challenges.filter(c => c.completed).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statNumber}>
                {challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0)}
              </Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statNumber}>
                {challenges.filter(c => !c.completed).length}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginRight: 8,
  },
  activeTabText: {
    color: '#D4AF37',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  challengesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  challengeCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  completedCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeIcon: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  challengeMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeLeft: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    minWidth: 35,
  },
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rewardPoints: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  claimButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  progressButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  completionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});