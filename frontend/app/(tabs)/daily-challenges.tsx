import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  current_progress: number;
  reward_coins: number;
  reward_points: number;
  status: string;
  difficulty: string;
  category: string;
  ai_generated: boolean;
  ai_personalization_score: number;
  expires_at: string;
}

interface UserProgress {
  level: number;
  total_coins: number;
  total_points: number;
  daily_streak: number;
  completed_challenges: string[];
  spin_tokens: number;
}

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
  const userId = 'demo_user_001';

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user progress
      const progressResponse = await fetch(`${backendUrl}/api/gamification/user/${userId}/progress`);
      const progressData = await progressResponse.json();
      setUserProgress(progressData);
      
      // Fetch daily challenges
      const challengesResponse = await fetch(`${backendUrl}/api/gamification/user/${userId}/challenges`);
      const challengesData = await challengesResponse.json();
      setChallenges(challengesData);
      
    } catch (error) {
      console.error('Error fetching challenges data:', error);
      Alert.alert('Error', 'Failed to load challenges data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateAIChallenges = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/gamification/user/${userId}/challenges/generate?count=3`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const newChallenges = await response.json();
        setChallenges(prev => [...prev, ...newChallenges]);
        Alert.alert('🤖 AI Challenges Generated!', `Generated ${newChallenges.length} personalized challenges for you!`);
      } else {
        Alert.alert('Error', 'Failed to generate AI challenges');
      }
    } catch (error) {
      console.error('Error generating AI challenges:', error);
      Alert.alert('Error', 'Failed to generate AI challenges');
    }
  };

  const updateProgress = async (challengeId: string, increment: number = 1) => {
    if (updating) return;
    
    setUpdating(challengeId);
    
    try {
      const response = await fetch(`${backendUrl}/api/gamification/user/${userId}/challenges/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge_id: challengeId,
          progress_increment: increment
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update challenge in state
        setChallenges(prev => prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, current_progress: result.current_progress || challenge.target_value, status: result.challenge_completed ? 'completed' : challenge.status }
            : challenge
        ));
        
        // Update user progress
        if (result.challenge_completed) {
          setUserProgress(prev => prev ? {
            ...prev,
            total_coins: prev.total_coins + result.coins_earned,
            total_points: prev.total_points + result.points_earned,
            completed_challenges: [...prev.completed_challenges, challengeId]
          } : null);
          
          Alert.alert(
            '🎉 Challenge Complete!',
            `Congratulations! You earned ${result.coins_earned} coins and ${result.points_earned} points!${result.achievements_unlocked?.length ? `\n\nNew achievements unlocked: ${result.achievements_unlocked.length}` : ''}`,
            [{ text: 'Awesome!', style: 'default' }]
          );
        }
      } else {
        Alert.alert('Error', 'Failed to update challenge progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update challenge progress');
    } finally {
      setUpdating(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FFA500';
      case 'hard': return '#FF5722';
      case 'expert': return '#9C27B0';
      default: return '#666666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shopping': return '🛍️';
      case 'social': return '👥';
      case 'discovery': return '🔍';
      case 'loyalty': return '💎';
      case 'engagement': return '💝';
      default: return '🎯';
    }
  };

  const getProgressPercentage = (challenge: Challenge) => {
    return Math.min((challenge.current_progress / challenge.target_value) * 100, 100);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading Daily Challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Challenges</Text>
          <TouchableOpacity onPress={generateAIChallenges} style={styles.aiButton}>
            <Text style={styles.aiButtonText}>🤖 AI</Text>
          </TouchableOpacity>
        </View>

        {/* User Progress Summary */}
        {userProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.sectionTitle}>🏆 Your Progress</Text>
            <View style={styles.progressGrid}>
              <View style={styles.progressCard}>
                <Text style={styles.progressValue}>{userProgress.level}</Text>
                <Text style={styles.progressLabel}>Level</Text>
              </View>
              <View style={styles.progressCard}>
                <Text style={styles.progressValue}>{userProgress.daily_streak}</Text>
                <Text style={styles.progressLabel}>Daily Streak</Text>
              </View>
              <View style={styles.progressCard}>
                <Text style={styles.progressValue}>{userProgress.total_coins.toLocaleString()}</Text>
                <Text style={styles.progressLabel}>Coins</Text>
              </View>
              <View style={styles.progressCard}>
                <Text style={styles.progressValue}>{userProgress.spin_tokens}</Text>
                <Text style={styles.progressLabel}>Spin Tokens</Text>
              </View>
            </View>
          </View>
        )}

        {/* Active Challenges */}
        <View style={styles.challengesContainer}>
          <Text style={styles.sectionTitle}>🎯 Today's Challenges</Text>
          
          {challenges.filter(c => c.status === 'active').length === 0 ? (
            <View style={styles.emptyChallenges}>
              <Text style={styles.emptyTitle}>No Active Challenges</Text>
              <Text style={styles.emptyText}>Generate new AI-powered challenges to start earning rewards!</Text>
              <TouchableOpacity onPress={generateAIChallenges} style={styles.generateButton}>
                <Text style={styles.generateButtonText}>🤖 Generate AI Challenges</Text>
              </TouchableOpacity>
            </View>
          ) : (
            challenges
              .filter(challenge => challenge.status === 'active')
              .map((challenge) => (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeTitleRow}>
                      <Text style={styles.categoryIcon}>{getCategoryIcon(challenge.category)}</Text>
                      <View style={styles.challengeTitleContainer}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <View style={styles.challengeMeta}>
                          {challenge.ai_generated && (
                            <Text style={styles.aiTag}>🤖 AI GENERATED</Text>
                          )}
                          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                            <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.timeRemaining}>{getTimeRemaining(challenge.expires_at)}</Text>
                  </View>
                  
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  
                  <View style={styles.progressSection}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressText}>
                        {challenge.current_progress}/{challenge.target_value}
                      </Text>
                      <Text style={styles.progressPercentage}>
                        {getProgressPercentage(challenge).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[styles.progressBar, { width: `${getProgressPercentage(challenge)}%` }]} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.rewardsSection}>
                    <View style={styles.rewards}>
                      {challenge.reward_coins > 0 && (
                        <Text style={styles.rewardText}>🪙 {challenge.reward_coins} coins</Text>
                      )}
                      {challenge.reward_points > 0 && (
                        <Text style={styles.rewardText}>💎 {challenge.reward_points} points</Text>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        updating === challenge.id && styles.actionButtonDisabled
                      ]}
                      onPress={() => updateProgress(challenge.id)}
                      disabled={updating === challenge.id}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        updating === challenge.id && styles.actionButtonTextDisabled
                      ]}>
                        {updating === challenge.id ? 'Updating...' : 'Mark Progress'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
        </View>

        {/* Completed Challenges */}
        {challenges.filter(c => c.status === 'completed').length > 0 && (
          <View style={styles.completedContainer}>
            <Text style={styles.sectionTitle}>✅ Completed Today</Text>
            {challenges
              .filter(challenge => challenge.status === 'completed')
              .map((challenge) => (
                <View key={challenge.id} style={styles.completedCard}>
                  <Text style={styles.categoryIcon}>{getCategoryIcon(challenge.category)}</Text>
                  <View style={styles.completedInfo}>
                    <Text style={styles.completedTitle}>{challenge.title}</Text>
                    <View style={styles.completedRewards}>
                      {challenge.reward_coins > 0 && (
                        <Text style={styles.completedReward}>+{challenge.reward_coins} coins</Text>
                      )}
                      {challenge.reward_points > 0 && (
                        <Text style={styles.completedReward}>+{challenge.reward_points} points</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.completedIcon}>✅</Text>
                </View>
              ))}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>💡 Challenge Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>• Complete daily challenges to maintain your streak</Text>
            <Text style={styles.tipText}>• AI-generated challenges are personalized to your behavior</Text>
            <Text style={styles.tipText}>• Higher difficulty challenges offer better rewards</Text>
            <Text style={styles.tipText}>• Use earned coins to spin the reward wheel</Text>
            <Text style={styles.tipText}>• Challenges reset every 24 hours</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
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
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  aiButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressValue: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    textAlign: 'center',
  },
  challengesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyChallenges: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  generateButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  challengeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  challengeTitleContainer: {
    flex: 1,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiTag: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  timeRemaining: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  rewardsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewards: {
    flexDirection: 'row',
    gap: 16,
  },
  rewardText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionButtonDisabled: {
    backgroundColor: '#666666',
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtonTextDisabled: {
    color: '#CCCCCC',
  },
  completedContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  completedCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  completedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  completedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  completedRewards: {
    flexDirection: 'row',
    gap: 12,
  },
  completedReward: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  completedIcon: {
    fontSize: 24,
    marginLeft: 12,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tipCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tipText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
});