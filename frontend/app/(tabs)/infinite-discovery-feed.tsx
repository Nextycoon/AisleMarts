import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const InfiniteDiscoveryFeed = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [personalizationScore, setPersonalizationScore] = useState(0.92);
  const [feedPage, setFeedPage] = useState(1);
  const flatListRef = useRef<FlatList>(null);

  const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

  useEffect(() => {
    loadInitialFeed();
  }, []);

  const loadInitialFeed = async () => {
    try {
      setLoading(true);
      
      const mockFeedItems = Array.from({ length: 20 }, (_, index) => ({
        id: `feed_item_${index + 1}`,
        type: ['video', 'image', 'carousel', 'product_showcase'][Math.floor(Math.random() * 4)],
        title: [
          'Luxury Fashion Trends 2025',
          'Smart Home Tech Revolution', 
          'Sustainable Living Guide',
          'Gourmet Cooking Essentials',
          'Fitness Transformation Journey',
          'Travel Photography Tips',
          'Minimalist Interior Design',
          'Skincare Routine Perfection'
        ][index % 8],
        creator: `@creator${index + 1}`,
        thumbnail: `https://picsum.photos/400/600?random=${index}`,
        engagementScore: Math.random() * 0.4 + 0.6,
        conversionPrediction: Math.random() * 0.3 + 0.1,
        personalizationMatch: Math.random() * 0.3 + 0.7,
        featuredProducts: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
          id: `product_${index}_${i}`,
          name: ['Designer Handbag', 'Smart Watch', 'Organic Skincare', 'Yoga Mat'][i % 4],
          price: Math.floor(Math.random() * 300) + 50,
          image: `https://picsum.photos/200/200?random=${index + i + 100}`
        })),
        triggers: ['trending', 'personalized', 'social_proof', 'scarcity'][Math.floor(Math.random() * 4)],
        stats: {
          likes: Math.floor(Math.random() * 10000) + 1000,
          comments: Math.floor(Math.random() * 1000) + 100,
          shares: Math.floor(Math.random() * 500) + 50,
          saves: Math.floor(Math.random() * 2000) + 200,
          views: Math.floor(Math.random() * 100000) + 10000
        }
      }));

      setFeedItems(mockFeedItems);
    } catch (error) {
      console.error('Error loading feed:', error);
      Alert.alert('Error', 'Failed to load discovery feed');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreFeedItems = async () => {
    if (loading) return;

    try {
      setLoading(true);
      
      // Simulate loading more personalized content
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItems = Array.from({ length: 10 }, (_, index) => ({
        id: `feed_item_${feedItems.length + index + 1}`,
        type: ['video', 'image', 'carousel', 'product_showcase'][Math.floor(Math.random() * 4)],
        title: `Personalized Content ${feedItems.length + index + 1}`,
        creator: `@creator${feedItems.length + index + 1}`,
        thumbnail: `https://picsum.photos/400/600?random=${feedItems.length + index + 100}`,
        engagementScore: Math.random() * 0.4 + 0.6,
        conversionPrediction: Math.random() * 0.3 + 0.1,
        personalizationMatch: Math.random() * 0.3 + 0.7,
        featuredProducts: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
          id: `product_${feedItems.length + index}_${i}`,
          name: ['Premium Product', 'Trending Item', 'Must-Have', 'Limited Edition'][i % 4],
          price: Math.floor(Math.random() * 500) + 100,
          image: `https://picsum.photos/200/200?random=${feedItems.length + index + i + 200}`
        })),
        triggers: ['discovery', 'reward', 'gamification', 'trending'][Math.floor(Math.random() * 4)],
        stats: {
          likes: Math.floor(Math.random() * 15000) + 2000,
          comments: Math.floor(Math.random() * 1500) + 200,
          shares: Math.floor(Math.random() * 800) + 100,
          saves: Math.floor(Math.random() * 3000) + 500,
          views: Math.floor(Math.random() * 150000) + 20000
        }
      }));

      setFeedItems([...feedItems, ...newItems]);
      setFeedPage(feedPage + 1);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFeedPage(1);
    await loadInitialFeed();
    setRefreshing(false);
  };

  const handleEngagement = (item: any, action: string) => {
    // Simulate engagement tracking
    console.log(`Engagement tracked: ${action} on ${item.id}`);
    
    // Update personalization score
    setPersonalizationScore(prev => Math.min(prev + 0.001, 1.0));
    
    // Show feedback for certain actions
    if (action === 'save') {
      Alert.alert('Saved!', 'Item saved to your collection');
    } else if (action === 'share') {
      Alert.alert('Shared!', 'Item shared successfully');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'trending': return 'trending-up';
      case 'personalized': return 'person';
      case 'social_proof': return 'people';
      case 'scarcity': return 'time';
      case 'discovery': return 'search';
      case 'reward': return 'gift';
      case 'gamification': return 'trophy';
      default: return 'flash';
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'trending': return '#FF6B6B';
      case 'personalized': return '#4ECDC4';
      case 'social_proof': return '#45B7D1';
      case 'scarcity': return '#FFA726';
      case 'discovery': return '#AB47BC';
      case 'reward': return '#66BB6A';
      case 'gamification': return '#FFCA28';
      default: return '#D4AF37';
    }
  };

  const renderFeedItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.feedItem}>
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.feedItemContent}>
        {/* Creator Header */}
        <View style={styles.creatorHeader}>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorInitial}>{item.creator[1].toUpperCase()}</Text>
            </View>
            <View style={styles.creatorDetails}>
              <Text style={styles.creatorName}>{item.creator}</Text>
              <View style={styles.triggerBadge}>
                <Ionicons 
                  name={getTriggerIcon(item.triggers) as any} 
                  size={12} 
                  color={getTriggerColor(item.triggers)} 
                />
                <Text style={[styles.triggerText, { color: getTriggerColor(item.triggers) }]}>
                  {item.triggers}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.personalizationScore}>
            <Text style={styles.scoreValue}>{Math.round(item.personalizationMatch * 100)}</Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
        </View>

        {/* Content Media */}
        <TouchableOpacity style={styles.contentMedia}>
          <Image source={{ uri: item.thumbnail }} style={styles.contentImage} />
          
          {/* Content Type Overlay */}
          <View style={styles.contentTypeOverlay}>
            <Ionicons 
              name={
                item.type === 'video' ? 'play' : 
                item.type === 'carousel' ? 'albums' : 
                item.type === 'product_showcase' ? 'storefront' : 'image'
              } 
              size={20} 
              color="#FFFFFF" 
            />
          </View>
          
          {/* Engagement Prediction */}
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.7)']} 
            style={styles.engagementOverlay}
          >
            <Text style={styles.engagementPrediction}>
              {Math.round(item.engagementScore * 100)}% engagement • {Math.round(item.conversionPrediction * 100)}% conversion
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Content Info */}
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle}>{item.title}</Text>
          
          {/* Engagement Actions */}
          <View style={styles.engagementActions}>
            <TouchableOpacity 
              style={styles.engagementAction}
              onPress={() => handleEngagement(item, 'like')}
            >
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
              <Text style={styles.engagementCount}>{formatNumber(item.stats.likes)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.engagementAction}
              onPress={() => handleEngagement(item, 'comment')}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.engagementCount}>{formatNumber(item.stats.comments)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.engagementAction}
              onPress={() => handleEngagement(item, 'share')}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.engagementCount}>{formatNumber(item.stats.shares)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.engagementAction}
              onPress={() => handleEngagement(item, 'save')}
            >
              <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
              <Text style={styles.engagementCount}>{formatNumber(item.stats.saves)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Products */}
        {item.featuredProducts.length > 0 && (
          <View style={styles.featuredProducts}>
            <Text style={styles.productsTitle}>Featured Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
              {item.featuredProducts.map((product: any) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={styles.productItem}
                  onPress={() => handleEngagement(item, 'product_tap')}
                >
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Infinite Discovery</Text>
          <Text style={styles.headerSubtitle}>Personalized: {Math.round(personalizationScore * 100)}%</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="options-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Personalization Banner */}
      <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.personalizationBanner}>
        <View style={styles.bannerContent}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <Text style={styles.bannerText}>
            AI learning from your preferences • {feedItems.length} items curated for you
          </Text>
        </View>
      </LinearGradient>

      {/* Feed */}
      <FlatList
        ref={flatListRef}
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMoreFeedItems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.loadingIndicator}>
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading more personalized content...</Text>
              </LinearGradient>
            </View>
          ) : null
        }
        contentContainerStyle={styles.feedContent}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingAction}>
        <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.floatingActionGradient}>
          <Ionicons name="flash" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  personalizationBanner: {
    padding: 12,
    margin: 16,
    borderRadius: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  feedContent: {
    padding: 16,
  },
  feedItem: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  feedItemContent: {
    padding: 16,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  creatorInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  personalizationScore: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A90E2',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#888888',
  },
  contentMedia: {
    position: 'relative',
    marginBottom: 12,
  },
  contentImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  contentTypeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  engagementOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  engagementPrediction: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contentInfo: {
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  engagementActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  engagementAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementCount: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  featuredProducts: {
    marginTop: 12,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  productsScroll: {
    paddingVertical: 4,
  },
  productItem: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  productName: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  floatingAction: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingActionGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InfiniteDiscoveryFeed;