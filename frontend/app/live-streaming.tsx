import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import TabNavigator from './navigation/TabNavigator';
import FloatingAIAssistant from '../src/components/FloatingAIAssistant';

const { width, height } = Dimensions.get('window');

interface LiveComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  familySafe: boolean;
}

interface PinnedProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  sales: number;
}

interface LiveStats {
  viewers: number;
  likes: number;
  comments: number;
  sales: number;
  revenue: number;
  duration: number;
}

export default function LiveStreamingScreen() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const videoRef = useRef<any>(null);

  const [liveStats, setLiveStats] = useState<LiveStats>({
    viewers: 1247,
    likes: 3421,
    comments: 892,
    sales: 23,
    revenue: 2847.50,
    duration: 45
  });

  const [liveComments, setLiveComments] = useState<LiveComment[]>([
    {
      id: '1',
      username: '@sarah_j',
      text: 'Love this coat! Where can I buy it? 😍',
      timestamp: '2:34',
      familySafe: true
    },
    {
      id: '2',
      username: '@mike_chen',
      text: 'Great quality! My family would love this',
      timestamp: '2:28',
      familySafe: true
    },
    {
      id: '3',
      username: '@emma_r',
      text: 'Perfect for winter! Adding to cart now 🛒',
      timestamp: '2:15',
      familySafe: true
    }
  ]);

  const [pinnedProducts, setPinnedProducts] = useState<PinnedProduct[]>([
    {
      id: 'prod_1',
      title: 'Designer Winter Coat',
      price: 299.99,
      currency: 'EUR',
      sales: 8
    },
    {
      id: 'prod_2',
      title: 'Luxury Scarf',
      price: 89.99,
      currency: 'EUR',
      sales: 5
    }
  ]);

  const availableProducts = [
    {
      id: 'prod_3',
      title: 'Smart Winter Boots',
      price: 199.99,
      currency: 'EUR'
    },
    {
      id: 'prod_4',
      title: 'Heated Gloves',
      price: 79.99,
      currency: 'EUR'
    }
  ];

  const handleStartLive = () => {
    if (!streamTitle.trim()) {
      Alert.alert('Stream Title Required', 'Please enter a title for your live stream');
      return;
    }

    Alert.alert(
      'Start Live Stream',
      'Ready to go live? Make sure you have good lighting and stable internet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Live',
          onPress: () => {
            setIsLive(true);
            // Simulate live stream starting
            simulateLiveStream();
          }
        }
      ]
    );
  };

  const handleEndLive = () => {
    Alert.alert(
      'End Live Stream',
      'Are you sure you want to end the live stream?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Stream',
          style: 'destructive',
          onPress: () => {
            setIsLive(false);
            showStreamSummary();
          }
        }
      ]
    );
  };

  const simulateLiveStream = () => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        viewers: prev.viewers + Math.floor(Math.random() * 10) - 5,
        likes: prev.likes + Math.floor(Math.random() * 5),
        comments: prev.comments + Math.floor(Math.random() * 3),
        duration: prev.duration + 1
      }));
    }, 1000);

    // Clean up on unmount
    return () => clearInterval(interval);
  };

  const showStreamSummary = () => {
    Alert.alert(
      'Live Stream Ended',
      `Great session! Here's your summary:
      
• ${liveStats.viewers} peak viewers
• ${liveStats.likes} likes
• ${liveStats.comments} comments  
• ${liveStats.sales} sales
• €${liveStats.revenue} revenue
• ${Math.floor(liveStats.duration / 60)}:${(liveStats.duration % 60).toString().padStart(2, '0')} duration`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment: LiveComment = {
        id: Date.now().toString(),
        username: '@you',
        text: newComment.trim(),
        timestamp: `${Math.floor(liveStats.duration / 60)}:${(liveStats.duration % 60).toString().padStart(2, '0')}`,
        familySafe: true
      };
      setLiveComments([comment, ...liveComments]);
      setNewComment('');
    }
  };

  const handlePinProduct = (productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (product && pinnedProducts.length < 3) {
      setPinnedProducts([...pinnedProducts, { ...product, sales: 0 }]);
      Alert.alert('Product Pinned', `${product.title} is now featured in your live stream`);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLive) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Setup Screen */}
        <View style={styles.setupContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.setupTitle}>Go Live</Text>
          <Text style={styles.setupSubtitle}>
            Start live shopping with your audience
          </Text>

          {/* Preview */}
          <View style={styles.previewContainer}>
            <View style={styles.preview}>
              <Text style={styles.previewText}>📹 Camera Preview</Text>
              <Text style={styles.previewSubtext}>Your live video will appear here</Text>
            </View>
          </View>

          {/* Stream Settings */}
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>Stream Settings</Text>
            
            <TextInput
              style={styles.titleInput}
              placeholder="Enter stream title..."
              placeholderTextColor="#666666"
              value={streamTitle}
              onChangeText={setStreamTitle}
              maxLength={100}
            />

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>🛡️ Family Safe Content</Text>
              <Text style={styles.settingValue}>Enabled</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>🎯 Target Audience</Text>
              <Text style={styles.settingValue}>All Ages</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>💰 Shopping Features</Text>
              <Text style={styles.settingValue}>Enabled</Text>
            </View>
          </View>

          {/* Live Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Live Streaming Tips</Text>
            <Text style={styles.tipText}>• Ensure good lighting and stable internet</Text>
            <Text style={styles.tipText}>• Pin products during the stream to boost sales</Text>
            <Text style={styles.tipText}>• Engage with comments to build community</Text>
            <Text style={styles.tipText}>• Keep content family-friendly for BlueWave</Text>
          </View>

          {/* Start Button */}
          <TouchableOpacity 
            style={styles.startLiveButton}
            onPress={handleStartLive}
          >
            <Text style={styles.startLiveButtonText}>🔴 Start Live Stream</Text>
          </TouchableOpacity>
        </View>

        <TabNavigator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Live Stream Interface */}
      <View style={styles.liveContainer}>
        {/* Video Stream */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>🔴 LIVE</Text>
            <Text style={styles.videoTitle}>{streamTitle}</Text>
          </View>

          {/* Live Stats Overlay */}
          <View style={styles.statsOverlay}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statText}>{liveStats.viewers.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statText}>{liveStats.likes.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🕐</Text>
              <Text style={styles.statText}>{formatDuration(liveStats.duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsOverlay}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setShowProducts(!showProducts)}
            >
              <Text style={styles.controlButtonText}>🛍️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setShowSettings(!showSettings)}
            >
              <Text style={styles.controlButtonText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, styles.endButton]}
              onPress={handleEndLive}
            >
              <Text style={styles.controlButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pinned Products */}
          {pinnedProducts.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.pinnedProductsContainer}
            >
              {pinnedProducts.map(product => (
                <View key={product.id} style={styles.pinnedProduct}>
                  <Text style={styles.pinnedProductTitle}>{product.title}</Text>
                  <Text style={styles.pinnedProductPrice}>
                    {product.currency} {product.price}
                  </Text>
                  <Text style={styles.pinnedProductSales}>
                    {product.sales} sold
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Comments */}
          <View style={styles.commentsContainer}>
            <ScrollView 
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
            >
              {liveComments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTime}>{comment.timestamp}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Add a comment..."
                placeholderTextColor="#666666"
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleSendComment}
                returnKeyType="send"
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendComment}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Product Selection Modal */}
      <Modal
        visible={showProducts}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProducts(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pin Products</Text>
            <View style={styles.modalRight} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Pin up to 3 products to feature in your live stream
            </Text>
            
            {availableProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productOption}
                onPress={() => handlePinProduct(product.id)}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>
                    {product.currency} {product.price}
                  </Text>
                </View>
                <Text style={styles.pinButton}>📌 Pin</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Live Settings</Text>
            <View style={styles.modalRight} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Stream Quality</Text>
              <Text style={styles.settingInfo}>HD • 1080p • 30fps</Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Family Safety</Text>
              <Text style={styles.settingInfo}>🛡️ Enabled • Content moderated in real-time</Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Shopping Features</Text>
              <Text style={styles.settingInfo}>💰 Enabled • Viewers can buy pinned products</Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Performance</Text>
              <Text style={styles.settingInfo}>📊 {liveStats.viewers} viewers • Stable connection</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <TabNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  setupContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  setupTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  setupSubtitle: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 32,
  },
  previewContainer: {
    marginBottom: 32,
  },
  preview: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderStyle: 'dashed',
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewSubtext: {
    color: '#666666',
    fontSize: 14,
  },
  settingsContainer: {
    marginBottom: 32,
  },
  settingsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  titleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  settingValue: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  startLiveButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 100,
  },
  startLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  liveContainer: {
    flex: 1,
  },
  videoContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pinnedProductsContainer: {
    paddingLeft: 16,
    paddingVertical: 12,
  },
  pinnedProduct: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
  },
  pinnedProductTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pinnedProductPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  pinnedProductSales: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500',
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentsList: {
    flex: 1,
    maxHeight: 200,
  },
  commentItem: {
    marginBottom: 12,
  },
  commentUsername: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 2,
  },
  commentTime: {
    color: '#666666',
    fontSize: 12,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 100,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  modalCancel: {
    color: '#666666',
    fontSize: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalRight: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  pinButton: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingInfo: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
  },
});