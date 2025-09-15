import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface BuyerOrder {
  id: string;
  order_id: string;
  created_at: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  seller: {
    name: string;
    store_name?: string;
  };
}

export default function BuyerMyOrders() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyOrders();
  }, []);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since buyer API isn't implemented yet
      setTimeout(() => {
        setOrders([
          {
            id: 'O-10023',
            order_id: 'O-10023',
            created_at: '2025-09-12T10:10:00Z',
            total: 9999,
            status: 'paid',
            seller: { name: 'My Awesome Store', store_name: 'Tech Hub Kenya' }
          },
          {
            id: 'O-10019',
            order_id: 'O-10019',
            created_at: '2025-09-10T14:20:00Z',
            total: 5499,
            status: 'delivered',
            seller: { name: 'Electronics Plus', store_name: 'Electronics Plus' }
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Load my orders error:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: BuyerOrder['status']) => {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView style={{ flex: 1, padding: theme.space.md }}>
        {/* Header */}
        <View style={{ marginBottom: theme.space.lg }}>
          <Text style={{
            color: theme.colors.text,
            fontSize: 24,
            fontWeight: '800'
          }}>
            My Orders
          </Text>
          <Text style={{
            color: theme.colors.textDim,
            marginTop: 4
          }}>
            Track your purchases and deliveries
          </Text>
        </View>

        {loading ? (
          <View style={{
            padding: theme.space.xl,
            alignItems: 'center'
          }}>
            <Text style={{ color: theme.colors.textDim }}>Loading your orders...</Text>
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
              textAlign: 'center'
            }}>
              Your orders will appear here once you make a purchase
            </Text>
          </View>
        ) : (
          orders.map(order => (
            <View
              key={order.id}
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
              
              <Text style={{
                color: theme.colors.textDim,
                fontSize: 14,
                marginBottom: theme.space.sm
              }}>
                From: {order.seller.store_name || order.seller.name}
              </Text>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{
                  color: theme.colors.textDim,
                  fontSize: 14
                }}>
                  {formatDate(order.created_at)}
                </Text>
                <Text style={{
                  color: theme.colors.text,
                  fontWeight: '700',
                  fontSize: 16
                }}>
                  KES {order.total.toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}