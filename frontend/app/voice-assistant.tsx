/**
 * 🎤 AisleMarts Voice AI Shopping Assistant
 * Next-generation voice-powered luxury shopping experience
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function VoiceAssistantScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([
    {
      type: 'assistant',
      message: 'Welcome to AisleMarts Voice Assistant! I can help you discover luxury products, track orders, and provide personalized shopping guidance. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleVoicePress = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        const mockResponse = "I found several luxury watches under $5,000 that match your style. The Omega Seamaster and TAG Heuer Formula 1 are particularly popular with users who have similar preferences. Would you like me to show you detailed comparisons?";
        setCurrentResponse(mockResponse);
        setConversationHistory(prev => [
          ...prev,
          {
            type: 'user',
            message: 'Find me luxury watches under $5000',
            timestamp: new Date().toISOString()
          },
          {
            type: 'assistant', 
            message: mockResponse,
            timestamp: new Date().toISOString()
          }
        ]);
      }, 2000);
    } else {
      // Start listening
      setIsListening(true);
      setCurrentResponse('');
    }
  };

  const quickActions = [
    { id: 1, title: 'Find Products', icon: '🔍', action: () => handleQuickAction('search') },
    { id: 2, title: 'Track Orders', icon: '📦', action: () => handleQuickAction('orders') },
    { id: 3, title: 'Get Deals', icon: '💰', action: () => handleQuickAction('deals') },
    { id: 4, title: 'Style Advice', icon: '✨', action: () => handleQuickAction('style') },
  ];

  const handleQuickAction = (type: string) => {
    const responses = {
      search: "What type of luxury product are you looking for today? I can help you find watches, jewelry, fashion, or home décor items.",
      orders: "Let me check your recent orders. You have 2 items in transit and 1 delivered this week. Would you like details on any specific order?",
      deals: "I found exclusive member deals on luxury brands! There's a 25% off premium skincare and 15% off designer watches. Interested?",
      style: "Based on your purchase history, I see you love modern luxury aesthetics. For this season, I recommend exploring sustainable luxury brands and minimalist jewelry pieces."
    };

    setConversationHistory(prev => [
      ...prev,
      {
        type: 'user',
        message: `Help me with ${type}`,
        timestamp: new Date().toISOString()
      },
      {
        type: 'assistant',
        message: responses[type] || "I'm here to help! Please tell me what you're looking for.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Voice Assistant</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Voice Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isListening ? '🎤 Listening...' : isProcessing ? '🧠 Processing...' : '💬 Ready to help'}
        </Text>
      </View>

      {/* Conversation History */}
      <ScrollView style={styles.conversationContainer} showsVerticalScrollIndicator={false}>
        {conversationHistory.map((item, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              item.type === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            <Text style={styles.messageIcon}>
              {item.type === 'user' ? '👤' : '🤖'}
            </Text>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.messageTime}>
                {new Date(item.timestamp).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={action.action}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Voice Control Button */}
      <View style={styles.voiceControlContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={handleVoicePress}
          disabled={isProcessing}
        >
          <Animated.View style={[styles.voiceButtonInner, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.voiceButtonIcon}>
              {isProcessing ? '⏳' : isListening ? '🎤' : '🎙️'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.voiceButtonText}>
          {isProcessing ? 'Processing...' : isListening ? 'Tap to stop' : 'Tap to speak'}
        </Text>
      </View>

      {/* Features Info */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Voice Assistant Features</Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>🗣️ Natural language understanding</Text>
          <Text style={styles.featureItem}>🌍 Multi-language support</Text>
          <Text style={styles.featureItem}>🎯 Personalized recommendations</Text>
          <Text style={styles.featureItem}>📊 Order tracking & management</Text>
        </View>
      </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  conversationContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  assistantMessage: {
    flexDirection: 'row',
  },
  messageIcon: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  messageBubble: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    padding: 12,
    maxWidth: width * 0.75,
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    textAlign: 'right',
  },
  quickActionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  voiceControlContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  voiceButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonIcon: {
    fontSize: 32,
    color: '#000000',
  },
  voiceButtonText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  featuresContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    fontSize: 12,
    color: '#888888',
    marginRight: 16,
    marginBottom: 4,
  },
});