import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width } = Dimensions.get('window');

interface PersonalizedItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  rating: number;
  reviews: number;
  category: string;
  matchScore: number;
  reason: string;
  tags: string[];
  inStock: boolean;
  fastShipping: boolean;
}

interface RecommendationSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  items: PersonalizedItem[];
}

export default function PersonalizedFeedScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const recommendationSections: RecommendationSection[] = [
    {
      id: 'for_you',
      title: 'Picked Just for You',
      subtitle: 'Based on your browsing and purchase history',
      icon: '🎯',
      items: [
        {
          id: '1',
          title: 'Cozy Oversized Sweater',
          price: 89.99,
          originalPrice: 129.99,
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300',
          brand: 'ComfortWear',
          rating: 4.8,
          reviews: 234,
          category: 'Fashion',
          matchScore: 95,
          reason: 'Perfect for your winter style preferences',
          tags: ['Trending', 'Your Size', 'Favorite Color'],
          inStock: true,
          fastShipping: true,
        },
        {
          id: '2',
          title: 'Wireless Earbuds Pro',
          price: 159.99,
          originalPrice: 199.99,
          image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300',
          brand: 'TechSound',
          rating: 4.6,
          reviews: 1289,
          category: 'Electronics',
          matchScore: 92,
          reason: 'Matches your tech interests',
          tags: ['High Rated', 'Fast Shipping'],
          inStock: true,
          fastShipping: true,
        },
      ],
    },
    {
      id: 'trending',
      title: 'Trending Now',
      subtitle: 'What everyone is buying this week',
      icon: '🔥',
      items: [
        {
          id: '3',
          title: 'Minimalist Leather Bag',
          price: 199.99,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
          brand: 'LuxeBags',
          rating: 4.7,
          reviews: 567,
          category: 'Accessories',
          matchScore: 88,
          reason: 'Popular in your network',
          tags: ['Trending', 'Premium Quality'],
          inStock: true,
          fastShipping: false,
        },
        {
          id: '4',
          title: 'Smart Fitness Watch',
          price: 299.99,
          originalPrice: 399.99,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
          brand: 'FitTech',
          rating: 4.5,
          reviews: 892,
          category: 'Fitness',
          matchScore: 85,
          reason: 'Trending in fitness category',
          tags: ['Limited Offer', 'Health'],
          inStock: true,
          fastShipping: true,
        },
      ],
    },
    {
      id: 'similar',
      title: 'Because You Liked...',
      subtitle: 'Similar to items you previously viewed',
      icon: '🔄',
      items: [
        {
          id: '5',
          title: 'Ceramic Coffee Mug Set',
          price: 34.99,
          image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300',
          brand: 'HomeEssentials',
          rating: 4.9,
          reviews: 145,
          category: 'Home',
          matchScore: 90,
          reason: 'Similar to coffee items you viewed',
          tags: ['Highly Rated', 'Home Essentials'],
          inStock: true,
          fastShipping: true,
        },
      ],
    },
    {
      id: 'deals',
      title: 'Deals You\'ll Love',
      subtitle: 'Special offers tailored to your preferences',
      icon: '💰',
      items: [
        {
          id: '6',
          title: 'Organic Skincare Set',
          price: 79.99,
          originalPrice: 149.99,
          image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300',
          brand: 'NaturalGlow',
          rating: 4.8,
          reviews: 423,
          category: 'Beauty',
          matchScore: 87,
          reason: 'Great deal on beauty products',
          tags: ['47% Off', 'Limited Time', 'Organic'],
          inStock: true,
          fastShipping: true,
        },
        {
          id: '7',
          title: 'Premium Yoga Mat',
          price: 49.99,
          originalPrice: 89.99,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
          brand: 'ZenFit',
          rating: 4.6,
          reviews: 234,
          category: 'Fitness',
          matchScore: 84,
          reason: 'Matches your fitness interests',
          tags: ['44% Off', 'Eco-Friendly'],
          inStock: true,
          fastShipping: false,
        },
      ],
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderRecommendationSection = (section: RecommendationSection) => (
    <View key={section.id} style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>{section.icon}</Text>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsContainer}>
        {section.items.map((item) => (
          <TouchableOpacity key={item.id} style={styles.itemCard}>
            
            {/* Item Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              
              {/* Badges */}
              <View style={styles.badgesContainer}>
                {item.originalPrice && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                    </Text>
                  </View>
                )}
                {item.fastShipping && (
                  <View style={styles.shippingBadge}>
                    <Text style={styles.shippingText}>⚡ Fast</Text>
                  </View>
                )}
              </View>

              {/* Favorite Button */}
              <TouchableOpacity style={styles.favoriteButton}>
                <Text style={styles.favoriteIcon}>🤍</Text>
              </TouchableOpacity>
            </View>

            {/* Item Info */}
            <View style={styles.itemInfo}>
              <Text style={styles.brandName}>{item.brand}</Text>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
              
              {/* Rating */}
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStars}>⭐</Text>
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewCount}>({item.reviews})</Text>
              </View>

              {/* Price */}
              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>${item.price}</Text>
                {item.originalPrice && (
                  <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                )}
              </View>

              {/* Match Score & Reason */}
              <View style={styles.matchContainer}>
                <View style={styles.matchScore}>
                  <Text style={styles.matchText}>{item.matchScore}% match</Text>
                </View>
              </View>
              <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>For You</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.refreshButton}>🔄</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Personal Stats */}
        <View style={styles.personalStats}>
          <Text style={styles.statsTitle}>🎯 Your Personalized Experience</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Match Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>247</Text>
              <Text style={styles.statLabel}>Items Liked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>18</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* Recommendation Sections */}
        {recommendationSections.map(renderRecommendationSection)}

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>🧠 AI Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                You tend to shop for winter clothing on weekends and prefer sustainable brands. 
                We found 12 new eco-friendly items perfect for you!
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>📈</Text>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                Items similar to your recent purchases are 73% more likely to go out of stock. 
                Consider adding them to your wishlist!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  personalStats: {
    padding: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  section: {
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  seeAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  itemsContainer: {
    paddingLeft: 20,
  },
  itemCard: {
    width: 200,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginRight: 16,
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  itemImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shippingBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shippingText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  itemInfo: {
    marginBottom: 12,
  },
  brandName: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#CCCCCC',
    textDecorationLine: 'line-through',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchScore: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  matchText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  reasonText: {
    fontSize: 10,
    color: '#CCCCCC',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 9,
    color: '#D4AF37',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  insightsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});