import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Animated,
  PanGestureHandler,
  State,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
    type: 'creator' | 'vendor' | 'user';
  };
  media: {
    type: 'image' | 'video';
    uri: string;
    duration: number; // seconds
  };
  timestamp: string;
  viewed: boolean;
  products?: {
    id: string;
    name: string;
    price: number;
    image: string;
    position: { x: number; y: number };
  }[];
  text?: string;
  backgroundColor?: string;
}

interface StoryCollection {
  userId: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
    type: 'creator' | 'vendor' | 'user';
  };
  stories: Story[];
  hasUnviewed: boolean;
}

const SAMPLE_STORY_COLLECTIONS: StoryCollection[] = [
  {
    userId: 'emma_style',
    user: {
      name: 'Emma Style',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=100&h=100&fit=crop&crop=face',
      verified: true,
      type: 'creator'
    },
    hasUnviewed: true,
    stories: [
      {
        id: 'story1',
        user: {
          name: 'Emma Style',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=100&h=100&fit=crop&crop=face',
          verified: true,
          type: 'creator'
        },
        media: {
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=700&fit=crop',
          duration: 5
        },
        timestamp: '2h ago',
        viewed: false,
        products: [
          {
            id: 'p1',
            name: 'Luxury Silk Dress',
            price: 599,
            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100&h=100&fit=crop',
            position: { x: 0.3, y: 0.6 }
          }
        ],
        text: 'Perfect for tonight\'s gala! ✨'
      },
      {
        id: 'story2',
        user: {
          name: 'Emma Style',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=100&h=100&fit=crop&crop=face',
          verified: true,
          type: 'creator'
        },
        media: {
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=700&fit=crop',
          duration: 5
        },
        timestamp: '1h ago',
        viewed: false,
        text: 'Behind the scenes of today\'s shoot 📸'
      }
    ]
  },
  {
    userId: 'luxury_brands',
    user: {
      name: 'Luxury Brands',
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      verified: true,
      type: 'vendor'
    },
    hasUnviewed: true,
    stories: [
      {
        id: 'story3',
        user: {
          name: 'Luxury Brands',
          avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
          verified: true,
          type: 'vendor'
        },
        media: {
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=700&fit=crop',
          duration: 5
        },
        timestamp: '30m ago',
        viewed: false,
        products: [
          {
            id: 'p2',
            name: 'Designer Handbag',
            price: 899,
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
            position: { x: 0.5, y: 0.4 }
          }
        ],
        text: 'Flash Sale: 40% OFF today only! 🔥'
      }
    ]
  },
  {
    userId: 'tech_guru',
    user: {
      name: 'Tech Guru',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      verified: true,
      type: 'creator'
    },
    hasUnviewed: false,
    stories: [
      {
        id: 'story4',
        user: {
          name: 'Tech Guru',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          verified: true,
          type: 'creator'
        },
        media: {
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=700&fit=crop',
          duration: 5
        },
        timestamp: '4h ago',
        viewed: true,
        products: [
          {
            id: 'p3',
            name: 'Smart Monitor 4K',
            price: 699,
            image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=100&h=100&fit=crop',
            position: { x: 0.4, y: 0.3 }
          }
        ],
        text: 'My new workspace setup is insane! 💻'
      }
    ]
  }
];

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const [storyCollections, setStoryCollections] = useState<StoryCollection[]>(SAMPLE_STORY_COLLECTIONS);
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [paused, setPaused] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  const progressRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentCollection = storyCollections[currentCollectionIndex];
  const currentStory = currentCollection?.stories[currentStoryIndex];

  useEffect(() => {
    if (currentStory && !paused) {
      startProgress();
    }

    return () => {
      if (progressRef.current) {
        progressRef.current.stop();
      }
    };
  }, [currentCollectionIndex, currentStoryIndex, paused]);

  const startProgress = () => {
    if (!currentStory) return;

    setProgress(new Animated.Value(0));
    
    progressRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: currentStory.media.duration * 1000,
      useNativeDriver: false
    });

    progressRef.current.start(({ finished }) => {
      if (finished) {
        nextStory();
      }
    });
  };

  const pauseProgress = () => {
    setPaused(true);
    if (progressRef.current) {
      progressRef.current.stop();
    }
  };

  const resumeProgress = () => {
    setPaused(false);
  };

  const nextStory = () => {
    if (currentStoryIndex < currentCollection.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      nextCollection();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      previousCollection();
    }
  };

  const nextCollection = () => {
    if (currentCollectionIndex < storyCollections.length - 1) {
      setCurrentCollectionIndex(currentCollectionIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      router.back();
    }
  };

  const previousCollection = () => {
    if (currentCollectionIndex > 0) {
      setCurrentCollectionIndex(currentCollectionIndex - 1);
      setCurrentStoryIndex(0);
    } else {
      router.back();
    }
  };

  const handleProductTap = (product: any) => {
    Alert.alert(
      'Shop the Look',
      `${product.name} - $${product.price}`,
      [
        { text: 'View Product', onPress: () => console.log('Navigate to product') },
        { text: 'Add to Cart', onPress: () => console.log('Add to cart') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleScreenTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    const screenWidth = width;
    
    if (locationX < screenWidth / 3) {
      // Left third - previous story
      previousStory();
    } else if (locationX > (screenWidth * 2) / 3) {
      // Right third - next story
      nextStory();
    } else {
      // Middle third - toggle products
      setShowProducts(!showProducts);
    }
  };

  const renderProgressBars = () => (
    <View style={styles.progressContainer}>
      {currentCollection.stories.map((_, index) => (
        <View key={index} style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: index === currentStoryIndex 
                  ? progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  : index < currentStoryIndex ? '100%' : '0%'
              }
            ]}
          />
        </View>
      ))}
    </View>
  );

  const renderUserHeader = () => (
    <View style={styles.userHeader}>
      <View style={styles.userInfo}>
        <View style={[
          styles.userAvatar, 
          { borderColor: currentCollection.user.type === 'creator' ? '#E8C968' : 
                          currentCollection.user.type === 'vendor' ? '#00BCD4' : '#9C27B0' }
        ]}>
          <Text style={styles.userAvatarText}>
            {currentCollection.user.name.charAt(0)}
          </Text>
          {currentCollection.user.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{currentCollection.user.name}</Text>
          <Text style={styles.storyTime}>{currentStory?.timestamp}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductStickers = () => {
    if (!showProducts || !currentStory?.products) return null;

    return (
      <>
        {currentStory.products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[
              styles.productSticker,
              {
                left: width * product.position.x - 20,
                top: height * product.position.y - 20,
              }
            ]}
            onPress={() => handleProductTap(product)}
          >
            <LinearGradient
              colors={['#E8C968', '#D4AF37']}
              style={styles.productStickerGradient}
            >
              <Text style={styles.productStickerIcon}>🛍️</Text>
            </LinearGradient>
            
            <View style={styles.productTooltip}>
              <Text style={styles.productTooltipName}>{product.name}</Text>
              <Text style={styles.productTooltipPrice}>${product.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderStoryText = () => {
    if (!currentStory?.text) return null;

    return (
      <View style={styles.storyTextContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.storyTextGradient}
        >
          <Text style={styles.storyText}>{currentStory.text}</Text>
        </LinearGradient>
      </View>
    );
  };

  const renderShopSwipeUp = () => {
    if (!currentStory?.products || currentStory.products.length === 0) return null;

    return (
      <View style={styles.swipeUpContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.swipeUpGradient}
        >
          <TouchableOpacity 
            style={styles.swipeUpButton}
            onPress={() => setShowProducts(!showProducts)}
          >
            <LinearGradient
              colors={['#E8C968', '#D4AF37']}
              style={styles.swipeUpButtonGradient}
            >
              <Text style={styles.swipeUpButtonText}>
                Shop the Look ({currentStory.products.length})
              </Text>
              <Text style={styles.swipeUpArrow}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  if (!currentStory) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.noStoriesText}>No stories available</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { paddingTop: insets.top }]}
      activeOpacity={1}
      onPress={handleScreenTap}
      onLongPress={pauseProgress}
      onPressOut={resumeProgress}
    >
      {/* Story Background */}
      <ImageBackground
        source={{ uri: currentStory.media.uri }}
        style={styles.storyBackground}
        imageStyle={styles.storyBackgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.3)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Progress Bars */}
        {renderProgressBars()}

        {/* User Header */}
        {renderUserHeader()}

        {/* Product Stickers */}
        {renderProductStickers()}

        {/* Story Text */}
        {renderStoryText()}

        {/* Shop Swipe Up */}
        {renderShopSwipeUp()}

        {/* Touch Areas (Invisible) */}
        <View style={styles.touchAreas}>
          <TouchableOpacity style={styles.leftTouchArea} onPress={previousStory} />
          <TouchableOpacity style={styles.rightTouchArea} onPress={nextStory} />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  storyBackgroundImage: {
    // No border radius for full-screen effect
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    position: 'relative',
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifiedBadge: {
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
  verifiedIcon: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  storyTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  productSticker: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 100,
  },
  productStickerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  productStickerIcon: {
    fontSize: 20,
  },
  productTooltip: {
    position: 'absolute',
    top: -60,
    left: -30,
    width: 100,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8C968',
  },
  productTooltipName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
    textAlign: 'center',
  },
  productTooltipPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8C968',
  },
  storyTextContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  storyTextGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  storyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  swipeUpContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  swipeUpGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  swipeUpButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  swipeUpButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  swipeUpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  swipeUpArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  touchAreas: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  leftTouchArea: {
    flex: 1,
  },
  rightTouchArea: {
    flex: 1,
  },
  noStoriesText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
  },
});