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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChannelsAPI } from '../../lib/api';
import { isFeatureEnabled } from '../../lib/featureFlags';

const { width } = Dimensions.get('window');

interface Channel {
  id: string;
  type: 'group' | 'channel' | 'creator' | 'vendor';
  title: string;
  description?: string;
  owner_id: string;
  member_count: number;
  verified: boolean;
  theme: string;
  avatar_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function ChannelsScreen() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [myChannels, setMyChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'mine'>('discover');

  useEffect(() => {
    if (!isFeatureEnabled('CHANNELS')) {
      router.back();
      return;
    }
    
    loadChannels();
  }, [activeTab]);

  const loadChannels = async () => {
    try {
      if (activeTab === 'discover') {
        // Load public channels
        const publicChannels = await ChannelsAPI.list();
        setChannels(publicChannels || []);
      } else {
        // Load user's channels
        const userChannels = await ChannelsAPI.list();
        // Filter for user's own channels (simplified)
        setMyChannels(userChannels || []);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
      Alert.alert('Error', 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelPress = (channel: Channel) => {
    router.push(`/channels/${channel.id}`);
  };

  const handleJoinChannel = async (channel: Channel) => {
    try {
      await ChannelsAPI.join(channel.id);
      Alert.alert('Success', `Joined ${channel.title}`);
      loadChannels(); // Refresh
    } catch (error) {
      console.error('Failed to join channel:', error);
      Alert.alert('Error', 'Failed to join channel');
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'creator': return 'star';
      case 'vendor': return 'storefront';
      case 'channel': return 'radio';
      case 'group': return 'people';
      default: return 'chatbubbles';
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'gold': return '#D4AF37';
      case 'cyan': return '#00CED1';
      case 'purple': return '#8A2BE2';
      case 'silver': return '#C0C0C0';
      default: return '#D4AF37';
    }
  };

  const renderChannel = ({ item }: { item: Channel }) => (
    <TouchableOpacity
      style={[styles.channelItem, { borderColor: `${getThemeColor(item.theme)}30` }]}
      onPress={() => handleChannelPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.channelContent}>
        <View style={styles.channelHeader}>
          <View style={[styles.channelAvatar, { backgroundColor: `${getThemeColor(item.theme)}20` }]}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Ionicons 
                name={getChannelIcon(item.type)} 
                size={24} 
                color={getThemeColor(item.theme)} 
              />
            )}
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
              </View>
            )}
          </View>
          
          <View style={styles.channelInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.channelTitle}>{item.title}</Text>
              <Text style={[styles.channelType, { color: getThemeColor(item.theme) }]}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            
            {item.description && (
              <Text style={styles.channelDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.channelStats}>
              <View style={styles.memberCount}>
                <Ionicons name="people" size={14} color="#999" />
                <Text style={styles.memberCountText}>
                  {item.member_count.toLocaleString()} member{item.member_count !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {item.tags.length > 0 && (
                <View style={styles.tags}>
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: `${getThemeColor(item.theme)}20` }]}>
                      <Text style={[styles.tagText, { color: getThemeColor(item.theme) }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.channelActions}>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinChannel(item)}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading channels...</Text>
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
        
        <Text style={styles.headerTitle}>Channels</Text>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/channels/create')}
        >
          <Ionicons name="add" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Ionicons 
            name="compass" 
            size={20} 
            color={activeTab === 'discover' ? '#D4AF37' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mine' && styles.activeTab]}
          onPress={() => setActiveTab('mine')}
        >
          <Ionicons 
            name="bookmark" 
            size={20} 
            color={activeTab === 'mine' ? '#D4AF37' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'mine' && styles.activeTabText]}>
            My Channels
          </Text>
        </TouchableOpacity>
      </View>

      {/* Channels List */}
      <FlatList
        data={activeTab === 'discover' ? channels : myChannels}
        renderItem={renderChannel}
        keyExtractor={(item) => item.id}
        style={styles.channelsList}
        contentContainerStyle={
          (activeTab === 'discover' ? channels : myChannels).length === 0 
            ? styles.emptyContainer 
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'discover' ? 'telescope' : 'bookmark-outline'} 
              size={64} 
              color="#666" 
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'discover' ? 'No channels to discover' : 'No channels yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'discover' 
                ? 'Check back later for new channels' 
                : 'Join channels or create your own'
              }
            </Text>
            {activeTab === 'mine' && (
              <TouchableOpacity 
                style={styles.createChannelButton}
                onPress={() => router.push('/channels/create')}
              >
                <Text style={styles.createChannelText}>Create Channel</Text>
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  tabText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#D4AF37',
  },
  channelsList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  channelItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  channelContent: {
    flexDirection: 'column',
  },
  channelHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  channelAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 2,
  },
  channelInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  channelTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  channelType: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  channelDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  channelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  tags: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  channelActions: {
    alignItems: 'flex-end',
  },
  joinButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinButtonText: {
    color: '#000000',
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
  createChannelButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createChannelText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});