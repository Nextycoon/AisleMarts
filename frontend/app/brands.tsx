import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';
import FloatingAIAssistant from '../src/components/FloatingAIAssistant';

interface Brand {
  id: string;
  name: string;
  category: string;
  followers: string;
  verified: boolean;
  featured: boolean;
  description: string;
}

export default function BrandsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'trending' | 'featured' | 'all'>('trending');

  const mockBrands: Brand[] = [
    {
      id: '1',
      name: 'LuxeFashion',
      category: 'Fashion',
      followers: '2.3M',
      verified: true,
      featured: true,
      description: 'Premium fashion and luxury lifestyle'
    },
    {
      id: '2',
      name: 'TechGear Pro',
      category: 'Electronics',
      followers: '1.8M',
      verified: true,
      featured: true,
      description: 'Latest technology and gadgets'
    },
    {
      id: '3',
      name: 'HomeStyle',
      category: 'Home & Decor',
      followers: '950K',
      verified: true,
      featured: false,
      description: 'Modern home decor and furniture'
    },
    {
      id: '4',
      name: 'FitLife',
      category: 'Fitness',
      followers: '1.2M',
      verified: true,
      featured: true,
      description: 'Fitness gear and healthy lifestyle'
    },
    {
      id: '5',
      name: 'FoodieWorld',
      category: 'Food & Beverage',
      followers: '3.1M',
      verified: true,
      featured: true,
      description: 'Premium food and beverage brands'
    },
  ];

  const handleBrandPress = (brandId: string) => {
    router.push(`/brand/${brandId}`);
  };

  const renderBrand = ({ item }: { item: Brand }) => (
    <TouchableOpacity 
      style={styles.brandCard}
      onPress={() => handleBrandPress(item.id)}
    >
      <View style={styles.brandHeader}>
        <View style={styles.brandAvatar}>
          <Text style={styles.brandAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.brandInfo}>
          <View style={styles.brandNameRow}>
            <Text style={styles.brandName}>{item.name}</Text>
            {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
            {item.featured && <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>}
          </View>
          <Text style={styles.brandCategory}>{item.category}</Text>
          <Text style={styles.brandDescription}>{item.description}</Text>
          <Text style={styles.brandFollowers}>{item.followers} followers</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.followBrandButton}>
        <Text style={styles.followBrandText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Brands</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
          onPress={() => setActiveTab('trending')}
        >
          <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'featured' && styles.tabActive]}
          onPress={() => setActiveTab('featured')}
        >
          <Text style={[styles.tabText, activeTab === 'featured' && styles.tabTextActive]}>
            Featured
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All Brands
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={mockBrands.filter(brand => 
          activeTab === 'all' ? true : 
          activeTab === 'featured' ? brand.featured : true
        )}
        renderItem={renderBrand}
        keyExtractor={(item) => item.id}
        style={styles.brandsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.brandsListContent}
      />

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  brandsList: {
    flex: 1,
  },
  brandsListContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brandCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  brandAvatarText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '700',
  },
  brandInfo: {
    flex: 1,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  verifiedBadge: {
    color: '#1DA1F2',
    fontSize: 18,
    marginRight: 8,
  },
  featuredBadge: {
    backgroundColor: '#ff0050',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  brandCategory: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  brandDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  brandFollowers: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  followBrandButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  followBrandText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
});