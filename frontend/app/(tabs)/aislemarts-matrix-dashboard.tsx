import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const AislemartsMatrixDashboard = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeMatrix, setActiveMatrix] = useState('all');

  const matrixData = {
    all: {
      title: 'ALL',
      subtitle: 'The Foundation',
      description: 'Every feature users expect from social + commerce + lifestyle unified',
      color: '#D4AF37',
      gradient: ['#D4AF37', '#B8941F'],
      features: [
        {
          category: 'Social',
          icon: 'people-outline',
          items: ['Posts & Stories', 'Reels & Videos', 'Live Streaming', 'Groups & Communities', 'Direct Messaging', 'Social Feed']
        },
        {
          category: 'Commerce',
          icon: 'storefront-outline', 
          items: ['Marketplace', 'Vendor Stores', 'Product Catalog', 'Shopping Cart', 'Payments & Checkout', 'Order Tracking']
        },
        {
          category: 'Lifestyle',
          icon: 'heart-outline',
          items: ['Personal Profiles', 'Preferences', 'Wishlist & Favorites', 'Reviews & Ratings', 'Location Services', 'Notifications']
        }
      ]
    },
    more: {
      title: 'MORE',
      subtitle: 'The Exponential Layer', 
      description: 'Advanced power features that create engagement and retention',
      color: '#4A90E2',
      gradient: ['#4A90E2', '#357ABD'],
      features: [
        {
          category: 'AI Personalization',
          icon: 'sparkles-outline',
          items: ['Smart Recommendations', 'Predictive Analytics', 'Behavior Learning', 'Content Curation', 'Price Optimization', 'Trend Prediction']
        },
        {
          category: 'Gamification',
          icon: 'trophy-outline',
          items: ['Loyalty Points', 'Achievement Badges', 'Daily Challenges', 'Leaderboards', 'Streaks & Rewards', 'VIP Tiers']
        },
        {
          category: 'Advanced Commerce',
          icon: 'rocket-outline',
          items: ['Live Shopping', 'Group Buying', 'Flash Sales', 'Auction System', 'Subscription Box', 'Global Currency']
        }
      ]
    },
    beyond: {
      title: 'BEYOND ALL',
      subtitle: 'The Breakthrough Dimension',
      description: 'Future-defining features that transcend traditional boundaries',
      color: '#9B59B6',
      gradient: ['#9B59B6', '#8E44AD'],
      features: [
        {
          category: 'AR/VR Experience',
          icon: 'glasses-outline',
          items: ['Virtual Try-On', 'AR Shopping', 'VR Stores', 'Metaverse Integration', '3D Product View', 'Immersive Content']
        },
        {
          category: 'AI Companions',
          icon: 'chatbubbles-outline',
          items: ['Personal AI Assistant', 'Smart Shopping Guide', 'Lifestyle Advisor', 'Trend Predictor', 'Voice Commerce', 'AI Concierge']
        },
        {
          category: 'Super App Ecosystem',
          icon: 'planet-outline',
          items: ['Global Franchise Hubs', 'Lifestyle Cloud', 'Infinite Discovery', 'Community Creation', 'Creator Economy', 'Digital Identity']
        }
      ]
    }
  };

  const businessModel = {
    clp: {
      title: 'CLP',
      fullName: 'Content Lead Purchase',
      description: 'Every piece of content converts directly to purchase',
      flow: 'Content → Engagement → Checkout',
      metrics: {
        conversionRate: '23.4%',
        avgOrderValue: '$157.42',
        contentToSale: '2.3 min',
        engagement: '89.7%'
      }
    },
    ppl: {
      title: 'PPL', 
      fullName: 'Pay Per Lead',
      description: 'Vendors pay only for verified leads',
      flow: 'Performance-based. ROI guaranteed.',
      metrics: {
        leadQuality: '94.2%',
        conversionCost: '$12.45',
        vendorSatisfaction: '97.8%',
        roiGuarantee: '340%'
      }
    }
  };

  useEffect(() => {
    loadMatrixData();
  }, []);

  const loadMatrixData = async () => {
    try {
      setLoading(true);
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoading(false);
    } catch (error) {
      console.error('Error loading matrix data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatrixData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <LinearGradient colors={['#D4AF37', '#4A90E2', '#9B59B6']} style={styles.loadingGradient}>
            <Text style={styles.loadingTitle}>AisleMarts</Text>
            <Text style={styles.loadingSubtitle}>ALL • MORE • BEYOND ALL</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AisleMarts Matrix</Text>
          <Text style={styles.headerSubtitle}>All • More • Beyond All</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="infinite-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Matrix Navigation */}
        <View style={styles.matrixNav}>
          {Object.entries(matrixData).map(([key, matrix]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.matrixTab,
                activeMatrix === key && styles.activeMatrixTab
              ]}
              onPress={() => setActiveMatrix(key)}
            >
              <LinearGradient
                colors={activeMatrix === key ? matrix.gradient : ['#1a1a1a', '#2d2d2d']}
                style={styles.matrixTabGradient}
              >
                <Text style={[
                  styles.matrixTabTitle,
                  activeMatrix === key && styles.activeMatrixTabTitle
                ]}>
                  {matrix.title}
                </Text>
                <Text style={[
                  styles.matrixTabSubtitle,
                  activeMatrix === key && styles.activeMatrixTabSubtitle
                ]}>
                  {matrix.subtitle}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active Matrix Content */}
        <LinearGradient 
          colors={matrixData[activeMatrix as keyof typeof matrixData].gradient} 
          style={styles.matrixHeader}
        >
          <Text style={styles.matrixTitle}>
            {matrixData[activeMatrix as keyof typeof matrixData].title}
          </Text>
          <Text style={styles.matrixDescription}>
            {matrixData[activeMatrix as keyof typeof matrixData].description}
          </Text>
        </LinearGradient>

        {/* Matrix Features */}
        {matrixData[activeMatrix as keyof typeof matrixData].features.map((feature, index) => (
          <View key={index} style={styles.featureSection}>
            <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.featureSectionContent}>
              <View style={styles.featureHeader}>
                <View style={[
                  styles.featureIcon,
                  { backgroundColor: matrixData[activeMatrix as keyof typeof matrixData].color + '20' }
                ]}>
                  <Ionicons 
                    name={feature.icon as any} 
                    size={24} 
                    color={matrixData[activeMatrix as keyof typeof matrixData].color} 
                  />
                </View>
                <Text style={styles.featureCategory}>{feature.category}</Text>
              </View>
              
              <View style={styles.featureItems}>
                {feature.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.featureItem}>
                    <View style={[
                      styles.featureDot,
                      { backgroundColor: matrixData[activeMatrix as keyof typeof matrixData].color }
                    ]} />
                    <Text style={styles.featureItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        ))}

        {/* Business Model Section */}
        <View style={styles.businessModelSection}>
          <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.businessModelCard}>
            <Text style={styles.businessModelTitle}>
              The Business Formula
            </Text>
            <View style={styles.formulaContainer}>
              <Text style={styles.formula}>CLP + PPL = AisleMarts</Text>
            </View>
            
            <View style={styles.modelBreakdown}>
              {Object.entries(businessModel).map(([key, model]) => (
                <View key={key} style={styles.modelItem}>
                  <LinearGradient
                    colors={key === 'clp' ? ['#D4AF37', '#B8941F'] : ['#4A90E2', '#357ABD']}
                    style={styles.modelHeader}
                  >
                    <Text style={styles.modelTitleText}>{model.title}</Text>
                    <Text style={styles.modelFullName}>{model.fullName}</Text>
                  </LinearGradient>
                  
                  <View style={styles.modelContent}>
                    <Text style={styles.modelDescription}>{model.description}</Text>
                    <Text style={styles.modelFlow}>{model.flow}</Text>
                    
                    <View style={styles.modelMetrics}>
                      {Object.entries(model.metrics).map(([metricKey, value]) => (
                        <View key={metricKey} style={styles.metric}>
                          <Text style={styles.metricValue}>{value}</Text>
                          <Text style={styles.metricLabel}>
                            {metricKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Matrix Stats */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.statsCard}>
          <Text style={styles.statsTitle}>AisleMarts Matrix Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>∞</Text>
              <Text style={styles.statLabel}>Infinite Features</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>User Retention</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0%</Text>
              <Text style={styles.statLabel}>Commission</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>∞x</Text>
              <Text style={styles.statLabel}>ROAS</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={styles.actionButtonGradient}>
              <Ionicons name="rocket" size={20} color="#000000" />
              <Text style={styles.actionButtonText}>Experience ALL</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.actionButtonGradient}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Discover MORE
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient colors={['#9B59B6', '#8E44AD']} style={styles.actionButtonGradient}>
              <Ionicons name="planet" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Go BEYOND
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Manifesto */}
        <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.manifestoCard}>
          <Text style={styles.manifestoTitle}>The AisleMarts Manifesto</Text>
          <Text style={styles.manifestoText}>
            "AisleMarts — Has All, And More, And Beyond All."
          </Text>
          <Text style={styles.manifestoSubtext}>
            Not just a marketplace. Not just social. Not just lifestyle.
          </Text>
          <LinearGradient colors={['#D4AF37', '#4A90E2', '#9B59B6']} style={styles.manifestoHighlight}>
            <Text style={styles.manifestoHighlightText}>
              It's everything in one endless orbit.
            </Text>
          </LinearGradient>
        </LinearGradient>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  matrixNav: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  matrixTab: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeMatrixTab: {},
  matrixTabGradient: {
    padding: 16,
    alignItems: 'center',
  },
  matrixTabTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 4,
  },
  activeMatrixTabTitle: {
    color: '#FFFFFF',
  },
  matrixTabSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  activeMatrixTabSubtitle: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  matrixHeader: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  matrixTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  matrixDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  featureSection: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureSectionContent: {
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featureItems: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  featureItemText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  businessModelSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  businessModelCard: {
    padding: 20,
    borderRadius: 16,
  },
  businessModelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  formulaContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formula: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4AF37',
  },
  modelBreakdown: {
    gap: 16,
  },
  modelItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modelHeader: {
    padding: 16,
    alignItems: 'center',
  },
  modelTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modelFullName: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  modelContent: {
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  modelDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  modelFlow: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  modelMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metric: {
    alignItems: 'center',
    minWidth: 70,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  manifestoCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  manifestoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  manifestoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 12,
  },
  manifestoSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 16,
  },
  manifestoHighlight: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  manifestoHighlightText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default AislemartsMatrixDashboard;