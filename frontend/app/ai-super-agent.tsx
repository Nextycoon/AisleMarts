import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

const { width, height } = Dimensions.get('window');

interface AICapability {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export default function AISuperAgentScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [currentMode, setCurrentMode] = useState('personal_shopper');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate components in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Pulse animation when processing
    if (isProcessing) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isProcessing]);

  const aiCapabilities: AICapability[] = [
    {
      id: 'personal_shopper',
      name: 'Personal Shopper',
      icon: '🛍️',
      description: 'AI-powered shopping assistant with 4M+ cities knowledge',
      active: currentMode === 'personal_shopper',
    },
    {
      id: 'price_optimizer',
      name: 'Price Optimizer',
      icon: '💰',
      description: 'Real-time price comparison across 185+ currencies',
      active: currentMode === 'price_optimizer',
    },
    {
      id: 'trend_predictor',
      name: 'Trend Predictor',
      icon: '📈',
      description: 'ML-powered trend analysis with 91% accuracy',
      active: currentMode === 'trend_predictor',
    },
    {
      id: 'style_advisor',
      name: 'Style Advisor',
      icon: '✨',
      description: 'Fashion & lifestyle advice with cultural adaptation',
      active: currentMode === 'style_advisor',
    },
    {
      id: 'sustainability_guide',
      name: 'Sustainability Guide',
      icon: '🌱',
      description: 'Eco-friendly shopping with carbon footprint tracking',
      active: currentMode === 'sustainability_guide',
    },
    {
      id: 'deal_hunter',
      name: 'Deal Hunter',
      icon: '🎯',
      description: '0% commission deals finder across global platforms',
      active: currentMode === 'deal_hunter',
    },
  ];

  const liveInsights: AIInsight[] = [
    {
      type: 'price_alert',
      title: 'Price Drop Alert',
      description: 'Your wishlist item "Designer Handbag" dropped 25% in Milan',
      confidence: 0.94,
      actionable: true,
    },
    {
      type: 'trend_prediction',
      title: 'Rising Trend Detected',
      description: 'Sustainable fashion predicted to surge 34% in next 45 days',
      confidence: 0.92,
      actionable: true,
    },
    {
      type: 'personalized_deal',
      title: 'Perfect Match Found',
      description: 'Found luxury watch matching your style in Tokyo (0% commission)',
      confidence: 0.89,
      actionable: true,
    },
    {
      type: 'cultural_insight',
      title: 'Cultural Adaptation',
      description: 'Shopping preferences updated for your current location',
      confidence: 0.96,
      actionable: false,
    },
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const responses = {
        personal_shopper: `🛍️ **AI Personal Shopper Response**\n\nBased on your request "${inputText}", I've analyzed 4+ million cities and found perfect matches:\n\n• **Tokyo**: Premium items with cultural adaptation\n• **Milan**: Luxury fashion with 0% commission\n• **New York**: Latest trends with same-day delivery\n\n**Recommendation**: Top 3 items curated for your style, budget, and location. All vendors keep 100% revenue on our platform!`,
        
        price_optimizer: `💰 **Price Optimization Results**\n\nAnalyzed "${inputText}" across 185+ currencies:\n\n• **Best Price**: $1,247 (was $1,650) - 24% savings\n• **Currency**: Auto-detected USD (can switch to any of 185+ currencies)\n• **Location**: 3 vendors in your area with 0% commission\n• **Savings**: $403 compared to traditional platforms\n\n**AI Insight**: Price predicted to rise 12% next week - optimal purchase window is now!`,
        
        trend_predictor: `📈 **Trend Analysis & Prediction**\n\nML Analysis of "${inputText}" with 91% accuracy:\n\n• **Current Trend**: Rising 34% globally\n• **Peak Prediction**: 45 days from now\n• **Market Opportunity**: Early adoption advantage\n• **Cultural Factors**: Strong in 23 countries\n\n**Recommendation**: Enter market now for maximum benefit. AI confidence: 91.2%`,
        
        style_advisor: `✨ **AI Style Advisory**\n\nPersonalized style analysis for "${inputText}":\n\n• **Your Style Profile**: Modern luxury with sustainability focus\n• **Cultural Adaptation**: Localized for your region\n• **Color Palette**: Deep blues, golds, earth tones\n• **Seasonal Trends**: Winter 2025 luxury collection\n\n**Perfect Matches**: 12 items curated with 94% style compatibility across 4M+ cities!`,
        
        sustainability_guide: `🌱 **Sustainability Intelligence**\n\nEco-analysis of "${inputText}":\n\n• **Carbon Footprint**: 67% lower than alternatives\n• **Sustainability Score**: 8.7/10\n• **Eco-Vendors**: 15 verified sustainable suppliers\n• **Impact**: Saves 23kg CO2 compared to traditional shopping\n\n**Green Recommendation**: Top eco-friendly options with 0% commission to vendors!`,
        
        deal_hunter: `🎯 **Deal Hunter Results**\n\n0% Commission deals for "${inputText}":\n\n• **Best Deal**: 42% off luxury item in Paris\n• **Vendor Saves**: $127 in commission fees (they keep 100%)\n• **Your Savings**: $340 compared to traditional platforms\n• **Global Reach**: Available in 47 countries\n\n**Exclusive Access**: Premium deals only available on AisleMarts!`
      };

      setAiResponse(responses[currentMode as keyof typeof responses] || responses.personal_shopper);
      setIsProcessing(false);
      setInputText('');
    }, 2000);
  };

  const renderCapability = (capability: AICapability) => (
    <TouchableOpacity
      key={capability.id}
      style={[
        styles.capabilityCard,
        capability.active && styles.capabilityCardActive
      ]}
      onPress={() => {
        setCurrentMode(capability.id);
        setAiResponse('');
      }}
      activeOpacity={0.8}
    >
      <Text style={styles.capabilityIcon}>{capability.icon}</Text>
      <Text style={[
        styles.capabilityName,
        capability.active && styles.capabilityNameActive
      ]}>
        {capability.name}
      </Text>
      <Text style={styles.capabilityDescription}>
        {capability.description}
      </Text>
    </TouchableOpacity>
  );

  const renderInsight = (insight: AIInsight, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.insightCard,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.insightHeader}>
        <View style={[
          styles.insightType,
          { backgroundColor: getInsightColor(insight.type) }
        ]}>
          <Text style={styles.insightTypeText}>
            {insight.type.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.insightConfidence}>
          {Math.round(insight.confidence * 100)}% confidence
        </Text>
      </View>
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      {insight.actionable && (
        <TouchableOpacity style={styles.insightAction}>
          <Text style={styles.insightActionText}>Take Action</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const getInsightColor = (type: string) => {
    const colors = {
      price_alert: '#FF6B6B',
      trend_prediction: '#4ECDC4',
      personalized_deal: '#45B7D1',
      cultural_insight: '#96CEB4',
    };
    return colors[type as keyof typeof colors] || '#667eea';
  };

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
          <Text style={styles.headerTitle}>AI Super Agent</Text>
          <Text style={styles.headerSubtitle}>Powered by AisleMarts Intelligence</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>LIVE</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Capabilities */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>AI Capabilities</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.capabilitiesContainer}
            >
              {aiCapabilities.map(renderCapability)}
            </ScrollView>
          </Animated.View>

          {/* Live AI Insights */}
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Live AI Insights</Text>
            {liveInsights.map(renderInsight)}
          </Animated.View>

          {/* AI Response */}
          {aiResponse && (
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>AI Response</Text>
              <View style={styles.responseCard}>
                <Text style={styles.responseText}>{aiResponse}</Text>
              </View>
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask your AI Super Agent anything..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isProcessing && styles.sendButtonProcessing
                ]}
                onPress={handleSendMessage}
                disabled={isProcessing || !inputText.trim()}
              >
                <LinearGradient
                  colors={isProcessing ? ['#FF6B6B', '#4ECDC4'] : ['#D4AF37', '#E8C968']}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>
                    {isProcessing ? '🤖' : '🚀'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>

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
  headerRight: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginRight: 6,
  },
  statusText: {
    color: '#4ECDC4',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  capabilitiesContainer: {
    paddingRight: 20,
  },
  capabilityCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  capabilityCardActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  capabilityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  capabilityName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  capabilityNameActive: {
    color: '#D4AF37',
  },
  capabilityDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    lineHeight: 14,
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightTypeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  insightConfidence: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  insightTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  insightAction: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  insightActionText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  responseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  responseText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 12,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonProcessing: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
  },
});