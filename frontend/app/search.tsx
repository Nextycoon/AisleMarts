import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';
import FloatingAIAssistant from '../src/components/FloatingAIAssistant';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  type: 'product' | 'creator' | 'brand' | 'hashtag';
  title: string;
  subtitle: string;
  price?: string;
  rating?: number;
  sales?: number;
  followers?: number;
  verified?: boolean;
}

interface TrendingItem {
  id: string;
  title: string;
  searchCount: string;
  trending: boolean;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'products' | 'creators' | 'brands'>('all');

  const trendingSearches: TrendingItem[] = [
    { id: '1', title: 'Winter Fashion', searchCount: '2.3M searches', trending: true },
    { id: '2', title: 'Smart Home', searchCount: '1.8M searches', trending: true },
    { id: '3', title: 'Fitness Gear', searchCount: '1.2M searches', trending: false },
    { id: '4', title: 'Gaming Setup', searchCount: '890K searches', trending: true },
    { id: '5', title: 'Skincare Routine', searchCount: '750K searches', trending: false },
    { id: '6', title: 'Sustainable Fashion', searchCount: '650K searches', trending: true },
  ];

  const aiSuggestions = [
    '🎯 Find similar products',
    '💰 Compare prices globally',
    '📈 Show trending items',
    '🛍️ Personalized recommendations',
    '🌟 Best rated products',
    '🔥 Flash sales near you',
  ];

  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'product',
      title: 'Premium Winter Coat',
      subtitle: 'LuxeFashion Brand',
      price: '$299',
      rating: 4.8,
      sales: 1250,
    },
    {
      id: '2',
      type: 'creator',
      title: '@fashionista_maya',
      subtitle: 'Fashion & Lifestyle Creator',
      followers: 2300000,
      verified: true,
    },
    {
      id: '3',
      type: 'brand',
      title: 'TechGear Pro',
      subtitle: 'Electronics & Gadgets',
      followers: 890000,
      verified: true,
    },
    {
      id: '4',
      type: 'product',
      title: 'Smart Watch Series X',
      subtitle: 'TechGear Pro',
      price: '$399',
      rating: 4.9,
      sales: 3400,
    },
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate API search delay
      setTimeout(() => {
        setSearchResults(mockResults.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        setIsSearching(false);
      }, 800);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchPress = (query: string) => {
    setSearchQuery(query);
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'product') {
      router.push(`/product/${result.id}`);
    } else if (result.type === 'creator') {
      router.push(`/profile/${result.id}`);
    } else if (result.type === 'brand') {
      router.push(`/brand/${result.id}`);
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultInfo}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
          </View>
          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
          
          {item.type === 'product' && (
            <View style={styles.productInfo}>
              <Text style={styles.productPrice}>{item.price}</Text>
              <Text style={styles.productRating}>⭐ {item.rating}</Text>
              <Text style={styles.productSales}>{item.sales} sold</Text>
            </View>
          )}
          
          {(item.type === 'creator' || item.type === 'brand') && (
            <Text style={styles.followersCount}>
              {item.followers?.toLocaleString()} followers
            </Text>
          )}
        </View>

        <View style={styles.resultActions}>
          {item.type === 'product' && (
            <TouchableOpacity style={styles.quickBuyButton}>
              <Text style={styles.quickBuyText}>Buy</Text>
            </TouchableOpacity>
          )}
          {item.type === 'creator' && (
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          )}
          {item.type === 'brand' && (
            <TouchableOpacity style={styles.visitButton}>
              <Text style={styles.visitText}>Visit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }: { item: TrendingItem }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => handleSearchPress(item.title)}
    >
      <View style={styles.trendingContent}>
        <Text style={styles.trendingTitle}>{item.title}</Text>
        <Text style={styles.trendingCount}>{item.searchCount}</Text>
      </View>
      {item.trending && (
        <View style={styles.trendingBadge}>
          <Text style={styles.trendingBadgeText}>🔥</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, creators, brands..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* AI Suggestions */}
      <View style={styles.aiSuggestions}>
        <Text style={styles.sectionTitle}>🤖 AI Suggestions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {aiSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => console.log('AI Suggestion:', suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'products', 'creators', 'brands'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          // Trending Searches
          <View style={styles.trendingSection}>
            <Text style={styles.sectionTitle}>📈 Trending Searches</Text>
            <FlatList
              data={trendingSearches}
              renderItem={renderTrendingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        ) : (
          // Search Results
          <View style={styles.resultsSection}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🔍 Searching with AI...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultsCount}>
                  {searchResults.length} results for "{searchQuery}"
                </Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </>
            )}
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />

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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  aiSuggestions: {
    paddingVertical: 16,
    paddingLeft: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#D4AF37',
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  trendingSection: {
    paddingHorizontal: 20,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  trendingContent: {
    flex: 1,
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendingCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  trendingBadge: {
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingBadgeText: {
    fontSize: 16,
  },
  resultsSection: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontStyle: 'italic',
  },
  resultsCount: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  resultContent: {
    flexDirection: 'row',
    padding: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  verifiedBadge: {
    color: '#1DA1F2',
    fontSize: 16,
  },
  resultSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  productRating: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  productSales: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  followersCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  resultActions: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  quickBuyButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickBuyText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  followButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  followText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  visitButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  visitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});