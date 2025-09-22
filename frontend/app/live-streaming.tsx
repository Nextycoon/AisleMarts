import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TabNavigator from './navigation/TabNavigator';
import FloatingAIAssistant from '../src/components/FloatingAIAssistant';

const { width, height } = Dimensions.get('window');

interface LiveStream {
  id: string;
  title: string;
  streamerName: string;
  streamerType: 'creator' | 'business' | 'vendor';
  viewers: number;
  category: string;
  thumbnail: string;
  isLive: boolean;
  duration: string;
  tags: string[];
}

interface LiveCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: string[];
}

export default function LiveStreamingScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);

  const liveCategories: LiveCategory[] = [
    { id: 'all', name: 'All Live', icon: '🔴', count: 127, gradient: ['#FF6B6B', '#FF8E8E'] },
    { id: 'creators', name: 'Creators', icon: '👨‍🎤', count: 45, gradient: ['#4ECDC4', '#44A08D'] },
    { id: 'business', name: 'Business', icon: '🏢', count: 32, gradient: ['#A8E6CF', '#7FCDCD'] },
    { id: 'vendors', name: 'Vendors', icon: '🛍️', count: 50, gradient: ['#FFB347', '#FFCC99'] },
  ];

  useEffect(() => {
    loadLiveStreams();
  }, [selectedCategory]);

  const loadLiveStreams = () => {
    // Mock live streams data
    const mockStreams: LiveStream[] = [
      {
        id: '1',
        title: 'Winter Fashion Haul 2025 ❄️ New Arrivals!',
        streamerName: 'StyleGuru Emma',
        streamerType: 'creator',
        viewers: 1247,
        category: 'Fashion',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
        isLive: true,
        duration: '45:32',
        tags: ['Fashion', 'Haul', 'Winter']
      },
      {
        id: '2',
        title: 'Tech Review: Latest Smart Home Gadgets 🏠',
        streamerName: 'TechPro Solutions',
        streamerType: 'business',
        viewers: 892,
        category: 'Technology',
        thumbnail: 'https://images.unsplash.com/photo-1558618047-b33eb1fb8d4a?w=400&h=300&fit=crop',
        isLive: true,
        duration: '23:15',
        tags: ['Tech', 'Smart Home', 'Review']
      },
      {
        id: '3',
        title: 'Handmade Jewelry Live Crafting Session ✨',
        streamerName: 'Artisan Jewelry Co.',
        streamerType: 'vendor',
        viewers: 634,
        category: 'Crafts',
        thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        isLive: true,
        duration: '1:12:45',
        tags: ['Handmade', 'Jewelry', 'Crafts']
      },
      {
        id: '4',
        title: 'Cooking Masterclass: Italian Pasta 🍝',
        streamerName: 'Chef Marco',
        streamerType: 'creator',
        viewers: 2156,
        category: 'Food',
        thumbnail: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
        isLive: true,
        duration: '38:22',
        tags: ['Cooking', 'Italian', 'Pasta']
      },
      {
        id: '5',
        title: 'Fitness Equipment Demo & Sale 💪',
        streamerName: 'FitGear Direct',
        streamerType: 'vendor',
        viewers: 578,
        category: 'Fitness',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        isLive: true,
        duration: '56:18',
        tags: ['Fitness', 'Equipment', 'Sale']
      },
      {
        id: '6',
        title: 'Business Strategy Workshop 📈',
        streamerName: 'Growth Experts',
        streamerType: 'business',
        viewers: 421,
        category: 'Business',
        thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
        isLive: true,
        duration: '1:23:45',
        tags: ['Business', 'Strategy', 'Workshop']
      }
    ];

    // Filter by category
    const filtered = selectedCategory === 'all' 
      ? mockStreams 
      : mockStreams.filter(stream => 
          selectedCategory === 'creators' ? stream.streamerType === 'creator' :
          selectedCategory === 'business' ? stream.streamerType === 'business' :
          selectedCategory === 'vendors' ? stream.streamerType === 'vendor' :
          true
        );

    setLiveStreams(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadLiveStreams();
    setRefreshing(false);
  };

  const getStreamerTypeIcon = (type: 'creator' | 'business' | 'vendor') => {
    switch (type) {
      case 'creator': return '👨‍🎤';
      case 'business': return '🏢';
      case 'vendor': return '🛍️';
      default: return '🔴';
    }
  };

  const getStreamerTypeBadgeColor = (type: 'creator' | 'business' | 'vendor') => {
    switch (type) {
      case 'creator': return ['#4ECDC4', '#44A08D'];
      case 'business': return ['#A8E6CF', '#7FCDCD'];
      case 'vendor': return ['#FFB347', '#FFCC99'];
      default: return ['#FF6B6B', '#FF8E8E'];
    }
  };

  const renderCategoryButton = (category: LiveCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <LinearGradient
        colors={selectedCategory === category.id ? category.gradient : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.categoryButtonGradient}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive
        ]}>
          {category.name}
        </Text>
        <Text style={[
          styles.categoryCount,
          selectedCategory === category.id && styles.categoryCountActive
        ]}>
          {category.count}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderLiveStream = (stream: LiveStream) => (
    <TouchableOpacity
      key={stream.id}
      style={styles.streamCard}
      onPress={() => {
        // Navigate to individual live stream view
        router.push(`/live-stream/${stream.id}`);
      }}
    >
      <View style={styles.streamThumbnail}>
        <View style={styles.streamImage}>
          <Text style={styles.streamImagePlaceholder}>📺</Text>
        </View>
        
        {/* Live Badge */}
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>🔴 LIVE</Text>
        </View>
        
        {/* Viewer Count */}
        <View style={styles.viewerCount}>
          <Text style={styles.viewerCountText}>👁️ {stream.viewers.toLocaleString()}</Text>
        </View>
        
        {/* Duration */}
        <View style={styles.duration}>
          <Text style={styles.durationText}>{stream.duration}</Text>
        </View>
      </View>
      
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle} numberOfLines={2}>{stream.title}</Text>
        
        <View style={styles.streamerInfo}>
          <LinearGradient
            colors={getStreamerTypeBadgeColor(stream.streamerType)}
            style={styles.streamerTypeBadge}
          >
            <Text style={styles.streamerTypeIcon}>{getStreamerTypeIcon(stream.streamerType)}</Text>
          </LinearGradient>
          <Text style={styles.streamerName}>{stream.streamerName}</Text>
        </View>
        
        <View style={styles.streamMeta}>
          <Text style={styles.streamCategory}>{stream.category}</Text>
          <View style={styles.streamTags}>
            {stream.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.streamTag}>#{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🔴 Live Streams</Text>
          <Text style={styles.headerSubtitle}>Creators • Business • Vendors</Text>
        </View>
        <TouchableOpacity style={styles.goLiveButton} onPress={() => router.push('/creator-studio')}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.goLiveButtonGradient}
          >
            <Text style={styles.goLiveButtonText}>Go Live</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {liveCategories.map(renderCategoryButton)}
      </ScrollView>

      {/* Live Streams Grid */}
      <ScrollView
        style={styles.streamsContainer}
        contentContainerStyle={styles.streamsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.streamsGrid}>
          {liveStreams.map(renderLiveStream)}
        </View>
        
        {liveStreams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📺</Text>
            <Text style={styles.emptyStateTitle}>No Live Streams</Text>
            <Text style={styles.emptyStateSubtitle}>
              Check back later for live content from creators, businesses, and vendors!
            </Text>
          </View>
        )}
      </ScrollView>

      <TabNavigator />
      <FloatingAIAssistant bottom={90} right={16} />
    </SafeAreaView>
  );
}
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendComment}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Product Selection Modal */}
      <Modal
        visible={showProducts}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProducts(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pin Products</Text>
            <View style={styles.modalRight} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Pin up to 3 products to feature in your live stream
            </Text>
            
            {availableProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productOption}
                onPress={() => handlePinProduct(product.id)}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>
                    {product.currency} {product.price}
                  </Text>
                </View>
                <Text style={styles.pinButton}>📌 Pin</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Live Settings</Text>
            <View style={styles.modalRight} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Stream Quality</Text>
              <Text style={styles.settingInfo}>HD • 1080p • 30fps</Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Family Safety</Text>
              <Text style={styles.settingInfo}>🛡️ Enabled • Content moderated in real-time</Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Shopping Features</Text>
              <Text style={styles.settingInfo}>💰 Enabled • Viewers can buy pinned products</Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Performance</Text>
              <Text style={styles.settingInfo}>📊 {liveStats.viewers} viewers • Stable connection</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 14,
  },
  goLiveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goLiveButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  streamsContainer: {
    flex: 1,
  },
  streamsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  streamsGrid: {
    gap: 16,
  },
  streamCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  streamThumbnail: {
    height: 200,
    position: 'relative',
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamImagePlaceholder: {
    fontSize: 48,
    opacity: 0.5,
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
  viewerCount: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewerCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  streamInfo: {
    padding: 16,
  },
  streamTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  streamerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streamerTypeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  streamerTypeIcon: {
    fontSize: 12,
  },
  streamerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  streamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streamCategory: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  streamTags: {
    flexDirection: 'row',
    gap: 8,
  },
  streamTag: {
    color: '#666666',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  setupContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  setupTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  setupSubtitle: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 32,
  },
  previewContainer: {
    marginBottom: 32,
  },
  preview: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderStyle: 'dashed',
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewSubtext: {
    color: '#666666',
    fontSize: 14,
  },
  settingsContainer: {
    marginBottom: 32,
  },
  settingsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  titleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  settingValue: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  startLiveButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 100,
  },
  startLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  liveContainer: {
    flex: 1,
  },
  videoContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pinnedProductsContainer: {
    paddingLeft: 16,
    paddingVertical: 12,
  },
  pinnedProduct: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
  },
  pinnedProductTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pinnedProductPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  pinnedProductSales: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500',
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentsList: {
    flex: 1,
    maxHeight: 200,
  },
  commentItem: {
    marginBottom: 12,
  },
  commentUsername: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 2,
  },
  commentTime: {
    color: '#666666',
    fontSize: 12,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 100,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  modalCancel: {
    color: '#666666',
    fontSize: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalRight: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  pinButton: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingInfo: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
  },
});