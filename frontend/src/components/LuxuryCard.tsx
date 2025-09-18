import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import { colors, borderRadius, shadows, animations } from '../theme/luxuryTokens';

interface LuxuryCardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'luxury' | 'cinematic' | 'gradient';
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const LuxuryCard: React.FC<LuxuryCardProps> = ({
  children,
  variant = 'glass',
  elevation = 'md',
  padding = 20,
  style,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, animations.spring.luxury);
      translateY.value = withSpring(2, animations.spring.luxury);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, animations.spring.luxury);
      translateY.value = withSpring(0, animations.spring.luxury);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'luxury':
        return {
          gradientColors: [colors.platinum[50], colors.platinum[100]],
          borderColor: colors.platinum[200],
          shadowColor: colors.platinum[400],
        };
      case 'cinematic':
        return {
          gradientColors: [colors.fashion.midnight, colors.fashion.charcoal],
          borderColor: colors.fashion.smokeGray,
          shadowColor: colors.primary[500],
        };
      case 'gradient':
        return {
          gradientColors: [colors.primary[500], colors.primary[600]],
          borderColor: colors.primary[400],
          shadowColor: colors.primary[500],
        };
      case 'glass':
      default:
        return {
          gradientColors: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
          borderColor: 'rgba(255,255,255,0.2)',
          shadowColor: colors.platinum[500],
        };
    }
  };

  const getShadowStyle = () => {
    switch (elevation) {
      case 'sm':
        return shadows.luxury.sm;
      case 'lg':
        return shadows.luxury.lg;
      case 'xl':
        return shadows.luxury.xl;
      case 'md':
      default:
        return shadows.luxury.md;
    }
  };

  const variantStyles = getVariantStyles();
  const shadowStyle = getShadowStyle();

  if (variant === 'glass') {
    return (
      <AnimatedView
        style={[
          styles.card,
          styles.glassCard,
          {
            padding,
            borderColor: variantStyles.borderColor,
            shadowColor: variantStyles.shadowColor,
            ...shadowStyle,
          },
          animatedStyle,
          style,
        ]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
      >
        {children}
      </AnimatedView>
    );
  }

  return (
    <AnimatedView
      style={[
        styles.card,
        {
          padding,
          shadowColor: variantStyles.shadowColor,
          ...shadowStyle,
        },
        animatedStyle,
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <AnimatedLinearGradient
        colors={variantStyles.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        {children}
      </View>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    position: 'relative',
  },
  
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  
  content: {
    flex: 1,
    zIndex: 1,
  },
});