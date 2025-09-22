import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  status: 'draft' | 'active' | 'paused' | 'sold_out';
  inventory: number;
  clpEnabled: boolean;
  pplEnabled: boolean;
  views: number;
  leads: number;
  sales: number;
  revenue: number;
}

interface MarketplaceStats {
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  totalLeads: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
}

export default function VendorMarketplaceIntegrationScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats] = useState<MarketplaceStats>({
    totalProducts: 47,
    activeProducts: 42,
    totalViews: 125680,
    totalLeads: 2847,
    totalSales: 534,
    totalRevenue: 89340,
    conversionRate: 18.7,
    avgOrderValue: 167.30,
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'iPhone 15 Pro Max 256GB',
      description: 'Latest iPhone with titanium design and advanced camera system',
      price: 1299,
      currency: 'USD',
      category: 'Electronics',
      tags: ['phone', 'apple', 'premium'],
      status: 'active',
      inventory: 15,
      clpEnabled: true,
      pplEnabled: true,
      views: 24350,
      leads: 247,
      sales: 18,
      revenue: 23382,
    },
    {
      id: '2',
      title: 'Designer Winter Coat',
      description: 'Premium wool blend coat perfect for cold weather',
      price: 299,
      currency: 'USD',
      category: 'Fashion',
      tags: ['coat', 'winter', 'fashion'],
      status: 'active',
      inventory: 8,
      clpEnabled: true,
      pplEnabled: true,
      views: 18920,
      leads: 156,
      sales: 12,
      revenue: 3588,
    },
    {
      id: '3',
      title: 'Smart Coffee Maker',
      description: 'WiFi-enabled coffee maker with mobile app control',
      price: 189,
      currency: 'USD',
      category: 'Home',
      tags: ['coffee', 'smart', 'kitchen'],
      status: 'active',
      inventory: 23,
      clpEnabled: true,
      pplEnabled: false,
      views: 15680,
      leads: 89,
      sales: 21,
      revenue: 3969,
    },
  ]);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    category: '',
    tags: [],
    inventory: 0,
    clpEnabled: true,
    pplEnabled: true,
  });

  const tabs = [
    { id: 'products', name: 'Products', icon: '📦' },
    { id: 'performance', name: 'Performance', icon: '📊' },
    { id: 'integration', name: 'Integration', icon: '🔗' },
    { id: 'automation', name: 'Automation', icon: '🤖' },
  ];

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books'];

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            status: product.status === 'active' ? 'paused' : 'active' 
          }
        : product
    ));
  };

  const toggleCLP = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, clpEnabled: !product.clpEnabled }
        : product
    ));
  };

  const togglePPL = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, pplEnabled: !product.pplEnabled }
        : product
    ));
  };

  const addProduct = () => {
    if (!newProduct.title || !newProduct.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      title: newProduct.title!,
      description: newProduct.description || '',
      price: newProduct.price!,
      currency: newProduct.currency || 'USD',
      category: newProduct.category || 'General',
      tags: newProduct.tags || [],
      status: 'draft',
      inventory: newProduct.inventory || 0,
      clpEnabled: newProduct.clpEnabled || true,
      pplEnabled: newProduct.pplEnabled || true,
      views: 0,
      leads: 0,
      sales: 0,
      revenue: 0,
    };

    setProducts([product, ...products]);
    setNewProduct({
      title: '',
      description: '',
      price: 0,
      currency: 'USD',
      category: '',
      tags: [],
      inventory: 0,
      clpEnabled: true,
      pplEnabled: true,
    });
    setShowAddProduct(false);
    Alert.alert('Success', 'Product added successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4ECDC4';
      case 'paused': return '#FFE66D';
      case 'draft': return '#8E8E93';
      case 'sold_out': return '#FF6B6B';
      default: return '#8E8E93';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderProducts = () => (
    <View style={styles.tabContent}>
      {/* Search and Add */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddProduct(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <View style={styles.productsList}>
        {filteredProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
              </View>
              <View style={styles.productStatus}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(product.status) + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(product.status) }
                  ]}>
                    {product.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.productMetrics}>
              <View style={styles.productMetric}>
                <Text style={styles.productMetricValue}>{formatCurrency(product.price, product.currency)}</Text>
                <Text style={styles.productMetricLabel}>Price</Text>
              </View>
              <View style={styles.productMetric}>
                <Text style={styles.productMetricValue}>{product.views.toLocaleString()}</Text>
                <Text style={styles.productMetricLabel}>Views</Text>
              </View>
              <View style={styles.productMetric}>
                <Text style={styles.productMetricValue}>{product.leads}</Text>
                <Text style={styles.productMetricLabel}>Leads</Text>
              </View>
              <View style={styles.productMetric}>
                <Text style={styles.productMetricValue}>{product.sales}</Text>
                <Text style={styles.productMetricLabel}>Sales</Text>
              </View>
            </View>

            <View style={styles.productControls}>
              <View style={styles.productToggles}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    product.clpEnabled && styles.toggleButtonActive
                  ]}
                  onPress={() => toggleCLP(product.id)}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    product.clpEnabled && styles.toggleButtonTextActive
                  ]}>
                    CLP
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    product.pplEnabled && styles.toggleButtonActive
                  ]}
                  onPress={() => togglePPL(product.id)}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    product.pplEnabled && styles.toggleButtonTextActive
                  ]}>
                    PPL
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusToggleButton,
                  product.status === 'active' && styles.statusToggleButtonActive
                ]}
                onPress={() => toggleProductStatus(product.id)}
              >
                <Text style={[
                  styles.statusToggleButtonText,
                  product.status === 'active' && styles.statusToggleButtonTextActive
                ]}>
                  {product.status === 'active' ? 'Pause' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPerformance = () => (
    <View style={styles.tabContent}>
      {/* Performance Overview */}
      <View style={styles.performanceCard}>
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
          style={styles.performanceGradient}
        >
          <Text style={styles.performanceTitle}>📊 Marketplace Performance</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{stats.totalProducts}</Text>
              <Text style={styles.performanceLabel}>Total Products</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{stats.activeProducts}</Text>
              <Text style={styles.performanceLabel}>Active</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{(stats.totalViews / 1000).toFixed(0)}K</Text>
              <Text style={styles.performanceLabel}>Views</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>{stats.conversionRate}%</Text>
              <Text style={styles.performanceLabel}>CVR</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* CLP + PPL Performance */}
      <View style={styles.clpPplPerformance}>
        <Text style={styles.sectionTitle}>CLP + PPL Breakdown</Text>
        
        <View style={styles.clpPplCards}>
          <View style={styles.clpCard}>
            <Text style={styles.clpPplCardTitle}>📈 Content Lead Purchase</Text>
            <Text style={styles.clpPplCardValue}>{formatCurrency(stats.totalRevenue * 0.7)}</Text>
            <Text style={styles.clpPplCardLabel}>Revenue from content</Text>
          </View>
          
          <View style={styles.pplCard}>
            <Text style={styles.clpPplCardTitle}>🎯 Pay Per Lead</Text>
            <Text style={styles.clpPplCardValue}>{stats.totalLeads}</Text>
            <Text style={styles.clpPplCardLabel}>Qualified leads</Text>
          </View>
        </View>
      </View>

      {/* Top Performing Products */}
      <View style={styles.topProducts}>
        <Text style={styles.sectionTitle}>🏆 Top Performing Products</Text>
        {products
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 3)
          .map((product, index) => (
            <View key={product.id} style={styles.topProductItem}>
              <View style={styles.topProductRank}>
                <Text style={styles.topProductRankText}>{index + 1}</Text>
              </View>
              <View style={styles.topProductInfo}>
                <Text style={styles.topProductTitle}>{product.title}</Text>
                <Text style={styles.topProductStats}>
                  {product.views} views • {product.sales} sales
                </Text>
              </View>
              <Text style={styles.topProductRevenue}>
                {formatCurrency(product.revenue)}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );

  const renderIntegration = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🔗 Marketplace Integrations</Text>
      
      {/* Integration Status */}
      <View style={styles.integrationsList}>
        {[
          { name: 'Live Marketplace', status: 'connected', description: 'Real-time product listings' },
          { name: 'Social Commerce', status: 'connected', description: 'Instagram & TikTok integration' },
          { name: 'Content Feed', status: 'connected', description: 'Product posts in main feed' },
          { name: 'Search Results', status: 'connected', description: 'Appear in app search' },
          { name: 'Categories Page', status: 'connected', description: 'Listed in relevant categories' },
          { name: 'Vendor Directory', status: 'pending', description: 'Public vendor profile' },
        ].map((integration, index) => (
          <View key={index} style={styles.integrationItem}>
            <View style={styles.integrationInfo}>
              <Text style={styles.integrationName}>{integration.name}</Text>
              <Text style={styles.integrationDescription}>{integration.description}</Text>
            </View>
            <View style={[
              styles.integrationStatus,
              { backgroundColor: integration.status === 'connected' ? '#4ECDC4' : '#FFE66D' + '20' }
            ]}>
              <Text style={[
                styles.integrationStatusText,
                { color: integration.status === 'connected' ? '#4ECDC4' : '#FFE66D' }
              ]}>
                {integration.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Integration Settings */}
      <View style={styles.integrationSettings}>
        <Text style={styles.subsectionTitle}>Settings</Text>
        
        <View style={styles.integrationSetting}>
          <Text style={styles.integrationSettingLabel}>Auto-sync inventory</Text>
          <Text style={styles.integrationSettingValue}>Enabled</Text>
        </View>
        
        <View style={styles.integrationSetting}>
          <Text style={styles.integrationSettingLabel}>Price updates</Text>
          <Text style={styles.integrationSettingValue}>Real-time</Text>
        </View>
        
        <View style={styles.integrationSetting}>
          <Text style={styles.integrationSettingLabel}>Visibility level</Text>
          <Text style={styles.integrationSettingValue}>Global</Text>
        </View>
      </View>
    </View>
  );

  const renderAutomation = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🤖 AI Automation</Text>
      
      {/* Automation Rules */}
      <View style={styles.automationsList}>
        {[
          {
            name: 'Smart Pricing',
            description: 'Automatically adjust prices based on demand and competition',
            status: 'active',
            impact: '+12% revenue'
          },
          {
            name: 'Inventory Alerts',
            description: 'Get notified when stock runs low',
            status: 'active',
            impact: '0% stockouts'
          },
          {
            name: 'Content Optimization',
            description: 'AI suggests best times to post content for maximum CLP',
            status: 'active',
            impact: '+34% engagement'
          },
          {
            name: 'Lead Scoring',
            description: 'Automatically score and prioritize PPL leads',
            status: 'active',
            impact: '71% accuracy'
          },
          {
            name: 'Performance Insights',
            description: 'Weekly AI-generated performance reports',
            status: 'pending',
            impact: 'Coming soon'
          },
        ].map((automation, index) => (
          <View key={index} style={styles.automationItem}>
            <View style={styles.automationInfo}>
              <View style={styles.automationHeader}>
                <Text style={styles.automationName}>{automation.name}</Text>
                <View style={[
                  styles.automationStatus,
                  { backgroundColor: automation.status === 'active' ? '#4ECDC4' : '#8E8E93' + '20' }
                ]}>
                  <Text style={[
                    styles.automationStatusText,
                    { color: automation.status === 'active' ? '#4ECDC4' : '#8E8E93' }
                  ]}>
                    {automation.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.automationDescription}>{automation.description}</Text>
              <Text style={styles.automationImpact}>{automation.impact}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* AI Recommendations */}
      <View style={styles.aiRecommendations}>
        <Text style={styles.subsectionTitle}>🧠 AI Recommendations</Text>
        
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Increase Winter Coat inventory</Text>
          <Text style={styles.recommendationText}>
            Based on current trends and lead quality, demand for winter coats is expected to increase by 45% next week.
          </Text>
          <TouchableOpacity style={styles.recommendationButton}>
            <Text style={styles.recommendationButtonText}>Apply Suggestion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'products': return renderProducts();
      case 'performance': return renderPerformance();
      case 'integration': return renderIntegration();
      case 'automation': return renderAutomation();
      default: return renderProducts();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
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
          <Text style={styles.headerTitle}>Marketplace Integration</Text>
          <Text style={styles.headerSubtitle}>Manage products & CLP + PPL automation</Text>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalLeads}</Text>
          <Text style={styles.statLabel}>Leads</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.activeProducts}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsRow}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  selectedTab === tab.id && styles.selectedTab
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[
                  styles.tabButtonText,
                  selectedTab === tab.id && styles.selectedTabText
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal
        visible={showAddProduct}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddProduct(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#0C0F14', '#1a1a2e', '#16213e']}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity onPress={() => setShowAddProduct(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Product Title *</Text>
              <TextInput
                style={styles.formInput}
                value={newProduct.title}
                onChangeText={(text) => setNewProduct({...newProduct, title: text})}
                placeholder="Enter product title"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({...newProduct, description: text})}
                placeholder="Product description"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Price *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProduct.price?.toString()}
                  onChangeText={(text) => setNewProduct({...newProduct, price: parseFloat(text) || 0})}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Inventory</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProduct.inventory?.toString()}
                  onChangeText={(text) => setNewProduct({...newProduct, inventory: parseInt(text) || 0})}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newProduct.category === category && styles.categoryOptionSelected
                    ]}
                    onPress={() => setNewProduct({...newProduct, category})}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      newProduct.category === category && styles.categoryOptionTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={styles.addProductButton} onPress={addProduct}>
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.addProductButtonGradient}
              >
                <Text style={styles.addProductButtonText}>Add Product</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  tabNavigation: {
    paddingBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  tabIcon: {
    fontSize: 14,
  },
  tabButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subsectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  productsList: {
    gap: 16,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  productStatus: {},
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  productMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productMetric: {
    alignItems: 'center',
  },
  productMetricValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  productMetricLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
  productControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productToggles: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderColor: '#4ECDC4',
  },
  toggleButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  statusToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusToggleButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  statusToggleButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  statusToggleButtonTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  performanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  performanceGradient: {
    padding: 20,
  },
  performanceTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  performanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  clpPplPerformance: {
    marginBottom: 24,
  },
  clpPplCards: {
    flexDirection: 'row',
    gap: 12,
  },
  clpCard: {
    flex: 1,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  pplCard: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  clpPplCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  clpPplCardValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  clpPplCardLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  topProducts: {
    marginBottom: 24,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topProductRankText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  topProductStats: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  topProductRevenue: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  integrationsList: {
    marginBottom: 24,
  },
  integrationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  integrationDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    lineHeight: 18,
  },
  integrationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  integrationStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  integrationSettings: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  integrationSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  integrationSettingLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  integrationSettingValue: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  automationsList: {
    marginBottom: 24,
  },
  automationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  automationInfo: {},
  automationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  automationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  automationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  automationStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  automationDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  automationImpact: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  aiRecommendations: {},
  recommendationCard: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
  },
  recommendationTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  recommendationButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryOptionSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  categoryOptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  addProductButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
  },
  addProductButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});