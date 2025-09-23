import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface StoryContent {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration: number;
  product?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  poll?: {
    question: string;
    options: string[];
  };
  cta?: {
    text: string;
    action: string;
  };
}

const StoryViewer = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract parameters
  const {
    storyId = '1',
    storyName = 'Unknown',
    isVerified = 'false'
  } = params;

  // Mock story data
  const stories: StoryContent[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://via.placeholder.com/400x800',
      duration: 5000,
      product: {
        id: 'prod_1',
        name: 'Premium Wireless Headphones',
        price: 199.99,
        currency: '$'
      },
      cta: {
        text: 'Shop Now',
        action: 'product'
      }
    },
    {
      id: '2', 
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 6000,
      poll: {
        question: 'Which color do you prefer?',
        options: ['Black', 'White', 'Gold']
      }
    },
    {
      id: '3',
      type: 'image', 
      url: 'https://via.placeholder.com/400x800/D4AF37/FFFFFF',
      duration: 4000,
      cta: {
        text: 'Follow Store',
        action: 'follow'
      }
    }
  ];

  const currentStory = stories[currentStoryIndex];

  useEffect(() => {
    startProgress();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentStoryIndex, isPaused]);

  const startProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!isPaused) {
      progressAnim.setValue(0);
      const duration = currentStory.duration;
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          nextStory();
        }
      });
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      // End of stories, go back to feed
      router.back();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else {
      router.back();
    }
  };

  const pauseStory = () => {
    setIsPaused(true);
    progressAnim.stopAnimation();
  };

  const resumeStory = () => {
    setIsPaused(false);
    startProgress();
  };

  const handleProductPress = () => {
    if (currentStory.product) {
      Alert.alert(
        'Add to Cart',
        `Add ${currentStory.product.name} to your cart?`,
        [
          {
            text: 'Add to Cart',
            onPress: () => {
              console.log('Added to cart:', currentStory.product);
              Alert.alert('Success', 'Product added to cart!');
            }
          },
          {
            text: 'View Details',
            onPress: () => {
              router.push(`/product/${currentStory.product?.id}`);
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleCTAPress = () => {
    if (currentStory.cta) {
      switch (currentStory.cta.action) {
        case 'product':
          handleProductPress();
          break;
        case 'follow':
          Alert.alert('Success', `Now following ${storyName}!`);
          break;
        default:
          console.log('CTA pressed:', currentStory.cta);
      }
    }
  };

  const handleSwipeUp = () => {
    if (currentStory.cta) {
      handleCTAPress();
    } else if (currentStory.product) {
      handleProductPress();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Story Background */}
      <View style={styles.storyBackground}>
        {/* Mock story content */}
        <LinearGradient 
          colors={['#1a1a1a', '#333333', '#1a1a1a']} 
          style={styles.storyContent}
        >
          <Text style={styles.storyPlaceholder}>
            {currentStory.type === 'video' ? '📹' : '📷'}
          </Text>
          <Text style={styles.storyText}>
            {storyName} Story {currentStoryIndex + 1}
          </Text>
        </LinearGradient>
      </View>

      {/* Story Progress Bars */}
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: index === currentStoryIndex 
                    ? progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      })
                    : index < currentStoryIndex ? '100%' : '0%'
                }
              ]}
            />
          </View>
        ))}
      </View>

      {/* Story Header */}
      <View style={styles.storyHeader}>
        <View style={styles.creatorInfo}>
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>
              {String(storyName).charAt(0)}
            </Text>
          </View>
          <View style={styles.creatorDetails}>
            <View style={styles.creatorNameContainer}>
              <Text style={styles.creatorName}>{storyName}</Text>
              {isVerified === 'true' && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.storyTime}>2h ago</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Touch Areas for Navigation */}
      <TouchableOpacity 
        style={styles.leftTouchArea} 
        onPress={previousStory}
        onPressIn={pauseStory}
        onPressOut={resumeStory}
      />
      <TouchableOpacity 
        style={styles.rightTouchArea} 
        onPress={nextStory}
        onPressIn={pauseStory}
        onPressOut={resumeStory}
      />

      {/* Product Showcase */}
      {currentStory.product && (
        <TouchableOpacity 
          style={styles.productShowcase}
          onPress={() => setShowProduct(!showProduct)}
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.productGradient}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{currentStory.product.name}</Text>
              <Text style={styles.productPrice}>
                {currentStory.product.currency}{currentStory.product.price}
              </Text>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity style={styles.productButton} onPress={handleProductPress}>
                <Text style={styles.productButtonText}>🛒</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Poll Interface */}
      {currentStory.poll && (
        <View style={styles.pollContainer}>
          <Text style={styles.pollQuestion}>{currentStory.poll.question}</Text>
          {currentStory.poll.options.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.pollOption}
              onPress={() => Alert.alert('Vote Recorded', `You voted for: ${option}`)}
            >
              <Text style={styles.pollOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Call-to-Action */}
      {currentStory.cta && (
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleCTAPress}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.ctaGradient}>
              <Ionicons name="arrow-up" size={20} color="#000000" />
              <Text style={styles.ctaText}>{currentStory.cta.text}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Swipe Up Indicator */}
      <View style={styles.swipeIndicator}>
        <Ionicons name="chevron-up" size={20} color="#FFFFFF" />
        <Text style={styles.swipeText}>Swipe up</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  storyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyPlaceholder: {
    fontSize: 80,
    marginBottom: 20,
  },
  storyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  storyHeader: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  creatorAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 6,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    padding: 8,
  },
  leftTouchArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width / 2,
    height: '100%',
    zIndex: 5,
  },
  rightTouchArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: width / 2,
    height: '100%',
    zIndex: 5,
  },
  productShowcase: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 10,
  },
  productGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4AF37',
  },
  productActions: {
    marginLeft: 16,
  },
  productButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productButtonText: {
    fontSize: 20,
  },
  pollContainer: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  pollOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pollOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 160,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  ctaButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  swipeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
});

export default StoryViewer;