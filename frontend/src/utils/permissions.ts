import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PermissionResult = 'granted' | 'denied' | 'blocked';

// Analytics tracking for permission outcomes
const trackPermissionEvent = async (permission: string, result: PermissionResult, context?: string) => {
  try {
    // Track with your analytics service (Firebase, etc.)
    console.log(`Permission ${permission}: ${result}`, { context });
    
    // Store in AsyncStorage for analytics batching
    const events = await AsyncStorage.getItem('permission_events') || '[]';
    const parsedEvents = JSON.parse(events);
    parsedEvents.push({
      permission,
      result,
      context,
      timestamp: Date.now(),
      platform: Platform.OS,
    });
    await AsyncStorage.setItem('permission_events', JSON.stringify(parsedEvents));
  } catch (error) {
    console.error('Failed to track permission event:', error);
  }
};

// Normalize permission status across different expo modules
const normalizeStatus = (status: any): PermissionResult => {
  if (status?.granted === true || status === 'granted') return 'granted';
  if (status?.canAskAgain === false || status === 'denied') return 'blocked';
  return 'denied';
};

// Camera Permission
export async function requestCameraPermission(context = 'scan'): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
    const result = normalizeStatus({ granted: status === 'granted', canAskAgain });
    await trackPermissionEvent('camera', result, context);
    return result;
  } catch (error) {
    console.error('Camera permission error:', error);
    return 'denied';
  }
}

export async function getCameraPermissionStatus(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
    return normalizeStatus({ granted: status === 'granted', canAskAgain });
  } catch (error) {
    return 'denied';
  }
}

// Microphone Permission
export async function requestMicrophonePermission(context = 'voice'): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Audio.requestPermissionsAsync();
    const result = normalizeStatus({ granted: status === 'granted', canAskAgain });
    await trackPermissionEvent('microphone', result, context);
    return result;
  } catch (error) {
    console.error('Microphone permission error:', error);
    return 'denied';
  }
}

export async function getMicrophonePermissionStatus(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Audio.getPermissionsAsync();
    return normalizeStatus({ granted: status === 'granted', canAskAgain });
  } catch (error) {
    return 'denied';
  }
}

// Photos/Gallery Permission
export async function requestPhotosPermission(context = 'upload'): Promise<PermissionResult> {
  try {
    const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const result = normalizeStatus(response);
    await trackPermissionEvent('photos', result, context);
    return result;
  } catch (error) {
    console.error('Photos permission error:', error);
    return 'denied';
  }
}

export async function getPhotosPermissionStatus(): Promise<PermissionResult> {
  try {
    const response = await ImagePicker.getMediaLibraryPermissionsAsync();
    return normalizeStatus(response);
  } catch (error) {
    return 'denied';
  }
}

// Location Permission
export async function requestLocationPermission(context = 'nearby'): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    const result = normalizeStatus({ granted: status === 'granted', canAskAgain });
    await trackPermissionEvent('location', result, context);
    return result;
  } catch (error) {
    console.error('Location permission error:', error);
    return 'denied';
  }
}

export async function getLocationPermissionStatus(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    return normalizeStatus({ granted: status === 'granted', canAskAgain });
  } catch (error) {
    return 'denied';
  }
}

// Notifications Permission
export async function requestNotificationsPermission(context = 'alerts'): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    const result = normalizeStatus({ granted: status === 'granted', canAskAgain });
    await trackPermissionEvent('notifications', result, context);
    return result;
  } catch (error) {
    console.error('Notifications permission error:', error);
    return 'denied';
  }
}

export async function getNotificationsPermissionStatus(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    return normalizeStatus({ granted: status === 'granted', canAskAgain });
  } catch (error) {
    return 'denied';
  }
}

// Settings Navigation
export function openAppSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

// Permission denied handler with settings redirect
export function handlePermissionBlocked(permissionType: string, feature: string) {
  Alert.alert(
    `${permissionType} Access Needed`,
    `Enable ${permissionType.toLowerCase()} access in Settings to use ${feature}.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings },
    ]
  );
}

// Check if user has previously denied a permission
export async function hasUserDeclinedPermission(permissionType: string): Promise<boolean> {
  try {
    const key = `permission_declined_${permissionType}`;
    const declined = await AsyncStorage.getItem(key);
    return declined === 'true';
  } catch (error) {
    return false;
  }
}

// Mark that user has declined a permission
export async function markPermissionDeclined(permissionType: string) {
  try {
    const key = `permission_declined_${permissionType}`;
    await AsyncStorage.setItem(key, 'true');
  } catch (error) {
    console.error('Failed to mark permission as declined:', error);
  }
}

// Clear permission decline status (when user manually grants later)
export async function clearPermissionDeclined(permissionType: string) {
  try {
    const key = `permission_declined_${permissionType}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear permission declined status:', error);
  }
}

// Permission flow manager - handles the complete UX flow
export class PermissionManager {
  static async requestWithPrePrompt(
    permissionType: 'camera' | 'microphone' | 'photos' | 'location' | 'notifications',
    context: string,
    showPrePrompt: (type: string) => Promise<boolean> // Returns true if user wants to continue
  ): Promise<PermissionResult> {
    
    // Check if user has previously declined
    const hasDeclined = await hasUserDeclinedPermission(permissionType);
    
    // If they've declined before, show pre-prompt to re-educate
    if (hasDeclined || await this.shouldShowPrePrompt(permissionType)) {
      const userWantsToContinue = await showPrePrompt(permissionType);
      
      if (!userWantsToContinue) {
        await markPermissionDeclined(permissionType);
        return 'denied';
      }
    }
    
    // Request the actual permission
    let result: PermissionResult;
    
    switch (permissionType) {
      case 'camera':
        result = await requestCameraPermission(context);
        break;
      case 'microphone':
        result = await requestMicrophonePermission(context);
        break;
      case 'photos':
        result = await requestPhotosPermission(context);
        break;
      case 'location':
        result = await requestLocationPermission(context);
        break;
      case 'notifications':
        result = await requestNotificationsPermission(context);
        break;
      default:
        return 'denied';
    }
    
    // If granted, clear any previous decline status
    if (result === 'granted') {
      await clearPermissionDeclined(permissionType);
    }
    
    // Handle blocked state
    if (result === 'blocked') {
      handlePermissionBlocked(
        permissionType.charAt(0).toUpperCase() + permissionType.slice(1),
        context
      );
    }
    
    return result;
  }
  
  private static async shouldShowPrePrompt(permissionType: string): Promise<boolean> {
    // Show pre-prompt for first-time users or after declines
    try {
      const key = `shown_preprompt_${permissionType}`;
      const hasShown = await AsyncStorage.getItem(key);
      
      if (!hasShown) {
        await AsyncStorage.setItem(key, 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      return true; // Default to showing pre-prompt on error
    }
  }
}

// Export analytics data for dashboard
export async function getPermissionAnalytics() {
  try {
    const events = await AsyncStorage.getItem('permission_events') || '[]';
    return JSON.parse(events);
  } catch (error) {
    return [];
  }
}

// Clear analytics data (after syncing to server)
export async function clearPermissionAnalytics() {
  try {
    await AsyncStorage.removeItem('permission_events');
  } catch (error) {
    console.error('Failed to clear permission analytics:', error);
  }
}