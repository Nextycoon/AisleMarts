import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ProductReel {
  id: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  video: string;
  thumbnail: string;
  goalTag: string;
  description: string;
  seller: {
    name: string;
    country: string;
    verified: boolean;
  };
  aiInsight: string;
}

interface ProductReelsProps {
  reels: ProductReel[];
  onReelPress?: (reel: ProductReel) => void;
  onAddToCart?: (reel: ProductReel) => void;
  userRole?: 'brand' | 'shopper';
}

// Mock data for demonstration
const MOCK_REELS: ProductReel[] = [
  {
    id: '1',
    title: 'Handcrafted Turkish Coffee Set',
    brand: 'Artisan Brews',
    price: 89.99,
    currency: 'USD',
    video: 'mock-video-1',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjOEI0NTEzIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjIwMCIgcj0iNjAiIGZpbGw9IiNGRkZGRkYiLz4KPHRLEHUGEQ9InQgaWQ9InRleHQiIGZpbGw9IiNGRkZGRkYiPgogIDx0c3BhbiB4PSIxNTAiIHk9IjIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29mZmVlPC90c3Bhbj4KPC90ZXh0Pgo8L3N2Zz4K',
    goalTag: 'Lifestyle',
    description: 'Traditional Turkish coffee experience with modern craftsmanship',
    seller: {
      name: 'Istanbul Artisans',
      country: 'Turkey',
      verified: true,
    },
    aiInsight: 'Perfect for coffee enthusiasts seeking authentic experiences',
  },
  {
    id: '2',
    title: 'Smart Export Invoice Tool',
    brand: 'TechTrade Pro',
    price: 199.99,
    currency: 'USD',
    video: 'mock-video-2',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDA3QUZGIi8+CjxyZWN0IHg9IjUwIiB5PSIxMDAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiByeD0iMTAiLz4KPHRLEHUGEQ9InQgaWQ9InRleHQiIGZpbGw9IiMwMDdBRkYiPgogIDx0c3BhbiB4PSIxNTAiIHk9IjIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW52b2ljZTwvdHNwYW4+CjwvdGV4dD4KPC9zdmc+Cg==',
    goalTag: 'Business',
    description: 'Streamline your international trade documentation',
    seller: {
      name: 'German Tech Solutions',
      country: 'Germany',
      verified: true,
    },
    aiInsight: 'Essential for growing export businesses',
  },
  {
    id: '3',
    title: 'Sustainable Bamboo Dinnerware',
    brand: 'EcoLiving',
    price: 45.99,
    currency: 'USD',
    video: 'mock-video-3',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMzRDNzU5Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNGRkZGRkYiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMjUwIiByPSIzMCIgZmlsbD0iI0ZGRkZGRiIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIyNTAiIHI9IjMwIiBmaWxsPSIjRkZGRkZGIi8+CjwvdGV4dD4KPC9zdmc+Cg==',
    goalTag: 'Sustainability',
    description: 'Eco-friendly dining solution for conscious consumers',
    seller: {
      name: 'Vietnam Eco',
      country: 'Vietnam',
      verified: true,
    },
    aiInsight: 'Trending among environmentally conscious shoppers',
  },
];

export default function ProductReels({
  reels = MOCK_REELS,
  onReelPress,
  onAddToCart,
  userRole = 'shopper',
}: ProductReelsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (autoPlay && reels.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % reels.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * width,
            animated: true,
          });
          return nextIndex;
        });
      }, 4000); // Change reel every 4 seconds

      return () => clearInterval(interval);
    }
  }, [autoPlay, reels.length]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    // Animate the play/pause button
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderReel = (reel: ProductReel, index: number) => (
    <View key={reel.id} style={styles.reelContainer}>
      <TouchableOpacity
        style={styles.reelTouchable}
        onPress={() => onReelPress?.(reel)}
      >
        <Image source={{ uri: reel.thumbnail }} style={styles.reelVideo} />
        
        {/* Play indicator overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="white" />
          </View>
        </View>

        {/* Goal tag */}
        <View style={styles.goalTag}>
          <Text style={styles.goalTagText}>{reel.goalTag}</Text>
        </View>

        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />

        {/* Content overlay */}
        <View style={styles.reelContent}>
          <View style={styles.reelInfo}>
            <Text style={styles.reelTitle} numberOfLines={2}>
              {reel.title}
            </Text>
            <Text style={styles.reelBrand}>{reel.brand}</Text>
            <Text style={styles.reelPrice}>
              {reel.currency} {reel.price.toFixed(2)}
            </Text>
            
            <View style={styles.sellerInfo}>
              <Ionicons 
                name={reel.seller.verified ? "checkmark-circle" : "business"} 
                size={16} 
                color={reel.seller.verified ? "#34C759" : "#FFD700"} 
              />
              <Text style={styles.sellerText}>
                {reel.seller.name} • {reel.seller.country}
              </Text>
            </View>

            <View style={styles.aiInsightContainer}>
              <Ionicons name="sparkles" size={14} color="#FFD700" />
              <Text style={styles.aiInsightText} numberOfLines={2}>
                {reel.aiInsight}
              </Text>
            </View>
          </View>

          <View style={styles.reelActions}>
            {userRole === 'shopper' && (
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => onAddToCart?.(reel)}
              >
                <Ionicons name="bag-add" size={20} color="white" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (reels.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="film-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No product reels available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {userRole === 'brand' ? '🎬 Featured Products' : '🛍️ Discover Products'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {userRole === 'brand' 
            ? 'Video showcases driving engagement' 
            : 'Curated based on your interests'
          }
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
        decelerationRate="fast"
      >
        {reels.map((reel, index) => renderReel(reel, index))}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.pagination}>
          {reels.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={styles.autoPlayButton}
            onPress={toggleAutoPlay}
          >
            <Ionicons
              name={autoPlay ? "pause" : "play"}
              size={16}
              color="white"
            />
            <Text style={styles.autoPlayText}>
              {autoPlay ? "Pause" : "Play"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  reelContainer: {
    width: width,
    flex: 1,
  },
  reelTouchable: {
    flex: 1,
    position: 'relative',
  },
  reelVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  playOverlay: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  goalTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  reelContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
  },
  reelInfo: {
    flex: 1,
    marginRight: 16,
  },
  reelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  reelBrand: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  reelPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  aiInsightContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  aiInsightText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  reelActions: {
    alignItems: 'center',
    gap: 12,
  },
  addToCartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFD700',
  },
  autoPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  autoPlayText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});