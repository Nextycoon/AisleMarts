import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import StatTile from '../components/StatTile';
import ProductListItem from '../components/ProductListItem';
import { theme } from '../theme/theme';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface SellerStats {
  revenue_30d: number;
  orders_30d: number;
  views_30d: number;
  commission_30d: number;
  average_order_value: number;
  conversion_rate: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  sku?: string;
  image_url?: string;
  active: boolean;
}

export default function SellerDashboard(){
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats>({
    revenue_30d: 0,
    orders_30d: 0,
    views_30d: 0,
    commission_30d: 0,
    average_order_value: 0,
    conversion_rate: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics summary
      try {
        const analyticsRes = await axios.get(`${API_BASE_URL}/api/seller/analytics/summary`);
        if (analyticsRes.data.success) {
          setStats(analyticsRes.data.analytics);
        }
      } catch (error) {
        console.log('Analytics error:', error);
        // Use mock data
        setStats({
          revenue_30d: 12450,
          orders_30d: 312,
          views_30d: 9821,
          commission_30d: 124.5,
          average_order_value: 39.9,
          conversion_rate: 3.2
        });
      }

      // Load products
      try {
        const productsRes = await axios.get(`${API_BASE_URL}/api/seller/products`);
        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
        }
      } catch (error) {
        console.log('Products error:', error);
        // Use mock data
        setProducts([
          {
            id: 'p1',
            title: 'Wireless Earbuds X',
            price: 2999.00,
            stock: 120,
            sku: 'WX-100',
            image_url: '',
            active: true
          },
          {
            id: 'p2',
            title: 'Noise Cancelling Headphones',
            price: 7999.00,
            stock: 45,
            sku: 'NC-200',
            image_url: '',
            active: true
          },
          {
            id: 'p3',
            title: 'Travel Charger 65W',
            price: 1999.00,
            stock: 0,
            sku: 'TC-65',
            image_url: '',
            active: false
          }
        ]);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = async (productId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/seller/products/${productId}/toggle`);
      if (response.data.success) {
        // Update local state
        setProducts(products.map(p => 
          p.id === productId ? { ...p, active: !p.active } : p
        ));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Toggle error:', error);
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const handleProductEdit = (productId: string) => {
    router.push(`/product-editor?id=${productId}`);
  };

  const handleAddProduct = () => {
    router.push('/product-editor');
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
            Seller Dashboard
          </Text>
          <Text style={{
            color: theme.colors.textDim, 
            marginTop: 4
          }}>
            Manage products, orders, and performance
          </Text>
        </View>

        {/* Stats Tiles */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: theme.space.lg }}
        >
          <StatTile 
            label="Revenue (30d)" 
            value={`KES ${stats.revenue_30d.toLocaleString()}`} 
            sub="+12% vs prev" 
          />
          <StatTile 
            label="Orders (30d)" 
            value={stats.orders_30d} 
            sub="+8%" 
          />
          <StatTile 
            label="Views (30d)" 
            value={stats.views_30d} 
            sub="+22%" 
          />
          <StatTile 
            label="Commission (1%)" 
            value={`KES ${stats.commission_30d.toFixed(2)}`} 
          />
          <StatTile 
            label="Avg Order" 
            value={`KES ${stats.average_order_value.toFixed(0)}`} 
          />
          <StatTile 
            label="Conversion" 
            value={`${stats.conversion_rate.toFixed(1)}%`} 
          />
        </ScrollView>

        {/* Products Section */}
        <View style={{
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: theme.space.md
        }}>
          <Text style={{
            color: theme.colors.text, 
            fontWeight: '700',
            fontSize: 18
          }}>
            Products ({products.length})
          </Text>
          <TouchableOpacity 
            onPress={handleAddProduct}
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.sm,
              borderRadius: theme.radius.sm
            }}
          >
            <Text style={{color: 'white', fontWeight: '600'}}>+ Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Products List */}
        {loading ? (
          <View style={{
            padding: theme.space.xl,
            alignItems: 'center'
          }}>
            <Text style={{color: theme.colors.textDim}}>Loading products...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={{
            padding: theme.space.xl,
            alignItems: 'center',
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.md
          }}>
            <Text style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 8
            }}>
              No Products Yet
            </Text>
            <Text style={{
              color: theme.colors.textDim,
              textAlign: 'center',
              marginBottom: theme.space.md
            }}>
              Start selling by adding your first product to AisleMarts
            </Text>
            <TouchableOpacity 
              onPress={handleAddProduct}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.md,
                borderRadius: theme.radius.sm
              }}
            >
              <Text style={{color: 'white', fontWeight: '600'}}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map(product => (
            <ProductListItem 
              key={product.id}
              title={product.title} 
              price={product.price} 
              stock={product.stock} 
              sku={product.sku} 
              image={product.image_url}
              active={product.active}
              onEdit={() => handleProductEdit(product.id)}
              onToggle={() => handleProductToggle(product.id)} 
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}