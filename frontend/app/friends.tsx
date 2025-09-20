import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  mutualFriends: number;
  isFollowing: boolean;
}

interface Activity {
  id: string;
  user: Friend;
  type: 'purchase' | 'like' | 'review' | 'follow';
  content: string;
  timestamp: string;
  product?: {
    name: string;
    image: string;
    price: number;
  };
}

export default function FriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'discover' | 'activity'>('friends');

  const friends: Friend[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      handle: '@sarah_j',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68650e3?w=150',
      isOnline: true,
      mutualFriends: 12,
      isFollowing: true,
    },
    {
      id: '2',
      name: 'Michael Chen',
      handle: '@mike_chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isOnline: false,
      lastSeen: '2h ago',
      mutualFriends: 8,
      isFollowing: true,
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      handle: '@emma_r',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      isOnline: true,
      mutualFriends: 15,
      isFollowing: true,
    },
    {
      id: '4',
      name: 'Alex Thompson',
      handle: '@alex_t',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isOnline: false,
      lastSeen: '1d ago',
      mutualFriends: 6,
      isFollowing: false,
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      user: friends[0],
      type: 'purchase',
      content: 'bought a new item',
      timestamp: '2h ago',
      product: {
        name: 'Wireless Headphones Pro',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
        price: 299.99,
      },
    },
    {
      id: '2',
      user: friends[1],
      type: 'like',
      content: 'liked Designer Handbag',
      timestamp: '4h ago',
      product: {
        name: 'Designer Handbag',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100',
        price: 899.99,
      },
    },
    {
      id: '3',
      user: friends[2],
      type: 'review',
      content: 'left a 5-star review',
      timestamp: '6h ago',
      product: {
        name: 'Smart Home Speaker',
        image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=100',
        price: 149.99,
      },
    },
    {
      id: '4',
      user: friends[3],
      type: 'follow',
      content: 'started following @LuxeFashion',
      timestamp: '1d ago',
    },
  ];

  const suggestedFriends: Friend[] = [
    {
      id: '5',
      name: 'Lisa Wang',
      handle: '@lisa_w',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      isOnline: false,
      mutualFriends: 3,
      isFollowing: false,
    },
    {
      id: '6',
      name: 'David Park',
      handle: '@david_p',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isOnline: true,
      mutualFriends: 7,
      isFollowing: false,
    },
  ];

  const renderFriend = (friend: Friend) => (
    <TouchableOpacity
      key={friend.id}
      style={styles.friendCard}
      onPress={() => router.push(`/profile/${friend.id}`)}
    >
      <View style={styles.friendAvatarContainer}>
        <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
        {friend.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.name}</Text>
        <Text style={styles.friendHandle}>{friend.handle}</Text>
        <Text style={styles.mutualFriends}>
          {friend.mutualFriends} mutual friends
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.followButton,
          friend.isFollowing && styles.followingButton,
        ]}
      >
        <Text
          style={[
            styles.followButtonText,
            friend.isFollowing && styles.followingButtonText,
          ]}
        >
          {friend.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderActivity = (activity: Activity) => (
    <TouchableOpacity key={activity.id} style={styles.activityCard}>
      <Image source={{ uri: activity.user.avatar }} style={styles.activityAvatar} />
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityUser}>{activity.user.name}</Text>
          <Text style={styles.activityTime}>{activity.timestamp}</Text>
        </View>
        <Text style={styles.activityText}>
          {activity.content}
        </Text>
        {activity.product && (
          <View style={styles.productPreview}>
            <Image source={{ uri: activity.product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{activity.product.name}</Text>
              <Text style={styles.productPrice}>€{activity.product.price}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>👥 Friends</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push('/search/people')}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchBarIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {[
          { key: 'friends', label: 'Friends', count: friends.length },
          { key: 'discover', label: 'Discover', count: suggestedFriends.length },
          { key: 'activity', label: 'Activity', count: activities.length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'friends' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Friends</Text>
            {friends.map(renderFriend)}
          </View>
        )}

        {activeTab === 'discover' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>People You May Know</Text>
            {suggestedFriends.map(renderFriend)}
            
            <TouchableOpacity style={styles.discoverMoreButton}>
              <Text style={styles.discoverMoreText}>Discover More People</Text>
              <Text style={styles.discoverMoreIcon}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friend Activity</Text>
            {activities.map(renderActivity)}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  searchBarIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#D4AF37',
  },
  tabButtonText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  friendAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#000000',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  friendHandle: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#999999',
  },
  followButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  followButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#D4AF37',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityTime: {
    fontSize: 12,
    color: '#999999',
  },
  activityText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 8,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  discoverMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  discoverMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  discoverMoreIcon: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 100,
  },
});