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

interface LoyaltyStatus {
  user_id: string;
  points: number;
  tier: string;
  lifetime_points: number;
  cashback_earned: number;
  tier_progress: number;
  next_tier_points: number;
  next_tier: string | null;
  tier_benefits: string[];
  multiplier: number;
}

interface LoyaltyTier {
  tier: string;
  min_points: number;
  benefits: string[];
  multiplier: number;
}

interface RewardItem {
  id: string;
  name: string;
  points_required: number;
  value: number | string;
  category: string;
  availability: string;
}

export default function LoyaltyDashboard() {
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
  const userId = 'demo_user_001';

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      
      // Fetch loyalty status
      const statusResponse = await fetch(`${backendUrl}/api/loyalty/user/${userId}/loyalty`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setLoyaltyStatus(statusData);
      }

      // Fetch tiers
      const tiersResponse = await fetch(`${backendUrl}/api/loyalty/tiers`);
      if (tiersResponse.ok) {
        const tiersData = await tiersResponse.json();
        setTiers(tiersData.tier_progression || []);
      }

      // Fetch rewards catalog
      const rewardsResponse = await fetch(`${backendUrl}/api/loyalty/rewards-catalog`);
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setRewards(rewardsData.catalog || []);
      }

    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      Alert.alert('Error', 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoyaltyData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const earnPoints = async (points: number, activity: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/loyalty/user/${userId}/earn-points?points=${points}&activity=${encodeURIComponent(activity)}`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          '🎉 Points Earned!',
          `You earned ${points} points for ${activity}!${result.tier_upgraded ? `\n\nCongratulations! You've been upgraded to ${result.current_tier.toUpperCase()}!` : ''}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
        fetchLoyaltyData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to earn points');
    }
  };

  const redeemPoints = async (reward: RewardItem) => {
    if (!loyaltyStatus || loyaltyStatus.points < reward.points_required) {
      Alert.alert('Insufficient Points', `You need ${reward.points_required} points to redeem this reward.`);
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem "${reward.name}" for ${reward.points_required} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              const response = await fetch(`${backendUrl}/api/loyalty/user/${userId}/redeem-points?points=${reward.points_required}&reward=${encodeURIComponent(reward.name)}&reward_value=${typeof reward.value === 'number' ? reward.value : 10}`, {
                method: 'POST',
              });

              if (response.ok) {
                Alert.alert('🎊 Success!', `${reward.name} has been redeemed successfully!`);
                fetchLoyaltyData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to redeem reward');
            }
          }
        }
      ]
    );
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#D4AF37';
      case 'platinum': return '#E5E4E2';
      default: return '#666666';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '👑';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading Loyalty Dashboard...</Text>
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
          <Text style={styles.headerTitle}>Loyalty Program</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Current Status */}
        {loyaltyStatus && (
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>💎 Your Status</Text>
            <View style={[styles.statusCard, { borderColor: getTierColor(loyaltyStatus.tier) }]}>
              <View style={styles.statusHeader}>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierIcon}>{getTierIcon(loyaltyStatus.tier)}</Text>
                  <Text style={[styles.tierName, { color: getTierColor(loyaltyStatus.tier) }]}>
                    {loyaltyStatus.tier.toUpperCase()} MEMBER
                  </Text>
                </View>
                <Text style={styles.multiplier}>×{loyaltyStatus.multiplier} MULTIPLIER</Text>
              </View>

              <View style={styles.pointsSection}>
                <Text style={styles.currentPoints}>{loyaltyStatus.points.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>Available Points</Text>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>
                  Progress to {loyaltyStatus.next_tier || 'Max Tier'}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${loyaltyStatus.tier_progress}%`,
                        backgroundColor: getTierColor(loyaltyStatus.tier)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {loyaltyStatus.next_tier_points > 0 
                    ? `${loyaltyStatus.next_tier_points} points to go` 
                    : 'Maximum tier reached!'}
                </Text>
              </View>

              <Text style={styles.lifetimePoints}>
                💰 ${loyaltyStatus.cashback_earned.toFixed(2)} total cashback earned
              </Text>
            </View>
          </View>
        )}

        {/* Tier Benefits */}
        {loyaltyStatus && (
          <View style={styles.benefitsContainer}>
            <Text style={styles.sectionTitle}>🎁 Your Benefits</Text>
            <View style={styles.benefitsCard}>
              {loyaltyStatus.tier_benefits.map((benefit, index) => (
                <Text key={index} style={styles.benefitText}>• {benefit}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => earnPoints(50, 'Daily check-in bonus')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionTitle}>Daily Check-in</Text>
              <Text style={styles.actionSubtitle}>+50 points</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => earnPoints(100, 'Share product review')}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionTitle}>Write Review</Text>
              <Text style={styles.actionSubtitle}>+100 points</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => earnPoints(25, 'Social media share')}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionTitle}>Share Product</Text>
              <Text style={styles.actionSubtitle}>+25 points</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => earnPoints(200, 'Complete purchase')}
            >
              <Text style={styles.actionIcon}>🛒</Text>
              <Text style={styles.actionTitle}>Make Purchase</Text>
              <Text style={styles.actionSubtitle}>+200 points</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rewards Catalog */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.sectionTitle}>🏆 Rewards Catalog</Text>
          {rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardCategory}>{reward.category.toUpperCase()}</Text>
                <Text style={styles.rewardValue}>
                  Value: {typeof reward.value === 'number' ? `$${reward.value}` : reward.value}
                </Text>
              </View>
              
              <View style={styles.rewardAction}>
                <Text style={styles.rewardPoints}>{reward.points_required} pts</Text>
                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    (!loyaltyStatus || loyaltyStatus.points < reward.points_required) && styles.redeemButtonDisabled
                  ]}
                  onPress={() => redeemPoints(reward)}
                  disabled={!loyaltyStatus || loyaltyStatus.points < reward.points_required}
                >
                  <Text style={[
                    styles.redeemButtonText,
                    (!loyaltyStatus || loyaltyStatus.points < reward.points_required) && styles.redeemButtonTextDisabled
                  ]}>
                    Redeem
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Tier Progression */}
        <View style={styles.tiersContainer}>
          <Text style={styles.sectionTitle}>📈 Tier Progression</Text>
          {tiers.map((tier) => (
            <View 
              key={tier.tier} 
              style={[
                styles.tierCard,
                loyaltyStatus?.tier === tier.tier && styles.currentTierCard
              ]}
            >
              <View style={styles.tierHeader}>
                <Text style={styles.tierCardIcon}>{getTierIcon(tier.tier)}</Text>
                <Text style={[styles.tierCardName, { color: getTierColor(tier.tier) }]}>
                  {tier.tier.toUpperCase()}
                </Text>
                {loyaltyStatus?.tier === tier.tier && (
                  <Text style={styles.currentBadge}>CURRENT</Text>
                )}
              </View>
              
              <Text style={styles.tierRequirement}>
                {tier.min_points.toLocaleString()}+ points required
              </Text>
              
              <View style={styles.tierBenefits}>
                {tier.benefits.map((benefit, index) => (
                  <Text key={index} style={styles.tierBenefit}>• {benefit}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#D4AF37', fontSize: 16, marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333333' },
  backButton: { padding: 8 },
  backButtonText: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  headerRight: { width: 40 },
  statusContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  statusCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, borderWidth: 2 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tierInfo: { flexDirection: 'row', alignItems: 'center' },
  tierIcon: { fontSize: 24, marginRight: 8 },
  tierName: { fontSize: 16, fontWeight: 'bold' },
  multiplier: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  pointsSection: { alignItems: 'center', marginBottom: 20 },
  currentPoints: { color: '#D4AF37', fontSize: 32, fontWeight: 'bold' },
  pointsLabel: { color: '#CCCCCC', fontSize: 14, marginTop: 4 },
  progressSection: { marginBottom: 16 },
  progressLabel: { color: '#CCCCCC', fontSize: 14, marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#333333', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { color: '#CCCCCC', fontSize: 12, textAlign: 'center' },
  lifetimePoints: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  benefitsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  benefitsCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333333' },
  benefitText: { color: '#CCCCCC', fontSize: 14, marginBottom: 8 },
  actionsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, width: '48%', marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  actionSubtitle: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  rewardsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  rewardCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  rewardInfo: { flex: 1 },
  rewardName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  rewardCategory: { color: '#D4AF37', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  rewardValue: { color: '#CCCCCC', fontSize: 12 },
  rewardAction: { alignItems: 'center' },
  rewardPoints: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  redeemButton: { backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  redeemButtonDisabled: { backgroundColor: '#666666' },
  redeemButtonText: { color: '#000000', fontSize: 12, fontWeight: 'bold' },
  redeemButtonTextDisabled: { color: '#CCCCCC' },
  tiersContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  tierCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333333' },
  currentTierCard: { borderColor: '#D4AF37', borderWidth: 2 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tierCardIcon: { fontSize: 20, marginRight: 8 },
  tierCardName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  currentBadge: { backgroundColor: '#D4AF37', color: '#000000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontSize: 10, fontWeight: 'bold' },
  tierRequirement: { color: '#CCCCCC', fontSize: 13, marginBottom: 8 },
  tierBenefits: {},
  tierBenefit: { color: '#CCCCCC', fontSize: 12, marginBottom: 4 }
});