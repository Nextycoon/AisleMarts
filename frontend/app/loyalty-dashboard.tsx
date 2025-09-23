import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface LoyaltyTier {
  id: string;
  name: string;
  color: string;
  icon: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
}

interface UserProgress {
  currentPoints: number;
  totalEarned: number;
  currentTier: string;
  nextTier: string | null;
  pointsToNextTier: number;
  streakDays: number;
  totalPurchases: number;
  referrals: number;
}

export default function LoyaltyDashboard() {
  const router = useRouter();
  const [progress] = useState<UserProgress>({
    currentPoints: 8450,
    totalEarned: 25670,
    currentTier: 'gold',
    nextTier: 'platinum',
    pointsToNextTier: 1550,
    streakDays: 12,
    totalPurchases: 47,
    referrals: 8,
  });

  const loyaltyTiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'Bronze Explorer',
      color: '#CD7F32',
      icon: '🥉',
      minPoints: 0,
      maxPoints: 2499,
      benefits: ['5% cashback', 'Monthly newsletter', 'Birthday surprise'],
    },
    {
      id: 'silver',
      name: 'Silver Shopper',
      color: '#C0C0C0',
      icon: '🥈',
      minPoints: 2500,
      maxPoints: 4999,
      benefits: ['10% cashback', 'Free shipping', 'Early sale access', 'Priority support'],
    },
    {
      id: 'gold',
      name: 'Gold VIP',
      color: '#FFD700',
      icon: '🥇',
      minPoints: 5000,
      maxPoints: 9999,
      benefits: ['15% cashback', 'Express shipping', 'Exclusive products', 'Personal shopper', 'VIP events'],
    },
    {
      id: 'platinum',
      name: 'Platinum Elite',
      color: '#E5E4E2',
      icon: '💎',
      minPoints: 10000,
      maxPoints: null,
      benefits: ['20% cashback', 'Same-day delivery', 'Luxury concierge', 'Private sales', 'Annual gifts', 'Beta features'],
    },
  ];

  const currentTierData = loyaltyTiers.find(tier => tier.id === progress.currentTier);
  const nextTierData = progress.nextTier ? loyaltyTiers.find(tier => tier.id === progress.nextTier) : null;

  const progressPercentage = currentTierData && nextTierData 
    ? ((progress.currentPoints - currentTierData.minPoints) / (nextTierData.minPoints - currentTierData.minPoints)) * 100
    : currentTierData && !nextTierData ? 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loyalty Rewards</Text>
          <TouchableOpacity onPress={() => router.push('/rewards/history')}>
            <Text style={styles.historyButton}>📊</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Current Status Card */}
        <View style={[styles.statusCard, { borderColor: currentTierData?.color }]}>
          <View style={styles.statusHeader}>
            <View style={styles.tierInfo}>
              <Text style={styles.tierIcon}>{currentTierData?.icon}</Text>
              <View>
                <Text style={styles.tierName}>{currentTierData?.name}</Text>
                <Text style={styles.pointsText}>{progress.currentPoints.toLocaleString()} points</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.dailyRewardButton} onPress={() => router.push('/daily-rewards')}>
              <Text style={styles.dailyRewardIcon}>🎁</Text>
              <Text style={styles.dailyRewardText}>Daily\nReward</Text>
            </TouchableOpacity>
          </View>

          {/* Progress to Next Tier */}
          {nextTierData && (
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>
                {progress.pointsToNextTier.toLocaleString()} points to {nextTierData.name}
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${progressPercentage}%`, backgroundColor: currentTierData?.color }
                    ]} 
                  />
                </View>
                <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumber}>{progress.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🛍️</Text>
            <Text style={styles.statNumber}>{progress.totalPurchases}</Text>
            <Text style={styles.statLabel}>Purchases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>{progress.referrals}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statNumber}>{Math.floor(progress.totalEarned / 1000)}K</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Earn More Points</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/spin-wheel')}
            >
              <Text style={styles.actionIcon}>🎰</Text>
              <Text style={styles.actionTitle}>Spin & Win</Text>
              <Text style={styles.actionSubtitle}>Up to 500 pts</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/challenges')}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionTitle}>Challenges</Text>
              <Text style={styles.actionSubtitle}>Weekly tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/referrals')}
            >
              <Text style={styles.actionIcon}>💌</Text>
              <Text style={styles.actionTitle}>Refer Friends</Text>
              <Text style={styles.actionSubtitle}>1000 pts each</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/reviews')}
            >
              <Text style={styles.actionIcon}>✍️</Text>
              <Text style={styles.actionTitle}>Write Reviews</Text>
              <Text style={styles.actionSubtitle}>50 pts each</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tier Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Your {currentTierData?.name} Benefits</Text>
          <View style={styles.benefitsList}>
            {currentTierData?.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* All Tiers Preview */}
        <View style={styles.tiersSection}>
          <Text style={styles.sectionTitle}>All Loyalty Tiers</Text>
          {loyaltyTiers.map((tier) => (
            <View 
              key={tier.id} 
              style={[
                styles.tierCard, 
                { borderColor: tier.color },
                progress.currentTier === tier.id && styles.currentTierCard
              ]}
            >
              <View style={styles.tierHeader}>
                <Text style={styles.tierCardIcon}>{tier.icon}</Text>
                <View style={styles.tierCardInfo}>
                  <Text style={styles.tierCardName}>{tier.name}</Text>
                  <Text style={styles.tierCardPoints}>
                    {tier.minPoints.toLocaleString()}{tier.maxPoints ? ` - ${tier.maxPoints.toLocaleString()}` : '+'} points
                  </Text>
                </View>
                {progress.currentTier === tier.id && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
              </View>
              <View style={styles.tierBenefits}>
                {tier.benefits.slice(0, 3).map((benefit, index) => (
                  <Text key={index} style={styles.tierBenefit}>• {benefit}</Text>
                ))}
                {tier.benefits.length > 3 && (
                  <Text style={styles.tierBenefit}>• +{tier.benefits.length - 3} more benefits</Text>
                )}
              </View>
            </View>
          ))}
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
  statusCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderRadius: 16,
    margin: 20,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  dailyRewardButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dailyRewardIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  dailyRewardText: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: '600',
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 16,
  },
  progressTitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    minWidth: 35,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#D4AF37',
    textAlign: 'center',
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  benefitsList: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  tiersSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  tierCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  currentTierCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tierCardInfo: {
    flex: 1,
  },
  tierCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tierCardPoints: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  currentBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  tierBenefits: {
    paddingLeft: 36,
  },
  tierBenefit: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});