import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { paymentsTaxService } from '../src/services/PaymentsTaxService';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  payment_analytics?: any;
  tax_analytics?: any;
  health_status?: any;
}

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, selectedPeriod, selectedCountry]);

  const loadAnalyticsData = async () => {
    if (!user || !user.roles?.includes('admin')) {
      return;
    }

    try {
      const [paymentAnalytics, taxAnalytics, healthStatus] = await Promise.all([
        paymentsTaxService.getPaymentAnalytics(selectedCountry, selectedPeriod),
        paymentsTaxService.getTaxAnalytics(selectedCountry, selectedPeriod),
        paymentsTaxService.checkHealth()
      ]);

      setAnalyticsData({
        payment_analytics: paymentAnalytics,
        tax_analytics: taxAnalytics,
        health_status: healthStatus
      });
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const renderMetricCard = (title: string, value: string | number, icon: string, color: string = '#007AFF') => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  const renderHealthStatus = () => {
    if (!analyticsData.health_status) return null;

    const health = analyticsData.health_status;
    const isHealthy = health.status === 'healthy';

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={[styles.healthCard, { backgroundColor: isHealthy ? '#f0f9ff' : '#fff5f5' }]}>
          <View style={styles.healthHeader}>
            <Ionicons 
              name={isHealthy ? 'checkmark-circle' : 'warning'} 
              size={24} 
              color={isHealthy ? '#10B981' : '#EF4444'} 
            />
            <Text style={[styles.healthStatus, { color: isHealthy ? '#10B981' : '#EF4444' }]}>
              {health.status.toUpperCase()}
            </Text>
          </View>
          
          {health.services && (
            <View style={styles.servicesGrid}>
              {Object.entries(health.services).map(([service, data]: [string, any]) => (
                <View key={service} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{service.replace('_', ' ')}</Text>
                  <Text style={styles.serviceCount}>
                    {data.count !== undefined ? `${data.count} items` : data.status}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPaymentAnalytics = () => {
    if (!analyticsData.payment_analytics?.analytics) return null;

    const analytics = analyticsData.payment_analytics.analytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Analytics</Text>
        
        {/* Summary Metrics */}
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Transactions',
            analytics.summary.total_transactions.toLocaleString(),
            'card-outline',
            '#10B981'
          )}
          {renderMetricCard(
            'Total Volume',
            `$${analytics.summary.total_volume.toLocaleString()}`,
            'cash-outline',
            '#8B5CF6'
          )}
          {renderMetricCard(
            'Avg Transaction',
            `$${analytics.summary.average_transaction.toFixed(2)}`,
            'trending-up-outline',
            '#F59E0B'
          )}
          {renderMetricCard(
            'Conversion Rate',
            `${(analytics.summary.conversion_rate * 100).toFixed(1)}%`,
            'checkmark-circle-outline',
            '#EF4444'
          )}
        </View>

        {/* Top Payment Methods */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Payment Methods Performance</Text>
          {Object.entries(analytics.payment_methods).map(([method, data]: [string, any]) => (
            <View key={method} style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>{method.replace('_', ' ')}</Text>
                <Text style={styles.paymentMethodUsage}>
                  {(data.usage * 100).toFixed(1)}% usage • {(data.success_rate * 100).toFixed(1)}% success
                </Text>
              </View>
              <Text style={styles.paymentMethodFee}>
                {(data.avg_fee * 100).toFixed(1)}% fee
              </Text>
            </View>
          ))}
        </View>

        {/* Country Performance */}
        {analytics.by_country && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Top Countries</Text>
            {Object.entries(analytics.by_country).slice(0, 5).map(([country, data]: [string, any]) => (
              <View key={country} style={styles.countryRow}>
                <Text style={styles.countryCode}>{country}</Text>
                <View style={styles.countryStats}>
                  <Text style={styles.countryTransactions}>
                    {data.transactions} transactions
                  </Text>
                  <Text style={styles.countryVolume}>
                    ${data.volume.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTaxAnalytics = () => {
    if (!analyticsData.tax_analytics?.analytics) return null;

    const analytics = analyticsData.tax_analytics.analytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tax Analytics</Text>
        
        {/* Tax Summary */}
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Tax Collected',
            `$${analytics.summary.total_tax_calculated.toLocaleString()}`,
            'receipt-outline',
            '#10B981'
          )}
          {renderMetricCard(
            'Taxed Transactions',
            analytics.summary.transactions_with_tax.toLocaleString(),
            'document-text-outline',
            '#8B5CF6'
          )}
          {renderMetricCard(
            'Avg Tax Rate',
            `${(analytics.summary.average_tax_rate * 100).toFixed(1)}%`,
            'calculator-outline',
            '#F59E0B'
          )}
          {renderMetricCard(
            'Compliance Score',
            `${(analytics.summary.compliance_score * 100).toFixed(1)}%`,
            'shield-checkmark-outline',
            '#EF4444'
          )}
        </View>

        {/* Tax by Country */}
        {analytics.by_country && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Tax by Country</Text>
            {Object.entries(analytics.by_country).map(([country, data]: [string, any]) => (
              <View key={country} style={styles.taxCountryRow}>
                <Text style={styles.countryCode}>{country}</Text>
                <View style={styles.taxCountryStats}>
                  <Text style={styles.taxAmount}>
                    ${data.tax_collected.toLocaleString()}
                  </Text>
                  <Text style={styles.taxRate}>
                    {(data.avg_rate * 100).toFixed(1)}% avg rate
                  </Text>
                  <Text style={styles.complianceScore}>
                    {(data.compliance * 100).toFixed(0)}% compliance
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tax Types */}
        {analytics.tax_types && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Tax Types</Text>
            {Object.entries(analytics.tax_types).map(([type, data]: [string, any]) => (
              <View key={type} style={styles.taxTypeRow}>
                <Text style={styles.taxTypeName}>{type}</Text>
                <View style={styles.taxTypeStats}>
                  <Text style={styles.taxTypeAmount}>
                    ${data.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.taxTypeTransactions}>
                    {data.transactions} transactions
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Time Period</Text>
      <View style={styles.periodOptions}>
        {[7, 30, 90].map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodOption,
              selectedPeriod === period && styles.periodOptionSelected
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodOptionText,
              selectedPeriod === period && styles.periodOptionTextSelected
            ]}>
              {period} days
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCountryFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Country Filter</Text>
      <View style={styles.countryOptions}>
        <TouchableOpacity
          style={[
            styles.countryFilterOption,
            !selectedCountry && styles.countryFilterOptionSelected
          ]}
          onPress={() => setSelectedCountry(undefined)}
        >
          <Text style={[
            styles.countryFilterOptionText,
            !selectedCountry && styles.countryFilterOptionTextSelected
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {['US', 'GB', 'TR', 'DE', 'JP'].map(country => (
          <TouchableOpacity
            key={country}
            style={[
              styles.countryFilterOption,
              selectedCountry === country && styles.countryFilterOptionSelected
            ]}
            onPress={() => setSelectedCountry(country)}
          >
            <Text style={[
              styles.countryFilterOptionText,
              selectedCountry === country && styles.countryFilterOptionTextSelected
            ]}>
              {country}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (!user || !user.roles?.includes('admin')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
          <Text style={styles.unauthorizedTitle}>Admin Access Required</Text>
          <Text style={styles.unauthorizedSubtitle}>
            You need admin privileges to access this dashboard
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
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
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filters */}
        {renderPeriodSelector()}
        {renderCountryFilter()}

        {/* Health Status */}
        {renderHealthStatus()}

        {/* Payment Analytics */}
        {renderPaymentAnalytics()}

        {/* Tax Analytics */}
        {renderTaxAnalytics()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subsection: {
    marginTop: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  periodOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodOptionTextSelected: {
    color: 'white',
  },
  countryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countryFilterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  countryFilterOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  countryFilterOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  countryFilterOptionTextSelected: {
    color: 'white',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    width: (width - 56) / 2, // Account for padding and gap
    minHeight: 80,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  healthCard: {
    borderRadius: 12,
    padding: 16,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  serviceCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
  paymentMethodUsage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentMethodFee: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
  },
  countryStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  countryTransactions: {
    fontSize: 14,
    color: '#666',
  },
  countryVolume: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taxCountryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taxCountryStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  taxAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  taxRate: {
    fontSize: 12,
    color: '#666',
  },
  complianceScore: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  taxTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taxTypeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textTransform: 'uppercase',
  },
  taxTypeStats: {
    alignItems: 'flex-end',
  },
  taxTypeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  taxTypeTransactions: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});