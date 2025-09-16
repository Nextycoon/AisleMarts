/**
 * Universal Status Chips System
 * Color-coded status indicators for reservations and pickup states
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type StatusType = 
  | 'held' 
  | 'scheduled' 
  | 'confirmed'
  | 'partial_pickup' 
  | 'completed' 
  | 'cancelled' 
  | 'expired'
  | 'active'
  | 'inactive'
  | 'full';

interface StatusChipProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  customText?: string;
}

// Status configuration with colors, icons, and labels
const STATUS_CONFIG: Record<StatusType, {
  color: string;
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  labelSW?: string; // Swahili translation
}> = {
  // Reservation states
  held: {
    color: '#FFFFFF',
    backgroundColor: '#FF9500', // Orange - awaiting action
    icon: 'time-outline',
    label: 'Reserved',
    labelSW: 'Hifadhiwa'
  },
  scheduled: {
    color: '#FFFFFF', 
    backgroundColor: '#007AFF', // Blue - confirmed appointment
    icon: 'calendar-outline',
    label: 'Scheduled',
    labelSW: 'Imepangwa'
  },
  confirmed: {
    color: '#FFFFFF',
    backgroundColor: '#007AFF', // Blue - ready for pickup
    icon: 'checkmark-circle-outline',
    label: 'Confirmed',
    labelSW: 'Imethibitishwa'
  },
  partial_pickup: {
    color: '#FFFFFF',
    backgroundColor: '#AF52DE', // Purple - some items collected
    icon: 'cube-outline',
    label: 'Partial',
    labelSW: 'Sehemu'
  },
  completed: {
    color: '#FFFFFF',
    backgroundColor: '#34C759', // Green - successful completion
    icon: 'checkmark-circle',
    label: 'Completed',
    labelSW: 'Imekamilika'
  },
  cancelled: {
    color: '#FFFFFF', 
    backgroundColor: '#FF3B30', // Red - cancelled by user/merchant
    icon: 'close-circle-outline',
    label: 'Cancelled',
    labelSW: 'Imeghairiwa'
  },
  expired: {
    color: '#FFFFFF',
    backgroundColor: '#8E8E93', // Gray - timed out
    icon: 'time',
    label: 'Expired',
    labelSW: 'Imeisha'
  },
  
  // Pickup window states
  active: {
    color: '#FFFFFF',
    backgroundColor: '#34C759', // Green - accepting reservations
    icon: 'radio-button-on',
    label: 'Active',
    labelSW: 'Inatumika'
  },
  inactive: {
    color: '#FFFFFF',
    backgroundColor: '#8E8E93', // Gray - not accepting reservations
    icon: 'radio-button-off',
    label: 'Inactive',
    labelSW: 'Haijatumika'
  },
  full: {
    color: '#FFFFFF',
    backgroundColor: '#FF9500', // Orange - at capacity
    icon: 'ban',
    label: 'Full',
    labelSW: 'Imejaa'
  }
};

export default function StatusChip({ 
  status, 
  size = 'medium', 
  showIcon = true,
  customText 
}: StatusChipProps) {
  const config = STATUS_CONFIG[status];
  
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return null;
  }

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 11,
      iconSize: 12,
      borderRadius: 8
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 12,
      iconSize: 14,
      borderRadius: 10
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      iconSize: 16,
      borderRadius: 12
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <View 
      style={[
        styles.chip,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          borderRadius: currentSize.borderRadius
        }
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${customText || config.label}`}
    >
      {showIcon && (
        <Ionicons 
          name={config.icon} 
          size={currentSize.iconSize} 
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text 
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: currentSize.fontSize
          }
        ]}
      >
        {customText || config.label}
      </Text>
    </View>
  );
}

// Helper function to get status color for external use
export function getStatusColor(status: StatusType): string {
  return STATUS_CONFIG[status]?.backgroundColor || '#8E8E93';
}

// Helper function to get status label with i18n support
export function getStatusLabel(status: StatusType, language: 'en' | 'sw' = 'en'): string {
  const config = STATUS_CONFIG[status];
  if (!config) return status;
  
  return language === 'sw' && config.labelSW ? config.labelSW : config.label;
}

// Helper function to format reservation status for display
export function formatReservationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'held': 'Reserved',
    'scheduled': 'Scheduled', 
    'confirmed': 'Confirmed',
    'partial_pickup': 'Partially Picked Up',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'expired': 'Expired'
  };
  return statusMap[status] || status;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});