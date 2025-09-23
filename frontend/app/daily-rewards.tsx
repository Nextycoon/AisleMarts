import React, { useState, useEffect, useRef } from 'react';
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
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface DailyReward {
  day: number;
  reward: string;
  points: number;
  claimed: boolean;
  available: boolean;
}

export default function DailyRewardsScreen() {
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(3);
  const [showClaimedAnimation, setShowClaimedAnimation] = useState(false);
  const [claimedReward, setClaimedReward] = useState<DailyReward | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const dailyRewards: DailyReward[] = [
    { day: 1, reward: '🎁', points: 50, claimed: true, available: false },
    { day: 2, reward: '💰', points: 75, claimed: true, available: false },
    { day: 3, reward: '🎯', points: 100, claimed: false, available: true },
    { day: 4, reward: '⭐', points: 125, claimed: false, available: false },
    { day: 5, reward: '💎', points: 150, claimed: false, available: false },
    { day: 6, reward: '🚀', points: 200, claimed: false, available: false },
    { day: 7, reward: '🏆', points: 500, claimed: false, available: false },
  ];

  const handleClaimReward = (reward: DailyReward) => {
    if (!reward.available) return;

    setClaimedReward(reward);
    setShowClaimedAnimation(true);

    // Animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.5,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        delay: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowClaimedAnimation(false);
      scaleAnim.setValue(1);
      fadeAnim.setValue(0);
      
      // Update the reward state
      reward.claimed = true;
      reward.available = false;
      
      // Move to next day if not already at the end
      if (currentDay < 7) {
        setCurrentDay(currentDay + 1);
        if (currentDay + 1 <= dailyRewards.length) {
          dailyRewards[currentDay].available = true;
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Rewards</Text>
          <TouchableOpacity onPress={() => router.push('/loyalty-dashboard')}>
            <Text style={styles.loyaltyButton}>👑</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Info */}
        <View style={styles.infoSection}>
          <Text style={styles.mainTitle}>🎁 Daily Check-in Rewards</Text>
          <Text style={styles.subtitle}>
            Claim your daily reward to build your streak and earn bonus points!
          </Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>Current Streak: {currentDay - 1} days</Text>
          </View>
        </View>

        {/* Weekly Calendar */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>This Week's Rewards</Text>
          <View style={styles.daysGrid}>
            {dailyRewards.map((reward) => (
              <TouchableOpacity
                key={reward.day}
                style={[
                  styles.dayCard,
                  reward.claimed && styles.claimedDayCard,
                  reward.available && styles.availableDayCard,
                ]}
                onPress={() => handleClaimReward(reward)}
                disabled={!reward.available}
                activeOpacity={reward.available ? 0.7 : 1}
              >
                <Text style={styles.dayNumber}>Day {reward.day}</Text>
                <Text style={styles.rewardIcon}>{reward.reward}</Text>
                <Text style={styles.rewardPoints}>+{reward.points}</Text>
                <Text style={styles.rewardLabel}>points</Text>
                
                {reward.claimed && (
                  <View style={styles.claimedBadge}>
                    <Text style={styles.claimedText}>✓</Text>
                  </View>
                )}
                
                {reward.available && (
                  <View style={styles.availablePulse}>
                    <Text style={styles.availableText}>CLAIM</Text>
                  </View>
                )}
                
                {reward.day === 7 && (
                  <View style={styles.bonusBadge}>
                    <Text style={styles.bonusText}>BONUS</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bonus Challenges */}
        <View style={styles.bonusSection}>
          <Text style={styles.sectionTitle}>Bonus Challenges</Text>
          <View style={styles.challengesList}>
            
            <TouchableOpacity style={styles.challengeCard}>
              <View style={styles.challengeIcon}>
                <Text style={styles.challengeIconText}>🛍️</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>Make a Purchase</Text>
                <Text style={styles.challengeSubtitle}>Earn 2x points on your next order</Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.challengePoints}>+200</Text>
                <Text style={styles.challengeLabel}>bonus</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.challengeCard}>
              <View style={styles.challengeIcon}>
                <Text style={styles.challengeIconText}>✍️</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>Write 3 Reviews</Text>
                <Text style={styles.challengeSubtitle}>Help other shoppers decide</Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.challengePoints}>+150</Text>
                <Text style={styles.challengeLabel}>points</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.challengeCard}>
              <View style={styles.challengeIcon}>
                <Text style={styles.challengeIconText}>👥</Text>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>Refer a Friend</Text>
                <Text style={styles.challengeSubtitle}>Both get 1000 points</Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.challengePoints}>+1000</Text>
                <Text style={styles.challengeLabel}>each</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* Streak Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Streak Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>7️⃣</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>7-Day Streak</Text>
                <Text style={styles.benefitSubtitle}>500 bonus points + special badge</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🗓️</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>30-Day Streak</Text>
                <Text style={styles.benefitSubtitle}>Free premium membership for 1 month</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💯</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>100-Day Streak</Text>
                <Text style={styles.benefitSubtitle}>Exclusive VIP status + mystery gift</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Claimed Animation Overlay */}
      {showClaimedAnimation && claimedReward && (
        <View style={styles.animationOverlay}>
          <Animated.View 
            style={[
              styles.animationContainer,
              { 
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={styles.animationReward}>{claimedReward.reward}</Text>
            <Text style={styles.animationText}>+{claimedReward.points} Points!</Text>
            <Text style={styles.animationSubtext}>Reward Claimed!</Text>
          </Animated.View>
        </View>
      )}

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
  loyaltyButton: {
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
    marginBottom: 16,
    lineHeight: 20,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  calendarSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCard: {
    width: '13%',
    aspectRatio: 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  claimedDayCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  availableDayCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  dayNumber: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rewardLabel: {
    fontSize: 8,
    color: '#CCCCCC',
  },
  claimedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  availablePulse: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  availableText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#000000',
  },
  bonusBadge: {
    position: 'absolute',
    top: -8,
    left: -2,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bonusText: {
    fontSize: 6,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bonusSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  challengesList: {
    gap: 12,
  },
  challengeCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeIconText: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  challengeReward: {
    alignItems: 'flex-end',
  },
  challengePoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
  },
  challengeLabel: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  animationContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  animationReward: {
    fontSize: 80,
    marginBottom: 16,
  },
  animationText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
  },
  animationSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
});