import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ImageBackground,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const FASHION_COLLECTIONS = [
  {
    id: 'luxury-wear',
    title: 'Luxury Wear',
    itemCount: 127,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&crop=top',
    price: 'From $299',
  },
  {
    id: 'street-style',
    title: 'Street Style',
    itemCount: 89,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&crop=center',
    price: 'From $79',
  },
  {
    id: 'formal-collection',
    title: 'Formal Collection',
    itemCount: 156,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop&crop=top',
    price: 'From $199',
  },
  {
    id: 'casual-comfort',
    title: 'Casual Comfort',
    itemCount: 234,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=800&fit=crop&crop=center',
    price: 'From $49',
  },
];

const TRENDING_ITEMS = [
  {
    id: '1',
    title: 'Designer Silk Dress',
    brand: 'Luxury Label',
    price: '$459',
    originalPrice: '$699',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop&crop=top',
    rating: 4.8,
  },
  {
    id: '2', 
    title: 'Premium Blazer Set',
    brand: 'Executive Style',
    price: '$329',
    originalPrice: '$459',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=500&fit=crop&crop=top',
    rating: 4.9,
  },
  {
    id: '3',
    title: 'Artisan Handbag',
    brand: 'Crafted Luxury',
    price: '$599',
    originalPrice: '$899',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&crop=center', 
    rating: 4.7,
  },
];

export default function FashionScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState('collections');

  const renderCollectionCard = ({ item }: { item: typeof FASHION_COLLECTIONS[0] }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => console.log(`🛍️ Viewing ${item.title} collection`)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.collectionImage}
        imageStyle={styles.collectionImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          locations={[0, 1]}
          style={styles.collectionOverlay}
        >
          <View style={styles.collectionContent}>
            <Text style={styles.collectionTitle}>{item.title}</Text>
            <Text style={styles.collectionItems}>{item.itemCount} items</Text>
            <Text style={styles.collectionPrice}>{item.price}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }: { item: typeof TRENDING_ITEMS[0] }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => console.log(`🛍️ Viewing ${item.title}`)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.trendingImage}
        imageStyle={styles.trendingImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          locations={[0.6, 1]}
          style={styles.trendingOverlay}
        >
          <View style={styles.trendingContent}>
            <Text style={styles.trendingBrand}>{item.brand}</Text>
            <Text style={styles.trendingTitle}>{item.title}</Text>
            <View style={styles.trendingPricing}>
              <Text style={styles.trendingPrice}>{item.price}</Text>
              <Text style={styles.trendingOriginalPrice}>{item.originalPrice}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#E8C968', '#D4AF37']}
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryBadgeText}>FASHION</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Luxury Style & Trends</Text>
          <Text style={styles.headerSubtitle}>Curated haute couture and designer brands</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'collections' && styles.activeTab]}
          onPress={() => setSelectedTab('collections')}
        >
          <Text style={[styles.tabText, selectedTab === 'collections' && styles.activeTabText]}>
            Collections
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'trending' && styles.activeTab]}
          onPress={() => setSelectedTab('trending')}
        >
          <Text style={[styles.tabText, selectedTab === 'trending' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'collections' ? (
          <FlatList
            data={FASHION_COLLECTIONS}
            renderItem={renderCollectionCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.collectionRow}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.collectionsGrid}
          />
        ) : (
          <FlatList
            data={TRENDING_ITEMS}
            renderItem={renderTrendingItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.trendingRow}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.trendingGrid}
          />
        )}
        
        {/* Bottom padding for safe area */}
        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E8C968',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  activeTabText: {
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  collectionsGrid: {
    paddingBottom: 24,
  },
  collectionRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  collectionCard: {
    width: (width - 64) / 2, // Account for padding and gap
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  collectionImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  collectionImageStyle: {
    borderRadius: 12,
  },
  collectionOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  collectionContent: {
    alignItems: 'flex-start',
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  collectionItems: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  collectionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8C968',
  },
  trendingGrid: {
    paddingBottom: 24,
  },
  trendingRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trendingItem: {
    width: (width - 64) / 2,
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trendingImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  trendingImageStyle: {
    borderRadius: 12,
  },
  trendingOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  trendingContent: {
    alignItems: 'flex-start',
  },
  trendingBrand: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  trendingPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendingPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C968',
  },
  trendingOriginalPrice: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
});