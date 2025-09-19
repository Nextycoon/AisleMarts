import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface VendorProfile {
  businessName: string;
  contactEmail: string;
  brandDescription: string;
  website: string;
  category: 'fashion' | 'tech' | 'home' | 'sports' | 'travel' | 'food';
  verified: boolean;
  logo?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  inStock: number;
  sku: string;
  tags: string[];
  status: 'draft' | 'active' | 'sold_out';
}

interface VendorAnalytics {
  totalProducts: number;
  totalViews: number;
  totalSales: number;
  revenue: number;
  conversionRate: number;
  topProduct: string;
}

const SAMPLE_VENDOR_ANALYTICS: VendorAnalytics = {
  totalProducts: 12,
  totalViews: 8459,
  totalSales: 127,
  revenue: 15680,
  conversionRate: 1.5,
  topProduct: 'Luxury Silk Dress'
};

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Luxury Silk Dress',
    description: 'Premium silk dress with elegant design',
    price: 599,
    originalPrice: 799,
    category: 'fashion',
    images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=400&fit=crop'],
    inStock: 15,
    sku: 'LUX-DRESS-001',
    tags: ['luxury', 'silk', 'elegant', 'dress'],
    status: 'active'
  },
  {
    id: 'p2',
    name: 'Designer Handbag',
    description: 'Handcrafted leather handbag',
    price: 399,
    originalPrice: 499,
    category: 'fashion',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=400&fit=crop'],
    inStock: 8,
    sku: 'HAND-BAG-002',
    tags: ['luxury', 'leather', 'handbag'],
    status: 'active'
  }
];

export default function VendorPortalScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'analytics' | 'profile'>('dashboard');
  const [vendorProfile, setVendorProfile] = useState<VendorProfile>({
    businessName: 'Luxury Fashion Co.',
    contactEmail: 'contact@luxuryfashion.com',
    brandDescription: 'Premium luxury fashion brand specializing in high-end apparel and accessories.',
    website: 'https://luxuryfashion.com',
    category: 'fashion',
    verified: true
  });
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [analytics, setAnalytics] = useState<VendorAnalytics>(SAMPLE_VENDOR_ANALYTICS);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'fashion',
    images: [],
    inStock: 0,
    sku: '',
    tags: [],
    status: 'draft'
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), result.assets[0].uri]
      }));
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: `p${Date.now()}`,
      name: newProduct.name!,
      description: newProduct.description || '',
      price: newProduct.price!,
      category: newProduct.category!,
      images: newProduct.images || [],
      inStock: newProduct.inStock || 0,
      sku: newProduct.sku || `SKU-${Date.now()}`,
      tags: newProduct.tags || [],
      status: 'draft'
    };

    setProducts([...products, product]);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      category: 'fashion',
      images: [],
      inStock: 0,
      sku: '',
      tags: [],
      status: 'draft'
    });
    setShowAddProduct(false);
    Alert.alert('Success', 'Product added successfully!');
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, status: p.status === 'active' ? 'draft' : 'active' as 'active' | 'draft' }
        : p
    ));
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'draft': return '#FF9800';
      case 'sold_out': return '#F44336';
      default: return '#666';
    }
  };

  const renderDashboardTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <LinearGradient
          colors={['#E8C968', '#D4AF37']}
          style={styles.welcomeGradient}
        >
          <View style={styles.welcomeHeader}>
            <View style={styles.vendorInfo}>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
              <Text style={styles.businessName}>{vendorProfile.businessName}</Text>
            </View>
            {vendorProfile.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <Text style={styles.sectionTitle}>📊 Quick Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.totalSales}</Text>
            <Text style={styles.statLabel}>Sales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${(analytics.revenue/1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.conversionRate}%</Text>
            <Text style={styles.statLabel}>Conversion</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddProduct(true)}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonIcon}>➕</Text>
            <Text style={styles.actionButtonText}>Add New Product</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonIcon}>📊</Text>
            <Text style={styles.actionButtonText}>View Analytics</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonIcon}>🎥</Text>
            <Text style={styles.actionButtonText}>Schedule Live Drop</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>📈 Recent Activity</Text>
        
        <View style={styles.activityFeed}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>💰</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Sale</Text>
              <Text style={styles.activityDescription}>Luxury Silk Dress - $599</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>👁️</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Product Views</Text>
              <Text style={styles.activityDescription}>Designer Handbag - 47 new views</Text>
              <Text style={styles.activityTime}>4 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>🛍️</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Cart Additions</Text>
              <Text style={styles.activityDescription}>12 products added to carts</Text>
              <Text style={styles.activityTime}>6 hours ago</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderProductsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.productsHeader}>
        <Text style={styles.sectionTitle}>🛍️ Your Products</Text>
        <TouchableOpacity
          style={styles.addProductButton}
          onPress={() => setShowAddProduct(true)}
        >
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.addProductGradient}
          >
            <Text style={styles.addProductText}>+ Add Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.productsList}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productImageContainer}>
              {product.images.length > 0 ? (
                <Image source={{ uri: product.images[0] }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={styles.productImagePlaceholderText}>📸</Text>
                </View>
              )}
              <View style={[styles.productStatus, { backgroundColor: getStatusColor(product.status) }]}>
                <Text style={styles.productStatusText}>{product.status}</Text>
              </View>
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              <Text style={styles.productSku}>SKU: {product.sku}</Text>
              
              <View style={styles.productPricing}>
                <Text style={styles.productPrice}>${product.price}</Text>
                {product.originalPrice && (
                  <Text style={styles.productOriginalPrice}>${product.originalPrice}</Text>
                )}
              </View>

              <Text style={styles.productStock}>In Stock: {product.inStock}</Text>

              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.productActionButton}
                  onPress={() => toggleProductStatus(product.id)}
                >
                  <Text style={styles.productActionText}>
                    {product.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.productActionButton}>
                  <Text style={styles.productActionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>📊 Vendor Analytics</Text>

      {/* Performance Metrics */}
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsSubtitle}>Performance Overview</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.metricGradient}
            >
              <Text style={styles.metricValue}>${analytics.revenue.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.metricGradient}
            >
              <Text style={styles.metricValue}>{analytics.totalViews.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Product Views</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.metricGradient}
            >
              <Text style={styles.metricValue}>{analytics.totalSales}</Text>
              <Text style={styles.metricLabel}>Total Sales</Text>
            </LinearGradient>
          </View>

          <View style={styles.metricCard}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.metricGradient}
            >
              <Text style={styles.metricValue}>{analytics.conversionRate}%</Text>
              <Text style={styles.metricLabel}>Conversion Rate</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Top Performing Product */}
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsSubtitle}>🏆 Top Performing Product</Text>
        <View style={styles.topProductCard}>
          <Text style={styles.topProductName}>{analytics.topProduct}</Text>
          <Text style={styles.topProductStats}>47 sales • $28,053 revenue</Text>
        </View>
      </View>

      {/* Sales Trends */}
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsSubtitle}>📈 Sales Trends</Text>
        <View style={styles.trendsCard}>
          <Text style={styles.trendsInfo}>📊 Sales up 23% this month</Text>
          <Text style={styles.trendsInfo}>🎯 Conversion rate improved by 0.3%</Text>
          <Text style={styles.trendsInfo}>👁️ Product views increased 15%</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>🏢 Vendor Profile</Text>

      <View style={styles.profileForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Business Name</Text>
          <TextInput
            style={styles.textInput}
            value={vendorProfile.businessName}
            onChangeText={(text) => setVendorProfile(prev => ({ ...prev, businessName: text }))}
            placeholder="Enter business name"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contact Email</Text>
          <TextInput
            style={styles.textInput}
            value={vendorProfile.contactEmail}
            onChangeText={(text) => setVendorProfile(prev => ({ ...prev, contactEmail: text }))}
            placeholder="Enter contact email"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Brand Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={vendorProfile.brandDescription}
            onChangeText={(text) => setVendorProfile(prev => ({ ...prev, brandDescription: text }))}
            placeholder="Describe your brand..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Website</Text>
          <TextInput
            style={styles.textInput}
            value={vendorProfile.website}
            onChangeText={(text) => setVendorProfile(prev => ({ ...prev, website: text }))}
            placeholder="https://yourbrand.com"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="url"
          />
        </View>

        <TouchableOpacity style={styles.saveProfileButton}>
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.saveProfileGradient}
          >
            <Text style={styles.saveProfileText}>Save Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAddProductModal = () => {
    if (!showAddProduct) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowAddProduct(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.name}
                  onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
                  placeholder="Enter product name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newProduct.description}
                  onChangeText={(text) => setNewProduct(prev => ({ ...prev, description: text }))}
                  placeholder="Product description..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.price?.toString() || ''}
                  onChangeText={(text) => setNewProduct(prev => ({ ...prev, price: parseFloat(text) || 0 }))}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stock Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.inStock?.toString() || ''}
                  onChangeText={(text) => setNewProduct(prev => ({ ...prev, inStock: parseInt(text) || 0 }))}
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SKU</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.sku}
                  onChangeText={(text) => setNewProduct(prev => ({ ...prev, sku: text }))}
                  placeholder="Product SKU"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>

              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Text style={styles.imagePickerText}>📸 Add Product Images</Text>
              </TouchableOpacity>

              {newProduct.images && newProduct.images.length > 0 && (
                <Text style={styles.imageCount}>{newProduct.images.length} image(s) added</Text>
              )}

              <TouchableOpacity style={styles.addProductSubmitButton} onPress={addProduct}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.addProductSubmitGradient}
                >
                  <Text style={styles.addProductSubmitText}>Add Product</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
            colors={['#00BCD4', '#0097A7']}
            style={styles.titleBadge}
          >
            <Text style={styles.titleBadgeText}>VENDOR</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Vendor Portal</Text>
          <Text style={styles.headerSubtitle}>Manage your luxury brand</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['dashboard', 'products', 'analytics', 'profile'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </View>

      {/* Add Product Modal */}
      {renderAddProductModal()}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8C968',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeGradient: {
    borderRadius: 16,
    padding: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorInfo: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  verifiedIcon: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '700',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4CAF50',
  },
  quickStats: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 72) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8C968',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  recentActivity: {
    marginBottom: 32,
  },
  activityFeed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(232, 201, 104, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addProductButton: {
    // Style handled by gradient
  },
  addProductGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addProductText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  productsList: {
    gap: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderText: {
    fontSize: 24,
  },
  productStatus: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  productStatusText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  productSku: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8C968',
  },
  productOriginalPrice: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  productStock: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  productActionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  productActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  analyticsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  analyticsSection: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - 72) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  topProductCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  topProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  topProductStats: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  trendsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  trendsInfo: {
    fontSize: 14,
    color: '#ffffff',
  },
  profileForm: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveProfileButton: {
    marginTop: 20,
  },
  saveProfileGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveProfileText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: width - 48,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalForm: {
    gap: 16,
  },
  imagePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#ffffff',
  },
  imageCount: {
    fontSize: 12,
    color: '#E8C968',
    textAlign: 'center',
  },
  addProductSubmitButton: {
    marginTop: 20,
  },
  addProductSubmitGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addProductSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});