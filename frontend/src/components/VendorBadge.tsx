import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface VendorBadgeProps {
  vendorType?: 'goldwave' | 'bluewave' | 'greywave' | 'verified';
  vendorName?: string;
  showAccessButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function VendorBadge({ 
  vendorType = 'verified', 
  vendorName = 'Verified Vendor',
  showAccessButton = false,
  size = 'medium',
  style 
}: VendorBadgeProps) {
  const router = useRouter();

  const getBadgeConfig = () => {
    switch (vendorType) {
      case 'goldwave':
        return {
          colors: ['#D4AF37', '#FFD700', '#FFA500'],
          icon: '👑',
          title: 'GoldWave Vendor',
          subtitle: 'Premium • CLP + PPL Optimized',
          textColor: '#000000',
        };
      case 'bluewave':
        return {
          colors: ['#007AFF', '#0056CC', '#003D99'],
          icon: '🌊',
          title: 'BlueWave Vendor',
          subtitle: 'Family Safe • Verified Quality',
          textColor: '#FFFFFF',
        };
      case 'greywave':
        return {
          colors: ['#8E8E93', '#6D6D80', '#48484A'],
          icon: '⚪',
          title: 'GreyWave Vendor',
          subtitle: 'Standard • Quality Assured',
          textColor: '#FFFFFF',
        };
      default:
        return {
          colors: ['#4ECDC4', '#44A08D', '#2E8B7E'],
          icon: '✅',
          title: 'Verified Vendor',
          subtitle: 'Trusted • Secure',
          textColor: '#FFFFFF',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          padding: 8,
          iconSize: 16,
          titleSize: 12,
          subtitleSize: 10,
          borderRadius: 8,
        };
      case 'large':
        return {
          padding: 20,
          iconSize: 24,
          titleSize: 18,
          subtitleSize: 14,
          borderRadius: 16,
        };
      default:
        return {
          padding: 12,
          iconSize: 20,
          titleSize: 16,
          subtitleSize: 12,
          borderRadius: 12,
        };
    }
  };

  const badgeConfig = getBadgeConfig();
  const sizeConfig = getSizeConfig();

  const navigateToVendorPortal = () => {
    router.push('/vendor-access-portal');
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={badgeConfig.colors}
        style={[
          styles.badge,
          {
            padding: sizeConfig.padding,
            borderRadius: sizeConfig.borderRadius,
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.badgeContent}>
          <Text style={[
            styles.badgeIcon,
            { 
              fontSize: sizeConfig.iconSize,
              color: badgeConfig.textColor
            }
          ]}>
            {badgeConfig.icon}
          </Text>
          
          <View style={styles.badgeText}>
            <Text style={[
              styles.badgeTitle,
              {
                fontSize: sizeConfig.titleSize,
                color: badgeConfig.textColor,
              }
            ]}>
              {vendorName || badgeConfig.title}
            </Text>
            
            {size !== 'small' && (
              <Text style={[
                styles.badgeSubtitle,
                {
                  fontSize: sizeConfig.subtitleSize,
                  color: badgeConfig.textColor,
                  opacity: 0.8,
                }
              ]}>
                {badgeConfig.subtitle}
              </Text>
            )}
          </View>

          {showAccessButton && size !== 'small' && (
            <TouchableOpacity 
              style={[
                styles.accessButton,
                { backgroundColor: badgeConfig.textColor + '20' }
              ]}
              onPress={navigateToVendorPortal}
            >
              <Text style={[
                styles.accessButtonText,
                { color: badgeConfig.textColor }
              ]}>
                Dashboard
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Premium Features Indicator */}
        {(vendorType === 'goldwave' || vendorType === 'bluewave') && (
          <View style={styles.premiumIndicator}>
            <View style={styles.premiumDot} />
            <Text style={[
              styles.premiumText,
              { color: badgeConfig.textColor, opacity: 0.8 }
            ]}>
              CLP + PPL
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Verification Checkmark */}
      <View style={styles.verificationMark}>
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.verificationCircle}
        >
          <Text style={styles.verificationCheck}>✓</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    marginRight: 8,
    fontWeight: '600',
  },
  badgeText: {
    flex: 1,
  },
  badgeTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  badgeSubtitle: {
    fontWeight: '500',
    lineHeight: 16,
  },
  accessButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  accessButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  premiumIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginRight: 4,
  },
  premiumText: {
    fontSize: 8,
    fontWeight: '600',
  },
  verificationMark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  verificationCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verificationCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});