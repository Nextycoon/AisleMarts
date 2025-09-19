import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Challenge {
  id: string;
  hashtag: string;
  title: string;
  description: string;
  category: 'fashion' | 'tech' | 'home';
  status: 'active' | 'upcoming' | 'ended';
  startDate: string;
  endDate: string;
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  rewardPool: number;
  color: string;
  gradient: string[];
  icon: string;
}

interface ChallengePost {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  challengeId: string;
  hashtag: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  score: number;
  rank: number;
  image: string;
  products: {
    id: string;
    name: string;
    price: number;
  }[];
  createdAt: string;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  challengeId: string;
  totalScore: number;
  totalPosts: number;
  totalEngagement: number;
  rewardEarned: number;
  badge: string;
}

const ACTIVE_CHALLENGES: Challenge[] = [
  {
    id: 'aisleootd',
    hashtag: '#AisleOOTD',
    title: 'Outfit of the Day',
    description: 'Show off your luxury fashion style and win golden rewards!',
    category: 'fashion',
    status: 'active',
    startDate: '2024-12-15',
    endDate: '2024-12-22',
    totalPosts: 1247,
    totalViews: 285430,
    totalEngagement: 45670,
    rewardPool: 10000,
    color: '#E8C968',
    gradient: ['#E8C968', '#D4AF37'],
    icon: '👗'
  },
  {
    id: 'techflex',
    hashtag: '#TechFlex',
    title: 'Tech Innovation Showcase',
    description: 'Demo the latest gadgets and tech innovations for luxury living!',
    category: 'tech',
    status: 'active',
    startDate: '2024-12-16',
    endDate: '2024-12-23',
    totalPosts: 892,
    totalViews: 234560,
    totalEngagement: 38920,
    rewardPool: 8500,
    color: '#4facfe',
    gradient: ['#4facfe', '#00f2fe'],
    icon: '📱'
  },
  {
    id: 'homeglow',
    hashtag: '#HomeGlow',
    title: 'Luxury Home Transformation',
    description: 'Share your stunning home designs and interior makeovers!',
    category: 'home',
    status: 'upcoming',
    startDate: '2024-12-18',
    endDate: '2024-12-25',
    totalPosts: 634,
    totalViews: 189340,
    totalEngagement: 29870,
    rewardPool: 7500,
    color: '#a8edea',
    gradient: ['#a8edea', '#fed6e3'],
    icon: '🏡'
  }
];

const SAMPLE_CHALLENGE_POSTS: ChallengePost[] = [
  {
    id: 'post1',
    user: {
      name: 'Emma Style',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    challengeId: 'aisleootd',
    hashtag: '#AisleOOTD',
    caption: 'Luxury winter vibes with this stunning coat! Perfect for the season ✨❄️',
    views: 12450,
    likes: 1847,
    comments: 234,
    shares: 67,
    score: 9.2,
    rank: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop',
    products: [
      { id: 'p1', name: 'Luxury Winter Coat', price: 899 },
      { id: 'p2', name: 'Designer Boots', price: 459 }
    ],
    createdAt: '2 hours ago'
  },
  {
    id: 'post2',
    user: {
      name: 'Tech Guru',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    challengeId: 'techflex',
    hashtag: '#TechFlex',
    caption: 'Game-changing setup for 2024! This workspace tech is next level 🚀💻',
    views: 9870,
    likes: 1456,
    comments: 189,
    shares: 45,
    score: 8.7,
    rank: 2,
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&h=400&fit=crop',
    products: [
      { id: 'p3', name: 'Smart Monitor 4K', price: 699 },
      { id: 'p4', name: 'Wireless Keyboard Pro', price: 199 }
    ],
    createdAt: '4 hours ago'
  },
  {
    id: 'post3',
    user: {
      name: 'Home Curator',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    challengeId: 'homeglow',
    hashtag: '#HomeGlow',
    caption: 'Transformed my living room into a cozy luxury sanctuary 🏠✨ Minimalist vibes',
    views: 8230,
    likes: 1234,
    comments: 156,
    shares: 34,
    score: 8.1,
    rank: 3,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=400&fit=crop',
    products: [
      { id: 'p5', name: 'Luxury Sofa Set', price: 1299 },
      { id: 'p6', name: 'Designer Pillows', price: 149 }
    ],
    createdAt: '6 hours ago'
  }
];

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      name: 'Emma Style',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    challengeId: 'aisleootd',
    totalScore: 92.5,
    totalPosts: 15,
    totalEngagement: 45680,
    rewardEarned: 2500,
    badge: '👑 FASHION QUEEN'
  },
  {
    rank: 2,
    user: {
      name: 'Tech Guru',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    challengeId: 'techflex',
    totalScore: 87.3,
    totalPosts: 12,
    totalEngagement: 38920,
    rewardEarned: 2000,
    badge: '🚀 TECH INNOVATOR'
  },
  {
    rank: 3,
    user: {
      name: 'Home Curator',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      verified: false
    },
    challengeId: 'homeglow',
    totalScore: 81.7,
    totalPosts: 10,
    totalEngagement: 29870,
    rewardEarned: 1500,
    badge: '🏡 HOME DESIGNER'
  }
];

export default function GrowthChallengesScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'challenges' | 'posts' | 'leaderboard'>('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengePosts, setChallengePosts] = useState<ChallengePost[]>(SAMPLE_CHALLENGE_POSTS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD);

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'upcoming': return '#FF9800';
      case 'ended': return '#F44336';
      default: return '#666';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <TouchableOpacity
      key={challenge.id}
      style={styles.challengeCard}
      onPress={() => {
        setSelectedChallenge(challenge);
        setActiveTab('posts');
      }}
    >
      <LinearGradient
        colors={challenge.gradient}
        style={styles.challengeCardGradient}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeIcon}>
            <Text style={styles.challengeIconText}>{challenge.icon}</Text>
          </View>
          <View style={[styles.challengeStatus, { backgroundColor: getStatusColor(challenge.status) }]}>
            <Text style={styles.challengeStatusText}>{challenge.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.challengeHashtag}>{challenge.hashtag}</Text>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeDescription}>{challenge.description}</Text>

        <View style={styles.challengeStats}>
          <View style={styles.challengeStat}>
            <Text style={styles.challengeStatValue}>{formatNumber(challenge.totalPosts)}</Text>
            <Text style={styles.challengeStatLabel}>Posts</Text>
          </View>
          <View style={styles.challengeStat}>
            <Text style={styles.challengeStatValue}>{formatNumber(challenge.totalViews)}</Text>
            <Text style={styles.challengeStatLabel}>Views</Text>
          </View>
          <View style={styles.challengeStat}>
            <Text style={styles.challengeStatValue}>{formatNumber(challenge.totalEngagement)}</Text>
            <Text style={styles.challengeStatLabel}>Engagement</Text>
          </View>
        </View>

        <View style={styles.challengeReward}>
          <Text style={styles.challengeRewardText}>
            🏆 Reward Pool: ${formatNumber(challenge.rewardPool)}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderChallengesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>🔥 Active & Upcoming Challenges</Text>
      
      <View style={styles.challengesList}>
        {ACTIVE_CHALLENGES.map(renderChallengeCard)}
      </View>

      {/* Challenge Creation */}
      <View style={styles.createChallengeSection}>
        <Text style={styles.sectionTitle}>✨ Create Your Own Challenge</Text>
        <TouchableOpacity style={styles.createChallengeButton}>
          <LinearGradient
            colors={['#9C27B0', '#7B1FA2']}
            style={styles.createChallengeGradient}
          >
            <Text style={styles.createChallengeIcon}>➕</Text>
            <Text style={styles.createChallengeText}>Create Challenge</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPostsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.postsHeader}>
        <Text style={styles.sectionTitle}>
          {selectedChallenge ? `${selectedChallenge.hashtag} Posts` : '🎯 Challenge Posts'}
        </Text>
        {selectedChallenge && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => setSelectedChallenge(null)}
          >
            <Text style={styles.clearFilterText}>Show All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.postsList}>
        {challengePosts
          .filter(post => !selectedChallenge || post.challengeId === selectedChallenge.id)
          .map((post) => (
            <View key={post.id} style={styles.challengePostCard}>
              <View style={styles.postHeader}>
                <View style={styles.postUserInfo}>
                  <View style={styles.postUserAvatar}>
                    <Text style={styles.postUserAvatarText}>{post.user.name.charAt(0)}</Text>
                    {post.user.verified && (
                      <View style={styles.postVerifiedBadge}>
                        <Text style={styles.postVerifiedIcon}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.postUserDetails}>
                    <Text style={styles.postUserName}>{post.user.name}</Text>
                    <Text style={styles.postHashtag}>{post.hashtag}</Text>
                  </View>
                </View>
                
                <View style={styles.postRankBadge}>
                  <Text style={styles.postRankText}>#{post.rank}</Text>
                  <Text style={styles.postScoreText}>{post.score}</Text>
                </View>
              </View>

              <Image source={{ uri: post.image }} style={styles.postImage} />

              <View style={styles.postContent}>
                <Text style={styles.postCaption}>{post.caption}</Text>
                
                <View style={styles.postProducts}>
                  {post.products.map((product) => (
                    <TouchableOpacity key={product.id} style={styles.postProduct}>
                      <Text style={styles.postProductName}>{product.name}</Text>
                      <Text style={styles.postProductPrice}>${product.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.postStats}>
                  <Text style={styles.postStat}>👁️ {formatNumber(post.views)}</Text>
                  <Text style={styles.postStat}>❤️ {formatNumber(post.likes)}</Text>
                  <Text style={styles.postStat}>💬 {formatNumber(post.comments)}</Text>
                  <Text style={styles.postStat}>📤 {formatNumber(post.shares)}</Text>
                </View>

                <Text style={styles.postTime}>{post.createdAt}</Text>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );

  const renderLeaderboardTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>🏆 Challenge Leaderboard</Text>
      
      <View style={styles.leaderboardList}>
        {leaderboard.map((entry) => (
          <View key={`${entry.challengeId}-${entry.rank}`} style={styles.leaderboardEntry}>
            <LinearGradient
              colors={entry.rank === 1 ? ['#FFD700', '#FFA500'] : 
                     entry.rank === 2 ? ['#C0C0C0', '#A0A0A0'] :
                     entry.rank === 3 ? ['#CD7F32', '#B8860B'] :
                     ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.leaderboardEntryGradient}
            >
              <View style={styles.leaderboardRank}>
                <Text style={[styles.leaderboardRankText, entry.rank <= 3 && styles.topRankText]}>
                  {entry.rank}
                </Text>
              </View>

              <View style={styles.leaderboardUserInfo}>
                <View style={styles.leaderboardAvatar}>
                  <Text style={styles.leaderboardAvatarText}>{entry.user.name.charAt(0)}</Text>
                  {entry.user.verified && (
                    <View style={styles.leaderboardVerifiedBadge}>
                      <Text style={styles.leaderboardVerifiedIcon}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.leaderboardUserDetails}>
                  <Text style={[styles.leaderboardUserName, entry.rank <= 3 && styles.topRankText]}>
                    {entry.user.name}
                  </Text>
                  <Text style={styles.leaderboardBadge}>{entry.badge}</Text>
                </View>
              </View>

              <View style={styles.leaderboardStats}>
                <View style={styles.leaderboardStat}>
                  <Text style={[styles.leaderboardStatValue, entry.rank <= 3 && styles.topRankText]}>
                    {entry.totalScore.toFixed(1)}
                  </Text>
                  <Text style={styles.leaderboardStatLabel}>Score</Text>
                </View>
                <View style={styles.leaderboardStat}>
                  <Text style={[styles.leaderboardStatValue, entry.rank <= 3 && styles.topRankText]}>
                    {entry.totalPosts}
                  </Text>
                  <Text style={styles.leaderboardStatLabel}>Posts</Text>
                </View>
                <View style={styles.leaderboardStat}>
                  <Text style={[styles.leaderboardStatValue, entry.rank <= 3 && styles.topRankText]}>
                    ${formatNumber(entry.rewardEarned)}
                  </Text>
                  <Text style={styles.leaderboardStatLabel}>Earned</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Reward Distribution */}
      <View style={styles.rewardDistribution}>
        <Text style={styles.sectionTitle}>💰 Reward Distribution</Text>
        <View style={styles.rewardTiers}>
          <View style={styles.rewardTier}>
            <Text style={styles.rewardTierRank}>🥇 1st Place</Text>
            <Text style={styles.rewardTierAmount}>$2,500</Text>
          </View>
          <View style={styles.rewardTier}>
            <Text style={styles.rewardTierRank}>🥈 2nd Place</Text>
            <Text style={styles.rewardTierAmount}>$2,000</Text>
          </View>
          <View style={styles.rewardTier}>
            <Text style={styles.rewardTierRank}>🥉 3rd Place</Text>
            <Text style={styles.rewardTierAmount}>$1,500</Text>
          </View>
          <View style={styles.rewardTier}>
            <Text style={styles.rewardTierRank}>🏆 Top 10</Text>
            <Text style={styles.rewardTierAmount}>$500 each</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.titleBadge}
          >
            <Text style={styles.titleBadgeText}>VIRAL</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Growth Challenges</Text>
          <Text style={styles.headerSubtitle}>Compete • Create • Win Rewards</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'challenges' && renderChallengesTab()}
        {activeTab === 'posts' && renderPostsTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8C968',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  challengesList: {
    gap: 16,
    marginBottom: 32,
  },
  challengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  challengeCardGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeIconText: {
    fontSize: 24,
  },
  challengeStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  challengeStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  challengeHashtag: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  challengeStatLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.7)',
  },
  challengeReward: {
    alignItems: 'center',
  },
  challengeRewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  createChallengeSection: {
    marginBottom: 32,
  },
  createChallengeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createChallengeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  createChallengeIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  createChallengeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  clearFilterText: {
    fontSize: 12,
    color: '#E8C968',
    fontWeight: '600',
  },
  postsList: {
    gap: 16,
  },
  challengePostCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8C968',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  postUserAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  postVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postVerifiedIcon: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  postUserDetails: {
    flex: 1,
  },
  postUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  postHashtag: {
    fontSize: 12,
    color: '#4facfe',
    fontWeight: '600',
  },
  postRankBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  postRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C968',
  },
  postScoreText: {
    fontSize: 10,
    color: '#E8C968',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: 16,
  },
  postCaption: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 20,
  },
  postProducts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  postProduct: {
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  postProductName: {
    fontSize: 10,
    color: '#E8C968',
    fontWeight: '600',
  },
  postProductPrice: {
    fontSize: 10,
    color: '#E8C968',
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  postStat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  postTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardEntry: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  leaderboardEntryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  topRankText: {
    color: '#000',
  },
  leaderboardUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  leaderboardAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  leaderboardVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardVerifiedIcon: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  leaderboardUserDetails: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  leaderboardBadge: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  leaderboardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  leaderboardStat: {
    alignItems: 'center',
  },
  leaderboardStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  leaderboardStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  rewardDistribution: {
    marginTop: 32,
    marginBottom: 32,
  },
  rewardTiers: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  rewardTier: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardTierRank: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  rewardTierAmount: {
    fontSize: 14,
    color: '#E8C968',
    fontWeight: '700',
  },
});