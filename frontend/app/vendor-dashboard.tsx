import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { API } from '../src/api/client';

interface VisibilitySettings {
  _id: string;
  vendor_id: string;
  visibility_type: 'local' | 'national' | 'global_strategic' | 'global_all';
  target_countries?: string[];
  target_cities?: string[];
  local_radius_km?: number;
  budget_daily_usd?: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue_usd: number;
}

interface GeographicAnalytics {
  total_stats: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue_usd: number;
  };
  country_performance: Record<string, any>;
  top_countries: Array<[string, any]>;
  top_cities: Array<[string, any]>;
}

export default function VendorDashboardScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState<VisibilitySettings | null>(null);
  const [analytics, setAnalytics] = useState<GeographicAnalytics | null>(null);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [selectedVisibilityType, setSelectedVisibilityType] = useState<string>('national');

  // Navigate to Enhanced Seller Dashboard
  const goToSellerDashboard = () => {
    router.push('/seller-dashboard');
  };

  useEffect(() => {
    if (user && user.roles.includes('vendor')) {
      loadVendorData();
    }
  }, [user]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      
      // Find vendor for this user
      const vendorResponse = await API.get('/vendors');
      const vendor = vendorResponse.data.find((v: any) => v.userIdOwner === user?.id);
      
      if (!vendor) {
        Alert.alert('Error', 'Vendor profile not found');
        return;
      }
      
      const vendorId = vendor._id;
      
      // Load visibility settings
      try {
        const visibilityResponse = await API.get(`/geographic/visibility/${vendorId}`);
        setVisibility(visibilityResponse.data.visibility);
        if (visibilityResponse.data.visibility) {
          setSelectedVisibilityType(visibilityResponse.data.visibility.visibility_type);
        }
      } catch (error) {
        console.log('No visibility settings found');
      }
      
      // Load analytics
      try {
        const analyticsResponse = await API.get(`/geographic/analytics/${vendorId}`);
        setAnalytics(analyticsResponse.data);
      } catch (error) {
        console.log('Analytics not available');
      }
      
      // Load AI recommendations
      try {
        const recommendationsResponse = await API.get(`/geographic/targeting-recommendations/${vendorId}`);
        setAIRecommendations(recommendationsResponse.data.recommendations || []);
      } catch (error) {
        console.log('AI recommendations not available');
      }
      
    } catch (error) {
      console.error('Failed to load vendor data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateVisibilitySettings = async () => {
    try {
      const config = {
        visibility_type: selectedVisibilityType,
        target_countries: selectedVisibilityType === 'national' ? ['US'] : 
          selectedVisibilityType === 'global_strategic' ? ['US', 'GB', 'JP', 'CA', 'AU'] : 
          selectedVisibilityType === 'global_all' ? [] : undefined,
        local_radius_km: selectedVisibilityType === 'local' ? 50 : undefined,
        local_center_city_id: selectedVisibilityType === 'local' ? 'city_new_york_US' : undefined,
        auto_expand: true,
        budget_daily_usd: 100,
        performance_threshold: 0.02
      };
      
      await API.post('/geographic/visibility', config);
      Alert.alert('Success', 'Visibility settings updated!');
      loadVendorData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update visibility settings');
    }
  };

  const getVisibilityDescription = (type: string) => {
    switch (type) {
      case 'local':
        return '📍 Local visibility within 50km radius';
      case 'national':
        return '🇺🇸 National visibility across the country';
      case 'global_strategic':
        return '🌍 Strategic global visibility in key markets';
      case 'global_all':
        return '🌏 Maximum global visibility in all cities worldwide';
      default:
        return 'Select visibility type';
    }
  };

  const getVisibilityIcon = (type: string) => {
    switch (type) {
      case 'local':
        return 'location';
      case 'national':
        return 'flag';
      case 'global_strategic':
        return 'globe';
      case 'global_all':
        return 'earth';
      default:
        return 'help-circle';
    }
  };

  const renderVisibilityCard = (type: string, title: string, description: string, price: string) => (
    <TouchableOpacity
      key={type}
      style={[
        styles.visibilityCard,
        selectedVisibilityType === type && styles.selectedCard
      ]}
      onPress={() => setSelectedVisibilityType(type)}
    >
      <View style={styles.cardHeader}>
        <Ionicons 
          name={getVisibilityIcon(type) as any} 
          size={24} 
          color={selectedVisibilityType === type ? '#007AFF' : '#666'} 
        />
        <Text style={[
          styles.cardTitle,
          selectedVisibilityType === type && styles.selectedCardTitle
        ]}>
          {title}
        </Text>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
      <Text style={styles.cardPrice}>{price}</Text>
      {selectedVisibilityType === type && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAnalyticsCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.analyticsCard}>
      <View style={[styles.analyticsIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={16} color="white" />
      </View>
      <Text style={styles.analyticsValue}>{value}</Text>
      <Text style={styles.analyticsTitle}>{title}</Text>
    </View>
  );

  const renderAIRecommendation = (recommendation: any, index: number) => (
    <View key={index} style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Ionicons 
          name={recommendation.insight_type === 'opportunity' ? 'trending-up' : 
                recommendation.insight_type === 'warning' ? 'warning' : 'bulb'} 
          size={16} 
          color={
            recommendation.insight_type === 'opportunity' ? '#34C759' :
            recommendation.insight_type === 'warning' ? '#FF9500' : '#007AFF'
          } 
        />
        <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
        <View style={[
          styles.confidenceBadge,
          { backgroundColor: recommendation.confidence_score > 0.7 ? '#34C759' : '#FF9500' }
        ]}>
          <Text style={styles.confidenceText}>
            {Math.round(recommendation.confidence_score * 100)}%
          </Text>
        </View>
      </View>
      <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
      {recommendation.suggested_actions && recommendation.suggested_actions.length > 0 && (
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Suggested Actions:</Text>
          {recommendation.suggested_actions.map((action: string, actionIndex: number) => (
            <Text key={actionIndex} style={styles.actionItem}>• {action}</Text>
          ))}
        </View>
      )}
    </View>
  );

  if (!user || !user.roles.includes('vendor')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Ionicons name="business-outline" size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Vendor Access Required</Text>
          <Text style={styles.errorSubtitle}>
            This dashboard is only available for registered vendors
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Seller Visibility Dashboard</Text>
            <Text style={styles.headerSubtitle}>Control your global reach</Text>
          </View>
          <TouchableOpacity onPress={loadVendorData}>
            <Ionicons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Enhanced Seller Dashboard Access */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.enhancedDashboardCard}
            onPress={goToSellerDashboard}
          >
            <View style={styles.enhancedDashboardContent}>
              <View style={styles.enhancedDashboardIcon}>
                <Ionicons name="storefront" size={20} color="white" />
              </View>
              <View style={styles.enhancedDashboardText}>
                <Text style={styles.enhancedDashboardTitle}>Enhanced Seller Dashboard</Text>
                <Text style={styles.enhancedDashboardSubtitle}>
                  Manage products, orders & analytics
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#007AFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Current Visibility Status */}
        {visibility && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Visibility</Text>
            <View style={styles.currentVisibilityCard}>
              <View style={styles.currentVisibilityHeader}>
                <Ionicons 
                  name={getVisibilityIcon(visibility.visibility_type) as any} 
                  size={24} 
                  color="#007AFF" 
                />
                <Text style={styles.currentVisibilityTitle}>
                  {visibility.visibility_type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.currentVisibilityDescription}>
                {getVisibilityDescription(visibility.visibility_type)}
              </Text>
              <View style={styles.currentVisibilityStats}>
                <Text style={styles.statsText}>
                  {visibility.impressions} impressions • {visibility.clicks} clicks • ${visibility.revenue_usd.toFixed(2)} revenue
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Analytics */}
        {analytics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Analytics (30 days)</Text>
            <View style={styles.analyticsGrid}>
              {renderAnalyticsCard('Impressions', analytics.total_stats.impressions.toLocaleString(), 'eye', '#007AFF')}
              {renderAnalyticsCard('Clicks', analytics.total_stats.clicks.toLocaleString(), 'hand-left', '#34C759')}
              {renderAnalyticsCard('Conversions', analytics.total_stats.conversions.toLocaleString(), 'checkmark-circle', '#FF9500')}
              {renderAnalyticsCard('Revenue', `$${analytics.total_stats.revenue_usd.toFixed(0)}`, 'cash', '#FF3B30')}
            </View>
            
            {analytics.top_countries.length > 0 && (
              <View style={styles.topCountriesContainer}>
                <Text style={styles.subsectionTitle}>Top Performing Countries</Text>
                {analytics.top_countries.slice(0, 3).map(([country, stats], index) => (
                  <View key={country} style={styles.countryRow}>
                    <Text style={styles.countryFlag}>🌍</Text>
                    <Text style={styles.countryName}>{country}</Text>
                    <Text style={styles.countryRevenue}>${stats.revenue_usd.toFixed(0)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Visibility Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Visibility Settings</Text>
          <Text style={styles.sectionSubtitle}>Choose how far your products reach</Text>
          
          <View style={styles.visibilityOptions}>
            {renderVisibilityCard(
              'local',
              'Local Reach',
              'Target customers in your immediate area within 50km radius',
              'Budget: $50-100/day'
            )}
            {renderVisibilityCard(
              'national',
              'National Reach',
              'Expand to all buyers in your country for nationwide coverage',
              'Budget: $100-300/day'
            )}
            {renderVisibilityCard(
              'global_strategic',
              'Strategic Global',
              'Target 5-10 high-potential countries and major cities worldwide',
              'Budget: $300-800/day'
            )}
            {renderVisibilityCard(
              'global_all',
              'Maximum Global',
              'Reach buyers in all 4+ million cities worldwide',
              'Budget: $800+/day'
            )}
          </View>
          
          <TouchableOpacity style={styles.updateButton} onPress={updateVisibilitySettings}>
            <Text style={styles.updateButtonText}>Update Visibility Settings</Text>
          </TouchableOpacity>
        </View>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.aiSectionHeader}>
              <Ionicons name="sparkles" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>AI Geographic Insights</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Personalized recommendations to grow your business</Text>
            
            {aiRecommendations.map(renderAIRecommendation)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  currentVisibilityCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  currentVisibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentVisibilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  currentVisibilityDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  currentVisibilityStats: {
    borderTopWidth: 1,
    borderTopColor: '#B3E5FC',
    paddingTop: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  analyticsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  analyticsTitle: {
    fontSize: 12,
    color: '#666',
  },
  topCountriesContainer: {
    marginTop: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  countryRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  visibilityOptions: {
    gap: 12,
  },
  visibilityCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  selectedCardTitle: {
    color: '#007AFF',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardPrice: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});