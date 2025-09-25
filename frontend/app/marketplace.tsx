import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MarketplaceScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Amazon-style categories
  const categories = [
    { id: 'all', name: 'All', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'fashion', name: 'Fashion', icon: '👗' },
    { id: 'home', name: 'Home & Kitchen', icon: '🏠' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'automotive', name: 'Automotive', icon: '🚗' },
  ];

  // Amazon-style product data with AisleMarts features
  const products = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max - 256GB',
      price: 1199.99,
      originalPrice: 1299.99,
      rating: 4.8,
      reviews: 2847,
      image: 'https://via.placeholder.com/200x200/007AFF/white?text=iPhone',
      category: 'electronics',
      badge: '0% Commission',
      creatorName: '@TechReviewer',
      isAmazonChoice: false,
      isPrime: true,
      delivery: 'FREE delivery tomorrow',
      coupon: 'Save $100'
    },
    {
      id: '2', 
      title: 'Luxury Designer Handbag - Premium Leather',
      price: 289.99,
      originalPrice: 399.99,
      rating: 4.6,
      reviews: 1534,
      image: 'https://via.placeholder.com/200x200/FF69B4/white?text=Handbag',
      category: 'fashion',
      badge: 'Creator Choice',
      creatorName: '@LuxeFashion',
      isAmazonChoice: true,
      isPrime: true,
      delivery: 'FREE delivery Wed, Sep 27',
      coupon: 'Save 27%'
    },
    {
      id: '3',
      title: 'Wireless Bluetooth Headphones - Noise Cancelling',
      price: 79.99,
      originalPrice: 149.99,
      rating: 4.5,
      reviews: 8921,
      image: 'https://via.placeholder.com/200x200/000000/white?text=Headphones',
      category: 'electronics',
      badge: 'Trending',
      creatorName: '@AudioExpert',
      isAmazonChoice: false,
      isPrime: true,
      delivery: 'Get it by tomorrow',
      coupon: 'Limited time deal'
    },
    {
      id: '4',
      title: 'Smart Home Security Camera System',
      price: 159.99,
      originalPrice: 249.99,
      rating: 4.7,
      reviews: 3421,
      image: 'https://via.placeholder.com/200x200/4CAF50/white?text=Camera',
      category: 'electronics',
      badge: 'Best Seller',
      creatorName: '@SmartHomePro',
      isAmazonChoice: true,
      isPrime: true,
      delivery: 'FREE delivery today',
      coupon: 'Save $90'
    }
  ];

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => router.push('/product/' + item.id)}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.coupon && (
          <View style={styles.couponBadge}>
            <Text style={styles.couponText}>{item.coupon}</Text>
          </View>
        )}
        {item.isAmazonChoice && (
          <View style={styles.choiceBadge}>
            <Text style={styles.choiceText}>Amazon's Choice</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviews.toLocaleString()})</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>

        {/* AisleMarts Features */}
        <View style={styles.aisleMartsFeatures}>
          <Text style={styles.creatorTag}>{item.creatorName}</Text>
          <Text style={styles.badge}>{item.badge}</Text>
        </View>

        {/* Delivery & Prime */}
        {item.isPrime && (
          <View style={styles.deliveryContainer}>
            <Text style={styles.primeText}>prime</Text>
            <Text style={styles.deliveryText}>{item.delivery}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Amazon-style Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search AisleMarts"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Text style={styles.cartIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Location & Delivery */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>Deliver to New York 10001</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories Scroll */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory === category.name && styles.selectedCategory]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryText, selectedCategory === category.name && styles.selectedCategoryText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AisleMarts Special Banner */}
        <View style={styles.specialBanner}>
          <Text style={styles.bannerTitle}>🎬 Shop from Creator Stories</Text>
          <Text style={styles.bannerSubtitle}>0% Commission • Direct from Creators</Text>
          <TouchableOpacity style={styles.storiesButton} onPress={() => router.push('/(tabs)/stories')}>
            <Text style={styles.storiesButtonText}>Watch Stories</Text>
          </TouchableOpacity>
        </View>

        {/* Deal of the Day */}
        <View style={styles.dealSection}>
          <View style={styles.dealHeader}>
            <Text style={styles.dealTitle}>⚡ Deal of the Day</Text>
            <Text style={styles.dealTimer}>Ends in 14:23:45</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dealCard}>
              <Image source={{ uri: 'https://via.placeholder.com/150x150/FF5722/white?text=Deal' }} style={styles.dealImage} />
              <Text style={styles.dealPercent}>45% off</Text>
              <Text style={styles.dealPrice}>$54.99</Text>
              <Text style={styles.dealOriginalPrice}>$99.99</Text>
            </View>
            <View style={styles.dealCard}>
              <Image source={{ uri: 'https://via.placeholder.com/150x150/9C27B0/white?text=Deal' }} style={styles.dealImage} />
              <Text style={styles.dealPercent}>60% off</Text>
              <Text style={styles.dealPrice}>$39.99</Text>
              <Text style={styles.dealOriginalPrice}>$99.99</Text>
            </View>
          </ScrollView>
        </View>

        {/* Recommended for You */}
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        </View>

        {/* AisleMarts Creator Picks */}
        <View style={styles.creatorPicksSection}>
          <Text style={styles.sectionTitle}>🌟 Creator Picks</Text>
          <Text style={styles.sectionSubtitle}>Curated by top AisleMarts creators</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.slice(0, 3).map((product) => (
              <TouchableOpacity key={product.id} style={styles.creatorPickCard}>
                <Image source={{ uri: product.image }} style={styles.creatorPickImage} />
                <Text style={styles.creatorPickTitle}>{product.title}</Text>
                <Text style={styles.creatorPickCreator}>{product.creatorName}</Text>
                <Text style={styles.creatorPickPrice}>${product.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#232F3E',
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    color: '#fff',
    fontSize: 18,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  cameraButton: {
    padding: 5,
  },
  cameraIcon: {
    fontSize: 16,
  },
  cartButton: {
    padding: 10,
    position: 'relative',
  },
  cartIcon: {
    color: '#fff',
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 10,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  specialBanner: {
    backgroundColor: '#6366F1',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: '#E0E0FF',
    fontSize: 14,
    marginBottom: 10,
  },
  storiesButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  storiesButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  dealSection: {
    margin: 10,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dealTimer: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600',
  },
  dealCard: {
    marginRight: 10,
    alignItems: 'center',
  },
  dealImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  dealPercent: {
    backgroundColor: '#FF5722',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 5,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  dealOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  recommendedSection: {
    margin: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 30) / 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  couponBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  couponText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  choiceBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: '#FF9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  choiceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 12,
    color: '#333',
    marginRight: 5,
  },
  reviewCount: {
    fontSize: 12,
    color: '#007AFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B12704',
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  aisleMartsFeatures: {
    marginBottom: 5,
  },
  creatorTag: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
  },
  badge: {
    fontSize: 10,
    color: '#FF9500',
    fontWeight: '600',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primeText: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 5,
  },
  deliveryText: {
    fontSize: 11,
    color: '#333',
  },
  creatorPicksSection: {
    margin: 10,
    marginBottom: 50,
  },
  creatorPickCard: {
    width: 140,
    marginRight: 10,
    alignItems: 'center',
  },
  creatorPickImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  creatorPickTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  creatorPickCreator: {
    fontSize: 11,
    color: '#6366F1',
    marginBottom: 4,
  },
  creatorPickPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B12704',
  },
});