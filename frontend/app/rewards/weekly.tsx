import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from '../navigation/TabNavigator';
import { RewardsAPI, Mission, League, LeaderboardRow } from '../../lib/RewardsAPI';

const { width } = Dimensions.get('window');

export default function WeeklyMissions() {
  const router = useRouter();
  
  // State
  const [missions, setMissions] = useState<Mission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [currentLeague, setCurrentLeague] = useState<League>('Bronze');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | undefined>(undefined);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadWeeklyData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadWeeklyData = async () => {
    try {
      const [missionsData, leaderboardData] = await Promise.all([
        RewardsAPI.getWeeklyMissions(),
        RewardsAPI.getLeaderboard(selectedLeague, 10)
      ]);

      setMissions(missionsData.missions);
      setCurrentLeague(missionsData.league || 'Bronze');
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Weekly data load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeeklyData();
  };

  const handleClaimMission = async (missionId: string) => {
    try {
      const result = await RewardsAPI.claimReward({ mission_id: missionId });
      if (result.ok) {
        // Refresh data to show updated status
        loadWeeklyData();
      }
    } catch (error) {
      console.error('Claim mission error:', error);
    }
  };

  const getLeagueColor = (league: League): string => {
    const colors = {
      Bronze: '#CD7F32',
      Silver: '#C0C0C0', 
      Gold: '#FFD700',
      Platinum: '#E5E4E2'
    };
    return colors[league] || '#CD7F32';
  };

  const getLeagueIcon = (league: League): string => {
    const icons = {
      Bronze: '🥉',
      Silver: '🥈',
      Gold: '🥇', 
      Platinum: '💎'
    };
    return icons[league] || '🥉';
  };

  const renderLeagueSelector = () => {
    const leagues: League[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.leagueScrollContent}
      >
        <TouchableOpacity 
          style={[
            styles.leagueChip,
            !selectedLeague && styles.activeLeagueChip
          ]}
          onPress={() => setSelectedLeague(undefined)}
        >
          <Text style={[
            styles.leagueChipText,
            !selectedLeague && styles.activeLeagueChipText
          ]}>
            All Leagues
          </Text>
        </TouchableOpacity>
        
        {leagues.map((league) => (
          <TouchableOpacity
            key={league}
            style={[
              styles.leagueChip,
              { borderColor: getLeagueColor(league) },
              selectedLeague === league && [styles.activeLeagueChip, { backgroundColor: getLeagueColor(league) + '20' }]
            ]}
            onPress={() => setSelectedLeague(league)}
          >
            <Text style={styles.leagueIcon}>{getLeagueIcon(league)}</Text>
            <Text style={[
              styles.leagueChipText,
              selectedLeague === league && styles.activeLeagueChipText,
              { color: selectedLeague === league ? getLeagueColor(league) : '#FFFFFF' }
            ]}>
              {league}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderMissionCard = (mission: Mission) => (
    <Animated.View 
      key={mission.id} 
      style={[
        styles.missionCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.missionHeader}>
        <View style={styles.missionInfo}>
          <Text style={styles.missionLabel}>{mission.label}</Text>
          <Text style={styles.missionRule}>{mission.rule}</Text>
        </View>
        <View style={[
          styles.missionStatus,
          { backgroundColor: mission.completed ? '#34C759' : '#FF9500' }
        ]}>
          <Text style={styles.missionStatusText}>
            {mission.completed ? '✅ Complete' : `${Math.round(mission.progress * 100)}%`}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${mission.progress * 100}%`,
                backgroundColor: mission.completed ? '#34C759' : '#0066CC'
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(mission.progress * 100)}%</Text>
      </View>
      
      <View style={styles.missionFooter}>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardLabel}>Reward:</Text>
          <Text style={styles.rewardValue}>
            {mission.reward.type === 'weekly_percent' 
              ? `+${mission.reward.value}% weekly bonus`
              : `${mission.reward.value} ${mission.reward.type.replace('_', ' ')}`
            }
          </Text>
        </View>
        
        {mission.completed && (
          <TouchableOpacity 
            style={styles.claimButton}
            onPress={() => handleClaimMission(mission.id)}
          >
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderLeaderboardEntry = (entry: LeaderboardRow, index: number) => (
    <Animated.View 
      key={entry.vendorId}
      style={[
        styles.leaderboardEntry,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.leaderboardRank}>
        <Text style={[
          styles.rankNumber,
          { color: index < 3 ? getLeagueColor(['Gold', 'Silver', 'Bronze'][index] as League) : '#FFFFFF' }
        ]}>
          #{entry.rank}
        </Text>
        {index < 3 && (
          <Text style={styles.rankIcon}>
            {['🥇', '🥈', '🥉'][index]}
          </Text>
        )}
      </View>
      
      <View style={styles.leaderboardInfo}>
        <Text style={styles.vendorName}>{entry.vendorName}</Text>
        <View style={styles.leaderboardDetails}>
          <Text style={[styles.leagueText, { color: getLeagueColor(entry.league) }]}>
            {getLeagueIcon(entry.league)} {entry.league}
          </Text>
          <Text style={styles.scoreText}>{entry.score.toLocaleString()} pts</Text>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading weekly missions...</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Weekly Missions</Text>
          <Text style={styles.headerSubtitle}>
            Current League: {getLeagueIcon(currentLeague)} {currentLeague}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current League Status */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={[styles.leagueCard, { borderLeftColor: getLeagueColor(currentLeague) }]}>
            <View style={styles.leagueHeader}>
              <Text style={styles.leagueIcon}>{getLeagueIcon(currentLeague)}</Text>
              <View style={styles.leagueInfo}>
                <Text style={styles.leagueTitle}>{currentLeague} League</Text>
                <Text style={styles.leagueDescription}>
                  Complete missions to advance to the next league and unlock better rewards!
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Weekly Missions */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>This Week's Missions</Text>
          <Text style={styles.sectionSubtitle}>
            Complete missions to earn weekly bonuses and advance leagues
          </Text>
          {missions.map(renderMissionCard)}
        </Animated.View>

        {/* League Filter */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {renderLeagueSelector()}
        </Animated.View>

        {/* Leaderboard */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.leaderboardContainer}>
            {leaderboard.map(renderLeaderboardEntry)}
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    minWidth: 60,
  },
  backButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    minWidth: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 18,
  },
  leagueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  leagueInfo: {
    flex: 1,
  },
  leagueTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  leagueDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 18,
  },
  missionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  missionInfo: {
    flex: 1,
    marginRight: 16,
  },
  missionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  missionRule: {
    color: '#CCCCCC',
    fontSize: 12,
    fontStyle: 'italic',
  },
  missionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  missionStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLabel: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 2,
  },
  rewardValue: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  leagueScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  leagueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeLeagueChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    borderColor: '#0066CC',
  },
  leagueChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  activeLeagueChipText: {
    color: '#0066CC',
    fontWeight: '600',
  },
  leaderboardContainer: {
    gap: 12,
  },
  leaderboardEntry: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardRank: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  rankIcon: {
    fontSize: 20,
  },
  leaderboardInfo: {
    flex: 1,
  },
  vendorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  leaderboardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leagueText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
});