/**
 * Offers Comparison Sheet
 * Modal bottom sheet for comparing product offers from different merchants
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { 
  searchService, 
  Offer, 
  OffersResponse,
  formatPrice, 
  getDeliveryText, 
  getTrustLevelText 
} from '../services/SearchService';

// ============= INTERFACES =============

interface OffersSheetProps {
  productId: string | null;
  productTitle?: string;
  isVisible: boolean;
  onClose: () => void;
  onOfferSelect?: (offer: Offer) => void;
}

interface OfferCardProps {
  offer: Offer;
  isSelected?: boolean;
  onPress?: () => void;
  onAddToCart?: () => void;
  language?: string;
}

interface MerchantInfoProps {
  merchant: Offer['merchant'];
  language?: string;
}

// ============= OFFERS SHEET COMPONENT =============

export const OffersSheet: React.FC<OffersSheetProps> = ({
  productId,
  productTitle,
  isVisible,
  onClose,
  onOfferSelect
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'delivery' | 'trust'>('price');
  
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Load offers when sheet opens
  useEffect(() => {
    if (isVisible && productId) {
      loadOffers();
    }
  }, [isVisible, productId]);

  const loadOffers = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response: OffersResponse = await searchService.getProductOffers(productId);
      setOffers(response.offers);
      
      if (response.offers.length === 0) {
        setError('No offers available for this product');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const getSortedOffers = () => {
    const sorted = [...offers];
    
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price_minor - b.price_minor);
      case 'delivery':
        return sorted.sort((a, b) => a.delivery_days - b.delivery_days);
      case 'trust':
        return sorted.sort((a, b) => b.merchant.trust_score - a.merchant.trust_score);
      default:
        return sorted;
    }
  };

  const handleOfferSelect = (offer: Offer) => {
    setSelectedOfferId(offer.id);
    onOfferSelect?.(offer);
  };

  const handleAddToCart = (offer: Offer) => {
    // TODO: Integrate with cart context
    Alert.alert(
      'Add to Cart',
      `Add ${productTitle} from ${offer.merchant.name} for ${formatPrice(offer.price_minor, offer.currency)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => console.log('Added to cart:', offer) }
      ]
    );
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        
        <View style={[styles.sheetContainer, { marginTop: screenHeight * 0.2 }]}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.headerContent}>
              <View style={styles.dragHandle} />
              <View style={styles.titleContainer}>
                <Ionicons name="storefront" size={20} color="#3B82F6" />
                <Text style={styles.title}>Compare Offers</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {productTitle && (
              <Text style={styles.productTitle} numberOfLines={2}>
                {productTitle}
              </Text>
            )}
            
            {/* Sort Options */}
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <View style={styles.sortButtons}>
                {(['price', 'delivery', 'trust'] as const).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    onPress={() => setSortBy(sort)}
                    style={[
                      styles.sortButton,
                      sortBy === sort && styles.sortButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.sortButtonText,
                      sortBy === sort && styles.sortButtonTextActive
                    ]}>
                      {sort === 'price' ? '💰 Price' : 
                       sort === 'delivery' ? '⚡ Delivery' : '🛡️ Trust'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading offers...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={loadOffers} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && offers.length > 0 && (
              <>
                <View style={styles.offersHeader}>
                  <Text style={styles.offersCount}>
                    {offers.length} offer{offers.length !== 1 ? 's' : ''} available
                  </Text>
                  <View style={styles.bestOfferIndicator}>
                    <Ionicons name="trophy" size={16} color="#F59E0B" />
                    <Text style={styles.bestOfferText}>Best offer first</Text>
                  </View>
                </View>

                {getSortedOffers().map((offer, index) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    isSelected={selectedOfferId === offer.id}
                    onPress={() => handleOfferSelect(offer)}
                    onAddToCart={() => handleAddToCart(offer)}
                  />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ============= OFFER CARD COMPONENT =============

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  isSelected = false,
  onPress,
  onAddToCart,
  language = 'en'
}) => {
  const totalLandedCost = offer.price_minor + (offer.delivery_days * 100); // Simple approximation
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.offerCard,
        isSelected && styles.offerCardSelected
      ]}
      activeOpacity={0.8}
    >
      {/* Best Deal Badge */}
      {totalLandedCost === Math.min(...[offer].map(o => o.price_minor + (o.delivery_days * 100))) && (
        <View style={styles.bestDealBadge}>
          <Ionicons name="trophy" size={12} color="#FFFFFF" />
          <Text style={styles.bestDealText}>Best Deal</Text>
        </View>
      )}

      <View style={styles.offerHeader}>
        <MerchantInfo merchant={offer.merchant} language={language} />
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {formatPrice(offer.price_minor, offer.currency)}
          </Text>
          <Text style={styles.condition}>
            {offer.condition === 'new' ? '✨ New' : 
             offer.condition === 'used' ? '♻️ Used' : '🔧 Refurb'}
          </Text>
        </View>
      </View>

      <View style={styles.offerDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {getDeliveryText(offer.delivery_days, language)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="cube" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {offer.stock > 0 ? `${offer.stock} in stock` : 'Out of stock'}
          </Text>
        </View>
        
        {offer.attrs && Object.keys(offer.attrs).length > 0 && (
          <View style={styles.detailItem}>
            <Ionicons name="information-circle" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {Object.entries(offer.attrs).map(([key, value]) => `${key}: ${value}`).join(', ')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.offerActions}>
        <View style={styles.totalCostContainer}>
          <Text style={styles.totalCostLabel}>Total landed cost:</Text>
          <Text style={styles.totalCostValue}>
            {formatPrice(totalLandedCost, offer.currency)}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={onAddToCart}
          style={[
            styles.addToCartButton,
            offer.stock === 0 && styles.addToCartButtonDisabled
          ]}
          disabled={offer.stock === 0}
        >
          <Ionicons 
            name="cart" 
            size={16} 
            color={offer.stock === 0 ? "#9CA3AF" : "#FFFFFF"} 
          />
          <Text style={[
            styles.addToCartText,
            offer.stock === 0 && styles.addToCartTextDisabled
          ]}>
            {offer.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ============= MERCHANT INFO COMPONENT =============

const MerchantInfo: React.FC<MerchantInfoProps> = ({
  merchant,
  language = 'en'
}) => {
  const getVerificationIcon = () => {
    switch (merchant.verification_status) {
      case 'verified':
        return <Ionicons name="checkmark-circle" size={16} color="#10B981" />;
      case 'pending':
        return <Ionicons name="time" size={16} color="#F59E0B" />;
      case 'suspended':
        return <Ionicons name="alert-circle" size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.merchantInfo}>
      <View style={styles.merchantHeader}>
        <Text style={styles.merchantName}>{merchant.name}</Text>
        {getVerificationIcon()}
      </View>
      
      <View style={styles.merchantDetails}>
        <View style={styles.trustScore}>
          <Ionicons name="shield-checkmark" size={14} color="#3B82F6" />
          <Text style={styles.trustText}>
            {getTrustLevelText(merchant.trust_score, language)}
          </Text>
          <Text style={styles.trustValue}>
            ({(merchant.trust_score * 100).toFixed(0)}%)
          </Text>
        </View>
        
        <View style={styles.merchantType}>
          <Text style={styles.typeText}>
            {merchant.type === 'retail' ? '🏪 Retail' :
             merchant.type === 'wholesale' ? '🏭 Wholesale' :
             merchant.type === 'factory' ? '🏭 Factory' : '🌾 Farm'}
          </Text>
          {merchant.country && (
            <Text style={styles.countryText}>
              📍 {merchant.country}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// ============= STYLES =============

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  // Header Styles
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dragHandle: {
    position: 'absolute',
    top: -24,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  productTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  
  // Sort Styles
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  sortButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Offers Styles
  offersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  offersCount: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  bestOfferIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bestOfferText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  
  // Offer Card Styles
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 8,
    padding: 16,
  },
  offerCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  bestDealBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bestDealText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Offer Header
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  condition: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // Merchant Info
  merchantInfo: {
    flex: 1,
    marginRight: 16,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  merchantDetails: {
    gap: 4,
  },
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  trustValue: {
    fontSize: 11,
    color: '#6B7280',
  },
  merchantType: {
    flexDirection: 'row',
    gap: 8,
  },
  typeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  countryText: {
    fontSize: 11,
    color: '#6B7280',
  },
  
  // Offer Details
  offerDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  
  // Offer Actions
  offerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalCostContainer: {
    flex: 1,
  },
  totalCostLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  totalCostValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addToCartTextDisabled: {
    color: '#9CA3AF',
  },
});