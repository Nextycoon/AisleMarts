import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  stock: number;
  status: 'active' | 'draft' | 'sold_out';
  views: number;
  sales: number;
}

interface ContentTemplate {
  id: string;
  name: string;
  type: 'post' | 'story' | 'live' | 'product';
  thumbnail: string;
  description: string;
}

export default function BusinessContentScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'products' | 'templates' | 'analytics'>('create');
  const [postText, setPostText] = useState('');

  const products: Product[] = [
    {
      id: '1',
      title: 'Wireless Headphones Pro',
      price: 299.99,
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      stock: 3,
      status: 'active',
      views: 2847,
      sales: 156,
    },
    {
      id: '2',
      title: 'Designer Handbag',
      price: 899.99,
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
      stock: 12,
      status: 'active',
      views: 4521,
      sales: 89,
    },
    {
      id: '3',
      title: 'Smart Home Speaker',
      price: 149.99,
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300',
      stock: 0,
      status: 'sold_out',
      views: 1923,
      sales: 234,
    },
  ];

  const templates: ContentTemplate[] = [
    {
      id: '1',
      name: 'Product Showcase',
      type: 'post',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
      description: 'Highlight your product features',
    },
    {
      id: '2',
      name: 'Behind the Scenes',
      type: 'story',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200',
      description: 'Show your brand personality',
    },
    {
      id: '3',
      name: 'Live Shopping',
      type: 'live',
      thumbnail: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200',
      description: 'Interactive shopping experience',
    },
    {
      id: '4',
      name: 'Product Launch',
      type: 'product',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
      description: 'Announce new products',
    },
  ];

  const renderCreateContent = () => (
    <View style={styles.createContainer}>
      {/* Creator Composer */}
      <View style={styles.composerContainer}>
        <Text style={styles.composerTitle}>✨ Create Content</Text>
        
        <View style={styles.composerBox}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100' }}
            style={styles.profileAvatar}
          />
          <TextInput
            style={styles.composerInput}
            placeholder="What's happening with your brand today?"
            placeholderTextColor="#8E95A3"
            value={postText}
            onChangeText={setPostText}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.composerActions}>
          <TouchableOpacity style={styles.mediaButton}>
            <Text style={styles.mediaButtonIcon}>📸</Text>
            <Text style={styles.mediaButtonText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Text style={styles.mediaButtonIcon}>🎥</Text>
            <Text style={styles.mediaButtonText}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Text style={styles.mediaButtonIcon}>🛍️</Text>
            <Text style={styles.mediaButtonText}>Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Text style={styles.mediaButtonIcon}>🔴</Text>
            <Text style={styles.mediaButtonText}>Live</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.publishButton, !postText.trim() && styles.publishButtonDisabled]}
          disabled={!postText.trim()}
          onPress={() => Alert.alert('Success', 'Content published!')}
        >
          <Text style={styles.publishButtonText}>Publish</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickCreateContainer}>
        <Text style={styles.sectionTitle}>Quick Create</Text>
        <View style={styles.quickCreateGrid}>
          <TouchableOpacity
            style={styles.quickCreateCard}
            onPress={() => router.push('/business/content/post')}
          >
            <Text style={styles.quickCreateIcon}>📸</Text>
            <Text style={styles.quickCreateText}>Photo Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCreateCard}
            onPress={() => router.push('/business/content/story')}
          >
            <Text style={styles.quickCreateIcon}>⭐</Text>
            <Text style={styles.quickCreateText}>Story</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCreateCard}
            onPress={() => router.push('/live-commerce')}
          >
            <Text style={styles.quickCreateIcon}>🔴</Text>
            <Text style={styles.quickCreateText}>Go Live</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCreateCard}
            onPress={() => router.push('/business/products/new')}
          >
            <Text style={styles.quickCreateIcon}>🏷️</Text>
            <Text style={styles.quickCreateText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scheduled Content */}
      <View style={styles.scheduledContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scheduled Posts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.scheduledItem}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80' }}
            style={styles.scheduledThumbnail}
          />
          <View style={styles.scheduledInfo}>
            <Text style={styles.scheduledTitle}>New Headphones Launch</Text>
            <Text style={styles.scheduledTime}>Tomorrow at 2:00 PM</Text>
          </View>
          <TouchableOpacity style={styles.scheduledAction}>
            <Text style={styles.scheduledActionText}>⚙️</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProducts = () => (
    <View style={styles.productsContainer}>
      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>Product Catalog</Text>
        <TouchableOpacity
          style={styles.addProductButton}
          onPress={() => router.push('/business/products/new')}
        >
          <Text style={styles.addProductButtonText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productsGrid}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => router.push(`/business/products/${product.id}`)}
          >
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={[
              styles.productStatus,
              { backgroundColor: 
                product.status === 'active' ? '#34C759' :
                product.status === 'sold_out' ? '#FF3B30' : '#FF9500'
              }
            ]}>
              <Text style={styles.productStatusText}>
                {product.status === 'active' ? 'Active' :
                 product.status === 'sold_out' ? 'Sold Out' : 'Draft'}
              </Text>
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
              <Text style={styles.productPrice}>
                {product.currency} {product.price.toFixed(2)}
              </Text>
              <View style={styles.productStats}>
                <Text style={styles.productStat}>👀 {product.views}</Text>
                <Text style={styles.productStat}>🛒 {product.sales}</Text>
                <Text style={styles.productStat}>📦 {product.stock}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTemplates = () => (
    <View style={styles.templatesContainer}>
      <Text style={styles.sectionTitle}>Content Templates</Text>
      
      <View style={styles.templatesGrid}>
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => Alert.alert('Template', `Using ${template.name} template`)}
          >
            <Image source={{ uri: template.thumbnail }} style={styles.templateThumbnail} />
            <View style={styles.templateOverlay}>
              <View style={styles.templateType}>
                <Text style={styles.templateTypeText}>
                  {template.type.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>Content Analytics</Text>
      
      {/* Performance Overview */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsCardTitle}>This Week's Performance</Text>
        <View style={styles.analyticsStats}>
          <View style={styles.analyticsStat}>
            <Text style={styles.analyticsValue}>42.3K</Text>
            <Text style={styles.analyticsLabel}>Total Reach</Text>
            <Text style={styles.analyticsChange}>+18.2%</Text>
          </View>
          <View style={styles.analyticsStat}>
            <Text style={styles.analyticsValue}>3.8K</Text>
            <Text style={styles.analyticsLabel}>Engagement</Text>
            <Text style={styles.analyticsChange}>+12.5%</Text>
          </View>
          <View style={styles.analyticsStat}>
            <Text style={styles.analyticsValue}>847</Text>
            <Text style={styles.analyticsLabel}>Clicks</Text>
            <Text style={styles.analyticsChange}>+25.1%</Text>
          </View>
        </View>
      </View>

      {/* Top Performing Content */}
      <View style={styles.topContentContainer}>
        <Text style={styles.sectionTitle}>Top Performing Content</Text>
        
        <TouchableOpacity style={styles.topContentItem}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80' }}
            style={styles.topContentThumbnail}
          />
          <View style={styles.topContentInfo}>
            <Text style={styles.topContentTitle}>Headphones Unboxing Video</Text>
            <Text style={styles.topContentStats}>12.4K views • 892 likes • 47 comments</Text>
          </View>
          <View style={styles.topContentMetric}>
            <Text style={styles.topContentValue}>4.2%</Text>
            <Text style={styles.topContentLabel}>CTR</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topContentItem}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=80' }}
            style={styles.topContentThumbnail}
          />
          <View style={styles.topContentInfo}>
            <Text style={styles.topContentTitle}>Designer Bag Collection</Text>
            <Text style={styles.topContentStats}>8.7K views • 1.2K likes • 89 comments</Text>
          </View>
          <View style={styles.topContentMetric}>
            <Text style={styles.topContentValue}>6.8%</Text>
            <Text style={styles.topContentLabel}>CVR</Text>
          </View>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.draftsButton}>
          <Text style={styles.draftsIcon}>📝</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {[
          { key: 'create', label: 'Create', icon: '✨' },
          { key: 'products', label: 'Products', icon: '🏷️' },
          { key: 'templates', label: 'Templates', icon: '📋' },
          { key: 'analytics', label: 'Analytics', icon: '📊' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'create' && renderCreateContent()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'analytics' && renderAnalytics()}

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
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#000000',
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
  draftsButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  draftsIcon: {
    fontSize: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#D4AF37',
  },
  tabIcon: {
    fontSize: 14,
  },
  tabButtonText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  createContainer: {
    padding: 20,
  },
  composerContainer: {
    marginBottom: 24,
  },
  composerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  composerBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  composerInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  composerActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  mediaButtonIcon: {
    fontSize: 16,
  },
  mediaButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  publishButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  publishButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  quickCreateContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickCreateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCreateCard: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  quickCreateIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickCreateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scheduledContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  scheduledItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  scheduledThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  scheduledTime: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  scheduledAction: {
    padding: 8,
  },
  scheduledActionText: {
    fontSize: 20,
  },
  productsContainer: {
    padding: 20,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productStat: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  templatesContainer: {
    padding: 20,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  templateThumbnail: {
    width: '100%',
    height: 100,
  },
  templateOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  templateType: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  templateTypeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  templateInfo: {
    padding: 12,
  },
  templateName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 16,
  },
  analyticsContainer: {
    padding: 20,
  },
  analyticsCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  analyticsCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  analyticsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsStat: {
    alignItems: 'center',
  },
  analyticsValue: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  analyticsLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4,
  },
  analyticsChange: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  topContentContainer: {
    marginBottom: 24,
  },
  topContentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  topContentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  topContentInfo: {
    flex: 1,
  },
  topContentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  topContentStats: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  topContentMetric: {
    alignItems: 'center',
  },
  topContentValue: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
  },
  topContentLabel: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  bottomSpacing: {
    height: 100,
  },
});