import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MembershipTier, getTierBadge, formatTierName } from '../context/UserRolesContext';

interface TierBadgeProps {
  tier: MembershipTier;
  showGlow?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  showGlow = false,
  size = 'medium',
  style
}) => {
  const { icon, color } = getTierBadge(tier);
  const formattedName = formatTierName(tier);
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
          icon: 12,
          text: { fontSize: 10, fontWeight: '600' as const }
        };
      case 'large':
        return {
          container: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
          icon: 20,
          text: { fontSize: 16, fontWeight: '700' as const }
        };
      default: // medium
        return {
          container: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
          icon: 16,
          text: { fontSize: 12, fontWeight: '600' as const }
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getTierGradient = () => {
    switch (tier) {
      case 'premium':
        return ['#FF9500', '#FFB800'];
      case 'pro':
        return ['#007AFF', '#5AC8FA'];
      case 'business':
        return ['#34C759', '#30D158'];
      case 'first-class':
        return ['#FF3B30', '#FF6B6B'];
      case 'world-class':
        return ['#AF52DE', '#BF5AF2'];
      default: // regular
        return ['#8E8E93', '#A1A1A6'];
    }
  };

  if (tier === 'regular') {
    // Simple badge for regular tier
    return (
      <View style={[styles.regularBadge, sizeStyles.container, style]}>
        <Ionicons name={icon as any} size={sizeStyles.icon} color={color} />
        <Text style={[styles.regularText, sizeStyles.text]}>
          {formattedName}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={style}>
      {showGlow && (
        <View style={[styles.glowContainer, sizeStyles.container]}>
          <LinearGradient
            colors={[`${color}40`, `${color}20`, `${color}40`]}
            style={styles.glow}
          />
        </View>
      )}
      
      <BlurView intensity={20} style={[styles.premiumBadge, sizeStyles.container]}>
        <LinearGradient
          colors={getTierGradient()}
          style={styles.premiumGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.badgeContent}>
            <Ionicons name={icon as any} size={sizeStyles.icon} color="white" />
            <Text style={[styles.premiumText, sizeStyles.text]}>
              {formattedName}
            </Text>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  regularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    gap: 4,
  },
  regularText: {
    color: '#8E8E93',
  },
  glowContainer: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    alignSelf: 'center',
    top: '-10%',
  },
  glow: {
    flex: 1,
    borderRadius: 20,
  },
  premiumBadge: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  premiumGradient: {
    flex: 1,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  premiumText: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

// Animated tier upgrade component
export const TierUpgradeAnimation: React.FC<{
  fromTier: MembershipTier;
  toTier: MembershipTier;
  onComplete?: () => void;
}> = ({ fromTier, toTier, onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.upgradeContainer}>
      <Animated.View entering={FadeIn.delay(0)}>
        <TierBadge tier={fromTier} size="large" />
      </Animated.View>
      
      <Animated.View entering={FadeIn.delay(500)} style={styles.arrow}>
        <Ionicons name="arrow-forward" size={24} color="#4facfe" />
      </Animated.View>
      
      <Animated.View entering={FadeIn.delay(1000)}>
        <TierBadge tier={toTier} size="large" showGlow />
      </Animated.View>
    </View>
  );
};

const upgradeStyles = StyleSheet.create({
  upgradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  arrow: {
    padding: 8,
  },
});