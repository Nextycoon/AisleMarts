import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ImageBackground,
  FlatList,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

const SOCIAL_POSTS = [
  {
    id: '1',
    user: {
      name: 'Emma Style',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d32b42?w=100&h=100&fit=crop&crop=face',
      verified: true,
    },
    content: {
      type: 'image',
      media: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=700&fit=crop&crop=top',
      caption: 'Perfect autumn vibes with this luxury wool coat! 🍂✨',
      tags: ['#LuxuryFashion', '#AutumnStyle', '#OOTD'],
    },
    engagement: {
      likes: 2847,
      comments: 189,
      shares: 42,
      liked: false,
    },
    products: [
      {
        id: 'p1',
        name: 'Luxury Wool Coat',
        brand: 'Designer Label',
        price: '$599',
        position: { x: 0.3, y: 0.4 },
      },
      {
        id: 'p2',
        name: 'Leather Handbag',
        brand: 'Premium Craft',
        price: '$299',
        position: { x: 0.7, y: 0.6 },
      },
    ],
  },
  {
    id: '2',
    user: {
      name: 'Tech Guru',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      verified: true,
    },
    content: {
      type: 'image',
      media: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=700&fit=crop&crop=center',
      caption: 'Game-changing setup for productivity! My new workspace essentials 💻⚡',
      tags: ['#TechLife', '#Productivity', '#WorkFromHome'],
    },
    engagement: {
      likes: 1923,
      comments: 156,
      shares: 78,
      liked: true,
    },
    products: [
      {
        id: 'p3',
        name: 'Premium Laptop',
        brand: 'TechBrand',
        price: '$1,299',
        position: { x: 0.5, y: 0.3 },
      },
    ],
  },
  {
    id: '3',
    user: {
      name: 'Home Curator',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      verified: false,
    },
    content: {
      type: 'image',
      media: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=700&fit=crop&crop=center',
      caption: 'Transformed my living room into a cozy sanctuary 🏠✨ Minimalist vibes',
      tags: ['#HomeDecor', '#MinimalistStyle', '#InteriorDesign'],
    },
    engagement: {
      likes: 3156,
      comments: 234,
      shares: 91,
      liked: false,
    },
    products: [
      {
        id: 'p4',
        name: 'Modern Sofa',
        brand: 'Home Design',
        price: '$899',
        position: { x: 0.4, y: 0.5 },
      },
      {
        id: 'p5',
        name: 'Decorative Pillows',
        brand: 'Comfort Plus',
        price: '$49',
        position: { x: 0.6, y: 0.4 },
      },
    ],
  },
];

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [showProducts, setShowProducts] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLike = (postId: string) => {
    console.log(`❤️ Liked post ${postId}`);
    // Implement like functionality
  };

  const handleComment = (postId: string) => {
    console.log(`💬 Comment on post ${postId}`);
    // Implement comment functionality
  };

  const handleShare = (postId: string) => {
    console.log(`📤 Share post ${postId}`);
    // Implement share functionality
  };

  const handleProductTap = (product: any) => {
    console.log(`🛍️ Shop product: ${product.name}`);
    // Navigate to product detail or add to cart
  };

  const toggleProductsView = (postId: string) => {
    setShowProducts(showProducts === postId ? null : postId);
  };

  const renderSocialPost = (post: typeof SOCIAL_POSTS[0]) => (
    <View style={styles.postContainer}>
      <ImageBackground
        source={{ uri: post.content.media }}
        style={styles.postMedia}
        imageStyle={styles.postMediaStyle}
      >
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.6, 1]}
          style={styles.postOverlay}
        >
          {/* Product Hotspots */}
          {showProducts === post.id && post.products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.productHotspot,
                {
                  left: width * product.position.x - 12,
                  top: height * product.position.y - 12,
                }
              ]}
              onPress={() => handleProductTap(product)}
            >
              <View style={styles.productHotspotInner}>
                <Text style={styles.productHotspotText}>+</Text>
              </View>
              <View style={styles.productTooltip}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* User Info */}
          <View style={styles.userInfo}>
            <ImageBackground
              source={{ uri: post.user.avatar }}
              style={styles.userAvatar}
              imageStyle={styles.userAvatarStyle}
            >
              {post.user.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              )}
            </ImageBackground>
            <Text style={styles.userName}>{post.user.name}</Text>
          </View>

          {/* Post Content */}
          <View style={styles.postContent}>
            <Text style={styles.postCaption}>{post.content.caption}</Text>
            <View style={styles.postTags}>
              {post.content.tags.map((tag, index) => (
                <Text key={index} style={styles.postTag}>{tag}</Text>
              ))}
            </View>
          </View>

          {/* Shop the Look Button */}
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => toggleProductsView(post.id)}
          >
            <LinearGradient
              colors={['#E8C968', '#D4AF37']}
              style={styles.shopButtonGradient}
            >
              <Text style={styles.shopButtonText}>
                {showProducts === post.id ? 'Hide Products' : 'Shop the Look'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>

      {/* Engagement Actions */}
      <View style={styles.engagementActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Text style={[styles.actionIcon, post.engagement.liked && styles.likedIcon]}>
            ❤️
          </Text>
          <Text style={styles.actionCount}>{post.engagement.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleComment(post.id)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.engagement.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(post.id)}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionCount}>{post.engagement.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={['#E8C968', '#D4AF37']}
          style={styles.titleBadge}
        >
          <Text style={styles.titleBadgeText}>SOCIALISE</Text>
        </LinearGradient>
        <Text style={styles.headerTitle}>AisleMarts Social</Text>
      </View>

      {/* TikTok-style Vertical Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.feedScroll}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.y / height);
          setCurrentPostIndex(newIndex);
        }}
      >
        {SOCIAL_POSTS.map((post) => (
          <View key={post.id} style={styles.postWrapper}>
            {renderSocialPost(post)}
          </View>
        ))}
        
        <View style={{ height: insets.bottom }} />
      </ScrollView>

      {/* Post Indicator */}
      <View style={styles.postIndicator}>
        {SOCIAL_POSTS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              currentPostIndex === index && styles.activeIndicatorDot
            ]}
          />
        ))}
      </View>
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
    paddingVertical: 12,
    zIndex: 100,
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
  titleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 12,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  feedScroll: {
    flex: 1,
  },
  postWrapper: {
    height: height - 100, // Account for header
  },
  postContainer: {
    flex: 1,
    position: 'relative',
  },
  postMedia: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  postMediaStyle: {
    // No border radius for full-screen effect
  },
  postOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  productHotspot: {
    position: 'absolute',
    width: 24,
    height: 24,
    zIndex: 50,
  },
  productHotspotInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8C968',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productHotspotText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  productTooltip: {
    position: 'absolute',
    top: -60,
    left: -50,
    width: 120,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E8C968',
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
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8C968',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    marginRight: 12,
    position: 'relative',
  },
  userAvatarStyle: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8C968',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  postContent: {
    marginBottom: 16,
  },
  postCaption: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 22,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  postTag: {
    fontSize: 14,
    color: '#4facfe',
    fontWeight: '600',
  },
  shopButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  shopButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  engagementActions: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  likedIcon: {
    color: '#ff4458',
  },
  actionCount: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  postIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -50 }],
    gap: 8,
  },
  indicatorDot: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeIndicatorDot: {
    backgroundColor: '#E8C968',
  },
});