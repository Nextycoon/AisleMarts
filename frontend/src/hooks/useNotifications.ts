/**
 * Lightweight Notification Hooks for Pickup System
 * Toast confirmations with optional push/SMS placeholders
 */

import { Alert } from 'react-native';
import { useState, useCallback } from 'react';
import useHaptics from './useHaptics';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotificationConfig {
  title: string;
  message: string;
  type: NotificationType;
  duration?: number; // For future toast implementation
  persistent?: boolean; // For critical notifications
}

export interface NotificationHooks {
  showNotification: (config: NotificationConfig) => void;
  showPickupNotification: (type: 'scheduled' | 'extended' | 'partial' | 'completed' | 'cancelled', details?: any) => void;
  showReminder: (message: string, minutesFromNow?: number) => void;
  isNotificationEnabled: boolean;
  toggleNotifications: () => void;
}

export function useNotifications(): NotificationHooks {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const { onNotificationShow } = useHaptics();

  const showNotification = useCallback((config: NotificationConfig) => {
    if (!isNotificationEnabled && config.type !== 'error') {
      return; // Skip non-error notifications if disabled
    }

    // Haptic feedback for notification
    onNotificationShow(config.type === 'success' ? 'success' : 
                      config.type === 'warning' ? 'warning' : 'error');

    // Current implementation: Native Alert
    // TODO: Replace with proper toast library (react-native-toast-notifications)
    const title = config.type === 'success' ? '✅ ' + config.title :
                  config.type === 'warning' ? '⚠️ ' + config.title :
                  config.type === 'error' ? '❌ ' + config.title :
                  'ℹ️ ' + config.title;

    Alert.alert(title, config.message, [
      { text: 'OK', style: config.type === 'error' ? 'destructive' : 'default' }
    ]);

    // Future enhancement: Send to push/SMS service
    if (config.persistent) {
      logForExternalNotification(config);
    }
  }, [isNotificationEnabled, onNotificationShow]);

  const showPickupNotification = useCallback((
    type: 'scheduled' | 'extended' | 'partial' | 'completed' | 'cancelled',
    details?: any
  ) => {
    const notifications = {
      scheduled: {
        title: 'Pickup Scheduled',
        message: `Your pickup has been scheduled${details?.timeSlot ? ` for ${details.timeSlot}` : ''}. Pickup code: ${details?.pickupCode || 'Check reservation details'}`,
        type: 'success' as NotificationType
      },
      extended: {
        title: 'Hold Extended',
        message: `Your reservation hold has been extended by ${details?.minutes || 30} minutes. ${details?.extensionsRemaining ? `${details.extensionsRemaining} extensions remaining.` : ''}`,
        type: 'info' as NotificationType
      },
      partial: {
        title: 'Partial Pickup Processed',
        message: `Some items have been picked up. ${details?.remainingItems ? `${details.remainingItems} items still available.` : 'Check reservation for details.'}`,
        type: 'warning' as NotificationType
      },
      completed: {
        title: 'Pickup Complete',
        message: 'All items have been successfully picked up. Thank you for shopping with AisleMarts!',
        type: 'success' as NotificationType
      },
      cancelled: {
        title: 'Reservation Cancelled',
        message: `Your reservation has been cancelled${details?.reason ? ` (${details.reason})` : ''}. ${details?.refundRequested ? 'Refund will be processed within 3-5 business days.' : ''}`,
        type: 'info' as NotificationType
      }
    };

    const notification = notifications[type];
    showNotification({
      ...notification,
      persistent: type === 'scheduled' || type === 'completed' // Important notifications
    });
  }, [showNotification]);

  const showReminder = useCallback((message: string, minutesFromNow: number = 15) => {
    // Current implementation: Immediate alert with reminder info
    // TODO: Implement scheduled local notifications
    showNotification({
      title: 'Pickup Reminder Set',
      message: `Reminder: ${message}\n\nThis will remind you in approximately ${minutesFromNow} minutes.`,
      type: 'info'
    });

    // Stub for future implementation
    scheduleLocalNotification(message, minutesFromNow);
  }, [showNotification]);

  const toggleNotifications = useCallback(() => {
    setIsNotificationEnabled(prev => !prev);
    
    showNotification({
      title: 'Notifications',
      message: isNotificationEnabled ? 'Notifications disabled' : 'Notifications enabled',
      type: 'info'
    });
  }, [isNotificationEnabled, showNotification]);

  return {
    showNotification,
    showPickupNotification,
    showReminder,
    isNotificationEnabled,
    toggleNotifications
  };
}

// Helper Functions (Stubs for future implementation)

function logForExternalNotification(config: NotificationConfig) {
  // TODO: Send to push notification service
  // TODO: Send to SMS service if configured
  console.log('📱 External notification logged:', {
    title: config.title,
    message: config.message,
    type: config.type,
    timestamp: new Date().toISOString()
  });
}

function scheduleLocalNotification(message: string, minutesFromNow: number) {
  // TODO: Use expo-notifications for local scheduling
  console.log('⏰ Local notification scheduled:', {
    message,
    scheduledFor: new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString()
  });
  
  // Placeholder: Could integrate with device calendar/reminders
  // Or use expo-notifications for proper local notifications
}

// Notification Templates for Common Pickup Scenarios
export const PickupNotificationTemplates = {
  reminderBeforeExpiry: (minutesRemaining: number) => ({
    title: 'Pickup Reminder',
    message: `Your reservation expires in ${minutesRemaining} minutes. Don't forget to pick up your items!`,
    type: 'warning' as NotificationType,
    persistent: true
  }),

  reminderBeforePickup: (timeSlot: string, location: string) => ({
    title: 'Pickup Time Approaching',
    message: `Your pickup window (${timeSlot}) at ${location} starts soon. Please arrive on time.`,
    type: 'info' as NotificationType,
    persistent: true
  }),

  locationArrival: (pickupCode: string) => ({
    title: 'Ready for Pickup',
    message: `You're at the pickup location. Show this code to staff: ${pickupCode}`,
    type: 'success' as NotificationType
  }),

  inventoryUnavailable: (items: string[]) => ({
    title: 'Items Unavailable',
    message: `Unfortunately, these items are no longer available: ${items.join(', ')}. Please modify your reservation.`,
    type: 'warning' as NotificationType,
    persistent: true
  })
};

// Export for easy use in components
export default useNotifications;