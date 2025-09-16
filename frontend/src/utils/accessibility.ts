/**
 * Accessibility Utilities for AisleMarts
 * WCAG AA compliance helpers and screen reader optimizations
 */

import { ColorValue } from 'react-native';

// WCAG AA color contrast ratios
export const ACCESSIBILITY_STANDARDS = {
  // Minimum contrast ratios
  NORMAL_TEXT_AA: 4.5,   // Normal text WCAG AA
  LARGE_TEXT_AA: 3.0,    // Large text (18pt+ or 14pt+ bold) WCAG AA
  
  // Touch target sizes (iOS: 44px, Android: 48px)
  MIN_TOUCH_TARGET_IOS: 44,
  MIN_TOUCH_TARGET_ANDROID: 48,
  RECOMMENDED_TOUCH_TARGET: 48,
  
  // Text sizes for readability
  MIN_READABLE_TEXT_SIZE: 14,
  LARGE_TEXT_SIZE: 18,
  
  // Animation duration limits
  MAX_ANIMATION_DURATION: 200, // For reduced motion preference
};

/**
 * Get accessibility-compliant touch target size
 */
export function getAccessibleTouchTarget(platform: 'ios' | 'android' | 'web' = 'ios'): number {
  switch (platform) {
    case 'android':
      return ACCESSIBILITY_STANDARDS.MIN_TOUCH_TARGET_ANDROID;
    case 'ios':
      return ACCESSIBILITY_STANDARDS.MIN_TOUCH_TARGET_IOS;
    case 'web':
      return ACCESSIBILITY_STANDARDS.RECOMMENDED_TOUCH_TARGET;
    default:
      return ACCESSIBILITY_STANDARDS.RECOMMENDED_TOUCH_TARGET;
  }
}

/**
 * Screen reader labels for pickup system components
 */
export const SCREEN_READER_LABELS = {
  // Status chips
  statusChip: (status: string) => `Reservation status: ${status}`,
  
  // Pickup windows
  pickupWindow: (timeSlot: string, available: number, total: number) => 
    `Pickup window ${timeSlot}. ${available} of ${total} slots available`,
  
  pickupWindowFull: (timeSlot: string) => 
    `Pickup window ${timeSlot}. Fully booked, no slots available`,
  
  pickupWindowUnavailable: (timeSlot: string) => 
    `Pickup window ${timeSlot}. Currently unavailable`,
  
  // Reservations
  reservationItem: (sku: string, quantity: number, status: string) => 
    `${sku}, quantity ${quantity}, status ${status}`,
  
  reservationCode: (code: string) => 
    `Pickup code ${code}. Show this to staff when collecting items`,
  
  // Actions
  extendReservation: 'Extend reservation hold time by 30 minutes',
  partialPickup: 'Mark some items as picked up, keep others reserved',
  cancelReservation: 'Cancel this reservation and release all items',
  schedulePickup: 'Choose a pickup time slot for this reservation',
  
  // Forms
  locationInput: 'Enter location ID for pickup windows',
  dateInput: 'Select date for pickup windows in YYYY-MM-DD format',
  pickupCodeInput: 'Enter customer pickup code or reservation ID',
  
  // Upload
  csvFileSelected: (filename: string, size: string) => 
    `CSV file selected: ${filename}, size ${size}`,
  uploadProgress: (percentage: number) => 
    `Upload progress: ${percentage} percent complete`,
  
  // Empty states
  emptyPickupWindows: 'No pickup windows available. Create new windows to allow customer pickups',
  emptyReservations: 'No reservations found. Customer reservations will appear here',
  emptyUploadHistory: 'No upload history. Your CSV upload activity will be tracked here',
};

/**
 * Generate accessibility hint for pickup actions
 */
export function getAccessibilityHint(action: string, context?: any): string {
  const hints = {
    'create_windows': 'Double tap to create standard pickup time slots',
    'load_windows': 'Double tap to load pickup windows for selected date and location',
    'check_in': 'Double tap to process customer pickup using their code',
    'extend_hold': 'Double tap to add 30 minutes to reservation hold time',
    'schedule_pickup': 'Double tap to choose pickup time slot',
    'cancel_reservation': 'Double tap to cancel reservation and release items',
    'upload_csv': 'Double tap to upload inventory CSV file',
    'select_file': 'Double tap to browse and select CSV file',
    'refresh': 'Double tap to refresh current data',
  };
  
  return hints[action as keyof typeof hints] || 'Double tap to activate';
}

/**
 * Format time for screen readers
 */
export function formatTimeForScreenReader(timeSlot: { start_time: string; end_time: string }): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  return `${formatTime(timeSlot.start_time)} to ${formatTime(timeSlot.end_time)}`;
}

/**
 * Generate accessible button props
 */
export function getAccessibleButtonProps(
  label: string, 
  action: string,
  disabled: boolean = false,
  loading: boolean = false
) {
  return {
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: getAccessibilityHint(action),
    accessibilityState: { 
      disabled: disabled || loading,
      busy: loading 
    },
    accessible: true,
  };
}

/**
 * Generate accessible form input props
 */
export function getAccessibleInputProps(
  label: string,
  value: string,
  placeholder?: string,
  required: boolean = false,
  error?: string
) {
  return {
    accessibilityRole: 'text' as const,
    accessibilityLabel: label,
    accessibilityValue: { text: value },
    accessibilityHint: placeholder,
    accessibilityState: { 
      required,
      invalid: !!error 
    },
    accessible: true,
  };
}

/**
 * Color contrast checker (simplified)
 * Note: For production, use a proper color contrast library
 */
export function hasGoodContrast(
  foreground: ColorValue, 
  background: ColorValue, 
  isLargeText: boolean = false
): boolean {
  // Simplified check - in production, use actual luminance calculation
  const minRatio = isLargeText ? 
    ACCESSIBILITY_STANDARDS.LARGE_TEXT_AA : 
    ACCESSIBILITY_STANDARDS.NORMAL_TEXT_AA;
  
  // Basic high-contrast color combinations that we know work
  const goodCombinations = [
    { fg: '#FFFFFF', bg: '#007AFF' }, // White on blue
    { fg: '#FFFFFF', bg: '#34C759' }, // White on green
    { fg: '#FFFFFF', bg: '#FF3B30' }, // White on red
    { fg: '#FFFFFF', bg: '#FF9500' }, // White on orange
    { fg: '#FFFFFF', bg: '#AF52DE' }, // White on purple
    { fg: '#000000', bg: '#FFFFFF' }, // Black on white
    { fg: '#333333', bg: '#FFFFFF' }, // Dark gray on white
  ];
  
  return goodCombinations.some(combo => 
    combo.fg === foreground && combo.bg === background
  );
}

/**
 * Accessible status announcements for screen readers
 */
export const STATUS_ANNOUNCEMENTS = {
  pickupCompleted: 'Pickup completed successfully. All items have been collected.',
  reservationScheduled: 'Reservation scheduled successfully. Pickup time confirmed.',
  holdExtended: 'Reservation hold extended by 30 minutes.',
  reservationCancelled: 'Reservation cancelled. All items have been released.',
  uploadStarted: 'File upload started. Please wait for completion.',
  uploadCompleted: 'File upload completed successfully.',
  uploadFailed: 'File upload failed. Please try again.',
  windowsLoaded: (count: number) => `${count} pickup windows loaded successfully.`,
  noWindowsFound: 'No pickup windows found for selected date and location.',
  networkError: 'Network error occurred. Please check your connection and try again.',
};

/**
 * Reduced motion utilities
 */
export function getReducedMotionConfig() {
  // In a real app, check AccessibilityInfo.isReduceMotionEnabled()
  return {
    shouldReduceMotion: false, // Would be dynamic in production
    animationDuration: ACCESSIBILITY_STANDARDS.MAX_ANIMATION_DURATION,
    disableParallax: false,
    simplifyTransitions: false,
  };
}

export default {
  ACCESSIBILITY_STANDARDS,
  SCREEN_READER_LABELS,
  getAccessibleTouchTarget,
  getAccessibilityHint,
  formatTimeForScreenReader,
  getAccessibleButtonProps,
  getAccessibleInputProps,
  hasGoodContrast,
  STATUS_ANNOUNCEMENTS,
  getReducedMotionConfig,
};