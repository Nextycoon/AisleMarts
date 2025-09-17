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

type SupplierProduct = {
  id: string;
  title: string;
  price: { amount: number; currency: string; moq?: number };
  image: string;
  supplier: string;
  url: string;
  source: string;
  attributes?: { [key: string]: string };
  wholesale?: { minOrder: number; discount: string };
  businessType: 'wholesale' | 'manufacturer' | 'distributor';
};

type VendorSearchResponse = {
  results: SupplierProduct[];
  total: number;
  query: string;
  suggestions?: string[];
};

export default function VendorHome() {
  const theme = useOneColorTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [aisleModalVisible, setAisleModalVisible] = useState(false);

  const styles = createStyles(theme);

  // Vendor-focused federated search
  const searchSuppliers = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Call federated search API with vendor context
      const response = await fetch(`/api/commerce/search?q=${encodeURIComponent(query)}&user_type=vendor&limit=20`);
      const data: VendorSearchResponse = await response.json();
      
      setItems(data.results);
      console.log(`🔍 Found ${data.results.length} supplier products for vendors`);
    } catch (error) {
      console.error('Vendor search failed:', error);
      // Mock vendor/supplier data for demo
      setItems([
        {
          id: 'supplier_1',
          title: 'Wholesale Nike Air Max - Bulk 50+ Units',
          price: { amount: 3500, currency: 'KES', moq: 50 },
          image: 'https://via.placeholder.com/200x200/1A237E/FFFFFF?text=Bulk+Nike',
          supplier: 'Guangzhou Supplier Co.',
          url: 'https://alibaba.com/wholesale-nike',
          source: 'alibaba',
          attributes: { sizes: 'US 7-12', colors: '5 variants' },
          wholesale: { minOrder: 50, discount: '40% off retail' },
          businessType: 'manufacturer'
        },
        {
          id: 'supplier_2', 
          title: 'Custom Phone Cases - Private Label MOQ 100',
          price: { amount: 150, currency: 'KES', moq: 100 },
          image: 'https://via.placeholder.com/200x200/3F51B5/FFFFFF?text=Phone+Cases',
          supplier: 'Shenzhen Electronics',
          url: 'https://alibaba.com/phone-cases',
          source: 'alibaba',
          attributes: { material: 'TPU+PC', customization: 'logo printing' },
          wholesale: { minOrder: 100, discount: 'private label ready' },
          businessType: 'manufacturer'
        },
        {
          id: 'supplier_3',
          title: 'Coffee Beans - Premium Grade A, 25kg Bags',
          price: { amount: 8500, currency: 'KES', moq: 10 },
          image: 'https://via.placeholder.com/200x200/5E35B1/FFFFFF?text=Coffee+Bulk',
          supplier: 'Kenya Coffee Exporters',
          url: 'https://local-supplier.co.ke/coffee',
          source: 'local',
          attributes: { origin: 'Kiambu', grade: 'AA', processing: 'washed' },
          wholesale: { minOrder: 10, discount: 'direct from farm' },
          businessType: 'distributor'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Aisle AI for vendor optimization
  const handleAisleInteraction = (message: string) => {
    setQuery(message);
    setAisleModalVisible(false);
    searchSuppliers();
  };

  const renderSupplierProduct = ({ item }: { item: SupplierProduct }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        console.log('Opening supplier product:', item.title);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productMeta}>
        <Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>
          {item.price.currency} {item.price.amount.toLocaleString()}
          {item.price.moq && <Text style={styles.moq}> (MOQ: {item.price.moq})</Text>}
        </Text>
        <Text style={styles.supplier}>{item.supplier}</Text>
        <View style={styles.businessTypeContainer}>
          <Text style={styles.businessType}>{item.businessType.toUpperCase()}</Text>
          {item.wholesale && (
            <Text style={styles.wholesale}>{item.wholesale.discount}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.background} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendor Dashboard</Text>
        <Text style={styles.headerSubtitle}>AI-powered supplier discovery & optimization</Text>
      </View>
      
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Find suppliers, wholesale products..."
            placeholderTextColor={theme.onMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchSuppliers}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={searchSuppliers}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.on} />
            ) : (
              <Text style={styles.searchButtonText}>Find</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>24</Text>
          <Text style={styles.metricLabel}>Active Listings</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>KES 89K</Text>
          <Text style={styles.metricLabel}>Monthly Revenue</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>4.8★</Text>
          <Text style={styles.metricLabel}>Rating</Text>
        </View>
      </View>

      {/* Supplier Results */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderSupplierProduct}
        contentContainerStyle={styles.resultsContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Finding suppliers...' : 'Try "wholesale electronics" or "bulk coffee beans"'}
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

      {/* Aisle Modal - Business Optimization */}
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
            <Text style={styles.aisleTitle}>Hi! I'm Aisle, your AI business optimizer.</Text>
            <Text style={styles.aisleSubtitle}>How can I help grow your business today?</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('wholesale electronics bulk suppliers')}
              >
                <Text style={styles.quickActionText}>📱 Find Electronics Suppliers</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('competitive pricing analysis trending products')}
              >
                <Text style={styles.quickActionText}>📊 Pricing Analysis</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('high margin products low competition')}
              >
                <Text style={styles.quickActionText}>💰 High-Margin Opportunities</Text>
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
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    color: theme.on,
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: theme.onDim,
    fontSize: 14,
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: theme.glass.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  metricValue: {
    color: theme.on,
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: theme.onDim,
    fontSize: 12,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    minWidth: 60,
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
  moq: {
    color: theme.onDim,
    fontWeight: '400',
    fontSize: 12,
  },
  supplier: {
    color: theme.onDim,
    fontSize: 12,
    marginBottom: 4,
  },
  businessTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  businessType: {
    color: theme.on,
    fontSize: 10,
    backgroundColor: theme.glass.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  wholesale: {
    color: theme.onMuted,
    fontSize: 10,
    fontStyle: 'italic',
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