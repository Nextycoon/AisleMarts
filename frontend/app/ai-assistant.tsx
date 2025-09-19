import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AIRecommendation {
  product_id: string;
  name: string;
  price: number;
  category: string;
  confidence_score: number;
  recommendation_reason: string;
  ai_insights: string;
  image_url?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'recommendations' | 'insights' | 'search_results';
  data?: any;
}

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Welcome animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Initial welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: `👋 Welcome to your **Luxury AI Shopping Assistant**!\n\nI'm here to help you discover perfect products, get personalized recommendations, and make informed shopping decisions.\n\n✨ **What I can do:**\n• Smart product search\n• Personalized recommendations\n• Market insights & trends\n• Price optimization advice\n• Style and preference matching\n\nHow can I assist you today?`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };

    setTimeout(() => {
      setMessages([welcomeMessage]);
    }, 1000);
  }, []);

  const quickActions = [
    {
      icon: 'search',
      title: 'Smart Search',
      subtitle: 'Natural language search',
      action: () => handleQuickAction('I want to search for something specific')
    },
    {
      icon: 'heart',
      title: 'Recommendations',
      subtitle: 'Personalized for you',
      action: () => handleQuickAction('Show me personalized recommendations')
    },
    {
      icon: 'trending-up',
      title: 'Trending Now',
      subtitle: 'What\'s hot right now',
      action: () => handleQuickAction('What\'s trending in luxury shopping?')
    },
    {
      icon: 'analytics',
      title: 'Market Insights',
      subtitle: 'Price trends & analysis',
      action: () => handleQuickAction('Give me market insights and trends')
    }
  ];

  const handleQuickAction = (message: string) => {
    setInputText(message);
    setShowQuickActions(false);
    handleSendMessage(message);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setLoading(true);
    setShowQuickActions(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Determine response type based on message content
      let aiResponse: ChatMessage;
      
      if (messageText.toLowerCase().includes('recommend') || messageText.toLowerCase().includes('suggest')) {
        aiResponse = await generateRecommendationsResponse(messageText);
      } else if (messageText.toLowerCase().includes('trend') || messageText.toLowerCase().includes('popular')) {
        aiResponse = generateTrendingResponse();
      } else if (messageText.toLowerCase().includes('insight') || messageText.toLowerCase().includes('market')) {
        aiResponse = generateInsightsResponse();
      } else if (messageText.toLowerCase().includes('search')) {
        aiResponse = await generateSearchResponse(messageText);
      } else {
        aiResponse = generateGeneralResponse(messageText);
      }

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const generateRecommendationsResponse = async (query: string): Promise<ChatMessage> => {
    // Mock advanced AI recommendations
    const recommendations: AIRecommendation[] = [
      {
        product_id: 'rec_1',
        name: 'Premium Wireless AirPods Pro',
        price: 249.99,
        category: 'Electronics',
        confidence_score: 0.94,
        recommendation_reason: 'Perfect match for your tech preferences and lifestyle',
        ai_insights: 'High-quality audio with luxury appeal. Great for professionals.',
      },
      {
        product_id: 'rec_2',
        name: 'Designer Minimalist Watch',
        price: 399.99,
        category: 'Fashion',
        confidence_score: 0.87,
        recommendation_reason: 'Aligns with your minimalist style preferences',
        ai_insights: 'Timeless design that complements professional and casual wear.',
      },
      {
        product_id: 'rec_3',
        name: 'Smart Home Hub',
        price: 179.99,
        category: 'Home & Living',
        confidence_score: 0.82,
        recommendation_reason: 'Based on your interest in smart technology',
        ai_insights: 'Excellent entry point for smart home automation.',
      }
    ];

    return {
      id: `msg_${Date.now()}`,
      text: `🎯 **AI-Curated Recommendations**\n\nI've analyzed your preferences and market trends to suggest these luxury items perfectly matched to your style:\n\n**Confidence Level:** High (89% match)\n**Analysis:** Your browsing patterns show strong preference for premium tech and minimalist design.`,
      isUser: false,
      timestamp: new Date(),
      type: 'recommendations',
      data: recommendations
    };
  };

  const generateTrendingResponse = (): ChatMessage => {
    return {
      id: `msg_${Date.now()}`,
      text: `📈 **Trending Now in Luxury Shopping**\n\n🔥 **Hot Categories:**\n• Smart Home Tech (+45% interest)\n• Sustainable Fashion (+38% growth)\n• Wellness & Fitness Tech (+41% demand)\n\n💎 **Luxury Trends:**\n• Minimalist designs dominating\n• Eco-conscious premium brands rising\n• Multi-functional products preferred\n\n**AI Insight:** The market is shifting toward sustainable luxury with tech integration. Perfect time to invest in eco-premium brands.`,
      isUser: false,
      timestamp: new Date(),
      type: 'insights'
    };
  };

  const generateInsightsResponse = (): ChatMessage => {
    return {
      id: `msg_${Date.now()}`,
      text: `📊 **Market Intelligence Report**\n\n**Price Trends:**\n📉 Electronics: -8.5% (Great buying opportunity)\n📈 Fashion: +3.2% (Premium segment stable)\n📊 Home Decor: Stable with seasonal variation\n\n**Buying Recommendations:**\n✅ **Best Time to Buy:** Electronics in next 2 weeks\n⏰ **Wait for Sales:** Fashion items before holiday season\n🎯 **Hot Picks:** Smart home devices with integration features\n\n**AI Prediction:** Expect 15% price increases in premium tech after holiday season.`,
      isUser: false,
      timestamp: new Date(),
      type: 'insights'
    };
  };

  const generateSearchResponse = async (query: string): Promise<ChatMessage> => {
    const searchResults: AIRecommendation[] = [
      {
        product_id: 'search_1',
        name: 'Ultra HD Smart Monitor',
        price: 499.99,
        category: 'Electronics',
        confidence_score: 0.91,
        recommendation_reason: 'Matches your search criteria perfectly',
        ai_insights: 'Professional-grade display with luxury aesthetics.',
      },
      {
        product_id: 'search_2',
        name: 'Ergonomic Desk Chair',
        price: 329.99,
        category: 'Furniture',
        confidence_score: 0.85,
        recommendation_reason: 'Complementary item for your search',
        ai_insights: 'Premium materials with health-focused design.',
      }
    ];

    return {
      id: `msg_${Date.now()}`,
      text: `🔍 **Smart Search Results**\n\nI've interpreted your search and found these high-confidence matches:\n\n**Search Analysis:**\n• Query understanding: 92% confidence\n• Intent detection: Professional/Work setup\n• Price range: Mid to high-end premium\n\n**Recommendation Strategy:** Focused on quality and professional appeal.`,
      isUser: false,
      timestamp: new Date(),
      type: 'search_results',
      data: searchResults
    };
  };

  const generateGeneralResponse = (query: string): ChatMessage => {
    const responses = [
      `I understand you're looking for assistance with "${query}". Let me help you find exactly what you need with my AI-powered recommendations.`,
      `That's a great question about "${query}". I can provide personalized insights and product suggestions based on your preferences.`,
      `I'm analyzing your request about "${query}". My AI algorithms are working to provide you with the most relevant luxury shopping recommendations.`
    ];

    return {
      id: `msg_${Date.now()}`,
      text: responses[Math.floor(Math.random() * responses.length)] + '\n\n💡 **Quick tip:** Try asking me for specific product recommendations, trending items, or market insights for more detailed assistance!',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.type === 'recommendations' || message.type === 'search_results') {
      return (
        <View key={message.id} style={styles.messageContainer}>
          <View style={[styles.messageBubble, styles.aiMessageBubble]}>
            <Text style={styles.aiMessageText}>{message.text}</Text>
            
            {message.data && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
                {message.data.map((item: AIRecommendation, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recommendationCard}
                    onPress={() => Alert.alert(item.name, item.ai_insights)}
                  >
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="image" size={24} color="#666" />
                    </View>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productPrice}>${item.price}</Text>
                    <View style={styles.confidenceBar}>
                      <View style={[styles.confidenceFill, { width: `${item.confidence_score * 100}%` }]} />
                    </View>
                    <Text style={styles.confidenceText}>{Math.round(item.confidence_score * 100)}% match</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      );
    }

    return (
      <View key={message.id} style={styles.messageContainer}>
        <View style={[
          styles.messageBubble,
          message.isUser ? styles.userMessageBubble : styles.aiMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.text}
          </Text>
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.messageContainer}>
        <View style={[styles.messageBubble, styles.aiMessageBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
            <View style={[styles.typingDot, { animationDelay: '200ms' }]} />
            <View style={[styles.typingDot, { animationDelay: '400ms' }]} />
          </View>
          <Text style={styles.typingText}>AI is thinking...</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={20} color="#D4AF37" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Luxury AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {isTyping ? 'Analyzing...' : 'Ready to help'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Alert.alert('Settings', 'AI preferences and customization')}
        >
          <Ionicons name="settings" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[
            styles.messagesWrapper,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}>
            {messages.map(renderMessage)}
            {renderTypingIndicator()}
          </Animated.View>
        </ScrollView>

        {/* Quick Actions */}
        {showQuickActions && messages.length <= 1 && (
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionButton}
                  onPress={action.action}
                >
                  <Ionicons name={action.icon as any} size={24} color="#D4AF37" />
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your AI assistant anything..."
              placeholderTextColor="#666"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: inputText.trim() || loading ? 1 : 0.5 }]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Ionicons name="send" size={20} color="#000000" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messagesWrapper: {
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
  },
  userMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#000000',
  },
  aiMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    paddingVertical: 12,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
    marginHorizontal: 2,
  },
  typingText: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  recommendationsScroll: {
    marginTop: 16,
  },
  recommendationCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  confidenceText: {
    color: '#999',
    fontSize: 10,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  quickActionsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});