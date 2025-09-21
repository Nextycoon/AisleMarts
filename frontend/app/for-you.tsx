import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import TabNavigator from './navigation/TabNavigator';
import TopNavigation from '../src/components/TopNavigation';
import { useForYouFeed, useTikTokAPI } from '../src/hooks/useTikTokAPI';

const { width, height } = Dimensions.get('window');

interface ProductPin {
  id: string;
  title: string;
  price: number;
  currency: string;
  timestamp: number; // seconds into video
}

interface VideoContent {
  id: string;
  uri: string;
  creator: {
    id: string;
    username: string;
    avatar: string;
    verified: boolean;
    isFollowing: boolean;
  };
  caption: string;
  hashtags: string[];
  sound: {
    id: string;
    title: string;
    artist: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  products: ProductPin[];
  safety: {
    familySafe: boolean;
    ageRating: string;
    parentalApproval: boolean;
  };
}

export default function ForYouScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<any[]>([]);
  const translateY = useRef(new Animated.Value(0)).current;
  const api = useTikTokAPI();
  
  // Use TikTok API hook for feed data with mock user ID
  const { data: feedData, loading: isLoading, error, refresh, loadMore } = useForYouFeed('test_user_001', true);
  
  // Fallback mock content for development
  const mockContent: VideoContent[] = [
    {
      id: '1',
      uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      creator: {
        id: 'luxefashion',
        username: '@LuxeFashion',
        avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100',
        verified: true,
        isFollowing: false,
      },
      caption: 'New winter collection is here! ❄️ Stay warm and stylish 🔥',
      hashtags: ['#WinterFashion', '#LuxeStyle', '#TrendingNow', '#ShopNow'],
      sound: {
        id: 'sound_1',
        title: 'Winter Vibes',
        artist: 'Chill Beats',
      },
      stats: {
        likes: 127300,
        comments: 8200,
        shares: 3100,
        saves: 12400,
      },
      products: [
        {
          id: 'prod_1',
          title: 'Designer Winter Coat',
          price: 299.99,
          currency: 'EUR',
          timestamp: 5,
        },
        {
          id: 'prod_2',
          title: 'Luxury Scarf',
          price: 89.99,
          currency: 'EUR',
          timestamp: 12,
        },
      ],
      safety: {
        familySafe: true,
        ageRating: '13+',
        parentalApproval: false,
      },
    },
    {
      id: '2',
      uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      creator: {
        id: 'techreview',
        username: '@TechReviewFamily',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        verified: true,
        isFollowing: true,
      },
      caption: 'Unboxing the latest family-safe tech! 📱✨ Perfect for teens with parental controls',
      hashtags: ['#TechReview', '#Innovation', '#TechLife', '#SmartTech'],
      sound: {
        id: 'sound_2',
        title: 'Tech Unbox Beat',
        artist: 'Digital Sounds',
      },
      stats: {
        likes: 89500,
        comments: 4300,
        shares: 2100,
        saves: 8900,
      },
      products: [
        {
          id: 'prod_3',
          title: 'Family-Safe Smartphone',
          price: 599.99,
          currency: 'EUR',
          timestamp: 8,
        },
      ],
      safety: {
        familySafe: true,
        ageRating: 'All Ages',
        parentalApproval: true,
      },
    },
    {
      id: '3',
      uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      creator: {
        id: 'healthyeats',
        username: '@HealthyFamily',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=100',
        verified: true,
        isFollowing: false,
      },
      caption: 'Quick healthy snacks for busy families! 🥗🍎 Nutrition made simple',
      hashtags: ['#HealthyEating', '#Nutrition', '#QuickSnacks', '#HealthyLife'],
      sound: {
        id: 'sound_3',
        title: 'Cooking Fun',
        artist: 'Kitchen Beats',
      },
      stats: {
        likes: 156700,
        comments: 12800,
        shares: 5600,
        saves: 28400,
      },
      products: [
        {
          id: 'prod_4',
          title: 'Organic Snack Box',
          price: 24.99,
          currency: 'EUR',
          timestamp: 3,
        },
        {
          id: 'prod_5',
          title: 'Family Meal Planner',
          price: 15.99,
          currency: 'EUR',
          timestamp: 15,
        },
      ],
      safety: {
        familySafe: true,
        ageRating: 'All Ages',
        parentalApproval: false,
      },
    },
  ];

  // Use API data if available, otherwise fall back to mock content
  const forYouFeed = feedData && feedData.length > 0 ? feedData : mockContent;
  const currentVideo = forYouFeed[currentIndex];

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your feed...</Text>
        </View>
        <TabNavigator />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load feed</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <TabNavigator />
      </SafeAreaView>
    );
  }

  const handleSwipeUp = () => {
    if (currentIndex < forYouFeed.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Pause current video, play next
      videoRefs.current[currentIndex]?.pauseAsync();
      setTimeout(() => {
        videoRefs.current[currentIndex + 1]?.playAsync();
      }, 100);
      
      // Load more content when approaching the end
      if (currentIndex >= forYouFeed.length - 3 && loadMore) {
        loadMore();
      }
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Pause current video, play previous
      videoRefs.current[currentIndex]?.pauseAsync();
      setTimeout(() => {
        videoRefs.current[currentIndex - 1]?.playAsync();
      }, 100);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRefs.current[currentIndex]?.pauseAsync();
    } else {
      videoRefs.current[currentIndex]?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    // Implement like functionality with family safety tracking
    console.log('Liked video:', currentVideo.id);
  };

  const handleComment = () => {
    router.push(`/comments/${currentVideo.id}`);
  };

  const handleShare = () => {
    // Implement family-safe sharing
    console.log('Share video:', currentVideo.id);
  };

  const handleSave = () => {
    // Implement save to wishlist
    console.log('Saved video:', currentVideo.id);
  };

  const handleProductPin = (product: ProductPin) => {
    if (currentVideo.safety.parentalApproval) {
      // Show parental approval required
      router.push(`/family/purchase-approval?product=${product.id}&amount=${product.price}`);
    } else {
      // Direct to product page
      router.push(`/products/${product.id}`);
    }
  };

  const handleFollow = () => {
    console.log('Follow creator:', currentVideo.creator.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => videoRefs.current[currentIndex] = ref}
          source={{ uri: currentVideo.uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isPlaying}
          isLooping
          isMuted={false}
        />
        
        {/* Touch Areas for Navigation */}
        <TouchableOpacity 
          style={styles.swipeUpArea} 
          onPress={handleSwipeUp}
          activeOpacity={1}
        />
        <TouchableOpacity 
          style={styles.swipeDownArea} 
          onPress={handleSwipeDown}
          activeOpacity={1}
        />
        <TouchableOpacity 
          style={styles.playPauseArea} 
          onPress={togglePlayPause}
          activeOpacity={1}
        />

        {/* Family Safety Badge - Removed from UI, functionality preserved in backend */}

        {/* Left Side - Video Info */}
        <View style={styles.leftSide}>
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorUsername}>{currentVideo.creator.username}</Text>
            {currentVideo.creator.verified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
          </View>
          
          <Text style={styles.caption}>{currentVideo.caption}</Text>
          
          <View style={styles.hashtags}>
            {currentVideo.hashtags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.hashtag}>
                <Text style={styles.hashtagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.soundInfo}>
            <Text style={styles.soundIcon}>🎵</Text>
            <Text style={styles.soundText}>
              {currentVideo.sound.title} - {currentVideo.sound.artist}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Side - Actions */}
        <View style={styles.rightSide}>
          {/* Creator Avatar with Follow */}
          <TouchableOpacity style={styles.avatarContainer} onPress={handleFollow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentVideo.creator.username.charAt(1).toUpperCase()}
              </Text>
            </View>
            {!currentVideo.creator.isFollowing && (
              <View style={styles.followButton}>
                <Text style={styles.followButtonText}>+</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionText}>{currentVideo.stats.likes.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{currentVideo.stats.comments.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionText}>{currentVideo.stats.shares.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionIcon}>📂</Text>
            <Text style={styles.actionText}>{currentVideo.stats.saves.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Shopping Bag */}
          <TouchableOpacity 
            style={styles.shoppingButton}
            onPress={() => setShowProducts(!showProducts)}
          >
            <Text style={styles.shoppingIcon}>🛍️</Text>
            <Text style={styles.actionText}>{currentVideo.products.length}</Text>
          </TouchableOpacity>
        </View>

        {/* Product Pins */}
        {showProducts && currentVideo.products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productPin, { bottom: 200 + index * 60 }]}
            onPress={() => handleProductPin(product)}
          >
            <Text style={styles.productPinText}>
              {product.title} - {product.currency} {product.price}
            </Text>
            {currentVideo.safety.parentalApproval && (
              <Text style={styles.approvalRequired}>👨‍👩‍👧‍👦 Approval Required</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Parental Control Indicator */}
        {currentVideo.safety.parentalApproval && (
          <View style={styles.parentalControl}>
            <Text style={styles.parentalControlText}>
              👨‍👩‍👧‍👦 Parental Controls Active
            </Text>
          </View>
        )}
      </View>

      <TabNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: width,
    height: height - 100, // Account for tab navigator
  },
  swipeUpArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    zIndex: 1,
  },
  swipeDownArea: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: '30%',
    zIndex: 1,
  },
  playPauseArea: {
    position: 'absolute',
    top: '30%',
    bottom: '40%',
    left: 0,
    right: 100,
    zIndex: 1,
  },
  // Safety badge styles removed - family safety functionality preserved in backend only
  leftSide: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 100,
    zIndex: 2,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorUsername: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  verifiedBadge: {
    color: '#1DA1F2',
    fontSize: 16,
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
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
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  soundIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  soundText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  rightSide: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    zIndex: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FF3B30',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  shoppingButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  shoppingIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  productPin: {
    position: 'absolute',
    left: 20,
    right: 100,
    backgroundColor: 'rgba(212, 175, 55, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 3,
  },
  productPinText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  approvalRequired: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  parentalControl: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 100, 200, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  parentalControlText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});