import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import TabNavigator from './navigation/TabNavigator';
import TopNavigation from '../src/components/TopNavigation';
import FloatingAIAssistant from '../src/components/FloatingAIAssistant';
import { useForYouFeed, useTikTokAPI } from '../src/hooks/useTikTokAPI';

const { width, height } = Dimensions.get('window');

// Mock trending creators data - TikTok style
const mockTrendingCreators = [
  { name: 'LuxeFashion', isLive: true, followers: '2.3M', category: 'Fashion' },
  { name: 'TechReview', isLive: false, followers: '1.8M', category: 'Tech' },
  { name: 'FoodieLife', isLive: true, followers: '3.1M', category: 'Food' },
  { name: 'FitnessGuru', isLive: false, followers: '2.7M', category: 'Fitness' },
  { name: 'HomeDecor', isLive: true, followers: '1.5M', category: 'Home' },
  { name: 'TravelMore', isLive: false, followers: '2.9M', category: 'Travel' },
];

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
  
  // Full Screen Animation - Hide/Show Top Navigation and Trending on Scroll
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const topNavTranslateY = useRef(new Animated.Value(0)).current;
  const trendingTranslateY = useRef(new Animated.Value(0)).current;
  
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
    
    // Toggle full screen mode on swipe up - hide top navigation only
    if (!isFullScreen) {
      setIsFullScreen(true);
      Animated.timing(topNavTranslateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
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
    
    // Show navigation on swipe down
    if (isFullScreen) {
      setIsFullScreen(false);
      Animated.timing(topNavTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
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
    <View style={styles.fullScreenContainer}>
      <StatusBar style="light" />
      
      {/* Full Screen Video Background - Covers Entire Screen */}
      <Video
        ref={(ref) => videoRefs.current[currentIndex] = ref}
        source={{ uri: currentVideo.uri }}
        style={styles.backgroundVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isPlaying}
        isLooping
        isMuted={false}
      />
      
      {/* Animated Top Navigation - Overlay on Video */}
      <Animated.View 
        style={[
          styles.animatedTopNav,
          { transform: [{ translateY: topNavTranslateY }] }
        ]}
      >
        <TopNavigation />
      </Animated.View>
        
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
          {/* Creator Info - Moved to Bottom */}
          <View style={styles.bottomCreatorInfo}>
            <Text style={styles.creatorUsername}>
              {currentVideo.creator.username}
              {currentVideo.creator.verified && (
                <Text style={styles.verifiedBadge}> ✓</Text>
              )}
            </Text>
            
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
        </View>

        {/* Right Side - Actions */}
        <View style={styles.rightSide}>
          {/* Profile Button - Luxury AisleMarts Style */}
          <TouchableOpacity 
            style={styles.luxuryAvatarContainer}
            onPress={() => router.push(`/profile/${currentVideo.creator.id}`)}
          >
            <View style={styles.luxuryAvatar}>
              <Text style={styles.luxuryAvatarText}>L</Text>
            </View>
            <View style={styles.luxuryFollowButton}>
              <Text style={styles.luxuryFollowPlus}>+</Text>
            </View>
          </TouchableOpacity>

          {/* Luxury Like Button - World-Class Design */}
          <TouchableOpacity style={styles.luxuryActionButton} onPress={handleLike}>
            <View style={styles.luxuryIconContainer}>
              <Text style={styles.luxuryLikeIcon}>♡</Text>
            </View>
            <Text style={styles.luxuryActionText}>{currentVideo.stats.likes.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Luxury Comment Button - Premium Design */}
          <TouchableOpacity style={styles.luxuryActionButton} onPress={handleComment}>
            <View style={styles.luxuryIconContainer}>
              <Text style={styles.luxuryCommentIcon}>💬</Text>
            </View>
            <Text style={styles.luxuryActionText}>{currentVideo.stats.comments.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Luxury Save Button - High-End Style */}
          <TouchableOpacity style={styles.luxuryActionButton} onPress={() => console.log('Save pressed')}>
            <View style={styles.luxuryIconContainer}>
              <Text style={styles.luxurySaveIcon}>🔖</Text>
            </View>
            <Text style={styles.luxuryActionText}>{currentVideo.stats.saves.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Luxury Share Button - Premium Experience */}
          <TouchableOpacity style={styles.luxuryActionButton} onPress={handleShare}>
            <View style={styles.luxuryIconContainer}>
              <Text style={styles.luxuryShareIcon}>↗</Text>
            </View>
            <Text style={styles.luxuryActionText}>{currentVideo.stats.shares.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* AisleMarts Luxury Shopping Button - Signature Golden Design */}
          <TouchableOpacity 
            style={styles.aisleMartsLuxuryShoppingButton}
            onPress={() => setShowProducts(!showProducts)}
          >
            <View style={styles.aisleMartsShoppingContainer}>
              <Text style={styles.aisleMartsShoppingIcon}>🛍️</Text>
            </View>
            <Text style={styles.aisleMartsShoppingText}>Shop</Text>
          </TouchableOpacity>

          {/* Luxury Music Button - Premium Audio Experience */}
          <TouchableOpacity 
            style={styles.luxuryMusicButton}
            onPress={() => console.log('Music pressed:', currentVideo.sound.title)}
          >
            <Text style={styles.luxuryMusicIcon}>♪</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Product Pins - AisleMarts Shopping Integration */}
        {showProducts && currentVideo.products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productPin, { bottom: 200 + index * 80 }]}
            onPress={() => handleProductPin(product)}
          >
            <View style={styles.productPinContainer}>
              <View style={styles.productPinHeader}>
                <Text style={styles.productPinTitle}>{product.title}</Text>
                <TouchableOpacity style={styles.quickBuyButton}>
                  <Text style={styles.quickBuyText}>Buy Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.productPinDetails}>
                <Text style={styles.productPinPrice}>
                  {product.currency} {product.price}
                </Text>
                <View style={styles.productPinActions}>
                  <TouchableOpacity style={styles.addToCartButton}>
                    <Text style={styles.addToCartIcon}>🛒</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.wishlistButton}>
                    <Text style={styles.wishlistIcon}>❤️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {currentVideo.safety.parentalApproval && (
                <Text style={styles.approvalRequired}>👨‍👩‍👧‍👦 Approval Required</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating AI Assistant - Overlay on Video */}
      <View style={styles.aiAssistantOverlay}>
        <FloatingAIAssistant />
      </View>

      {/* Bottom Navigation - Overlay on Video */}
      <View style={styles.bottomNavOverlay}>
        <TabNavigator />
      </View>
    </View>
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
    height: height - 160, // Account for tab navigator (60px) + top navigation (100px)
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
    bottom: 20,
    left: 20,
    right: 100,
    zIndex: 2,
  },
  // ==================================================================================
  // OVERLAY CONTENT - FLOATING ON TOP OF VIDEO
  // ==================================================================================
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomCreatorInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  creatorUsername: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  verifiedBadge: {
    color: '#25f4ee',
    fontSize: 16,
    fontWeight: '600',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  soundIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  soundText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rightSide: {
    position: 'absolute',
    right: 20,
    bottom: 2, // ABSOLUTE BOTTOM - As low as possible without overlapping bottom nav
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 320, // Keep height for all 7 icons
    zIndex: 15, // Higher z-index to appear on top of video
  },
  // ==================================================================================
  // AI ASSISTANT AND BOTTOM NAVIGATION OVERLAYS
  // ==================================================================================
  aiAssistantOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20, // Highest z-index for AI assistant
  },
  bottomNavOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Highest z-index for navigation
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent background
  },

  // ==================================================================================
  // LUXURY AISLEMARTS WORLD-CLASS ICON DESIGN SYSTEM
  // ==================================================================================
  
  // Luxury Avatar Container - Premium Profile Design
  luxuryAvatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  luxuryAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 12,
  },
  luxuryAvatarText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  luxuryFollowButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: 'linear-gradient(135deg, #FF0050 0%, #FF3B30 50%, #DC143C 100%)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 10,
  },
  luxuryFollowPlus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Luxury Action Button Base - World-Class Interactive Design
  luxuryActionButton: {
    alignItems: 'center',
    marginBottom: 12,
    width: 56,
    height: 56,
    justifyContent: 'center',
  },
  luxuryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Premium Like Icon - Luxury Heart Design
  luxuryLikeIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 0, 80, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // Premium Comment Icon - Sophisticated Chat Design
  luxuryCommentIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    textShadowColor: 'rgba(66, 165, 245, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // Premium Save Icon - Elegant Bookmark Design
  luxurySaveIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 193, 7, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // Premium Share Icon - Modern Arrow Design
  luxuryShareIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(76, 175, 80, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // Luxury Action Text - Premium Typography
  luxuryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },

  // ==================================================================================
  // AISLEMARTS SIGNATURE SHOPPING BUTTON - LUXURY GOLDEN DESIGN
  // ==================================================================================
  aisleMartsLuxuryShoppingButton: {
    alignItems: 'center',
    marginBottom: 12,
    width: 56,
    height: 56,
    justifyContent: 'center',
  },
  aisleMartsShoppingContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 15,
  },
  aisleMartsShoppingIcon: {
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  aisleMartsShoppingText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },

  // ==================================================================================
  // LUXURY MUSIC BUTTON - PREMIUM AUDIO EXPERIENCE
  // ==================================================================================
  luxuryMusicButton: {
    alignItems: 'center',
    marginBottom: 12,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  luxuryMusicIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  tiktokAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tiktokFollowButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FF0050',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tiktokFollowPlus: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Clean TikTok Action Button Styles (No Background Circles)
  tiktokActionButton: {
    alignItems: 'center',
    marginBottom: 12, // Reduced from 16 to match TikTok compact spacing
    width: 48,
    height: 48,
    justifyContent: 'center',
  },
  tiktokActionIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tiktokActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // AisleMarts Shopping Button Styles (Clean Golden Style)
  aisleShoppingButton: {
    alignItems: 'center',
    marginBottom: 12, // Reduced from 18 to match TikTok compact spacing
    width: 48,
    height: 48,
    justifyContent: 'center',
  },
  aisleShoppingIcon: {
    fontSize: 32,
    color: '#D4AF37',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  aisleShoppingText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
    width: 48,
    height: 48,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
  musicButton: {
    alignItems: 'center',
    marginBottom: 12, // Reduced from 24 to match TikTok compact spacing
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  musicIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  // Enhanced Product Pin Styles
  productPinContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
    minWidth: 250,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  productPinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPinTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  quickBuyButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickBuyText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  productPinDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPinPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  productPinActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartIcon: {
    fontSize: 16,
  },
  wishlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: {
    fontSize: 16,
  },
  // ==================================================================================
  // FULL SCREEN BACKGROUND VIDEO - EVERYTHING OVERLAID ON TOP
  // ==================================================================================
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 1,
  },

  // ==================================================================================
  // OVERLAY NAVIGATION - FLOATING ON TOP OF VIDEO
  // ==================================================================================
  animatedTopNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
  },

  // ==================================================================================
  // LUXURY TRENDING CREATORS SECTION - PREMIUM AISLEMARTS DESIGN
  // ==================================================================================
  trendingSection: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trendingSectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 16,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  trendingCreators: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  creatorItem: {
    alignItems: 'center',
    marginRight: 18,
    width: 85,
  },
  creatorAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8FF 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  creatorAvatarText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(212, 175, 55, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#25f4ee',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#25f4ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  followButton: {
    backgroundColor: 'linear-gradient(135deg, #FF0050 0%, #FF3B30 100%)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});