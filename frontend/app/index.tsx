import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { API } from '../src/api/client';
import { Product, Category } from '../src/types';
import { aiService, LocaleInfo } from '../src/services/AIService';
import AIAssistant from '../src/components/AIAssistant';
import { AISearchHub } from '../src/components/AISearchHubComponents';

export default function HomeScreen() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAISearchHub, setShowAISearchHub] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<any>(null);
  const [localeInfo, setLocaleInfo] = useState<LocaleInfo | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  useEffect(() => {
    loadData();
    initializeAI();
  }, []);

  useEffect(() => {
    if (user) {
      loadPersonalizedContent();
    }
  }, [user]);

  const initializeAI = async () => {
    try {
      // Detect locale and get AI recommendations
      const locale = await aiService.detectLocale();
      setLocaleInfo(locale);
      
      // Get personalized welcome message
      const welcome = await aiService.getWelcomeMessage(user);
      setWelcomeMessage(welcome);
      
      // Track activity
      aiService.trackActivity({
        type: 'app_launch',
        locale: locale,
        user_authenticated: !!user
      });
    } catch (error) {
      console.error('AI initialization failed:', error);
    }
  };

  const loadPersonalizedContent = async () => {
    try {
      // Get AI-powered product recommendations
      const recommendations = await aiService.getProductRecommendations(
        `Popular products for ${user?.name || 'user'} based on preferences`,
        8
      );
      setAIRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to load personalized content:', error);
    }
  };

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories'),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    if (user) {
      loadPersonalizedContent();
    }
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      
      // Enhance search with AI
      const enhancedQuery = await aiService.enhanceSearchQuery(searchQuery, {
        user_preferences: user,
        selected_category: selectedCategory
      });
      
      const params: any = { q: enhancedQuery.original_query };
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }
      
      const response = await API.get('/products', { params });
      setProducts(response.data);
      
      // Track search activity
      aiService.trackActivity({
        type: 'product_search',
        query: searchQuery,
        enhanced_query: enhancedQuery,
        results_count: response.data.length
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleAISearchResults = (query: string, results: any) => {
    console.log('AI Search Results:', { query, results });
    
    // If it's a quick search with product results, update the main products display  
    if (results && results.results && Array.isArray(results.results)) {
      // Transform AI search results to match our Product interface
      const transformedProducts = results.results.map((result: any) => ({
        _id: result.id,
        title: result.title,
        price: result.price,
        currency: result.currency,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI2ZmZjIwMCIvPgo8cmVjdCB4PSI5NSIgeT0iMTEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMzAiIGZpbGw9IiM2NjYiLz4KPHRLEHUGEQ9InQgaWQ9InRleHQiIGZpbGw9IiM2NjYiPgogIDx0c3BhbiB4PSIxMDAiIHk9IjE2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUk8L3RzcGFuPgo8L3RleHQ+Cjwvc3ZnPgo=',
        category: result.category || 'general',
        brand: result.seller?.name || 'Unknown',
        slug: result.id,
        description: `Product from ${result.seller?.country || 'Unknown'}`,
        brand_slug: 'unknown',
        created_at: new Date(),
        stock: 100
      }));
      
      setProducts(transformedProducts);
      setSearchQuery(query);
    }
    
    // Close the AI Search Hub
    setShowAISearchHub(false);
  };

  const startVoiceSearch = async () => {
    try {
      setIsVoiceSearching(true);
      const speechText = await aiService.startVoiceSearch();
      
      if (speechText) {
        setSearchQuery(speechText);
        // Automatically search with voice input
        setTimeout(() => {
          searchProducts();
        }, 500);
      }
    } catch (error: any) {
      Alert.alert('Voice Search', error.message || 'Voice search not available');
    } finally {
      setIsVoiceSearching(false);
    }
  };

  const filterByCategory = async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    try {
      setLoading(true);
      const params: any = {};
      if (categoryId) {
        params.category_id = categoryId;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery;
      }
      const response = await API.get('/products', { params });
      setProducts(response.data);
      
      // Track category filtering
      aiService.trackActivity({
        type: 'category_filter',
        category_id: categoryId,
        search_query: searchQuery
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        router.push(`/product/${item.id}`);
        // Track product view
        aiService.trackActivity({
          type: 'product_view',
          product_id: item.id,
          category: item.category_id,
          price: item.price,
          brand: item.brand
        });
      }}
    >
      {item.images[0] && (
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productPrice}>
          ${item.price.toFixed(2)} {item.currency}
        </Text>
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipSelected,
      ]}
      onPress={() => filterByCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderAIRecommendations = () => {
    if (!aiRecommendations || aiRecommendations.recommendations.length === 0) {
      return null;
    }

    return (
      <View style={styles.aiSection}>
        <View style={styles.aiSectionHeader}>
          <Ionicons name="sparkles" size={20} color="#007AFF" />
          <Text style={styles.aiSectionTitle}>AI Recommendations</Text>
        </View>
        <Text style={styles.aiExplanation} numberOfLines={3}>
          {aiRecommendations.ai_explanation}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {aiRecommendations.recommendations.map((product: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.aiProductCard}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              {product.images[0] && (
                <Image source={{ uri: product.images[0] }} style={styles.aiProductImage} />
              )}
              <Text style={styles.aiProductTitle} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.aiProductPrice}>
                ${product.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>
            {welcomeMessage || 'Welcome to AisleMarts'}
          </Text>
          {user && <Text style={styles.userText}>Hello, {user.name || user.email}</Text>}
          {localeInfo && (
            <Text style={styles.localeText}>
              📍 {localeInfo.country} • {localeInfo.currency}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => setShowAIAssistant(true)}
          >
            <Ionicons name="sparkles" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.aiHubButton}
          onPress={() => setShowAISearchHub(true)}
        >
          <Text style={styles.aiHubButtonText}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Ask AI to find anything..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchProducts}
        />
        <TouchableOpacity
          style={[styles.voiceButton, isVoiceSearching && styles.voiceButtonActive]}
          onPress={startVoiceSearch}
          disabled={isVoiceSearching}
        >
          <Ionicons 
            name={isVoiceSearching ? "radio-button-on" : "mic"} 
            size={20} 
            color={isVoiceSearching ? "#FF3B30" : "#007AFF"} 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={searchProducts}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* AI Recommendations */}
        {renderAIRecommendations()}

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipSelected,
              ]}
              onPress={() => filterByCategory(null)}
            >
              <Text
                style={[
                  styles.categoryText,
                  !selectedCategory && styles.categoryTextSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <View key={category.id}>
                {renderCategory({ item: category })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productGrid}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <TouchableOpacity 
                style={styles.aiHelpButton}
                onPress={() => setShowAIAssistant(true)}
              >
                <Ionicons name="sparkles" size={16} color="#007AFF" />
                <Text style={styles.aiHelpText}>Ask AI for help</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* AI Assistant Modal */}
      <AIAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        screenName="home"
        initialContext={{
          current_products: products.length,
          selected_category: selectedCategory,
          search_query: searchQuery,
          locale_info: localeInfo
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  localeText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  aiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#FFE6E6',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSection: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  aiExplanation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  aiProductCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  aiProductImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 6,
  },
  aiProductTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  aiProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoriesSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginLeft: 16,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextSelected: {
    color: 'white',
  },
  productsSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
    minHeight: 400,
  },
  productGrid: {
    paddingHorizontal: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#888',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 16,
  },
  aiHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiHelpText: {
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});