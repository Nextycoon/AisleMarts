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
import { RewardsAPI, LedgerEntry, LedgerResponse } from '../../lib/RewardsAPI';

const { width } = Dimensions.get('window');

export default function RewardsHistory() {
  const router = useRouter();
  
  // State
  const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  useEffect(() => {
    loadHistoryData();
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

  const loadHistoryData = async (page: number = 1) => {
    try {
      const data = await RewardsAPI.getLedger("current_user", page, 20);
      
      if (page === 1) {
        setLedgerData(data);
      } else {
        // Append to existing data for pagination
        setLedgerData(prev => prev ? {
          ...data,
          items: [...prev.items, ...data.items]
        } : data);
      }
    } catch (error) {
      console.error('History load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistoryData(1);
  };

  const loadMore = () => {
    if (ledgerData?.hasNext && !loadingMore) {
      setLoadingMore(true);
      const nextPage = Math.floor(ledgerData.items.length / ledgerData.pageSize) + 1;
      loadHistoryData(nextPage);
    }
  };

  const getTransactionIcon = (kind: string): string => {
    const icons = {
      mission: '🎯',
      streak: '🔥',
      competition: '🏆',
      adjustment: '⚖️',
      deduction: '📉',
      withdrawal: '💰',
      bonus: '🎁'
    };
    return icons[kind] || '📋';
  };

  const getTransactionColor = (delta: LedgerEntry['delta']): string => {
    if (delta.type === 'percent_bonus' || delta.type === 'weekly_percent') {
      return '#34C759';
    }
    return delta.value > 0 ? '#34C759' : '#FF3B30';
  };

  const formatRewardValue = (delta: LedgerEntry['delta']): string => {
    if (delta.type === 'percent_bonus' || delta.type === 'weekly_percent') {
      return `+${delta.value}%`;
    }
    
    const sign = delta.value > 0 ? '+' : '';
    const currencyText = delta.currency ? ` ${delta.currency}` : '';
    
    return `${sign}${delta.value} ${delta.type.replace('_', ' ')}${currencyText}`;
  };

  const formatDate = (timestamp: string): { date: string; time: string } => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let dateText: string;
    if (diffDays === 0) {
      dateText = 'Today';
    } else if (diffDays === 1) {
      dateText = 'Yesterday';
    } else if (diffDays < 7) {
      dateText = `${diffDays} days ago`;
    } else {
      dateText = date.toLocaleDateString();
    }
    
    const timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return { date: dateText, time: timeText };
  };

  const renderFilterChips = () => {
    const filters = [
      { key: 'all', label: 'All', icon: '📋' },
      { key: 'mission', label: 'Missions', icon: '🎯' },
      { key: 'streak', label: 'Streaks', icon: '🔥' },
      { key: 'competition', label: 'Competitions', icon: '🏆' },
      { key: 'adjustment', label: 'Adjustments', icon: '⚖️' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.activeFilterChip
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderHistoryEntry = (entry: LedgerEntry, index: number) => {
    // Filter logic
    if (selectedFilter !== 'all' && entry.kind !== selectedFilter) {
      return null;
    }

    const { date, time } = formatDate(entry.ts);
    const rewardColor = getTransactionColor(entry.delta);
    const rewardText = formatRewardValue(entry.delta);

    return (
      <Animated.View 
        key={entry.id}
        style={[
          styles.historyEntry,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.entryIcon}>
          <Text style={styles.iconText}>{getTransactionIcon(entry.kind)}</Text>
        </View>
        
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={[styles.rewardAmount, { color: rewardColor }]}>
              {rewardText}
            </Text>
          </View>
          
          <View style={styles.entryFooter}>
            <Text style={styles.entryKind}>{entry.kind.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.entryTime}>{date} • {time}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSummaryCards = () => {
    if (!ledgerData?.items) return null;

    // Calculate summary statistics
    const totalEntries = ledgerData.items.length;
    const missionRewards = ledgerData.items.filter(item => item.kind === 'mission').length;
    const streakRewards = ledgerData.items.filter(item => item.kind === 'streak').length;
    const competitionRewards = ledgerData.items.filter(item => item.kind === 'competition').length;

    return (
      <Animated.View 
        style={[
          styles.summaryContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalEntries}</Text>
            <Text style={styles.summaryLabel}>Total Rewards</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{missionRewards}</Text>
            <Text style={styles.summaryLabel}>Mission Rewards</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{streakRewards}</Text>
            <Text style={styles.summaryLabel}>Streak Rewards</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{competitionRewards}</Text>
            <Text style={styles.summaryLabel}>Competition Rewards</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading reward history...</Text>
        </View>
        <TabNavigator />
      </SafeAreaView>
    );
  }

  const filteredEntries = ledgerData?.items.filter(item => 
    selectedFilter === 'all' || item.kind === selectedFilter
  ) || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Rewards History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredEntries.length} {selectedFilter === 'all' ? 'total' : selectedFilter} rewards
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
        onScrollEndDrag={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const isCloseToBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
          if (isCloseToBottom) {
            loadMore();
          }
        }}
      >
        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Filter Chips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter Rewards</Text>
          {renderFilterChips()}
        </View>

        {/* History Entries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <View style={styles.historyContainer}>
            {filteredEntries.map(renderHistoryEntry)}
            
            {filteredEntries.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateTitle}>No rewards found</Text>
                <Text style={styles.emptyStateText}>
                  {selectedFilter === 'all' 
                    ? 'Complete missions and streaks to earn your first rewards!'
                    : `No ${selectedFilter} rewards yet. Try a different filter.`
                  }
                </Text>
              </View>
            )}
            
            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#0066CC" />
                <Text style={styles.loadMoreText}>Loading more...</Text>
              </View>
            )}
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
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 56) / 2,
  },
  summaryValue: {
    color: '#0066CC',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  filterScrollContent: {
    paddingBottom: 16,
  },
  filterChip: {
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
  activeFilterChip: {
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    borderColor: '#0066CC',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#0066CC',
    fontWeight: '600',
  },
  historyContainer: {
    gap: 8,
  },
  historyEntry: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  entryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryKind: {
    color: '#0066CC',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  entryTime: {
    color: '#666666',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    color: '#666666',
    fontSize: 12,
    marginLeft: 8,
  },
});