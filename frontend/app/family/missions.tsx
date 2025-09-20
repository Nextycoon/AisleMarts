import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

interface Mission {
  id: string;
  badge_name: string;
  icon: string;
  title: string;
  description: string;
  progress: number;
  max_progress: number;
  earned: boolean;
  requirements: string[];
  reward_points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function BadgesMissionsScreen() {
  const router = useRouter();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [animatedValues] = useState({
    scale: new Animated.Value(1),
    confetti: new Animated.Value(0),
  });

  const missions: Mission[] = [
    {
      id: 'sleep_hours',
      badge_name: 'Sleep Hours',
      icon: '💤',
      title: 'Get 8+ Hours Sleep',
      description: 'Maintain healthy sleep schedule for 7 consecutive days',
      progress: 7,
      max_progress: 7,
      earned: true,
      requirements: [
        'Sleep for at least 8 hours',
        'Maintain consistent sleep schedule',
        'Complete for 7 consecutive days'
      ],
      reward_points: 150,
      difficulty: 'medium',
    },
    {
      id: 'screen_time',
      badge_name: 'Screen Time',
      icon: '⏱️',
      title: 'Stay Under Daily Limit',
      description: 'Keep screen time under your daily limit for 5 days',
      progress: 3,
      max_progress: 5,
      earned: false,
      requirements: [
        'Stay under 3 hours daily screen time',
        'Take regular breaks every hour',
        'Complete for 5 consecutive days'
      ],
      reward_points: 100,
      difficulty: 'medium',
    },
    {
      id: 'digital_wellbeing',
      badge_name: 'Digital Wellbeing',
      icon: '📱',
      title: 'Take Regular Breaks',
      description: 'Take 5-minute breaks every hour for better wellbeing',
      progress: 12,
      max_progress: 20,
      earned: false,
      requirements: [
        'Take a 5-minute break every hour',
        'Engage in offline activities during breaks',
        'Complete 20 break sessions'
      ],
      reward_points: 80,
      difficulty: 'easy',
    },
    {
      id: 'safety_tools',
      badge_name: 'Safety Tools',
      icon: '🛡️',
      title: 'Use All Safety Features',
      description: 'Enable and use all available family safety features',
      progress: 5,
      max_progress: 5,
      earned: true,
      requirements: [
        'Enable parental controls',
        'Set up spending limits',
        'Use purchase approval system',
        'Enable screen time monitoring',
        'Complete safety tutorial'
      ],
      reward_points: 200,
      difficulty: 'easy',
    },
    {
      id: 'family_trust',
      badge_name: 'Family Trust',
      icon: '🏠',
      title: 'Build Family Connection',
      description: 'Maintain positive family digital relationship',
      progress: 17,
      max_progress: 20,
      earned: false,
      requirements: [
        'Communicate openly about purchases',
        'Follow family spending agreements',
        'Help family members with digital safety',
        'Participate in family digital activities'
      ],
      reward_points: 250,
      difficulty: 'hard',
    },
    {
      id: 'smart_shopper',
      badge_name: 'Smart Shopper',
      icon: '🛒',
      title: 'Make Smart Purchases',
      description: 'Demonstrate responsible shopping habits',
      progress: 8,
      max_progress: 10,
      earned: false,
      requirements: [
        'Compare prices before buying',
        'Read product reviews',
        'Stay within budget limits',
        'Make 10 approved purchases'
      ],
      reward_points: 120,
      difficulty: 'medium',
    },
  ];

  const handleMissionComplete = (mission: Mission) => {
    if (mission.earned) {
      Alert.alert(
        'Badge Already Earned',
        `You've already earned the ${mission.badge_name} badge!`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (mission.progress >= mission.max_progress) {
      // Animate the completion
      Animated.sequence([
        Animated.timing(animatedValues.scale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues.confetti, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Alert.alert(
          '🎉 Badge Earned!',
          `Congratulations! You've earned the ${mission.badge_name} badge and ${mission.reward_points} points!`,
          [
            {
              text: 'Awesome!',
              onPress: () => {
                animatedValues.confetti.setValue(0);
                // Navigate to badge detail or close
              },
            },
          ]
        );
      }, 500);
    } else {
      Alert.alert(
        'Mission In Progress',
        `Keep going! You're ${mission.progress}/${mission.max_progress} of the way to earning the ${mission.badge_name} badge.`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderMissionCard = (mission: Mission) => {
    const progressPercentage = (mission.progress / mission.max_progress) * 100;
    const isComplete = mission.progress >= mission.max_progress;

    return (
      <Animated.View
        key={mission.id}
        style={[
          styles.missionCard,
          mission.earned && styles.missionEarned,
          { transform: [{ scale: animatedValues.scale }] },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleMissionComplete(mission)}
          style={styles.missionContent}
        >
          <View style={styles.missionHeader}>
            <Text style={styles.missionIcon}>{mission.icon}</Text>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionDescription}>{mission.description}</Text>
              <View style={styles.difficultyContainer}>
                <View style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      mission.difficulty === 'easy' ? '#4ECDC4' :
                      mission.difficulty === 'medium' ? '#FFD93D' :
                      '#FF6B6B'
                  }
                ]}>
                  <Text style={styles.difficultyText}>
                    {mission.difficulty.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.rewardPoints}>+{mission.reward_points} pts</Text>
              </View>
            </View>
            {mission.earned && (
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedIcon}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Progress: {mission.progress}/{mission.max_progress}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: mission.earned ? '#4ECDC4' : '#0066CC',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>Requirements:</Text>
            {mission.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={styles.requirementBullet}>•</Text>
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
          </View>

          {isComplete && !mission.earned && (
            <View style={styles.completeButton}>
              <Text style={styles.completeButtonText}>🎉 Tap to Claim Badge!</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const earnedCount = missions.filter(m => m.earned).length;
  const totalPoints = missions.reduce((sum, m) => sum + (m.earned ? m.reward_points : 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Badges & Missions</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{earnedCount}</Text>
          <Text style={styles.statsLabel}>Badges Earned</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{missions.length - earnedCount}</Text>
          <Text style={styles.statsLabel}>In Progress</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{totalPoints}</Text>
          <Text style={styles.statsLabel}>Total Points</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Motivational Message */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationIcon}>🌟</Text>
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>Keep Going!</Text>
            <Text style={styles.motivationText}>
              You're doing great! Complete missions to earn badges and build healthy digital habits.
            </Text>
          </View>
        </View>

        {/* Missions List */}
        <View style={styles.missionsSection}>
          {missions.map(renderMissionCard)}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Confetti Animation Overlay */}
      <Animated.View
        style={[
          styles.confettiOverlay,
          {
            opacity: animatedValues.confetti,
            transform: [
              {
                scale: animatedValues.confetti.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.confettiText}>🎉✨🎊✨🎉</Text>
        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.confettiText}>🎉✨🎊✨🎉</Text>
      </Animated.View>
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
  placeholder: {
    width: 32,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#8E95A3',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  motivationIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  missionsSection: {
    paddingHorizontal: 20,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    elevation: 2,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  missionEarned: {
    borderColor: '#4ECDC4',
    backgroundColor: '#F0FFFF',
  },
  missionContent: {
    padding: 20,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  missionIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  missionDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rewardPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066CC',
  },
  earnedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnedIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E6F3FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  requirementsSection: {
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  requirementBullet: {
    fontSize: 14,
    color: '#0066CC',
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    flex: 1,
    fontSize: 12,
    color: '#8E95A3',
    lineHeight: 18,
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiText: {
    fontSize: 48,
    marginBottom: 16,
  },
  congratsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});