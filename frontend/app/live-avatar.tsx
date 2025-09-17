/**
 * 🤖 LIVE AI AVATAR - Revolutionary Shopping Experience
 * The world's first conversational AI shopping assistant
 * Features: Voice recognition, speech synthesis, visual feedback, gesture control
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { useMicrophonePermission } from '../src/hooks/usePermissions';
import { useUserRoles } from '../src/context/UserRolesContext';
import { TierBadge } from '../src/components/TierBadge';
import { 
  PermissionScreen,
  MicrophonePermissionScreen 
} from '../src/components/PermissionScreens';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  type: 'user' | 'avatar';
  timestamp: Date;
}

export default function LiveAvatarScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [currentResponse, setCurrentResponse] = useState('');
  const [showMicPermission, setShowMicPermission] = useState(false);
  
  // Permission hook
  const { requestMicrophone, isLoading: isPermissionLoading } = useMicrophonePermission();
  
  // User Roles & Personalization
  const { profile, getRoleColors, getPersonalizedGreeting, hasFeature } = useUserRoles();
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startWelcomeSequence();
    setupAudioPermissions();
  }, []);

  const setupAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Voice features need microphone access to work properly.');
      }
    } catch (error) {
      console.error('Audio permission error:', error);
    }
  };

  const startWelcomeSequence = () => {
    setTimeout(() => {
      // Get personalized cinematic greeting
      const personalizedGreeting = getPersonalizedGreeting();
      const roleSpecificMessage = getRoleSpecificWelcome();
      const fullGreeting = `${personalizedGreeting} ${roleSpecificMessage}`;
      
      speak(fullGreeting);
      addMessage(fullGreeting, 'avatar');
    }, 1000);
  };

  const getRoleSpecificWelcome = (): string => {
    if (!profile) return "I'm your personal AI shopping assistant. How can I help you today?";
    
    switch (profile.role) {
      case 'shopper':
        return "I'm here to help you discover amazing deals and find exactly what you're looking for. What would you like to explore?";
      case 'seller':
        return "Ready to help you manage your inventory, boost sales, and connect with customers. How can I assist your business today?";
      case 'hybrid':
        return "Whether you're shopping or selling, I've got you covered. What would you like to do first?";
      default:
        return "I'm your personal AI marketplace assistant. How can I help you today?";
    }
  };

  const addMessage = (text: string, type: 'user' | 'avatar') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      setAvatarState('speaking');
      startSpeakingAnimation();
      
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.1,
        rate: 0.9,
        quality: Speech.VoiceQuality.Enhanced,
        onDone: () => {
          setIsSpeaking(false);
          setAvatarState('idle');
          stopSpeakingAnimation();
        },
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
          setAvatarState('idle');
          stopSpeakingAnimation();
        }
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      setAvatarState('idle');
    }
  };

  const startListening = async () => {
    if (isListening || isSpeaking) return;
    
    try {
      // Request microphone permission with beautiful pre-prompt
      const permissionResult = await requestMicrophone('voice_commands');
      
      if (permissionResult === 'granted') {
        setIsListening(true);
        setAvatarState('listening');
        startListeningAnimation();
        
        // Simulate voice recognition (replace with actual implementation)
        setTimeout(() => {
          const mockUserInput = generateMockUserInput();
          addMessage(mockUserInput, 'user');
          processUserInput(mockUserInput);
          setIsListening(false);
          stopListeningAnimation();
        }, 3000);
        
      } else if (permissionResult === 'denied') {
        // Fallback to text input
        Alert.alert(
          'Voice Not Available',
          'You can still chat with me using text! Tap the message button to type your request.',
          [{ text: 'OK' }]
        );
      } else if (permissionResult === 'blocked') {
        // Permission permanently denied - handled in permission manager
        console.log('Microphone permission blocked');
      }
      
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      setAvatarState('idle');
      stopListeningAnimation();
    }
  };

  const generateMockUserInput = () => {
    const mockInputs = [
      "I'm looking for organic coffee beans",
      "Show me electronics nearby",
      "What are today's best deals?",
      "I need to find a grocery store",
      "Help me order some fresh vegetables",
      "Where can I buy phone accessories?",
      "I want to see local restaurant options"
    ];
    return mockInputs[Math.floor(Math.random() * mockInputs.length)];
  };

  const processUserInput = async (input: string) => {
    setAvatarState('thinking');
    
    // AI Response Generation
    setTimeout(() => {
      const response = generateAIResponse(input);
      addMessage(response, 'avatar');
      speak(response);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('coffee')) {
      return "I found 5 local stores with organic coffee beans! There's a premium Ethiopian blend available at Westlands Market, just 2km away. Would you like me to reserve it for pickup?";
    }
    if (lowerInput.includes('electronics')) {
      return "Great choice! I see 12 electronics stores nearby. The closest one has a 20% discount on smartphones today. Shall I show you the details?";
    }
    if (lowerInput.includes('deals')) {
      return "Today's hottest deals include 30% off fresh produce at Nakumatt, buy-one-get-one electronics at Samsung Plaza, and free delivery on orders over 2000 KES. Which interests you most?";
    }
    if (lowerInput.includes('grocery')) {
      return "Perfect! I found 8 grocery stores within 5km. Tuskys Westlands has the freshest produce and offers 15-minute pickup windows. Would you like to see their inventory?";
    }
    if (lowerInput.includes('vegetables')) {
      return "Fresh vegetables are my specialty! I can show you organic farms, supermarkets, or local markets. The morning harvest at Limuru Farms just arrived - super fresh! Interested?";
    }
    
    return "That sounds interesting! I'm scanning all nearby options for you. AisleMarts has thousands of products and local partners. Let me find the perfect match for what you need!";
  };

  const startListeningAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false })
    ).start();
  };

  const stopListeningAnimation = () => {
    pulseAnim.setValue(1);
    glowAnim.setValue(0);
  };

  const startSpeakingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopSpeakingAnimation = () => {
    waveAnim.setValue(0);
  };

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      {/* Outer Glow Ring */}
      <Animated.View 
        style={[
          styles.glowRing,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(79,172,254,0.3)', 'rgba(102,126,234,0.3)', 'rgba(79,172,254,0.3)']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Main Avatar Circle */}
      <Animated.View 
        style={[
          styles.avatarCircle,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <BlurView intensity={30} style={styles.avatarBlur}>
          <LinearGradient
            colors={getAvatarColors()}
            style={styles.avatarGradient}
          >
            {renderAvatarContent()}
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Speaking Waves */}
      {isSpeaking && (
        <View style={styles.speakingWaves}>
          {[1, 2, 3, 4, 5].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.waveRing,
                {
                  opacity: waveAnim,
                  transform: [
                    { scale: Animated.multiply(waveAnim, i * 0.3 + 1) }
                  ]
                }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  const getAvatarColors = () => {
    const roleColors = getRoleColors();
    
    switch (avatarState) {
      case 'listening':
        return [roleColors.primary, roleColors.secondary];
      case 'thinking':
        return [roleColors.accent, roleColors.primary];
      case 'speaking':
        return ['#34C759', '#30D158'];
      default:
        return [roleColors.primary, roleColors.secondary];
    }
  };

  const renderAvatarContent = () => {
    switch (avatarState) {
      case 'listening':
        return <Ionicons name="mic" size={60} color="white" />;
      case 'thinking':
        return <Ionicons name="hourglass" size={60} color="white" />;
      case 'speaking':
        return <Ionicons name="volume-high" size={60} color="white" />;
      default:
        return <Ionicons name="person" size={60} color="white" />;
    }
  };

  const getRoleBasedQuickActions = () => {
    const roleColors = getRoleColors();
    
    if (!profile) {
      return [
        { id: 'deals', label: 'Deals', icon: 'flash', colors: ['#FF6B6B', '#FF8E53'], query: "Show me today's deals" },
        { id: 'nearby', label: 'Nearby', icon: 'location', colors: ['#4ECDC4', '#44A08D'], query: "Find nearby stores" },
        { id: 'shop', label: 'Shop', icon: 'bag', colors: ['#667eea', '#764ba2'], query: "Help me shop" }
      ];
    }
    
    switch (profile.role) {
      case 'shopper':
        return [
          { id: 'deals', label: 'Deals', icon: 'flash', colors: [roleColors.primary, roleColors.secondary], query: "Show me today's hottest deals" },
          { id: 'nearby', label: 'Nearby', icon: 'location', colors: ['#43e97b', '#38f9d7'], query: "Find products nearby" },
          { id: 'wishlist', label: 'Wishlist', icon: 'heart', colors: ['#f093fb', '#f5576c'], query: "Show my wishlist" }
        ];
      case 'seller':
        return [
          { id: 'orders', label: 'Orders', icon: 'receipt', colors: [roleColors.primary, roleColors.secondary], query: "Show my recent orders" },
          { id: 'inventory', label: 'Inventory', icon: 'cube', colors: ['#667eea', '#764ba2'], query: "Check my inventory status" },
          { id: 'insights', label: 'Insights', icon: 'analytics', colors: ['#f093fb', '#f5576c'], query: "Show sales insights" }
        ];
      case 'hybrid':
        return [
          { id: 'deals', label: 'Deals', icon: 'flash', colors: [roleColors.primary, roleColors.secondary], query: "Show me today's deals" },
          { id: 'orders', label: 'Orders', icon: 'receipt', colors: ['#43e97b', '#38f9d7'], query: "Check my orders" },
          { id: 'switch', label: 'Switch', icon: 'swap-horizontal', colors: ['#f093fb', '#f5576c'], query: "Switch between shopping and selling" }
        ];
      default:
        return [
          { id: 'deals', label: 'Deals', icon: 'flash', colors: ['#FF6B6B', '#FF8E53'], query: "Show me today's deals" },
          { id: 'nearby', label: 'Nearby', icon: 'location', colors: ['#4ECDC4', '#44A08D'], query: "Find nearby stores" },
          { id: 'shop', label: 'Shop', icon: 'bag', colors: ['#667eea', '#764ba2'], query: "Help me shop" }
        ];
    }
  };

  const getStatusText = () => {
    const roleColors = getRoleColors();
    
    switch (avatarState) {
      case 'listening':
        return 'I\'m listening...';
      case 'thinking':
        return 'Processing your request...';
      case 'speaking':
        return 'Speaking...';
      default:
        if (profile && profile.preferences.voiceEnabled) {
          return `${profile.name ? `Hi ${profile.name}! ` : ''}Tap to talk with me!`;
        }
        return 'Tap to talk with me!';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0C0F14', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Shopping Assistant</Text>
        <TouchableOpacity onPress={() => Speech.stop()}>
          <Ionicons name="stop-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* AI Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          onPress={startListening}
          disabled={isListening || isSpeaking}
          activeOpacity={0.8}
        >
          {renderAvatar()}
        </TouchableOpacity>
        
        <Text style={styles.statusText}>{getStatusText()}</Text>
        
        <View style={styles.stateIndicator}>
          <View style={[styles.stateDot, { backgroundColor: getAvatarColors()[0] }]} />
          <Text style={styles.stateText}>
            {avatarState.charAt(0).toUpperCase() + avatarState.slice(1)}
          </Text>
        </View>
      </View>

      {/* Conversation History */}
      <View style={styles.conversationSection}>
        <Text style={styles.conversationTitle}>Conversation</Text>
        <View style={styles.messagesContainer}>
          {messages.slice(-3).map((message) => (
            <BlurView key={message.id} intensity={15} style={styles.messageCard}>
              <View style={[
                styles.messageContent,
                message.type === 'user' ? styles.userMessage : styles.avatarMessage
              ]}>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            </BlurView>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {getRoleBasedQuickActions().map((action, index) => (
          <TouchableOpacity 
            key={action.id}
            style={styles.quickButton} 
            onPress={() => processUserInput(action.query)}
          >
            <LinearGradient colors={action.colors} style={styles.quickButtonGradient}>
              <Ionicons name={action.icon as any} size={20} color="white" />
              <Text style={styles.quickButtonText}>{action.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
  },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarBlur: {
    flex: 1,
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakingWaves: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(52,199,89,0.3)',
  },
  statusText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  stateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  conversationSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  messagesContainer: {
    gap: 8,
  },
  messageCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageContent: {
    padding: 12,
  },
  userMessage: {
    backgroundColor: 'rgba(79,172,254,0.1)',
    marginLeft: 40,
  },
  avatarMessage: {
    backgroundColor: 'rgba(52,199,89,0.1)',
    marginRight: 40,
  },
  messageText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  quickButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});