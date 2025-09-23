import React, { useState, useEffect } from 'react';
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

interface RemixType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  popularityScore: number;
}

const RemixCreator = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedRemixType, setSelectedRemixType] = useState<string>('');
  const [remixCaption, setRemixCaption] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Extract parameters from navigation
  const {
    videoId = 'unknown',
    soundId = 'unknown', 
    soundTitle = 'Original Audio',
    soundArtist = 'Unknown Artist',
    originalCreator = 'Unknown Creator'
  } = params;

  const remixTypes: RemixType[] = [
    {
      id: 'repost_now',
      title: 'Repost Now',
      description: 'Instantly repost to your profile and followers',
      icon: '🔄',
      color: '#22C55E',
      popularityScore: 98
    },
    {
      id: 'repost_with_comment',
      title: 'Repost with Comment',
      description: 'Add your thoughts before reposting',
      icon: '💬',
      color: '#10B981',
      popularityScore: 94
    },
    {
      id: 'use_sound',
      title: 'Use This Sound',
      description: 'Create new content with the original audio',
      icon: '🎵',
      color: '#9B59B6',
      popularityScore: 95
    },
    {
      id: 'collab',
      title: 'Collab',
      description: 'Place your video side-by-side with original',
      icon: '👥',
      color: '#3498DB',
      popularityScore: 88
    },
    {
      id: 'green_screen',
      title: 'Green Screen',
      description: 'Use original video as your background',
      icon: '📹',
      color: '#2ECC71',
      popularityScore: 82
    },
    {
      id: 'cut_clip',
      title: 'Cut Clip',
      description: 'Use a 1-5 second clip in your video',
      icon: '✂️',
      color: '#E74C3C',
      popularityScore: 76
    },
    {
      id: 'product_remix',
      title: 'Product Remix',
      description: 'Feature products with this content',
      icon: '🛍️',
      color: '#D4AF37',
      popularityScore: 91
    },
    {
      id: 'style_transfer',
      title: 'Style Transfer',
      description: 'Apply content style to your products',
      icon: '🎨',
      color: '#FF6B6B',
      popularityScore: 73
    }
  ];

  const handleCreateRemix = async () => {
    if (!selectedRemixType) {
      Alert.alert('Selection Required', 'Please select a remix type to continue');
      return;
    }

    // Handle quick repost without caption requirement
    if (selectedRemixType === 'repost_now') {
      setIsCreating(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Quick repost:', {
          type: selectedRemixType,
          originalVideo: videoId,
          originalCreator
        });

        Alert.alert(
          'Reposted Successfully!', 
          'Content has been shared to your profile and followers.',
          [
            {
              text: 'View Profile',
              onPress: () => router.push('/profile')
            },
            {
              text: 'Done',
              onPress: () => router.back()
            }
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to repost. Please try again.');
      } finally {
        setIsCreating(false);
      }
      return;
    }

    // For repost with comment and other remix types, caption is required
    if (!remixCaption.trim() && selectedRemixType !== 'repost_now') {
      const actionText = selectedRemixType === 'repost_with_comment' ? 'repost with comment' : 'remix';
      Alert.alert('Caption Required', `Please add a caption for your ${actionText}`);
      return;
    }

    setIsCreating(true);
    
    try {
      // Simulate creation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Creating content:', {
        type: selectedRemixType,
        originalVideo: videoId,
        sound: { id: soundId, title: soundTitle, artist: soundArtist },
        caption: remixCaption,
        originalCreator
      });

      const remixType = remixTypes.find(t => t.id === selectedRemixType);
      const isRepost = selectedRemixType === 'repost_with_comment';
      
      Alert.alert(
        isRepost ? 'Repost Created!' : 'Remix Created!', 
        `Your ${remixType?.title} ${isRepost ? 'repost' : 'remix'} is being processed. It will appear in your profile soon.`,
        [
          {
            text: 'Create Another',
            onPress: () => {
              setSelectedRemixType('');
              setRemixCaption('');
            }
          },
          {
            text: 'Done',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create content. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Remix Creator</Text>
          <Text style={styles.headerSubtitle}>Create viral content</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Original Content Info */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.originalContentCard}>
          <View style={styles.originalContentHeader}>
            <View style={styles.originalContentIcon}>
              <Ionicons name="musical-note" size={20} color="#9B59B6" />
            </View>
            <View style={styles.originalContentInfo}>
              <Text style={styles.originalSoundTitle}>{soundTitle}</Text>
              <Text style={styles.originalSoundArtist}>by {soundArtist}</Text>
              <Text style={styles.originalCreator}>Original: {originalCreator}</Text>
            </View>
          </View>
          <View style={styles.viralityIndicator}>
            <Text style={styles.viralityText}>🔥 Viral Potential</Text>
            <View style={styles.viralityBar}>
              <View style={[styles.viralityFill, { width: '92%' }]} />
            </View>
            <Text style={styles.viralityScore}>92% trending</Text>
          </View>
        </LinearGradient>

        {/* Remix Types */}
        <Text style={styles.sectionTitle}>Choose Your Remix Style</Text>
        
        {remixTypes.map((remixType) => (
          <TouchableOpacity
            key={remixType.id}
            style={[
              styles.remixTypeCard,
              selectedRemixType === remixType.id && styles.selectedRemixType
            ]}
            onPress={() => setSelectedRemixType(remixType.id)}
          >
            <LinearGradient
              colors={selectedRemixType === remixType.id ? 
                [remixType.color + '40', remixType.color + '20'] : 
                ['#1a1a1a', '#2d2d2d']
              }
              style={styles.remixTypeContent}
            >
              <View style={styles.remixTypeLeft}>
                <View style={[styles.remixTypeIcon, { backgroundColor: remixType.color + '20' }]}>
                  <Text style={styles.remixTypeIconText}>{remixType.icon}</Text>
                </View>
                <View style={styles.remixTypeInfo}>
                  <View style={styles.remixTypeTitleRow}>
                    <Text style={styles.remixTypeTitle}>{remixType.title}</Text>
                    <View style={styles.popularityBadge}>
                      <Text style={styles.popularityText}>{remixType.popularityScore}%</Text>
                    </View>
                  </View>
                  <Text style={styles.remixTypeDescription}>{remixType.description}</Text>
                </View>
              </View>
              
              {selectedRemixType === remixType.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={remixType.color} />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Caption Input */}
        {selectedRemixType && (
          <View style={styles.captionSection}>
            <Text style={styles.sectionTitle}>Add Your Caption</Text>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.captionCard}>
              <TextInput
                style={styles.captionInput}
                placeholder="What's your remix about? Add hashtags for more reach..."
                placeholderTextColor="#888888"
                multiline
                maxLength={150}
                value={remixCaption}
                onChangeText={setRemixCaption}
              />
              <View style={styles.captionFooter}>
                <Text style={styles.characterCount}>
                  {remixCaption.length}/150
                </Text>
                <TouchableOpacity style={styles.hashtagSuggestButton}>
                  <Text style={styles.hashtagSuggestText}># Suggest Tags</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* AI Suggestions */}
        {selectedRemixType && (
          <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.aiSuggestionsCard}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color="#D4AF37" />
              <Text style={styles.aiTitle}>AI Remix Tips</Text>
            </View>
            <View style={styles.aiSuggestions}>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionIcon}>💡</Text>
                <Text style={styles.suggestionText}>
                  This sound is trending in fashion content (+340% engagement)
                </Text>
              </View>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionIcon}>📈</Text>
                <Text style={styles.suggestionText}>
                  Best time to post: 7-9 PM for maximum reach
                </Text>
              </View>
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionIcon}>🏷️</Text>
                <Text style={styles.suggestionText}>
                  Suggested tags: #RemixChallenge #AisleMarts #ViralFashion
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Create Button */}
        {selectedRemixType && remixCaption.trim() && (
          <TouchableOpacity
            style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            onPress={handleCreateRemix}
            disabled={isCreating}
          >
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.createButtonGradient}>
              {isCreating ? (
                <Text style={styles.createButtonText}>Creating Remix...</Text>
              ) : (
                <>
                  <Ionicons name="videocam" size={20} color="#000000" />
                  <Text style={styles.createButtonText}>Create Remix</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

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
    color: '#D4AF37',
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
    marginBottom: 16,
  },
  originalContentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originalContentInfo: {
    flex: 1,
  },
  originalSoundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  originalSoundArtist: {
    fontSize: 14,
    color: '#9B59B6',
    marginBottom: 2,
  },
  originalCreator: {
    fontSize: 12,
    color: '#888888',
  },
  viralityIndicator: {
    alignItems: 'center',
  },
  viralityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  viralityBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  viralityFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  viralityScore: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  remixTypeCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedRemixType: {
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  remixTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  remixTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  remixTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  remixTypeIconText: {
    fontSize: 20,
  },
  remixTypeInfo: {
    flex: 1,
  },
  remixTypeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  remixTypeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  popularityBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularityText: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: '600',
  },
  remixTypeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  captionSection: {
    marginTop: 24,
  },
  captionCard: {
    borderRadius: 16,
    padding: 16,
  },
  captionInput: {
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  captionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: '#888888',
  },
  hashtagSuggestButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hashtagSuggestText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  aiSuggestionsCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  aiSuggestions: {
    gap: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  createButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 8,
  },
});

export default RemixCreator;