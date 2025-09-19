import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LiveSaleAPI } from '../../lib/api';
import { isFeatureEnabled } from '../../lib/featureFlags';

const { width } = Dimensions.get('window');

interface LiveSale {
  id: string;
  title: string;
  description?: string;
  vendor_id: string;
  vendor_name?: string;
  starts_at: string;
  duration_minutes: number;
  max_viewers: number;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count: number;
  products: Array<{
    id: string;
    name: string;
    price: number;
    discount_percent?: number;
    quantity_available: number;
  }>;
  thumbnail_url?: string;
  stream_url?: string;
  tags: string[];
  created_at: string;
}

export default function LiveSaleScreen() {
  const [liveSales, setLiveSales] = useState<LiveSale[]>([]);
  const [activeLiveSales, setActiveLiveSales] = useState<LiveSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'ended'>('live');

  useEffect(() => {
    if (!isFeatureEnabled('LIVESALE')) {
      router.back();
      return;
    }
    
    loadLiveSales();
    loadActiveLiveSales();
  }, [activeTab]);

  const loadLiveSales = async () => {
    try {
      let status = undefined;
      if (activeTab === 'live') status = 'live';
      else if (activeTab === 'upcoming') status = 'scheduled';
      else if (activeTab === 'ended') status = 'ended';

      const data = await LiveSaleAPI.list(status);
      setLiveSales(data || []);
    } catch (error) {
      console.error('Failed to load LiveSales:', error);
      Alert.alert('Error', 'Failed to load LiveSales');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadActiveLiveSales = async () => {
    try {
      const data = await LiveSaleAPI.getActive();
      // Convert active livesales data to LiveSale format
      const activeIds = data?.active_livesales || [];
      // For now, we'll load all and filter by active status
      if (activeIds.length > 0) {
        const allData = await LiveSaleAPI.list('live');
        setActiveLiveSales(allData || []);
      }
    } catch (error) {
      console.error('Failed to load active LiveSales:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLiveSales();
    await loadActiveLiveSales();
  };

  const handleLiveSalePress = (liveSale: LiveSale) => {
    if (liveSale.status === 'live') {
      router.push(`/livesale/${liveSale.id}`);
    } else {
      // Show details or set reminder
      Alert.alert(
        liveSale.title,
        `${liveSale.description || 'Live shopping event'}\n\nStarts: ${new Date(liveSale.starts_at).toLocaleString()}\nDuration: ${liveSale.duration_minutes} minutes\nProducts: ${liveSale.products.length}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Reminder', onPress: () => setReminder(liveSale) },
          ...(liveSale.status === 'ended' ? [{ text: 'View Replay', onPress: () => viewReplay(liveSale) }] : [])
        ]
      );
    }
  };

  const joinLiveSale = async (liveSale: LiveSale) => {
    try {
      await LiveSaleAPI.join(liveSale.id);
      Alert.alert('Success', `Joined ${liveSale.title}`);
      router.push(`/livesale/${liveSale.id}`);
    } catch (error) {
      console.error('Failed to join LiveSale:', error);
      Alert.alert('Error', 'Failed to join LiveSale');
    }
  };

  const setReminder = (liveSale: LiveSale) => {
    Alert.alert('Reminder Set', `We'll notify you when ${liveSale.title} goes live!`);
  };

  const viewReplay = (liveSale: LiveSale) => {
    router.push(`/livesale/${liveSale.id}/replay`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#FF4444';
      case 'scheduled': return '#D4AF37';
      case 'ended': return '#666666';
      default: return '#999999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'scheduled': return 'UPCOMING';
      case 'ended': return 'ENDED';
      default: return status.toUpperCase();
    }
  };

  const formatTimeRemaining = (startsAt: string) => {
    const start = new Date(startsAt);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return 'Starting now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const renderLiveSale = ({ item }: { item: LiveSale }) => (
    <TouchableOpacity
      style={[
        styles.liveSaleItem,
        { borderColor: `${getStatusColor(item.status)}30` }
      ]}
      onPress={() => handleLiveSalePress(item)}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Ionicons name="play-circle" size={32} color="#D4AF37" />
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        
        {/* Viewer Count for Live */}
        {item.status === 'live' && (
          <View style={styles.viewerBadge}>
            <Ionicons name="eye" size={12} color="#FFFFFF" />
            <Text style={styles.viewerText}>{item.viewer_count}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.liveSaleContent}>
        <View style={styles.liveSaleHeader}>
          <Text style={styles.liveSaleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.vendorName}>by {item.vendor_name || 'Vendor'}</Text>
        </View>

        {item.description && (
          <Text style={styles.liveSaleDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.liveSaleStats}>
          <View style={styles.statItem}>
            <Ionicons name="time" size={14} color="#999" />
            <Text style={styles.statText}>
              {item.status === 'scheduled' 
                ? formatTimeRemaining(item.starts_at)
                : `${item.duration_minutes}min`
              }
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="bag" size={14} color="#999" />
            <Text style={styles.statText}>{item.products.length} products</Text>
          </View>
          
          {item.status === 'live' && (
            <View style={styles.statItem}>
              <Ionicons name="people" size={14} color="#999" />
              <Text style={styles.statText}>{item.viewer_count} watching</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: item.status === 'live' ? '#FF4444' : '#D4AF37' }
          ]}
          onPress={() => item.status === 'live' ? joinLiveSale(item) : handleLiveSalePress(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.status === 'live' ? 'Join Live' : 
             item.status === 'scheduled' ? 'Set Reminder' : 'View Replay'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading LiveSales...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>LiveSale</Text>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/business/livesale/create')}
        >
          <Ionicons name="add" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Live Banner */}
      {activeLiveSales.length > 0 && (
        <View style={styles.liveBanner}>
          <View style={styles.liveBannerContent}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBannerText}>
                {activeLiveSales.length} Live Now
              </Text>
            </View>
            <Text style={styles.liveBannerSubtext}>
              Don't miss out on exclusive deals!
            </Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'live', title: 'Live', icon: 'radio-button-on' },
          { key: 'upcoming', title: 'Upcoming', icon: 'time' },
          { key: 'ended', title: 'Replays', icon: 'play-circle' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.key ? '#D4AF37' : '#999'} 
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LiveSales List */}
      <FlatList
        data={liveSales}
        renderItem={renderLiveSale}
        keyExtractor={(item) => item.id}
        style={styles.liveSalesList}
        contentContainerStyle={
          liveSales.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onResh}
            tintColor="#D4AF37"
            colors={['#D4AF37']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'live' ? 'radio-button-on' : 
                    activeTab === 'upcoming' ? 'time' : 'play-circle'} 
              size={64} 
              color="#666" 
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'live' ? 'No live sales' :
               activeTab === 'upcoming' ? 'No upcoming sales' : 'No replays available'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'live' ? 'Check back later for live shopping events' :
               activeTab === 'upcoming' ? 'New sales will appear here when scheduled' :
               'Completed sales will have replays available'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity 
                style={styles.createLiveButton}
                onPress={() => router.push('/business/livesale/create')}
              >
                <Text style={styles.createLiveText}>Create LiveSale</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  createButton: {
    padding: 8,
  },
  liveBanner: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  liveBannerContent: {
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 8,
  },
  liveBannerText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  liveBannerSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#D4AF37',
  },
  liveSalesList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  liveSaleItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  placeholderThumbnail: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  viewerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  viewerText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 2,
  },
  liveSaleContent: {
    flex: 1,
  },
  liveSaleHeader: {
    marginBottom: 8,
  },
  liveSaleTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vendorName: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  liveSaleDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  liveSaleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  tagText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '500',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  createLiveButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createLiveText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});