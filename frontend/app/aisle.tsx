import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface FeaturedBrand {
  id: string;
  name: string;
  handle: string;
  image: string;
  followers: string;
  verified: boolean;
}

interface TrendingProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  localPrice: number;
  currency: string;
  localCurrency: string;
  image: string;
  discount?: number;
}

export default function AisleScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Category[] = [
    { id: '1', name: 'Fashion', icon: '👗', color: '#FF6B6B' },
    { id: '2', name: 'Tech', icon: '📱', color: '#4ECDC4' },
    { id: '3', name: 'Home', icon: '🏠', color: '#45B7D1' },
    { id: '4', name: 'Beauty', icon: '💄', color: '#F7DC6F' },
    { id: '5', name: 'Sports', icon: '⚽', color: '#BB8FCE' },
    { id: '6', name: 'Food', icon: '🍕', color: '#F8C471' },
    { id: '7', name: 'Travel', icon: '✈️', color: '#85C1E9' },
    { id: '8', name: 'Art', icon: '🎨', color: '#F1948A' },
  ];

  const featuredBrands: FeaturedBrand[] = [
    {
      id: '1',
      name: 'LuxeFashion',
      handle: '@luxefashion',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
      followers: '2.4M',
      verified: true,
    },
    {
      id: '2',
      name: 'TechWorld',
      handle: '@techworld',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
      followers: '1.8M',
      verified: true,
    },
    {
      id: '3',
      name: 'EcoHome',
      handle: '@ecohome',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
      followers: '957K',
      verified: true,
    },
    {
      id: '4',
      name: 'SportZone',
      handle: '@sportzone',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
      followers: '1.2M',
      verified: true,
    },
  ];

  const trendingProducts: TrendingProduct[] = [
    {
      id: '1',
      name: 'Wireless Headphones Pro',
      brand: '@techworld',
      price: 299.99,
      localPrice: 254.99,
      currency: 'USD',
      localCurrency: 'EUR',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      discount: 20,
    },
    {
      id: '2',
      name: 'Designer Handbag',
      brand: '@luxefashion',
      price: 899.99,
      localPrice: 764.99,
      currency: 'USD',
      localCurrency: 'EUR',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
    },
    {
      id: '3',
      name: 'Smart Home Speaker',
      brand: '@ecohome',
      price: 149.99,
      localPrice: 127.49,
      currency: 'USD',
      localCurrency: 'EUR',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=300',
      discount: 15,
    },
    {
      id: '4',
      name: 'Running Shoes Elite',
      brand: '@sportzone',
      price: 179.99,
      localPrice: 152.99,
      currency: 'USD',
      localCurrency: 'EUR',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🛍️ AisleMarts</Text>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationText}>📍 Berlin, DE</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, brands, or creators..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearButton}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.liveButton}
            onPress={() => router.push('/live-commerce')}
          >
            <Text style={styles.liveIcon}>🔴</Text>
            <Text style={styles.liveText}>Live Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.nearbyButton}
            onPress={() => router.push('/nearby')}
          >
            <Text style={styles.nearbyIcon}>📍</Text>
            <Text style={styles.nearbyText}>Nearby Stores</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dealsButton}
            onPress={() => router.push('/categories')}
          >
            <Text style={styles.dealsIcon}>⚡</Text>
            <Text style={styles.dealsText}>Flash Deals</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity 
                key={category.id} 
                style={[styles.categoryCard, { borderColor: category.color }]}
                onPress={() => router.push(`/categories/${category.name.toLowerCase()}`)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Brands */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Brands</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandsScroll}>
            {featuredBrands.map(brand => (
              <TouchableOpacity 
                key={brand.id} 
                style={styles.brandCard}
                onPress={() => router.push(`/store-profile?brand=${brand.handle}`)}
              >
                <Image source={{ uri: brand.image }} style={styles.brandImage} />
                <View style={styles.brandInfo}>
                  <View style={styles.brandNameRow}>
                    <Text style={styles.brandName}>{brand.name}</Text>
                    {brand.verified && <Text style={styles.verifiedIcon}>✓</Text>}
                  </View>
                  <Text style={styles.brandHandle}>{brand.handle}</Text>
                  <Text style={styles.brandFollowers}>{brand.followers} followers</Text>
                </View>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.productsGrid}>
            {trendingProducts.map(product => (
              <TouchableOpacity 
                key={product.id} 
                style={styles.productCard}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  {product.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{product.discount}%</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.likeButton}>
                    <Text style={styles.likeIcon}>🤍</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>
                      {product.localCurrency} {product.localPrice.toFixed(2)}
                    </Text>
                    <Text style={styles.originalPrice}>
                      {product.currency} {product.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.addToCartButton}>
                  <Text style={styles.addToCartText}>🛒</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Made in Germany */}
        <View style={styles.section}>
          <View style={styles.countryBanner}>
            <Text style={styles.countryFlag}>🇩🇪</Text>
            <View style={styles.countryInfo}>
              <Text style={styles.countryTitle}>Made in Germany</Text>
              <Text style={styles.countrySubtitle}>Premium quality from local creators</Text>
            </View>
            <TouchableOpacity style={styles.exploreCountryButton}>
              <Text style={styles.exploreCountryText}>Explore</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Mall */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.globalMallBanner}>
            <View style={styles.globalMallContent}>
              <Text style={styles.globalMallIcon}>🌍</Text>
              <View style={styles.globalMallInfo}>
                <Text style={styles.globalMallTitle}>AisleMarts Global Mall</Text>
                <Text style={styles.globalMallSubtitle}>
                  185 currencies • 47 countries • Millions of products
                </Text>
              </View>
              <Text style={styles.globalMallArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
  },
  locationButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  locationText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    color: '#999999',
    fontSize: 20,
    fontWeight: '300',
  },
  filterButton: {
    backgroundColor: '#D4AF37',
    padding: 12,
    borderRadius: 12,
  },
  filterIcon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  liveButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  liveIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  nearbyButton: {
    flex: 1,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  nearbyIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  nearbyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dealsButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  dealsIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  dealsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllButton: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: (width - 40 - 36) / 4, // Account for padding and gaps
    aspectRatio: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  brandsScroll: {
    paddingHorizontal: 20,
  },
  brandCard: {
    width: 160,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  brandImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    alignSelf: 'center',
  },
  brandInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedIcon: {
    color: '#D4AF37',
    fontSize: 12,
    marginLeft: 4,
  },
  brandHandle: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 4,
  },
  brandFollowers: {
    color: '#CCCCCC',
    fontSize: 11,
  },
  followButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: {
    fontSize: 16,
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    color: '#D4AF37',
    fontSize: 12,
    marginBottom: 4,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: 12,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  originalPrice: {
    color: '#999999',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: 16,
  },
  countryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  countrySubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  exploreCountryButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreCountryText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  globalMallBanner: {
    marginHorizontal: 20,
  },
  globalMallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  globalMallIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  globalMallInfo: {
    flex: 1,
  },
  globalMallTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  globalMallSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  globalMallArrow: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 100,
  },
});