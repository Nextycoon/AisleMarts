import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TabNavigator from './navigation/TabNavigator';

const { width: screenWidth } = Dimensions.get('window');

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  seller_name: string;
  seller_tier: string;
  rating: number;
  review_count: number;
  media: Array<{
    url: string;
    type: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    stock: number;
  }>;
  views: number;
  conversion_rate: number;
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🏪' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'books', name: 'Books', icon: '📚' },
];

export default function ShopScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const apiBase = process.env.EXPO_PUBLIC_SHOP_API_BASE || 'http://localhost:8001/api/shop';
  const shopEnabled = process.env.EXPO_PUBLIC_SHOP_ENABLED === '1';
  const zeroCommission = process.env.EXPO_PUBLIC_ZERO_COMMISSION === '1';

  const fetchProducts = useCallback(async () => {
    if (!shopEnabled) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        sort: sortBy,
      });
      
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`${apiBase}/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiBase, shopEnabled, searchQuery, selectedCategory, sortBy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = (product: Product) => {
    // Navigate to product detail page
    router.push({
      pathname: '/product-detail',
      params: { productId: product.id }
    });
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.media[0]?.url || 'https://via.placeholder.com/200x200/CCCCCC/FFF?text=No+Image' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {item.compare_at_price && item.compare_at_price > item.price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.compare_at_price - item.price) / item.compare_at_price) * 100)}% OFF
            </Text>
          </View>
        )}
        {item.seller_tier === 'gold' && (
          <View style={styles.goldBadge}>
            <Text style={styles.goldBadgeText}>👑</Text>
          </View>
        )}
        {item.seller_tier === 'diamond' && (
          <View style={styles.diamondBadge}>
            <Text style={styles.diamondBadgeText}>💎</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
          {item.compare_at_price && (
            <Text style={styles.originalPrice}>${item.compare_at_price.toFixed(2)}</Text>
          )}
        </View>
        
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{item.seller_name}</Text>
          {zeroCommission && (
            <View style={styles.zeroCommissionBadge}>
              <Text style={styles.zeroCommissionText}>0% Fee</Text>
            </View>
          )}
        </View>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.review_count})</Text>
          <Text style={styles.conversionRate}>{item.conversion_rate.toFixed(1)}% CVR</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryTab = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.selectedCategoryTab
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryEmoji}>{item.icon}</Text>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.selectedCategoryName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (!shopEnabled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.disabledContainer}>
          <Text style={styles.disabledText}>🛍️ Shop feature is currently disabled</Text>
          <Text style={styles.disabledSubtext}>Please check back later</Text>
        </View>
        <TabNavigator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>🛍️ AisleMarts Shop</Text>
          
          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <Ionicons name="bag" size={24} color="#333" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, brands, or creators..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Zero Commission Banner */}
        {zeroCommission && (
          <View style={styles.zeroBanner}>
            <Text style={styles.zeroBannerText}>
              🎉 0% Commission • Direct from Creators • Shop with Confidence
            </Text>
          </View>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'relevance', label: 'Trending' },
            { key: 'price_asc', label: 'Price: Low to High' },
            { key: 'price_desc', label: 'Price: High to Low' },
            { key: 'rating', label: 'Top Rated' },
            { key: 'newest', label: 'New Arrivals' },
          ].map((sort) => (
            <TouchableOpacity
              key={sort.key}
              style={[
                styles.sortButton,
                sortBy === sort.key && styles.selectedSortButton
              ]}
              onPress={() => setSortBy(sort.key)}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === sort.key && styles.selectedSortButtonText
              ]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? '🔍 Finding amazing products...' : '😅 No products found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {loading ? 'Please wait' : 'Try adjusting your search or category'}
            </Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <TabNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  disabledText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  disabledSubtext: {
    fontSize: 14,
    color: '#999',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  zeroBanner: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  zeroBannerText: {
    fontSize: 12,
    color: '#0066cc',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    minWidth: 70,
  },
  selectedCategoryTab: {
    backgroundColor: '#007AFF',
  },
  categoryEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryName: {
    color: '#fff',
  },
  sortContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  selectedSortButton: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedSortButtonText: {
    color: '#fff',
  },
  productsContainer: {
    padding: 16,
    paddingBottom: 100, // Space for TabNavigator
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: (screenWidth - 48) / 2,
  },
  productImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  goldBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldBadgeText: {
    fontSize: 12,
  },
  diamondBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(185, 242, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamondBadgeText: {
    fontSize: 12,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  zeroCommissionBadge: {
    backgroundColor: '#e7f3ff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  zeroCommissionText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  conversionRate: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});