import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TabNavigator from '../navigation/TabNavigator';

interface Comment {
  id: string;
  username: string;
  text: string;
  likes: number;
  replies_count: number;
  created_at: string;
  is_pinned: boolean;
  family_safe: boolean;
  parent_comment_id?: string;
}

interface ContentInfo {
  id: string;
  creator: {
    username: string;
    verified: boolean;
  };
  caption: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

export default function CommentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [contentInfo, setContentInfo] = useState<ContentInfo | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadComments();
    loadContentInfo();
  }, [id]);

  const loadContentInfo = async () => {
    // Mock content info - in real app, fetch from API
    setContentInfo({
      id: id as string,
      creator: {
        username: '@LuxeFashion',
        verified: true
      },
      caption: 'New winter collection is here! ❄️ Stay warm and stylish 🔥',
      stats: {
        likes: 127300,
        comments: 8200,
        shares: 3100,
        views: 2456000
      }
    });
  };

  const loadComments = async () => {
    try {
      setIsLoading(true);
      
      // Mock API call - in real app, use actual backend
      const mockComments: Comment[] = [
        {
          id: 'comment_001',
          username: '@sarah_j',
          text: 'Love this! Perfect for winter 😍',
          likes: 45,
          replies_count: 3,
          created_at: '2024-01-16T11:00:00Z',
          is_pinned: false,
          family_safe: true
        },
        {
          id: 'comment_002',
          username: '@mike_chen',
          text: 'Where can I buy this? My family would love it!',
          likes: 23,
          replies_count: 1,
          created_at: '2024-01-16T11:15:00Z',
          is_pinned: false,
          family_safe: true
        },
        {
          id: 'comment_003',
          username: '@emma_r',
          text: 'Quality looks amazing! Thanks for sharing ✨',
          likes: 67,
          replies_count: 0,
          created_at: '2024-01-16T11:30:00Z',
          is_pinned: true,
          family_safe: true
        },
        {
          id: 'comment_004',
          username: '@family_shopper',
          text: 'Perfect timing! My kids need new winter coats 🧥',
          likes: 34,
          replies_count: 2,
          created_at: '2024-01-16T11:45:00Z',
          is_pinned: false,
          family_safe: true
        },
        {
          id: 'comment_005',
          username: '@style_mom',
          text: 'Love that this is family-approved! Family safety is so important 🛡️',
          likes: 89,
          replies_count: 5,
          created_at: '2024-01-16T12:00:00Z',
          is_pinned: false,
          family_safe: true
        }
      ];

      setComments(mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsPosting(true);
      
      // Mock API call - in real app, call backend
      const comment: Comment = {
        id: `comment_${Date.now()}`,
        username: '@you',
        text: newComment.trim(),
        likes: 0,
        replies_count: 0,
        created_at: new Date().toISOString(),
        is_pinned: false,
        family_safe: true
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      // Update content stats
      if (contentInfo) {
        setContentInfo(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            comments: prev.stats.comments + 1
          }
        } : null);
      }

      // Scroll to top to show new comment
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  const handleReplyToComment = (commentId: string, username: string) => {
    setNewComment(`@${username.replace('@', '')} `);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderComment = (comment: Comment) => (
    <View key={comment.id} style={[styles.commentItem, comment.is_pinned && styles.pinnedComment]}>
      {comment.is_pinned && (
        <View style={styles.pinnedBadge}>
          <Text style={styles.pinnedBadgeText}>📌 Pinned</Text>
        </View>
      )}
      
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {comment.username.charAt(1).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.commentContent}>
          <View style={styles.commentUserInfo}>
            <Text style={styles.commentUsername}>
              {comment.username}
            </Text>
            <Text style={styles.commentTime}>
              {formatTimeAgo(comment.created_at)}
            </Text>
            {comment.family_safe && (
              <View style={styles.familySafeBadge}>
                <Text style={styles.familySafeIcon}>🛡️</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.commentText}>{comment.text}</Text>
          
          <View style={styles.commentActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLikeComment(comment.id)}
            >
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionText}>{comment.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleReplyToComment(comment.id, comment.username)}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
            
            {comment.replies_count > 0 && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.repliesText}>
                  View {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={styles.headerRight}>
          {contentInfo && (
            <Text style={styles.commentCount}>
              {contentInfo.stats.comments.toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      {/* Content Info */}
      {contentInfo && (
        <View style={styles.contentInfo}>
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorUsername}>
              {contentInfo.creator.username}
              {contentInfo.creator.verified && ' ✓'}
            </Text>
            <Text style={styles.contentCaption} numberOfLines={2}>
              {contentInfo.caption}
            </Text>
          </View>
          
          <View style={styles.contentStats}>
            <Text style={styles.statText}>
              {contentInfo.stats.views.toLocaleString()} views
            </Text>
            <Text style={styles.statText}>
              {contentInfo.stats.likes.toLocaleString()} likes
            </Text>
          </View>
        </View>
      )}

      {/* Comments List */}
      <KeyboardAvoidingView 
        style={styles.commentsContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.commentsContent}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : (
            <>
              {comments.map(renderComment)}
              
              {comments.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>💬</Text>
                  <Text style={styles.emptyStateTitle}>No comments yet</Text>
                  <Text style={styles.emptyStateText}>
                    Be the first to share your thoughts!
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a family-friendly comment..."
              placeholderTextColor="#666666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxHeight={100}
            />
            <TouchableOpacity 
              style={[styles.postButton, (!newComment.trim() || isPosting) && styles.postButtonDisabled]}
              onPress={handlePostComment}
              disabled={!newComment.trim() || isPosting}
            >
              <Text style={[styles.postButtonText, (!newComment.trim() || isPosting) && styles.postButtonTextDisabled]}>
                {isPosting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.familySafeNotice}>
            <Text style={styles.familySafeNoticeText}>
              🛡️ All comments are moderated for family safety
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  commentCount: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  contentInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  creatorInfo: {
    marginBottom: 8,
  },
  creatorUsername: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentCaption: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
  },
  contentStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    color: '#666666',
    fontSize: 12,
  },
  commentsContainer: {
    flex: 1,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666666',
    fontSize: 16,
  },
  commentItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  pinnedComment: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  pinnedBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  pinnedBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  commentHeader: {
    flexDirection: 'row',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  commentContent: {
    flex: 1,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUsername: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  commentTime: {
    color: '#666666',
    fontSize: 12,
    marginRight: 8,
  },
  familySafeBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  familySafeIcon: {
    fontSize: 10,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  actionText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '500',
  },
  repliesText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  commentInputContainer: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100, // Account for tab navigator
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  commentInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  postButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  familySafeNotice: {
    alignItems: 'center',
  },
  familySafeNoticeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500',
  },
});