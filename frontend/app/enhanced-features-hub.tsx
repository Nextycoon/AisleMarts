import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0f0f23',
  cardBackground: 'rgba(255,255,255,0.06)',
  primary: '#D4AF37',
  text: 'rgba(255,255,255,0.92)',
  textMuted: 'rgba(255,255,255,0.65)',
  success: '#32d583',
  warning: '#f4cf5c',
  error: '#ff6b6b',
  border: 'rgba(255,255,255,0.1)'
};

interface PricingRecommendation {
  product_id: string;
  current_price: number;
  recommended_price: number;
  price_change: number;
  confidence_score: number;
  reasoning: string;
  competitor_prices: Array<{platform: string; price: number; rank: number}>;
  demand_signal: number;
  margin_impact: number;
}

interface LLMResponse {
  provider_used: string;
  response: string;
  cost: number;
  latency: number;
  quality_score: number;
  reasoning: string;
}

interface TrustScore {
  vendor_id: string;
  overall_score: number;
  trust_level: string;
  scoring_factors: Record<string, number>;
  sla_status: string;
  recommendations: string[];
  badge_level: string;
}

interface MarketIntel {
  market_segment: string;
  trend_direction: string;
  confidence: number;
  key_insights: string[];
  price_trends: Record<string, number>;
  demand_forecast: Record<string, number>;
}

export default function EnhancedFeaturesHub() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'llm' | 'trust' | 'market'>('pricing');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pricingData, setPricingData] = useState<PricingRecommendation | null>(null);
  const [llmData, setLlmData] = useState<LLMResponse | null>(null);
  const [trustData, setTrustData] = useState<TrustScore | null>(null);
  const [marketData, setMarketData] = useState<MarketIntel | null>(null);

  const fetchPricingRecommendation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enhanced/pricing/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: 'DEMO-001',
          platform: 'amazon',
          strategy: 'competitive',
          min_margin: 0.15,
          max_discount: 0.30
        })
      });
      const data = await response.json();
      setPricingData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pricing recommendation');
    } finally {
      setLoading(false);
    }
  };

  const fetchLLMRouting = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enhanced/llm-router/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: 'analysis',
          content: 'Analyze current e-commerce trends for holiday season optimization',
          max_tokens: 1000,
          priority: 'standard'
        })
      });
      const data = await response.json();
      setLlmData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch LLM routing');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrustScore = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enhanced/trust/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: 'VENDOR-001',
          fulfillment_rate: 0.97,
          response_time: 4.5,
          customer_rating: 4.6,
          dispute_rate: 0.018,
          platform_compliance: 0.94
        })
      });
      const data = await response.json();
      setTrustData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch trust score');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketIntelligence = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enhanced/market-intel/electronics');
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch market intelligence');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    switch (activeTab) {
      case 'pricing':
        await fetchPricingRecommendation();
        break;
      case 'llm':
        await fetchLLMRouting();
        break;
      case 'trust':
        await fetchTrustScore();
        break;
      case 'market':
        await fetchMarketIntelligence();
        break;
    }
    setRefreshing(false);
  };

  useEffect(() => {
    onRefresh();
  }, [activeTab]);

  const TabButton = ({ id, title, icon, isActive }: { id: string, title: string, icon: string, isActive: boolean }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(id as any)}
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: isActive ? COLORS.primary : 'transparent',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 2
      }}
    >
      <Ionicons name={icon as any} size={20} color={isActive ? COLORS.background : COLORS.text} />
      <Text style={{
        color: isActive ? COLORS.background : COLORS.text,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '800' }}>
          Enhanced Features Hub
        </Text>
        <Text style={{ color: COLORS.textMuted, marginTop: 4 }}>
          Advanced AI-powered business intelligence
        </Text>
      </View>

      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: COLORS.cardBackground, 
        marginHorizontal: 20, 
        borderRadius: 12, 
        padding: 4,
        marginBottom: 10
      }}>
        <TabButton id="pricing" title="Pricing" icon="pricetag" isActive={activeTab === 'pricing'} />
        <TabButton id="llm" title="LLM Router" icon="swap-horizontal" isActive={activeTab === 'llm'} />
        <TabButton id="trust" title="Trust Score" icon="shield-checkmark" isActive={activeTab === 'trust'} />
        <TabButton id="market" title="Market Intel" icon="trending-up" isActive={activeTab === 'market'} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={{ padding: 20 }}>
          <View style={{ backgroundColor: COLORS.cardBackground, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              🎯 {activeTab === 'pricing' ? 'Dynamic Pricing AI' : 
                   activeTab === 'llm' ? 'Multi-LLM Router' :
                   activeTab === 'trust' ? 'Vendor Trust Scoring' : 'Market Intelligence'}
            </Text>
            <Text style={{ color: COLORS.textMuted, marginBottom: 16 }}>
              {activeTab === 'pricing' ? 'Real-time competitor analysis and pricing optimization' : 
               activeTab === 'llm' ? 'Cost-optimized AI routing across providers' :
               activeTab === 'trust' ? 'Comprehensive vendor risk assessment and SLA management' : 
               'Real-time market analysis and trend prediction'}
            </Text>

            {loading ? (
              <ActivityIndicator color={COLORS.primary} size="large" />
            ) : (
              <Text style={{ color: COLORS.text, textAlign: 'center', padding: 20 }}>
                {activeTab === 'pricing' && pricingData ? `Price optimization active: $${pricingData.recommended_price}` :
                 activeTab === 'llm' && llmData ? `Using ${llmData.provider_used} - Cost: $${llmData.cost.toFixed(4)}` :
                 activeTab === 'trust' && trustData ? `Trust Score: ${(trustData.overall_score * 100).toFixed(1)}% (${trustData.trust_level})` :
                 activeTab === 'market' && marketData ? `Market trending ${marketData.trend_direction} with ${(marketData.confidence * 100).toFixed(1)}% confidence` :
                 'Pull to refresh for live data'}
              </Text>
            )}

            <TouchableOpacity
              onPress={onRefresh}
              disabled={loading}
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                marginTop: 16
              }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={{ color: COLORS.background, fontWeight: '600' }}>Refresh Data</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}