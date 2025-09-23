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

interface ProductReview {
  id: string;
  username: string;
  product_id: string;
  product_name: string;
  rating: number;
  title: string;
  review_text: string;
  helpful_count: number;
  not_helpful_count: number;
  ai_sentiment_score: number;
  ai_authenticity_score: number;
  ai_summary: string | null;
  created_at: string;
}

export default function UserReviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewReview, setShowNewReview] = useState(false);
  const [newReview, setNewReview] = useState({
    productName: '',
    title: '',
    reviewText: '',
    rating: 5
  });

  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
  const userId = 'demo_user_001';
  const username = 'ReviewExpert';

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/community/reviews?limit=20`);
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const createReview = async () => {
    if (!newReview.productName.trim() || !newReview.title.trim() || !newReview.reviewText.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/community/reviews?user_id=${userId}&username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: `product_${Date.now()}`,
          product_name: newReview.productName,
          rating: newReview.rating,
          title: newReview.title,
          review_text: newReview.reviewText
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Review submitted with AI analysis! 🤖✨');
        setNewReview({ productName: '', title: '', reviewText: '', rating: 5 });
        setShowNewReview(false);
        fetchReviews();
      } else {
        Alert.alert('Error', 'Failed to submit review');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const renderStars = (rating: number, interactive = false, onPress?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onPress?.(i)}
          disabled={!interactive}
        >
          <Text style={[styles.star, { color: i <= rating ? '#D4AF37' : '#666666' }]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.7) return '#4CAF50';
    if (score > 0.3) return '#FFA500';
    return '#FF5722';
  };

  const getAuthenticityColor = (score: number) => {
    if (score > 0.8) return '#4CAF50';
    if (score > 0.6) return '#FFA500';
    return '#FF5722';
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  if (loading && reviews.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading Reviews...</Text>
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
          <Text style={styles.headerTitle}>User Reviews</Text>
          <TouchableOpacity onPress={() => setShowNewReview(!showNewReview)} style={styles.writeButton}>
            <Text style={styles.writeButtonText}>✍️ Write</Text>
          </TouchableOpacity>
        </View>

        {/* New Review Form */}
        {showNewReview && (
          <View style={styles.newReviewContainer}>
            <Text style={styles.newReviewTitle}>✍️ Write AI-Enhanced Review</Text>
            
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="What product are you reviewing?"
              placeholderTextColor="#666666"
              value={newReview.productName}
              onChangeText={(text) => setNewReview({...newReview, productName: text})}
            />

            <Text style={styles.inputLabel}>Your Rating</Text>
            {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}

            <Text style={styles.inputLabel}>Review Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Summarize your experience..."
              placeholderTextColor="#666666"
              value={newReview.title}
              onChangeText={(text) => setNewReview({...newReview, title: text})}
            />

            <Text style={styles.inputLabel}>Detailed Review</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your detailed experience, pros and cons..."
              placeholderTextColor="#666666"
              value={newReview.reviewText}
              onChangeText={(text) => setNewReview({...newReview, reviewText: text})}
              multiline
              numberOfLines={5}
            />

            <View style={styles.reviewActions}>
              <TouchableOpacity onPress={() => setShowNewReview(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createReview} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit with AI Analysis 🤖</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          <Text style={styles.sectionTitle}>⭐ Community Reviews</Text>
          
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptyText}>Be the first to share your product experience!</Text>
              <TouchableOpacity onPress={() => setShowNewReview(true)} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Write First Review</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewUsername}>👤 {review.username}</Text>
                    <Text style={styles.reviewTime}>{getTimeAgo(review.created_at)}</Text>
                  </View>
                  {renderStars(review.rating)}
                </View>

                <Text style={styles.productName}>📦 {review.product_name}</Text>
                <Text style={styles.reviewTitle}>{review.title}</Text>
                
                {review.ai_summary && (
                  <View style={styles.aiSummaryContainer}>
                    <Text style={styles.aiSummaryLabel}>🤖 AI Summary:</Text>
                    <Text style={styles.aiSummary}>{review.ai_summary}</Text>
                  </View>
                )}
                
                <Text style={styles.reviewText}>{review.review_text}</Text>

                <View style={styles.reviewFooter}>
                  <View style={styles.helpfulSection}>
                    <TouchableOpacity style={styles.helpfulButton}>
                      <Text style={styles.helpfulText}>👍 {review.helpful_count} helpful</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.helpfulButton}>
                      <Text style={styles.notHelpfulText}>👎 {review.not_helpful_count}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.aiMetrics}>
                    <View style={styles.aiMetric}>
                      <Text style={styles.aiLabel}>Sentiment:</Text>
                      <Text style={[styles.aiValue, { color: getSentimentColor(review.ai_sentiment_score) }]}>
                        {(review.ai_sentiment_score * 100).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.aiMetric}>
                      <Text style={styles.aiLabel}>Authentic:</Text>
                      <Text style={[styles.aiValue, { color: getAuthenticityColor(review.ai_authenticity_score) }]}>
                        {(review.ai_authenticity_score * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* AI Features Info */}
        <View style={styles.aiInfoContainer}>
          <Text style={styles.sectionTitle}>🤖 AI-Enhanced Reviews</Text>
          <View style={styles.aiInfoCard}>
            <Text style={styles.aiInfoText}>• Automatic sentiment analysis for honest feedback</Text>
            <Text style={styles.aiInfoText}>• Authenticity scoring to detect genuine reviews</Text>
            <Text style={styles.aiInfoText}>• AI-generated summaries for long reviews</Text>
            <Text style={styles.aiInfoText}>• Smart content moderation for quality assurance</Text>
            <Text style={styles.aiInfoText}>• Personalized review recommendations</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#D4AF37', fontSize: 16, marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333333' },
  backButton: { padding: 8 },
  backButtonText: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  writeButton: { backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  writeButtonText: { color: '#000000', fontSize: 12, fontWeight: 'bold' },
  newReviewContainer: { backgroundColor: '#1a1a1a', margin: 20, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#D4AF37' },
  newReviewTitle: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  inputLabel: { color: '#CCCCCC', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#333333', borderRadius: 8, padding: 12, color: '#FFFFFF', fontSize: 14 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  starsContainer: { flexDirection: 'row', marginVertical: 8 },
  star: { fontSize: 24, marginRight: 4 },
  reviewActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  cancelButton: { backgroundColor: '#666666', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  cancelButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  submitButton: { backgroundColor: '#D4AF37', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  submitButtonText: { color: '#000000', fontSize: 12, fontWeight: 'bold' },
  reviewsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold', marginVertical: 16 },
  emptyState: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#CCCCCC', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  emptyButton: { backgroundColor: '#D4AF37', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  emptyButtonText: { color: '#000000', fontSize: 14, fontWeight: 'bold' },
  reviewCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333333' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reviewUserInfo: { flex: 1 },
  reviewUsername: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  reviewTime: { color: '#CCCCCC', fontSize: 12, marginTop: 2 },
  productName: { color: '#D4AF37', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  reviewTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  aiSummaryContainer: { backgroundColor: '#2a2a2a', borderRadius: 8, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#D4AF37' },
  aiSummaryLabel: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  aiSummary: { color: '#CCCCCC', fontSize: 13, lineHeight: 18 },
  reviewText: { color: '#CCCCCC', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  helpfulSection: { flexDirection: 'row', gap: 16 },
  helpfulButton: { paddingVertical: 4 },
  helpfulText: { color: '#4CAF50', fontSize: 12 },
  notHelpfulText: { color: '#FF5722', fontSize: 12 },
  aiMetrics: { flexDirection: 'row', gap: 16 },
  aiMetric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiLabel: { color: '#CCCCCC', fontSize: 10 },
  aiValue: { fontSize: 10, fontWeight: 'bold' },
  aiInfoContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  aiInfoCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333333' },
  aiInfoText: { color: '#CCCCCC', fontSize: 14, marginBottom: 8 }
});