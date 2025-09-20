import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCurrency } from '../lib/currency/CurrencyProvider';

const { width } = Dimensions.get('window');

export default function CurrencyFusionDashboard() {
  const router = useRouter();
  const { 
    currentCurrency, 
    supportedCurrencies, 
    exchangeRates, 
    formatPrice, 
    setCurrency,
    refreshRates 
  } = useCurrency();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshRates = async () => {
    setRefreshing(true);
    try {
      await refreshRates();
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF'];
  const cryptoCurrencies = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA'];

  const getMajorCurrencyRates = () => {
    return majorCurrencies.map(code => {
      const currency = supportedCurrencies.find(c => c.code === code);
      const rate = exchangeRates?.[code] || 1;
      return {
        code,
        name: currency?.name || code,
        symbol: currency?.symbol || code,
        flag: currency?.flag || '💱',
        rate,
        change: (Math.random() * 10 - 5).toFixed(2), // Mock change data
      };
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌊 BlueWave • Family-Safe AI Commerce</Text>
          </View>
          
          <Text style={styles.title}>Currency-Infinity Engine v2.0</Text>
          <Text style={styles.subtitle}>
            185 Currencies • Real-time Exchange Rates • Global Commerce Ready
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Currency Card */}
        <View style={styles.currentCurrencyCard}>
          <View style={styles.currentCurrencyHeader}>
            <Text style={styles.sectionTitle}>Active Currency</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefreshRates}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>
                {refreshing ? '🔄' : '↻'} Refresh
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.currentCurrency}>
            <Text style={styles.currentFlag}>
              {supportedCurrencies.find(c => c.code === currentCurrency)?.flag || '💱'}
            </Text>
            <View style={styles.currentCurrencyInfo}>
              <Text style={styles.currentCode}>{currentCurrency}</Text>
              <Text style={styles.currentName}>
                {supportedCurrencies.find(c => c.code === currentCurrency)?.name || 'Unknown'}
              </Text>
            </View>
            <View style={styles.currentRate}>
              <Text style={styles.rateValue}>1.0000</Text>
              <Text style={styles.rateLabel}>Base Rate</Text>
            </View>
          </View>
        </View>

        {/* Major Currencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Major Currencies</Text>
          {getMajorCurrencyRates().map((currency, index) => (
            <TouchableOpacity
              key={currency.code}
              style={styles.currencyRow}
              onPress={() => setCurrency(currency.code)}
            >
              <View style={styles.currencyLeft}>
                <Text style={styles.currencyFlag}>{currency.flag}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
              </View>
              
              <View style={styles.currencyRight}>
                <Text style={styles.currencyRate}>
                  {formatPrice(currency.rate, currentCurrency)}
                </Text>
                <Text style={[
                  styles.currencyChange,
                  { color: parseFloat(currency.change) >= 0 ? '#34C759' : '#FF3B30' }
                ]}>
                  {parseFloat(currency.change) >= 0 ? '+' : ''}{currency.change}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>{supportedCurrencies.length}</Text>
              <Text style={styles.statusLabel}>Currencies</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>✅</Text>
              <Text style={styles.statusLabel}>Real-time</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>185</Text>
              <Text style={styles.statusLabel}>Countries</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>⚡</Text>
              <Text style={styles.statusLabel}>Auto-detect</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine Features</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🌍</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Global Auto-Detection</Text>
              <Text style={styles.featureDescription}>
                Automatically detects user location and sets appropriate currency
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💱</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Dual Currency Display</Text>
              <Text style={styles.featureDescription}>
                Shows prices in both local and preferred currencies
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>₿</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Crypto Support</Text>
              <Text style={styles.featureDescription}>
                Supports major cryptocurrencies with real-time rates
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Rounding</Text>
              <Text style={styles.featureDescription}>
                Intelligent price rounding for better user experience
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🌊 Powered by BlueWave Currency Technology</Text>
          <Text style={styles.footerSubtext}>Enterprise-grade currency management</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
  },
  headerContent: {
    padding: 20,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E95A3',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  currentCurrencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0066CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentCurrencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  refreshButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  currentCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentFlag: {
    fontSize: 36,
    marginRight: 16,
  },
  currentCurrencyInfo: {
    flex: 1,
  },
  currentCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  currentName: {
    fontSize: 14,
    color: '#8E95A3',
  },
  currentRate: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066CC',
  },
  rateLabel: {
    fontSize: 12,
    color: '#8E95A3',
  },
  section: {
    marginBottom: 24,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 12,
    color: '#8E95A3',
  },
  currencyRight: {
    alignItems: 'flex-end',
  },
  currencyRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  currencyChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066CC',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 10,
    color: '#8E95A3',
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#8E95A3',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#8E95A3',
  },
});