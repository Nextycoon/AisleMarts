import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useCart, CartItem } from '../src/context/CartContext';
import { API } from '../src/api/client';
import { 
  paymentsTaxService, 
  EnhancedPaymentIntent,
  PaymentMethod,
  TaxCalculation 
} from '../src/services/PaymentsTaxService';
import { 
  PaymentMethodCard, 
  TaxBreakdown, 
  FraudAssessmentCard, 
  AIInsightsCard 
} from '../src/components/PaymentsComponents';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<EnhancedPaymentIntent | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [userCountry, setUserCountry] = useState('US'); // Default to US
  const [userCurrency, setCurrency] = useState('USD'); // Default to USD
  const [optimizationFocus, setOptimizationFocus] = useState<'cost' | 'speed' | 'security'>('cost');

  useEffect(() => {
    if (user && items.length > 0) {
      loadPaymentData();
    }
  }, [user, items, userCountry, userCurrency, optimizationFocus]);

  const loadPaymentData = async () => {
    if (!user || items.length === 0) return;

    setLoading(true);
    try {
      // Convert cart items to the format expected by the API
      const apiItems = items.map(item => ({
        sku: item.product_id,
        category: 'electronics', // Default category - in production this would come from product data
        price: item.price,
        quantity: item.quantity,
      }));

      const intent = await paymentsTaxService.createEnhancedPaymentIntent(
        apiItems,
        userCountry,
        userCurrency,
        'B2C', // Assuming B2C for now
        undefined,
        optimizationFocus
      );

      setPaymentIntent(intent);
      
      // Auto-select the best payment method
      if (intent.payment_methods.methods.length > 0) {
        setSelectedPaymentMethod(intent.payment_methods.methods[0]);
      }
    } catch (error: any) {
      console.error('Failed to load payment data:', error);
      Alert.alert(
        'Payment Setup Error',
        'Failed to load payment options. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user || !paymentIntent || !selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Check fraud assessment
    if (paymentIntent.fraud_assessment.action === 'block') {
      Alert.alert(
        'Payment Blocked',
        'This transaction has been flagged for security reasons. Please contact support.',
        [{ text: 'OK', onPress: () => router.replace('/profile') }]
      );
      return;
    }

    if (paymentIntent.fraud_assessment.action === 'require_verification') {
      Alert.alert(
        'Verification Required',
        'Additional verification is required for this transaction. Please contact support to complete your purchase.',
        [{ text: 'Contact Support', onPress: () => router.replace('/profile') }]
      );
      return;
    }

    // For web platform, show a message that payment is not supported
    if (Platform.OS === 'web') {
      Alert.alert(
        'Payment Not Available',
        `Payment processing is only available on mobile devices. 

Selected Method: ${selectedPaymentMethod.display_name}
Total: $${paymentIntent.total_with_tax.toFixed(2)}
Tax: $${paymentIntent.tax_calculation.total_tax.toFixed(2)}

Please use the mobile app to complete your purchase.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/cart'),
          },
        ]
      );
      return;
    }

    setLoading(true);

    try {
      // Create payment intent with the original API (enhanced with tax calculation)
      const cartItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const paymentResponse = await API.post('/checkout/payment-intent', {
        items: cartItems,
        currency: userCurrency,
        shipping_address: null,
        // Add enhanced payment data
        selected_payment_method: selectedPaymentMethod.processor,
        tax_amount: paymentIntent.tax_calculation.total_tax,
        country: userCountry,
      });

      const { clientSecret, paymentIntentId, orderId } = paymentResponse.data;

      // For now, just simulate successful payment
      Alert.alert(
        'Payment Successful!',
        `Your order has been placed successfully.

Payment Method: ${selectedPaymentMethod.display_name}
Subtotal: $${paymentIntent.subtotal.toFixed(2)}
Tax: $${paymentIntent.tax_calculation.total_tax.toFixed(2)}
Total: $${paymentIntent.total_with_tax.toFixed(2)}`,
        [
          {
            text: 'View Order',
            onPress: () => {
              clearCart();
              router.replace('/orders');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Unable to process payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = (item: CartItem) => (
    <View key={item.product_id} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemDetails}>
          Qty: {item.quantity} × ${item.price.toFixed(2)}
        </Text>
      </View>
      <Text style={styles.itemTotal}>
        ${(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  const renderCountrySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Billing Country</Text>
      <View style={styles.countryOptions}>
        {['US', 'GB', 'TR', 'DE', 'JP'].map(country => (
          <TouchableOpacity
            key={country}
            style={[
              styles.countryOption,
              userCountry === country && styles.countryOptionSelected
            ]}
            onPress={() => setUserCountry(country)}
          >
            <Text style={[
              styles.countryOptionText,
              userCountry === country && styles.countryOptionTextSelected
            ]}>
              {country}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOptimizationSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Optimize For</Text>
      <View style={styles.countryOptions}>
        {[
          { key: 'cost', label: '💰 Cost', icon: 'cash-outline' },
          { key: 'speed', label: '⚡ Speed', icon: 'flash-outline' },
          { key: 'security', label: '🛡️ Security', icon: 'shield-outline' }
        ].map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optimizationOption,
              optimizationFocus === option.key && styles.countryOptionSelected
            ]}
            onPress={() => setOptimizationFocus(option.key as any)}
          >
            <Text style={[
              styles.countryOptionText,
              optimizationFocus === option.key && styles.countryOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequiredContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredSubtitle}>
            Please sign in to proceed with checkout
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Country and Optimization Selectors */}
        {renderCountrySelector()}
        {renderOptimizationSelector()}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map(renderOrderItem)}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading payment options...</Text>
          </View>
        ) : paymentIntent ? (
          <>
            {/* Tax Breakdown */}
            <TaxBreakdown 
              taxCalculation={paymentIntent.tax_calculation}
              subtotal={paymentIntent.subtotal}
            />

            {/* Fraud Assessment */}
            <FraudAssessmentCard assessment={paymentIntent.fraud_assessment} />

            {/* Payment Methods */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              {paymentIntent.payment_methods.methods.map((method, index) => (
                <PaymentMethodCard
                  key={index}
                  method={method}
                  selected={selectedPaymentMethod?.display_name === method.display_name}
                  onSelect={() => setSelectedPaymentMethod(method)}
                />
              ))}
            </View>

            {/* AI Insights */}
            <AIInsightsCard
              title="Payment Insights"
              insights={paymentIntent.payment_methods.ai_insights}
              icon="card-outline"
            />

            {/* Currency Conversion (if applicable) */}
            {paymentIntent.currency_conversion && (
              <AIInsightsCard
                title="Currency Conversion"
                insights={`${paymentIntent.currency_conversion.amount} ${paymentIntent.currency_conversion.from_currency} = ${paymentIntent.currency_conversion.converted_amount} ${paymentIntent.currency_conversion.to_currency} (Rate: ${paymentIntent.currency_conversion.rate}). ${paymentIntent.currency_conversion.ai_insights}`}
                icon="repeat-outline"
              />
            )}

            {/* User Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.userInfo}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <Text style={styles.userInfoText}>{user.name || user.email}</Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Pay Button */}
      {paymentIntent && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.payButton, 
              (loading || !selectedPaymentMethod || paymentIntent.fraud_assessment.action === 'block') && styles.payButtonDisabled
            ]}
            onPress={handlePayment}
            disabled={loading || !selectedPaymentMethod || paymentIntent.fraud_assessment.action === 'block'}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="white" />
                <Text style={styles.payButtonText}>
                  Pay ${paymentIntent.total_with_tax.toFixed(2)}
                </Text>
              </>
            )}
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  authRequiredSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});