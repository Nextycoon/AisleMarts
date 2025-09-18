import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { api } from '../lib/api';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  images: string[];
  tags: string[];
  rating: number;
  rating_count: number;
}

interface Collection {
  title: string;
  subtitle: string;
  products: Product[];
  gradient: string[];
}

export default function AisleMartsHomeScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollections = async () => {
    try {
      // Load collections from new v1 API
      const collectionsData = await api.collections();
      
      const newCollections: Collection[] = [];

      if (collectionsData.Luxury && collectionsData.Luxury.length > 0) {
        newCollections.push({
          title: 'Luxury Collection',
          subtitle: 'Premium brands & exclusive pieces',
          products: collectionsData.Luxury.map((item: any) => ({
            _id: item.id,
            title: item.title,
            brand: item.brand,
            price: item.price,
            currency: 'USD',
            images: [item.thumb],
            tags: [item.badges],
            rating: 4.8,
            rating_count: 127
          })),
          gradient: ['#f59e0b', '#d97706', '#92400e']
        });
      }

      if (collectionsData.Trending && collectionsData.Trending.length > 0) {
        newCollections.push({
          title: 'Trending Now',
          subtitle: 'Hot picks & new arrivals',
          products: collectionsData.Trending.map((item: any) => ({
            _id: item.id,
            title: item.title,
            brand: item.brand,
            price: item.price,
            currency: 'USD',
            images: [item.thumb],
            tags: [item.badges],
            rating: 4.6,
            rating_count: 89
          })),
          gradient: ['#a855f7', '#7c3aed', '#5b21b6']
        });
      }

      if (collectionsData.Deal && collectionsData.Deal.length > 0) {
        newCollections.push({
          title: 'Special Deals',
          subtitle: 'Limited time offers',
          products: collectionsData.Deal.map((item: any) => ({
            _id: item.id,
            title: item.title,
            brand: item.brand,
            price: item.price,
            currency: 'USD',
            images: [item.thumb],
            tags: [item.badges],
            rating: 4.4,
            rating_count: 156
          })),
          gradient: ['#059669', '#047857', '#065f46']
        });
      }

      setCollections(newCollections);
    } catch (error) {
      console.error('Failed to load collections:', error);
      // Fallback to mock data for development
      setCollections([
        {
          title: 'Luxury Collection',
          subtitle: 'Premium brands & exclusive pieces',
          products: [],
          gradient: ['#f59e0b', '#d97706', '#92400e']
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCollections();
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product._id }
    });
  };

  const handleAisleAgentPress = () => {
    router.push('/aisle-agent');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.images[0] || 'https://picsum.photos/200/200' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            ${item.price.toFixed(0)}
          </Text>
          {item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                ★ {item.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCollection = (collection: Collection, index: number) => (
    <View key={index} style={styles.collectionSection}>
      <LinearGradient
        colors={collection.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.collectionHeader}
      >
        <View style={styles.collectionHeaderContent}>
          <Text style={styles.collectionTitle}>{collection.title}</Text>
          <Text style={styles.collectionSubtitle}>{collection.subtitle}</Text>
        </View>
      </LinearGradient>

      {collection.products.length > 0 ? (
        <FlatList
          data={collection.products}
          renderItem={renderProduct}
          keyExtractor={(product) => product._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      ) : (
        <View style={styles.emptyCollection}>
          <Text style={styles.emptyText}>Coming soon...</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#a855f7"
            colors={['#a855f7']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.brandText}>AisleMarts</Text>
              <Text style={styles.taglineText}>Your AI Shopping Companion</Text>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchPress}
              activeOpacity={0.8}
            >
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Aisle AI CTA */}
        <TouchableOpacity
          style={styles.aisleAgentCTA}
          onPress={handleAisleAgentPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#a855f7', '#7c3aed', '#5b21b6']}
            style={styles.aisleAgentGradient}
          >
            <View style={styles.aisleAgentContent}>
              <View style={styles.aisleAgentLeft}>
                <Text style={styles.aisleAgentIcon}>🤖</Text>
                <View style={styles.aisleAgentText}>
                  <Text style={styles.aisleAgentTitle}>Chat with Aisle AI</Text>
                  <Text style={styles.aisleAgentSubtitle}>
                    Get personalized recommendations
                  </Text>
                </View>
              </View>
              <Text style={styles.aisleAgentArrow}>→</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Collections */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading collections...</Text>
          </View>
        ) : (
          collections.map((collection, index) => renderCollection(collection, index))
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  
  brandText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  taglineText: {
    fontSize: 14,
    color: '#a855f7',
    fontWeight: '500',
  },
  
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  searchIcon: {
    fontSize: 20,
  },
  
  aisleAgentCTA: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  aisleAgentGradient: {
    padding: 20,
  },
  
  aisleAgentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  aisleAgentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  aisleAgentIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  
  aisleAgentText: {
    flex: 1,
  },
  
  aisleAgentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  aisleAgentSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  aisleAgentArrow: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  
  collectionSection: {
    marginBottom: 32,
  },
  
  collectionHeader: {
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  
  collectionHeaderContent: {
    padding: 20,
  },
  
  collectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  collectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  productsList: {
    paddingLeft: 24,
  },
  
  productCard: {
    width: 180,
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  productImage: {
    width: '100%',
    height: 140,
  },
  
  productInfo: {
    padding: 12,
  },
  
  productBrand: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '600',
    marginBottom: 4,
  },
  
  productTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
  },
  
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  productPrice: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '700',
  },
  
  ratingContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  ratingText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  
  emptyCollection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  
  bottomSpacing: {
    height: 32,
  },
});