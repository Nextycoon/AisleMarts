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
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  products?: Product[];
  actions?: Action[];
  mood?: string;
  context?: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  reason: string;
  confidence: number;
}

interface Action {
  type: 'add_to_cart' | 'view_product' | 'compare' | 'save_for_later';
  label: string;
  data: any;
}

interface ConversationState {
  mood: string | null;
  intent: string | null;
  budget: number | null;
  preferences: string[];
  session_memory: any[];
}

export default function AICopilotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    mood: null,
    intent: null,
    budget: null,
    preferences: [],
    session_memory: []
  });
  const [isListening, setIsListening] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Welcome message
    addMessage({
      id: 'welcome',
      type: 'ai',
      content: "👋 Hi! I'm your AI Shopping Co-pilot. Tell me what mood you're in or what you're looking for, and I'll help you find the perfect items!",
      timestamp: new Date()
    });

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const processUserInput = async (input: string) => {
    // Add user message
    addMessage({
      type: 'user',
      content: input,
      timestamp: new Date()
    });

    setIsTyping(true);

    try {
      // Process with contextual AI
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/contextual-ai/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo_user',
          session_id: 'copilot_session',
          context: 'browsing',
          current_mood: detectMood(input),
          search_query: input,
          language: 'en'
        }),
      });

      const aiResult = await response.json();

      if (aiResult.success) {
        // Update conversation state
        setConversationState(prev => ({
          ...prev,
          mood: aiResult.context_analysis.mood_influence,
          intent: aiResult.context_analysis.context,
          session_memory: [...prev.session_memory, { input, response: aiResult }]
        }));

        // Check for mood-to-cart intent
        if (containsMoodKeywords(input)) {
          await handleMoodToCart(input);
        } else {
          // Regular AI response
          addMessage({
            type: 'ai',
            content: aiResult.ai_explanation,
            timestamp: new Date(),
            products: aiResult.recommendations.slice(0, 3).map((product: any) => ({
              id: product._id,
              name: product.title,
              price: product.price,
              currency: 'USD',
              image: product.image || 'https://via.placeholder.com/150',
              reason: `Matches your ${aiResult.context_analysis.mood_influence} mood`,
              confidence: aiResult.personalization_score
            })),
            actions: [
              { type: 'add_to_cart', label: 'Add to Cart', data: {} },
              { type: 'view_product', label: 'View Details', data: {} },
              { type: 'compare', label: 'Compare', data: {} }
            ]
          });
        }
      } else {
        addMessage({
          type: 'ai',
          content: "I'm sorry, I couldn't process that request. Could you try rephrasing?",
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('AI processing error:', error);
      addMessage({
        type: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleMoodToCart = async (input: string) => {
    const detectedMood = detectMood(input);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/contextual-ai/mood-to-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: detectedMood,
          session_id: 'copilot_session',
          user_id: 'demo_user',
          budget: conversationState.budget
        }),
      });

      const result = await response.json();

      if (result.success) {
        addMessage({
          type: 'system',
          content: `🛒 Mood-to-Cart Activated! I've curated ${result.total_items} perfect items for your ${detectedMood} mood.`,
          timestamp: new Date()
        });

        addMessage({
          type: 'ai',
          content: result.message,
          timestamp: new Date(),
          products: result.cart_items.map((item: any) => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            currency: 'USD',
            image: item.image || 'https://via.placeholder.com/150',
            reason: item.reason,
            confidence: 0.95
          })),
          actions: [
            { type: 'add_to_cart', label: 'Add All to Cart', data: { items: result.cart_items } },
            { type: 'view_product', label: 'View Cart', data: {} }
          ],
          mood: detectedMood
        });
      }
    } catch (error) {
      console.error('Mood-to-cart error:', error);
    }
  };

  const detectMood = (input: string): string => {
    const moodKeywords = {
      'luxurious': ['luxurious', 'luxury', 'premium', 'expensive', 'high-end', 'fancy'],
      'bold': ['bold', 'daring', 'confident', 'statement', 'standout'],
      'casual': ['casual', 'comfortable', 'relaxed', 'everyday', 'simple'],
      'elegant': ['elegant', 'sophisticated', 'classy', 'refined', 'graceful'],
      'happy': ['happy', 'cheerful', 'bright', 'joyful', 'upbeat'],
      'professional': ['professional', 'business', 'formal', 'office', 'work']
    };

    const inputLower = input.toLowerCase();
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        return mood;
      }
    }
    
    return 'casual'; // default mood
  };

  const containsMoodKeywords = (input: string): boolean => {
    const moodPhrases = [
      'i feel', 'feeling', 'mood for', 'i\'m feeling', 'today i feel',
      'want something', 'need something', 'looking for something'
    ];
    
    const inputLower = input.toLowerCase();
    return moodPhrases.some(phrase => inputLower.includes(phrase));
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      processUserInput(inputText.trim());
      setInputText('');
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // In real implementation, this would use voice recognition
    if (!isListening) {
      setTimeout(() => {
        processUserInput("I feel bold today and want something special");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleProductAction = (action: Action, product?: Product) => {
    switch (action.type) {
      case 'add_to_cart':
        addMessage({
          type: 'system',
          content: `✅ Added ${product?.name || 'items'} to your cart!`,
          timestamp: new Date()
        });
        break;
      case 'view_product':
        if (product) {
          router.push(`/product/${product.id}`);
        } else {
          router.push('/cart');
        }
        break;
      case 'compare':
        addMessage({
          type: 'ai',
          content: "Great choice! Let me find similar items to compare...",
          timestamp: new Date()
        });
        break;
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.aiMessage,
        isSystem && styles.systemMessage
      ]}>
        {!isUser && !isSystem && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isSystem && styles.systemBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText,
            isSystem && styles.systemText
          ]}>
            {message.content}
          </Text>
        </View>

        {message.products && message.products.length > 0 && (
          <View style={styles.productsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {message.products.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <Text style={styles.productReason} numberOfLines={2}>
                      {product.reason}
                    </Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { width: `${product.confidence * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {message.actions && message.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleProductAction(action, message.products?.[0])}
              >
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={16} color="#fff" />
      </View>
      <View style={[styles.messageBubble, styles.aiBubble]}>
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => processUserInput("I feel luxurious today")}
        >
          <Text style={styles.quickActionText}>💎 Feeling Luxurious</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => processUserInput("Show me casual weekend outfits")}
        >
          <Text style={styles.quickActionText}>👕 Weekend Casual</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => processUserInput("I need professional work clothes")}
        >
          <Text style={styles.quickActionText}>💼 Work Professional</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => processUserInput("Something bold and daring")}
        >
          <Text style={styles.quickActionText}>🔥 Bold & Daring</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Co-pilot</Text>
          <Text style={styles.headerSubtitle}>Your Personal Shopping Assistant</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>
            {conversationState.mood && `${conversationState.mood} mood`}
          </Text>
        </View>
      </LinearGradient>

      {/* Messages */}
      <Animated.View 
        style={[
          styles.messagesContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScrollView}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isTyping && renderTypingIndicator()}
        </ScrollView>
      </Animated.View>

      {/* Quick Actions */}
      {messages.length <= 2 && renderQuickActions()}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tell me what you're looking for or how you're feeling..."
            placeholderTextColor="#999"
            multiline
            maxLength={200}
          />
          
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={handleVoiceInput}
          >
            <Ionicons 
              name={isListening ? "stop" : "mic"} 
              size={20} 
              color={isListening ? "#ff4444" : "#667eea"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerBackButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff99',
    marginTop: 2,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  headerStatsText: {
    fontSize: 12,
    color: '#ffffff99',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesScrollView: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  systemMessage: {
    justifyContent: 'center',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  systemBubble: {
    backgroundColor: '#f0f4ff',
    alignSelf: 'center',
    borderRadius: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  systemText: {
    color: '#667eea',
    fontWeight: '600',
    textAlign: 'center',
  },
  productsContainer: {
    marginTop: 12,
    marginLeft: 40, // Account for avatar width
  },
  productCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    marginTop: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  productReason: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 3,
    backgroundColor: '#e0e0e0',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginLeft: 40, // Account for avatar width
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
  },
  voiceButtonActive: {
    backgroundColor: '#ffebee',
  },
  sendButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});