import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useHaptics } from '../hooks/useHaptics';

const { width, height } = Dimensions.get('window');

interface PermissionScreenProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  onNotNow: () => void;
  type: 'camera' | 'microphone' | 'speech' | 'photos' | 'location' | 'notifications';
}

const permissionConfig = {
  camera: {
    icon: 'camera-outline',
    title: 'Unlock Smart Scanning',
    subtitle: 'Use your camera to scan barcodes & products instantly. No typing, no searching — just point & shop.',
    gradient: ['#667eea', '#764ba2', '#f093fb'],
  },
  microphone: {
    icon: 'mic-outline',
    title: 'Speak to Your Avatar',
    subtitle: 'Enable microphone access to shop with your voice. Just say what you need — your AI Avatar listens and responds.',
    gradient: ['#4facfe', '#00f2fe', '#667eea'],
  },
  speech: {
    icon: 'musical-notes-outline',
    title: 'Smarter Voice Commands',
    subtitle: 'Allow speech recognition so your Avatar can transcribe your words in real time for faster, smoother conversations.',
    gradient: ['#667eea', '#764ba2', '#f093fb'],
  },
  photos: {
    icon: 'images-outline',
    title: 'Share & Upload Instantly',
    subtitle: 'Give access to your photos & gallery to upload items, receipts, and product images — making selling and sharing effortless.',
    gradient: ['#fa709a', '#fee140', '#f093fb'],
  },
  location: {
    icon: 'location-outline',
    title: 'Find What\'s Nearby',
    subtitle: 'Enable location to discover nearby deals, pickup spots, and delivery options tailored just for you.',
    gradient: ['#43e97b', '#38f9d7', '#4facfe'],
  },
  notifications: {
    icon: 'notifications-outline',
    title: 'Stay in the Loop',
    subtitle: 'Turn on notifications to get updates on your orders, deals, and AI Avatar tips — never miss a moment.',
    gradient: ['#fa709a', '#fee140', '#f093fb'],
  },
};

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  visible,
  onClose,
  onContinue,
  onNotNow,
  type,
}) => {
  const { triggerHaptic } = useHaptics();
  const config = permissionConfig[type];

  const handleContinue = () => {
    triggerHaptic('success');
    onContinue();
  };

  const handleNotNow = () => {
    triggerHaptic('light');
    onNotNow();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={config.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(200)}
          style={styles.container}
        >
          <BlurView intensity={25} style={styles.card}>
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name={config.icon as any}
                  size={64}
                  color="#ffffff"
                  style={styles.icon}
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>{config.title}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>{config.subtitle}</Text>

              {/* Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleContinue}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleNotNow}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Not Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    textShadowColor: 'rgba(79, 172, 254, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

// Individual permission screen components for easy use
export const CameraPermissionScreen = (props: Omit<PermissionScreenProps, 'type'>) => (
  <PermissionScreen {...props} type="camera" />
);

export const MicrophonePermissionScreen = (props: Omit<PermissionScreenProps, 'type'>) => (
  <PermissionScreen {...props} type="microphone" />
);

export const SpeechPermissionScreen = (props: Omit<PermissionScreenProps, 'type'>) => (
  <PermissionScreen {...props} type="speech" />
);

export const PhotosPermissionScreen = (props: Omit<PermissionScreenProps, 'type'>) => (
  <PermissionScreen {...props} type="photos" />
);

export const LocationPermissionScreen = (props: Omit<PermissionScreenProps, 'type'>) => (
  <PermissionScreen {...props} type="location" />
);

export const NotificationsPermissionScreen = (props: Omit<PermissionScreenProps, 'type'>) => (
  <PermissionScreen {...props} type="notifications" />
);