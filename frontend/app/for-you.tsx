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
        likes: 127300,
        comments: 8200,
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
      likes: 127300,
      comments: 8200,
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

  const handleLike = () => {
    console.log('Like pressed for video:', currentVideo.id);
    // TikTok API integration would go here
  };

  const handleComment = () => {
    console.log('Comment pressed for video:', currentVideo.id);
    // Navigate to comment screen or show comment modal
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

      {/* Left Side - Video Info */}
      <View style={styles.leftSide}>
        <View style={styles.bottomCreatorInfo}>
          <View style={styles.stylishCreatorNameContainer}>
            <Text style={styles.stylishCreatorName}>{currentVideo.creator.name}</Text>
            {currentVideo.creator.verified && (
              <View style={[
                styles.modernVerifiedBadge,
                styles[`modern${currentVideo.creator.verificationTier}Badge`]
              ]}>
                {currentVideo.creator.verificationTier === 'goldwave' && (
                  <View style={styles.goldWaveContainer}>
                    <Text style={styles.modernGoldIcon}>◆</Text>
                  </View>
                )}
                {currentVideo.creator.verificationTier === 'bluewave' && (
                  <View style={styles.blueWaveContainer}>
                    <Text style={styles.modernBlueCheckmark}>✓</Text>
                  </View>
                )}
                {currentVideo.creator.verificationTier === 'greywave' && (
                  <View style={styles.greyWaveContainer}>
                    <Text style={styles.modernGreyCheckmark}>✓</Text>
                  </View>
                )}
              </View>
            )}
            {currentVideo.creator.isAffiliated && (
              <View style={styles.modernAffiliationBadge}>
                <Text style={styles.modernAffiliationText}>
                  Verified by {currentVideo.creator.affiliatedWith}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.stylishCaption}>{currentVideo.caption}</Text>
          <Text style={styles.stylishHashtags}>{currentVideo.hashtags}</Text>
          <View style={styles.modernMusicInfo}>
            <View style={styles.musicIconContainer}>
              <Text style={styles.modernMusicIcon}>♪</Text>
            </View>
            <Text style={styles.stylishMusicText}>{currentVideo.sound.title}</Text>
            <View style={styles.musicVisualizerContainer}>
              <View style={[styles.musicBar, styles.bar1]} />
              <View style={[styles.musicBar, styles.bar2]} />
              <View style={[styles.musicBar, styles.bar3]} />
              <View style={[styles.musicBar, styles.bar4]} />
            </View>
          </View>
        </View>
      </View>

      {/* Right Side Actions - Elegant Compact Design */}
      <View style={styles.elegantRightSide}>
        {/* Elegant Profile Button - Compact Premium Design */}
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

        {/* Compact Action Icons - Sharp & Organized */}
        <TouchableOpacity style={styles.compactActionButton} onPress={handleLike}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpLikeIcon}>♡</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.likes.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.compactActionButton} onPress={handleComment}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpCommentIcon}>💬</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.comments.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.compactActionButton} onPress={() => console.log('Save pressed')}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpSaveIcon}>📌</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.saves.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.compactActionButton} onPress={handleShare}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpShareIcon}>↗</Text>
          </View>
          <Text style={styles.compactActionText}>{currentVideo.stats.shares.toLocaleString()}</Text>
        </TouchableOpacity>

        {/* AisleMarts Signature Shopping - Compact Elegant Design */}
        <TouchableOpacity 
          style={styles.elegantShoppingButton}
          onPress={() => setShowProducts(!showProducts)}
        >
          <View style={styles.elegantShoppingContainer}>
            <Text style={styles.elegantShoppingIcon}>🛍</Text>
          </View>
          <Text style={styles.elegantShoppingText}>Shop</Text>
        </TouchableOpacity>

        {/* Compact Music Button - Sharp Design */}
        <TouchableOpacity 
          style={styles.compactMusicButton}
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

      {/* AI Assistant Overlay */}
      <View style={styles.aiAssistantOverlay}>
        <FloatingAIAssistant />
      </View>

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
  // STYLISH MODERN REDESIGN - CREATOR INFO & VERIFICATION SYSTEM
  // ==================================================================================
  stylishCreatorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stylishCreatorName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  
  // Modern Verification Badge System
  modernVerifiedBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 10,
  },

  // Modern BlueWave Badge
  modernbluewaveBadge: {
    borderRadius: 12,
  },
  blueWaveContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E90FF',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modernBlueCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  // Modern GoldWave Badge (Square Diamond)
  moderngoldwaveBadge: {
    borderRadius: 6,
  },
  goldWaveContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFA500 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  modernGoldIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Modern GreyWave Badge
  moderngreywaveBadge: {
    borderRadius: 12,
  },
  greyWaveContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#696969',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#696969',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modernGreyCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  // Modern Affiliation Badge
  modernAffiliationBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  modernAffiliationText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Stylish Caption and Content
  stylishCaption: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
  stylishHashtags: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },

  // Modern Music Info with Visualizer
  modernMusicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  musicIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 144, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modernMusicIcon: {
    fontSize: 16,
    color: '#1E90FF',
    fontWeight: '700',
  },
  stylishMusicText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicVisualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  musicBar: {
    width: 3,
    backgroundColor: '#1E90FF',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  bar1: { height: 8 },
  bar2: { height: 12 },
  bar3: { height: 6 },
  bar4: { height: 10 },

  // ==================================================================================
  // STYLISH MODERN RIGHT-SIDE ACTIONS - PREMIUM REDESIGN
  // ==================================================================================
  modernRightSide: {
    position: 'absolute',
    right: 16,
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 350,
    zIndex: 15,
  },

  // Modern Avatar Container
  modernAvatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  modernAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFA500 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 15,
    position: 'relative',
  },
  avatarGlowEffect: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    top: -5,
    left: -5,
    zIndex: -1,
  },
  modernAvatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modernFollowButton: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'linear-gradient(135deg, #FF0050 0%, #FF3B30 50%, #DC143C 100%)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 12,
  },
  modernFollowPlus: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Modern Action Button Base
  modernActionButton: {
    alignItems: 'center',
    marginBottom: 14,
    width: 60,
    height: 60,
    justifyContent: 'center',
  },
  modernIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    position: 'relative',
  },

  // Modern Glow Effects for Each Action
  modernLikeGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 0, 80, 0.15)',
    top: -5,
    left: -5,
  },
  modernCommentGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(30, 144, 255, 0.15)',
    top: -5,
    left: -5,
  },
  modernSaveGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    top: -5,
    left: -5,
  },
  modernShareGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    top: -5,
    left: -5,
  },

  // Modern Action Icons
  modernLikeIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 0, 80, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  modernCommentIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(30, 144, 255, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  modernSaveIcon: {
    fontSize: 30,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 193, 7, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  modernShareIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(76, 175, 80, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  // Modern Action Text
  modernActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },

  // ==================================================================================
  // AISLEMARTS SIGNATURE SHOPPING BUTTON - ULTRA PREMIUM REDESIGN
  // ==================================================================================
  aisleMartsSignatureButton: {
    alignItems: 'center',
    marginBottom: 14,
    width: 60,
    height: 60,
    justifyContent: 'center',
  },
  signatureShoppingContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(212, 175, 55, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.8)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 20,
    position: 'relative',
  },
  signatureGoldenGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    top: -5,
    left: -5,
  },
  signatureShoppingIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  signatureShoppingText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },

  // Modern Music Button
  modernMusicButton: {
    alignItems: 'center',
    marginBottom: 14,
    width: 54,
    height: 54,
    justifyContent: 'center',
  },
  modernMusicContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    position: 'relative',
  },
  musicButtonGlow: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -5,
    left: -5,
  },
  modernMusicButtonIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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