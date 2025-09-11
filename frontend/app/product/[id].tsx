import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { API } from '../../src/api/client';
import { Product } from '../../src/types';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to load product:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to add items to your cart',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    if (!product) return;

    if (product.stock < quantity) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    addItem({
      product_id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      quantity,
      image: product.images[0],
    });

    Alert.alert('Success', 'Item added to cart!', [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => router.push('/cart') },
    ]);
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          {product.images[0] ? (
            <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={64} color="#ccc" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>
            ${product.price.toFixed(2)} {product.currency}
          </Text>

          <View style={styles.stockContainer}>
            <Ionicons
              name={product.stock > 0 ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={product.stock > 0 ? '#34C759' : '#FF3B30'}
            />
            <Text style={[styles.stockText, { color: product.stock > 0 ? '#34C759' : '#FF3B30' }]}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {/* Attributes */}
          {Object.keys(product.attributes).length > 0 && (
            <View style={styles.attributesContainer}>
              <Text style={styles.attributesTitle}>Product Details</Text>
              {Object.entries(product.attributes).map(([key, value]) => (
                <View key={key} style={styles.attributeRow}>
                  <Text style={styles.attributeKey}>{key}:</Text>
                  <Text style={styles.attributeValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={quantity <= 1 ? '#ccc' : '#007AFF'} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => adjustQuantity(1)}
                  disabled={quantity >= product.stock}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={quantity >= product.stock ? '#ccc' : '#007AFF'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      {product.stock > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 16,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  attributesContainer: {
    marginBottom: 24,
  },
  attributesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  attributeRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attributeKey: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
    textTransform: 'capitalize',
  },
  attributeValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 32,
    textAlign: 'center',
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});