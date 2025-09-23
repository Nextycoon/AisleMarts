import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';

interface SpinReward {
  id: string;
  name: string;
  reward_type: string;
  value: number;
  probability: number;
  icon: string;
  description: string;
  rarity: string;
}

interface SpinResult {
  reward: SpinReward;
  coins_earned: number;
  points_earned: number;
  badges_earned: string[];
  achievements_unlocked: any[];
  remaining_spins: number;
  total_coins: number;
  total_points: number;
}

interface UserProgress {
  spin_tokens: number;
  total_coins: number;
  total_points: number;
  level: number;
  total_spins: number;
}

export default function SpinWheel() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [rewards, setRewards] = useState<SpinReward[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  const rotationValue = new Animated.Value(0);
  
  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
  const userId = 'demo_user_001';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user progress
      const progressResponse = await fetch(`${backendUrl}/api/gamification/user/${userId}/progress`);
      const progressData = await progressResponse.json();
      setUserProgress(progressData);
      
      // Fetch spin wheel config
      const configResponse = await fetch(`${backendUrl}/api/gamification/spin-wheel/config`);
      const configData = await configResponse.json();
      setRewards(configData.config.rewards || []);
      
    } catch (error) {
      console.error('Error fetching spin wheel data:', error);
      Alert.alert('Error', 'Failed to load spin wheel data');
    } finally {
      setLoading(false);
    }
  };

  const spinWheel = async () => {
    if (!userProgress || userProgress.spin_tokens <= 0) {
      Alert.alert('No Spin Tokens', 'You need spin tokens to spin the wheel. Complete challenges or return tomorrow for free spins!');
      return;
    }

    setSpinning(true);
    
    // Animate wheel spinning
    rotationValue.setValue(0);
    Animated.timing(rotationValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    try {
      const response = await fetch(`${backendUrl}/api/gamification/user/${userId}/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setLastResult(result);
        
        // Update user progress
        setUserProgress(prev => ({
          ...prev!,
          spin_tokens: result.remaining_spins,
          total_coins: result.total_coins,
          total_points: result.total_points,
          total_spins: prev!.total_spins + 1
        }));
        
        // Show result alert
        setTimeout(() => {
          Alert.alert(
            '🎉 Spin Result!',
            `You won: ${result.reward.name}!\n\n${result.coins_earned > 0 ? `+${result.coins_earned} coins` : ''}${result.points_earned > 0 ? `+${result.points_earned} points` : ''}`,
            [{ text: 'Awesome!', style: 'default' }]
          );
        }, 2100);
        
      } else {
        const errorData = await response.json();
        Alert.alert('Spin Failed', errorData.detail || 'Unable to spin wheel');
      }
    } catch (error) {
      console.error('Error spinning wheel:', error);
      Alert.alert('Error', 'Failed to spin the wheel');
    } finally {
      setTimeout(() => setSpinning(false), 2000);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#CCCCCC';
      case 'uncommon': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return '#CCCCCC';
    }
  };

  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'], // 4 full rotations
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading Spin Wheel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reward Wheel</Text>
          <View style={styles.headerRight} />
        </View>

        {/* User Stats */}
        {userProgress && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userProgress.spin_tokens}</Text>
              <Text style={styles.statLabel}>Spin Tokens</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userProgress.total_coins.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Coins</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userProgress.total_points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userProgress.total_spins}</Text>
              <Text style={styles.statLabel}>Total Spins</Text>
            </View>
          </View>
        )}

        {/* Spin Wheel */}
        <View style={styles.wheelContainer}>
          <Text style={styles.wheelTitle}>🎰 Daily Rewards Wheel</Text>
          
          <View style={styles.wheelWrapper}>
            <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
              <View style={styles.wheelCenter}>
                <Text style={styles.wheelCenterText}>SPIN</Text>
                <Text style={styles.wheelCenterSubtext}>TO WIN</Text>
              </View>
            </Animated.View>
            
            <View style={styles.wheelPointer}>
              <Text style={styles.pointerText}>▼</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.spinButton,
              (!userProgress || userProgress.spin_tokens <= 0 || spinning) && styles.spinButtonDisabled
            ]}
            onPress={spinWheel}
            disabled={!userProgress || userProgress.spin_tokens <= 0 || spinning}
          >
            <Text style={[
              styles.spinButtonText,
              (!userProgress || userProgress.spin_tokens <= 0 || spinning) && styles.spinButtonTextDisabled
            ]}>
              {spinning ? 'SPINNING...' : 
               !userProgress || userProgress.spin_tokens <= 0 ? 'NO TOKENS' : 'SPIN NOW'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rewards List */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.sectionTitle}>🏆 Possible Rewards</Text>
          {rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>{reward.icon}</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                <View style={styles.rewardMeta}>
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(reward.rarity) }]}>
                    <Text style={styles.rarityText}>{reward.rarity.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.probabilityText}>
                    {(reward.probability * 100).toFixed(1)}% chance
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Last Result */}
        {lastResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>🎊 Last Spin Result</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultIcon}>{lastResult.reward.icon}</Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{lastResult.reward.name}</Text>
                <Text style={styles.resultDescription}>{lastResult.reward.description}</Text>
                {lastResult.coins_earned > 0 && (
                  <Text style={styles.resultReward}>+{lastResult.coins_earned} coins earned</Text>
                )}
                {lastResult.points_earned > 0 && (
                  <Text style={styles.resultReward}>+{lastResult.points_earned} points earned</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* How to Earn Tokens */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>💡 How to Earn Spin Tokens</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>• Complete daily challenges</Text>
            <Text style={styles.infoText}>• Make purchases on AisleMarts</Text>
            <Text style={styles.infoText}>• Write product reviews</Text>
            <Text style={styles.infoText}>• Participate in community discussions</Text>
            <Text style={styles.infoText}>• Daily login bonus (3 tokens per day)</Text>
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
  headerRight: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    textAlign: 'center',
  },
  wheelContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  wheelTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 32,
  },
  wheel: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1a1a1a',
    borderWidth: 8,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  wheelCenter: {
    alignItems: 'center',
  },
  wheelCenterText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  wheelCenterSubtext: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
  },
  wheelPointer: {
    position: 'absolute',
    top: -10,
    zIndex: 10,
  },
  pointerText: {
    color: '#D4AF37',
    fontSize: 30,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  spinButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  spinButtonDisabled: {
    backgroundColor: '#666666',
  },
  spinButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinButtonTextDisabled: {
    color: '#CCCCCC',
  },
  rewardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rewardCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  rewardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  probabilityText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  resultIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
  resultReward: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 8,
  },
});