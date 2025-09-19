import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Advanced AI Personalization Context
interface AIPersonalizationState {
  crossDeviceSync: boolean;
  sessionMemory: SessionMemoryItem[];
  personalityProfile: PersonalityProfile;
  culturalContext: CulturealContext;
  purchasePatterns: PurchasePattern[];
  moodHistory: MoodHistoryItem[];
  aiInsights: AIInsight[];
}

interface SessionMemoryItem {
  id: string;
  timestamp: Date;
  device: string;
  interaction_type: 'voice' | 'text' | 'mood_to_cart' | 'purchase';
  content: string;
  context: any;
  mood: string | null;
  products_viewed: string[];
  cart_actions: string[];
}

interface PersonalityProfile {
  shopping_style: 'impulsive' | 'deliberate' | 'research_heavy' | 'mood_driven';
  price_sensitivity: 'budget' | 'value' | 'premium' | 'luxury';
  brand_loyalty: 'loyal' | 'flexible' | 'experimental';
  decision_speed: 'instant' | 'quick' | 'considered' | 'slow';
  influence_factors: string[];
  preferred_categories: string[];
  avoided_categories: string[];
  seasonal_patterns: Record<string, any>;
}

interface CulturealContext {
  primary_language: string;
  cultural_preferences: string[];
  regional_trends: string[];
  local_holidays: string[];
  currency_comfort: string[];
  payment_preferences: string[];
  social_influences: string[];
}

interface PurchasePattern {
  category: string;
  frequency: number;
  average_amount: number;
  preferred_times: string[];
  seasonal_boost: number;
  mood_correlation: Record<string, number>;
}

interface MoodHistoryItem {
  mood: string;
  timestamp: Date;
  context: string;
  products_selected: string[];
  purchase_completed: boolean;
  satisfaction_score?: number;
}

interface AIInsight {
  type: 'recommendation' | 'warning' | 'opportunity' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  action_suggested: string;
  relevant_data: any;
  expires_at?: Date;
}

const AIPersonalizationContext = createContext<{
  state: AIPersonalizationState;
  updateSessionMemory: (item: Omit<SessionMemoryItem, 'id' | 'timestamp'>) => void;
  analyzePurchasePatterns: () => Promise<PurchasePattern[]>;
  generateAIInsights: () => Promise<AIInsight[]>;
  syncCrossDevice: (deviceId: string) => Promise<void>;
  getMoodRecommendations: (currentMood: string) => Promise<any[]>;
} | null>(null);

export const AdvancedAIPersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AIPersonalizationState>({
    crossDeviceSync: false,
    sessionMemory: [],
    personalityProfile: {
      shopping_style: 'mood_driven',
      price_sensitivity: 'value',
      brand_loyalty: 'flexible',
      decision_speed: 'quick',
      influence_factors: ['mood', 'social_proof', 'reviews'],
      preferred_categories: [],
      avoided_categories: [],
      seasonal_patterns: {}
    },
    culturalContext: {
      primary_language: 'en',
      cultural_preferences: [],
      regional_trends: [],
      local_holidays: [],
      currency_comfort: ['USD'],
      payment_preferences: ['card'],
      social_influences: []
    },
    purchasePatterns: [],
    moodHistory: [],
    aiInsights: []
  });

  useEffect(() => {
    loadPersonalizationData();
    initializeCrossDeviceSync();
  }, []);

  const loadPersonalizationData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('ai_personalization_state');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setState(prevState => ({
          ...prevState,
          ...parsedData,
          sessionMemory: parsedData.sessionMemory?.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })) || [],
          moodHistory: parsedData.moodHistory?.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })) || []
        }));
      }
    } catch (error) {
      console.error('Failed to load personalization data:', error);
    }
  };

  const savePersonalizationData = async (newState: AIPersonalizationState) => {
    try {
      await AsyncStorage.setItem('ai_personalization_state', JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save personalization data:', error);
    }
  };

  const initializeCrossDeviceSync = async () => {
    // Initialize cross-device synchronization
    const deviceId = await getDeviceId();
    const userId = await getUserId();
    
    if (userId && deviceId) {
      try {
        await syncUserDataAcrossDevices(userId, deviceId);
        setState(prev => ({ ...prev, crossDeviceSync: true }));
      } catch (error) {
        console.error('Cross-device sync initialization failed:', error);
      }
    }
  };

  const getDeviceId = async (): Promise<string> => {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  const getUserId = async (): Promise<string | null> => {
    return await AsyncStorage.getItem('user_id');
  };

  const syncUserDataAcrossDevices = async (userId: string, deviceId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/personalization/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          device_id: deviceId,
          current_state: state
        })
      });

      if (response.ok) {
        const syncData = await response.json();
        setState(prev => ({
          ...prev,
          sessionMemory: [...prev.sessionMemory, ...syncData.session_memory],
          personalityProfile: { ...prev.personalityProfile, ...syncData.personality_updates },
          moodHistory: [...prev.moodHistory, ...syncData.mood_history]
        }));
      }
    } catch (error) {
      console.error('Cross-device sync failed:', error);
    }
  };

  const updateSessionMemory = (item: Omit<SessionMemoryItem, 'id' | 'timestamp'>) => {
    const newItem: SessionMemoryItem = {
      ...item,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setState(prev => {
      const newState = {
        ...prev,
        sessionMemory: [...prev.sessionMemory, newItem].slice(-50) // Keep last 50 interactions
      };
      savePersonalizationData(newState);
      return newState;
    });

    // Update personality profile based on interaction
    updatePersonalityProfile(newItem);
  };

  const updatePersonalityProfile = (interaction: SessionMemoryItem) => {
    setState(prev => {
      const updates: Partial<PersonalityProfile> = {};
      
      // Analyze shopping style
      if (interaction.interaction_type === 'mood_to_cart') {
        updates.shopping_style = 'mood_driven';
      }
      
      // Analyze decision speed
      const recentInteractions = prev.sessionMemory.slice(-5);
      const timeToDecision = recentInteractions.reduce((acc, curr, idx) => {
        if (idx === 0) return acc;
        return acc + (curr.timestamp.getTime() - recentInteractions[idx - 1].timestamp.getTime());
      }, 0) / Math.max(1, recentInteractions.length - 1);
      
      if (timeToDecision < 30000) { // Less than 30 seconds
        updates.decision_speed = 'instant';
      } else if (timeToDecision < 300000) { // Less than 5 minutes
        updates.decision_speed = 'quick';
      }

      // Update preferred categories
      if (interaction.products_viewed.length > 0) {
        // This would normally analyze product categories
        // For demo, we'll simulate category detection
        const simulatedCategories = ['fashion', 'electronics', 'home', 'beauty'];
        const randomCategory = simulatedCategories[Math.floor(Math.random() * simulatedCategories.length)];
        
        const currentPreferred = prev.personalityProfile.preferred_categories;
        if (!currentPreferred.includes(randomCategory)) {
          updates.preferred_categories = [...currentPreferred, randomCategory].slice(0, 10);
        }
      }

      const newState = {
        ...prev,
        personalityProfile: { ...prev.personalityProfile, ...updates }
      };
      
      savePersonalizationData(newState);
      return newState;
    });
  };

  const analyzePurchasePatterns = async (): Promise<PurchasePattern[]> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/personalization/analyze-patterns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_memory: state.sessionMemory,
          mood_history: state.moodHistory,
          personality_profile: state.personalityProfile
        })
      });

      if (response.ok) {
        const patterns = await response.json();
        setState(prev => ({ ...prev, purchasePatterns: patterns }));
        return patterns;
      }
    } catch (error) {
      console.error('Pattern analysis failed:', error);
    }

    // Fallback: Generate simulated patterns
    return generateSimulatedPatterns();
  };

  const generateSimulatedPatterns = (): PurchasePattern[] => {
    return [
      {
        category: 'fashion',
        frequency: 0.8,
        average_amount: 150,
        preferred_times: ['evening', 'weekend'],
        seasonal_boost: 1.3,
        mood_correlation: { 'bold': 0.9, 'elegant': 0.8, 'casual': 0.4 }
      },
      {
        category: 'electronics',
        frequency: 0.3,
        average_amount: 300,
        preferred_times: ['afternoon'],
        seasonal_boost: 1.1,
        mood_correlation: { 'excited': 0.7, 'professional': 0.6 }
      }
    ];
  };

  const generateAIInsights = async (): Promise<AIInsight[]> => {
    const patterns = await analyzePurchasePatterns();
    const recentMoods = state.moodHistory.slice(-10);
    const recentInteractions = state.sessionMemory.slice(-20);

    const insights: AIInsight[] = [];

    // Pattern-based insights
    if (patterns.length > 0) {
      const topPattern = patterns.sort((a, b) => b.frequency - a.frequency)[0];
      insights.push({
        type: 'recommendation',
        title: `${topPattern.category} Shopping Pattern Detected`,
        description: `You typically spend $${topPattern.average_amount} on ${topPattern.category} items. Best time to shop: ${topPattern.preferred_times.join(', ')}.`,
        confidence: 0.85,
        action_suggested: `Browse ${topPattern.category} collections`,
        relevant_data: topPattern
      });
    }

    // Mood-based insights
    if (recentMoods.length >= 3) {
      const moodCounts = recentMoods.reduce((acc, item) => {
        acc[item.mood] = (acc[item.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];
      
      insights.push({
        type: 'pattern',
        title: `Consistent ${dominantMood[0]} Mood Shopping`,
        description: `You've been in a ${dominantMood[0]} mood for ${dominantMood[1]} recent shopping sessions. This suggests strong preference patterns.`,
        confidence: 0.78,
        action_suggested: `Explore more ${dominantMood[0]} mood recommendations`,
        relevant_data: { mood: dominantMood[0], frequency: dominantMood[1] }
      });
    }

    // Opportunity insights
    const cartAbandonment = recentInteractions.filter(i => 
      i.cart_actions.length > 0 && i.interaction_type !== 'purchase'
    ).length;
    
    if (cartAbandonment >= 3) {
      insights.push({
        type: 'opportunity',
        title: 'Cart Completion Opportunity',
        description: `You've added items to cart ${cartAbandonment} times recently without purchasing. Would you like personalized assistance?`,
        confidence: 0.92,
        action_suggested: 'Review saved cart items with AI assistance',
        relevant_data: { abandonment_count: cartAbandonment }
      });
    }

    setState(prev => ({ ...prev, aiInsights: insights }));
    return insights;
  };

  const syncCrossDevice = async (deviceId: string) => {
    const userId = await getUserId();
    if (userId) {
      await syncUserDataAcrossDevices(userId, deviceId);
    }
  };

  const getMoodRecommendations = async (currentMood: string): Promise<any[]> => {
    // Analyze mood history to improve recommendations
    const moodHistory = state.moodHistory.filter(h => h.mood === currentMood);
    const personalityProfile = state.personalityProfile;
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/contextual-ai/mood-recommendations-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_mood: currentMood,
          mood_history: moodHistory,
          personality_profile: personalityProfile,
          cultural_context: state.culturalContext,
          purchase_patterns: state.purchasePatterns
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Advanced mood recommendations failed:', error);
    }

    return [];
  };

  return (
    <AIPersonalizationContext.Provider
      value={{
        state,
        updateSessionMemory,
        analyzePurchasePatterns,
        generateAIInsights,
        syncCrossDevice,
        getMoodRecommendations
      }}
    >
      {children}
    </AIPersonalizationContext.Provider>
  );
};

export const useAIPersonalization = () => {
  const context = useContext(AIPersonalizationContext);
  if (!context) {
    throw new Error('useAIPersonalization must be used within AIPersonalizationProvider');
  }
  return context;
};

// Advanced AI Insights Component
export const AIInsightsPanel: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { state, generateAIInsights } = useAIPersonalization();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const slideAnim = new Animated.Value(visible ? 0 : width);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (visible) {
      loadInsights();
    }
  }, [visible]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const newInsights = await generateAIInsights();
      setInsights(newInsights);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return 'bulb';
      case 'warning': return 'warning';
      case 'opportunity': return 'trending-up';
      case 'pattern': return 'analytics';
      default: return 'information-circle';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'recommendation': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'opportunity': return '#2196F3';
      case 'pattern': return '#9C27B0';
      default: return '#666';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.insightsPanel, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.insightsHeader}>
        <Text style={styles.insightsTitle}>AI Insights</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Analyzing your shopping patterns...</Text>
        </View>
      ) : (
        <View style={styles.insightsContent}>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons 
                  name={getInsightIcon(insight.type) as any} 
                  size={20} 
                  color={getInsightColor(insight.type)} 
                />
                <Text style={styles.insightType}>{insight.type.toUpperCase()}</Text>
                <View style={styles.confidenceIndicator}>
                  <Text style={styles.confidenceText}>
                    {Math.round(insight.confidence * 100)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{insight.action_suggested}</Text>
              </TouchableOpacity>
            </View>
          ))}

          {insights.length === 0 && (
            <View style={styles.emptyInsights}>
              <Ionicons name="analytics-outline" size={48} color="#ccc" />
              <Text style={styles.emptyInsightsText}>
                Keep shopping to unlock personalized AI insights!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Cross-Device Sync Status */}
      <View style={styles.syncStatus}>
        <Ionicons 
          name={state.crossDeviceSync ? "sync" : "sync-outline"} 
          size={16} 
          color={state.crossDeviceSync ? "#4CAF50" : "#999"} 
        />
        <Text style={styles.syncStatusText}>
          Cross-device sync: {state.crossDeviceSync ? "Active" : "Inactive"}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  insightsPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.85,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  insightsContent: {
    flex: 1,
    padding: 20,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  confidenceIndicator: {
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyInsights: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyInsightsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  syncStatusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default AdvancedAIPersonalizationProvider;