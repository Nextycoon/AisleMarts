import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Application from 'expo-application';
import { CartItem, hydrateCart, saveLocalCart } from '../lib/cart';

export default function EnhancedCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    const initCart = async () => {
      const id = Application.androidId ?? Application.applicationId ?? 'web-demo';
      setDeviceId(id);
      
      try {
        const items = await hydrateCart(id);
        setCartItems(items);
      } catch (error) {
        console.error('Failed to initialize cart:', error);
      } finally {
        setLoading(false);
      }
    };

    initCart();
  }, []);

  const addItem = async (productId: string, qty: number = 1) => {
    try {
      const response = await fetch("http://localhost:8000/api/cart/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Device-Id": deviceId 
        },
        body: JSON.stringify({ productId, qty })
      });
      
      const data = await response.json();
      if (data.ok) {
        setCartItems(data.items);
        await saveLocalCart(data.items);
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const clearCart = async () => {
    try {
      await fetch("http://localhost:8000/api/cart/clear", {
        method: "POST",
        headers: { "X-Device-Id": deviceId }
      });
      
      setCartItems([]);
      await saveLocalCart([]);
      Alert.alert('Success', 'Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      Alert.alert('Error', 'Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Cart</Text>
        <Text style={styles.subtitle}>Persistent & Synced</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addItem("lm001", 1)}
          >
            <Text style={styles.addButtonText}>Add Demo Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.itemsContainer}>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Text style={styles.itemText}>
                Product: {item.productId}
              </Text>
              <Text style={styles.qtyText}>
                Qty: {item.qty}
              </Text>
            </View>
          ))}
          
          <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
            <Text style={styles.clearButtonText}>Clear Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
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
  loadingText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  itemsContainer: {
    paddingHorizontal: 24,
  },
  cartItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  qtyText: {
    color: '#a855f7',
    fontSize: 14,
    marginTop: 4,
  },
  clearButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});