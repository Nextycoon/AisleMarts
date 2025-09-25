import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Product {
  id: string;
  title: string;
  price: number;
  compare_at_price?: number;
  seller_name: string;
  seller_tier: string;
  media: Array<{
    url: string;
    type: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    stock: number;
  }>;
}

interface ShoppableVideoOverlayProps {
  videoId: string;
  visible?: boolean;
  onClose?: () => void;
  onProductSelect?: (productId: string) => void;
}

export default function ShoppableVideoOverlay({ 
  videoId, 
  visible = false, 
  onClose,
  onProductSelect 
}: ShoppableVideoOverlayProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMiniCheckout, setShowMiniCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const apiBase = process.env.EXPO_PUBLIC_SHOP_API_BASE || 'http://localhost:8001/api/shop';
  const infeedCheckoutEnabled = process.env.EXPO_PUBLIC_INFEED_CHECKOUT === '1';

  useEffect(() => {
    if (visible && videoId) {
      fetchVideoProducts();
    }
  }, [visible, videoId]);

  const fetchVideoProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/videos/${videoId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch video products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductTap = (product: Product) => {
    setSelectedProduct(product);
    if (infeedCheckoutEnabled) {
      setShowMiniCheckout(true);
    } else {
      onProductSelect?.(product.id);
      onClose?.();
    }
  };

  const handleQuickBuy = async () => {
    if (!selectedProduct) return;
    
    setCheckoutLoading(true);
    try {
      // Create mini-checkout session
      const response = await fetch(`${apiBase}/checkout/mini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          variant_id: selectedProduct.variants[0]?.id,
          quantity: 1,
          source: 'feed',
          video_id: videoId
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const completeResponse = await fetch(`${apiBase}/checkout/demo_session/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'sandbox_success' })
      });
      
      if (completeResponse.ok) {
        const result = await completeResponse.json();
        Alert.alert('Purchase Complete! 🎉', `Order #${result.order_id}\nTotal: $${result.total}`, [
          { text: 'Continue Watching', onPress: () => {
            setShowMiniCheckout(false);
            onClose?.();
          }}
        ]);
      }
    } catch (error) {
      console.error('Quick buy failed:', error);
      Alert.alert('Purchase Failed', 'Please try again or add to cart.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    
    try {
      const response = await fetch(`${apiBase}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          variant_id: selectedProduct.variants[0]?.id,
          quantity: 1
        })
      });
      
      if (response.ok) {
        Alert.alert('Added to Cart! 🛒', `${selectedProduct.title} added to your cart.`, [
          { text: 'Continue', onPress: () => {
            setShowMiniCheckout(false);
            onClose?.();
          }}
        ]);
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
      Alert.alert('Error', 'Failed to add to cart.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={onClose}
          activeOpacity={1}
        />
        
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="bag-outline" size={24} color="#333" />
              <Text style={styles.headerTitle}>Featured in this video</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Products List */}
          <ScrollView 
            style={styles.productsContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🔍 Finding products...</Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>😅 No products tagged in this video</Text>
              </View>
            ) : (
              products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductTap(product)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: product.media[0]?.url || 'https://via.placeholder.com/80x80/CCCCCC/FFF?text=No+Image' }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    
                    <View style={styles.priceRow}>
                      <Text style={styles.currentPrice}>${product.price.toFixed(2)}</Text>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <Text style={styles.originalPrice}>${product.compare_at_price.toFixed(2)}</Text>
                      )}
                    </View>
                    
                    <Text style={styles.sellerName}>{product.seller_name}</Text>
                    
                    {product.seller_tier === 'gold' && (
                      <View style={styles.goldBadge}>
                        <Text style={styles.goldBadgeText}>👑 Gold</Text>
                      </View>
                    )}
                    
                    {product.seller_tier === 'diamond' && (
                      <View style={styles.diamondBadge}>
                        <Text style={styles.diamondBadgeText}>💎 Diamond</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.actionButton}>
                    <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Mini Checkout Modal */}
        {showMiniCheckout && selectedProduct && (
          <Modal
            visible={showMiniCheckout}
            transparent
            animationType="fade"
            onRequestClose={() => setShowMiniCheckout(false)}
          >
            <View style={styles.checkoutOverlay}>
              <View style={styles.checkoutContainer}>
                <View style={styles.checkoutHeader}>
                  <Text style={styles.checkoutTitle}>Quick Purchase</Text>
                  <TouchableOpacity onPress={() => setShowMiniCheckout(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.checkoutProduct}>
                  <Image 
                    source={{ uri: selectedProduct.media[0]?.url }} 
                    style={styles.checkoutProductImage}
                  />
                  <View style={styles.checkoutProductInfo}>
                    <Text style={styles.checkoutProductTitle}>{selectedProduct.title}</Text>
                    <Text style={styles.checkoutProductPrice}>${selectedProduct.price.toFixed(2)}</Text>
                    <Text style={styles.checkoutProductSeller}>{selectedProduct.seller_name}</Text>
                  </View>
                </View>
                
                <View style={styles.checkoutActions}>
                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={handleAddToCart}
                  >
                    <Ionicons name="bag-add-outline" size={18} color="#007AFF" />
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.quickBuyBtn, checkoutLoading && styles.disabledBtn]}
                    onPress={handleQuickBuy}
                    disabled={checkoutLoading}
                  >
                    <Text style={styles.quickBuyText}>
                      {checkoutLoading ? 'Processing...' : 'Buy Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.checkoutNote}>
                  💳 Sandbox mode - No real charges
                </Text>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
    minHeight: screenHeight * 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  sellerName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  goldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  goldBadgeText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  diamondBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(185, 242, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diamondBadgeText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
  },
  checkoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutProduct: {
    flexDirection: 'row',
    padding: 20,
  },
  checkoutProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  checkoutProductInfo: {
    flex: 1,
    marginLeft: 16,
  },
  checkoutProductTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  checkoutProductPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  checkoutProductSeller: {
    fontSize: 12,
    color: '#666',
  },
  checkoutActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  addToCartText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  quickBuyBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBuyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  checkoutNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingBottom: 20,
    fontStyle: 'italic',
  },
});