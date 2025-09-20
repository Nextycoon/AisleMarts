import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CurrencyProvider } from '../lib/currency/CurrencyProvider';
import CurrencySwitcher from '../components/currency/CurrencySwitcher';
import PriceDual from '../components/currency/PriceDual';
import LiveCurrencyDisplay from '../components/currency/LiveCurrencyDisplay';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Demo luxury products with different base currencies
const LUXURY_PRODUCTS = [
  { id: 1, name: 'Milan Designer Bag', price: 2400, currency: 'EUR', category: '👜 Fashion', location: 'Milano, Italy' },
  { id: 2, name: 'Tokyo Premium Watch', price: 520000, currency: 'JPY', category: '⌚ Watches', location: 'Tokyo, Japan' },
  { id: 3, name: 'Dubai Gold Jewelry', price: 3500, currency: 'AED', category: '💎 Jewelry', location: 'Dubai, UAE' },
  { id: 4, name: 'NYC Designer Jacket', price: 1800, currency: 'USD', category: '👕 Fashion', location: 'New York, USA' },
  { id: 5, name: 'Istanbul Silk Scarf', price: 42000, currency: 'TRY', category: '🧣 Accessories', location: 'Istanbul, Turkey' },
  { id: 6, name: 'Paris Luxury Fragrance', price: 280, currency: 'EUR', category: '🌸 Beauty', location: 'Paris, France' },
  { id: 7, name: 'London Cashmere Coat', price: 950, currency: 'GBP', category: '🧥 Fashion', location: 'London, UK' },
  { id: 8, name: 'Seoul Tech Gadget', price: 890000, currency: 'KRW', category: '📱 Tech', location: 'Seoul, South Korea' },
  { id: 9, name: 'Mumbai Artisan Jewelry', price: 45000, currency: 'INR', category: '💍 Jewelry', location: 'Mumbai, India' },
];

export default function CurrencyFusionDashboard() {
  return (
    <CurrencyProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={['#0f0f23', '#1a1a2e', '#16213e', '#581c87']}
          style={StyleSheet.absoluteFill}
        />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.headerBadge}>
              <Text style={styles.badgeText}>🌍 AisleMarts • The Digital Lifestyle Universe</Text>
            </View>
            
            <Text style={styles.title}>Currency-Fusion Dashboard</Text>
            <Text style={styles.subtitle}>
              Live FX • Dual Display • Global Auto-Detection
            </Text>
          </View>

          {/* Live Currency Status */}
          <LiveCurrencyDisplay />

          {/* Currency Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💱 Currency Controls</Text>
            <CurrencySwitcher />
          </View>

          {/* Live Product Showcase */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Global Luxury Catalog</Text>
            <Text style={styles.sectionSubtitle}>
              Prices automatically converted to your preferred currency
            </Text>
            
            <View style={styles.productGrid}>
              {LUXURY_PRODUCTS.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={styles.productLocation}>{product.location}</Text>
                  </View>
                  
                  <Text style={styles.productName}>{product.name}</Text>
                  
                  <View style={styles.priceContainer}>
                    <PriceDual 
                      amount={product.price} 
                      code={product.currency}
                      style={styles.productPrice}
                    />
                  </View>
                  
                  <TouchableOpacity style={styles.addToCartButton}>
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Currency Engine Info */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>🌍 Currency-Infinity Engine</Text>
            <Text style={styles.footerText}>
              • 180+ ISO currencies supported{'\n'}
              • Real-time exchange rates{'\n'}
              • Automatic location detection{'\n'}
              • Cultural number formatting{'\n'}
              • Regional lazy-loading for performance
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </CurrencyProvider>
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
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  headerBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  productGrid: {
    gap: 16,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  productLocation: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 16,
  },
  productPrice: {
    // Styles handled by PriceDual component
  },
  addToCartButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 16,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    textAlign: 'left',
  },
});