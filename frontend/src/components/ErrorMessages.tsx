import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal } from 'react-native';
import { theme } from '../theme/theme';

interface ErrorContext {
  type: 'network' | 'payment' | 'validation' | 'server' | 'auth';
  locale: string;
  retryAvailable: boolean;
  timeoutDuration?: number;
  userJourney?: string;
}

// Humanized error messages for Kenya market
const getHumanizedError = (error: Error, context: ErrorContext) => {
  const messages = {
    network: {
      en: {
        title: "Network's being tricky 📶",
        message: "Your internet seems a bit slow right now. Want us to try again?",
        action: "Try Again",
        tip: "Tip: We'll save your progress automatically"
      },
      sw: {
        title: "Mtandao haujaungana vizuri 📶",
        message: "Intaneti yako inaonekana polepole sasa. Tujaribu tena?",
        action: "Jaribu Tena",
        tip: "Kidokezo: Tutahifadhi maendeleo yako kiotomatiki"
      }
    },
    payment: {
      en: {
        title: "M-Pesa needs a moment 💳",
        message: "M-Pesa is taking a bit longer than usual. This happens sometimes during busy hours.",
        action: "Check M-Pesa Status",
        tip: "Your payment is safe - we'll update you once it goes through"
      },
      sw: {
        title: "M-Pesa inahitaji muda kidogo 💳",
        message: "M-Pesa inachukua muda zaidi kuliko kawaida. Hii hutokea wakati wa msongamano.",
        action: "Angalia Hali ya M-Pesa",
        tip: "Malipo yako ni salama - tutakujulisha inapopita"
      }
    },
    validation: {
      en: {
        title: "Almost there! ✨",
        message: "Just need to fix a couple of things before we continue.",
        action: "Fix & Continue",
        tip: "Don't worry, we've saved everything else"
      },
      sw: {
        title: "Karibu tuongeze! ✨", 
        message: "Tunahitaji kurekebisha mambo machache kabla ya kuendelea.",
        action: "Rekebisha & Endelea",
        tip: "Usiwe na wasiwasi, tumehifadhi kila kitu kingine"
      }
    },
    server: {
      en: {
        title: "Our servers are catching up 🔧",
        message: "We're experiencing high demand right now. Give us a moment!",
        action: "Refresh",
        tip: "Kenya's embracing digital commerce - thanks for your patience!"
      },
      sw: {
        title: "Seva zetu zinapumzika kidogo 🔧",
        message: "Tuna idadi kubwa ya watumiaji sasa. Tusubiri kidogo!",
        action: "Onyesha Upya",
        tip: "Kenya inakubali biashara za kidijitali - asante kwa uvumilivu!"
      }
    },
    auth: {
      en: {
        title: "Let's get you signed in 🔐",
        message: "Something went wrong with your login. No worries, happens to everyone!",
        action: "Try Again",
        tip: "Having trouble? We're here to help via WhatsApp"
      },
      sw: {
        title: "Hebu tukuingizie 🔐",
        message: "Kuna tatizo na kuingia kwako. Hakuna shida, hutokea kwa kila mtu!",
        action: "Jaribu Tena", 
        tip: "Una tatizo? Tuko hapa kukusaidia kupitia WhatsApp"
      }
    }
  };
  
  return messages[context.type]?.[context.locale] || messages[context.type]['en'];
};

// Smart retry button with exponential backoff
interface SmartRetryButtonProps {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  initialDelay?: number;
  locale: string;
}

const SmartRetryButton: React.FC<SmartRetryButtonProps> = ({ 
  onRetry, 
  maxRetries = 3, 
  initialDelay = 1000,
  locale
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [nextRetryIn, setNextRetryIn] = useState(0);
  const scaleAnim = useState(new Animated.Value(1))[0];
  
  const handleRetry = async () => {
    if (retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    const delay = initialDelay * Math.pow(2, retryCount);
    
    // Animate button
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      })
    ]).start();
    
    // Show countdown
    for (let i = Math.ceil(delay / 1000); i > 0; i--) {
      setNextRetryIn(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setNextRetryIn(0);
    
    try {
      await onRetry();
      setRetryCount(0); // Reset on success
    } catch (error) {
      setRetryCount(prev => prev + 1);
    }
    
    setIsRetrying(false);
  };
  
  const getButtonText = () => {
    if (isRetrying && nextRetryIn > 0) {
      return locale === 'sw' 
        ? `Kujirudia baada ya ${nextRetryIn}s...`
        : `Retrying in ${nextRetryIn}s...`;
    }
    
    if (retryCount >= maxRetries) {
      return locale === 'sw' ? 'Wasiliana Nasi' : 'Contact Support';
    }
    
    return locale === 'sw' ? 'Jaribu Tena' : 'Try Again';
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.retryButton,
          isRetrying && styles.retryingButton,
          retryCount >= maxRetries && styles.supportButton
        ]}
        onPress={handleRetry}
        disabled={isRetrying}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.retryButtonText,
          retryCount >= maxRetries && styles.supportButtonText
        ]}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Contextual help system
interface ContextualHelpProps {
  errorType: ErrorContext['type'];
  userJourney?: string;
  locale: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ 
  errorType, 
  userJourney, 
  locale 
}) => {
  const getHelpContent = () => {
    if (errorType === 'payment' && userJourney === 'first_purchase') {
      return {
        title: locale === 'sw' ? "Mpya kwa malipo ya M-Pesa? 🤝" : "New to M-Pesa payments? 🤝",
        content: locale === 'sw' 
          ? "Hakuna shida! Hii ni mwongozo wa haraka wa kukamilisha malipo yako kwa usalama."
          : "Don't worry! Here's a quick guide to complete your payment safely.",
        contact: locale === 'sw' 
          ? "WhatsApp +254700123456 kwa msaada wa haraka"
          : "WhatsApp +254700123456 for instant help"
      };
    }
    
    if (errorType === 'network' && userJourney === 'seller_upload') {
      return {
        title: locale === 'sw' ? "Kupakia kwa intaneti polepole? 📶" : "Uploading on slow internet? 📶",
        content: locale === 'sw'
          ? "Tutaendelea kujaribu nyuma. Unaweza kufunga programu na tutakujulisha ikimaliza."
          : "We'll keep trying in the background. You can close the app and we'll notify you when it's done.",
        tip: locale === 'sw'
          ? "Kidokezo: Pakia wakati wa mapumziko (asubuhi na mapema) kwa kasi zaidi"
          : "Pro tip: Upload during off-peak hours (early morning) for faster speeds"
      };
    }
    
    return null;
  };
  
  const helpContent = getHelpContent();
  if (!helpContent) return null;
  
  return (
    <View style={styles.contextualHelp}>
      <Text style={styles.helpTitle}>{helpContent.title}</Text>
      <Text style={styles.helpContent}>{helpContent.content}</Text>
      {helpContent.tip && (
        <Text style={styles.helpTip}>💡 {helpContent.tip}</Text>
      )}
      {helpContent.contact && (
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactText}>{helpContent.contact}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Main error message component
interface ErrorMessageProps {
  error: Error;
  context: ErrorContext;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
  visible: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  context,
  onRetry,
  onDismiss,
  visible
}) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-100))[0];
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);
  
  if (!visible) return null;
  
  const errorContent = getHumanizedError(error, context);
  
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.errorContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Error Header */}
          <View style={styles.errorHeader}>
            <Text style={styles.errorTitle}>{errorContent.title}</Text>
            {onDismiss && (
              <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
                <Text style={styles.dismissText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Error Message */}
          <Text style={styles.errorMessage}>{errorContent.message}</Text>
          
          {/* Error Tip */}
          <Text style={styles.errorTip}>💡 {errorContent.tip}</Text>
          
          {/* Contextual Help */}
          <ContextualHelp 
            errorType={context.type}
            userJourney={context.userJourney}
            locale={context.locale}
          />
          
          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {onRetry && context.retryAvailable && (
              <SmartRetryButton 
                onRetry={onRetry}
                locale={context.locale}
              />
            )}
            
            {onDismiss && (
              <TouchableOpacity 
                style={styles.dismissActionButton}
                onPress={onDismiss}
              >
                <Text style={styles.dismissActionText}>
                  {context.locale === 'sw' ? 'Sawa' : 'OK'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Styles
const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space.lg,
  },
  errorContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.space.lg,
    maxWidth: '100%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500', // Warm orange instead of harsh red
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.space.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  dismissButton: {
    padding: theme.space.xs,
  },
  dismissText: {
    fontSize: 18,
    color: theme.colors.textDim,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.space.md,
  },
  errorTip: {
    fontSize: 14,
    color: '#FF9500',
    fontStyle: 'italic',
    marginBottom: theme.space.md,
  },
  contextualHelp: {
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.space.md,
    borderLeftWidth: 3,
    borderLeftColor: '#4A9EFF',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A9EFF',
    marginBottom: theme.space.xs,
  },
  helpContent: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  helpTip: {
    fontSize: 12,
    color: '#4A9EFF',
    fontStyle: 'italic',
    marginTop: theme.space.xs,
  },
  contactButton: {
    marginTop: theme.space.sm,
    padding: theme.space.sm,
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: theme.radius.sm,
  },
  contactText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: theme.space.sm,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#4A9EFF',
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  retryingButton: {
    backgroundColor: '#FF9500',
  },
  supportButton: {
    backgroundColor: '#25D366',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButtonText: {
    color: 'white',
  },
  dismissActionButton: {
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.textDim,
  },
  dismissActionText: {
    color: theme.colors.textDim,
    fontSize: 16,
    textAlign: 'center',
  },
};

export default ErrorMessage;