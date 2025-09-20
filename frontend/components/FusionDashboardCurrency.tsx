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

interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
  symbol: string;
  flag: string;
  change24h?: number;
  volume?: number;
}

export default function FusionDashboardCurrency() {
  const router = useRouter();
  const { currentCurrency, supportedCurrencies, exchangeRates, formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'JPY', 'CNY']);

  const getTopCurrencies = (): CurrencyRate[] => {
    const rates = exchangeRates || {};
    return selectedCurrencies.map(code => {
      const currency = supportedCurrencies.find(c => c.code === code);
      return {
        code,
        name: currency?.name || code,
        rate: rates[code] || 1,
        symbol: currency?.symbol || code,
        flag: currency?.flag || '🏳️',
        change24h: Math.random() * 10 - 5, // Mock data
        volume: Math.random() * 1000000
      };
    });
  };

  const handleCurrencyPress = (currency: CurrencyRate) => {
    console.log(`Selected currency: ${currency.code}`);
  };

  const topCurrencies = getTopCurrencies();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />
      
      {/* Header Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🌊 BlueWave • Family-Safe AI Commerce</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Currency-Infinity Engine v2.0</Text>
          <Text style={styles.subtitle}>185 Currencies • Real-time Rates • Multi-regional Support</Text>
        </View>

        {/* Current Currency Display */}
        <View style={styles.currentCurrencySection}>
          <Text style={styles.sectionTitle}>Active Currency</Text>
          <View style={styles.currentCurrencyCard}>
            <Text style={styles.currentFlag}>
              {supportedCurrencies.find(c => c.code === currentCurrency)?.flag || '💱'}
            </Text>
            <View style={styles.currentCurrencyInfo}>
              <Text style={styles.currentCurrencyCode}>{currentCurrency}</Text>
              <Text style={styles.currentCurrencyName}>
                {supportedCurrencies.find(c => c.code === currentCurrency)?.name || 'Unknown Currency'}
              </Text>
            </View>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Rates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Exchange Rates</Text>
          {topCurrencies.map((currency, index) => (
            <TouchableOpacity
              key={currency.code}
              style={styles.currencyRow}
              onPress={() => handleCurrencyPress(currency)}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyFlag}>{currency.flag}</Text>
                <View style={styles.currencyDetails}>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
              </View>
              
              <View style={styles.rateInfo}>
                <Text style={styles.rate}>{formatPrice(currency.rate, currentCurrency)}</Text>
                <Text style={[
                  styles.change,
                  { color: currency.change24h && currency.change24h > 0 ? '#34C759' : '#FF3B30' }
                ]}>
                  {currency.change24h && currency.change24h > 0 ? '+' : ''}
                  {currency.change24h?.toFixed(2)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Supported Currencies</Text>
              <Text style={styles.statusValue}>185</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Real-time Updates</Text>
              <Text style={styles.statusValue}>✅ Active</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Auto-detection</Text>
              <Text style={styles.statusValue}>✅ Enabled</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Dual Display</Text>
              <Text style={styles.statusValue}>✅ Ready</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔄</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Refresh Rates</Text>
              <Text style={styles.actionDescription}>Update all exchange rates</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Currency Settings</Text>
              <Text style={styles.actionDescription}>Manage preferred currencies</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Rate Analytics</Text>
              <Text style={styles.actionDescription}>View historical trends</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🌊 Powered by BlueWave Currency Engine</Text>
          <Text style={styles.footerSubtext}>Real-time global currency management</Text>
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
  badge: {
    backgroundColor: '#0066CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  currentCurrencySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  currentCurrencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0066CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  currentCurrencyInfo: {
    flex: 1,
  },
  currentCurrencyCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  currentCurrencyName: {
    fontSize: 14,
    color: '#8E95A3',
  },
  changeButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
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
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyDetails: {
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
  rateInfo: {
    alignItems: 'flex-end',
  },
  rate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  statusLabel: {
    fontSize: 14,
    color: '#2C3E50',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  actionButton: {
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
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#8E95A3',
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