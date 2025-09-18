/**
 * AI Assistant MVP - Minimum Lovable Flow
 * Three key intents with deep links to existing features
 * Voice chat functionality for dev/demo mode
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii } from '../src/theme/tokens';
import { useAnalytics } from '../src/utils/analytics';
import { VOICE, shouldShowVoice } from '../src/config/voice';
import { useIsDevBuild } from '../src/utils/useIsDevBuild';
import { OpenAIVoiceAdapter } from '../src/voice/OpenAIVoiceAdapter';

const AI_INTENTS = [
  {
    id: 'find_best_price',
    title: 'Find the best price near me',
    icon: '📍',
    description: 'Search nearby merchants for best deals',
    route: '/nearby',
    response: 'I\'ll search nearby merchants for the best prices on products you need. What are you looking for?',
    cta: 'Browse Nearby Merchants'
  },
  {
    id: 'business_quote',
    title: 'Start a business quote',
    icon: '📑',
    description: 'Create RFQ for bulk procurement',
    route: '/b2b',
    response: 'I can help you create a Request for Quote (RFQ) for bulk purchases. Let\'s get started!',
    cta: 'Create New RFQ'
  },
  {
    id: 'track_order',
    title: 'Track my reservation/order',
    icon: '📦',
    description: 'Check status of your bookings',
    route: '/orders',
    response: 'I\'ll help you track your reservations and orders. Let me pull up your recent activity.',
    cta: 'View My Orders'
  }
];

export default function AIAssistantScreen() {
  const router = useRouter();
  const { track } = useAnalytics();
  const isDev = useIsDevBuild();
  
  // AI Assistant state
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  
  // Voice chat state (dev/demo only)
  const [voiceUnlocked, setVoiceUnlocked] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const voiceAdapterRef = useRef<OpenAIVoiceAdapter | null>(null);

  // Check if voice features should be visible
  const canShowVoice = shouldShowVoice(isDev, voiceUnlocked);

  // Cleanup voice adapter on unmount
  useEffect(() => {
    return () => {
      if (voiceAdapterRef.current) {
        voiceAdapterRef.current.cleanup();
      }
    };
  }, []);

  // Secret gesture to unlock voice in dev mode
  const onLongPressHeader = () => {
    if (VOICE.devOnly && !voiceUnlocked) {
      setVoiceUnlocked(true);
      Alert.alert('Voice Chat Unlocked', 'Voice features are now available for demo purposes.');
      track('voice_dev_unlock', { timestamp: new Date().toISOString() });
    }
  };

  // Voice chat functionality
  const handleVoicePress = async () => {
    try {
      if (!voiceAdapterRef.current) {
        voiceAdapterRef.current = new OpenAIVoiceAdapter();
      }

      if (!listening) {
        setListening(true);
        setVoiceResponse(null);
        
        track('voice_chat_start', { 
          feature: 'ai_assistant', 
          timestamp: new Date().toISOString() 
        });

        const { transcript, reply, audioUri } = await voiceAdapterRef.current.startConversation();
        
        // Update UI with response
        setVoiceResponse(`You said: "${transcript}"\n\nAisle: ${reply}`);
        
        // Play audio response if available
        if (audioUri) {
          await voiceAdapterRef.current.play(audioUri);
        }

        track('voice_chat_complete', { 
          transcript_length: transcript.length,
          reply_length: reply.length,
          has_audio: !!audioUri
        });

      } else {
        // Stop listening
        setListening(false);
        await voiceAdapterRef.current.stop();
        
        track('voice_chat_stop', { 
          manual_stop: true 
        });
      }
    } catch (error: any) {
      setListening(false);
      console.error('Voice chat error:', error);
      
      Alert.alert(
        'Voice Chat Error', 
        error?.message || 'Failed to process voice request. Please try again.',
        [{ text: 'OK' }]
      );

      track('voice_chat_error', { 
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleIntentSelect = (intent: any) => {
    setSelectedIntent(intent.id);
    
    // Track AI Assistant interaction
    track('assistant_intent_selected', {
      intent_id: intent.id,
      intent_title: intent.title,
      origin: 'ai_chat_screen'
    });
  };

  const handleCTAPress = (intent: any) => {
    // Track assistant CTA click
    track('assistant_cta_click', {
      intent_id: intent.id,
      target_route: intent.route,
      cta_label: intent.cta
    });

    // Navigate to feature screen
    router.push(intent.route);
  };

  const selectedIntentData = AI_INTENTS.find(i => i.id === selectedIntent);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with secret long-press to unlock voice */}
      <Pressable onLongPress={onLongPressHeader} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <View style={styles.headerSpacer}>
          {/* Voice teaser or dev indicator */}
          {VOICE.teaser && !canShowVoice && (
            <Text style={styles.voiceTeaser}>🎙️</Text>
          )}
          {voiceUnlocked && (
            <Text style={styles.devIndicator}>DEV</Text>
          )}
        </View>
      </Pressable>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeIcon}>🤖</Text>
          <Text style={styles.welcomeTitle}>Hi! I'm your AisleMarts Assistant</Text>
          <Text style={styles.welcomeDesc}>
            I can help you with shopping, business procurement, and order tracking. What would you like to do?
          </Text>
        </View>

        {/* Voice Response Section (Dev/Demo Only) */}
        {canShowVoice && voiceResponse && (
          <View style={styles.voiceResponseSection}>
            <Text style={styles.sectionTitle}>Voice Chat Response</Text>
            <View style={styles.voiceResponseCard}>
              <Text style={styles.voiceResponseText}>{voiceResponse}</Text>
            </View>
          </View>
        )}

        {/* Intent Options */}
        <View style={styles.intentsSection}>
          <Text style={styles.sectionTitle}>How can I help you today?</Text>
          
          {AI_INTENTS.map((intent) => (
            <Pressable
              key={intent.id}
              onPress={() => handleIntentSelect(intent)}
              style={[
                styles.intentCard,
                selectedIntent === intent.id && styles.intentCardSelected
              ]}
            >
              <Text style={styles.intentIcon}>{intent.icon}</Text>
              <View style={styles.intentContent}>
                <Text style={styles.intentTitle}>{intent.title}</Text>
                <Text style={styles.intentDesc}>{intent.description}</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={selectedIntent === intent.id ? colors.cyan : colors.textDim} 
              />
            </Pressable>
          ))}
        </View>

        {/* AI Response */}
        {selectedIntentData && (
          <View style={styles.responseSection}>
            <View style={styles.assistantBubble}>
              <Text style={styles.assistantIcon}>🤖</Text>
              <Text style={styles.assistantResponse}>
                {selectedIntentData.response}
              </Text>
            </View>
            
            <Pressable
              onPress={() => handleCTAPress(selectedIntentData)}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>{selectedIntentData.cta}</Text>
              <Ionicons name="arrow-forward" size={16} color="#0f172a" />
            </Pressable>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <Pressable 
              style={styles.quickAction}
              onPress={() => {
                track('assistant_quick_action', { action: 'scan_product' });
                router.push('/nearby/scan');
              }}
            >
              <Text style={styles.quickActionIcon}>📷</Text>
              <Text style={styles.quickActionLabel}>Scan Product</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickAction}
              onPress={() => {
                track('assistant_quick_action', { action: 'find_nearby' });
                router.push('/nearby');
              }}
            >
              <Text style={styles.quickActionIcon}>📍</Text>
              <Text style={styles.quickActionLabel}>Find Nearby</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickAction}
              onPress={() => {
                track('assistant_quick_action', { action: 'discover' });
                router.push('/discover');
              }}
            >
              <Text style={styles.quickActionIcon}>🔎</Text>
              <Text style={styles.quickActionLabel}>Search Products</Text>
            </Pressable>
          </View>
        </View>

        {/* Beta Notice */}
        <View style={styles.betaNotice}>
          <Text style={styles.betaText}>
            💡 This is an early preview of AI Assistant. More capabilities coming soon!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.panel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  welcomeDesc: {
    color: colors.textDim,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  intentsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  intentCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentCardSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.glass.accent,
  },
  intentIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  intentContent: {
    flex: 1,
  },
  intentTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  intentDesc: {
    color: colors.textDim,
    fontSize: 14,
  },
  responseSection: {
    marginBottom: spacing.xl,
  },
  assistantBubble: {
    backgroundColor: colors.glass.accent,
    borderColor: colors.border.accent,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  assistantIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  assistantResponse: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: colors.cyan,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ctaButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  betaNotice: {
    backgroundColor: colors.glass.warning,
    borderColor: colors.border.warning,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  betaText: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
});