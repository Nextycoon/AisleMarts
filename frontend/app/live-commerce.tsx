import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width, height } = Dimensions.get('window');

interface LiveStream {
  id: string;
  host: {
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
    badges: string[];
  };
  title: string;
  category: string;
  viewers: number;
  duration: string;
  thumbnail: string;
  products: LiveProduct[];
  tags: string[];
  isLive: boolean;
}

interface LiveProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  discount?: number;
}

interface LiveEvent {
  id: string;
  title: string;
  host: string;
  startTime: string;
  category: string;
  expectedViewers: number;
  featuredProducts: number;
}

export default function LiveCommerceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'trending'>('live');
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const liveStreams: LiveStream[] = [
    {
      id: '1',
      host: {
        name: 'Fashion_Guru_Sarah',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=60',
        verified: true,
        followers: 45200,
        badges: ['🔥', '👑'],
      },
      title: 'Winter Fashion Haul 2024 - Cozy Looks Under $100!',
      category: 'Fashion',
      viewers: 2847,
      duration: '42:15',
      thumbnail: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300',
      products: [
        {
          id: '1',
          name: 'Cozy Oversized Sweater',
          price: 89.99,
          originalPrice: 129.99,
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100',
          inStock: true,
          discount: 31,
        },
        {
          id: '2',
          name: 'Winter Boots',
          price: 159.99,
          image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100',
          inStock: true,
        },
      ],
      tags: ['Winter', 'Budget-Friendly', 'Trending'],
      isLive: true,
    },
    {
      id: '2',
      host: {
        name: 'TechReviewPro',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60',
        verified: true,
        followers: 78500,
        badges: ['⚡', '🎯'],
      },
      title: 'Latest Gadgets Review & Exclusive Deals',
      category: 'Technology',
      viewers: 1923,
      duration: '28:33',
      thumbnail: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300',
      products: [
        {
          id: '3',
          name: 'Wireless Earbuds Pro',
          price: 159.99,
          originalPrice: 199.99,
          image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100',
          inStock: true,
          discount: 20,
        },
      ],
      tags: ['Tech', 'Reviews', 'Exclusive'],
      isLive: true,
    },
  ];

  const upcomingEvents: LiveEvent[] = [
    {
      id: '1',
      title: 'Holiday Makeup Masterclass',
      host: 'BeautyByEmma',
      startTime: 'Today 8:00 PM',
      category: 'Beauty',
      expectedViewers: 5000,
      featuredProducts: 15,
    },
    {
      id: '2',
      title: 'Fitness Equipment Flash Sale',
      host: 'FitLife_Official',
      startTime: 'Tomorrow 2:00 PM',
      category: 'Fitness',
      expectedViewers: 3200,
      featuredProducts: 8,
    },
  ];

  const trendingStreams = [
    { id: '1', title: 'Home Decor Trends 2024', viewers: 4521, category: 'Home & Garden' },
    { id: '2', title: 'Sustainable Fashion Deep Dive', viewers: 3842, category: 'Fashion' },
    { id: '3', title: 'Gaming Setup Showcase', viewers: 2976, category: 'Gaming' },
  ];

  const renderLiveStreams = () => (
    <ScrollView style={styles.streamsContainer} showsVerticalScrollIndicator={false}>
      {liveStreams.map((stream) => (
        <TouchableOpacity 
          key={stream.id} 
          style={styles.streamCard}
          onPress={() => setSelectedStream(stream.id)}
        >
          
          {/* Stream Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: stream.thumbnail }} style={styles.thumbnail} />
            
            {/* Live Badge */}
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>

            {/* Duration */}
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{stream.duration}</Text>
            </View>

            {/* Viewers */}
            <View style={styles.viewersBadge}>
              <Text style={styles.viewersIcon}>👥</Text>
              <Text style={styles.viewersText}>{stream.viewers.toLocaleString()}</Text>
            </View>

            {/* Play Button */}
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playIcon}>▶️</Text>
            </TouchableOpacity>
          </View>

          {/* Stream Info */}
          <View style={styles.streamInfo}>
            
            {/* Host Info */}
            <View style={styles.hostInfo}>
              <Image source={{ uri: stream.host.avatar }} style={styles.hostAvatar} />
              <View style={styles.hostDetails}>
                <View style={styles.hostNameRow}>
                  <Text style={styles.hostName}>{stream.host.name}</Text>
                  {stream.host.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                  {stream.host.badges.map((badge, index) => (
                    <Text key={index} style={styles.hostBadge}>{badge}</Text>
                  ))}
                </View>
                <Text style={styles.followersCount}>
                  {stream.host.followers.toLocaleString()} followers
                </Text>
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>

            {/* Stream Title */}
            <Text style={styles.streamTitle}>{stream.title}</Text>

            {/* Category & Tags */}
            <View style={styles.metaContainer}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{stream.category}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {stream.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Featured Products */}
            {stream.products.length > 0 && (
              <View style={styles.productsSection}>
                <Text style={styles.productsTitle}>Featured Products ({stream.products.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {stream.products.map((product) => (
                    <TouchableOpacity key={product.id} style={styles.productCard}>
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                        <View style={styles.productPriceRow}>
                          <Text style={styles.productPrice}>${product.price}</Text>
                          {product.originalPrice && (
                            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
                          )}
                        </View>
                        {product.discount && (
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{product.discount}% OFF</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderUpcomingEvents = () => (
    <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.eventsHeader}>
        <Text style={styles.eventsTitle}>📅 Upcoming Live Events</Text>
        <Text style={styles.eventsSubtitle}>Set reminders for exclusive live shopping events</Text>
      </View>
      
      {upcomingEvents.map((event) => (
        <TouchableOpacity key={event.id} style={styles.eventCard}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventHost}>Hosted by {event.host}</Text>
            <Text style={styles.eventTime}>⏰ {event.startTime}</Text>
            
            <View style={styles.eventMeta}>
              <View style={styles.eventStat}>
                <Text style={styles.eventStatIcon}>👥</Text>
                <Text style={styles.eventStatText}>{event.expectedViewers}+ expected</Text>
              </View>
              <View style={styles.eventStat}>
                <Text style={styles.eventStatIcon}>🛍️</Text>
                <Text style={styles.eventStatText}>{event.featuredProducts} products</Text>
              </View>
              <View style={styles.eventStat}>
                <Text style={styles.eventStatIcon}>📂</Text>
                <Text style={styles.eventStatText}>{event.category}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.eventActions}>
            <TouchableOpacity style={styles.reminderButton}>
              <Text style={styles.reminderIcon}>🔔</Text>
              <Text style={styles.reminderText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTrending = () => (
    <ScrollView style={styles.trendingContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.trendingHeader}>
        <Text style={styles.trendingTitle}>🔥 Trending Live Streams</Text>
        <Text style={styles.trendingSubtitle}>Most popular streams right now</Text>
      </View>
      
      {trendingStreams.map((stream, index) => (
        <TouchableOpacity key={stream.id} style={styles.trendingCard}>
          <View style={styles.trendingRank}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.trendingInfo}>
            <Text style={styles.trendingStreamTitle}>{stream.title}</Text>
            <Text style={styles.trendingCategory}>{stream.category}</Text>
            <Text style={styles.trendingViewers}>👥 {stream.viewers.toLocaleString()} viewers</Text>
          </View>
          <TouchableOpacity style={styles.watchButton}>
            <Text style={styles.watchButtonText}>WATCH</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Shopping</Text>
          <TouchableOpacity onPress={() => router.push('/go-live')}>
            <Text style={styles.goLiveButton}>📺</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Live Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>12.4K</Text>
          <Text style={styles.statLabel}>Live Now</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>847K</Text>
          <Text style={styles.statLabel}>Watching</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>$2.3M</Text>
          <Text style={styles.statLabel}>Sales Today</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>🔴 Live</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>📅 Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}
        >
          <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>🔥 Trending</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'live' && renderLiveStreams()}
        {activeTab === 'upcoming' && renderUpcomingEvents()}
        {activeTab === 'trending' && renderTrending()}
      </View>

      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goLiveButton: {
    fontSize: 20,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
  },
  statLabel: {
    fontSize: 10,
    color: '#CCCCCC',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#D4AF37',
  },
  content: {
    flex: 1,
  },
  // Live Streams Styles
  streamsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  streamCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewersBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewersIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  viewersText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 20,
  },
  streamInfo: {
    padding: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  hostDetails: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#1DA1F2',
    marginRight: 4,
  },
  hostBadge: {
    fontSize: 12,
    marginRight: 4,
  },
  followersCount: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  productsSection: {
    marginTop: 16,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  productCard: {
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 16,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 10,
    color: '#CCCCCC',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Upcoming Events Styles
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventsHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  eventsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventsSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventHost: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  eventStatIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  eventStatText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  eventActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  reminderIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  reminderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  // Trending Styles
  trendingContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trendingHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  trendingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  trendingSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  trendingCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingRank: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
  },
  trendingInfo: {
    flex: 1,
  },
  trendingStreamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trendingCategory: {
    fontSize: 12,
    color: '#D4AF37',
    marginBottom: 4,
  },
  trendingViewers: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  watchButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  watchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
});