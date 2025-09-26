import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, ScrollView, StyleSheet } from 'react-native';

const PRIV_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/legal/privacy-policy`;
const TOS_URL  = `${process.env.EXPO_PUBLIC_API_URL}/api/legal/terms-of-service`;

export default function Checkout() {
  const [selectedPayment, setSelectedPayment] = useState('apple-pay');
  
  const cartItems = [
    { id: 1, name: 'Designer Luxury Sofa', price: 4299, quantity: 1 },
    { id: 2, name: 'Premium Coffee Table', price: 899, quantity: 1 },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  const handlePayment = () => {
    // TODO: Implement payment processing
    console.log('Processing payment:', { selectedPayment, total });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Checkout</Text>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map(item => (
          <View key={item.id} style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
          </View>
        ))}
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${subtotal.toLocaleString()}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax</Text>
          <Text style={styles.totalValue}>${tax.toLocaleString()}</Text>
        </View>
        
        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={styles.finalTotalLabel}>Total</Text>
          <Text style={styles.finalTotalValue}>${total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity
          onPress={() => setSelectedPayment('apple-pay')}
          style={[styles.paymentOption, selectedPayment === 'apple-pay' && styles.selectedPayment]}>
          <Text style={styles.paymentText}>🍎 Apple Pay</Text>
          {selectedPayment === 'apple-pay' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedPayment('google-pay')}
          style={[styles.paymentOption, selectedPayment === 'google-pay' && styles.selectedPayment]}>
          <Text style={styles.paymentText}>📱 Google Pay</Text>
          {selectedPayment === 'google-pay' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedPayment('card')}
          style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedPayment]}>
          <Text style={styles.paymentText}>💳 Credit/Debit Card</Text>
          {selectedPayment === 'card' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      {/* Payment Button */}
      <TouchableOpacity onPress={handlePayment} style={styles.payButton}>
        <Text style={styles.payButtonText}>
          Pay ${total.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {/* Legal Footer */}
      <View style={styles.legalFooter}>
        <Text style={styles.legalText}>
          By placing this order, you agree to our{' '}
          <Text 
            style={styles.linkText} 
            onPress={() => Linking.openURL(TOS_URL)}
          >
            Terms
          </Text>
          {' & '}
          <Text 
            style={styles.linkText} 
            onPress={() => Linking.openURL(PRIV_URL)}
          >
            Privacy
          </Text>
          .
        </Text>
      </View>

      <View style={styles.securityNote}>
        <Text style={styles.securityText}>
          🔒 Your payment is secured with 256-bit SSL encryption
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 24,
    color: '#111',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#666',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedPayment: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  payButton: {
    backgroundColor: '#111',
    padding: 18,
    borderRadius: 12,
    marginTop: 16,
  },
  payButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  legalFooter: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legalText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#007AFF',
  },
  securityNote: {
    marginTop: 12,
    alignItems: 'center',
  },
  securityText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
  },
});