import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from './navigation/TabNavigator';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: string;
  capabilities?: string[];
}

export default function AisleAIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome_001',
      type: 'ai',
      message: "Hi! I'm Aisle 🤖, your trusted companion in the AisleMarts world and beyond! ✨\n\nI'm here to help you with:\n🛍️ Shopping and product discovery\n👗 Fashion and lifestyle advice\n🎬 Live streaming and modeling\n📈 Business growth opportunities\n🌍 Global marketplace navigation\n\nHow can I assist you today?",
      timestamp: new Date().toISOString(),
      capabilities: [
        'product_discovery',
        'fashion_advice',
        'live_shopping_assistance',
        'business_growth',
        'lifestyle_recommendations'
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call Aisle AI API
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/aisle-ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo_user_001',
          message: inputMessage.trim(),
          language: 'en',
          channel: 'text'
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          type: 'ai',
          message: data.response,
          timestamp: new Date().toISOString(),
          capabilities: data.capabilities
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('AI response failed');
      }
    } catch (error) {
      // Fallback AI response
      const fallbackResponses = [
        "I'm here to help! Let me find the perfect products for your lifestyle needs. What are you looking for today? 🛍️",
        "Great question! I can help you discover amazing fashion and lifestyle content. Would you like me to show you trending items? 👗",
        "As your AI shopping companion, I'm excited to help you explore AisleMarts! What kind of products interest you? 🌟",
        "I love helping with fashion and lifestyle choices! Tell me more about your style preferences and I'll find perfect matches! ✨"
      ];

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date().toISOString(),
        capabilities: ['product_discovery', 'fashion_advice', 'lifestyle_recommendations']
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCapabilityPress = (capability: string) => {
    const capabilityMessages: { [key: string]: string } = {
      'product_discovery': 'Show me trending products',
      'fashion_advice': 'Give me fashion advice',
      'live_shopping_assistance': 'Help me with live shopping',
      'business_growth': 'Tell me about business opportunities',
      'lifestyle_recommendations': 'Give me lifestyle recommendations'
    };

    setInputMessage(capabilityMessages[capability] || capability);
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.type === 'user' ? styles.userMessageContainer : styles.aiMessageContainer
      ]}
    >
      {message.type === 'ai' && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>🤖</Text>
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          message.type === 'user' ? styles.userMessageBubble : styles.aiMessageBubble
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.type === 'user' ? styles.userMessageText : styles.aiMessageText
          ]}
        >
          {message.message}
        </Text>
        
        <Text
          style={[
            styles.messageTimestamp,
            message.type === 'user' ? styles.userTimestamp : styles.aiTimestamp
          ]}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {message.type === 'user' && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>👤</Text>
        </View>
      )}
    </View>
  );

  const renderCapabilities = (capabilities: string[]) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.capabilitiesContainer}
      contentContainerStyle={styles.capabilitiesContent}
    >
      {capabilities.map((capability, index) => (
        <TouchableOpacity
          key={index}
          style={styles.capabilityChip}
          onPress={() => handleCapabilityPress(capability)}
        >
          <Text style={styles.capabilityText}>
            {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Aisle AI 🤖</Text>
          <Text style={styles.headerSubtitle}>Your Shopping Companion</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert(
            'Aisle AI Info',
            'I\'m your smart, friendly companion for:\n\n🛍️ Product discovery\n👗 Fashion advice\n🎬 Live shopping\n📈 Business growth\n🌍 Global marketplace\n\nPowered by AisleMarts AI!'
          )}
        >
          <Text style={styles.infoButton}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <View key={message.id}>
              {renderMessage(message)}
              {message.type === 'ai' && message.capabilities && (
                renderCapabilities(message.capabilities)
              )}
            </View>
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.aiAvatar}>
                <Text style={styles.aiAvatarText}>🤖</Text>
              </View>
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingText}>Aisle AI is thinking...</Text>
                <View style={styles.typingIndicator}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Aisle AI anything..."
              placeholderTextColor="#666666"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxHeight={100}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
          
          {/* Quick Actions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsContainer}
          >
            {[
              { label: '🛍️ Shop', action: 'Show me trending products' },
              { label: '👗 Fashion', action: 'Give me fashion advice' },
              { label: '🔴 Live', action: 'Show me live streams' },
              { label: '📈 Business', action: 'Tell me about selling on AisleMarts' },
              { label: '🌟 Lifestyle', action: 'Give me lifestyle recommendations' }
            ].map((quickAction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionButton}
                onPress={() => setInputMessage(quickAction.action)}
              >
                <Text style={styles.quickActionText}>{quickAction.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <TabNavigator />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  infoButton: {
    fontSize: 18,
    color: '#D4AF37',
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
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    alignSelf: 'flex-end',
  },
  aiAvatarText: {
    fontSize: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    alignSelf: 'flex-end',
  },
  userAvatarText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
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
  messageTimestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  userTimestamp: {
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  capabilitiesContainer: {
    marginLeft: 44,
    marginTop: 8,
    marginBottom: 16,
  },
  capabilitiesContent: {
    paddingRight: 16,
  },
  capabilityChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  capabilityText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  loadingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '75%',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
    marginRight: 4,
  },
  inputContainer: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100, // Account for tab navigator
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#D4AF37',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
});