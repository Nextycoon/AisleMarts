import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../src/context/AuthContext';
import { useCart, CartItem } from '../src/context/CartContext';
import { API } from '../src/api/client';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to continue');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const cartItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const paymentResponse = await API.post('/checkout/payment-intent', {
        items: cartItems,
        currency: 'USD',
        shipping_address: null, // TODO: Add address collection
      });

      const { clientSecret, paymentIntentId, orderId } = paymentResponse.data;

      // Initialize payment sheet
      const initResponse = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'AisleMarts',
        style: 'alwaysDark',
      });

      if (initResponse.error) {
        throw new Error(initResponse.error.message);
      }

      // Present payment sheet
      const paymentResponse2 = await presentPaymentSheet();

      if (paymentResponse2.error) {
        if (paymentResponse2.error.code !== 'Canceled') {
          throw new Error(paymentResponse2.error.message);
        }
        return; // User canceled
      }

      // Payment successful
      Alert.alert(
        'Payment Successful!',
        'Your order has been placed successfully.',
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
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map(renderOrderItem)}
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.userInfo}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.userInfoText}>{user.name || user.email}</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="card-outline" size={20} color="white" />
              <Text style={styles.payButtonText}>
                Pay ${totalAmount.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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