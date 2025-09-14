import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { voiceService } from '../services/VoiceService';

interface AisleAvatarProps {
  pose?: 'wave' | 'idle' | 'speak' | 'protective' | 'caring';
  expression?: 'joyful' | 'caring' | 'protective' | 'thoughtful' | 'confident';
  message?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showSpeechBubble?: boolean;
  enableVoice?: boolean;
  voiceMessage?: string;
}

export default function AisleAvatar({
  pose = 'idle',
  expression = 'joyful',
  message,
  onPress,
  size = 'medium',
  showSpeechBubble = false,
  enableVoice = false,
  voiceMessage,
}: AisleAvatarProps) {
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoicePermission, setShowVoicePermission] = useState(false);
  
  // Animation values
  const waveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const speechBubbleAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Auto-blink every 2.3-3.1 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      performBlink();
    }, Math.random() * 800 + 2300); // 2.3-3.1 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Handle voice message effect
  useEffect(() => {
    if (enableVoice && voiceMessage && pose === 'speak') {
      handleVoiceMessage();
    }
  }, [enableVoice, voiceMessage, pose]);

  const handleVoiceMessage = async () => {
    try {
      if (!voiceService.isVoiceEnabled()) {
        // Request permission
        const permission = await voiceService.requestVoicePermission();
        Alert.alert(
          'Voice Mode',
          permission.message,
          [
            { 
              text: 'Not Now', 
              style: 'cancel',
              onPress: () => setShowVoicePermission(false)
            },
            { 
              text: 'Enable Voice', 
              onPress: async () => {
                await voiceService.enableVoice();
                speakMessage();
              }
            }
          ]
        );
        return;
      }
      
      speakMessage();
    } catch (error) {
      console.error('Voice message failed:', error);
    }
  };

  const speakMessage = async () => {
    try {
      setIsSpeaking(true);
      const messageToSpeak = voiceMessage || message || "Hello! I'm Aisle.";
      await voiceService.speakAisle(messageToSpeak);
    } catch (error) {
      console.error('Failed to speak:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleAvatarPress = () => {
    if (onPress) {
      onPress();
    } else if (enableVoice) {
      // Default behavior: request voice permission or speak welcome
      handleVoiceMessage();
    }
  };
    switch (pose) {
      case 'wave':
        performWave();
        break;
      case 'speak':
        showSpeechBubble && animateSpeechBubble();
        break;
      case 'protective':
        performPulse('#FF9500');
        break;
      case 'caring':
        performPulse('#34C759');
        break;
      default:
        // Idle pose
        break;
    }
  }, [pose, showSpeechBubble]);

  const performBlink = () => {
    setIsBlinking(true);
    Animated.sequence([
      Animated.timing(blinkAnim, {
        toValue: 0.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(blinkAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => setIsBlinking(false));
  };

  const performWave = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 }
    ).start();
  };

  const performPulse = (color: string) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 2 }
    ).start();
  };

  const animateSpeechBubble = () => {
    Animated.sequence([
      Animated.timing(speechBubbleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(speechBubbleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getAvatarSize = () => {
    switch (size) {
      case 'small': return 60;
      case 'large': return 120;
      default: return 80;
    }
  };

  const getExpressionColor = () => {
    switch (currentExpression) {
      case 'joyful': return '#007AFF';
      case 'caring': return '#34C759';
      case 'protective': return '#FF9500';
      case 'thoughtful': return '#5856D6';
      case 'confident': return '#AF52DE';
      default: return '#007AFF';
    }
  };

  const getExpressionIcon = () => {
    switch (currentExpression) {
      case 'joyful': return 'happy-outline';
      case 'caring': return 'heart-outline';
      case 'protective': return 'shield-checkmark-outline';
      case 'thoughtful': return 'bulb-outline';
      case 'confident': return 'star-outline';
      default: return 'happy-outline';
    }
  };

  const avatarSize = getAvatarSize();
  const waveRotation = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <View style={styles.container}>
      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <Animated.View
          style={[
            styles.speechBubble,
            {
              transform: [{ scale: speechBubbleAnim }],
              opacity: speechBubbleAnim,
            },
          ]}
        >
          <Text style={styles.speechText}>{message}</Text>
          <View style={styles.speechTail} />
        </Animated.View>
      )}

      {/* Avatar */}
      <TouchableOpacity onPress={handleAvatarPress} disabled={false}>
        <Animated.View
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: getExpressionColor(),
              transform: [
                { scale: pulseAnim },
                pose === 'wave' ? { rotate: waveRotation } : { rotate: '0deg' },
              ],
            },
          ]}
        >
          {/* Main Avatar Icon */}
          <Animated.View style={{ opacity: blinkAnim }}>
            <Ionicons
              name={getExpressionIcon() as any}
              size={avatarSize * 0.4}
              color="white"
            />
          </Animated.View>

          {/* Blue Era Indicator */}
          <View style={styles.blueEraIndicator}>
            <Text style={styles.blueEraText}>💙</Text>
          </View>

          {/* Speaking indicator */}
          {isSpeaking && (
            <View style={styles.speakingIndicator}>
              <Text style={styles.speakingText}>🎤</Text>
            </View>
          )}

          {/* Pose-specific overlays */}
          {pose === 'wave' && (
            <View style={styles.waveEmoji}>
              <Text style={styles.emojiText}>👋</Text>
            </View>
          )}
          {pose === 'speak' && (
            <View style={styles.speakEmoji}>
              <Text style={styles.emojiText}>💬</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Avatar Label */}
      <Text style={styles.avatarLabel}>Aisle</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  blueEraIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  blueEraText: {
    fontSize: 14,
  },
  waveEmoji: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  speakEmoji: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  speakingIndicator: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  speakingText: {
    fontSize: 14,
  },
  emojiText: {
    fontSize: 16,
  },
  avatarLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  speechBubble: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  speechText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  speechTail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
});