import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const RepostCreator = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [repostComment, setRepostComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Extract parameters from navigation
  const {
    videoId = 'unknown',
    creatorName = 'Unknown Creator',
    caption = 'Original content'
  } = params;

  const handleCreateRepost = async () => {
    if (!repostComment.trim()) {
      Alert.alert('Comment Required', 'Please add a comment to your repost');
      return;
    }

    setIsPosting(true);
    
    try {
      // Simulate repost creation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Creating repost:', {
        videoId,
        originalCreator: creatorName,
        originalCaption: caption,
        repostComment: repostComment
      });

      Alert.alert(
        'Repost Successful!', 
        'Your repost has been shared to your profile and followers.',
        [
          {
            text: 'View Post',
            onPress: () => router.push('/profile')
          },
          {
            text: 'Done',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create repost. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#22C55E" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Repost</Text>
          <Text style={styles.headerSubtitle}>Add your thoughts</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="information-circle-outline" size={24} color="#22C55E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Original Content Preview */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.originalContentCard}>
          <View style={styles.originalContentHeader}>
            <View style={styles.repostIcon}>
              <Ionicons name="repeat" size={20} color="#22C55E" />
            </View>
            <View style={styles.originalContentInfo}>
              <Text style={styles.repostingText}>Reposting from</Text>
              <Text style={styles.originalCreatorName}>{creatorName}</Text>
            </View>
          </View>
          
          <View style={styles.originalContentBody}>
            <Text style={styles.originalCaption}>"{caption}"</Text>
          </View>
          
          <View style={styles.engagementStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#FF0050" />
              <Text style={styles.statText}>127K</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={16} color="#1E90FF" />
              <Text style={styles.statText}>8.2K</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="share-social" size={16} color="#50C878" />
              <Text style={styles.statText}>3.1K</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Comment Section */}
        <Text style={styles.sectionTitle}>Add Your Comment</Text>
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.commentCard}>
          <TextInput
            style={styles.commentInput}
            placeholder="What do you think about this? Share your thoughts with your followers..."
            placeholderTextColor="#888888"
            multiline
            maxLength={280}
            value={repostComment}
            onChangeText={setRepostComment}
          />
          <View style={styles.commentFooter}>
            <Text style={styles.characterCount}>
              {repostComment.length}/280
            </Text>
            <TouchableOpacity style={styles.emojiButton}>
              <Text style={styles.emojiText}>😊</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Repost Settings */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Repost Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="people" size={20} color="#22C55E" />
              <Text style={styles.settingText}>Share to followers</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="globe" size={20} color="#888888" />
              <Text style={[styles.settingText, { color: '#888888' }]}>Share to public feed</Text>
            </View>
            <View style={styles.toggle}>
              <Text style={styles.toggleText}>Optional</Text>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="tag" size={20} color="#22C55E" />
              <Text style={styles.settingText}>Credit original creator</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          </View>
        </LinearGradient>

        {/* AI Engagement Prediction */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <Ionicons name="sparkles" size={20} color="#D4AF37" />
            <Text style={styles.predictionTitle}>AI Engagement Prediction</Text>
          </View>
          
          <View style={styles.predictionStats}>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionValue}>+87%</Text>
              <Text style={styles.predictionLabel}>Expected Reach</Text>
            </View>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionValue}>+62%</Text>
              <Text style={styles.predictionLabel}>Engagement Rate</Text>
            </View>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionValue}>4.2K</Text>
              <Text style={styles.predictionLabel}>Predicted Views</Text>
            </View>
          </View>
          
          <Text style={styles.predictionTip}>
            💡 Adding hashtags could increase reach by an additional 23%
          </Text>
        </LinearGradient>

        {/* Repost Button */}
        <TouchableOpacity
          style={[styles.repostButton, isPosting && styles.repostButtonDisabled]}
          onPress={handleCreateRepost}
          disabled={isPosting}
        >
          <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.repostButtonGradient}>
            {isPosting ? (
              <Text style={styles.repostButtonText}>Posting...</Text>
            ) : (
              <>
                <Ionicons name="repeat" size={20} color="#FFFFFF" />
                <Text style={styles.repostButtonText}>Repost Now</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 2,
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  originalContentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  originalContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  repostIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originalContentInfo: {
    flex: 1,
  },
  repostingText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  originalCreatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  originalContentBody: {
    marginBottom: 16,
  },
  originalCaption: {
    fontSize: 15,
    color: '#CCCCCC',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  engagementStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  commentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  commentInput: {
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: '#888888',
  },
  emojiButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emojiText: {
    fontSize: 16,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  toggle: {
    backgroundColor: 'rgba(136, 136, 136, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 12,
    color: '#888888',
  },
  predictionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  predictionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  predictionItem: {
    alignItems: 'center',
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 4,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  predictionTip: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  repostButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  repostButtonDisabled: {
    opacity: 0.6,
  },
  repostButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  repostButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default RepostCreator;