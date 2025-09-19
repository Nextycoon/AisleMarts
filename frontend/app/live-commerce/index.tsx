import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface LiveSession {
  id: string;
  title: string;
  host: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  status: 'upcoming' | 'live' | 'ended';
  scheduledTime: string;
  duration: number; // in minutes
  viewers: number;
  products: LiveProduct[];
  description: string;
}

interface LiveProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: number;
  dropPrice?: number;
  timeLeft?: number; // seconds for flash deals
}

interface Comment {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  type: 'comment' | 'purchase' | 'join';
}

const SAMPLE_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live1',
    title: 'Luxury Fashion Flash Drop',
    host: {
      name: 'Emma Style',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    status: 'live',
    scheduledTime: 'Now Live',
    duration: 20,
    viewers: 1247,
    description: 'Exclusive luxury fashion pieces with limited-time drop prices!',
    products: [
      {
        id: 'p1',
        name: 'Designer Silk Dress',
        brand: 'Luxury Label',
        price: 450,
        originalPrice: 699,
        dropPrice: 399,
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop',
        inStock: 12,
        timeLeft: 180
      },
      {
        id: 'p2',
        name: 'Premium Handbag',
        brand: 'Crafted Luxury',
        price: 299,
        originalPrice: 459,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=400&fit=crop',
        inStock: 8
      }
    ]
  },
  {
    id: 'live2',
    title: 'Tech Innovation Showcase',
    host: {
      name: 'Tech Guru',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    status: 'upcoming',
    scheduledTime: 'Starting in 2:30:45',
    duration: 20,
    viewers: 892,
    description: 'Latest tech gadgets with exclusive launch pricing',
    products: [
      {
        id: 'p3',
        name: 'Smart Watch Pro',
        brand: 'Innovation Tech',
        price: 299,
        originalPrice: 399,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=400&fit=crop',
        inStock: 25
      }
    ]
  }
];

const SAMPLE_COMMENTS: Comment[] = [
  { id: '1', user: 'FashionLover', message: 'That dress is gorgeous! 😍', timestamp: '2 sec ago', type: 'comment' },
  { id: '2', user: 'LuxuryShopper', message: 'Just bought the handbag!', timestamp: '15 sec ago', type: 'purchase' },
  { id: '3', user: 'StyleQueen', message: 'Emma, where is this from?', timestamp: '32 sec ago', type: 'comment' },
  { id: '4', user: 'TrendWatcher', message: '🛍️ Added to cart!', timestamp: '45 sec ago', type: 'comment' },
  { id: '5', user: 'NewUser23', message: 'Welcome to the drop!', timestamp: '1 min ago', type: 'join' },
];

export default function LiveCommerceScreen() {
  const insets = useSafeAreaInsets();
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LiveProduct | null>(null);
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [viewerCount, setViewerCount] = useState(1247);
  const [showProductOverlay, setShowProductOverlay] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);

  useEffect(() => {
    // Simulate live viewer count changes
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 20) - 10);
    }, 3000);

    // Simulate new comments
    const commentInterval = setInterval(() => {
      const randomComments = [
        'Amazing quality!',
        'Just ordered! 🛍️',
        'Love this style',
        'When is the next drop?',
        'Sold out already?',
        'Beautiful collection!'
      ];
      
      const newComment: Comment = {
        id: Date.now().toString(),
        user: `User${Math.floor(Math.random() * 1000)}`,
        message: randomComments[Math.floor(Math.random() * randomComments.length)],
        timestamp: 'Just now',
        type: 'comment'
      };
      
      setComments(prev => [newComment, ...prev.slice(0, 10)]);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(commentInterval);
    };
  }, []);

  const joinLiveSession = (session: LiveSession) => {
    setActiveSession(session);
  };

  const leaveLiveSession = () => {
    setActiveSession(null);
    setSelectedProduct(null);
    setShowProductOverlay(false);
  };

  const addToCart = (product: LiveProduct) => {
    setCartItems(prev => [...prev, product.id]);
    Alert.alert(
      'Added to Cart!',
      `${product.name} has been added to your cart`,
      [
        { text: 'Continue Shopping', style: 'default' },
        { text: 'View Cart', onPress: () => console.log('Navigate to cart') }
      ]
    );
  };

  const sendComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'You',
        message: newComment.trim(),
        timestamp: 'Just now',
        type: 'comment'
      };
      
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderLiveSessionsList = () => (
    <ScrollView style={styles.sessionsContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>🔴 Live & Upcoming Drops</Text>
      
      {SAMPLE_LIVE_SESSIONS.map((session) => (
        <TouchableOpacity
          key={session.id}
          style={styles.sessionCard}
          onPress={() => joinLiveSession(session)}
        >
          <LinearGradient
            colors={session.status === 'live' ? ['#FF4444', '#FF6666'] : ['#E8C968', '#D4AF37']}
            style={styles.sessionCardGradient}
          >
            <View style={styles.sessionHeader}>
              <View style={styles.hostInfo}>
                <View style={styles.hostAvatar}>
                  <Text style={styles.hostAvatarText}>
                    {session.host.name.charAt(0)}
                  </Text>
                  {session.host.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedIcon}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.hostDetails}>
                  <Text style={styles.hostName}>{session.host.name}</Text>
                  <Text style={styles.sessionTime}>{session.scheduledTime}</Text>
                </View>
              </View>
              
              <View style={styles.sessionStatus}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: session.status === 'live' ? '#FF4444' : '#FF9800' 
                }]}>
                  <Text style={styles.statusText}>
                    {session.status === 'live' ? 'LIVE' : 'UPCOMING'}
                  </Text>
                </View>
                <Text style={styles.viewerCount}>
                  👥 {session.viewers.toLocaleString()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionDescription}>{session.description}</Text>
            
            <View style={styles.sessionFooter}>
              <Text style={styles.productCount}>
                🛍️ {session.products.length} products
              </Text>
              <Text style={styles.duration}>⏱️ {session.duration} min</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLiveSession = () => {
    if (!activeSession) return null;

    return (
      <View style={styles.liveSessionContainer}>
        {/* Live Stream Area */}
        <View style={styles.streamContainer}>
          <LinearGradient
            colors={['#000', '#1a1a1a']}
            style={styles.streamBackground}
          >
            {/* Mock video stream */}
            <View style={styles.streamPlaceholder}>
              <Text style={styles.streamPlaceholderText}>🎥 LIVE STREAM</Text>
              <Text style={styles.streamSubtext}>{activeSession.host.name}</Text>
            </View>
            
            {/* Live overlay info */}
            <View style={styles.streamOverlay}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
                <Text style={styles.liveViewers}>{viewerCount.toLocaleString()}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={leaveLiveSession}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Product showcase overlay */}
            {selectedProduct && (
              <View style={styles.productShowcase}>
                <View style={styles.productShowcaseContent}>
                  <Text style={styles.showcaseTitle}>{selectedProduct.name}</Text>
                  <View style={styles.showcasePricing}>
                    {selectedProduct.dropPrice && (
                      <>
                        <Text style={styles.dropPrice}>${selectedProduct.dropPrice}</Text>
                        <Text style={styles.originalPrice}>${selectedProduct.originalPrice}</Text>
                      </>
                    )}
                    {selectedProduct.timeLeft && (
                      <Text style={styles.timeLeft}>
                        ⏰ {formatTimeLeft(selectedProduct.timeLeft)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Product Carousel */}
        <View style={styles.productCarousel}>
          <Text style={styles.carouselTitle}>🛍️ Featured Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
            {activeSession.products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  selectedProduct?.id === product.id && styles.selectedProductCard
                ]}
                onPress={() => setSelectedProduct(product)}
              >
                <View style={styles.productImagePlaceholder}>
                  <Text style={styles.productImageText}>📸</Text>
                </View>
                
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
                
                <View style={styles.productPricing}>
                  {product.dropPrice ? (
                    <>
                      <Text style={styles.productDropPrice}>${product.dropPrice}</Text>
                      <Text style={styles.productOriginalPrice}>${product.originalPrice}</Text>
                    </>
                  ) : (
                    <Text style={styles.productPrice}>${product.price}</Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => addToCart(product)}
                >
                  <LinearGradient
                    colors={['#E8C968', '#D4AF37']}
                    style={styles.addToCartGradient}
                  >
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <Text style={styles.stockCount}>{product.inStock} left</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Live Comments */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>💬 Live Chat</Text>
          </View>
          
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                <Text style={styles.commentMessage}>{comment.message}</Text>
                <Text style={styles.commentTime}>{comment.timestamp}</Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.commentInput}>
            <TextInput
              style={styles.commentTextInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Join the conversation..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              onSubmitEditing={sendComment}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendComment}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {!activeSession ? (
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <LinearGradient
                colors={['#FF4444', '#FF6666']}
                style={styles.titleBadge}
              >
                <Text style={styles.titleBadgeText}>LIVE</Text>
              </LinearGradient>
              <Text style={styles.headerTitle}>Live Commerce</Text>
              <Text style={styles.headerSubtitle}>Exclusive 20-minute luxury drops</Text>
            </View>
          </View>

          {renderLiveSessionsList()}
        </>
      ) : (
        renderLiveSession()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  sessionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionCardGradient: {
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  hostAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  sessionStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  viewerCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  duration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  liveSessionContainer: {
    flex: 1,
  },
  streamContainer: {
    height: height * 0.4,
  },
  streamBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamPlaceholder: {
    alignItems: 'center',
  },
  streamPlaceholderText: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
  },
  streamSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  streamOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,68,68,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  liveViewers: {
    fontSize: 12,
    color: '#ffffff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  productShowcase: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 16,
  },
  productShowcaseContent: {
    alignItems: 'center',
  },
  showcaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  showcasePricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  timeLeft: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  productCarousel: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  productScroll: {
    paddingLeft: 20,
  },
  productCard: {
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedProductCard: {
    borderColor: '#E8C968',
    backgroundColor: 'rgba(232, 201, 104, 0.1)',
  },
  productImagePlaceholder: {
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImageText: {
    fontSize: 24,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  productDropPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  productOriginalPrice: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C968',
  },
  addToCartBtn: {
    marginBottom: 6,
  },
  addToCartGradient: {
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  stockCount: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  commentsSection: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  commentsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E8C968',
    marginBottom: 2,
  },
  commentMessage: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  commentInput: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#E8C968',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});