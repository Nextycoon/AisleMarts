import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { API } from '../src/api/client';
import { Product, Category } from '../src/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories'),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const params: any = { q: searchQuery };
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }
      const response = await API.get('/products', { params });
      setProducts(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    try {
      setLoading(true);
      const params: any = {};
      if (categoryId) {
        params.category_id = categoryId;
      }
      if (searchQuery.trim()) {
        params.q = searchQuery;
      }
      const response = await API.get('/products', { params });
      setProducts(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      {item.images[0] && (
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productPrice}>
          ${item.price.toFixed(2)} {item.currency}
        </Text>
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipSelected,
      ]}
      onPress={() => filterByCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome to AisleMarts</Text>
          {user && <Text style={styles.userText}>Hello, {user.name || user.email}</Text>}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchProducts}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchProducts}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipSelected,
              ]}
              onPress={() => filterByCategory(null)}
            >
              <Text
                style={[
                  styles.categoryText,
                  !selectedCategory && styles.categoryTextSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <View key={category.id}>
                {renderCategory({ item: category })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productGrid}
            />
          ) : (
            <Text style={styles.emptyText}>No products found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginLeft: 16,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextSelected: {
    color: 'white',
  },
  productsSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
    minHeight: 400,
  },
  productGrid: {
    paddingHorizontal: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#888',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
});