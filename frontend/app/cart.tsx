import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCurrency } from '../lib/currency/CurrencyProvider';
import EnhancedPriceDual from '../components/currency/EnhancedPriceDual';
import CurrencyObservability from '../components/currency/CurrencyObservability';

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  currency: string;
  quantity: number;
  image?: string;
  category: string;
}

export default function CartScreen() {
  const { prefs, convert, format, lastUpdated } = useCurrency();
  
  // Mock cart items with global currencies
  const [cartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Milan Designer Handbag',
      brand: 'Bottega Veneta',
      price: 2800,
      originalPrice: 3200,
      currency: 'EUR',
      quantity: 1,
      category: 'handbags',
    },
    {
      id: '2',
      name: 'Tokyo Premium Watch',
      brand: 'Citizen',
      price: 85000,
      currency: 'JPY',
      quantity: 1,
      category: 'watches',
    },
    {
      id: '3',
      name: 'Dubai Gold Necklace',
      brand: 'Damas',
      price: 4500,
      currency: 'AED',
      quantity: 2,
      category: 'jewelry',
    },
  ]);

  // Calculate totals in canonical currencies (avoid rounding drift)
  const calculateTotals = () => {
    let totalUSD = 0;
    const itemTotals: Array<{ item: CartItem; totalCanonical: number; totalPrimary: number }> = [];

    cartItems.forEach(item => {
      const canonicalTotal = item.price * item.quantity;
      const convertedToPrimary = convert(canonicalTotal, item.currency, prefs.primary) || 0;
      
      itemTotals.push({
        item,
        totalCanonical: canonicalTotal,
        totalPrimary: convertedToPrimary,
      });

      // Convert to USD for grand total calculation
      const usdTotal = convert(canonicalTotal, item.currency, 'USD') || 0;
      totalUSD += usdTotal;
    });

    const grandTotalPrimary = convert(totalUSD, 'USD', prefs.primary) || 0;
    const grandTotalSecondary = prefs.secondary ? convert(totalUSD, 'USD', prefs.secondary) : null;

    return {
      itemTotals,
      grandTotalUSD: totalUSD,
      grandTotalPrimary,
      grandTotalSecondary,
    };
  };

  const totals = calculateTotals();

  const getFXAgeDisplay = (): string => {
    if (!lastUpdated) return 'Never updated';
    const ageMinutes = Math.floor((Date.now() - lastUpdated) / 60000);
    if (ageMinutes < 1) return 'Just now';
    if (ageMinutes < 60) return `${ageMinutes}m ago`;
    const ageHours = Math.floor(ageMinutes / 60);
    return `${ageHours}h ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Shopping Cart</Text>
          <Text style={styles.subtitle}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • 
            Currency-Infinity Engine Active
          </Text>
        </View>

        {/* Observability Panel */}
        <CurrencyObservability />

        {/* Cart Items */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>🛍️ Cart Items</Text>
          
          {cartItems.map((item, index) => {
            const itemTotal = totals.itemTotals[index];
            
            return (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemImageContainer}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderText}>📦</Text>
                    </View>
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  
                  <View style={styles.itemPricing}>
                    <EnhancedPriceDual
                      amount={item.price}
                      code={item.currency}
                      originalPrice={item.originalPrice}
                      showFXAge={false}
                      fxMarginBps={90}
                    />
                    
                    {item.quantity > 1 && (
                      <View style={styles.totalPricing}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <EnhancedPriceDual
                          amount={itemTotal.totalCanonical}
                          code={item.currency}
                          showFXAge={false}
                          fxMarginBps={90}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📊 Order Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({prefs.primary}):</Text>
              <Text style={styles.summaryValue}>
                {format(totals.grandTotalPrimary, prefs.primary)}
              </Text>
            </View>
            
            {prefs.secondary && totals.grandTotalSecondary && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({prefs.secondary}):</Text>
                <Text style={styles.summaryValue}>
                  {format(totals.grandTotalSecondary, prefs.secondary)}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Base Total (USD):</Text>
              <Text style={styles.summaryValue}>
                ${totals.grandTotalUSD.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.fxInfoRow}>
              <Text style={styles.fxInfoText}>
                💱 FX Rates refreshed: {getFXAgeDisplay()}
              </Text>
              <Text style={styles.fxInfoText}>
                🏦 Retail FX margin: +0.90%
              </Text>
            </View>
          </View>
        </View>

        {/* Checkout Button */}
        <View style={styles.checkoutSection}>
          <TouchableOpacity style={styles.checkoutButton}>
            <LinearGradient
              colors={['#D4AF37', '#E8C968']}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutText}>
                Proceed to Checkout • {format(totals.grandTotalPrimary, prefs.primary)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.checkoutNote}>
            🔒 Secure checkout with dual-currency totals
          </Text>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  cartSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  itemPricing: {
    flex: 1,
  },
  totalPricing: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  summarySection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fxInfoRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
  },
  fxInfoText: {
    fontSize: 11,
    color: 'rgba(212, 175, 55, 0.8)',
    marginBottom: 4,
    textAlign: 'center',
  },
  checkoutSection: {
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  checkoutButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  checkoutGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  checkoutNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});