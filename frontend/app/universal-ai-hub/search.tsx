import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Product {
  platform: string;
  product_id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  brand?: string;
  rating?: number;
  images: string[];
}

export default function UniversalProductSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const searchProducts = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...(searchFilters.category && { category: searchFilters.category }),
        ...(searchFilters.minPrice && { min_price: searchFilters.minPrice }),
        ...(searchFilters.maxPrice && { max_price: searchFilters.maxPrice })
      });

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/universal-ai/products/search?${params}`
      );
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = (product: Product, index: number) => (
    <TouchableOpacity key={`${product.platform}-${product.product_id}`} style={styles.productCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.productGradient}
      >
        <View style={styles.productHeader}>
          <Text style={styles.platformBadge}>{product.platform.toUpperCase()}</Text>
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.productBrand}>{product.brand || 'Generic'}</Text>
        
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            {product.currency} {product.price.toFixed(2)}
          </Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Universal Product Search</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search across all platforms..."
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchProducts}
            />
            <TouchableOpacity style={styles.searchButton} onPress={searchProducts}>
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Search Filters */}
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="Category"
              placeholderTextColor="#888888"
              value={searchFilters.category}
              onChangeText={(text) => setSearchFilters(prev => ({ ...prev, category: text }))}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Min Price"
              placeholderTextColor="#888888"
              value={searchFilters.minPrice}
              onChangeText={(text) => setSearchFilters(prev => ({ ...prev, minPrice: text }))}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Max Price"
              placeholderTextColor="#888888"
              value={searchFilters.maxPrice}
              onChangeText={(text) => setSearchFilters(prev => ({ ...prev, maxPrice: text }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Searching across all platforms...</Text>
          </View>
        )}

        {/* Results */}
        {!loading && products.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              Found {products.length} products across platforms
            </Text>
            <View style={styles.productsGrid}>
              {products.map((product, index) => renderProduct(product, index))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!loading && searchQuery && products.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        )}

        {/* Initial State */}
        {!searchQuery && products.length === 0 && (
          <View style={styles.initialState}>
            <Text style={styles.initialTitle}>🌍 Universal Product Discovery</Text>
            <Text style={styles.initialSubtitle}>
              Search across Amazon, Alibaba, eBay, Shopify and 78+ other platforms simultaneously
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🔍</Text>
                <Text style={styles.featureText}>Cross-platform search</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🤖</Text>
                <Text style={styles.featureText}>AI-powered ranking</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>💰</Text>
                <Text style={styles.featureText}>Price comparison</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureText}>Real-time results</Text>
              </View>
            </View>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  resultsSection: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  productsGrid: {
    gap: 12,
  },
  productCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  productGradient: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformBadge: {
    backgroundColor: '#D4AF37',
    color: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 22,
  },
  productBrand: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  productCategory: {
    fontSize: 12,
    color: '#888888',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  initialState: {
    alignItems: 'center',
    padding: 40,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  initialSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});