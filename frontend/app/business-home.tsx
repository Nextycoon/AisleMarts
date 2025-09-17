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

type EnterpriseProduct = {
  id: string;
  title: string;
  price: { amount: number; currency: string; bulk?: string };
  image: string;
  supplier: string;
  url: string;
  source: string;
  attributes?: { [key: string]: string };
  enterprise?: { minOrder: number; creditTerms: string; compliance: string };
  category: 'raw_materials' | 'equipment' | 'services' | 'technology';
};

type BusinessSearchResponse = {
  results: EnterpriseProduct[];
  total: number;
  query: string;
  suggestions?: string[];
};

export default function BusinessHome() {
  const theme = useOneColorTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<EnterpriseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [aisleModalVisible, setAisleModalVisible] = useState(false);

  const styles = createStyles(theme);

  // Enterprise-focused federated search
  const searchEnterprise = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Call federated search API with business context
      const response = await fetch(`/api/commerce/search?q=${encodeURIComponent(query)}&user_type=business&limit=20`);
      const data: BusinessSearchResponse = await response.json();
      
      setItems(data.results);
      console.log(`🔍 Found ${data.results.length} enterprise products for B2B`);
    } catch (error) {
      console.error('Enterprise search failed:', error);
      // Mock enterprise/B2B data for demo
      setItems([
        {
          id: 'enterprise_1',
          title: 'Industrial Coffee Roasting Equipment - 500kg/hour',
          price: { amount: 2500000, currency: 'KES', bulk: '30% volume discount' },
          image: 'https://via.placeholder.com/200x200/004D40/FFFFFF?text=Roaster',
          supplier: 'Industrial Equipment Ltd',
          url: 'https://b2b-marketplace.com/roasting-equipment',
          source: 'thomasnet',
          attributes: { capacity: '500kg/hour', power: '380V', certification: 'CE' },
          enterprise: { minOrder: 1, creditTerms: '30 days', compliance: 'ISO 9001' },
          category: 'equipment'
        },
        {
          id: 'enterprise_2', 
          title: 'Logistics Software Suite - Multi-Warehouse Management',
          price: { amount: 45000, currency: 'KES', bulk: 'per user/month' },
          image: 'https://via.placeholder.com/200x200/00695C/FFFFFF?text=Software',
          supplier: 'LogiTech Solutions',
          url: 'https://enterprise-software.com/logistics',
          source: 'aws_marketplace',
          attributes: { users: 'unlimited', integrations: '50+', support: '24/7' },
          enterprise: { minOrder: 12, creditTerms: 'monthly', compliance: 'SOC 2' },
          category: 'technology'
        },
        {
          id: 'enterprise_3',
          title: 'Premium Arabica Coffee Beans - Contract Grade AAA',
          price: { amount: 650, currency: 'KES', bulk: 'per kg, 1000kg min' },
          image: 'https://via.placeholder.com/200x200/00796B/FFFFFF?text=Coffee+AAA',
          supplier: 'Kenya Coffee Board Certified',
          url: 'https://coffee-exchange.com/arabica-aaa',
          source: 'commodity_exchange',
          attributes: { grade: 'AAA', origin: 'Nyeri', moisture: '10.5%' },
          enterprise: { minOrder: 1000, creditTerms: '45 days', compliance: 'Fairtrade' },
          category: 'raw_materials'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Aisle AI for enterprise trade facilitation
  const handleAisleInteraction = (message: string) => {
    setQuery(message);
    setAisleModalVisible(false);
    searchEnterprise();
  };

  const renderEnterpriseProduct = ({ item }: { item: EnterpriseProduct }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        console.log('Opening enterprise product:', item.title);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productMeta}>
        <Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>
          {item.price.currency} {item.price.amount.toLocaleString()}
          {item.price.bulk && <Text style={styles.bulk}> ({item.price.bulk})</Text>}
        </Text>
        <Text style={styles.supplier}>{item.supplier}</Text>
        <View style={styles.enterpriseInfo}>
          <Text style={styles.category}>{item.category.replace('_', ' ').toUpperCase()}</Text>
          {item.enterprise && (
            <Text style={styles.compliance}>{item.enterprise.compliance}</Text>
          )}
        </View>
        {item.enterprise && (
          <Text style={styles.terms}>
            MOQ: {item.enterprise.minOrder} • Terms: {item.enterprise.creditTerms}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.background} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enterprise Portal</Text>
        <Text style={styles.headerSubtitle}>AI-powered B2B procurement & trade facilitation</Text>
      </View>
      
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Industrial equipment, raw materials, B2B services..."
            placeholderTextColor={theme.onMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchEnterprise}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={searchEnterprise}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.on} />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Enterprise Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>12</Text>
          <Text style={styles.metricLabel}>Active RFQs</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>KES 2.4M</Text>
          <Text style={styles.metricLabel}>Pending Orders</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>8</Text>
          <Text style={styles.metricLabel}>Suppliers</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>45 days</Text>
          <Text style={styles.metricLabel}>Avg Terms</Text>
        </View>
      </View>

      {/* Enterprise Results */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderEnterpriseProduct}
        contentContainerStyle={styles.resultsContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Searching enterprise suppliers...' : 'Try "industrial equipment" or "raw materials coffee"'}
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

      {/* Aisle Modal - Trade Facilitation */}
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
            <Text style={styles.aisleTitle}>Hi! I'm Aisle, your AI trade facilitator.</Text>
            <Text style={styles.aisleSubtitle}>Let me help with complex B2B negotiations and procurement.</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('industrial coffee processing equipment Kenya')}
              >
                <Text style={styles.quickActionText}>🏭 Industrial Equipment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('raw materials bulk suppliers compliance certified')}
              >
                <Text style={styles.quickActionText}>📦 Raw Materials Sourcing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => handleAisleInteraction('enterprise software logistics management B2B')}
              >
                <Text style={styles.quickActionText}>💼 Enterprise Software</Text>
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
    gap: 8,
  },
  metric: {
    flex: 1,
    backgroundColor: theme.glass.primary,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  metricValue: {
    color: theme.on,
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    color: theme.onDim,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
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
    minWidth: 70,
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
  bulk: {
    color: theme.onDim,
    fontWeight: '400',
    fontSize: 12,
  },
  supplier: {
    color: theme.onDim,
    fontSize: 12,
    marginBottom: 4,
  },
  enterpriseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  category: {
    color: theme.on,
    fontSize: 10,
    backgroundColor: theme.glass.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  compliance: {
    color: theme.onMuted,
    fontSize: 10,
    fontStyle: 'italic',
  },
  terms: {
    color: theme.onMuted,
    fontSize: 11,
    marginTop: 2,
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