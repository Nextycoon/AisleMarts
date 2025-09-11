import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { API } from '../src/api/client';
import { Order } from '../src/types';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await API.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      Alert.alert('Error', 'Failed to load your orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#34C759';
      case 'created':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      case 'refunded':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'checkmark-circle';
      case 'created':
        return 'time';
      case 'failed':
        return 'close-circle';
      case 'refunded':
        return 'return-up-back';
      default:
        return 'help-circle';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons
            name={getStatusIcon(item.status)}
            size={12}
            color="white"
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            {orderItem.quantity}× {orderItem.title}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItemsText}>
            +{item.items.length - 2} more item{item.items.length - 2 > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>
          ${item.subtotal.toFixed(2)} {item.currency}
        </Text>
        <Text style={styles.itemCount}>
          {item.items.reduce((total, item) => total + item.quantity, 0)} item
          {item.items.reduce((total, item) => total + item.quantity, 0) !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authRequiredContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredSubtitle}>
            Please sign in to view your orders
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            When you place your first order, it will appear here
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.continueButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.orderCount}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  orderCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
});