import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
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
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRefs = useRef<any[]>([]);
  const translateY = useRef(new Animated.Value(0)).current;
  const api = useTikTokAPI();

  // Format count function for dynamic display
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  // Full Screen Animation - Hide/Show Top Navigation and Trending on Scroll
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const topNavTranslateY = useRef(new Animated.Value(0)).current;
  const trendingTranslateY = useRef(new Animated.Value(0)).current;
  
  // Use TikTok API hook for feed data with mock user ID
  const { data: feedData, loading: isLoading, error, refresh, loadMore } = useForYouFeed('test_user_001', true);

  // Mock data with AisleMarts verification system
  // 🔄 INFINITY AISLEMARTS CREATOR POOL
  const creatorPool = [
    {
      id: 'luxefashion',
      name: '@LuxeFashion',
      category: 'fashion',
      tier: 'premium',
      verification: 'goldwave',
      baseEngagement: { likes: [80000, 200000], comments: [5000, 15000], shares: [2000, 8000] },
      contentThemes: ['winter_fashion', 'luxury_brands', 'style_tips', 'outfit_ideas'],
      products: ['coats', 'accessories', 'shoes', 'bags'],
      commissionRate: 0.15,
      bio: 'Premium Fashion & Luxury Lifestyle ✨'
    },
    {
      id: 'techguru',
      name: '@TechGuru',
      category: 'technology',
      tier: 'verified',
      verification: 'bluewave',
      baseEngagement: { likes: [60000, 150000], comments: [3000, 10000], shares: [1500, 5000] },
      contentThemes: ['gadget_reviews', 'tech_tips', 'unboxing', 'comparisons'],
      products: ['smartphones', 'laptops', 'accessories', 'smartwatches'],
      commissionRate: 0.08,
      bio: 'Latest Tech Reviews & Gadgets 📱'
    },
    {
      id: 'fitnessjane',
      name: '@FitnessJane',
      category: 'fitness',
      tier: 'premium',
      verification: 'goldwave',
      baseEngagement: { likes: [90000, 250000], comments: [8000, 20000], shares: [3000, 12000] },
      contentThemes: ['workout_routines', 'fitness_tips', 'nutrition', 'motivation'],
      products: ['workout_gear', 'supplements', 'activewear', 'equipment'],
      commissionRate: 0.12,
      bio: 'Fitness Coach & Wellness Expert 💪'
    },
    {
      id: 'beautyqueen',
      name: '@BeautyQueen',
      category: 'beauty',
      tier: 'premium',
      verification: 'goldwave',
      baseEngagement: { likes: [100000, 300000], comments: [10000, 25000], shares: [4000, 15000] },
      contentThemes: ['makeup_tutorials', 'skincare', 'beauty_tips', 'product_reviews'],
      products: ['cosmetics', 'skincare', 'tools', 'fragrances'],
      commissionRate: 0.18,
      bio: 'Beauty Expert & Makeup Artist 💄'
    },
    {
      id: 'foodiefun',
      name: '@FoodieFun',
      category: 'food',
      tier: 'verified',
      verification: 'bluewave',
      baseEngagement: { likes: [45000, 120000], comments: [2000, 8000], shares: [1000, 4000] },
      contentThemes: ['recipes', 'food_reviews', 'cooking_tips', 'restaurant_visits'],
      products: ['kitchen_tools', 'ingredients', 'cookbooks', 'appliances'],
      commissionRate: 0.10,
      bio: 'Food Lover & Recipe Creator 🍴'
    },
    {
      id: 'traveladdict',
      name: '@TravelAddict',
      category: 'travel',
      tier: 'verified',
      verification: 'bluewave',
      baseEngagement: { likes: [70000, 180000], comments: [4000, 12000], shares: [2500, 9000] },
      contentThemes: ['destinations', 'travel_tips', 'adventures', 'culture'],
      products: ['luggage', 'travel_gear', 'cameras', 'accessories'],
      commissionRate: 0.11,
      bio: 'World Explorer & Travel Guide 🌍'
    },
    {
      id: 'homedecor',
      name: '@HomeDecor',
      category: 'lifestyle',
      tier: 'semi_verified',
      verification: 'greywave',
      baseEngagement: { likes: [30000, 80000], comments: [1500, 5000], shares: [800, 3000] },
      contentThemes: ['home_styling', 'diy_projects', 'organization', 'decor_ideas'],
      products: ['furniture', 'decor', 'organization', 'lighting'],
      commissionRate: 0.09,
      bio: 'Home Styling & Interior Design 🏡'
    },
    {
      id: 'artcreative',
      name: '@ArtCreative',
      category: 'art',
      tier: 'casual',
      verification: 'unverified',
      baseEngagement: { likes: [15000, 45000], comments: [800, 3000], shares: [400, 1500] },
      contentThemes: ['digital_art', 'tutorials', 'creativity', 'inspiration'],
      products: ['art_supplies', 'software', 'prints', 'courses'],
      commissionRate: 0.06,
      bio: 'Digital Artist & Creative Mind 🎨'
    }
  ];

  // 🎬 INFINITY CONTENT VARIATIONS
  const contentVariations = {
    fashion: [
      'Transform your wardrobe with these stunning pieces!',
      'Elevate your style with luxury fashion trends',
      'Discover the latest must-have fashion items',
      'Unleash your inner fashionista with these looks'
    ],
    technology: [
      'Mind-blowing tech that will change your life!',
      'Latest gadgets you need to see right now',
      'Revolutionary technology at your fingertips',
      'Tech innovations that are game-changers'
    ],
    fitness: [
      'Transform your body with this workout routine!',
      'Fitness secrets for amazing results',
      'Get stronger and healthier starting today',
      'Unlock your fitness potential with these tips'
    ],
    beauty: [
      'Glow up with these beauty transformations!',
      'Beauty secrets for that perfect look',
      'Makeup magic that will amaze you',
      'Skincare routine for radiant skin'
    ],
    food: [
      'Delicious recipes you must try today!',
      'Foodie adventures that will inspire you',
      'Cooking hacks for incredible meals',
      'Taste the flavors of amazing cuisine'
    ],
    travel: [
      'Explore breathtaking destinations around the world!',
      'Travel adventures that will inspire wanderlust',
      'Hidden gems waiting to be discovered',
      'Journey to incredible places you never knew existed'
    ],
    lifestyle: [
      'Transform your living space with style!',
      'Home decor ideas for a beautiful space',
      'Lifestyle tips for better living',
      'Create your perfect home sanctuary'
    ],
    art: [
      'Creative art that will blow your mind!',
      'Artistic inspiration for your soul',
      'Digital masterpieces in the making',
      'Unleash creativity with amazing art'
    ]
  };

  // 🔄 INFINITY GENERATION ENGINE
  const generateInfiniteReel = (index: number) => {
    const creatorIndex = index % creatorPool.length;
    const creator = creatorPool[creatorIndex];
    const variation = Math.floor(index / creatorPool.length) % 4;
    
    // Generate realistic engagement based on creator tier
    const likes = Math.floor(Math.random() * (creator.baseEngagement.likes[1] - creator.baseEngagement.likes[0])) + creator.baseEngagement.likes[0];
    const comments = Math.floor(Math.random() * (creator.baseEngagement.comments[1] - creator.baseEngagement.comments[0])) + creator.baseEngagement.comments[0];
    const shares = Math.floor(Math.random() * (creator.baseEngagement.shares[1] - creator.baseEngagement.shares[0])) + creator.baseEngagement.shares[0];
    const saves = Math.floor(likes * (0.1 + Math.random() * 0.1)); // 10-20% of likes
    const music = Math.floor(likes * (0.02 + Math.random() * 0.03)); // 2-5% of likes

    return {
      id: `${creator.id}_${index}`,
      uri: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${['ForBiggerEscapes.mp4', 'BigBuckBunny.mp4', 'ElephantsDream.mp4', 'Sintel.mp4'][index % 4]}`,
      creator: {
        id: creator.id,
        name: creator.name,
        verified: true,
        verificationTier: creator.verification,
        isAffiliated: creator.tier === 'premium',
        affiliatedWith: creator.tier === 'premium' ? `${creator.category}Brand` : null,
        avatar: 'https://via.placeholder.com/50x50',
        bio: creator.bio,
        category: creator.category,
        tier: creator.tier
      },
      likes,
      comments,
      shares,
      saves,
      music,
      caption: contentVariations[creator.category][variation] + ` ${creator.contentThemes[variation % creator.contentThemes.length].replace('_', ' ')}`,
      hashtags: `#${creator.category} #AisleMarts #${creator.contentThemes[variation % creator.contentThemes.length]} #Trending`,
      music_info: {
        title: `${creator.category} Vibes ${variation + 1}`,
        artist: `${creator.name} Mix`
      },
      products: creator.products,
      commissionRate: creator.commissionRate
    };
  };

  // 🔄 INFINITY FEED SYSTEM
  const [infinityReels, setInfinityReels] = useState(() => {
    // Pre-generate initial reels
    return Array.from({ length: 20 }, (_, i) => generateInfiniteReel(i));
  });

  // Load more reels when approaching end
  const loadMoreReels = useCallback(() => {
    const newReels = Array.from({ length: 10 }, (_, i) => 
      generateInfiniteReel(infinityReels.length + i)
    );
    setInfinityReels(prev => [...prev, ...newReels]);
  }, [infinityReels.length]);

  // 🎬 INFINITY STORIES SYSTEM - Phase 1 Implementation
  
  // Story types for each creator category
  const storyTypes = {
    fashion: [
      { type: 'daily_moment', weight: 0.3, templates: ['Morning OOTD', 'Coffee & Style', 'Behind the lens'] },
      { type: 'product_showcase', weight: 0.5, templates: ['New Collection Drop', 'Must-Have Item', 'Style Guide'] },
      { type: 'bts_content', weight: 0.2, templates: ['Photoshoot BTS', 'Design Process', 'Fitting Room'] }
    ],
    technology: [
      { type: 'daily_moment', weight: 0.2, templates: ['Tech Setup', 'Morning Routine', 'Workspace Tour'] },
      { type: 'product_showcase', weight: 0.6, templates: ['Unboxing Experience', 'Feature Demo', 'Comparison Test'] },
      { type: 'bts_content', weight: 0.2, templates: ['Review Setup', 'Testing Lab', 'Content Creation'] }
    ],
    fitness: [
      { type: 'daily_moment', weight: 0.4, templates: ['Morning Workout', 'Healthy Meal', 'Motivation Quote'] },
      { type: 'product_showcase', weight: 0.4, templates: ['Gear Review', 'Supplement Guide', 'Equipment Demo'] },
      { type: 'bts_content', weight: 0.2, templates: ['Workout Prep', 'Training Session', 'Recovery Time'] }
    ],
    beauty: [
      { type: 'daily_moment', weight: 0.3, templates: ['Skincare Routine', 'Getting Ready', 'Self Care'] },
      { type: 'product_showcase', weight: 0.5, templates: ['Product Review', 'Tutorial Sneak', 'Before/After'] },
      { type: 'bts_content', weight: 0.2, templates: ['Makeup Setup', 'Content Filming', 'Product Testing'] }
    ],
    food: [
      { type: 'daily_moment', weight: 0.4, templates: ['Morning Coffee', 'Market Visit', 'Cooking Time'] },
      { type: 'product_showcase', weight: 0.4, templates: ['Recipe Preview', 'Ingredient Focus', 'Kitchen Tool'] },
      { type: 'bts_content', weight: 0.2, templates: ['Prep Work', 'Cooking Process', 'Taste Testing'] }
    ],
    travel: [
      { type: 'daily_moment', weight: 0.5, templates: ['Sunrise View', 'Local Culture', 'Travel Day'] },
      { type: 'product_showcase', weight: 0.3, templates: ['Travel Gear', 'Local Product', 'Packing Tips'] },
      { type: 'bts_content', weight: 0.2, templates: ['Planning Trip', 'Travel Prep', 'Hidden Gems'] }
    ],
    lifestyle: [
      { type: 'daily_moment', weight: 0.4, templates: ['Home Morning', 'Organizing', 'Cozy Vibes'] },
      { type: 'product_showcase', weight: 0.4, templates: ['Decor Item', 'Room Makeover', 'DIY Project'] },
      { type: 'bts_content', weight: 0.2, templates: ['Design Process', 'Room Setup', 'Project Work'] }
    ],
    art: [
      { type: 'daily_moment', weight: 0.3, templates: ['Studio Time', 'Inspiration', 'Creative Flow'] },
      { type: 'product_showcase', weight: 0.4, templates: ['Art Supply', 'Technique Demo', 'Finished Piece'] },
      { type: 'bts_content', weight: 0.3, templates: ['Sketch Process', 'Color Mixing', 'Art Setup'] }
    ]
  };

  // 🕐 STORY EXPIRY SIMULATION (24h cycle)
  const getStoryExpiryStatus = (creatorId: string, storyIndex: number) => {
    const now = new Date();
    const creatorSeed = creatorId.length; // Simple seed based on creator ID
    const storySeed = storyIndex + creatorSeed;
    
    // Simulate different upload times within last 24h
    const hoursAgo = (storySeed % 24) + (now.getMinutes() % 60) / 60;
    const uploadTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    const expiryTime = new Date(uploadTime.getTime() + (24 * 60 * 60 * 1000));
    
    const isExpired = now > expiryTime;
    const timeRemaining = Math.max(0, expiryTime.getTime() - now.getTime());
    const percentRemaining = Math.max(0, (timeRemaining / (24 * 60 * 60 * 1000)) * 100);
    
    return {
      isExpired,
      uploadTime,
      expiryTime,
      timeRemaining,
      percentRemaining,
      hoursRemaining: Math.ceil(timeRemaining / (60 * 60 * 1000))
    };
  };

  // 👁️ VIEWED/UNVIEWED STORY TRACKING
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  
  const markStoryAsViewed = (storyId: string) => {
    setViewedStories(prev => new Set([...prev, storyId]));
  };
  
  const isStoryViewed = (storyId: string) => {
    return viewedStories.has(storyId);
  };

  // 🎬 DYNAMIC STORY GENERATION ENGINE
  const generateCreatorStory = (creator: any, storyIndex: number) => {
    const categoryStories = storyTypes[creator.category] || storyTypes.lifestyle;
    
    // Select story type based on weights
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedStoryType = categoryStories[0];
    
    for (const storyType of categoryStories) {
      cumulativeWeight += storyType.weight;
      if (random <= cumulativeWeight) {
        selectedStoryType = storyType;
        break;
      }
    }
    
    const template = selectedStoryType.templates[storyIndex % selectedStoryType.templates.length];
    const expiryInfo = getStoryExpiryStatus(creator.id, storyIndex);
    const storyId = `${creator.id}_story_${storyIndex}_${selectedStoryType.type}`;
    
    return {
      id: storyId,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorTier: creator.tier,
      verification: creator.verification,
      category: creator.category,
      type: selectedStoryType.type,
      template,
      content: `${template} - ${creator.bio.split('&')[0]}`,
      isViewed: isStoryViewed(storyId),
      expiryInfo,
      hasCommerce: selectedStoryType.type === 'product_showcase',
      commerceProduct: selectedStoryType.type === 'product_showcase' ? creator.products[storyIndex % creator.products.length] : null,
      engagement: {
        views: Math.floor(Math.random() * (creator.baseEngagement.likes[1] * 0.8)) + creator.baseEngagement.likes[0] * 0.3,
        reactions: Math.floor(Math.random() * (creator.baseEngagement.likes[1] * 0.1)) + creator.baseEngagement.likes[0] * 0.05
      }
    };
  };

  // 🔄 INFINITY STORIES GENERATION
  const [infinityStories, setInfinityStories] = useState(() => {
    const stories = [];
    // Generate 2-4 stories per creator
    creatorPool.forEach((creator, creatorIndex) => {
      const numStories = 2 + (creatorIndex % 3); // 2-4 stories per creator
      for (let i = 0; i < numStories; i++) {
        const story = generateCreatorStory(creator, i);
        if (!story.expiryInfo.isExpired) {
          stories.push(story);
        }
      }
    });
    
    // Sort by creator popularity (premium first, then verification tier)
    return stories.sort((a, b) => {
      const creatorA = creatorPool.find(c => c.id === a.creatorId);
      const creatorB = creatorPool.find(c => c.id === b.creatorId);
      
      if (creatorA.tier !== creatorB.tier) {
        const tierOrder = { 'premium': 3, 'verified': 2, 'semi_verified': 1, 'casual': 0 };
        return tierOrder[creatorB.tier] - tierOrder[creatorA.tier];
      }
      
      return creatorA.name.localeCompare(creatorB.name);
    });
  });

  // Generate more stories when needed (endless cycling)
  const loadMoreStories = useCallback(() => {
    const newStories = [];
    creatorPool.forEach((creator, creatorIndex) => {
      const existingCount = infinityStories.filter(s => s.creatorId === creator.id).length;
      const newStoryIndex = existingCount + Math.floor(Math.random() * 10);
      const newStory = generateCreatorStory(creator, newStoryIndex);
      
      if (!newStory.expiryInfo.isExpired) {
        newStories.push(newStory);
      }
    });
    
    setInfinityStories(prev => [...prev, ...newStories]);
  }, [infinityStories.length]);

  const currentVideo = infinityReels[currentIndex] || generateInfiniteReel(0);

  const handleSwipeUp = () => {
    if (currentIndex < infinityReels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Pause current video, play next
      videoRefs.current[currentIndex]?.pauseAsync();
      setTimeout(() => {
        videoRefs.current[currentIndex + 1]?.playAsync();
      }, 100);
      
      // Load more content when approaching the end
      if (currentIndex >= infinityReels.length - 3) {
        loadMoreReels();
      }
    }
    
    // Toggle full screen mode on swipe up - hide top navigation AND stories
    if (!isFullScreen) {
      setIsFullScreen(true);
      Animated.timing(topNavTranslateY, {
        toValue: -200, // Increased to hide both header and stories completely
        duration: 300,
        useNativeDriver: false,
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
        useNativeDriver: false,
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
    setIsLiked(!isLiked);
    console.log('Like pressed for video:', currentVideo.id, 'Liked:', !isLiked);
    // Like API integration would go here
  };

  const handleComment = () => {
    console.log('Comment pressed for video:', currentVideo.id);
    // Navigate to comment screen or show comment modal
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    console.log('Save pressed for video:', currentVideo.id, 'Saved:', !isSaved);
    // Save API integration would go here
  };

  const handleShare = () => {
    console.log('Share pressed for video:', currentVideo.id);
    // Open share sheet
  };

  const handleProductPin = (product: any) => {
    console.log('Product pin pressed:', product);
    // Navigate to product detail page
  };

  const handleRemix = (video: any) => {
    console.log('Remix pressed for video:', video.id);
    // Navigate to remix creation screen with video data (keeping all existing features)
    router.push({
      pathname: '/remix-creator',
      params: {
        videoId: video.id,
        soundId: video.music_info?.title || 'default_sound',
        soundTitle: video.music_info?.title || 'Unknown',
        soundArtist: video.music_info?.artist || 'Unknown Artist',
        originalCreator: video.creator.name,
      }
    });
  };

  const handleStoryPress = (story: any) => {
    console.log('Story pressed:', story.creatorName || story.name);
    // Navigate to story viewer
    router.push({
      pathname: '/story-viewer',
      params: {
        storyId: story.id || story.creatorId,
        storyName: story.creatorName || story.name,
        isVerified: story.verification !== 'unverified' || story.isVerified,
        storyType: story.type || 'default',
        hasCommerce: story.hasCommerce || false,
      }
    });
  };

  // Touch gesture handlers for real scroll detection
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (event: any) => {
    const touch = event.nativeEvent.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (event: any) => {
    const touch = event.nativeEvent.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    const deltaY = touchStart.y - touchEnd.y;
    const deltaX = touchStart.x - touchEnd.x;
    
    // Only process vertical swipes (ignore horizontal)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        // Swiped up - hide header and stories
        handleSwipeUp();
      } else {
        // Swiped down - show header and stories
        handleSwipeDown();
      }
    }
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
        onLoad={() => console.log('Video loaded successfully')}
        onError={(error) => console.log('Video error:', error)}
        onLoadStart={() => console.log('Video loading started')}
      />
      
      {/* Fallback background if video fails to load */}
      <View style={styles.videoFallback}>
        <Text style={styles.videoFallbackText}>🎬 @LuxeFashion Winter Collection</Text>
        <Text style={styles.videoFallbackSubtext}>Luxury Fashion Video</Text>
      </View>
      
      {/* Animated Top Navigation - Overlay on Video */}
      <Animated.View 
        style={[
          styles.animatedTopNav,
          { transform: [{ translateY: topNavTranslateY }] }
        ]}
      >
        <TopNavigation />
        
        {/* AisleMarts Stories Section - Scrolls with header */}
        <View style={styles.storiesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.storiesScrollView}
            contentContainerStyle={styles.storiesContainer}
          >
            {/* Your Story Bubble */}
            <TouchableOpacity style={styles.storyBubble} onPress={() => console.log('Your Story pressed')}>
              <View style={[styles.storyRing, styles.yourStoryRing]}>
                <View style={styles.storyImage}>
                  <Text style={styles.storyImageText}>+</Text>
                </View>
              </View>
              <Text style={styles.storyLabel}>Your Story</Text>
            </TouchableOpacity>

            {/* Dynamic Infinity Stories */}
            {infinityStories.map((story) => {
              const creator = creatorPool.find(c => c.id === story.creatorId);
              if (!creator) return null;
              
              return (
                <TouchableOpacity 
                  key={story.id}
                  style={styles.storyBubble} 
                  onPress={() => {
                    markStoryAsViewed(story.id);
                    handleStoryPress(story);
                  }}
                >
                  <View style={[
                    styles.storyRing,
                    story.isViewed ? styles.viewedStoryRing : styles.activeStoryRing
                  ]}>
                    <View style={styles.storyImage}>
                      <Text style={styles.storyImageText}>
                        {story.creatorName.charAt(1)} {/* Skip @ symbol */}
                      </Text>
                      {/* Verification badge based on tier */}
                      {story.verification !== 'unverified' && (
                        <View style={[
                          styles.verifiedBadge,
                          story.verification === 'goldwave' && styles.goldVerifiedBadge,
                          story.verification === 'bluewave' && styles.blueVerifiedBadge,
                          story.verification === 'greywave' && styles.greyVerifiedBadge
                        ]}>
                          <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                      )}
                      
                      {/* Story type indicator */}
                      {story.type === 'product_showcase' && (
                        <View style={styles.commerceIndicator}>
                          <Text style={styles.commerceIcon}>🛍️</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Story expiry progress ring */}
                    {!story.isViewed && story.expiryInfo.percentRemaining < 50 && (
                      <View style={[
                        styles.expiryRing,
                        { 
                          borderColor: story.expiryInfo.percentRemaining < 20 ? '#FF4444' : '#FFA500',
                          opacity: 0.7
                        }
                      ]} />
                    )}
                  </View>
                  <Text style={styles.storyLabel} numberOfLines={1}>
                    {story.creatorName.substring(1)} {/* Remove @ symbol for display */}
                  </Text>
                  
                  {/* Story content preview */}
                  <Text style={styles.storyContentPreview} numberOfLines={1}>
                    {story.template}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Load more stories button */}
            <TouchableOpacity 
              style={styles.loadMoreStoriesButton} 
              onPress={loadMoreStories}
            >
              <View style={styles.loadMoreRing}>
                <View style={styles.loadMoreIcon}>
                  <Text style={styles.loadMoreText}>...</Text>
                </View>
              </View>
              <Text style={styles.storyLabel}>More</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>
        
      {/* Gesture Handler for Scroll Detection */}
      <View 
        style={styles.gestureArea}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {/* Play/Pause Area */}
        <TouchableOpacity 
          style={styles.playPauseArea} 
          onPress={togglePlayPause}
          activeOpacity={1}
        />
      </View>

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
                    <Text style={styles.refinedGoldIcon}>✓</Text>
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
            <Text style={styles.refinedMusicText}>
              {currentVideo.music_info.title} - {currentVideo.music_info.artist}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Side Actions - Profile stays, others spaced out */}
      <View style={styles.elegantRightSideWithSpacing}>
        {/* Profile Avatar with story ring only, no verification badge */}
        <TouchableOpacity 
          style={styles.elegantAvatarContainer}
          onPress={() => router.push(`/profile/${currentVideo.creator.id}`)}
        >
          <View style={[styles.profileStoryRing, styles.activeStoryRing]}>
            <View style={styles.elegantAvatarInside}>
              <Text style={styles.elegantAvatarText}>L</Text>
            </View>
          </View>
          <View style={styles.elegantFollowButton}>
            <Text style={styles.elegantFollowPlus}>+</Text>
          </View>
        </TouchableOpacity>

        {/* Like Button with Dynamic Count */}
        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={handleLike}>
          <View style={styles.sharpIconContainer}>
            <Text style={[styles.sharpLikeIcon, isLiked && styles.likedHeartIcon]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
          </View>
          <Text style={styles.compactActionText}>{formatCount(currentVideo.likes)}</Text>
        </TouchableOpacity>

        {/* Comment Button with Dynamic Count */}
        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={handleComment}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpCommentIcon}>💬</Text>
          </View>
          <Text style={styles.compactActionText}>{formatCount(currentVideo.comments)}</Text>
        </TouchableOpacity>

        {/* Share Button with Dynamic Count */}
        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={handleShare}>
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpShareIcon}>↗</Text>
          </View>
          <Text style={styles.compactActionText}>{formatCount(currentVideo.shares)}</Text>
        </TouchableOpacity>

        {/* Remix Button */}
        <TouchableOpacity 
          style={styles.compactActionButtonSpaced}
          onPress={() => handleRemix(currentVideo)}
        >
          <View style={styles.sharpIconContainer}>
            <Text style={styles.elegantRemixIcon}>🎬</Text>
          </View>
        </TouchableOpacity>

        {/* Save Button with Dynamic Count */}
        <TouchableOpacity style={styles.compactActionButtonSpaced} onPress={handleSave}>
          <View style={styles.sharpIconContainer}>
            <Text style={[styles.sharpSaveIcon, isSaved && styles.savedIconStyle]}>
              {isSaved ? '📌' : '🔖'}
            </Text>
          </View>
          <Text style={styles.compactActionText}>{formatCount(currentVideo.saves)}</Text>
        </TouchableOpacity>

        {/* Music Button with Dynamic Count */}
        <TouchableOpacity 
          style={styles.compactActionButtonSpaced}
          onPress={() => console.log('Music pressed:', currentVideo.music_info.title)}
        >
          <View style={styles.sharpIconContainer}>
            <Text style={styles.sharpMusicIcon}>🎵</Text>
          </View>
          <Text style={styles.compactActionText}>{formatCount(currentVideo.music)}</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1, // Behind all other content
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
    backgroundColor: 'transparent', // No background interference
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
  // New gesture area that covers the entire screen for real swipe detection
  gestureArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5, // Lower than UI elements but captures gestures
  },

  // Removed incorrect header styles - using original TopNavigation
  playPauseArea: {
    position: 'absolute',
    top: '40%', // Fixed: use percentage string instead of undefined height
    bottom: '40%', // Fixed: use percentage string instead of undefined height
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

  // Refined Verification Containers - Match stories badge exactly
  refinedGoldContainer: {
    width: 18,
    height: 18,
    borderRadius: 9, // Same as stories verifiedBadge
    backgroundColor: '#D4AF37', // Same golden background as stories
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2, // Same border as stories
    borderColor: '#000000', // Same black border as stories
  },
  refinedGoldIcon: {
    color: '#FFFFFF', // Same white checkmark as stories
    fontSize: 10, // Same size as stories
    fontWeight: '900', // Same weight as stories
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
    right: 4, // Moved closer to screen edge (was 14)
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
  elegantAvatarWithStoryRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3, // Thicker border for story ring effect
    borderColor: '#D4AF37', // Gold story ring like stories section
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8, // Slightly stronger glow for story effect
    shadowRadius: 6,
    elevation: 10,
  },
  // Profile Story Ring - Smaller size but same style as stories
  profileStoryRing: {
    width: 48, // Smaller than stories (64) but keeps ring effect
    height: 48,
    borderRadius: 24,
    padding: 2, // Smaller padding for smaller overall size
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  elegantAvatarInside: {
    width: 40, // Smaller inner avatar (was 56 for stories size)
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  // Profile verification badge - matches stories section
  profileVerificationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#D4AF37',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  profileVerificationIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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
    fontSize: 18, // Heart icon size
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 0, 80, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  likedHeartIcon: {
    // Enhanced styling for the red heart when liked
    textShadowColor: 'rgba(255, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  savedIconStyle: {
    // Enhanced styling for the bookmark when saved
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sharpCommentIcon: {
    fontSize: 16, // Comment icon size
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
  // Remix Button Styles (rebranded from repost, same functionality)
  elegantRemixContainerWithPlus: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  elegantRemixIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(34, 197, 94, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  elegantRemixPlusButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#22C55E',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
  },
  elegantRemixPlus: {
    color: '#FFFFFF',
    fontSize: 10,
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
    backgroundColor: '#D4AF37', // Fallback color for React Native Web
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
    backgroundColor: '#FF0050', // Solid color instead of gradient for React Native Web
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

  // ==================================================================================
  // AISLEMARTS STORIES SYSTEM - INSTAGRAM-STYLE WITH E-COMMERCE INTEGRATION
  // ==================================================================================
  storiesSection: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.5)',
    // No position properties - inherits animation from parent
  },
  storiesScrollView: {
    flex: 1,
  },
  storiesContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  storyBubble: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  yourStoryRing: {
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#666666',
  },
  activeStoryRing: {
    backgroundColor: '#D4AF37', // Fallback for React Native Web
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  inactiveStoryRing: {
    backgroundColor: '#333333',
    borderWidth: 2,
    borderColor: '#666666',
  },
  // New story states for infinity system
  viewedStoryRing: {
    backgroundColor: '#444444',
    borderWidth: 2,
    borderColor: '#777777',
    opacity: 0.6,
  },
  goldVerifiedBadge: {
    backgroundColor: '#D4AF37',
  },
  blueVerifiedBadge: {
    backgroundColor: '#1E90FF',
  },
  greyVerifiedBadge: {
    backgroundColor: '#696969',
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  storyImageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  // Commerce indicator for product showcase stories
  commerceIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  commerceIcon: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  // Story expiry progress ring
  expiryRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  storyLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 70,
  },
  // Story content preview under name
  storyContentPreview: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 70,
    marginTop: 2,
  },
  // Load more stories button
  loadMoreStoriesButton: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  loadMoreRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#666666',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  loadMoreIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 20,
    color: '#CCCCCC',
    fontWeight: '600',
  },

  // Repost pill - TikTok style above username for sharing
  repostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  repostIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 6,
  },
  repostText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Video fallback styles
  videoFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  videoFallbackText: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  videoFallbackSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
});