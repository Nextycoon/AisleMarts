import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import TabNavigator from './navigation/TabNavigator';
import TopNavigation from '../src/components/TopNavigation';

const { width, height } = Dimensions.get('window');

// Mock trending creators data - TikTok style
const mockTrendingCreators = [
  { name: 'LuxeFashion', isLive: true, followers: '2.3M', category: 'Fashion' },
  { name: 'TechReview', isLive: false, followers: '1.8M', category: 'Tech' },
  { name: 'FoodieLife', isLive: true, followers: '3.1M', category: 'Food' },  
  { name: 'FitnessGuru', isLive: false, followers: '2.7M', category: 'Fitness' },
  { name: 'HomeDecor', isLive: true, followers: '1.5M', category: 'Home' },
];

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  isFollowing: boolean;
  followerCount: number;
  lastPosted: string;
}

interface FollowingContent {
  id: string;
  creator: Creator;
  type: 'video' | 'image' | 'live';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string[];
  products: any[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  postedAt: string;
  duration?: number;
  isLive?: boolean;
  familySafe: boolean;
}

export default function FollowingScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [followingContent, setFollowingContent] = useState<FollowingContent[]>([]);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<any[]>([]);

  // Mock following content data
  const mockFollowingContent: FollowingContent[] = [
    {
      id: 'following_001',
      creator: {
        id: 'luxefashion',
        username: '@LuxeFashion',
        displayName: 'LuxeFashion',
        avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100',
        verified: true,
        isFollowing: true,
        followerCount: 245000,
        lastPosted: '2h ago'
      },
      type: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
      caption: 'Behind the scenes of our winter photoshoot! ❄️📸 #BlueWaveSafe',
      hashtags: ['#BehindTheScenes', '#WinterFashion', '#BlueWaveSafe', '#LuxuryStyle'],
      products: [
        {
          id: 'prod_coat_001',
          title: 'Designer Winter Coat',
          price: 299.99,
          currency: 'EUR'
        }
      ],
      stats: {
        likes: 45600,
        comments: 1200,
        shares: 890,
        views: 127000
      },
      postedAt: '2024-01-16T10:30:00Z',
      duration: 45,
      familySafe: true
    },
    {
      id: 'following_002',
      creator: {
        id: 'techfamily',
        username: '@TechReviewFamily',
        displayName: 'Tech Review Family',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        verified: true,
        isFollowing: true,
        followerCount: 189000,
        lastPosted: '4h ago'
      },
      type: 'live',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      caption: '🔴 LIVE: Family tech review session! Join us for Q&A about kid-safe devices',
      hashtags: ['#TechReview', '#FamilyTech', '#LiveQ&A', '#BlueWaveSafe'],
      products: [
        {
          id: 'prod_phone_001',
          title: 'Family-Safe Smartphone',
          price: 599.99,
          currency: 'EUR'
        }
      ],
      stats: {
        likes: 2300,
        comments: 567,
        shares: 234,
        views: 8900
      },
      postedAt: '2024-01-16T08:15:00Z',
      isLive: true,
      familySafe: true
    },
    {
      id: 'following_003',
      creator: {
        id: 'healthyfamily',
        username: '@HealthyFamily',
        displayName: 'Healthy Family Eats',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=100',
        verified: true,
        isFollowing: true,
        followerCount: 156000,
        lastPosted: '6h ago'
      },
      type: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=300',
      caption: 'New recipe alert! 🥗 Family-friendly quinoa bowls that kids actually love!',
      hashtags: ['#HealthyEating', '#FamilyMeals', '#KidsNutrition', '#BlueWaveApproved'],
      products: [
        {
          id: 'prod_meal_001',
          title: 'Organic Quinoa Mix',
          price: 18.99,
          currency: 'EUR'
        }
      ],
      stats: {
        likes: 28900,
        comments: 890,
        shares: 456,
        views: 89500
      },
      postedAt: '2024-01-16T06:45:00Z',
      duration: 60,
      familySafe: true
    }
  ];

  useEffect(() => {
    setFollowingContent(mockFollowingContent);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setFollowingContent([...mockFollowingContent]);
      setRefreshing(false);
    }, 1000);
  };

  const handleVideoPress = (index: number) => {
    if (currentPlayingIndex === index) {
      // Pause current video
      videoRefs.current[index]?.pauseAsync();
      setCurrentPlayingIndex(null);
    } else {
      // Pause any currently playing video
      if (currentPlayingIndex !== null) {
        videoRefs.current[currentPlayingIndex]?.pauseAsync();
      }
      // Play new video
      videoRefs.current[index]?.playAsync();
      setCurrentPlayingIndex(index);
    }
  };

  const handleCreatorPress = (creatorId: string) => {
    router.push(`/profile/${creatorId}`);
  };

  const handleLike = (contentId: string) => {
    console.log('Liked content:', contentId);
    // Implement like functionality
  };

  const handleComment = (contentId: string) => {
    router.push(`/comments/${contentId}`);
  };

  const handleShare = (contentId: string) => {
    console.log('Share content:', contentId);
    // Implement family-safe sharing
  };

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const renderContentItem = (content: FollowingContent, index: number) => (
    <View key={content.id} style={styles.contentItem}>
      {/* Creator Header */}
      <TouchableOpacity 
        style={styles.creatorHeader}
        onPress={() => handleCreatorPress(content.creator.id)}
      >
        <View style={styles.creatorAvatar}>
          <Text style={styles.avatarText}>
            {content.creator.username.charAt(1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.creatorInfo}>
          <View style={styles.creatorNameRow}>
            <Text style={styles.creatorName}>{content.creator.displayName}</Text>
            {content.creator.verified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
          </View>
          <Text style={styles.creatorUsername}>{content.creator.username}</Text>
          <Text style={styles.postTime}>{content.creator.lastPosted}</Text>
        </View>
        {content.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>🔴 LIVE</Text>
          </View>
        )}
        {content.familySafe && (
          <View style={styles.familySafeBadge}>
            <Text style={styles.familySafeBadgeText}>🛡️</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      <TouchableOpacity 
        style={styles.mediaContainer}
        onPress={() => handleVideoPress(index)}
        activeOpacity={0.9}
      >
        <Video
          ref={(ref) => videoRefs.current[index] = ref}
          source={{ uri: content.mediaUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping
          isMuted={currentPlayingIndex !== index}
        />
        {currentPlayingIndex !== index && (
          <View style={styles.playOverlay}>
            <Text style={styles.playIcon}>▶️</Text>
          </View>
        )}
        {content.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{content.duration}s</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>{content.caption}</Text>
        <View style={styles.hashtags}>
          {content.hashtags.map((tag, tagIndex) => (
            <TouchableOpacity key={tagIndex} style={styles.hashtag}>
              <Text style={styles.hashtagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Products */}
      {content.products.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.productsContainer}
        >
          {content.products.map((product, productIndex) => (
            <TouchableOpacity
              key={productIndex}
              style={styles.productCard}
              onPress={() => handleProductPress(product.id)}
            >
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productPrice}>
                {product.currency} {product.price}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(content.id)}
        >
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={styles.actionText}>{content.stats.likes.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(content.id)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{content.stats.comments.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(content.id)}
        >
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionText}>{content.stats.shares.toLocaleString()}</Text>
        </TouchableOpacity>

        <View style={styles.viewsContainer}>
          <Text style={styles.viewsText}>
            {content.stats.views.toLocaleString()} views
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Navigation - Explore | Following | For You */}
      <TopNavigation />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Following</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/live-commerce')}
        >
          <Text style={styles.headerButtonText}>🔴 Live</Text>
        </TouchableOpacity>
      </View>

      {/* Trending Creators Section - TikTok Style */}
      <View style={styles.trendingSection}>
        <Text style={styles.trendingSectionTitle}>Trending creators</Text>
        <View style={styles.trendingCreators}>
          {mockTrendingCreators.map((creator, index) => (
            <TouchableOpacity key={index} style={styles.creatorItem}>
              <View style={[styles.creatorAvatar, creator.isLive && styles.liveCreatorAvatar]}>
                <Text style={styles.creatorAvatarText}>{creator.name.charAt(0)}</Text>
                {creator.isLive && <View style={styles.liveIndicator} />}
              </View>
              <Text style={styles.creatorName}>{creator.name}</Text>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content List */}
      <ScrollView
        style={styles.contentList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
            colors={['#D4AF37']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {followingContent.map((content, index) => renderContentItem(content, index))}
        
        {/* Empty state for when no content */}
        {followingContent.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateTitle}>No Updates Yet</Text>
            <Text style={styles.emptyStateText}>
              Follow creators to see their latest content here
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/aisle')}
            >
              <Text style={styles.exploreButtonText}>Explore Creators</Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  headerButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  contentList: {
    flex: 1,
  },
  contentItem: {
    backgroundColor: '#000000',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 16,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  verifiedBadge: {
    color: '#1DA1F2',
    fontSize: 16,
  },
  creatorUsername: {
    color: '#999999',
    fontSize: 14,
    marginTop: 2,
  },
  postTime: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  familySafeBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  familySafeBadgeText: {
    fontSize: 14,
  },
  mediaContainer: {
    position: 'relative',
    height: 300,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  captionContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtag: {
    marginRight: 8,
    marginBottom: 4,
  },
  hashtagText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  productsContainer: {
    paddingLeft: 20,
    paddingTop: 12,
  },
  productCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 150,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  viewsContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  viewsText: {
    color: '#666666',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});