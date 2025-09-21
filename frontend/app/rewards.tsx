import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';
import { RewardsAPI, Balances, Mission, StreakInfo, LedgerEntry } from '../lib/RewardsAPI';

const { width } = Dimensions.get('window');

export default function RewardsDashboard() {
  const router = useRouter();
  
  // State
  const [balances, setBalances] = useState<Balances | null>(null);
  const [perSaleMissions, setPerSaleMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [streaks, setStreaks] = useState<StreakInfo | null>(null);
  const [recentLedger, setRecentLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDashboardData = async () => {
    try {
      const [balancesData, perSaleData, weeklyData, streaksData, ledgerData] = await Promise.all([
        RewardsAPI.getBalances(),
        RewardsAPI.getPerSaleMissions(),
        RewardsAPI.getWeeklyMissions(),
        RewardsAPI.getStreaks(),
        RewardsAPI.getLedger("current_user", 1, 5) // Recent 5 entries
      ]);

      setBalances(balancesData);
      setPerSaleMissions(perSaleData.missions);
      setWeeklyMissions(weeklyData.missions);
      setStreaks(streaksData);
      setRecentLedger(ledgerData.items);
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Error', 'Failed to load rewards data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleWithdraw = async () => {
    Alert.alert(
      'Withdraw AisleCoins',
      'Convert your AisleCoins to real money. Requires KYC verification.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.push('/rewards/withdraw') }
      ]
    );
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const renderStatCard = (title: string, value: number, icon: string, color: string) => (
    <Animated.View 
      style={[styles.statCard, { borderLeftColor: color }]}
      transform={[{ scale: scaleAnim }]}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>
        {formatCurrency(value)}
      </Text>
    </Animated.View>
  );

  const renderProgressRing = (title: string, percentage: number, color: string, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.progressRingContainer} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.progressRing}>
        <View style={[styles.progressRingOuter, { borderColor: color + '20' }]}>
          <View style={[styles.progressRingInner, { borderColor: color }]}>
            <Text style={[styles.progressPercentage, { color }]}>
              {Math.round(percentage)}%
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.progressTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const renderMissionItem = (mission: Mission) => (
    <View key={mission.id} style={styles.missionItem}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionLabel}>{mission.label}</Text>
        <Text style={[
          styles.missionStatus,
          { color: mission.completed ? '#34C759' : '#FF9500' }
        ]}>
          {mission.completed ? '✅ Complete' : `${Math.round(mission.progress * 100)}%`}
        </Text>
      </View>
      <View style={styles.missionProgressBar}>
        <View 
          style={[
            styles.missionProgressFill,
            { 
              width: `${mission.progress * 100}%`,
              backgroundColor: mission.completed ? '#34C759' : '#0066CC'
            }
          ]}
        />
      </View>
      <Text style={styles.missionReward}>
        Reward: {mission.reward.type === 'percent_bonus' 
          ? `+${mission.reward.value}% bonus` 
          : `${mission.reward.value} ${mission.reward.type.replace('_', ' ')}`
        }
      </Text>
    </View>
  );

  const renderLedgerEntry = (entry: LedgerEntry) => (
    <View key={entry.id} style={styles.ledgerEntry}>
      <View style={styles.ledgerLeft}>
        <Text style={styles.ledgerTitle}>{entry.title}</Text>
        <Text style={styles.ledgerTime}>
          {new Date(entry.ts).toLocaleString()}
        </Text>
      </View>
      <Text style={[
        styles.ledgerAmount,
        { color: entry.delta.value > 0 ? '#34C759' : '#FF3B30' }
      ]}>
        +{entry.delta.value} {entry.delta.type.replace('_', ' ')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading your rewards...</Text>
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
        <View>
          <Text style={styles.headerTitle}>Rewards Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track AisleCoins, BlueWave Points & More</Text>
        </View>
        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
          <Text style={styles.withdrawButtonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Cards */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Your Balances</Text>
          <View style={styles.statsGrid}>
            {balances && (
              <>
                {renderStatCard("AisleCoins", balances.aisleCoins, "💠", "#0066CC")}
                {renderStatCard("BlueWave Points", balances.blueWavePoints, "🌊", "#4A90E2")}
                {renderStatCard("Vendor Stars", balances.vendorStars, "⭐", "#FF9500")}
                {renderStatCard("Cashback", balances.cashbackCredits, "💳", "#34C759")}
              </>
            )}
          </View>
        </Animated.View>

        {/* Progress Rings */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Mission Progress</Text>
          <View style={styles.progressGrid}>
            {renderProgressRing(
              "Per-Sale Missions", 
              (perSaleMissions.filter(m => m.completed).length / perSaleMissions.length) * 100,
              "#0066CC",
              () => router.push('/rewards/missions')
            )}
            {renderProgressRing(
              "Weekly Missions", 
              (weeklyMissions.filter(m => m.completed).length / weeklyMissions.length) * 100,
              "#4A90E2",
              () => router.push('/rewards/weekly')
            )}
          </View>
        </Animated.View>

        {/* Streaks Widget */}
        {streaks && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Current Streaks</Text>
            <View style={styles.streaksContainer}>
              <View style={styles.streakItem}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakLabel}>Daily Streak</Text>
                <Text style={styles.streakValue}>{streaks.daily.days} days</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakEmoji}>📈</Text>
                <Text style={styles.streakLabel}>Weekly Streak</Text>
                <Text style={styles.streakValue}>{streaks.weekly.weeks} weeks</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Active Missions */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Missions</Text>
            <TouchableOpacity onPress={() => router.push('/rewards/missions')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {perSaleMissions.slice(0, 3).map(renderMissionItem)}
        </Animated.View>

        {/* Recent Rewards */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Rewards</Text>
            <TouchableOpacity onPress={() => router.push('/rewards/history')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentLedger.map(renderLedgerEntry)}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 14,
    marginTop: 4,
  },
  withdrawButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLink: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    width: (width - 64) / 2,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressRingContainer: {
    alignItems: 'center',
  },
  progressRing: {
    position: 'relative',
    marginBottom: 12,
  },
  progressRingOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  streaksContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakLabel: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 4,
  },
  streakValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  missionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  missionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  missionProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  missionProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  missionReward: {
    color: '#0066CC',
    fontSize: 12,
    fontWeight: '500',
  },
  ledgerEntry: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerLeft: {
    flex: 1,
  },
  ledgerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ledgerTime: {
    color: '#666666',
    fontSize: 12,
  },
  ledgerAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});