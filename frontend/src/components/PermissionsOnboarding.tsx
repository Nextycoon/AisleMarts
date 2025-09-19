import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  useCameraPermission, 
  useMicrophonePermission, 
  useLocationPermission, 
  usePhotosPermission,
  useNotificationsPermission 
} from '../hooks/usePermissions';

const { width, height } = Dimensions.get('window');

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  required: boolean;
  granted: boolean;
}

interface PermissionsOnboardingProps {
  visible: boolean;
  onComplete: (permissions: { [key: string]: boolean }) => void;
  onSkip?: () => void;
}

export default function PermissionsOnboarding({ 
  visible, 
  onComplete, 
  onSkip 
}: PermissionsOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'microphone',
      title: 'Voice Shopping',
      description: 'Talk to Aisle AI for hands-free shopping and product search',
      icon: 'mic-outline',
      required: true,
      granted: false,
    },
    {
      id: 'camera',
      title: 'Product Scanning',
      description: 'Scan barcodes and take photos to find products instantly',
      icon: 'camera-outline',
      required: false,
      granted: false,
    },
    {
      id: 'location',
      title: 'Nearby Stores',
      description: 'Find local stores, delivery options, and personalized deals',
      icon: 'location-outline',
      required: false,
      granted: false,
    },
    {
      id: 'photos',
      title: 'Photo Library',
      description: 'Save product images and access your photos for uploads',
      icon: 'images-outline',
      required: false,
      granted: false,
    },
    {
      id: 'notifications',
      title: 'Order Updates',
      description: 'Get notified about order status, deals, and delivery updates',
      icon: 'notifications-outline',
      required: false,
      granted: false,
    },
  ]);
  
  const { requestMicrophone } = useMicrophonePermission();
  const { requestCamera } = useCameraPermission();
  const { requestLocation } = useLocationPermission();
  const { requestPhotos } = usePhotosPermission();
  const { requestNotifications } = useNotificationsPermission();

  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = async (permission: PermissionItem) => {
    if (isRequesting) return;
    
    setIsRequesting(true);
    let result = 'denied';

    try {
      // Check if running in web environment
      if (Platform.OS === 'web') {
        // Simulate permission request in web for demo purposes
        Alert.alert(
          `${permission.title} Permission`,
          `In a real mobile app, this would request ${permission.title.toLowerCase()} permission. On web, we'll simulate approval for demo purposes.`,
          [
            { 
              text: 'Simulate Grant', 
              onPress: () => {
                result = 'granted';
                const granted = true;
                setPermissions(prev => prev.map(p => 
                  p.id === permission.id ? { ...p, granted } : p
                ));
              }
            },
            { 
              text: 'Simulate Deny', 
              style: 'cancel',
              onPress: () => {
                result = 'denied';
                const granted = false;
                setPermissions(prev => prev.map(p => 
                  p.id === permission.id ? { ...p, granted } : p
                ));
              }
            }
          ]
        );
        return;
      }

      // Real mobile permission requests
      switch (permission.id) {
        case 'microphone':
          result = await requestMicrophone('voice-shopping');
          break;
        case 'camera':
          result = await requestCamera('product-scanning');
          break;
        case 'location':
          result = await requestLocation('nearby-stores');
          break;
        case 'photos':
          result = await requestPhotos('product-images');
          break;
        case 'notifications':
          result = await requestNotifications('order-updates');
          break;
      }

      const granted = result === 'granted';
      
      setPermissions(prev => prev.map(p => 
        p.id === permission.id ? { ...p, granted } : p
      ));

      if (!granted && permission.required) {
        Alert.alert(
          `${permission.title} Required`,
          `AisleMarts needs ${permission.title.toLowerCase()} access for core functionality. Please enable it in Settings.`,
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error(`Error requesting ${permission.id} permission:`, error);
      
      // Fallback for web or error cases
      Alert.alert(
        'Permission Request',
        `Unable to request ${permission.title} permission. This may be because you're testing in a web browser. Permissions work properly on real mobile devices.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < permissions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const permissionStatus = permissions.reduce((acc, p) => {
      acc[p.id] = p.granted;
      return acc;
    }, {} as { [key: string]: boolean });

    // Save onboarding completion
    await AsyncStorage.setItem('permissions_onboarding_completed', 'true');
    await AsyncStorage.setItem('permissions_status', JSON.stringify(permissionStatus));

    onComplete(permissionStatus);
  };

  const handleSkipAll = () => {
    Alert.alert(
      'Skip Permissions Setup?',
      'You can enable permissions later in Settings, but some features may not work properly.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        { text: 'Skip for Now', onPress: () => onSkip?.() }
      ]
    );
  };

  const currentPermission = permissions[currentStep];
  const progress = ((currentStep + 1) / permissions.length) * 100;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={['#0f0f23', '#1a1a3a', '#2d2d5f']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome to AisleMarts</Text>
              <Text style={styles.subtitle}>
                Let's set up permissions for the best shopping experience
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {currentStep + 1} of {permissions.length}
                </Text>
              </View>
            </View>

            {/* Web Demo Notice */}
            {Platform.OS === 'web' && (
              <View style={styles.webDemoNotice}>
                <Ionicons name="information-circle-outline" size={20} color="#9FE7F5" />
                <Text style={styles.webDemoText}>
                  Web Preview Mode - Permissions will simulate mobile behavior
                </Text>
              </View>
            )}

            {/* Permission Card */}
            <View style={styles.permissionCard}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={currentPermission.icon} 
                  size={64} 
                  color="#EBD6A0" 
                />
                {currentPermission.required && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.permissionTitle}>
                {currentPermission.title}
              </Text>
              
              <Text style={styles.permissionDescription}>
                {currentPermission.description}
              </Text>

              {/* Permission Status */}
              {currentPermission.granted && (
                <View style={styles.grantedContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.grantedText}>Permission Granted</Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {!currentPermission.granted ? (
                <TouchableOpacity
                  style={[styles.primaryButton, isRequesting && styles.buttonDisabled]}
                  onPress={() => requestPermission(currentPermission)}
                  disabled={isRequesting}
                >
                  <Text style={styles.primaryButtonText}>
                    {isRequesting ? 'Requesting...' : `Allow ${currentPermission.title}`}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleNext}
                >
                  <Text style={styles.primaryButtonText}>
                    {currentStep < permissions.length - 1 ? 'Next' : 'Complete Setup'}
                  </Text>
                </TouchableOpacity>
              )}

              {!currentPermission.required && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleNext}
                >
                  <Text style={styles.secondaryButtonText}>
                    Skip for Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Skip All */}
            <TouchableOpacity
              style={styles.skipAllButton}
              onPress={handleSkipAll}
            >
              <Text style={styles.skipAllText}>Skip All Permissions</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#EBD6A0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 22,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EBD6A0',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
  },
  permissionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginVertical: 32,
    borderWidth: 1,
    borderColor: 'rgba(235,214,160,0.2)',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  requiredBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#EBD6A0',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  grantedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderRadius: 20,
  },
  grantedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  actionContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#EBD6A0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f23',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minHeight: 52,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  skipAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipAllText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
});