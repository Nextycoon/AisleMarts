import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../theme/theme';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface Order {
  id: string;
  order_id: string;
  created_at: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  customer: {
    name: string;
    phone?: string;
  };
}

export default function SellerOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Try to get real orders
      try {
        const response = await axios.get(`${API_BASE_URL}/api/seller/orders`);
        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.log('Orders API error:', error);
        // Use mock data for now
        setOrders([
          {
            id: 'O-10023',
            order_id: 'O-10023',
            created_at: '2025-09-12T10:10:00Z',
            total: 9999,
            status: 'paid',
            customer: { name: 'Alice Njeri', phone: '+254712345678' }
          },
          {
            id: 'O-10024',
            order_id: 'O-10024',
            created_at: '2025-09-11T15:30:00Z',
            total: 3999,
            status: 'shipped',
            customer: { name: 'Brian Otieno', phone: '+254723456789' }
          },
          {
            id: 'O-10025',
            order_id: 'O-10025',
            created_at: '2025-09-10T09:45:00Z',
            total: 22900,
            status: 'pending',
            customer: { name: 'Catherine Kamau', phone: '+254734567890' }
          }
        ]);
      }
    } catch (error) {
      console.error('Load orders error:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: theme.colors.warning, bg: theme.colors.warning + '20' },
      paid: { color: theme.colors.success, bg: theme.colors.success + '20' },
      shipped: { color: theme.colors.primary, bg: theme.colors.primary + '20' },
      delivered: { color: theme.colors.success, bg: theme.colors.success + '30' },
      cancelled: { color: theme.colors.error, bg: theme.colors.error + '20' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <View style={{
        backgroundColor: config.bg,
        paddingHorizontal: theme.space.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.sm
      }}>
        <Text style={{
          color: config.color,
          fontWeight: '700',
          fontSize: 12
        }}>
          {status.toUpperCase()}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleOrderPress = (order: Order) => {
    router.push(`/seller-order-detail?id=${order.order_id}`);
  };

  const handleCreateDemoOrder = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/seller/orders/demo`);
      if (response.data.success) {
        Alert.alert('Success', 'Demo order created successfully');
        loadOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Create demo order error:', error);
      Alert.alert('Error', 'Failed to create demo order');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView style={{ flex: 1, padding: theme.space.md }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.space.lg
        }}>
          <View>
            <Text style={{
              color: theme.colors.text,
              fontSize: 24,
              fontWeight: '800'
            }}>
              Orders
            </Text>
            <Text style={{
              color: theme.colors.textDim,
              marginTop: 4
            }}>
              Manage customer orders and deliveries
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCreateDemoOrder}
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.sm,
              borderRadius: theme.radius.sm
            }}
          >
            <Text style={{
              color: 'white',
              fontWeight: '600',
              fontSize: 12
            }}>
              + Demo Order
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{
            padding: theme.space.xl,
            alignItems: 'center'
          }}>
            <Text style={{ color: theme.colors.textDim }}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.md,
            padding: theme.space.xl,
            alignItems: 'center'
          }}>
            <Text style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 8
            }}>
              No Orders Yet
            </Text>
            <Text style={{
              color: theme.colors.textDim,
              textAlign: 'center',
              marginBottom: theme.space.md
            }}>
              Orders from customers will appear here
            </Text>
            <TouchableOpacity
              onPress={handleCreateDemoOrder}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.md,
                borderRadius: theme.radius.sm
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Create Demo Order</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map(order => (
            <TouchableOpacity
              key={order.id}
              onPress={() => handleOrderPress(order)}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: theme.radius.md,
                padding: theme.space.md,
                marginBottom: theme.space.sm
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.space.sm
              }}>
                <Text style={{
                  color: theme.colors.text,
                  fontWeight: '700',
                  fontSize: 16
                }}>
                  {order.order_id}
                </Text>
                {getStatusBadge(order.status)}
              </View>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View>
                  <Text style={{
                    color: theme.colors.textDim,
                    fontSize: 14
                  }}>
                    {order.customer.name} • {formatDate(order.created_at)}
                  </Text>
                </View>
                <Text style={{
                  color: theme.colors.text,
                  fontWeight: '700',
                  fontSize: 16
                }}>
                  KES {order.total.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}