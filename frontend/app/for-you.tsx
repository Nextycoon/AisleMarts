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
import TopNavigation from '../src/components/TopNavigation';
import FloatingAIAssistant from '../src/components/FloatingAIAssistant';
import TabNavigator from './navigation/TabNavigator';
import { useForYouFeed, useTikTokAPI } from '../src/hooks/useTikTokAPI';

const { width, height } = Dimensions.get('window');

// Mock data for trending creators
const mockTrendingCreators = [
  { name: 'Alice', isLive: true },
  { name: 'Bob', isLive: false },
  { name: 'Carol', isLive: true },
  { name: 'David', isLive: false },
  { name: 'Eva', isLive: true },
  { name: 'Frank', isLive: false },
];

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

  // Mock data with AisleMarts verification system
  const forYouFeed = [
    {
      id: 1,
      uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      creator: {
        id: 'luxefashion',
        name: '@LuxeFashion',
        verified: true,
        verificationTier: 'goldwave', // bluewave, goldwave, greywave
        isAffiliated: false,
        affiliatedWith: null,
        avatar: 'https://via.placeholder.com/50x50',
      },
      caption: '✨ Transform your winter wardrobe with these chic layers! Perfect for staying stylish in cold weather ❄️',
      hashtags: '#WinterFashion #LuxeStyle #TrendingNow #ShopNow',
      music: {
        title: 'Winter Vibes - Chill Beats',
        artist: 'LoFi Studio',
      },
      sound: {
        id: 'sound_1',
        title: 'Winter Vibes - Chill Beats',
        artist: 'LoFi Studio'
      },
      stats: {
        ratings: 127300,
        reviews: 8200,
        shares: 3100,
        saves: 12400,
        views: 1420000
      },
      products: [
        {
          id: 'prod_1',
          title: 'Premium Winter Coat',
          price: 299.99,
          currency: '$',
          image: 'https://via.placeholder.com/60x60',
        },
        {
          id: 'prod_2',
          title: 'Luxury Scarf',
          price: 89.99,
          currency: '$',
          image: 'https://via.placeholder.com/60x60',
        }
      ],
      safety: {
        familySafe: true,
        parentalApproval: false,
        contentWarning: false
      }
    },
    // Add more mock data as needed...
  ];

  const currentVideo = forYouFeed[currentIndex] || {
    id: 1,
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    creator: {
      id: 'luxefashion',
      name: '@LuxeFashion',
      verified: true,
      avatar: 'https://via.placeholder.com/50x50',
    },
    caption: '✨ Transform your winter wardrobe with these chic layers!',
    hashtags: '#WinterFashion #LuxeStyle #TrendingNow #ShopNow',
    music: {
      title: 'Winter Vibes - Chill Beats',
      artist: 'LoFi Studio',
    },
    sound: {
      id: 'sound_1',
      title: 'Winter Vibes - Chill Beats',
      artist: 'LoFi Studio'
    },
    stats: {
      ratings: 127300,
      reviews: 8200,
      shares: 3100,
      saves: 12400,
      views: 1420000
    },
    products: [
      {
        id: 'prod_1',
        title: 'Premium Winter Coat',
        price: 299.99,
        currency: '$',
        image: 'https://via.placeholder.com/60x60',
      },
    ],
    safety: {
      familySafe: true,
      parentalApproval: false,
      contentWarning: false
    }
  };

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
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      videoRefs.current[currentIndex]?.pauseAsync();
    } else {
      videoRefs.current[currentIndex]?.playAsync();
    }
  };

  const handleRating = () => {
    console.log('Rating pressed for video:', currentVideo.id);
    // Rating API integration would go here
  };

  const handleReview = () => {
    console.log('Review pressed for video:', currentVideo.id);
    // Navigate to review screen or show review modal
  };

  const handleShare = () => {
    console.log('Share pressed for video:', currentVideo.id);
    // Open share sheet
  };

  const handleProductPin = (product: any) => {
    console.log('Product pin pressed:', product);
    // Navigate to product detail page
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

      {/* Left Side - Creator Info moved down to above bottom navigation */}
      <View style={styles.leftSideMovedDown}>
        <View style={styles.elegantCreatorInfo}>
          <View style={styles.refinedCreatorNameContainer}>
            <Text style={styles.refinedCreatorName}>{currentVideo.creator.name}</Text>
            {currentVideo.creator.verified && (
              <View style={[
                styles.refinedVerifiedBadge,
                styles[`refined${currentVideo.creator.verificationTier}Badge`]
              ]}>
                {currentVideo.creator.verificationTier === 'goldwave' && (
                  <View style={styles.refinedGoldContainer}>
                    <Text style={styles.refinedGoldIcon}>✦</Text>
                  </View>
                )}
                {currentVideo.creator.verificationTier === 'bluewave' && (
                  <View style={styles.refinedBlueContainer}>
                    <Text style={styles.refinedBlueCheckmark}>✓</Text>
                  </View>
                )}
                {currentVideo.creator.verificationTier === 'greywave' && (
                  <View style={styles.refinedGreyContainer}>
                    <Text style={styles.refinedGreyCheckmark}>✓</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <Text style={styles.refinedCaption}>{currentVideo.caption}</Text>
          <Text style={styles.refinedHashtags}>{currentVideo.hashtags}</Text>
          <View style={styles.elegantMusicInfo}>
            <View style={styles.refinedMusicIconContainer}>
              <Text style={styles.refinedMusicIcon}>♪</Text>
            </View>
            <Text style={styles.refinedMusicText}>{currentVideo.sound.title}</Text>
          </View>
        </View>
      </View>

      {/* Right Side Actions - Profile stays, others spaced out */}
      <View style={styles.elegantRightSideWithSpacing}>
        {/* Profile Avatar - Keep in same position */}
        <TouchableOpacity 
          style={styles.elegantAvatarContainer}
          onPress={() => router.push(`/profile/${currentVideo.creator.id}`)}
        >
          <View style={styles.elegantAvatar}>
            <Text style={styles.elegantAvatarText}>L</Text>
          </View>
          <View style={styles.elegantFollowButton}>
            <Text style={styles.elegantFollowPlus}>+</Text>
          </View>
        </TouchableOpacity>

        {/* Other 6 Icons with increased spacing */}
        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={handleLike}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpLikeIcon}>♡</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.likes.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={handleComment}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpCommentIcon}>💬</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.comments.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={() => console.log('Save pressed')}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpSaveIcon}>📌</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.saves.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={handleShare}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpShareIcon}>↗</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.shares.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.elegantCartContainerWithPlus}
          onPress={() => setShowProducts(!showProducts)}
        >
          <View style={styles.sharpIconContainer}>
            <Text style={styles.elegantCartIcon}>🛍️</Text>
          </View>
          <View style={styles.elegantCartPlusButton}>
            <Text style={styles.elegantCartPlus}>+</Text>
          </View>
        </TouchableOpacity>

        {/* Music button - positioned to stay above bottom nav */}
        <TouchableOpacity 
          style={styles.compactMusicButtonFinal}
          onPress={() => console.log('Music pressed:', currentVideo.sound.title)}
        >
          <View style={styles.sharpMusicContainer}>
            <Text style={styles.sharpMusicIcon}>♪</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Product Pins - AisleMarts Shopping Feature */}
      <View style={styles.productPinsContainer}>
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

      {/* AI Assistant Overlay - Positioned in exact alignment with 7 action icons */}
      <FloatingAIAssistant bottom={485} right={10} />

      {/* Bottom Navigation Overlay */}
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
  
  // ==================================================================================
  // FULL SCREEN BACKGROUND VIDEO - COMPLETE EDGE TO EDGE
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
  // AI ASSISTANT POSITIONED UNDER ALL 7 ICONS - HIGHLY VISIBLE
  // ==================================================================================
  aiAssistantOverlay: {
    position: 'absolute',
    bottom: 100, // Moved up more to ensure visibility
    right: 16, // Slightly adjusted right position
    zIndex: 30, // Maximum z-index to ensure visibility
    width: 60, // Explicit width
    height: 60, // Explicit height
  },
  aiAssistantPosition: {
    position: 'absolute',
    top: 0, // Override internal top position
    right: 0, // Override internal right position
    bottom: undefined, // Clear any internal bottom positioning
    left: undefined, // Clear any internal left positioning
  },
  bottomNavOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Highest z-index for navigation
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent background
  },

  // Touch Areas
  swipeUpArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    zIndex: 5,
  },
  swipeDownArea: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: height * 0.4,
    zIndex: 5,
  },
  playPauseArea: {
    position: 'absolute',
    top: height * 0.4,
    bottom: height * 0.4,
    left: 0,
    right: 100,
    zIndex: 5,
  },

  leftSide: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 100,
    zIndex: 12,
  },

  // Creator info moved down to above bottom navigation
  leftSideMovedDown: {
    position: 'absolute',
    bottom: 80, // Moved down to be just above bottom navigation
    left: 20,
    right: 100,
    zIndex: 12,
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
  // ELEGANT REFINED REDESIGN - COMPACT & SOPHISTICATED
  // ==================================================================================
  
  // Elegant Creator Info
  elegantCreatorInfo: {
    marginBottom: 16,
  },
  refinedCreatorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  refinedCreatorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
  
  // Refined Verification Badges - Smaller & Sharper
  refinedVerifiedBadge: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },

  // Refined Verification Containers
  refinedGoldContainer: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refinedGoldIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  refinedBlueContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refinedBlueCheckmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  refinedGreyContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#696969',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refinedGreyCheckmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  // Refined Content Styling
  refinedCaption: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  refinedHashtags: {
    color: '#1E90FF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Elegant Music Info - Compact Design
  elegantMusicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  refinedMusicIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 144, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  refinedMusicIcon: {
    fontSize: 12,
    color: '#1E90FF',
    fontWeight: '600',
  },
  refinedMusicText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ==================================================================================
  // ELEGANT COMPACT RIGHT-SIDE ACTIONS - ALL 7 ICONS FULLY VISIBLE
  // ==================================================================================
  elegantRightSide: {
    position: 'absolute',
    right: 14,
    bottom: 120, // Moved up significantly more to ensure all 7 icons are fully visible
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 320, // Increased height to ensure all 7 icons fit properly
    zIndex: 15,
  },

  // New spaced version with increased spacing between icons - moved down to bottom
  elegantRightSideWithSpacing: {
    position: 'absolute',
    right: 14,
    bottom: 70, // Positioned properly above bottom navigation
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 350, // Adjusted height to fit above navigation
    zIndex: 15,
  },

  // Elegant Avatar - Compact Premium Design
  elegantAvatarContainer: {
    alignItems: 'center',
    marginBottom: 18, // Increased spacing between profile avatar and likes
    position: 'relative',
  },
  elegantAvatar: {
    width: 44, // Smaller size
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 8,
  },
  elegantAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elegantFollowButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FF0050',
    width: 20, // Smaller follow button
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
  },
  elegantFollowPlus: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Compact Sharp Action Buttons
  compactActionButton: {
    alignItems: 'center',
    marginBottom: 8, // Reduced spacing
    width: 44, // Smaller width
    height: 44, // Smaller height
    justifyContent: 'center',
  },

  // Spaced version with equal margin for better spacing
  compactActionButtonSpaced: {
    alignItems: 'center',
    marginBottom: 12, // Reduced for more equal spacing
    width: 44, // Same width
    height: 44, // Same height
    justifyContent: 'center',
  },
  sharpIconContainer: {
    width: 38, // Smaller container
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  // Sharp Compact Icons
  sharpLikeIcon: {
    fontSize: 18, // Smaller icons
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 0, 80, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sharpCommentIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(30, 144, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sharpSaveIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 193, 7, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sharpShareIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(76, 175, 80, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sharpLiveIcon: {
    fontSize: 18,
    color: '#FF0050', // Bright red for LIVE
    fontWeight: '600',
    textShadowColor: 'rgba(255, 0, 80, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Compact Action Text
  compactActionText: {
    color: '#FFFFFF',
    fontSize: 11, // Smaller text
    fontWeight: '700',
    marginTop: 2, // Reduced margin
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.2,
  },

  // Elegant Shopping Button - Compact Signature Design
  elegantShoppingButton: {
    alignItems: 'center',
    marginBottom: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
  },

  // Spaced version of shopping button
  elegantShoppingButtonSpaced: {
    alignItems: 'center',
    marginBottom: 12, // Equal spacing for consistency
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  elegantShoppingContainer: {
    width: 40, // Smaller shopping button
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 10,
  },
  elegantShoppingIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elegantCartContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent', // Transparent background
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)', // White border
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  elegantCartIcon: {
    fontSize: 18, // Same as other sharp icons
    color: '#FFFFFF', // Force white color
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elegantCartContainerWithPlus: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  elegantCartPlusButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FF0050',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
  },
  elegantCartPlus: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  elegantShoppingText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },

  // Compact Music Button
  compactMusicButton: {
    alignItems: 'center',
    marginBottom: 8,
    width: 40, // Smallest button
    height: 40,
    justifyContent: 'center',
  },

  // Final music button positioned to stay above bottom nav
  compactMusicButtonFinal: {
    alignItems: 'center',
    marginBottom: 20, // Increased spacing to stay above bottom nav
    width: 40, // Same size as original
    height: 40,
    justifyContent: 'center',
  },
  sharpMusicContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  sharpMusicIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ==================================================================================
  // OVERLAY CONTENT - FLOATING ON TOP OF VIDEO
  // ==================================================================================
  bottomContent: {
    position: 'absolute',
    bottom: 80, // Above bottom navigation
    left: 20,
    right: 80, // Leave space for right-side actions
    zIndex: 12, // Appear on top of video
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorInfoContainer: {
    flex: 1,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  verifiedIcon: {
    marginLeft: 6,
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
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  musicText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  bottomCreatorInfo: {
    marginBottom: 16,
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

  // Product Pins
  productPinsContainer: {
    position: 'absolute',
    left: 20,
    bottom: 100,
    zIndex: 10,
  },
  productPin: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  productPinContainer: {
    flex: 1,
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
    padding: 8,
    borderRadius: 20,
  },
  addToCartIcon: {
    fontSize: 16,
  },
  wishlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  wishlistIcon: {
    fontSize: 16,
  },
  approvalRequired: {
    color: '#FFD700',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});