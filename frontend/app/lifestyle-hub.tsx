import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-r';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import TabNavigator from './navigation/TabNavigator';

const { width, height } = Dimensions.get('window');

interface LifestyleContent {
  id: string;
  type: 'fashion' | 'modeling' | 'live_stream' | 'expo' | 'entertainment';
  title: string;
  creator: {
    username: string;
    verified: boolean;
    avatar: string;
  };
  media_url: string;
  thumbnail_url: string;
  description: string;
  tags: string[];
  stats: {
    views: number;
    likes: number;
    saves: number;
    shares: number;
  };
  products: any[];
  live_status?: 'upcoming' | 'live' | 'ended';
  duration?: number;
  price?: {
    amount: number;
    currency: string;
  };
}

export default function LifestyleHubScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lifestyleContent, setLifestyleContent] = useState<LifestyleContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<any[]>([]);

  const categories = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'fashion', label: 'Fashion', icon: '👗' },
    { id: 'modeling', label: 'Modeling', icon: '📸' },
    { id: 'live_stream', label: 'Live', icon: '🔴' },
    { id: 'expo', label: 'Expos', icon: '🏪' },
    { id: 'entertainment', label: 'Shows', icon: '🎭' }
  ];

  // Mock lifestyle content data
  const mockLifestyleContent: LifestyleContent[] = [
    {
      id: 'lifestyle_001',
      type: 'fashion',
      title: 'Winter Fashion Trends 2025 🌨️',
      creator: {
        username: '@FashionForwardAI',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=100'
      },
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
      description: 'Discover the hottest winter fashion trends powered by AisleMarts AI! From cozy layers to statement pieces.',
      tags: ['#WinterFashion', '#AisleMarts', '#Fashion2025', '#StyleAI'],
      stats: {
        views: 125000,
        likes: 8900,
        saves: 2300,
        shares: 1200
      },
      products: [
        {
          id: 'prod_coat_001',
          title: 'AI-Curated Winter Coat Collection',
          price: 299.99,
          currency: 'EUR'
        }
      ],
      duration: 60
    },
    {
      id: 'lifestyle_002',
      type: 'live_stream',
      title: '🔴 LIVE: Global Fashion Expo',
      creator: {
        username: '@GlobalFashionExpo',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      },
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      description: 'Join our live global fashion expo featuring designers from 30+ countries. Shop exclusive collections!',
      tags: ['#LiveExpo', '#GlobalFashion', '#AisleMarts', '#Exclusive'],
      stats: {
        views: 15600,
        likes: 2100,
        saves: 890,
        shares: 450
      },
      products: [
        {
          id: 'prod_expo_001',
          title: 'Exclusive Expo Collection',
          price: 199.99,
          currency: 'EUR'
        }
      ],
      live_status: 'live'
    },
    {
      id: 'lifestyle_003',
      type: 'modeling',
      title: 'Professional Model Portfolio Session',
      creator: {
        username: '@ModelingAcademyAI',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
      },
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
      description: 'Behind the scenes of a professional modeling session powered by AisleMarts lifestyle ecosystem.',
      tags: ['#Modeling', '#Professional', '#Portfolio', '#AisleMarts'],
      stats: {
        views: 89500,
        likes: 5200,
        saves: 1800,
        shares: 720
      },
      products: [
        {
          id: 'prod_modeling_001',
          title: 'Professional Modeling Package',
          price: 500.00,
          currency: 'EUR'
        }
      ],
      duration: 45
    },
    {
      id: 'lifestyle_004',
      type: 'entertainment',
      title: 'Digital Fashion Show Spectacular',
      creator: {
        username: '@DigitalRunwayAI',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
      },
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
      description: 'Experience the future of fashion with our AI-powered digital runway show featuring virtual models.',
      tags: ['#DigitalFashion', '#AI', '#VirtualRunway', '#FutureOfFashion'],
      stats: {
        views: 245000,
        likes: 18900,
        saves: 4200,
        shares: 2800
      },
      products: [
        {
          id: 'prod_digital_001',
          title: 'Digital Fashion Collection',
          price: 149.99,
          currency: 'EUR'
        }
      ],
      duration: 90
    },
    {
      id: 'lifestyle_005',
      type: 'expo',
      title: 'Virtual Shopping Mall Experience',
      creator: {
        username: '@VirtualMallAI',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      },
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
      description: 'Explore our virtual shopping mall with AI-guided tours and personalized recommendations.',
      tags: ['#VirtualMall', '#AIGuided', '#Shopping', '#Experience'],
      stats: {
        views: 156000,
        likes: 11200,
        saves: 3100,
        shares: 1900
      },
      products: [
        {
          id: 'prod_virtual_001',
          title: 'Virtual Mall Access Pass',
          price: 29.99,
          currency: 'EUR'
        }
      ],
      duration: 120
    }
  ];

  useEffect(() => {
    setLifestyleContent(mockLifestyleContent);
    setIsLoading(false);
  }, []);

  const filteredContent = lifestyleContent.filter(content => 
    activeCategory === 'all' || content.type === activeCategory
  );

  const handleVideoPress = (index: number) => {
    if (currentPlayingIndex === index) {
      videoRefs.current[index]?.pauseAsync();
      setCurrentPlayingIndex(null);
    } else {
      if (currentPlayingIndex !== null) {
        videoRefs.current[currentPlayingIndex]?.pauseAsync();
      }
      videoRefs.current[index]?.playAsync();
      setCurrentPlayingIndex(index);
    }
  };

  const handleContentPress = (content: LifestyleContent) => {
    if (content.type === 'live_stream' && content.live_status === 'live') {
      router.push(`/live-streaming/${content.id}`);
    } else {
      router.push(`/lifestyle-detail/${content.id}`);
    }
  };

  const handleCreatorPress = (username: string) => {
    router.push(`/profile/${username.replace('@', '')}`);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleAisleAIChat = () => {
    router.push('/aisle-ai-chat');
  };

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabsContainer}
      contentContainerStyle={styles.categoryTabsContent}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            activeCategory === category.id && styles.categoryTabActive
          ]}
          onPress={() => setActiveCategory(category.id)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[
            styles.categoryLabel,
            activeCategory === category.id && styles.categoryLabelActive
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderContentItem = ({ item, index }: { item: LifestyleContent; index: number }) => (
    <TouchableOpacity
      style={styles.contentItem}
      onPress={() => handleContentPress(item)}
      activeOpacity={0.9}
    >
      {/* Media Container */}
      <View style={styles.mediaContainer}>
        <Video
          ref={(ref) => videoRefs.current[index] = ref}
          source={{ uri: item.media_url }}
          style={styles.videoPlayer}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping
          isMuted={currentPlayingIndex !== index}
        />
        
        {/* Play Overlay */}
        {currentPlayingIndex !== index && (
          <TouchableOpacity 
            style={styles.playOverlay}
            onPress={() => handleVideoPress(index)}
          >
            <Text style={styles.playIcon}>▶️</Text>
          </TouchableOpacity>
        )}

        {/* Live Badge */}
        {item.live_status === 'live' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>🔴 LIVE</Text>
          </View>
        )}

        {/* Duration Badge */}
        {item.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}s</Text>
          </View>
        )}

        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {item.type === 'fashion' ? '👗' :
             item.type === 'modeling' ? '📸' :
             item.type === 'live_stream' ? '🔴' :
             item.type === 'expo' ? '🏪' : '🎭'}
          </Text>
        </View>
      </View>

      {/* Content Info */}
      <View style={styles.contentInfo}>
        {/* Creator Info */}
        <TouchableOpacity 
          style={styles.creatorInfo}
          onPress={() => handleCreatorPress(item.creator.username)}
        >
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>
              {item.creator.username.charAt(1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.creatorDetails}>
            <Text style={styles.creatorUsername}>
              {item.creator.username}
              {item.creator.verified && ' ✓'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Title and Description */}
        <Text style={styles.contentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.contentDescription} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Tags */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
        >
          {item.tags.map((tag, tagIndex) => (
            <View key={tagIndex} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👁️</Text>
            <Text style={styles.statText}>{item.stats.views.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statText}>{item.stats.likes.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📂</Text>
            <Text style={styles.statText}>{item.stats.saves.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>↗️</Text>
            <Text style={styles.statText}>{item.stats.shares.toLocaleString()}</Text>
          </View>
        </View>

        {/* Products */}
        {item.products.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.productsContainer}
          >
            {item.products.map((product, productIndex) => (
              <TouchableOpacity
                key={productIndex}
                style={styles.productCard}
                onPress={() => handleProductPress(product.id)}
              >
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productPrice}>
                  {product.currency} {product.price}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>AisleMarts</Text>
          <Text style={styles.headerSubtitle}>Lifestyle & Modern Shopping 🛍️🛒</Text>
        </View>
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={handleAisleAIChat}
        >
          <Text style={styles.aiButtonText}>🤖 Aisle AI</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Content List */}
      <FlatList
        data={filteredContent}
        renderItem={renderContentItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentList}
        refreshing={isLoading}
        onRefresh={() => {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 1000);
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.floatingActionButton}
        onPress={() => router.push('/creator-studio')}
      >
        <Text style={styles.floatingActionText}>➕</Text>
      </TouchableOpacity>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  aiButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  aiButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTabsContainer: {
    maxHeight: 60,
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  contentList: {
    paddingBottom: 100,
  },
  contentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaContainer: {
    height: 250,
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 14,
  },
  contentInfo: {
    padding: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  creatorAvatarText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorUsername: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contentTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  contentDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  productsContainer: {
    marginTop: 8,
  },
  productCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 150,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingActionText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '700',
  },
});