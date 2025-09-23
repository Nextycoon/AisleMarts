import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';

interface CommunityPost {
  id: string;
  username: string;
  content_type: string;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  category: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  ai_sentiment_score: number;
  created_at: string;
}

interface ProductReview {
  id: string;
  username: string;
  product_name: string;
  rating: number;
  title: string;
  review_text: string;
  helpful_count: number;
  ai_sentiment_score: number;
  created_at: string;
}

interface TrendingContent {
  id: string;
  title: string;
  content_type: string;
  author: string;
  trending_score: number;
  engagement_rate: number;
}

interface CommunityFeed {
  posts: CommunityPost[];
  reviews: ProductReview[];
  trending: TrendingContent[];
  recommendations: string[];
}

export default function CommunityHub() {
  const [feed, setFeed] = useState<CommunityFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
  const userId = 'demo_user_001';
  const username = 'CommunityUser';

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${backendUrl}/api/community/feed?user_id=${userId}&limit=20`);
      if (response.ok) {
        const feedData = await response.json();
        setFeed(feedData);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      Alert.alert('Error', 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunityData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/community/posts?user_id=${userId}&username=${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          content_type: 'post',
          tags: ['community', 'discussion'],
          category: 'general'
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Post created successfully! 🎉');
        setNewPostTitle('');
        setNewPostContent('');
        setShowNewPost(false);
        fetchCommunityData();
      } else {
        Alert.alert('Error', 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const interactWithContent = async (contentId: string, interactionType: string) => {
    try {
      await fetch(`${backendUrl}/api/community/interactions?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_id: contentId,
          interaction_type: interactionType
        })
      });

      // Update local state
      if (feed) {
        const updatedPosts = feed.posts.map(post => 
          post.id === contentId 
            ? { ...post, [interactionType === 'like' ? 'likes' : 'views']: post[interactionType === 'like' ? 'likes' : 'views'] + 1 }
            : post
        );
        setFeed({ ...feed, posts: updatedPosts });
      }
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.7) return '😊';
    if (score > 0.3) return '😐';
    return '😔';
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, { color: i <= rating ? '#D4AF37' : '#666666' }]}>
          ★
        </Text>
      );
    }
    return stars;
  };

  if (loading && !feed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading Community Hub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Hub</Text>
          <TouchableOpacity onPress={() => setShowNewPost(!showNewPost)} style={styles.createButton}>
            <Text style={styles.createButtonText}>+ Post</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {['feed', 'trending', 'reviews'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* New Post Form */}
        {showNewPost && (
          <View style={styles.newPostContainer}>
            <Text style={styles.newPostTitle}>✍️ Create New Post</Text>
            <TextInput
              style={styles.postTitleInput}
              placeholder="Post title..."
              placeholderTextColor="#666666"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={styles.postContentInput}
              placeholder="What's on your mind? Share with the community..."
              placeholderTextColor="#666666"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
            />
            <View style={styles.postActions}>
              <TouchableOpacity onPress={() => setShowNewPost(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createPost} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Post with AI Review 🤖</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Feed Content */}
        {selectedTab === 'feed' && feed?.posts && (
          <View style={styles.feedContainer}>
            <Text style={styles.sectionTitle}>📝 Community Feed</Text>
            {feed.posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>👤 {post.username}</Text>
                    <Text style={styles.postTime}>{getTimeAgo(post.created_at)}</Text>
                  </View>
                  <Text style={styles.sentimentIcon}>{getSentimentIcon(post.ai_sentiment_score)}</Text>
                </View>
                
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent}>{post.content}</Text>
                
                {post.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {post.tags.map((tag, index) => (
                      <Text key={index} style={styles.tag}>#{tag}</Text>
                    ))}
                  </View>
                )}
                
                <View style={styles.postStats}>
                  <TouchableOpacity 
                    style={styles.statButton}
                    onPress={() => interactWithContent(post.id, 'like')}
                  >
                    <Text style={styles.statText}>❤️ {post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.statButton}
                    onPress={() => interactWithContent(post.id, 'view')}
                  >
                    <Text style={styles.statText}>💬 {post.comments}</Text>
                  </TouchableOpacity>
                  <Text style={styles.statText}>📤 {post.shares}</Text>
                  <Text style={styles.statText}>👁️ {post.views}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Trending Content */}
        {selectedTab === 'trending' && feed?.trending && (
          <View style={styles.trendingContainer}>
            <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
            {feed.trending.map((item, index) => (
              <View key={item.id} style={styles.trendingCard}>
                <Text style={styles.trendingRank}>#{index + 1}</Text>
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingTitle}>{item.title}</Text>
                  <Text style={styles.trendingAuthor}>by {item.author}</Text>
                  <View style={styles.trendingStats}>
                    <Text style={styles.trendingScore}>
                      🔥 {(item.trending_score * 100).toFixed(0)}% trending
                    </Text>
                    <Text style={styles.engagementRate}>
                      📊 {(item.engagement_rate * 100).toFixed(1)}% engagement
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Reviews */}
        {selectedTab === 'reviews' && feed?.reviews && (
          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>⭐ Product Reviews</Text>
            {feed.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewUsername}>👤 {review.username}</Text>
                    <Text style={styles.reviewTime}>{getTimeAgo(review.created_at)}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                
                <Text style={styles.productName}>📦 {review.product_name}</Text>
                <Text style={styles.reviewTitle}>{review.title}</Text>
                <Text style={styles.reviewText}>{review.review_text}</Text>
                
                <View style={styles.reviewStats}>
                  <Text style={styles.reviewStat}>👍 {review.helpful_count} helpful</Text>
                  <Text style={styles.reviewSentiment}>
                    AI Sentiment: {getSentimentIcon(review.ai_sentiment_score)} 
                    {(review.ai_sentiment_score * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* AI Recommendations */}
        {feed?.recommendations && feed.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
            {feed.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#000000',
  },
  newPostContainer: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  newPostTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  postTitleInput: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  postContentInput: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#666666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  postCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  postTime: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 2,
  },
  sentimentIcon: {
    fontSize: 20,
  },
  postTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postContent: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    color: '#D4AF37',
    fontSize: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statButton: {
    paddingVertical: 4,
  },
  statText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  trendingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trendingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  trendingRank: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 16,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendingAuthor: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 6,
  },
  trendingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendingScore: {
    color: '#FF6B35',
    fontSize: 11,
    fontWeight: '600',
  },
  engagementRate: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUsername: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewTime: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
  },
  productName: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStat: {
    color: '#4CAF50',
    fontSize: 12,
  },
  reviewSentiment: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recommendationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    borderWidth: 1,
    borderColor: '#333333',
  },
  recommendationText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
});