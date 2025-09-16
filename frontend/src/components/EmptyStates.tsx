/**
 * Professional Empty States System
 * Friendly guidance with clear CTAs in English and Swahili
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  type: 'pickup_windows' | 'reservations' | 'upload_history' | 'scans' | 'analytics' | 'inventory';
  language?: 'en' | 'sw';
  onAction?: () => void;
  actionText?: string;
  customTitle?: string;
  customMessage?: string;
}

// Empty state configurations with EN/SW translations
const EMPTY_STATE_CONFIG = {
  pickup_windows: {
    icon: 'calendar-outline',
    iconColor: '#007AFF',
    title: {
      en: 'No Pickup Windows Today',
      sw: 'Hakuna Ratiba ya Leo'
    },
    message: {
      en: 'Create pickup windows to allow customers to schedule their item collection.',
      sw: 'Tengeneza ratiba za kupokea ili warejea waweze kupanga wakati wa kuchukua bidhaa zao.'
    },
    actionText: {
      en: 'Create Windows',
      sw: 'Tengeneza Ratiba'
    }
  },
  
  reservations: {
    icon: 'cube-outline',
    iconColor: '#34C759',
    title: {
      en: 'No Reservations Found',
      sw: 'Hakuna Mahifadhi'
    },
    message: {
      en: 'When customers make reservations, they will appear here for easy management.',
      sw: 'Mahifadhi ya wateja yataonekana hapa ili uongozee kwa urahisi.'
    },
    actionText: {
      en: 'Refresh',
      sw: 'Sasisha'
    }
  },
  
  upload_history: {
    icon: 'cloud-upload-outline',
    iconColor: '#FF9500',
    title: {
      en: 'No Upload History',
      sw: 'Hakuna Rekodi za Kupakia'
    },
    message: {
      en: 'Your CSV upload history will appear here once you start uploading inventory files.',
      sw: 'Rekodi za faili za orodha zitaonekana hapa utakapoanza kupakia faili za orodha.'
    },
    actionText: {
      en: 'Upload CSV',
      sw: 'Pakia Faili'
    }
  },
  
  scans: {
    icon: 'scan-outline',
    iconColor: '#AF52DE',
    title: {
      en: 'No Scans Today',
      sw: 'Hakuna Uchunguzi Leo'
    },
    message: {
      en: 'Barcode scans and product lookups will be tracked here for your reference.',
      sw: 'Uchunguzi wa barcodes na utafutaji wa bidhaa utafuatiliwa hapa kwa marejeo yako.'
    },
    actionText: {
      en: 'Scan Item',
      sw: 'Chunguza Bidhaa'
    }
  },
  
  analytics: {
    icon: 'analytics-outline', 
    iconColor: '#007AFF',
    title: {
      en: 'No Analytics Data',
      sw: 'Hakuna Takwimu'
    },
    message: {
      en: 'Analytics and insights will be available once you have pickup activity.',
      sw: 'Takwimu na maarifa yatakuwa yampatikana mara tu utakapokuwa na shughuli za kupokea.'
    },
    actionText: {
      en: 'View Help',
      sw: 'Angalia Msaada'
    }
  },
  
  inventory: {
    icon: 'list-outline',
    iconColor: '#34C759',
    title: {
      en: 'No Inventory Items',
      sw: 'Hakuna Bidhaa za Orodha'
    },
    message: {
      en: 'Add your first inventory items to start managing your stock and processing orders.',
      sw: 'Ongeza bidhaa zako za kwanza ili kuanza kudhibiti hisa yako na kushughulikia maagizo.'
    },
    actionText: {
      en: 'Add Items',
      sw: 'Ongeza Bidhaa'
    }
  }
};

export default function EmptyState({ 
  type, 
  language = 'en', 
  onAction, 
  actionText,
  customTitle,
  customMessage 
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  
  if (!config) {
    console.warn(`Unknown empty state type: ${type}`);
    return null;
  }

  const title = customTitle || config.title[language];
  const message = customMessage || config.message[language];
  const buttonText = actionText || config.actionText[language];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={config.icon} 
          size={64} 
          color={config.iconColor}
          style={styles.icon}
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {onAction && (
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: config.iconColor }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={buttonText}
        >
          <Ionicons 
            name="add-circle" 
            size={20} 
            color={config.iconColor}
            style={styles.buttonIcon}
          />
          <Text style={[styles.actionButtonText, { color: config.iconColor }]}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Specialized empty state components for common scenarios
export function NoPickupWindows({ onCreateWindows, language = 'en' }: { 
  onCreateWindows?: () => void; 
  language?: 'en' | 'sw';
}) {
  return (
    <EmptyState 
      type="pickup_windows" 
      language={language}
      onAction={onCreateWindows}
    />
  );
}

export function NoReservations({ onRefresh, language = 'en' }: { 
  onRefresh?: () => void; 
  language?: 'en' | 'sw';
}) {
  return (
    <EmptyState 
      type="reservations" 
      language={language}
      onAction={onRefresh}
    />
  );
}

export function NoUploadHistory({ onUpload, language = 'en' }: { 
  onUpload?: () => void; 
  language?: 'en' | 'sw';
}) {
  return (
    <EmptyState 
      type="upload_history" 
      language={language}
      onAction={onUpload}
    />
  );
}

export function NoScansToday({ onScan, language = 'en' }: { 
  onScan?: () => void; 
  language?: 'en' | 'sw';
}) {
  return (
    <EmptyState 
      type="scans" 
      language={language}
      onAction={onScan}
    />
  );
}

export function NoAnalyticsData({ onHelp, language = 'en' }: { 
  onHelp?: () => void; 
  language?: 'en' | 'sw';
}) {
  return (
    <EmptyState 
      type="analytics" 
      language={language}
      onAction={onHelp}
    />
  );
}

export function NoInventoryItems({ onAddItems, language = 'en' }: { 
  onAddItems?: () => void; 
  language?: 'en' | 'sw';
}) {
  return (
    <EmptyState    
      type="inventory" 
      language={language}
      onAction={onAddItems}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
    minHeight: 48, // Accessibility: 48px minimum touch target
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});