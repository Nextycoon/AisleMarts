import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface VendorCTABannerProps {
  onDismiss?: () => void;
}

export default function VendorCTABanner({ onDismiss }: VendorCTABannerProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const handleClaim = () => {
    // Track conversion event
    console.log('🎯 FREE LEADS CTA CLICKED - CONVERSION EVENT');
    
    // Navigate to vendor signup/business console
    router.push('/business/dashboard');
  };

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
      onDismiss?.();
    });
  };

  if (dismissed) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#D4AF37', '#E8C968', '#FFD700']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Dismiss Button */}
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.headline}>🚀 VENDORS: KEEP 100% OF YOUR REVENUE!</Text>
            <Text style={styles.subheadline}>
              World's First 0% Commission Platform • Pay Only Per Qualified Lead
            </Text>
            
            <View style={styles.benefitsRow}>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>💰</Text>
                <Text style={styles.benefitText}>No Commission Fees</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🎯</Text>
                <Text style={styles.benefitText}>AI Lead Qualification</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🌍</Text>
                <Text style={styles.benefitText}>4M+ Cities Global</Text>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleClaim}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#000000', '#333333']}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>🎁 CLAIM 100 FREE QUALIFIED LEADS</Text>
                <Text style={styles.ctaSubtext}>Start saving thousands in commission fees today</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Social Proof */}
            <Text style={styles.socialProof}>
              ⭐ 52,000+ vendors already saving billions in fees • 17.4% average conversion
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    padding: 20,
    position: 'relative',
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mainContent: {
    paddingRight: 40,
  },
  headline: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subheadline: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  benefit: {
    alignItems: 'center',
    flex: 1,
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  benefitText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  ctaSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
  socialProof: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
});