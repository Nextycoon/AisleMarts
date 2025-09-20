/**
 * Enhanced Product Card with Currency-Infinity Engine Integration
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EnhancedPriceDual from '../../components/currency/EnhancedPriceDual';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with 16px margins

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image?: string;
  category: string;
  rating?: number;
  isLiked?: boolean;
  isNew?: boolean;
  discount?: number;
  availability: 'in-stock' | 'limited' | 'pre-order' | 'sold-out';
}

interface EnhancedProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onLike?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  style?: any;
}

export default function EnhancedProductCard({
  product,
  onPress,
  onLike,
  onAddToCart,
  style,
}: EnhancedProductCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLike = () => {
    // Heart animation
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onLike?.(product);
  };

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      SGD: 'S$',
    };
    return `${currencySymbols[currency] || currency}${price.toLocaleString()}`;
  };

  const getAvailabilityColor = () => {
    switch (product.availability) {
      case 'in-stock': return '#4ade80';
      case 'limited': return '#f59e0b';
      case 'pre-order': return '#3b82f6';
      case 'sold-out': return '#f87171';
      default: return '#6b7280';
    }
  };

  const getAvailabilityText = () => {
    switch (product.availability) {
      case 'in-stock': return 'In Stock';
      case 'limited': return 'Limited';
      case 'pre-order': return 'Pre-Order';
      case 'sold-out': return 'Sold Out';
      default: return '';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress?.(product)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.card}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.cardGradient}
        />

        {/* Image container */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📦</Text>
            </View>
          )}

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {product.isNew && (
              <View style={[styles.badge, styles.newBadge]}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
            {product.discount && (
              <View style={[styles.badge, styles.discountBadge]}>
                <Text style={styles.badgeText}>-{product.discount}%</Text>
              </View>
            )}
          </View>

          {/* Like button */}
          <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <Text style={[
                styles.heartIcon,
                { color: product.isLiked ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)' }
              ]}>
                {product.isLiked ? '❤️' : '🤍'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Brand */}
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>

          {/* Product name */}
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </Text>
              <Text style={styles.ratingText}>({product.rating})</Text>
            </View>
          )}

          {/* Price with Currency-Infinity Engine */}
          <View style={styles.priceContainer}>
            <EnhancedPriceDual
              amount={product.price}
              code={product.currency}
              originalPrice={product.originalPrice}
              showFXAge={true}
              fxMarginBps={90} // 0.90% retail FX margin
              style={styles.priceDual}
            />
          </View>

          {/* Availability */}
          <View style={styles.availabilityContainer}>
            <View style={[
              styles.availabilityDot,
              { backgroundColor: getAvailabilityColor() }
            ]} />
            <Text style={[
              styles.availabilityText,
              { color: getAvailabilityColor() }
            ]}>
              {getAvailabilityText()}
            </Text>
          </View>
        </View>

        {/* Add to cart button */}
        <TouchableOpacity
          onPress={() => onAddToCart?.(product)}
          style={[
            styles.addToCartButton,
            product.availability === 'sold-out' && styles.disabledButton
          ]}
          disabled={product.availability === 'sold-out'}
        >
          <LinearGradient
            colors={product.availability === 'sold-out' 
              ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
              : ['#D4AF37', '#E8C968']
            }
            style={styles.addToCartGradient}
          >
            <Text style={[
              styles.addToCartText,
              product.availability === 'sold-out' && styles.disabledText
            ]}>
              {product.availability === 'sold-out' ? 'Sold Out' : 
               product.availability === 'pre-order' ? 'Pre-Order' : 'Add to Cart'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  imageContainer: {
    height: CARD_WIDTH * 0.8,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 32,
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadge: {
    backgroundColor: '#4ade80',
  },
  discountBadge: {
    backgroundColor: '#ff6b6b',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 16,
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingStars: {
    fontSize: 12,
    color: '#D4AF37',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceDual: {
    // EnhancedPriceDual handles its own styling
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '500',
  },
  addToCartButton: {
    margin: 12,
    marginTop: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addToCartGradient: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});