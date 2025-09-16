/**
 * Haptic Feedback System
 * Tactile confirmation for pickup system actions
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type HapticType = 
  | 'success'      // Pickup completed, reservation confirmed
  | 'warning'      // Partial pickup, extension granted
  | 'error'        // Failed scan, expired reservation
  | 'selection'    // Window selected, item tapped
  | 'impact_light' // Button press
  | 'impact_medium'// Form submission
  | 'impact_heavy' // Critical action (cancel reservation)
  | 'notification_success' // Toast notifications
  | 'notification_warning'
  | 'notification_error';

interface HapticFeedbackHooks {
  triggerHaptic: (type: HapticType) => void;
  
  // Pickup-specific haptic methods
  onPickupCompleted: () => void;
  onReservationScheduled: () => void;
  onHoldExtended: () => void;
  onPartialPickup: () => void;
  onReservationCancelled: () => void;
  onScanSuccess: () => void;
  onScanError: () => void;
  onWindowSelected: () => void;
  onUploadProgress: (progress: number) => void;
  
  // Generic UI haptics
  onButtonPress: () => void;
  onFormSubmit: () => void;
  onNotificationShow: (type: 'success' | 'warning' | 'error') => void;
}

export function useHaptics(): HapticFeedbackHooks {
  
  const triggerHaptic = (type: HapticType) => {
    // Skip haptics on web or if device doesn't support it
    if (Platform.OS === 'web') return;
    
    try {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
          
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
          
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
          
        case 'selection':
          Haptics.selectionAsync();
          break;
          
        case 'impact_light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
          
        case 'impact_medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
          
        case 'impact_heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
          
        case 'notification_success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
          
        case 'notification_warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
          
        case 'notification_error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
          
        default:
          // Fallback to light impact
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Silently fail if haptics not supported
      console.log('Haptics not supported:', error);
    }
  };

  return {
    triggerHaptic,
    
    // Pickup-specific haptic methods
    onPickupCompleted: () => {
      // Double success haptic for completion
      triggerHaptic('success');
      setTimeout(() => triggerHaptic('impact_light'), 150);
    },
    
    onReservationScheduled: () => {
      triggerHaptic('success');
    },
    
    onHoldExtended: () => {
      triggerHaptic('warning'); // Warning because it's a limited action
    },
    
    onPartialPickup: () => {
      triggerHaptic('warning'); // Some items picked up, but not all
    },
    
    onReservationCancelled: () => {
      triggerHaptic('impact_heavy'); // Heavy feedback for destructive action
    },
    
    onScanSuccess: () => {
      triggerHaptic('success');
    },
    
    onScanError: () => {
      triggerHaptic('error');
    },
    
    onWindowSelected: () => {
      triggerHaptic('selection');
    },
    
    onUploadProgress: (progress: number) => {
      // Light haptic at 25%, 50%, 75%, 100%
      if (progress === 25 || progress === 50 || progress === 75) {
        triggerHaptic('impact_light');
      } else if (progress === 100) {
        triggerHaptic('success');
      }
    },
    
    // Generic UI haptics
    onButtonPress: () => {
      triggerHaptic('impact_light');
    },
    
    onFormSubmit: () => {
      triggerHaptic('impact_medium');
    },
    
    onNotificationShow: (type: 'success' | 'warning' | 'error') => {
      switch (type) {
        case 'success':
          triggerHaptic('notification_success');
          break;
        case 'warning':
          triggerHaptic('notification_warning');
          break;
        case 'error':
          triggerHaptic('notification_error');
          break;
      }
    },
  };
}

// Haptic feedback patterns for common pickup scenarios
export const PICKUP_HAPTIC_PATTERNS = {
  // Reservation flow
  RESERVATION_CREATED: () => {
    const haptics = useHaptics();
    haptics.onReservationScheduled();
  },
  
  // Merchant pickup flow
  CODE_SCANNED: (isValid: boolean) => {
    const haptics = useHaptics();
    if (isValid) {
      haptics.onScanSuccess();
    } else {
      haptics.onScanError();
    }
  },
  
  // Pickup window interactions
  WINDOW_SELECTED: () => {
    const haptics = useHaptics();
    haptics.onWindowSelected();
  },
  
  // File upload feedback
  UPLOAD_MILESTONE: (progress: number) => {
    const haptics = useHaptics();
    haptics.onUploadProgress(progress);
  }
};

export default useHaptics;