import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { theme } from '../theme/theme';

// Shimmer effect for loading states
interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.radius.sm,
  style
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    );
    
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100]
  });

  return (
    <View 
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          overflow: 'hidden'
        },
        style
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          transform: [{ translateX }]
        }}
      />
    </View>
  );
};

// Product card shimmer loading
export const ProductShimmer: React.FC = () => (
  <View style={styles.productShimmer}>
    <Shimmer width="100%" height={200} borderRadius={theme.radius.md} />
    <View style={styles.productShimmerContent}>
      <Shimmer width="80%" height={16} />
      <View style={styles.shimmerRow}>
        <Shimmer width="60%" height={14} />
        <Shimmer width={50} height={14} />
      </View>
      <Shimmer width="40%" height={20} />
    </View>
  </View>
);

// AI Loading Indicator with Kenya context
interface AILoadingProps {
  message?: string;
  locale: string;
}

export const AILoading: React.FC<AILoadingProps> = ({ 
  message, 
  locale 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    );

    // Rotate animation for thinking indicator
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    pulseLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const loadingMessages = {
    en: [
      "AI is thinking...",
      "Finding the best deals in Kenya...",
      "Comparing prices across Nairobi...",
      "Checking M-Pesa friendly stores...",
      "Analyzing your preferences..."
    ],
    sw: [
      "AI inafikiria...",
      "Kutafuta ofa bora Kenya...",
      "Kulinganisha bei Nairobi...",
      "Kuangalia maduka ya M-Pesa...",
      "Kuchambua mapendeleo yako..."
    ]
  };

  const messages = loadingMessages[locale] || loadingMessages['en'];
  const displayMessage = message || messages[Math.floor(Math.random() * messages.length)];

  return (
    <View style={styles.aiLoadingContainer}>
      <Animated.View 
        style={[
          styles.aiLoadingIcon,
          { 
            transform: [
              { scale: pulseAnim },
              { rotate }
            ]
          }
        ]}
      >
        <Text style={styles.aiLoadingEmoji}>🤖</Text>
      </Animated.View>
      
      <Text style={styles.aiLoadingText}>
        {displayMessage}
      </Text>
      
      <View style={styles.thinkingDots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.thinkingDot,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.3, 1]
                }),
                transform: [{
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [0.8, 1.2]
                  })
                }]
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// M-Pesa Payment Loading with trust indicators
interface MPesaLoadingProps {
  step: number;
  locale: string;
}

export const MPesaLoading: React.FC<MPesaLoadingProps> = ({ 
  step, 
  locale 
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Progress animation
    Animated.timing(progressAnim, {
      toValue: step / 3,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Pulse animation
    const pulseLoop = Animated.loop(
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

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [step]);

  const steps = {
    en: [
      "Connecting to M-Pesa...",
      "Processing payment...",
      "Confirming transaction...",
      "Payment complete!"
    ],
    sw: [
      "Kuunganisha na M-Pesa...",
      "Kuchakata malipo...",
      "Kuthibitisha muamala...",
      "Malipo yamekamilika!"
    ]
  };

  const currentSteps = steps[locale] || steps['en'];

  return (
    <View style={styles.mpesaLoadingContainer}>
      {/* M-Pesa Branding */}
      <View style={styles.mpesaBranding}>
        <Text style={styles.safaricomText}>Safaricom</Text>
        <Text style={styles.mpesaText}>M-PESA</Text>
      </View>

      {/* Security Shield */}
      <Animated.View 
        style={[
          styles.securityShield,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Text style={styles.shieldIcon}>🛡️</Text>
      </Animated.View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]} 
        />
      </View>

      {/* Current Step */}
      <Text style={styles.mpesaLoadingText}>
        {currentSteps[step] || currentSteps[0]}
      </Text>

      {/* Trust Indicators */}
      <View style={styles.trustIndicators}>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>🔒</Text>
          <Text style={styles.trustText}>
            {locale === 'sw' ? 'Salama' : 'Secure'}
          </Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>⚡</Text>
          <Text style={styles.trustText}>
            {locale === 'sw' ? 'Haraka' : 'Fast'}
          </Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>✅</Text>
          <Text style={styles.trustText}>
            {locale === 'sw' ? 'Imeaminika' : 'Trusted'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Seller Dashboard Loading
export const SellerDashboardLoading: React.FC = () => (
  <View style={styles.sellerLoadingContainer}>
    {/* Header Stats Shimmer */}
    <View style={styles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.statShimmer}>
          <Shimmer width={30} height={30} borderRadius={15} />
          <Shimmer width="80%" height={16} />
          <Shimmer width="60%" height={12} />
        </View>
      ))}
    </View>

    {/* Chart Shimmer */}
    <View style={styles.chartShimmer}>
      <Shimmer width="100%" height={200} borderRadius={theme.radius.md} />
    </View>

    {/* Orders List Shimmer */}
    <View style={styles.ordersShimmer}>
      <Shimmer width="40%" height={20} />
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.orderItemShimmer}>
          <Shimmer width={40} height={40} borderRadius={20} />
          <View style={styles.orderDetailsShimmer}>
            <Shimmer width="70%" height={16} />
            <Shimmer width="50%" height={14} />
          </View>
          <Shimmer width={60} height={30} borderRadius={15} />
        </View>
      ))}
    </View>
  </View>
);

// Network Status Loading
interface NetworkLoadingProps {
  type: 'reconnecting' | 'syncing' | 'uploading';
  locale: string;
}

export const NetworkLoading: React.FC<NetworkLoadingProps> = ({ 
  type, 
  locale 
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const waveLoop = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    waveLoop.start();
    return () => waveLoop.stop();
  }, []);

  const messages = {
    reconnecting: {
      en: "Reconnecting to the internet...",
      sw: "Kuunganisha tena na intaneti..."
    },
    syncing: {
      en: "Syncing your data...",
      sw: "Kusawazisha data yako..."
    },
    uploading: {
      en: "Uploading your content...",
      sw: "Kupakia maudhui yako..."
    }
  };

  const icons = {
    reconnecting: "📶",
    syncing: "🔄", 
    uploading: "☁️"
  };

  return (
    <View style={styles.networkLoadingContainer}>
      <Animated.View
        style={[
          styles.networkIcon,
          {
            opacity: waveAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.5, 1, 0.5]
            })
          }
        ]}
      >
        <Text style={styles.networkEmoji}>{icons[type]}</Text>
      </Animated.View>
      
      <Text style={styles.networkText}>
        {messages[type][locale] || messages[type]['en']}
      </Text>
      
      <Text style={styles.networkSubtext}>
        {locale === 'sw' 
          ? "Hali ya mtandao ni nzuri - subiri kidogo..."
          : "Network conditions are good - just a moment..."
        }
      </Text>
    </View>
  );
};

// Styles
const styles = {
  // Product Shimmer
  productShimmer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.space.md,
    marginBottom: theme.space.md,
  },
  productShimmerContent: {
    marginTop: theme.space.md,
    gap: theme.space.sm,
  },
  shimmerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // AI Loading
  aiLoadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.space.xl,
  },
  aiLoadingIcon: {
    marginBottom: theme.space.md,
  },
  aiLoadingEmoji: {
    fontSize: 48,
  },
  aiLoadingText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.space.md,
  },
  thinkingDots: {
    flexDirection: 'row',
    gap: theme.space.xs,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A9EFF',
  },

  // M-Pesa Loading
  mpesaLoadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.space.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    margin: theme.space.md,
  },
  mpesaBranding: {
    alignItems: 'center',
    marginBottom: theme.space.lg,
  },
  safaricomText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  mpesaText: {
    fontSize: 20,
    color: '#22C55E',
    fontWeight: '700',
  },
  securityShield: {
    marginBottom: theme.space.lg,
  },
  shieldIcon: {
    fontSize: 40,
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: theme.space.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  mpesaLoadingText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.space.lg,
  },
  trustIndicators: {
    flexDirection: 'row',
    gap: theme.space.lg,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustIcon: {
    fontSize: 16,
    marginBottom: theme.space.xs,
  },
  trustText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '600',
  },

  // Seller Dashboard Loading
  sellerLoadingContainer: {
    padding: theme.space.lg,
    gap: theme.space.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.space.md,
  },
  statShimmer: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    gap: theme.space.sm,
  },
  chartShimmer: {
    backgroundColor: theme.colors.card,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
  },
  ordersShimmer: {
    backgroundColor: theme.colors.card,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    gap: theme.space.md,
  },
  orderItemShimmer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  orderDetailsShimmer: {
    flex: 1,
    gap: theme.space.xs,
  },

  // Network Loading
  networkLoadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.space.xl,
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    borderRadius: theme.radius.md,
    margin: theme.space.md,
  },
  networkIcon: {
    marginBottom: theme.space.md,
  },
  networkEmoji: {
    fontSize: 32,
  },
  networkText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.space.sm,
  },
  networkSubtext: {
    fontSize: 12,
    color: theme.colors.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

export default {
  Shimmer,
  ProductShimmer,
  AILoading,
  MPesaLoading,
  SellerDashboardLoading,
  NetworkLoading
};