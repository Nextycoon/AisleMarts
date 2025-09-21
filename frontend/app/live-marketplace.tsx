import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width, height } = Dimensions.get('window');

interface LiveProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  originalPrice: number;
  discount: number;
  city: string;
  country: string;
  timeLeft: number;
  viewers: number;
  orders: number;
  category: string;
  trending: boolean;
}

interface MarketMetrics {
  totalValue: number;
  activeDeals: number;
  liveVendors: number;
  globalSavings: number;
}

export default function LiveMarketplaceScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([]);
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics>({
    totalValue: 0,
    activeDeals: 0,
    liveVendors: 0,
    globalSavings: 0
  });
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate components in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Load initial data
    loadLiveData();
    
    // Setup real-time updates
    const interval = setInterval(updateLiveData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLiveData = () => {
    // Generate live products
    const products: LiveProduct[] = [
      {
        id: '1',
        name: 'Designer Handbag Collection',
        vendor: 'Milano Luxury',
        price: 1247,
        originalPrice: 1850,
        discount: 33,
        city: 'Milan',
        country: 'Italy',
        timeLeft: 1847,
        viewers: 2847,
        orders: 67,
        category: 'Fashion',
        trending: true
      },
      {
        id: '2',
        name: 'Smart Home Bundle',
        vendor: 'Tokyo Tech',
        price: 899,
        originalPrice: 1299,
        discount: 31,
        city: 'Tokyo',
        country: 'Japan',
        timeLeft: 3247,
        viewers: 1542,
        orders: 34,
        category: 'Tech',
        trending: false
      },
      {
        id: '3',
        name: 'Sustainable Fashion Set',
        vendor: 'EcoStyle Stockholm',
        price: 450,
        originalPrice: 650,
        discount: 31,
        city: 'Stockholm',
        country: 'Sweden',
        timeLeft: 2134,
        viewers: 987,
        orders: 23,
        category: 'Sustainable',
        trending: true
      },
      {
        id: '4',
        name: 'Artisan Jewelry',
        vendor: 'Dubai Gold',
        price: 2340,
        originalPrice: 3200,
        discount: 27,
        city: 'Dubai',
        country: 'UAE',
        timeLeft: 4567,
        viewers: 3421,
        orders: 89,
        category: 'Jewelry',
        trending: true
      }
    ];

    const metrics: MarketMetrics = {
      totalValue: 125000000,
      activeDeals: 15647,
      liveVendors: 8934,
      globalSavings: 28500000
    };

    setLiveProducts(products);
    setMarketMetrics(metrics);
  };

  const updateLiveData = () => {
    // Update metrics with slight variations to simulate real-time
    setMarketMetrics(prev => ({
      totalValue: prev.totalValue + Math.floor(Math.random() * 50000 - 25000),
      activeDeals: prev.activeDeals + Math.floor(Math.random() * 20 - 10),
      liveVendors: prev.liveVendors + Math.floor(Math.random() * 10 - 5),
      globalSavings: prev.globalSavings + Math.floor(Math.random() * 5000)
    }));

    // Update products
    setLiveProducts(prev => prev.map(product => ({
      ...product,
      timeLeft: Math.max(0, product.timeLeft - 2),
      viewers: product.viewers + Math.floor(Math.random() * 20 - 10),
      orders: product.orders + (Math.random() > 0.8 ? 1 : 0)
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadLiveData();
    setRefreshing(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const renderMetricCard = (title: string, value: string, subtitle: string, color: string) => (
    <Animated.View 
      style={[
        styles.metricCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.metricGradient}
      >
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderLiveProduct = (product: LiveProduct) => (
    <Animated.View
      key={product.id}
      style={[
        styles.productCard,
        { opacity: fadeAnim }
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.productGradient}
      >
        {product.trending && (
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingText}>🔥 TRENDING</Text>
          </View>
        )}
        
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productVendor}>{product.vendor}</Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationText}>📍 {product.city}, {product.country}</Text>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.currentPrice}>${product.price.toLocaleString()}</Text>
            <Text style={styles.originalPrice}>${product.originalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}% OFF</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatNumber(product.viewers)}</Text>
            <Text style={styles.statLabel}>Watching</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{product.orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(product.timeLeft)}</Text>
            <Text style={styles.statLabel}>Time Left</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.quickBuyButton}>
          <LinearGradient
            colors={['#D4AF37', '#E8C968']}
            style={styles.buyButtonGradient}
          >
            <Text style={styles.buyButtonText}>Quick Buy - 0% Commission</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Live Marketplace</Text>
          <Text style={styles.headerSubtitle}>Real-time global deals • 0% Commission</Text>
        </View>
        <View style={styles.liveIndicator}>
          <Animated.View 
            style={[
              styles.liveDot,
              { transform: [{ scale: pulseAnim }] }
            ]}
          />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Market Metrics */}
        <Animated.View style={[styles.metricsSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Global Market Pulse</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Total Market Value',
              `$${formatNumber(marketMetrics.totalValue)}`,
              'Live global transactions',
              '#4ECDC4'
            )}
            {renderMetricCard(
              'Active Deals',
              formatNumber(marketMetrics.activeDeals),
              'Real-time offers',
              '#45B7D1'
            )}
            {renderMetricCard(
              'Live Vendors',
              formatNumber(marketMetrics.liveVendors),
              'Selling right now',
              '#96CEB4'
            )}
            {renderMetricCard(
              'Global Savings',
              `$${formatNumber(marketMetrics.globalSavings)}`,
              'Commission-free savings',
              '#FFEAA7'
            )}
          </View>
        </Animated.View>

        {/* Live Products */}
        <Animated.View style={[styles.productsSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Live Deals Now</Text>
          <Text style={styles.sectionSubtitle}>Vendors keep 100% • Real-time global marketplace</Text>
          
          {liveProducts.map(renderLiveProduct)}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TabNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginRight: 6,
  },
  liveText: {
    color: '#FF6B6B',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  metricsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 16,
    alignItems: 'center',
  },
  metricTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    textAlign: 'center',
  },
  productsSection: {
    paddingHorizontal: 20,
  },
  productCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productGradient: {
    padding: 20,
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  productHeader: {
    marginBottom: 12,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productVendor: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  categoryText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPrice: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  originalPrice: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  quickBuyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});