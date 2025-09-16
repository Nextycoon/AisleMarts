/**
 * Enhanced Discover Screen
 * Universal AI Commerce Engine Phase 1 - Discover Screen
 * Features: Global search, Retail/Wholesale/All filters, Best Pick badges, multilingual support
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { 
  searchService, 
  SearchResult, 
  SearchParams,
  SEARCH_MODES, 
  SEARCH_LANGUAGES,
  LANGUAGE_NAMES
} from '../src/services/SearchService';
import { BestPickBadge, BestPickCompact } from '../src/components/BestPickComponents';
import { OffersSheet } from '../src/components/OffersSheet';

// ============= INTERFACES =============

interface SearchFilters {
  mode: 'retail' | 'b2b' | 'all';
  language: 'en' | 'sw' | 'ar' | 'tr' | 'fr';
  location?: { lat: number; lon: number };
}

interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  page: number;
  hasMore: boolean;
}

// ============= MAIN COMPONENT =============

export default function DiscoverScreen() {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    loading: false,
    error: null,
    hasSearched: false,
    page: 1,
    hasMore: true
  });
  
  const [filters, setFilters] = useState<SearchFilters>({
    mode: 'all',
    language: 'en'
  });
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: string; title: string} | null>(null);
  
  const searchInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');

  // Initialize search system on mount
  useEffect(() => {
    initializeSearchSystem();
  }, []);

  const initializeSearchSystem = async () => {
    try {
      await searchService.initialize();
      console.log('Search system initialized');
    } catch (error) {
      console.log('Search system already initialized or error:', error);
    }
  };

  const handleSearch = async (query?: string, resetPage: boolean = true) => {
    const searchQuery = query || searchState.query;
    
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a search term');
      return;
    }

    const newPage = resetPage ? 1 : searchState.page;
    
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null,
      ...(resetPage && { results: [], page: 1 })
    }));

    try {
      const searchParams: SearchParams = {
        q: searchQuery,
        mode: filters.mode,
        lang: filters.language,
        page: newPage,
        limit: 20,
        ...(filters.location && { 
          lat: filters.location.lat, 
          lon: filters.location.lon 
        })
      };

      const response = await searchService.search(searchParams);
      
      setSearchState(prev => ({
        ...prev,
        results: resetPage ? response.results : [...prev.results, ...response.results],
        loading: false,
        hasSearched: true,
        page: newPage,
        hasMore: response.results.length === 20, // Assume more if we got full page
        query: searchQuery
      }));

    } catch (error: any) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Search failed',
        hasSearched: true
      }));
    }
  };

  const handleLoadMore = () => {
    if (!searchState.loading && searchState.hasMore) {
      setSearchState(prev => ({
        ...prev,
        page: prev.page + 1
      }));
      handleSearch(searchState.query, false);
    }
  };

  const handleSuggestionSearch = async (query: string) => {
    if (query.length >= 2) {
      try {
        const response = await searchService.getSuggestions({
          q: query,
          lang: filters.language,
          limit: 5
        });
        setSuggestions(response.suggestions.map(s => s.text));
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleImageSearch = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos for image search');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled && result.assets[0].base64) {
        // TODO: Implement image search with base64
        Alert.alert('Image Search', 'Image search will be implemented soon!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleBarcodeSearch = () => {
    // TODO: Implement barcode scanning
    Alert.alert('Barcode Search', 'Barcode scanning will be implemented soon!');
  };

  const handleProductPress = (product: SearchResult['product']) => {
    router.push(`/product/${product.id}`);
  };

  const handleOffersPress = (product: SearchResult['product']) => {
    setSelectedProduct({ id: product.id, title: product.title });
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => handleProductPress(item.product)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.product.images[0] || 'https://via.placeholder.com/120x120' }}
          style={styles.productImage}
          contentFit="cover"
        />
        <View style={styles.bestPickBadgeContainer}>
          <BestPickCompact 
            bestPick={item.best_pick}
            onPress={() => handleOffersPress(item.product)}
          />
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.product.title}
        </Text>
        
        {item.product.brand && (
          <Text style={styles.productBrand}>
            {item.product.brand}
          </Text>
        )}
        
        <View style={styles.productFooter}>
          <View>
            <Text style={styles.productPrice}>
              {item.product.currency} {item.product.price}
            </Text>
            <TouchableOpacity 
              onPress={() => handleOffersPress(item.product)}
              style={styles.offersButton}
            >
              <Text style={styles.offersButtonText}>
                {item.offers_count} offer{item.offers_count !== 1 ? 's' : ''}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          <BestPickBadge 
            bestPick={item.best_pick}
            size="small"
            onPress={() => handleOffersPress(item.product)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Discover</Text>
          
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Ionicons 
              name={showFilters ? "close" : "options"} 
              size={24} 
              color="#111827" 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={`Search in ${LANGUAGE_NAMES[filters.language]}...`}
              value={searchState.query}
              onChangeText={(text) => {
                setSearchState(prev => ({ ...prev, query: text }));
                handleSuggestionSearch(text);
              }}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchState.query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchState(prev => ({ ...prev, query: '', results: [], hasSearched: false }));
                  setSuggestions([]);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Search Action Buttons */}
          <View style={styles.searchActions}>
            <TouchableOpacity onPress={handleImageSearch} style={styles.actionButton}>
              <Ionicons name="image" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBarcodeSearch} style={styles.actionButton}>
              <Ionicons name="scan" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSearch()} style={styles.searchButton}>
              <Ionicons name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSearchState(prev => ({ ...prev, query: suggestion }));
                  setSuggestions([]);
                  handleSearch(suggestion);
                }}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Mode Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Mode:</Text>
              <View style={styles.filterOptions}>
                {Object.entries(SEARCH_MODES).map(([key, value]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setFilters(prev => ({ ...prev, mode: value }))}
                    style={[
                      styles.filterOption,
                      filters.mode === value && styles.filterOptionActive
                    ]}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.mode === value && styles.filterOptionTextActive
                    ]}>
                      {value === 'all' ? '🌍 All' : 
                       value === 'retail' ? '🏪 Retail' : '🏭 B2B'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Language Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Language:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.languageScroll}
              >
                {Object.entries(SEARCH_LANGUAGES).map(([key, value]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setFilters(prev => ({ ...prev, language: value }))}
                    style={[
                      styles.languageOption,
                      filters.language === value && styles.languageOptionActive
                    ]}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      filters.language === value && styles.languageOptionTextActive
                    ]}>
                      {LANGUAGE_NAMES[value]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!searchState.hasSearched ? (
          // Welcome State
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="search" size={48} color="#3B82F6" />
            </View>
            <Text style={styles.welcomeTitle}>
              Universal AI Commerce Discovery
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Search across retail, wholesale, factories, and farms worldwide
            </Text>
            <View style={styles.welcomeFeatures}>
              <View style={styles.featureItem}>
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text style={styles.featureText}>Best Pick Algorithm</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="language" size={20} color="#10B981" />
                <Text style={styles.featureText}>Multilingual Search</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="storefront" size={20} color="#8B5CF6" />
                <Text style={styles.featureText}>Multi-Vendor Offers</Text>
              </View>
            </View>
          </View>
        ) : searchState.loading && searchState.results.length === 0 ? (
          // Loading State
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              Searching {filters.mode} products in {LANGUAGE_NAMES[filters.language]}...
            </Text>
          </View>
        ) : searchState.error ? (
          // Error State
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Search Failed</Text>
            <Text style={styles.errorText}>{searchState.error}</Text>
            <TouchableOpacity 
              onPress={() => handleSearch()}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : searchState.results.length === 0 ? (
          // No Results State
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-circle" size={48} color="#6B7280" />
            <Text style={styles.noResultsTitle}>No Results Found</Text>
            <Text style={styles.noResultsText}>
              Try different keywords or change your filters
            </Text>
          </View>
        ) : (
          // Results State
          <FlatList
            data={searchState.results}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.product.id}
            numColumns={2}
            columnWrapperStyle={styles.resultRow}
            contentContainerStyle={styles.resultsContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => (
              searchState.loading ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                </View>
              ) : null
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Offers Sheet */}
      <OffersSheet
        productId={selectedProduct?.id || null}
        productTitle={selectedProduct?.title}
        isVisible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </KeyboardAvoidingView>
  );
}

// ============= STYLES =============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  filterButton: {
    padding: 8,
  },
  
  // Search Styles
  searchContainer: {
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Suggestions Styles
  suggestionsContainer: {
    maxHeight: 40,
  },
  suggestionsContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  
  // Filter Styles
  filtersContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
  languageScroll: {
    maxHeight: 40,
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  languageOptionActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  languageOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  languageOptionTextActive: {
    color: '#FFFFFF',
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  
  // Welcome State
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcomeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeFeatures: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // No Results State
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Results Styles
  resultsContainer: {
    padding: 16,
  },
  resultRow: {
    justifyContent: 'space-between',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    width: '48%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bestPickBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  offersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  offersButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
});