import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
}

interface ContentDraft {
  id: string;
  type: 'video' | 'image' | 'live';
  caption: string;
  hashtags: string[];
  products: Product[];
  familySafe: boolean;
  ageRating: string;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
}

export default function CreatorStudioScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'drafts' | 'analytics'>('create');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [familySafe, setFamilySafe] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);

  // Mock analytics data
  const [analytics] = useState({
    totalViews: 2456789,
    totalLikes: 187456,
    totalShares: 34567,
    totalComments: 89234,
    followers: 245000,
    engagementRate: 4.8,
    recentPosts: 12,
    familySafeScore: 98.5
  });

  // Mock available products
  const [availableProducts] = useState<Product[]>([
    {
      id: 'prod_1',
      title: 'Designer Winter Coat',
      price: 299.99,
      currency: 'EUR'
    },
    {
      id: 'prod_2',
      title: 'Luxury Scarf',
      price: 89.99,
      currency: 'EUR'
    },
    {
      id: 'prod_3',
      title: 'Smart Winter Boots',
      price: 199.99,
      currency: 'EUR'
    }
  ]);

  const handleCreateContent = () => {
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption for your content');
      return;
    }

    const hashtagsArray = hashtags
      .split(' ')
      .filter(tag => tag.startsWith('#'))
      .slice(0, 10); // Limit to 10 hashtags

    const newDraft: ContentDraft = {
      id: `draft_${Date.now()}`,
      type: 'video',
      caption: caption.trim(),
      hashtags: hashtagsArray,
      products: selectedProducts,
      familySafe,
      ageRating: familySafe ? 'All Ages' : '13+',
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    setDrafts([newDraft, ...drafts]);
    
    // Reset form
    setCaption('');
    setHashtags('');
    setSelectedProducts([]);

    Alert.alert(
      'Draft Saved',
      'Your content has been saved as a draft. You can publish it later.',
      [
        { text: 'Continue Creating', style: 'default' },
        { text: 'View Drafts', onPress: () => setActiveTab('drafts') }
      ]
    );
  };

  const handleGoLive = () => {
    Alert.alert(
      'Start Live Stream',
      'Are you ready to go live? Make sure you have good lighting and a stable internet connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Go Live', 
          onPress: () => router.push('/live-streaming/start'),
          style: 'default'
        }
      ]
    );
  };

  const handleDuetStitch = (type: 'duet' | 'stitch') => {
    router.push(`/${type}-creator`);
  };

  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.find(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      if (selectedProducts.length < 5) { // Limit to 5 products per post
        setSelectedProducts([...selectedProducts, product]);
      } else {
        Alert.alert('Limit Reached', 'You can only pin up to 5 products per post');
      }
    }
  };

  const renderCreateTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Content Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Type</Text>
        <View style={styles.contentTypeContainer}>
          <TouchableOpacity style={[styles.contentTypeButton, styles.contentTypeButtonActive]}>
            <Text style={styles.contentTypeIcon}>📹</Text>
            <Text style={[styles.contentTypeText, styles.contentTypeTextActive]}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contentTypeButton}>
            <Text style={styles.contentTypeIcon}>📷</Text>
            <Text style={styles.contentTypeText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contentTypeButton}
            onPress={handleGoLive}
          >
            <Text style={styles.contentTypeIcon}>🔴</Text>
            <Text style={styles.contentTypeText}>Go Live</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Creative Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Creative Tools</Text>
        <View style={styles.creativeToolsContainer}>
          <TouchableOpacity 
            style={styles.creativeToolButton}
            onPress={() => handleDuetStitch('duet')}
          >
            <Text style={styles.creativeToolIcon}>👥</Text>
            <Text style={styles.creativeToolText}>Duet</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.creativeToolButton}
            onPress={() => handleDuetStitch('stitch')}
          >
            <Text style={styles.creativeToolIcon}>✂️</Text>
            <Text style={styles.creativeToolText}>Stitch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.creativeToolButton}>
            <Text style={styles.creativeToolIcon}>🎵</Text>
            <Text style={styles.creativeToolText}>Sounds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.creativeToolButton}>
            <Text style={styles.creativeToolIcon}>✨</Text>
            <Text style={styles.creativeToolText}>Effects</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          multiline
          placeholder="Write a compelling caption... Include relevant hashtags to reach more people!"
          placeholderTextColor="#666666"
          value={caption}
          onChangeText={setCaption}
          maxLength={2200}
        />
        <Text style={styles.characterCount}>{caption.length}/2200</Text>
      </View>

      {/* Hashtags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hashtags</Text>
        <TextInput
          style={styles.hashtagInput}
          placeholder="#BlueWaveSafe #FamilyApproved #YourBrand"
          placeholderTextColor="#666666"
          value={hashtags}
          onChangeText={setHashtags}
        />
        <Text style={styles.hashtagHint}>
          Pro tip: Use family-friendly hashtags to reach the right audience
        </Text>
      </View>

      {/* Product Pinning */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Product Pins</Text>
          <TouchableOpacity 
            style={styles.addProductButton}
            onPress={() => setShowProductModal(true)}
          >
            <Text style={styles.addProductButtonText}>+ Add Products</Text>
          </TouchableOpacity>
        </View>
        
        {selectedProducts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedProducts.map(product => (
              <View key={product.id} style={styles.selectedProduct}>
                <Text style={styles.selectedProductTitle}>{product.title}</Text>
                <Text style={styles.selectedProductPrice}>
                  {product.currency} {product.price}
                </Text>
                <TouchableOpacity 
                  style={styles.removeProductButton}
                  onPress={() => toggleProductSelection(product)}
                >
                  <Text style={styles.removeProductText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noProductsText}>
            Add products to enable shopping directly from your content
          </Text>
        )}
      </View>

      {/* Family Safety */}
      <View style={styles.section}>
        <View style={styles.familySafetyHeader}>
          <Text style={styles.sectionTitle}>BlueWave Family Safety</Text>
          <Switch
            value={familySafe}
            onValueChange={setFamilySafe}
            trackColor={{ false: '#333333', true: '#D4AF37' }}
            thumbColor={familySafe ? '#000000' : '#666666'}
          />
        </View>
        <Text style={styles.familySafetyDescription}>
          {familySafe 
            ? '🛡️ Content will be marked as family-safe and promoted to families'
            : '⚠️ Content may have age restrictions and limited family visibility'
          }
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleCreateContent}
        >
          <Text style={styles.saveButtonText}>Save as Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publishButton}>
          <Text style={styles.publishButtonText}>Publish Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDraftsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Drafts</Text>
        <Text style={styles.sectionSubtitle}>{drafts.length} drafts</Text>
      </View>

      {drafts.length > 0 ? (
        drafts.map(draft => (
          <View key={draft.id} style={styles.draftItem}>
            <View style={styles.draftHeader}>
              <Text style={styles.draftType}>
                {draft.type === 'video' ? '📹' : draft.type === 'image' ? '📷' : '🔴'} {draft.type}
              </Text>
              <Text style={styles.draftStatus}>{draft.status}</Text>
            </View>
            <Text style={styles.draftCaption} numberOfLines={2}>
              {draft.caption}
            </Text>
            <View style={styles.draftMeta}>
              <Text style={styles.draftDate}>
                {new Date(draft.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.draftProducts}>
                {draft.products.length} products
              </Text>
              {draft.familySafe && (
                <Text style={styles.draftFamilySafe}>🛡️ Family Safe</Text>
              )}
            </View>
            <View style={styles.draftActions}>
              <TouchableOpacity style={styles.draftEditButton}>
                <Text style={styles.draftEditButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.draftPublishButton}>
                <Text style={styles.draftPublishButtonText}>Publish</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📝</Text>
          <Text style={styles.emptyStateTitle}>No drafts yet</Text>
          <Text style={styles.emptyStateText}>
            Create content and save as drafts to edit and publish later
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.analyticsContainer}>
        <Text style={styles.sectionTitle}>Creator Analytics</Text>
        
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.totalViews.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Views</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.followers.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Followers</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.engagementRate}%</Text>
            <Text style={styles.metricLabel}>Engagement Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.familySafeScore}%</Text>
            <Text style={styles.metricLabel}>Family Safe Score</Text>
          </View>
        </View>

        {/* Engagement Breakdown */}
        <View style={styles.engagementSection}>
          <Text style={styles.engagementTitle}>Engagement Breakdown</Text>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>❤️</Text>
            <Text style={styles.engagementLabel}>Likes</Text>
            <Text style={styles.engagementValue}>{analytics.totalLikes.toLocaleString()}</Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>💬</Text>
            <Text style={styles.engagementLabel}>Comments</Text>
            <Text style={styles.engagementValue}>{analytics.totalComments.toLocaleString()}</Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>↗️</Text>
            <Text style={styles.engagementLabel}>Shares</Text>
            <Text style={styles.engagementValue}>{analytics.totalShares.toLocaleString()}</Text>
          </View>
        </View>

        {/* BlueWave Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>🛡️ BlueWave Family Insights</Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightText}>
              98.5% of your content meets family-safe guidelines
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightText}>
              Family audiences engage 2.3x more with your content
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightText}>
              Your most successful hashtag is #BlueWaveSafe
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Creator Studio</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.tabActive]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
            Create
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drafts' && styles.tabActive]}
          onPress={() => setActiveTab('drafts')}
        >
          <Text style={[styles.tabText, activeTab === 'drafts' && styles.tabTextActive]}>
            Drafts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'create' && renderCreateTab()}
      {activeTab === 'drafts' && renderDraftsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Product Selection Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Products</Text>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {availableProducts.map(product => {
              const isSelected = selectedProducts.find(p => p.id === product.id);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productOption, isSelected && styles.productOptionSelected]}
                  onPress={() => toggleProductSelection(product)}
                >
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{product.title}</Text>
                    <Text style={styles.productPrice}>
                      {product.currency} {product.price}
                    </Text>
                  </View>
                  {isSelected && (
                    <Text style={styles.productSelected}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
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
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    width: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  tabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSubtitle: {
    color: '#666666',
    fontSize: 14,
  },
  contentTypeContainer: {
    flexDirection: 'row',
  },
  contentTypeButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    minWidth: 80,
  },
  contentTypeButtonActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  contentTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contentTypeText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  contentTypeTextActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  creativeToolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  creativeToolButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    marginBottom: 12,
    minWidth: 70,
  },
  creativeToolIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  creativeToolText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  captionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  hashtagInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  hashtagHint: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 8,
  },
  addProductButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  addProductButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedProduct: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    position: 'relative',
  },
  selectedProductTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedProductPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  removeProductButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeProductText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noProductsText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  familySafetyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  familySafetyDescription: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 100,
  },
  saveButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  draftItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  draftType: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  draftStatus: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  draftCaption: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  draftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  draftDate: {
    color: '#666666',
    fontSize: 12,
    marginRight: 12,
  },
  draftProducts: {
    color: '#D4AF37',
    fontSize: 12,
    marginRight: 12,
  },
  draftFamilySafe: {
    color: '#34C759',
    fontSize: 12,
  },
  draftActions: {
    flexDirection: 'row',
  },
  draftEditButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  draftEditButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  draftPublishButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  draftPublishButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  analyticsContainer: {
    paddingBottom: 100,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: '4%',
    marginBottom: 16,
  },
  metricValue: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  engagementSection: {
    marginBottom: 24,
  },
  engagementTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  engagementIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  engagementLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  engagementValue: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsSection: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  insightsTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  insightItem: {
    marginBottom: 12,
  },
  insightText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
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
  modalDone: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  productOptionSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
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
  productSelected: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '600',
  },
});