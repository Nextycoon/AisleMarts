import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function WorkingPermissionsScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState({
    microphone: false,
    camera: false,
    location: false,
    photos: false,
    notifications: false,
  });

  const permissionsList = [
    {
      id: 'microphone',
      title: 'Voice Shopping',
      description: 'Talk to Aisle AI for hands-free shopping and product search',
      icon: 'mic-outline' as const,
      required: true,
    },
    {
      id: 'camera',
      title: 'Product Scanning',
      description: 'Scan barcodes and take photos to find products instantly',
      icon: 'camera-outline' as const,
      required: false,
    },
    {
      id: 'location',
      title: 'Nearby Stores',
      description: 'Find local stores, delivery options, and personalized deals',
      icon: 'location-outline' as const,
      required: false,
    },
    {
      id: 'photos',
      title: 'Photo Library',
      description: 'Save product images and access your photos for uploads',
      icon: 'images-outline' as const,
      required: false,
    },
    {
      id: 'notifications',
      title: 'Order Updates',
      description: 'Get notified about order status, deals, and delivery updates',
      icon: 'notifications-outline' as const,
      required: false,
    },
  ];

  const currentPermission = permissionsList[currentStep];
  const progress = ((currentStep + 1) / permissionsList.length) * 100;

  const handlePermissionRequest = () => {
    console.log(`🔥 Permission button pressed: ${currentPermission.title}`);
    
    Alert.alert(
      `${currentPermission.title} Permission`,
      `AisleMarts would like to access your ${currentPermission.title.toLowerCase()}.\n\n${currentPermission.description}\n\nPlatform: ${Platform.OS}`,
      [
        {
          text: 'Allow',
          onPress: () => {
            console.log(`✅ Permission granted: ${currentPermission.title}`);
            setPermissions(prev => ({
              ...prev,
              [currentPermission.id]: true
            }));
            Alert.alert(
              'Permission Granted! 🎉',
              `${currentPermission.title} access has been granted. This would enable real ${currentPermission.title.toLowerCase()} functionality on a mobile device.`,
              [{ text: 'Great!', onPress: handleNext }]
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
                'Permission Required',
                `${currentPermission.title} is required for core AisleMarts functionality. You can enable it later in Settings.`,
                [
                  { text: 'Continue Anyway', onPress: handleNext },
                  { text: 'Try Again', onPress: handlePermissionRequest }
                ]
              );
            } else {
              Alert.alert(
                'Permission Denied',
                `You can enable ${currentPermission.title} later in Settings if you change your mind.`,
                [{ text: 'Continue', onPress: handleNext }]
              );
            }
          }
        }
      ]
    );
  };

  const handleNext = () => {
    if (currentStep < permissionsList.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete
      const grantedCount = Object.values(permissions).filter(Boolean).length;
      Alert.alert(
        'Permissions Setup Complete! 🚀',
        `You granted ${grantedCount} out of ${permissionsList.length} permissions.\n\nAisleMarts is now ready to provide you with an amazing shopping experience!`,
        [
          { text: 'Start Shopping', onPress: () => router.push('/') }
        ]
      );
    }
  };

  const handleSkip = () => {
    if (currentPermission.required) {
      Alert.alert(
        'Required Permission',
        `${currentPermission.title} is required for core functionality. Please grant this permission to continue.`,
        [{ text: 'OK' }]
      );
    } else {
      handleNext();
    }
  };

  const handleSkipAll = () => {
    Alert.alert(
      'Skip All Permissions?',
      'You can enable permissions later in Settings, but some features may not work properly.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        { 
          text: 'Skip All', 
          onPress: () => {
            Alert.alert(
              'Setup Skipped',
              'You can enable permissions later in your device Settings > AisleMarts.',
              [{ text: 'Continue', onPress: () => router.push('/') }]
            );
          }
        }
      ]
    );
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
            <Text style={styles.title}>Welcome to AisleMarts</Text>
            <Text style={styles.subtitle}>
              Let's set up permissions for the best shopping experience
            </Text>
            
            {/* Platform Info */}
            <View style={styles.platformInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#9FE7F5" />
              <Text style={styles.platformText}>
                Platform: {Platform.OS} | {Platform.OS === 'web' ? 'Web Simulation Mode' : 'Native Permissions'}
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {permissionsList.length}
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

            {/* Permission Status */}
            {permissions[currentPermission.id as keyof typeof permissions] && (
              <View style={styles.grantedContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.grantedText}>Permission Granted! ✅</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {!permissions[currentPermission.id as keyof typeof permissions] ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePermissionRequest}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>
                  Allow {currentPermission.title}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStep < permissionsList.length - 1 ? 'Next Permission' : 'Complete Setup'}
                </Text>
              </TouchableOpacity>
            )}

            {!currentPermission.required && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSkip}
                activeOpacity={0.7}
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
            activeOpacity={0.7}
          >
            <Text style={styles.skipAllText}>Skip All Permissions</Text>
          </TouchableOpacity>

          {/* Debug Info */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>Current Step: {currentStep}</Text>
            <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
            <Text style={styles.debugText}>Permissions: {JSON.stringify(permissions, null, 2)}</Text>
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
    marginBottom: 16,
    lineHeight: 22,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  debugTitle: {
    color: '#9FE7F5',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  debugText: {
    color: '#9FE7F5',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});