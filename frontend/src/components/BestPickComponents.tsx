/**
 * Best Pick Components
 * UI components for displaying Best Pick badges and scoring information
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BestPick } from '../services/SearchService';
import { formatPrice, getBestPickBadgeColor, getReasonEmoji } from '../services/SearchService';

// ============= INTERFACES =============

interface BestPickBadgeProps {
  bestPick: BestPick;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showDetails?: boolean;
}

interface BestPickReasonProps {
  reason: string;
  isActive: boolean;
  size?: 'small' | 'medium';
}

interface BestPickScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

interface BestPickExplanationProps {
  bestPick: BestPick;
  style?: any;
}

// ============= BEST PICK BADGE COMPONENT =============

export const BestPickBadge: React.FC<BestPickBadgeProps> = ({
  bestPick,
  size = 'medium',
  onPress,
  showDetails = false
}) => {
  const badgeColor = getBestPickBadgeColor(bestPick.score);
  const sizeStyles = getBadgeSizeStyles(size);
  
  const BadgeContent = () => (
    <View style={[styles.badge, sizeStyles.badge, { backgroundColor: badgeColor }]}>
      <View style={styles.badgeContent}>
        <Ionicons 
          name="trophy" 
          size={sizeStyles.iconSize} 
          color="#FFFFFF" 
        />
        <Text style={[styles.badgeText, sizeStyles.text]}>
          Best Pick
        </Text>
        {size !== 'small' && (
          <BestPickScore 
            score={bestPick.score} 
            size={size === 'large' ? 'medium' : 'small'}
            showLabel={false}
          />
        )}
      </View>
      
      {showDetails && size !== 'small' && (
        <View style={styles.badgeDetails}>
          <View style={styles.reasonsContainer}>
            {bestPick.reasons.map((reason) => (
              <BestPickReason 
                key={reason}
                reason={reason}
                isActive={true}
                size={size === 'large' ? 'medium' : 'small'}
              />
            ))}
          </View>
          {size === 'large' && (
            <Text style={styles.explanationText}>
              {bestPick.explanation}
            </Text>
          )}
        </View>
      )}
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <BadgeContent />
      </TouchableOpacity>
    );
  }
  
  return <BadgeContent />;
};

// ============= BEST PICK REASON COMPONENT =============

export const BestPickReason: React.FC<BestPickReasonProps> = ({
  reason,
  isActive,
  size = 'medium'
}) => {
  const emoji = getReasonEmoji(reason);
  const sizeStyles = getReasonSizeStyles(size);
  
  return (
    <View style={[
      styles.reason,
      sizeStyles.container,
      isActive ? styles.reasonActive : styles.reasonInactive
    ]}>
      <Text style={[styles.reasonEmoji, sizeStyles.emoji]}>
        {emoji}
      </Text>
      {size === 'medium' && (
        <Text style={[styles.reasonText, sizeStyles.text]}>
          {getReasonDisplayName(reason)}
        </Text>
      )}
    </View>
  );
};

// ============= BEST PICK SCORE COMPONENT =============

export const BestPickScore: React.FC<BestPickScoreProps> = ({
  score,
  size = 'medium',
  showLabel = true
}) => {
  const scoreColor = getBestPickBadgeColor(score);
  const sizeStyles = getScoreSizeStyles(size);
  
  return (
    <View style={styles.scoreContainer}>
      {showLabel && size !== 'small' && (
        <Text style={[styles.scoreLabel, sizeStyles.label]}>
          Score
        </Text>
      )}
      <View style={[styles.scoreCircle, sizeStyles.circle, { borderColor: scoreColor }]}>
        <Text style={[styles.scoreText, sizeStyles.text, { color: scoreColor }]}>
          {(score * 100).toFixed(0)}
        </Text>
      </View>
      {showLabel && size === 'large' && (
        <Text style={styles.scoreDescription}>
          out of 100
        </Text>
      )}
    </View>
  );
};

// ============= BEST PICK EXPLANATION COMPONENT =============

export const BestPickExplanation: React.FC<BestPickExplanationProps> = ({
  bestPick,
  style
}) => {
  return (
    <View style={[styles.explanationContainer, style]}>
      <View style={styles.explanationHeader}>
        <Ionicons name="information-circle" size={16} color="#6B7280" />
        <Text style={styles.explanationTitle}>Why this is the Best Pick:</Text>
      </View>
      
      <Text style={styles.explanationText}>
        {bestPick.explanation}
      </Text>
      
      <View style={styles.reasonsGrid}>
        {bestPick.reasons.map((reason) => (
          <BestPickReason 
            key={reason}
            reason={reason}
            isActive={true}
            size="medium"
          />
        ))}
      </View>
      
      <View style={styles.priceDisplay}>
        <Text style={styles.priceLabel}>Best Price:</Text>
        <Text style={styles.priceValue}>
          {formatPrice(bestPick.price_minor, bestPick.currency)}
        </Text>
      </View>
    </View>
  );
};

// ============= BEST PICK COMPACT DISPLAY =============

export const BestPickCompact: React.FC<{ bestPick: BestPick; onPress?: () => void }> = ({
  bestPick,
  onPress
}) => {
  const badgeColor = getBestPickBadgeColor(bestPick.score);
  
  const Content = () => (
    <View style={[styles.compactContainer, { borderLeftColor: badgeColor }]}>
      <View style={styles.compactHeader}>
        <View style={[styles.compactBadge, { backgroundColor: badgeColor }]}>
          <Ionicons name="trophy" size={12} color="#FFFFFF" />
          <Text style={styles.compactBadgeText}>Best</Text>
        </View>
        <BestPickScore score={bestPick.score} size="small" showLabel={false} />
      </View>
      
      <Text style={styles.compactPrice}>
        {formatPrice(bestPick.price_minor, bestPick.currency)}
      </Text>
      
      <View style={styles.compactReasons}>
        {bestPick.reasons.slice(0, 3).map((reason) => (
          <Text key={reason} style={styles.compactReasonEmoji}>
            {getReasonEmoji(reason)}
          </Text>
        ))}
        {bestPick.reasons.length > 3 && (
          <Text style={styles.compactMoreText}>+{bestPick.reasons.length - 3}</Text>
        )}
      </View>
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Content />
      </TouchableOpacity>
    );
  }
  
  return <Content />;
};

// ============= UTILITY FUNCTIONS =============

const getReasonDisplayName = (reason: string): string => {
  const displayNames: Record<string, string> = {
    price: 'Best Price',
    trust: 'Trusted',
    eta: 'Fast Delivery',
    cultural_fit: 'Local Fit',
    stock: 'In Stock'
  };
  return displayNames[reason] || reason;
};

const getBadgeSizeStyles = (size: 'small' | 'medium' | 'large') => {
  const styles = {
    small: {
      badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
      text: { fontSize: 10, fontWeight: '600' as const },
      iconSize: 12
    },
    medium: {
      badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
      text: { fontSize: 12, fontWeight: '700' as const },
      iconSize: 16
    },
    large: {
      badge: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
      text: { fontSize: 14, fontWeight: '700' as const },
      iconSize: 20
    }
  };
  return styles[size];
};

const getReasonSizeStyles = (size: 'small' | 'medium') => {
  const styles = {
    small: {
      container: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6 },
      emoji: { fontSize: 12 },
      text: { fontSize: 8 }
    },
    medium: {
      container: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
      emoji: { fontSize: 14 },
      text: { fontSize: 10 }
    }
  };
  return styles[size];
};

const getScoreSizeStyles = (size: 'small' | 'medium' | 'large') => {
  const styles = {
    small: {
      circle: { width: 24, height: 24, borderRadius: 12 },
      text: { fontSize: 10, fontWeight: '700' as const },
      label: { fontSize: 8 }
    },
    medium: {
      circle: { width: 32, height: 32, borderRadius: 16 },
      text: { fontSize: 12, fontWeight: '700' as const },
      label: { fontSize: 10 }
    },
    large: {
      circle: { width: 48, height: 48, borderRadius: 24 },
      text: { fontSize: 16, fontWeight: '700' as const },
      label: { fontSize: 12 }
    }
  };
  return styles[size];
};

// ============= STYLES =============

const styles = StyleSheet.create({
  // Badge Styles
  badge: {
    backgroundColor: '#10B981',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  badgeDetails: {
    marginTop: 8,
    alignItems: 'center',
  },
  
  // Reason Styles
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  reasonActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  reasonInactive: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reasonEmoji: {
    textAlign: 'center',
  },
  reasonText: {
    color: '#374151',
    fontWeight: '500',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  
  // Score Styles
  scoreContainer: {
    alignItems: 'center',
    gap: 4,
  },
  scoreCircle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scoreText: {
    fontWeight: '700',
    fontFamily: 'System',
  },
  scoreLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  scoreDescription: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  
  // Explanation Styles
  explanationContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  explanationText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  
  // Price Display
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '700',
  },
  
  // Compact Styles
  compactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compactBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  compactReasons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactReasonEmoji: {
    fontSize: 12,
  },
  compactMoreText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});