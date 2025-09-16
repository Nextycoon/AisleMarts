import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface StatusChipProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  variant = 'info',
  size = 'medium'
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return ['rgba(52,199,89,0.8)', 'rgba(48,209,88,0.6)'];
      case 'warning':
        return ['rgba(255,149,0,0.8)', 'rgba(255,159,10,0.6)'];
      case 'error':
        return ['rgba(255,59,48,0.8)', 'rgba(255,69,58,0.6)'];
      default:
        return ['rgba(0,122,255,0.8)', 'rgba(10,132,255,0.6)'];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 6, paddingVertical: 3, fontSize: 10 };
      case 'large':
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 };
      default:
        return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 12 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <BlurView intensity={20} style={[styles.chip, { 
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical 
    }]}>
      <LinearGradient
        colors={getVariantColors()}
        style={styles.chipGradient}
      >
        <Text style={[styles.chipText, { fontSize: sizeStyles.fontSize }]}>
          {status.toUpperCase()}
        </Text>
      </LinearGradient>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});