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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  goLiveButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goLiveButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryButton: {
    marginRight: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  categoryButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '400',
    marginLeft: 2,
  },
  categoryCountActive: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  streamsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  streamsContent: {
    paddingVertical: 10,
  },
  streamsGrid: {
    flexDirection: 'column',
  },
  streamCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streamThumbnail: {
    height: 200,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  streamImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamImagePlaceholder: {
    fontSize: 60,
    opacity: 0.5,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 10,
    fontWeight: '500',
  },
  duration: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
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
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  streamerTypeIcon: {
    fontSize: 10,
  },
  streamerName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  streamMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streamCategory: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  streamTags: {
    flexDirection: 'row',
  },
  streamTag: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});