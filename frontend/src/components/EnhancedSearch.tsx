/**
 * Enhanced Search Component with AI suggestions and filters
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'ai' | 'product';
  icon: string;
  category?: string;
}

interface SearchFilter {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

interface EnhancedSearchProps {
  onSearch?: (query: string, filters: SearchFilter[]) => void;
  onClose?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function EnhancedSearch({
  onSearch,
  onClose,
  placeholder = "Search luxury products...",
  autoFocus = true,
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize filters
    setFilters([
      { id: '1', name: 'All', icon: '🔍', active: true },
      { id: '2', name: 'Handbags', icon: '👜', active: false },
      { id: '3', name: 'Watches', icon: '⌚', active: false },
      { id: '4', name: 'Jewelry', icon: '💎', active: false },
      { id: '5', name: 'Fashion', icon: '👗', active: false },
      { id: '6', name: 'Tech', icon: '📱', active: false },
    ]);

    // Load initial suggestions
    loadSuggestions('');
  }, []);

  const loadSuggestions = (searchQuery: string) => {
    // Mock suggestions - in real app, this would come from API
    const mockSuggestions: SearchSuggestion[] = [
      { id: '1', text: 'Hermès Birkin Bag', type: 'trending', icon: '🔥', category: 'handbags' },
      { id: '2', text: 'Rolex Submariner', type: 'trending', icon: '🔥', category: 'watches' },
      { id: '3', text: 'luxury handbags', type: 'recent', icon: '🕒' },
      { id: '4', text: 'diamond rings', type: 'recent', icon: '🕒' },
      { id: '5', text: 'AI suggests: Limited Edition Watches', type: 'ai', icon: '🤖' },
      { id: '6', text: 'AI suggests: Trending in your area', type: 'ai', icon: '🤖' },
    ];

    if (searchQuery.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(mockSuggestions);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery, filters.filter(f => f.active));
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleFilterPress = (filterId: string) => {
    if (filterId === '1') {
      // "All" filter - deactivate all others
      setFilters(prev => prev.map(f => ({ ...f, active: f.id === '1' })));
    } else {
      setFilters(prev => prev.map(f => {
        if (f.id === filterId) {
          return { ...f, active: !f.active };
        } else if (f.id === '1') {
          return { ...f, active: false };
        }
        return f;
      }));
    }
  };

  const handleVoiceSearch = () => {
    setIsVoiceActive(!isVoiceActive);
    // Implement voice search functionality
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionIcon}>{item.icon}</Text>
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionText}>{item.text}</Text>
          {item.category && (
            <Text style={styles.suggestionCategory}>{item.category}</Text>
          )}
        </View>
        <Text style={[
          styles.suggestionType,
          { color: getSuggestionTypeColor(item.type) }
        ]}>
          {item.type.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilter = ({ item }: { item: SearchFilter }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        item.active && styles.filterChipActive
      ]}
      onPress={() => handleFilterPress(item.id)}
    >
      <Text style={styles.filterIcon}>{item.icon}</Text>
      <Text style={[
        styles.filterText,
        item.active && styles.filterTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'trending': return '#ff6b6b';
      case 'recent': return '#4ecdc4';
      case 'ai': return '#D4AF37';
      case 'product': return '#a855f7';
      default: return 'rgba(255, 255, 255, 0.6)';
    }
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      statusBarTranslucent
      style={styles.modal}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#0f0f23', '#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  value={query}
                  onChangeText={(text) => {
                    setQuery(text);
                    loadSuggestions(text);
                  }}
                  placeholder={placeholder}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  autoFocus={autoFocus}
                  onSubmitEditing={() => handleSearch()}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setQuery('')}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity
                onPress={handleVoiceSearch}
                style={[
                  styles.voiceButton,
                  isVoiceActive && styles.voiceButtonActive
                ]}
              >
                <Text style={styles.voiceButtonText}>🎤</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersSection}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Categories</Text>
              <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
                <Text style={styles.filtersToggle}>
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Text>
              </TouchableOpacity>
            </View>
            
            {showFilters && (
              <FlatList
                data={filters}
                renderItem={renderFilter}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
              />
            )}
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>
              {query ? 'Search Results' : 'Suggestions'}
            </Text>
            
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* AI Recommendations */}
          <View style={styles.aiSection}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.2)', 'rgba(232, 201, 104, 0.1)']}
              style={styles.aiCard}
            >
              <View style={styles.aiContent}>
                <Text style={styles.aiIcon}>🤖</Text>
                <View style={styles.aiTextContainer}>
                  <Text style={styles.aiTitle}>AI-Powered Search</Text>
                  <Text style={styles.aiSubtitle}>
                    Get personalized recommendations based on your preferences
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  clearButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  voiceButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  voiceButtonText: {
    fontSize: 20,
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  filtersToggle: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  filtersContainer: {
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  suggestionsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'capitalize',
  },
  suggestionType: {
    fontSize: 10,
    fontWeight: '600',
  },
  aiSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  aiCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});