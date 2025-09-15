import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../theme/theme';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface OrderItem {
  product_id: string;
  title: string;
  sku?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetail {
  id: string;
  order_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  commission: number;
  seller_payout: number;
  total: number;
  payment_method: string;
  mpesa_transaction_id?: string;
  events: Array<{
    timestamp: string;
    event: string;
    description?: string;
  }>;
  created_at: string;
}

export default function SellerOrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetail(id as string);
    }
  }, [id]);

  const loadOrderDetail = async (orderId: string) => {
    try {
      setLoading(true);
      
      // Try to get real order details
      try {
        const response = await axios.get(`${API_BASE_URL}/api/seller/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.log('Order details API error:', error);
        // Use mock data
        setOrder({
          id: orderId,
          order_id: orderId,
          status: 'paid',
          customer: {
            name: 'Alice Njeri',
            email: 'alice@example.com',
            phone: '+254712345678',
            address: 'Nairobi CBD, Kenya'
          },
          items: [
            {
              product_id: 'p1',
              title: 'Wireless Earbuds X',
              sku: 'WX-100',
              quantity: 1,
              price: 2999,
              subtotal: 2999
            },
            {
              product_id: 'p2',
              title: 'Travel Charger 65W',
              sku: 'TC-65',
              quantity: 2,
              price: 1999,
              subtotal: 3998
            }
          ],
          subtotal: 6997,
          shipping: 200,
          commission: 69.97,
          seller_payout: 6927.03,
          total: 7197,
          payment_method: 'M-Pesa',
          mpesa_transaction_id: 'MPS12345',
          events: [
            {
              timestamp: '2025-09-12T10:10:00Z',
              event: 'Order placed',
              description: 'Customer placed order'
            },
            {
              timestamp: '2025-09-12T10:12:00Z',
              event: 'Payment received',
              description: 'M-Pesa payment confirmed - Receipt: MPS12345'
            }
          ],
          created_at: '2025-09-12T10:10:00Z'
        });
      }
    } catch (error) {
      console.error('Load order detail error:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: 'shipped' | 'delivered' | 'cancelled') => {
    if (!order) return;

    try {
      setUpdating(true);
      
      const response = await axios.post(`${API_BASE_URL}/api/seller/orders/${order.order_id}/status`, {
        status: newStatus,
        notes: `Order marked as ${newStatus} by seller`
      });

      if (response.data.success) {
        Alert.alert('Success', `Order ${newStatus} successfully`);
        // Refresh order details
        await loadOrderDetail(order.order_id);
      }
    } catch (error) {
      console.error('Update order status error:', error);
      Alert.alert('Error', `Failed to mark order as ${newStatus}`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: theme.colors.warning,
      paid: theme.colors.success,
      shipped: theme.colors.primary,
      delivered: theme.colors.success,
      cancelled: theme.colors.error
    };
    return statusColors[status] || theme.colors.textDim;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: theme.colors.textDim }}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: theme.colors.text }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            Order {order.order_id}
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4
          }}>
            <Text style={{
              color: theme.colors.textDim,
              marginRight: theme.space.sm
            }}>
              Status:
            </Text>
            <Text style={{
              color: getStatusColor(order.status),
              fontWeight: '700'
            }}>
              {order.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.space.md,
          marginBottom: theme.space.md
        }}>
          <Text style={{
            color: theme.colors.text,
            fontWeight: '700',
            fontSize: 16,
            marginBottom: theme.space.sm
          }}>
            Customer Details
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 16, marginBottom: 4 }}>
            {order.customer.name}
          </Text>
          {order.customer.email && (
            <Text style={{ color: theme.colors.textDim, marginBottom: 4 }}>
              {order.customer.email}
            </Text>
          )}
          {order.customer.phone && (
            <Text style={{ color: theme.colors.textDim, marginBottom: 4 }}>
              {order.customer.phone}
            </Text>
          )}
          {order.customer.address && (
            <Text style={{ color: theme.colors.textDim }}>
              {order.customer.address}
            </Text>
          )}
        </View>

        {/* Order Items */}
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.space.md,
          marginBottom: theme.space.md
        }}>
          <Text style={{
            color: theme.colors.text,
            fontWeight: '700',
            fontSize: 16,
            marginBottom: theme.space.md
          }}>
            Order Items
          </Text>
          
          {order.items.map((item, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.space.sm
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                  {item.title} {item.sku && `(${item.sku})`}
                </Text>
                <Text style={{ color: theme.colors.textDim, fontSize: 14 }}>
                  KES {item.price.toLocaleString()} × {item.quantity}
                </Text>
              </View>
              <Text style={{
                color: theme.colors.text,
                fontWeight: '700'
              }}>
                KES {item.subtotal.toLocaleString()}
              </Text>
            </View>
          ))}

          {/* Order Totals */}
          <View style={{
            height: 1,
            backgroundColor: theme.colors.textDim + '30',
            marginVertical: theme.space.md
          }} />
          
          <View style={{ gap: theme.space.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textDim }}>Subtotal:</Text>
              <Text style={{ color: theme.colors.text }}>
                KES {order.subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textDim }}>Shipping:</Text>
              <Text style={{ color: theme.colors.text }}>
                KES {order.shipping.toLocaleString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.textDim }}>Commission (1%):</Text>
              <Text style={{ color: theme.colors.warning }}>
                -KES {order.commission.toFixed(2)}
              </Text>
            </View>
            <View style={{
              height: 1,
              backgroundColor: theme.colors.textDim + '30',
              marginVertical: theme.space.sm
            }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Total:</Text>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                KES {order.total.toLocaleString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.colors.success, fontWeight: '700' }}>Your Payout:</Text>
              <Text style={{ color: theme.colors.success, fontWeight: '700' }}>
                KES {order.seller_payout.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          padding: theme.space.md,
          marginBottom: theme.space.lg
        }}>
          <Text style={{
            color: theme.colors.text,
            fontWeight: '700',
            fontSize: 16,
            marginBottom: theme.space.md
          }}>
            Order Timeline
          </Text>
          
          {order.events.map((event, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              marginBottom: theme.space.sm
            }}>
              <Text style={{ color: theme.colors.primary, marginRight: theme.space.sm }}>
                •
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                  {event.event}
                </Text>
                <Text style={{ color: theme.colors.textDim, fontSize: 12 }}>
                  {formatDate(event.timestamp)}
                </Text>
                {event.description && (
                  <Text style={{ color: theme.colors.textDim, fontSize: 14, marginTop: 2 }}>
                    {event.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        {order.status === 'paid' && (
          <View style={{
            flexDirection: 'row',
            gap: theme.space.md,
            marginBottom: theme.space.xl
          }}>
            <TouchableOpacity
              onPress={() => updateOrderStatus('shipped')}
              disabled={updating}
              style={{
                flex: 1,
                backgroundColor: updating ? theme.colors.textDim : theme.colors.primary,
                padding: theme.space.md,
                borderRadius: theme.radius.md,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: 'white',
                fontWeight: '700',
                fontSize: 16
              }}>
                {updating ? 'Updating...' : 'Mark as Shipped'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'shipped' && (
          <View style={{
            flexDirection: 'row',
            gap: theme.space.md,
            marginBottom: theme.space.xl
          }}>
            <TouchableOpacity
              onPress={() => updateOrderStatus('delivered')}
              disabled={updating}
              style={{
                flex: 1,
                backgroundColor: updating ? theme.colors.textDim : theme.colors.success,
                padding: theme.space.md,
                borderRadius: theme.radius.md,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: 'white',
                fontWeight: '700',
                fontSize: 16
              }}>
                {updating ? 'Updating...' : 'Mark as Delivered'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}