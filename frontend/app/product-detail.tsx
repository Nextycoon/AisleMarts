import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category: string;
  seller_name: string;
  seller_tier: string;
  rating: number;
  review_count: number;
  media: Array<{
    url: string;
    type: string;
  }>;
  variants: ProductVariant[];
  views: number;
  conversion_rate: number;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const apiBase = process.env.EXPO_PUBLIC_SHOP_API_BASE || 'http://localhost:8001/api/shop';
  const infeedCheckoutEnabled = process.env.EXPO_PUBLIC_INFEED_CHECKOUT === '1';
  const zeroCommission = process.env.EXPO_PUBLIC_ZERO_COMMISSION === '1';

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/products/${productId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setProduct(data.product);
      
      // Set first variant as default
      if (data.product.variants && data.product.variants.length > 0) {
        setSelectedVariant(data.product.variants[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      Alert.alert('Error', 'Failed to load product details.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [apiBase, productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    
    try {
      const response = await fetch(`${apiBase}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariant.id,
          quantity: quantity
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      Alert.alert('Success', 'Added to cart!', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/cart') }
      ]);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add to cart. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant || !infeedCheckoutEnabled) {
      handleAddToCart();
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const response = await fetch(`${apiBase}/checkout/mini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariant.id,
          quantity: quantity,
          source: 'pdp'
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const sessionData = await response.json();
      setShowCheckoutModal(true);
    } catch (error) {
      console.error('Failed to create checkout:', error);
      Alert.alert('Error', 'Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckoutComplete = async () => {
    setCheckoutLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`${apiBase}/checkout/demo_session/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'sandbox_success'
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      
      setShowCheckoutModal(false);
      Alert.alert('Order Complete! 🎉', `Order #${result.order_id}\nTotal: $${result.total}`, [
        { text: 'Continue Shopping', onPress: () => router.push('/shop') }
      ]);
    } catch (error) {
      console.error('Checkout failed:', error);
      Alert.alert('Payment Failed', 'Please try again or use a different payment method.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🛍️ Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.shareIcon}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(index);
            }}
          >
            {product.media.map((media, index) => (
              <Image
                key={index}
                source={{ uri: media.url }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          {product.media.length > 1 && (
            <View style={styles.imageIndicators}>
              {product.media.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === selectedImageIndex && styles.activeImageIndicator
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Badges */}
          {product.compare_at_price && product.compare_at_price > currentPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((product.compare_at_price - currentPrice) / product.compare_at_price) * 100)}% OFF
              </Text>
            </View>
          )}
          
          {product.seller_tier === 'gold' && (
            <View style={styles.goldBadge}>
              <Text style={styles.goldBadgeText}>👑 Gold Seller</Text>
            </View>
          )}
          
          {product.seller_tier === 'diamond' && (
            <View style={styles.diamondBadge}>
              <Text style={styles.diamondBadgeText}>💎 Diamond Seller</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${currentPrice.toFixed(2)}</Text>
            {product.compare_at_price && product.compare_at_price > currentPrice && (
              <Text style={styles.originalPrice}>${product.compare_at_price.toFixed(2)}</Text>
            )}
          </View>
          
          <View style={styles.sellerRow}>
            <Text style={styles.sellerName}>Sold by {product.seller_name}</Text>
            {zeroCommission && (
              <View style={styles.zeroCommissionBadge}>
                <Text style={styles.zeroCommissionText}>0% Commission</Text>
              </View>
            )}
          </View>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({product.review_count} reviews)</Text>
            </View>
            <Text style={styles.conversionRate}>{product.conversion_rate.toFixed(1)}% conversion rate</Text>
          </View>
        </View>

        {/* Variants */}
        {product.variants.length > 1 && (
          <View style={styles.variantsSection}>
            <Text style={styles.sectionTitle}>Options</Text>
            <View style={styles.variantsList}>
              {product.variants.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantButton,
                    selectedVariant?.id === variant.id && styles.selectedVariantButton,
                    variant.stock === 0 && styles.outOfStockVariant
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                >
                  <Text style={[
                    styles.variantText,
                    selectedVariant?.id === variant.id && styles.selectedVariantText,
                    variant.stock === 0 && styles.outOfStockVariantText
                  ]}>
                    {variant.title}
                  </Text>
                  {variant.price !== product.price && (
                    <Text style={styles.variantPrice}>${variant.price.toFixed(2)}</Text>
                  )}
                  {variant.stock === 0 && (
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quantity */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#333"} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
              disabled={selectedVariant ? quantity >= selectedVariant.stock : false}
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          {selectedVariant && (
            <Text style={styles.stockText}>
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{product.views.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{product.conversion_rate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Conversion</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{product.review_count}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.addToCartButton, !inStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={!inStock}
        >
          <Ionicons name="bag-add" size={20} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.buyNowButton, !inStock && styles.disabledButton]}
          onPress={handleBuyNow}
          disabled={!inStock || checkoutLoading}
        >
          <Text style={styles.buyNowText}>
            {checkoutLoading ? '...' : infeedCheckoutEnabled ? 'Buy Now' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mini Checkout Modal */}
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCheckoutModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quick Checkout</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.checkoutContent}>
            <Text style={styles.checkoutTitle}>🛍️ Ready to purchase?</Text>
            
            <View style={styles.checkoutItem}>
              <Image source={{ uri: product.media[0]?.url }} style={styles.checkoutImage} />
              <View style={styles.checkoutItemInfo}>
                <Text style={styles.checkoutItemTitle}>{product.title}</Text>
                <Text style={styles.checkoutItemVariant}>{selectedVariant?.title}</Text>
                <Text style={styles.checkoutItemPrice}>${(currentPrice * quantity).toFixed(2)}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.completeCheckoutButton}
              onPress={handleCheckoutComplete}
              disabled={checkoutLoading}
            >
              <Text style={styles.completeCheckoutText}>
                {checkoutLoading ? 'Processing...' : `Pay $${(currentPrice * quantity).toFixed(2)}`}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.checkoutNote}>
              💳 Sandbox payment - No real charges will be made
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareIcon: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: '#f5f5f5',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeImageIndicator: {
    backgroundColor: '#fff',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goldBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goldBadgeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  diamondBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(185, 242, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  diamondBadgeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    color: '#666',
  },
  zeroCommissionBadge: {
    backgroundColor: '#e7f3ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  zeroCommissionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#999',
  },
  conversionRate: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  variantsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  variantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantButton: {
    borderWidth: 2,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedVariantButton: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  outOfStockVariant: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  variantText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedVariantText: {
    color: '#007AFF',
  },
  outOfStockVariantText: {
    color: '#999',
  },
  variantPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  outOfStockText: {
    fontSize: 10,
    color: '#ff4444',
    marginTop: 2,
  },
  quantitySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#666',
  },
  descriptionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginBottom: 80, // Space for bottom actions
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
  },
  addToCartText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutContent: {
    flex: 1,
    padding: 16,
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  checkoutItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  checkoutImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  checkoutItemInfo: {
    flex: 1,
  },
  checkoutItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  checkoutItemVariant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  checkoutItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  completeCheckoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completeCheckoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});