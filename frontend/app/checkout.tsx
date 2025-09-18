import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { getCartForCheckout } from "../lib/checkout";

const API_BASE = "http://localhost:8000"; // Update with your API URL

export default function CheckoutScreen() {
  const [ready, setReady] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { deviceId, items: checkoutItems, email } = await getCartForCheckout();
        
        if (checkoutItems.length === 0) {
          Alert.alert("Empty Cart", "Add items to your cart before checkout");
          router.back();
          return;
        }
        
        // For demo, simulate payment setup
        const totalAmount = checkoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        setAmount(totalAmount);
        setItems(checkoutItems);
        setReady(true);
        
      } catch (e: any) {
        Alert.alert("Checkout setup failed", e.message || "Try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pay = async () => {
    try {
      // For demo purposes, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert("Payment Success!", "Your order has been placed successfully.");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Payment failed", error.message || "Please try again");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={styles.loadingText}>Setting up checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={StyleSheet.absoluteFill} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Purchase</Text>
          <Text style={styles.subtitle}>Review your order</Text>
        </View>

        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          {items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>Qty: {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${((item.price * item.qty) / 100).toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              ${amount ? (amount / 100).toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.paymentNote}>
            This is a demo checkout. In production, this would integrate with Stripe for secure payments.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {ready ? (
          <TouchableOpacity onPress={pay} style={styles.payButton}>
            <LinearGradient
              colors={['#a855f7', '#7c3aed']}
              style={styles.payButtonGradient}
            >
              <Text style={styles.payButtonText}>
                Pay ${amount ? (amount / 100).toFixed(2) : '0.00'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.payButton}>
            <ActivityIndicator color="#ffffff" />
          </View>
        )}
      </View>
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  
  header: {
    padding: 24,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#a855f7',
    fontWeight: '500',
  },
  
  orderSummary: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  
  itemInfo: {
    flex: 1,
  },
  
  itemName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  
  itemDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  
  itemPrice: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
  },
  
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  totalLabel: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  
  totalAmount: {
    fontSize: 20,
    color: '#f59e0b',
    fontWeight: '800',
  },
  
  paymentSection: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  
  paymentNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  
  payButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  payButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});