import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';
import TopNavigation from '../src/components/TopNavigation';

const { width } = Dimensions.get('window');
// TikTok-style variable grid layout - Dynamic sizing like reference images
const getItemDimensions = (index: number) => {
  const baseWidth = (width - 32) / 3; // 3 columns base
  const variations = [
    { width: baseWidth, height: baseWidth * 1.5 }, // Tall rectangle
    { width: baseWidth, height: baseWidth }, // Square
    { width: baseWidth * 2 + 8, height: baseWidth }, // Wide rectangle
    { width: baseWidth, height: baseWidth * 1.2 }, // Medium rectangle
  ];
  return variations[index % variations.length];
};

interface TrendingItem {
  id: string;
  type: 'hashtag' | 'sound' | 'creator' | 'product';
  title: string;
  subtitle: string;
  usage: string;
  growth: string;
  familySafe: boolean;
  imageUrl?: string;
}

interface ExploreContent {
  id: string;
  type: 'video' | 'image' | 'live';
  thumbnailUrl: string;
  duration?: number;
  views: number;
  isLive?: boolean;
  familySafe: boolean;
  creator: {
    username: string;
    verified: boolean;
  };
  products: number;
}

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'discover' | 'live'>('trending');
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [exploreContent, setExploreContent] = useState<ExploreContent[]>([]);

  // Mock trending data
  const mockTrendingData: TrendingItem[] = [
    {
      id: 'trend_1',
      type: 'hashtag',
      title: '#BlueWaveSafe',
      subtitle: 'Family-safe shopping',
      usage: '2.4M posts',
      growth: '+345%',
      familySafe: true
    },
    {
      id: 'trend_2',
      type: 'hashtag',
      title: '#WinterFashion',
      subtitle: 'Trending styles',
      usage: '1.8M posts',
      growth: '+234%',
      familySafe: true
    },
    {
      id: 'trend_3',
      type: 'sound',
      title: 'Cozy Winter Vibes',
      subtitle: 'Original sound',
      usage: '456K videos',
      growth: '+189%',
      familySafe: true
    },
    {
      id: 'trend_4',
      type: 'creator',
      title: '@LuxeFashion',
      subtitle: '245K followers',
      usage: '127K videos',
      growth: '+67%',
      familySafe: true,
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'
    },
    {
      id: 'trend_5',
      type: 'product',
      title: 'Smart Family Watch',
      subtitle: 'Tech & Safety',
      usage: '89K mentions',
      growth: '+156%',
      familySafe: true,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
    },
    {
      id: 'trend_6',
      type: 'hashtag',
      title: '#HealthyFamily',
      subtitle: 'Nutrition & wellness',
      usage: '892K posts',
      growth: '+98%',
      familySafe: true
    }
  ];

  // Mock explore content grid
  const mockExploreContent: ExploreContent[] = Array.from({ length: 20 }, (_, index) => ({
    id: `explore_${index + 1}`,
    type: index % 7 === 0 ? 'live' : index % 3 === 0 ? 'image' : 'video',
    thumbnailUrl: `https://images.unsplash.com/photo-${1441986300917 + index}?w=200&h=300&fit=crop`,
    duration: index % 3 === 0 ? undefined : Math.floor(Math.random() * 60) + 15,
    views: Math.floor(Math.random() * 100000) + 1000,
    isLive: index % 7 === 0,
    familySafe: true,
    creator: {
      username: `@Creator${index + 1}`,
      verified: index % 4 === 0
    },
    products: Math.floor(Math.random() * 5)
  }));

  useEffect(() => {
    setTrendingData(mockTrendingData);
    setExploreContent(mockExploreContent);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      // Navigate to search results
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleTrendingItemPress = (item: TrendingItem) => {
    switch (item.type) {
      case 'hashtag':
        router.push(`/hashtag/${item.title.substring(1)}`);
        break;
      case 'sound':
        router.push(`/sound/${item.id}`);
        break;
      case 'creator':
        router.push(`/profile/${item.title.substring(1)}`);
        break;
      case 'product':
        router.push(`/products/${item.id}`);
        break;
    }
  };

  const handleExplorePress = (content: ExploreContent) => {
    if (content.isLive) {
      router.push(`/live/${content.id}`);
    } else {
      router.push(`/content/${content.id}`);
    }
  };

  const renderTrendingItem = ({ item, index }: { item: TrendingItem; index: number }) => (
    <TouchableOpacity
      style={[styles.trendingItem, index % 2 === 0 ? styles.trendingItemLeft : styles.trendingItemRight]}
      onPress={() => handleTrendingItemPress(item)}
    >
      <View style={styles.trendingHeader}>
        <View style={styles.trendingIcon}>
          <Text style={styles.trendingIconText}>
            {item.type === 'hashtag' ? '#' : 
             item.type === 'sound' ? '🎵' : 
             item.type === 'creator' ? '👤' : '🛍️'}
          </Text>
        </View>
        <View style={styles.trendingGrowth}>
          <Text style={styles.trendingGrowthText}>{item.growth}</Text>
        </View>
      </View>
      
      {item.imageUrl && (
        <View style={styles.trendingImageContainer}>
          <View style={styles.trendingImagePlaceholder}>
            <Text style={styles.trendingImageText}>📷</Text>
          </View>
        </View>
      )}

      <Text style={styles.trendingTitle}>{item.title}</Text>
      <Text style={styles.trendingSubtitle}>{item.subtitle}</Text>
      <Text style={styles.trendingUsage}>{item.usage}</Text>
      
      {item.familySafe && (
        <View style={styles.familySafeIndicator}>
          <Text style={styles.familySafeText}>🛡️</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderExploreItem = ({ item, index }: { item: ExploreContent; index: number }) => {
    const dimensions = getItemDimensions(index);
    
    return (
      <TouchableOpacity
        style={[
          styles.exploreItem, 
          { 
            width: dimensions.width, 
            height: dimensions.height,
            marginBottom: 8,
            marginRight: index % 3 === 2 ? 0 : 8, // No margin for last column item
          }
        ]}
        onPress={() => handleExplorePress(item)}
      >
        <View style={[styles.exploreItemContent, { height: '100%' }]}>
          {/* Placeholder image - TikTok style background */}
          <View style={[styles.exploreThumbnail, { 
            backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 20%)`,
            height: '100%'
          }]}>
            <Text style={styles.thumbnailText}>📸</Text>
          </View>
          
          {/* Duration overlay - TikTok style */}
          {item.duration && (
            <View style={styles.durationOverlay}>
              <Text style={styles.durationText}>
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
          
          {/* Live indicator - TikTok pink style */}
          {item.isLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          
          {/* AisleMarts Shopping indicator */}
          {item.products > 0 && (
            <View style={styles.productsIndicator}>
              <Text style={styles.productsIndicatorText}>🛍️ {item.products}</Text>
            </View>
          )}

          {/* Creator info overlay - TikTok style */}
          <View style={styles.creatorOverlay}>
            <Text style={styles.exploreCreator}>
              {item.creator.username}
              {item.creator.verified && ' ✓'}
            </Text>
            <Text style={styles.exploreViews}>
              {item.views > 1000 ? `${(item.views / 1000).toFixed(1)}K` : item.views} views
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Navigation - Explore | Following | For You */}
      <TopNavigation />
      
      {/* Header with Search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search creators, hashtags, products..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => handleSearch(searchQuery)}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
          onPress={() => setActiveTab('trending')}
        >
          <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.tabActive]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActive]}>
            🔴 Live
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'trending' && (
          <View style={styles.trendingContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What's Trending</Text>
              <Text style={styles.sectionSubtitle}>Family-safe trends on BlueWave</Text>
            </View>
            <FlatList
              data={trendingData}
              renderItem={renderTrendingItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.trendingRow}
            />
          </View>
        )}

        {(activeTab === 'discover' || activeTab === 'live') && (
          <View style={styles.discoverContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'live' ? 'Live Now' : 'Discover Content'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {activeTab === 'live' 
                  ? 'Live shopping and entertainment' 
                  : 'Fresh content from our community'
                }
              </Text>
            </View>
            <View style={styles.exploreGrid}>
              {(activeTab === 'live' 
                ? exploreContent.filter(item => item.isLive)
                : exploreContent
              ).map((item, index) => renderExploreItem({ item, index }))}
            </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#D4AF37',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  tabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#999999',
    fontSize: 14,
  },
  trendingContainer: {
    paddingVertical: 20,
  },
  trendingRow: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  trendingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    position: 'relative',
  },
  trendingItemLeft: {
    width: itemWidth,
  },
  trendingItemRight: {
    width: itemWidth,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingIconText: {
    fontSize: 16,
    color: '#D4AF37',
  },
  trendingGrowth: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingGrowthText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  trendingImageContainer: {
    height: 60,
    marginBottom: 12,
  },
  trendingImagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingImageText: {
    fontSize: 24,
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendingSubtitle: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 8,
  },
  trendingUsage: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  familySafeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  familySafeText: {
    fontSize: 12,
  },
  discoverContainer: {
    paddingVertical: 20,
  },
  exploreRow: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  exploreItem: {
    width: itemWidth,
    marginBottom: 20,
  },
  exploreImageContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  exploreImagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreImageText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  exploreamilySafe: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  familySafeIcon: {
    fontSize: 12,
  },
  productsIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  productsIndicatorText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
  },
  exploreInfo: {
    paddingTop: 8,
  },
  exploreCreator: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  exploreViews: {
    color: '#666666',
    fontSize: 12,
  },
  exploreItemContent: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  exploreThumbnail: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  thumbnailText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  creatorOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
});