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
import { RewardsAPI, League, LeaderboardRow, SystemStats } from '../../lib/RewardsAPI';

const { width } = Dimensions.get('window');

export default function LeaderboardScreen() {
  const router = useRouter();
  
  // State
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    loadLeaderboardData();
    startAnimations();
  }, [selectedLeague]);

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

  const loadLeaderboardData = async () => {
    try {
      const [leaderboardData, statsData] = await Promise.all([
        RewardsAPI.getLeaderboard(selectedLeague, 50),
        RewardsAPI.getSystemStats()
      ]);

      setLeaderboard(leaderboardData);
      setStats(statsData);
    } catch (error) {
      console.error('Leaderboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboardData();
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

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🔥';
    if (rank <= 25) return '⭐';
    return '💪';
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

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <Animated.View 
        style={[
          styles.statsCard,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.statsTitle}>Platform Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.activeRewardsUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Active in Rewards</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.averageEngagement.toFixed(1)}/5.0</Text>
            <Text style={styles.statLabel}>Avg Engagement</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Object.values(stats.leagueDistribution).reduce((a, b) => a + b, 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>League Members</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderPodium = () => {
    if (leaderboard.length < 3) return null;

    const top3 = leaderboard.slice(0, 3);
    const [first, second, third] = [top3[0], top3[1], top3[2]];

    return (
      <Animated.View 
        style={[
          styles.podiumContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.podium}>
          {/* Second Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumPerson, styles.secondPlace]}>
              <Text style={styles.podiumRank}>🥈</Text>
              <Text style={styles.podiumName}>{second.vendorName.replace('@', '')}</Text>
              <Text style={[styles.podiumLeague, { color: getLeagueColor(second.league) }]}>
                {getLeagueIcon(second.league)} {second.league}
              </Text>
              <Text style={styles.podiumScore}>{second.score.toLocaleString()}</Text>
            </View>
            <View style={[styles.podiumBase, styles.secondPlaceBase]} />
          </View>

          {/* First Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumPerson, styles.firstPlace]}>
              <Text style={styles.podiumCrown}>👑</Text>
              <Text style={styles.podiumRank}>🥇</Text>
              <Text style={styles.podiumName}>{first.vendorName.replace('@', '')}</Text>
              <Text style={[styles.podiumLeague, { color: getLeagueColor(first.league) }]}>
                {getLeagueIcon(first.league)} {first.league}
              </Text>
              <Text style={styles.podiumScore}>{first.score.toLocaleString()}</Text>
            </View>
            <View style={[styles.podiumBase, styles.firstPlaceBase]} />
          </View>

          {/* Third Place */}
          <View style={styles.podiumPosition}>
            <View style={[styles.podiumPerson, styles.thirdPlace]}>
              <Text style={styles.podiumRank}>🥉</Text>
              <Text style={styles.podiumName}>{third.vendorName.replace('@', '')}</Text>
              <Text style={[styles.podiumLeague, { color: getLeagueColor(third.league) }]}>
                {getLeagueIcon(third.league)} {third.league}
              </Text>
              <Text style={styles.podiumScore}>{third.score.toLocaleString()}</Text>
            </View>
            <View style={[styles.podiumBase, styles.thirdPlaceBase]} />
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderLeaderboardEntry = (entry: LeaderboardRow, index: number) => (
    <Animated.View 
      key={entry.vendorId}
      style={[
        styles.leaderboardEntry,
        index < 3 && styles.topThreeEntry,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.rankSection}>
        <Text style={[
          styles.rankNumber,
          { color: index < 3 ? getLeagueColor(['Gold', 'Silver', 'Bronze'][index] as League) : '#FFFFFF' }
        ]}>
          #{entry.rank}
        </Text>
        <Text style={styles.rankIcon}>{getRankIcon(entry.rank)}</Text>
      </View>
      
      <View style={styles.entryInfo}>
        <View style={styles.entryHeader}>
          <Text style={styles.vendorName}>{entry.vendorName}</Text>
          <Text style={[styles.entryLeague, { color: getLeagueColor(entry.league) }]}>
            {getLeagueIcon(entry.league)} {entry.league}
          </Text>
        </View>
        <View style={styles.entryFooter}>
          <Text style={styles.scoreText}>{entry.score.toLocaleString()} points</Text>
          <Text style={styles.percentileText}>
            Top {((entry.rank / leaderboard.length) * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {index < 10 && (
        <View style={styles.performanceBadge}>
          <Text style={styles.badgeText}>
            {index === 0 ? 'Champion' : index < 3 ? 'Elite' : 'Rising Star'}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
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
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>
            {selectedLeague ? `${selectedLeague} League` : 'All Leagues'} • {leaderboard.length} vendors
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
        {/* Stats Card */}
        {renderStatsCard()}

        {/* League Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by League</Text>
          {renderLeagueSelector()}
        </View>

        {/* Podium */}
        {renderPodium()}

        {/* Full Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Rankings</Text>
          <View style={styles.leaderboardContainer}>
            {leaderboard.map(renderLeaderboardEntry)}
          </View>
        </View>

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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: '#0066CC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  leagueScrollContent: {
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
  leagueIcon: {
    fontSize: 14,
    marginRight: 6,
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
  podiumContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 200,
  },
  podiumPosition: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  podiumPerson: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 100,
    marginBottom: 8,
  },
  firstPlace: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  secondPlace: {
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  podiumCrown: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumRank: {
    fontSize: 32,
    marginBottom: 8,
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumLeague: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  podiumScore: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '500',
  },
  podiumBase: {
    width: 80,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  firstPlaceBase: {
    height: 60,
    backgroundColor: '#FFD700',
  },
  secondPlaceBase: {
    height: 45,
    backgroundColor: '#C0C0C0',
  },
  thirdPlaceBase: {
    height: 30,
    backgroundColor: '#CD7F32',
  },
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardEntry: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topThreeEntry: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  rankSection: {
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
    fontSize: 16,
  },
  entryInfo: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  entryLeague: {
    fontSize: 12,
    fontWeight: '500',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  percentileText: {
    color: '#666666',
    fontSize: 10,
    fontStyle: 'italic',
  },
  performanceBadge: {
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  badgeText: {
    color: '#0066CC',
    fontSize: 10,
    fontWeight: '600',
  },
});