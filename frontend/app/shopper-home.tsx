import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useOneColorTheme } from '../src/theme/oneColorTheme';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

type Product = {
  id: string;
  title: string;
  price: { amount: number; currency: string };
  image: string;
  merchant: string;
  url: string;
  source: string;
  attributes?: { [key: string]: string };
  shipping?: { etaDays: number; cost: number };
};

type SearchResponse = {
  results: Product[];
  total: number;
  query: string;
  suggestions?: string[];
};

export default function ShopperHome() {
  const theme = useOneColorTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [aisleModalVisible, setAisleModalVisible] = useState(false);
  const [aisleMessage, setAisleMessage] = useState('');

  const styles = createStyles(theme);

  // Federated search function
  const searchFederated = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Call federated search API
      const response = await fetch(`/api/commerce/search?q=${encodeURIComponent(query)}&user_type=shopper`);
      const data: SearchResponse = await response.json();
      
      setItems(data.results);
      console.log(`🔍 Found ${data.results.length} products from ${new Set(data.results.map(p => p.source)).size} platforms`);
    } catch (error) {
      console.error('Search failed:', error);
      // Mock data for demo
      setItems([
        {
          id: 'demo_1',
          title: 'Nike Air Zoom Pegasus 40 - Black/White',
          price: { amount: 7999, currency: 'KES' },
          image: 'https://via.placeholder.com/200x200/333333/FFFFFF?text=Nike',
          merchant: 'Amazon',
          url: 'https://amazon.com/nike-pegasus',
          source: 'amazon',
          attributes: { size: 'US 9', color: 'black' },
          shipping: { etaDays: 5, cost: 699 }
        },
        {
          id: 'demo_2', 
          title: 'Samsung Galaxy Buds Pro - Noise Canceling',
          price: { amount: 12500, currency: 'KES' },
          image: 'https://via.placeholder.com/200x200/1976D2/FFFFFF?text=Samsung',
          merchant: 'Jumia',
          url: 'https://jumia.co.ke/samsung-buds',
          source: 'jumia',
          attributes: { color: 'phantom black' },
          shipping: { etaDays: 2, cost: 250 }
        },
        {
          id: 'demo_3',
          title: 'MacBook Air M2 - 13 inch, 256GB SSD',
          price: { amount: 145000, currency: 'KES' },
          image: 'https://via.placeholder.com/200x200/000000/FFFFFF?text=Apple',
          merchant: 'eBay',
          url: 'https://ebay.com/macbook-air-m2',
          source: 'ebay',
          attributes: { storage: '256GB', color: 'midnight' },
          shipping: { etaDays: 7, cost: 1500 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Aisle AI interaction
  const handleAisleInteraction = (message: string) => {
    setAisleMessage(message);
    setQuery(message);
    setAisleModalVisible(false);
    searchFederated();
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Open product URL or navigate to detail screen
        console.log('Opening product:', item.title);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productMeta}>
        <Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>
          {item.price.currency} {item.price.amount.toLocaleString()}
        </Text>
        <Text style={styles.productMerchant}>{item.merchant}</Text>
        {item.shipping && (
          <Text style={styles.productShipping}>
            Delivery: {item.shipping.etaDays} days
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.background} barStyle="light-content" />
      
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search everything (ask Aisle)..."
            placeholderTextColor={theme.onMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchFederated}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={searchFederated}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.on} />
            ) : (
              <Text style={styles.searchButtonText}>Go</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Federated Results */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.resultsContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Searching all platforms...' : 'Try "sneakers under KES 3000" or "iPhone 15"'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Aisle AI Assistant FAB */}
      <TouchableOpacity 
        style={styles.aisleFab} 
        onPress={() => setAisleModalVisible(true)}
      >
        <Text style={styles.aisleFabText}>Aisle</Text>
      </TouchableOpacity>

      {/* Aisle Modal */}
      <Modal
        visible={aisleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAisleModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={() => setAisleModalVisible(false)}
          />
          <View style={styles.aisleModal}>
            <Text style={styles.aisleTitle}>Hi! I'm Aisle, your AI shopping companion.</Text>
            <Text style={styles.aisleSubtitle}>What can I help you find today?</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('trending electronics under KES 10000')}
              >
                <Text style={styles.quickActionText}>📱 Trending Electronics</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('best deals fashion shoes')}
              >
                <Text style={styles.quickActionText}>👟 Fashion Deals</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('home appliances with free shipping')}
              >
                <Text style={styles.quickActionText}>🏠 Home Appliances</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setAisleModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  searchContainer: {
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.glass.primary,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.border.medium,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.on,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.glass.accent,
    borderWidth: 1,
    borderColor: theme.border.strong,
    minWidth: 50,
    alignItems: 'center',
  },
  searchButtonText: {
    color: theme.on,
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: theme.glass.secondary,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    gap: 12,
  },
  productImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: theme.glass.primary,
  },
  productMeta: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    color: theme.on,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  productPrice: {
    color: theme.on,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  productMerchant: {
    color: theme.onDim,
    fontSize: 12,
    marginBottom: 2,
  },
  productShipping: {
    color: theme.onMuted,
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    color: theme.onDim,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  aisleFab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: theme.glass.modal,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border.strong,
    elevation: 4,
    shadowColor: theme.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  aisleFabText: {
    color: theme.on,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  aisleModal: {
    backgroundColor: theme.glass.modal,
    borderRadius: 24,
    padding: 24,
    margin: 16,
    borderWidth: 1,
    borderColor: theme.border.strong,
    minWidth: 300,
  },
  aisleTitle: {
    color: theme.on,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  aisleSubtitle: {
    color: theme.onDim,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickActions: {
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    backgroundColor: theme.glass.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  quickActionText: {
    color: theme.on,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: theme.glass.accent,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border.medium,
  },
  closeButtonText: {
    color: theme.on,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});