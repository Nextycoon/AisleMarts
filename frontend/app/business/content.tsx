import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

interface Post {
  id: string;
  type: 'image' | 'video';
  content: string;
  products: Product[];
  views: string;
  likes: string;
  shares: string;
  timestamp: string;
  status: 'published' | 'draft' | 'scheduled';
}

export default function BusinessContentScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'compose' | 'catalog' | 'live'>('compose');
  const [postContent, setPostContent] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const products: Product[] = [
    {
      id: '1',
      name: 'Luxury Handbag',
      price: 899.99,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200',
      inStock: true,
    },
    {
      id: '2',
      name: 'Designer Sunglasses',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
      inStock: true,
    },
    {
      id: '3',
      name: 'Silk Scarf',
      price: 159.99,
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=200',
      inStock: false,
    },
    {
      id: '4',
      name: 'Leather Boots',
      price: 449.99,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
      inStock: true,
    },
  ];

  const recentPosts: Post[] = [
    {
      id: '1',
      type: 'video',
      content: 'New collection drop! 🔥 These luxury handbags are flying off the shelves...',
      products: [products[0]],
      views: '45.2K',
      likes: '3.8K',
      shares: '892',
      timestamp: '2h ago',
      status: 'published',
    },
    {
      id: '2',
      type: 'image',
      content: 'Summer vibes with our designer sunglasses ☀️ Perfect for the season!',
      products: [products[1]],
      views: '32.1K',
      likes: '2.9K',
      shares: '567',
      timestamp: '1d ago',
      status: 'published',
    },
  ];

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 3) {
          Alert.alert('Maximum 3 products', 'You can pin up to 3 products per post');
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) {
      Alert.alert('Content Required', 'Please add some content to your post');
      return;
    }
    
    Alert.alert(
      'Create Post',
      `Create post with ${selectedProducts.length} pinned products?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Draft', onPress: () => console.log('Saved as draft') },
        { text: 'Schedule', onPress: () => console.log('Schedule post') },
        { text: 'Publish', onPress: () => console.log('Published') },
      ]
    );
  };

  const renderComposer = () => (
    <View style={styles.composerContainer}>
      {/* Media Upload */}
      <View style={styles.mediaUpload}>
        <TouchableOpacity style={styles.mediaButton}>
          <Text style={styles.mediaIcon}>📷</Text>
          <Text style={styles.mediaText}>Add Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton}>
          <Text style={styles.mediaIcon}>🎥</Text>
          <Text style={styles.mediaText}>Add Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton}>
          <Text style={styles.mediaIcon}>🎵</Text>
          <Text style={styles.mediaText}>Add Music</Text>
        </TouchableOpacity>
      </View>

      {/* Content Input */}
      <View style={styles.contentInput}>
        <TextInput
          style={styles.textInput}
          placeholder="What's happening with your brand today?"
          placeholderTextColor="#999999"
          multiline
          numberOfLines={4}
          value={postContent}
          onChangeText={setPostContent}
        />
      </View>

      {/* Product Pinning */}
      <View style={styles.productSection}>
        <Text style={styles.sectionTitle}>📌 Pin Products (Max 3)</Text>
        {selectedProducts.length > 0 && (
          <View style={styles.selectedProducts}>
            {selectedProducts.map(product => (
              <View key={product.id} style={styles.selectedProduct}>
                <Image source={{ uri: product.image }} style={styles.selectedProductImage} />
                <Text style={styles.selectedProductName}>{product.name}</Text>
                <TouchableOpacity 
                  style={styles.removeProductButton}
                  onPress={() => toggleProductSelection(product)}
                >
                  <Text style={styles.removeProductText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
          {products.map(product => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.productCard,
                selectedProducts.find(p => p.id === product.id) && styles.selectedProductCard,
                !product.inStock && styles.outOfStockCard,
              ]}
              onPress={() => product.inStock && toggleProductSelection(product)}
              disabled={!product.inStock}
            >
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>€{product.price}</Text>
              {!product.inStock && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>Out of Stock</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Post Options */}
      <View style={styles.postOptions}>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionIcon}>🌐</Text>
          <Text style={styles.optionText}>Multi-Language</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionIcon}>📅</Text>
          <Text style={styles.optionText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionIcon}>🎯</Text>
          <Text style={styles.optionText}>A/B Test</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.draftButton}>
          <Text style={styles.draftButtonText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publishButton} onPress={handleCreatePost}>
          <Text style={styles.publishButtonText}>Publish Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCatalog = () => (
    <View style={styles.catalogContainer}>
      <View style={styles.catalogHeader}>
        <Text style={styles.catalogTitle}>Product Catalog</Text>
        <TouchableOpacity 
          style={styles.addProductButton}
          onPress={() => router.push('/product-editor')}
        >
          <Text style={styles.addProductButtonText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.catalogGrid}>
        {products.map(product => (
          <TouchableOpacity 
            key={product.id}
            style={styles.catalogCard}
            onPress={() => router.push(`/product-editor?id=${product.id}`)}
          >
            <Image source={{ uri: product.image }} style={styles.catalogImage} />
            <View style={styles.catalogInfo}>
              <Text style={styles.catalogProductName}>{product.name}</Text>
              <Text style={styles.catalogProductPrice}>€{product.price}</Text>
              <View style={styles.catalogStatus}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: product.inStock ? '#34C759' : '#FF3B30' }
                ]} />
                <Text style={styles.statusText}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.catalogEditButton}>
              <Text style={styles.catalogEditText}>✏️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Catalog Stats */}
      <View style={styles.catalogStats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>21</Text>
          <Text style={styles.statLabel}>In Stock</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>€67K</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
    </View>
  );

  const renderLiveStudio = () => (
    <View style={styles.liveContainer}>
      <View style={styles.liveHeader}>
        <Text style={styles.liveTitle}>🔴 LiveSale Studio</Text>
        <TouchableOpacity 
          style={styles.goLiveButton}
          onPress={() => router.push('/live-commerce')}
        >
          <Text style={styles.goLiveButtonText}>Go Live</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.livePreview}>
        <View style={styles.livePreviewContent}>
          <Text style={styles.livePreviewIcon}>📹</Text>
          <Text style={styles.livePreviewTitle}>Ready to go live?</Text>
          <Text style={styles.livePreviewSubtitle}>
            Showcase your products in real-time and engage with customers
          </Text>
        </View>
      </View>

      <View style={styles.liveFeatures}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📌</Text>
          <Text style={styles.featureTitle}>Pin Products</Text>
          <Text style={styles.featureDescription}>Highlight up to 5 products during live stream</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>⏰</Text>
          <Text style={styles.featureTitle}>Limited Drops</Text>
          <Text style={styles.featureDescription}>Create urgency with countdown timers</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>💬</Text>
          <Text style={styles.featureTitle}>Live Chat</Text>
          <Text style={styles.featureDescription}>Interact with viewers in real-time</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🎬</Text>
          <Text style={styles.featureTitle}>Replay</Text>
          <Text style={styles.featureDescription}>Save as shoppable video for later</Text>
        </View>
      </View>

      {/* Recent Live Events */}
      <View style={styles.recentLive}>
        <Text style={styles.sectionTitle}>Recent Live Events</Text>
        <View style={styles.liveEventCard}>
          <View style={styles.liveEventInfo}>
            <Text style={styles.liveEventTitle}>Summer Collection Launch</Text>
            <Text style={styles.liveEventStats}>2.3K viewers • 45 orders • €12.8K revenue</Text>
            <Text style={styles.liveEventDate}>Yesterday, 7:00 PM</Text>
          </View>
          <TouchableOpacity style={styles.replayButton}>
            <Text style={styles.replayButtonText}>View Replay</Text>
          </TouchableOpacity>
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
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content & Commerce</Text>
        <TouchableOpacity>
          <Text style={styles.insightsButton}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compose' && styles.activeTab]}
          onPress={() => setActiveTab('compose')}
        >
          <Text style={[styles.tabText, activeTab === 'compose' && styles.activeTabText]}>
            📝 Compose
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'catalog' && styles.activeTab]}
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.activeTabText]}>
            📦 Catalog
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
            🔴 Live
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'compose' && renderComposer()}
        {activeTab === 'catalog' && renderCatalog()}
        {activeTab === 'live' && renderLiveStudio()}

        {/* Recent Posts */}
        {activeTab === 'compose' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            {recentPosts.map(post => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Text style={styles.postType}>
                    {post.type === 'video' ? '🎥' : '📷'} {post.type}
                  </Text>
                  <Text style={styles.postStatus}>{post.status}</Text>
                  <Text style={styles.postTime}>{post.timestamp}</Text>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postStats}>
                  <Text style={styles.postStat}>👁️ {post.views}</Text>
                  <Text style={styles.postStat}>❤️ {post.likes}</Text>
                  <Text style={styles.postStat}>📤 {post.shares}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    fontSize: 32,
    color: '#D4AF37',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightsButton: {
    fontSize: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  composerContainer: {
    padding: 20,
  },
  mediaUpload: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  mediaIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  mediaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  contentInput: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  productSection: {
    marginBottom: 24,
  },
  selectedProducts: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  selectedProduct: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
    minWidth: 80,
  },
  selectedProductImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginBottom: 4,
  },
  selectedProductName: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
  },
  removeProductButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeProductText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productsScroll: {
    marginTop: 12,
  },
  productCard: {
    width: 100,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    position: 'relative',
  },
  selectedProductCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  outOfStockCard: {
    opacity: 0.5,
  },
  productImage: {
    width: '100%',
    height: 60,
    borderRadius: 4,
    marginBottom: 8,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 16,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '500',
  },
  postOptions: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  optionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  optionText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  draftButtonText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  catalogContainer: {
    padding: 20,
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  catalogTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addProductButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  catalogCard: {
    width: '47%',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    position: 'relative',
  },
  catalogImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
  },
  catalogInfo: {
    marginBottom: 8,
  },
  catalogProductName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  catalogProductPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  catalogStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  catalogEditButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogEditText: {
    fontSize: 16,
  },
  catalogStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  liveContainer: {
    padding: 20,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goLiveButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  goLiveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  livePreview: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderStyle: 'dashed',
  },
  livePreviewContent: {
    alignItems: 'center',
  },
  livePreviewIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  livePreviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  livePreviewSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  liveFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    width: '47%',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 16,
  },
  recentLive: {
    marginTop: 24,
  },
  liveEventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  liveEventInfo: {
    flex: 1,
  },
  liveEventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  liveEventStats: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 4,
  },
  liveEventDate: {
    color: '#999999',
    fontSize: 12,
  },
  replayButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  replayButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postType: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  postStatus: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500',
  },
  postTime: {
    color: '#999999',
    fontSize: 12,
  },
  postContent: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  bottomSpacing: {
    height: 100,
  },
});