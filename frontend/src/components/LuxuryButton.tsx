import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate 
} from 'react-native-reanimated';
import { colors, typography, borderRadius, shadows, animations } from '../theme/luxuryTokens';

interface LuxuryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'luxury' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, animations.spring.luxury);
    opacity.value = withTiming(0.8, { duration: animations.duration.fast });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animations.spring.luxury);
    opacity.value = withTiming(1, { duration: animations.duration.fast });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          gradientColors: [colors.primary[500], colors.primary[600], colors.primary[700]],
          textColor: colors.dark.text,
          shadow: shadows.luxury.md,
        };
      case 'luxury':
        return {
          gradientColors: [colors.gold[400], colors.gold[500], colors.gold[600]],
          textColor: colors.dark.bg,
          shadow: shadows.glow.gold,
        };
      case 'glass':
        return {
          gradientColors: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
          textColor: colors.dark.text,
          shadow: shadows.glass,
        };
      case 'secondary':
      default:
        return {
          gradientColors: [colors.platinum[200], colors.platinum[300]],
          textColor: colors.dark.bg,
          shadow: shadows.luxury.sm,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: typography.sizes.sm,
          minHeight: 36,
        };
      case 'lg':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: typography.sizes.lg,
          minHeight: 56,
        };
      case 'xl':
        return {
          paddingVertical: 20,
          paddingHorizontal: 40,
          fontSize: typography.sizes.xl,
          minHeight: 64,
        };
      case 'md':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: typography.sizes.base,
          minHeight: 48,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  if (variant === 'glass') {
    return (
      <AnimatedTouchableOpacity
        style={[
          styles.button,
          styles.glassButton,
          sizeStyles,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          animatedStyle,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
        <Text
          style={[
            styles.text,
            { 
              color: variantStyles.textColor,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.button,
        sizeStyles,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <AnimatedLinearGradient
        colors={variantStyles.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.button }]}
      />
      <Animated.View style={[styles.content, { flexDirection: 'row', alignItems: 'center' }]}>
        {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
        <Text
          style={[
            styles.text,
            { 
              color: variantStyles.textColor,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  
  glassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Note: backdropFilter not supported in React Native, using backgroundColor instead
  },
  
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  text: {
    fontFamily: typography.fonts.heading,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.tracking.wide,
    textAlign: 'center',
  },
  
  icon: {
    marginRight: 8,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: 0.5,
  },
});