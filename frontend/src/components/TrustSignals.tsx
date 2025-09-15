import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Modal } from 'react-native';
import { theme } from '../theme/theme';

// M-Pesa Trust Indicator - builds confidence during payments
interface MPesaTrustIndicatorProps {
  paymentAmount: number;
  step: number;
  locale: string;
  visible: boolean;
}

export const MPesaTrustIndicator: React.FC<MPesaTrustIndicatorProps> = ({
  paymentAmount,
  step,
  locale,
  visible
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const trustSteps = {
    en: [
      { icon: "🔒", message: "Payment secured with 256-bit encryption", color: "#4A9EFF" },
      { icon: "📱", message: "Connecting to Safaricom M-Pesa...", color: "#FF9500" },
      { icon: "⏳", message: `Processing your KES ${paymentAmount.toLocaleString()} payment`, color: "#FF9500" },
      { icon: "✅", message: "Payment confirmed! Receipt sent to your phone", color: "#22C55E" }
    ],
    sw: [
      { icon: "🔒", message: "Malipo yamehifadhiwa kwa usalama wa 256-bit", color: "#4A9EFF" },
      { icon: "📱", message: "Kuunganisha na Safaricom M-Pesa...", color: "#FF9500" },
      { icon: "⏳", message: `Kuchakata malipo yako ya KES ${paymentAmount.toLocaleString()}`, color: "#FF9500" },
      { icon: "✅", message: "Malipo yamekamilika! Risiti imetumwa kwenye simu yako", color: "#22C55E" }
    ]
  };

  const currentSteps = trustSteps[locale] || trustSteps['en'];
  const currentStep = currentSteps[step] || currentSteps[0];

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Progress animation
      Animated.timing(progressAnim, {
        toValue: (step + 1) / currentSteps.length,
        duration: 800,
        useNativeDriver: false,
      }).start();

      // Pulse animation for active step
      const pulseSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      );
      
      if (step < 3) { // Only pulse while processing
        pulseSequence.start();
      }

      return () => pulseSequence.stop();
    }
  }, [visible, step]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.trustOverlay}>
        <Animated.View 
          style={[
            styles.trustContainer,
            { opacity: fadeAnim }
          ]}
        >
          {/* Trust Header */}
          <View style={styles.trustHeader}>
            <Text style={styles.trustTitle}>
              {locale === 'sw' ? 'Malipo Salama' : 'Secure Payment'}
            </Text>
            <View style={styles.safaricomBadge}>
              <Text style={styles.safaricomText}>Safaricom</Text>
              <Text style={styles.mpesaText}>M-PESA</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: currentStep.color
                }
              ]} 
            />
          </View>

          {/* Current Step */}
          <Animated.View 
            style={[
              styles.trustStep,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={[styles.trustIcon, { color: currentStep.color }]}>
              {currentStep.icon}
            </Text>
            <Text style={styles.trustMessage}>
              {currentStep.message}
            </Text>
          </Animated.View>

          {/* Security Indicators */}
          <View style={styles.securityIndicators}>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <Text style={styles.securityText}>
                {locale === 'sw' ? 'Usalama wa Kima cha Juu' : 'Bank-Level Security'}
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🔐</Text>
              <Text style={styles.securityText}>
                {locale === 'sw' ? 'SSL Encryption' : 'SSL Encrypted'}
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>✅</Text>
              <Text style={styles.securityText}>
                {locale === 'sw' ? 'Ilivyoidhinishwa na CBK' : 'CBK Approved'}
              </Text>
            </View>
          </View>

          {/* Step Indicators */}
          <View style={styles.stepIndicators}>
            {currentSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: index <= step ? currentSteps[index].color : '#E5E7EB',
                    transform: [{ scale: index === step ? 1.2 : 1 }]
                  }
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Success Celebration Component
interface SuccessAnimationProps {
  type: 'first_sale' | 'payment_success' | 'product_added' | 'milestone_reached';
  onComplete: () => void;
  visible: boolean;
  locale: string;
  data?: any;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  type,
  onComplete,
  visible,
  locale,
  data
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  const celebrationTypes = {
    first_sale: {
      en: {
        icon: "🎉",
        title: "Your first sale!",
        message: "Congratulations! You're officially part of the AisleMarts family.",
        celebration: "Welcome to the seller community!"
      },
      sw: {
        icon: "🎉",
        title: "Mauzo yako ya kwanza!",
        message: "Hongera! Sasa ni mwanachama rasmi wa familia ya AisleMarts.",
        celebration: "Karibu kwenye jamii ya wachuuzi!"
      }
    },
    payment_success: {
      en: {
        icon: "✅",
        title: "Payment successful!",
        message: "Your order is confirmed. Seller will be notified immediately.",
        celebration: "Thank you for choosing AisleMarts!"
      },
      sw: {
        icon: "✅",
        title: "Malipo yamefanikiwa!",
        message: "Agizo lako limethibitishwa. Mchuuzi ataarifiwa mara moja.",
        celebration: "Asante kwa kuchagua AisleMarts!"
      }
    },
    product_added: {
      en: {
        icon: "🚀",
        title: "Product is live!",
        message: "Your product is now visible to thousands of buyers across Kenya.",
        celebration: "Start earning today!"
      },
      sw: {
        icon: "🚀",
        title: "Bidhaa iko tayari!",
        message: "Bidhaa yako sasa inaonekana kwa maelfu ya wanunuzi nchini Kenya.",
        celebration: "Anza kupata mapato leo!"
      }
    },
    milestone_reached: {
      en: {
        icon: "🏆",
        title: "Milestone reached!",
        message: data?.message || "You've achieved something great!",
        celebration: "Keep up the excellent work!"
      },
      sw: {
        icon: "🏆",
        title: "Lengo limefikiwa!",
        message: data?.message || "Umefanikisha jambo kubwa!",
        celebration: "Endelea na kazi nzuri!"
      }
    }
  };

  const celebration = celebrationTypes[type][locale] || celebrationTypes[type]['en'];

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Confetti animation
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setShowConfetti(false);
      });

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.celebrationOverlay}>
        {/* Confetti Effect */}
        {showConfetti && (
          <Animated.View 
            style={[
              styles.confettiContainer,
              {
                opacity: confettiAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0]
                })
              }
            ]}
          >
            {[...Array(20)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#4A9EFF', '#22C55E', '#FF9500', '#F59E0B'][i % 4],
                    transform: [
                      {
                        translateY: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 300]
                        })
                      },
                      {
                        rotate: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${360 * (i % 2 === 0 ? 1 : -1)}deg`]
                        })
                      }
                    ]
                  }
                ]}
              />
            ))}
          </Animated.View>
        )}

        {/* Celebration Card */}
        <Animated.View 
          style={[
            styles.celebrationCard,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.celebrationIcon}>
            {celebration.icon}
          </Text>
          <Text style={styles.celebrationTitle}>
            {celebration.title}
          </Text>
          <Text style={styles.celebrationMessage}>
            {celebration.message}
          </Text>
          <Text style={styles.celebrationSubtext}>
            {celebration.celebration}
          </Text>

          {/* Kenya Flag Touch */}
          <View style={styles.celebrationFooter}>
            <Text style={styles.flagEmoji}>🇰🇪</Text>
            <Text style={styles.footerText}>
              {locale === 'sw' ? 'Karibu Kenya' : 'Made in Kenya'}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Enhanced Button with Micro-Interactions
interface EnhancedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    if (!disabled && !loading) {
      onPress();
    }
  };

  const buttonStyles = {
    primary: { backgroundColor: '#4A9EFF' },
    secondary: { backgroundColor: '#6B7280', borderWidth: 1, borderColor: '#9CA3AF' },
    success: { backgroundColor: '#22C55E' },
    warning: { backgroundColor: '#F59E0B' }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View
        style={[
          styles.enhancedButton,
          buttonStyles[variant],
          disabled && styles.disabledButton,
          isPressed && styles.pressedButton,
          style
        ]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
      >
        {loading ? (
          <Text style={styles.buttonText}>
            {variant === 'primary' ? '⏳' : '🔄'} Loading...
          </Text>
        ) : (
          <Text style={[
            styles.buttonText,
            disabled && styles.disabledButtonText
          ]}>
            {children}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

// Styles
const styles = {
  // Trust Indicator Styles
  trustOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space.lg,
  },
  trustContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.space.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.space.lg,
  },
  trustTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  safaricomBadge: {
    alignItems: 'flex-end',
  },
  safaricomText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  mpesaText: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '700',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: theme.space.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  trustStep: {
    alignItems: 'center',
    marginBottom: theme.space.lg,
  },
  trustIcon: {
    fontSize: 32,
    marginBottom: theme.space.sm,
  },
  trustMessage: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  securityIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.space.lg,
    paddingVertical: theme.space.md,
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    borderRadius: theme.radius.md,
  },
  securityItem: {
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    fontSize: 16,
    marginBottom: theme.space.xs,
  },
  securityText: {
    fontSize: 10,
    color: '#4A9EFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.space.sm,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Celebration Styles
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space.lg,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  celebrationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: theme.space.xl,
    alignItems: 'center',
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  celebrationIcon: {
    fontSize: 64,
    marginBottom: theme.space.md,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.space.sm,
  },
  celebrationMessage: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.space.md,
  },
  celebrationSubtext: {
    fontSize: 14,
    color: '#4A9EFF',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: theme.space.lg,
  },
  celebrationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
  },
  flagEmoji: {
    fontSize: 20,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '600',
  },

  // Enhanced Button Styles
  enhancedButton: {
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressedButton: {
    shadowOpacity: 0.2,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#D1D5DB',
  },
};

export default {
  MPesaTrustIndicator,
  SuccessAnimation,
  EnhancedButton
};