/**
 * Glass Component Presets - Luxury UI Elements
 * Ready-to-use glass morphism components for consistent theming
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle, PressableProps } from 'react-native';
import { colors, spacing, radii, shadows, presets } from '../theme/tokens';

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'accent' | 'violet' | 'success' | 'warning';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  variant = 'primary' 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'accent':
        return {
          backgroundColor: colors.glass.accent,
          borderColor: colors.border.accent,
        };
      case 'violet':
        return {
          backgroundColor: colors.glass.violet,
          borderColor: colors.border.violet,
        };
      case 'success':
        return {
          backgroundColor: colors.glass.success,
          borderColor: colors.border.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.glass.warning,
          borderColor: colors.border.warning,
        };
      default:
        return {
          backgroundColor: colors.glass.primary,
          borderColor: colors.border.primary,
        };
    }
  };

  return (
    <View style={[presets.glassCard, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

// Primary Button Component
interface PrimaryButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'violet';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.glass.primary,
          borderColor: colors.border.secondary,
          borderWidth: 1,
        };
      case 'violet':
        return {
          backgroundColor: colors.violet,
          borderColor: colors.violetDark,
        };
      default:
        return {
          backgroundColor: colors.cyan,
          borderColor: colors.cyanDark,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
        };
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.text;
      case 'violet':
        return colors.text;
      default:
        return "#0f172a";
    }
  };

  return (
    <Pressable
      style={[
        presets.primaryButton,
        getVariantStyle(),
        getSizeStyle(),
        loading && { opacity: 0.7 },
        style
      ]}
      disabled={loading}
      {...props}
    >
      <Text style={[styles.buttonText, { color: getTextColor() }]}>
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
};

// Status Chip Component
interface StatusChipProps {
  status: 'working' | 'new' | 'enhanced' | string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  size = 'medium',
  style 
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'working':
        return {
          backgroundColor: colors.success,
          color: colors.text,
        };
      case 'new':
        return {
          backgroundColor: colors.warning,
          color: "#0f172a",
        };
      case 'enhanced':
        return {
          backgroundColor: colors.cyan,
          color: "#0f172a",
        };
      default:
        return {
          backgroundColor: colors.textDim,
          color: colors.text,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: radii.xs,
        };
      case 'large':
        return {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radii.md,
        };
      default:
        return {
          paddingHorizontal: spacing.xs,
          paddingVertical: 4,
          borderRadius: radii.sm,
        };
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'working': return '✅';
      case 'new': return 'NEW';
      case 'enhanced': return '⚡';
      default: return status.toUpperCase();
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View 
      style={[
        getSizeStyle(),
        { backgroundColor: statusStyle.backgroundColor },
        style
      ]}
    >
      <Text 
        style={[
          styles.chipText, 
          { color: statusStyle.color },
          size === 'small' && { fontSize: 9 },
          size === 'large' && { fontSize: 12 }
        ]}
      >
        {getStatusText()}
      </Text>
    </View>
  );
};

// Feature Tile Component
interface FeatureTileProps extends PressableProps {
  icon: string;
  title: string;
  description: string;
  status?: 'working' | 'new' | 'enhanced';
  badge?: string;
}

export const FeatureTile: React.FC<FeatureTileProps> = ({
  icon,
  title,
  description,
  status,
  badge,
  style,
  ...props
}) => {
  return (
    <Pressable style={[presets.featureTile, style]} {...props}>
      <View style={styles.tileHeader}>
        <Text style={styles.tileIcon}>{icon}</Text>
        {(status || badge) && (
          <StatusChip 
            status={status || badge || ''} 
            size="small"
          />
        )}
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileDescription}>{description}</Text>
    </Pressable>
  );
};

// Search Pill Component
interface SearchPillProps extends PressableProps {
  placeholder: string;
  icon?: string;
}

export const SearchPill: React.FC<SearchPillProps> = ({ 
  placeholder, 
  icon = "🔎",
  style,
  ...props 
}) => {
  return (
    <Pressable style={[styles.searchPill, style]} {...props}>
      <Text style={styles.searchIcon}>{icon}</Text>
      <Text style={styles.searchPlaceholder}>{placeholder}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  tileIcon: {
    fontSize: 24,
  },
  tileTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  tileDescription: {
    color: colors.textDim,
    fontSize: 12,
  },
  searchPill: {
    backgroundColor: colors.glass.primary,
    borderColor: colors.border.primary,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
    color: colors.textDim,
  },
  searchPlaceholder: {
    color: colors.textDim,
    fontSize: 16,
  },
});

export default {
  GlassCard,
  PrimaryButton,
  StatusChip,
  FeatureTile,
  SearchPill,
};