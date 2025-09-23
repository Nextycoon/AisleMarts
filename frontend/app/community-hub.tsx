import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface CommunityPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    badge: string;
    level: string;
  };
  content: {
    text: string;
    images: string[];
    tags: string[];
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
  type: 'outfit' | 'review' | 'haul' | 'question';
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  participants: number;
  prize: string;
  endDate: string;
}

export default function CommunityHubScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');

  const communityPosts: CommunityPost[] = [
    {
      id: '1',
      user: {
        name: 'Sarah K.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=50',
        badge: '👑',
        level: 'Gold VIP',
      },
      content: {
        text: 'Obsessed with this winter look! The cozy sweater and boots combo is perfect for the season ❄️✨',
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300'],
        tags: ['#WinterStyle', '#CozyVibes', '#OOTD'],
      },
      engagement: {
        likes: 234,
        comments: 45,
        shares: 12,
      },
      timestamp: '2h ago',
      type: 'outfit',
    },
    {
      id: '2',
      user: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
        badge: '⭐',
        level: 'Silver',
      },
      content: {
        text: 'Just received my order! The quality is amazing and shipping was super fast. Definitely recommend this seller 🙌',
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300'],
        tags: ['#Review', '#QualityProducts', '#FastShipping'],
      },
      engagement: {
        likes: 89,
        comments: 23,
        shares: 6,
      },
      timestamp: '4h ago',
      type: 'review',
    },
    {
      id: '3',
      user: {
        name: 'Emma L.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50',
        badge: '🦋',
        level: 'Bronze',
      },
      content: {
        text: 'Mini haul from today\'s shopping spree! Can\'t wait to style these pieces. What do you think? 💕',
        images: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
          'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300',
        ],
        tags: ['#Haul', '#NewIn', '#StyleInspo'],
      },
      engagement: {
        likes: 156,
        comments: 34,
        shares: 8,
      },
      timestamp: '6h ago',
      type: 'haul',
    },
  ];

  const challenges: CommunityChallenge[] = [
    {
      id: '1',
      title: 'Holiday Style Challenge',
      description: 'Show off your festive outfits and holiday looks',
      icon: '🎄',
      participants: 1247,
      prize: '$500 Shopping Spree',
      endDate: '5 days left',
    },
    {
      id: '2',
      title: 'Sustainable Fashion',
      description: 'Share your eco-friendly fashion choices',
      icon: '🌱',
      participants: 892,
      prize: 'Eco-Friendly Kit',
      endDate: '12 days left',
    },
    {
      id: '3',
      title: 'Budget Finds',
      description: 'Amazing finds under $50',
      icon: '💰',
      participants: 2156,
      prize: '1000 Loyalty Points',
      endDate: '8 days left',
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Jessica M.', points: 15240, badge: '👑', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40' },
    { rank: 2, name: 'Alex R.', points: 14890, badge: '🥈', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40' },
    { rank: 3, name: 'Lisa K.', points: 14230, badge: '🥉', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=40' },
    { rank: 4, name: 'Ryan P.', points: 13780, badge: '⭐', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40' },
    { rank: 5, name: 'Sophie T.', points: 13450, badge: '⭐', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40' },
  ];

  const renderCommunityFeed = () => (
    <View style={styles.feedContainer}>
      {communityPosts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          
          {/* Post Header */}
          <View style={styles.postHeader}>
            <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{post.user.name}</Text>
                <Text style={styles.userBadge}>{post.user.badge}</Text>
                <Text style={styles.userLevel}>{post.user.level}</Text>
              </View>
              <Text style={styles.postTimestamp}>{post.timestamp}</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <Text style={styles.postText}>{post.content.text}</Text>

          {/* Post Images */}
          {post.content.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {post.content.images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.postImage} />
              ))}
            </ScrollView>
          )}

          {/* Post Tags */}
          <View style={styles.tagsContainer}>
            {post.content.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionText}>{post.engagement.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{post.engagement.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={styles.actionText}>{post.engagement.shares}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔖</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.challengesContainer}>
      <View style={styles.challengesHeader}>
        <Text style={styles.challengesTitle}>🏆 Active Challenges</Text>
        <Text style={styles.challengesSubtitle}>Join challenges to earn rewards and recognition!</Text>
      </View>
      
      {challenges.map((challenge) => (
        <TouchableOpacity key={challenge.id} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeIcon}>{challenge.icon}</Text>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
            </View>
          </View>
          
          <View style={styles.challengeMeta}>
            <View style={styles.challengeStat}>
              <Text style={styles.challengeStatIcon}>👥</Text>
              <Text style={styles.challengeStatText}>{challenge.participants.toLocaleString()}</Text>
            </View>
            <View style={styles.challengeStat}>
              <Text style={styles.challengeStatIcon}>🎁</Text>
              <Text style={styles.challengeStatText}>{challenge.prize}</Text>
            </View>
            <View style={styles.challengeStat}>
              <Text style={styles.challengeStatIcon}>⏰</Text>
              <Text style={styles.challengeStatText}>{challenge.endDate}</Text>
            </View>
          </View>

          <View style={styles.challengeActions}>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join Challenge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Entries</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>🏆 Community Leaders</Text>
        <Text style={styles.leaderboardSubtitle}>Top contributors this month</Text>
      </View>

      <View style={styles.topThree}>
        {leaderboard.slice(0, 3).map((user, index) => (
          <View key={user.rank} style={[styles.podium, index === 0 && styles.firstPlace]}>
            <Text style={styles.podiumRank}>{user.badge}</Text>
            <Image source={{ uri: user.avatar }} style={styles.podiumAvatar} />
            <Text style={styles.podiumName}>{user.name}</Text>
            <Text style={styles.podiumPoints}>{user.points.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.restOfLeaderboard}>
        {leaderboard.slice(3).map((user) => (
          <View key={user.rank} style={styles.leaderboardRow}>
            <View style={styles.leaderboardLeft}>
              <Text style={styles.leaderboardRank}>#{user.rank}</Text>
              <Image source={{ uri: user.avatar }} style={styles.leaderboardAvatar} />
              <Text style={styles.leaderboardName}>{user.name}</Text>
              <Text style={styles.leaderboardBadge}>{user.badge}</Text>
            </View>
            <Text style={styles.leaderboardPoints}>{user.points.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community</Text>
          <TouchableOpacity onPress={() => router.push('/create-post')}>
            <Text style={styles.createButton}>✨</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>Leaders</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'feed' && renderCommunityFeed()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        
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
  createButton: {
    fontSize: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#D4AF37',
  },
  content: {
    flex: 1,
  },
  // Feed Styles
  feedContainer: {
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  userBadge: {
    fontSize: 14,
    marginRight: 6,
  },
  userLevel: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  postText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  postImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  // Challenges Styles
  challengesContainer: {
    paddingHorizontal: 20,
  },
  challengesHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  challengesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  challengesSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 20,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  challengeStatText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  challengeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  viewButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  // Leaderboard Styles
  leaderboardContainer: {
    paddingHorizontal: 20,
  },
  leaderboardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  podium: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    width: '30%',
  },
  firstPlace: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
    transform: [{ scale: 1.1 }],
  },
  podiumRank: {
    fontSize: 32,
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumPoints: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  restOfLeaderboard: {
    gap: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    width: 30,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  leaderboardBadge: {
    fontSize: 16,
    marginLeft: 8,
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  bottomSpacing: {
    height: 100,
  },
});