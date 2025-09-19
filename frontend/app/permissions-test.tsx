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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function PermissionsTestScreen() {
  const [permissionStatus, setPermissionStatus] = useState<{ [key: string]: string }>({});
  
  const { requestMicrophone } = useMicrophonePermission();
  const { requestCamera } = useCameraPermission();
  const { requestLocation } = useLocationPermission();
  const { requestPhotos } = usePhotosPermission();
  const { requestNotifications } = useNotificationsPermission();

  const permissions = [
    {
      id: 'microphone',
      title: 'Microphone',
      description: 'For voice shopping with Aisle AI',
      icon: 'mic-outline' as keyof typeof Ionicons.glyphMap,
      request: requestMicrophone,
    },
    {
      id: 'camera',
      title: 'Camera',
      description: 'For product scanning and photos',
      icon: 'camera-outline' as keyof typeof Ionicons.glyphMap,
      request: requestCamera,
    },
    {
      id: 'location',
      title: 'Location',
      description: 'For nearby stores and delivery',
      icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
      request: requestLocation,
    },
    {
      id: 'photos',
      title: 'Photo Library',
      description: 'For saving and accessing images',
      icon: 'images-outline' as keyof typeof Ionicons.glyphMap,
      request: requestPhotos,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'For order updates and deals',
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      request: requestNotifications,
    },
  ];

  const testPermission = async (permission: any) => {
    const result = await permission.request('testing');
    setPermissionStatus(prev => ({
      ...prev,
      [permission.id]: result
    }));
    
    Alert.alert(
      `${permission.title} Permission`,
      `Result: ${result}`,
      [{ text: 'OK' }]
    );
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('permissions_onboarding_completed');
      await AsyncStorage.removeItem('permissions_status');
      await AsyncStorage.removeItem('permissions_skipped');
      Alert.alert(
        'Reset Complete',
        'Permissions onboarding has been reset. Restart the app to see the onboarding flow.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
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
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#EBD6A0" />
            </TouchableOpacity>
            <Text style={styles.title}>Permissions Test</Text>
            <Text style={styles.subtitle}>
              Test individual permission requests
            </Text>
          </View>

          {/* Permission Cards */}
          {permissions.map((permission) => (
            <View key={permission.id} style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <Ionicons name={permission.icon} size={32} color="#EBD6A0" />
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionTitle}>{permission.title}</Text>
                  <Text style={styles.permissionDescription}>
                    {permission.description}
                  </Text>
                </View>
              </View>
              
              {permissionStatus[permission.id] && (
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>
                    Status: {permissionStatus[permission.id]}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => testPermission(permission)}
              >
                <Text style={styles.testButtonText}>Test Permission</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetOnboarding}
          >
            <Text style={styles.resetButtonText}>Reset Onboarding</Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EBD6A0',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 4,
  },
  permissionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(235,214,160,0.2)',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EBD6A0',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  statusContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#9FE7F5',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#EBD6A0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f0f23',
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});