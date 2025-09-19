import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  required: boolean;
  devices: string[];
  granted: boolean;
}

export default function OnboardingPermissionsScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'microphone',
      title: 'Microphone Access',
      description: 'Enable voice shopping with Aisle AI across all your devices. Talk naturally to find products, ask questions, and get personalized recommendations.',
      icon: 'mic-outline',
      required: true,
      devices: ['📱 Phone', '💻 Laptop', '📺 TV', '📱 iPad'],
      granted: false,
    },
    {
      id: 'camera',
      title: 'Camera Access',
      description: 'Scan product barcodes, take photos for visual search, and use AR features to see how products look in your space.',
      icon: 'camera-outline',
      required: false,
      devices: ['📱 Phone', '💻 Laptop', '📱 iPad'],
      granted: false,
    },
    {
      id: 'location',
      title: 'Location Services',
      description: 'Find nearby stores, get local deals, calculate delivery times, and discover location-specific products and services.',
      icon: 'location-outline',
      required: false,
      devices: ['📱 Phone', '📱 iPad'],
      granted: false,
    },
    {
      id: 'photos',
      title: 'Photo Library',
      description: 'Save product images, create wish lists with photos, and upload images for visual product search and recommendations.',
      icon: 'images-outline',
      required: false,
      devices: ['📱 Phone', '💻 Laptop', '📱 iPad'],
      granted: false,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Get alerts for order updates, delivery notifications, exclusive deals, price drops, and personalized shopping reminders.',
      icon: 'notifications-outline',
      required: false,
      devices: ['📱 Phone', '💻 Laptop', '📱 iPad', '📺 TV'],
      granted: false,
    },
    {
      id: 'contacts',
      title: 'Contacts Access',
      description: 'Share products with friends, send gift recommendations, and invite others to your shopping groups and wish lists.',
      icon: 'people-outline',
      required: false,
      devices: ['📱 Phone', '📱 iPad'],
      granted: false,
    },
    {
      id: 'calendar',
      title: 'Calendar Access',
      description: 'Set shopping reminders, schedule delivery times, plan purchases around events, and create shopping appointment alerts.',
      icon: 'calendar-outline',
      required: false,
      devices: ['📱 Phone', '💻 Laptop', '📱 iPad'],
      granted: false,
    },
  ]);

  const currentPermission = permissions[currentStep];
  const progress = ((currentStep + 1) / permissions.length) * 100;
  const currentDevice = Platform.OS;

  const handlePermissionRequest = () => {
    console.log(`🔥 Permission request: ${currentPermission.title}`);
    
    Alert.alert(
      `${currentPermission.title}`,
      `AisleMarts needs access to your ${currentPermission.title.toLowerCase()} to provide the best shopping experience.\n\n${currentPermission.description}\n\nSupported on: ${currentPermission.devices.join(', ')}\n\nCurrent platform: ${Platform.OS}`,
      [
        {
          text: 'Allow',
          onPress: () => {
            console.log(`✅ Permission granted: ${currentPermission.title}`);
            setPermissions(prev => prev.map(p => 
              p.id === currentPermission.id ? { ...p, granted: true } : p
            ));
            
            Alert.alert(
              'Permission Granted! 🎉',
              `${currentPermission.title} has been enabled. This enhances your AisleMarts experience across all supported devices.`,
              [{ text: 'Continue', onPress: handleNext }]
            );
          }
        },
        {
          text: 'Deny',
          style: 'cancel',
          onPress: () => {
            console.log(`❌ Permission denied: ${currentPermission.title}`);
            if (currentPermission.required) {
              Alert.alert(
                'Required Permission',
                `${currentPermission.title} is essential for core AisleMarts functionality. You can enable it later in your device settings.`,
                [
                  { text: 'Continue Anyway', onPress: handleNext },
                  { text: 'Try Again', onPress: handlePermissionRequest }
                ]
              );
            } else {
              Alert.alert(
                'Permission Denied',
                `You can enable ${currentPermission.title} later in Settings to unlock additional features.`,
                [{ text: 'Continue', onPress: handleNext }]
              );
            }
          }
        }
      ]
    );
  };

  const handleNext = () => {
    if (currentStep < permissions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const grantedCount = permissions.filter(p => p.granted).length;
    Alert.alert(
      'Permissions Setup Complete! 🚀',
      `You granted ${grantedCount} out of ${permissions.length} permissions.\n\nAisleMarts is now configured for your devices and ready to provide an amazing shopping experience!`,
      [
        { text: 'Continue to Welcome', onPress: () => router.push('/onboarding-welcome') }
      ]
    );
  };

  const handleSkip = () => {
    if (currentPermission.required) {
      Alert.alert(
        'Required Permission',
        `${currentPermission.title} is required for core AisleMarts functionality. Please grant this permission to continue.`,
        [{ text: 'OK' }]
      );
    } else {
      handleNext();
    }
  };

  const handleSkipAll = () => {
    Alert.alert(
      'Skip All Permissions?',
      'You can enable permissions later in your device settings, but some features may not work properly across your devices.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        { 
          text: 'Skip All', 
          onPress: () => {
            Alert.alert(
              'Permissions Skipped',
              'You can enable permissions later in Settings > AisleMarts on each of your devices.',
              [{ text: 'Continue', onPress: () => router.push('/onboarding-welcome') }]
            );
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a3a', '#2d2d5f']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#EBD6A0" />
            </TouchableOpacity>

            <View style={styles.titleSection}>
              <Text style={styles.title}>Device Permissions</Text>
              <Text style={styles.subtitle}>
                Enable features across all your devices for the best AisleMarts experience
              </Text>
            </View>
            
            {/* Platform Info */}
            <View style={styles.platformInfo}>
              <Ionicons name="phone-portrait-outline" size={16} color="#9FE7F5" />
              <Text style={styles.platformText}>
                Current Device: {Platform.OS === 'web' ? 'Web Browser' : Platform.OS} | 
                Multi-Device Setup
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {permissions.length} permissions
              </Text>
            </View>
          </View>

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

            {/* Supported Devices */}
            <View style={styles.devicesContainer}>
              <Text style={styles.devicesTitle}>Supported Devices:</Text>
              <View style={styles.devicesList}>
                {currentPermission.devices.map((device, index) => (
                  <View key={index} style={styles.deviceItem}>
                    <Text style={styles.deviceText}>{device}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Permission Status */}
            {currentPermission.granted && (
              <View style={styles.grantedContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.grantedText}>Permission Granted! ✅</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {!currentPermission.granted ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePermissionRequest}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#EBD6A0', '#D4C078']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    Enable {currentPermission.title}
                  </Text>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#0f0f23" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.buttonGradient}
                >
                  <Text style={[styles.primaryButtonText, { color: '#fff' }]}>
                    {currentStep < permissions.length - 1 ? 'Next Permission' : 'Complete Setup'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {!currentPermission.required && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  Skip This Permission
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Skip All */}
          <TouchableOpacity
            style={styles.skipAllButton}
            onPress={handleSkipAll}
            activeOpacity={0.7}
          >
            <Text style={styles.skipAllText}>Skip All Remaining Permissions</Text>
          </TouchableOpacity>

          {/* Permission Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Permission Summary:</Text>
            <Text style={styles.summaryText}>
              {permissions.filter(p => p.granted).length} granted, {permissions.filter(p => !p.granted).length} pending
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(235,214,160,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
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
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,231,245,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(159,231,245,0.3)',
  },
  platformText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#9FE7F5',
  },
  progressContainer: {
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
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(235,214,160,0.2)',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
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
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 16,
  },
  devicesContainer: {
    width: '100%',
    marginBottom: 16,
  },
  devicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9FE7F5',
    textAlign: 'center',
    marginBottom: 8,
  },
  devicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  deviceItem: {
    backgroundColor: 'rgba(159,231,245,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(159,231,245,0.3)',
  },
  deviceText: {
    fontSize: 12,
    color: '#9FE7F5',
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
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f23',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  skipAllButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  skipAllText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
  summaryContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9FE7F5',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#9FE7F5',
    opacity: 0.8,
  },
});