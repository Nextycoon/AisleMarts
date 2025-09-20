import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';

const { width, height } = Dimensions.get('window');

interface LiveProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  stock: number;
  discount?: number;
  image: string;
}

interface LiveComment {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isModerator?: boolean;
  isHost?: boolean;
}

interface LiveStats {
  viewers: number;
  likes: number;
  sales: number;
  revenue: number;
}

export default function LiveCommerceScreen() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [pinnedProduct, setPinnedProduct] = useState<LiveProduct | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liveStats, setLiveStats] = useState<LiveStats>({
    viewers: 0,
    likes: 0,
    sales: 0,
    revenue: 0,
  });

  const cameraRef = useRef<Camera>(null);

  const liveProducts: LiveProduct[] = [
    {
      id: '1',
      title: 'Wireless Headphones Pro',
      price: 299.99,
      currency: 'EUR',
      stock: 50,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    },
    {
      id: '2',
      title: 'Designer Handbag',
      price: 899.99,
      currency: 'EUR',
      stock: 12,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
    },
    {
      id: '3',
      title: 'Smart Home Speaker',
      price: 149.99,
      currency: 'EUR',
      stock: 25,
      discount: 15,
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300',
    },
  ];

  const sampleComments: LiveComment[] = [
    {
      id: '1',
      username: '@sarah_j',
      message: 'Love this product! 😍',
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: '2',
      username: '@mike_chen',
      message: 'What\'s the shipping cost?',
      timestamp: new Date(Date.now() - 25000),
    },
    {
      id: '3',
      username: '@emma_r',
      message: 'Just ordered! Thanks for the demo 🛍️',
      timestamp: new Date(Date.now() - 20000),
    },
    {
      id: '4',
      username: '@BlueWave_Moderator',
      message: 'Free shipping on orders over €50! 📦',
      timestamp: new Date(Date.now() - 15000),
      isModerator: true,
    },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Initialize comments
    setComments(sampleComments);

    // Simulate live stats updates
    const statsInterval = setInterval(() => {
      if (isLive) {
        setLiveStats(prev => ({
          viewers: prev.viewers + Math.floor(Math.random() * 10),
          likes: prev.likes + Math.floor(Math.random() * 5),
          sales: prev.sales + Math.floor(Math.random() * 2),
          revenue: prev.revenue + (Math.random() * 100),
        }));
      }
    }, 3000);

    return () => clearInterval(statsInterval);
  }, [isLive]);

  const startLive = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to go live');
      return;
    }
    
    setIsLive(true);
    setLiveStats({
      viewers: 1,
      likes: 0,
      sales: 0,
      revenue: 0,
    });
  };

  const endLive = () => {
    Alert.alert(
      'End Live Stream',
      'Are you sure you want to end your live stream?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Stream',
          style: 'destructive',
          onPress: () => {
            setIsLive(false);
            router.back();
          },
        },
      ]
    );
  };

  const pinProduct = (product: LiveProduct) => {
    setPinnedProduct(product);
    // Simulate adding comment about pinned product
    const hostComment: LiveComment = {
      id: Date.now().toString(),
      username: '@YourBusiness',
      message: `📌 Now showing: ${product.title} - ${product.currency} ${product.price}${product.discount ? ` (${product.discount}% OFF!)` : ''}`,
      timestamp: new Date(),
      isHost: true,
    };
    setComments(prev => [...prev, hostComment]);
  };

  const sendComment = () => {
    if (newComment.trim()) {
      const comment: LiveComment = {
        id: Date.now().toString(),
        username: '@You',
        message: newComment,
        timestamp: new Date(),
        isHost: true,
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const toggleCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
        }}>
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {!isLive ? (
        // Pre-Live Setup Screen
        <View style={styles.setupContainer}>
          <Text style={styles.title}>🔴 BlueWave Live Shopping</Text>
          <Text style={styles.subtitle}>Family-Safe Live Commerce Experience</Text>

          <View style={styles.cameraPreview}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={cameraType}
              flashMode={flashMode}
            />
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.cameraButton} onPress={toggleCamera}>
                <Text style={styles.cameraButtonText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={toggleFlash}>
                <Text style={styles.cameraButtonText}>
                  {flashMode === Camera.Constants.FlashMode.on ? '⚡' : '🔦'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛍️</Text>
              <Text style={styles.featureText}>Pin Products</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Live Chat</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛡️</Text>
              <Text style={styles.featureText}>Family Safe</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Real-time Analytics</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.goLiveButton} onPress={startLive}>
            <Text style={styles.goLiveButtonText}>🔴 Go Live</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Live Stream Interface
        <View style={styles.liveContainer}>
          <Camera
            ref={cameraRef}
            style={styles.liveCamera}
            type={cameraType}
            flashMode={flashMode}
          />

          {/* Live Indicator */}
          <View style={styles.liveIndicator}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>🔴 LIVE</Text>
            </View>
            <Text style={styles.viewerCount}>{liveStats.viewers} viewers</Text>
          </View>

          {/* Live Stats */}
          <View style={styles.liveStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{liveStats.likes}</Text>
              <Text style={styles.statLabel}>❤️</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{liveStats.sales}</Text>
              <Text style={styles.statLabel}>🛒</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>€{liveStats.revenue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>💰</Text>
            </View>
          </View>

          {/* Pinned Product */}
          {pinnedProduct && (
            <View style={styles.pinnedProduct}>
              <Text style={styles.pinnedProductTitle}>📌 {pinnedProduct.title}</Text>
              <View style={styles.pinnedProductDetails}>
                <Text style={styles.pinnedProductPrice}>
                  {pinnedProduct.currency} {pinnedProduct.price}
                  {pinnedProduct.discount && (
                    <Text style={styles.discountText}> ({pinnedProduct.discount}% OFF!)</Text>
                  )}
                </Text>
                <Text style={styles.stockText}>{pinnedProduct.stock} left</Text>
              </View>
            </View>
          )}

          {/* Products Panel */}
          <View style={styles.productsPanel}>
            <Text style={styles.panelTitle}>Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {liveProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => pinProduct(product)}
                >
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>
                    {product.currency} {product.price}
                  </Text>
                  {product.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>{product.discount}% OFF</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Comments */}
          <View style={styles.commentsContainer}>
            <ScrollView 
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
            >
              {comments.slice(-5).map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={[
                      styles.commentUsername,
                      comment.isHost && styles.hostUsername,
                      comment.isModerator && styles.moderatorUsername,
                    ]}>
                      {comment.username}
                      {comment.isHost && ' 👑'}
                      {comment.isModerator && ' 🛡️'}
                    </Text>
                  </View>
                  <Text style={styles.commentMessage}>{comment.message}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Say something..."
                placeholderTextColor="#CCCCCC"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendComment}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Live Controls */}
          <View style={styles.liveControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
              <Text style={styles.controlButtonText}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Text style={styles.controlButtonText}>
                {flashMode === Camera.Constants.FlashMode.on ? '⚡' : '🔦'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={endLive}>
              <Text style={styles.endButtonText}>End Live</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 40,
  },
  cameraPreview: {
    width: width * 0.8,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonText: {
    fontSize: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    width: (width - 80) / 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  goLiveButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  goLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  liveContainer: {
    flex: 1,
  },
  liveCamera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  liveIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  liveBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  viewerCount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  liveStats: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 16,
    zIndex: 2,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  pinnedProduct: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.95)',
    padding: 16,
    borderRadius: 12,
    zIndex: 2,
  },
  pinnedProductTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  pinnedProductDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinnedProductPrice: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  discountText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  stockText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
  },
  productsPanel: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginLeft: 20,
    minWidth: 120,
    position: 'relative',
  },
  productTitle: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  commentsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    height: 200,
    zIndex: 2,
  },
  commentsList: {
    flex: 1,
    marginBottom: 12,
  },
  commentItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentUsername: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  hostUsername: {
    color: '#FF3B30',
  },
  moderatorUsername: {
    color: '#34C759',
  },
  commentMessage: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  liveControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 24,
  },
  endButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});