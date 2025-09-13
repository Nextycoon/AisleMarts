import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod, TaxCalculation, FraudAssessment } from '../services/PaymentsTaxService';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected,
  onSelect,
}) => {
  const getMethodIcon = () => {
    switch (method.scheme) {
      case 'visa_mastercard':
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'alipay':
        return 'wallet-outline';
      case 'klarna':
        return 'time-outline';
      default:
        return 'card-outline';
    }
  };

  const getFeeColor = () => {
    const feePercent = (method.processing_fee / 100) * 100; // Rough estimate
    if (feePercent < 2) return '#4CAF50'; // Green
    if (feePercent < 3) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <TouchableOpacity
      style={[styles.paymentCard, selected && styles.paymentCardSelected]}
      onPress={onSelect}
    >
      <View style={styles.paymentCardHeader}>
        <View style={styles.paymentMethodInfo}>
          <Ionicons name={getMethodIcon() as any} size={24} color="#333" />
          <View style={styles.paymentMethodText}>
            <Text style={styles.paymentMethodName}>{method.display_name}</Text>
            <Text style={styles.paymentMethodDetails}>
              {method.settlement_days} day{method.settlement_days !== 1 ? 's' : ''} settlement
            </Text>
          </View>
        </View>
        <View style={styles.paymentMethodMeta}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={[styles.scoreValue, { color: method.score > 80 ? '#4CAF50' : '#FF9800' }]}>
              {method.score.toFixed(0)}
            </Text>
          </View>
          {selected && <Ionicons name="checkmark-circle" size={20} color="#007AFF" />}
        </View>
      </View>
      
      <View style={styles.paymentCardFooter}>
        <Text style={[styles.processingFee, { color: getFeeColor() }]}>
          Fee: ${method.processing_fee.toFixed(2)}
        </Text>
        <View style={styles.paymentFeatures}>
          {method.mobile_optimized && (
            <View style={styles.featureTag}>
              <Text style={styles.featureTagText}>Mobile</Text>
            </View>
          )}
          <View style={styles.featureTag}>
            <Text style={styles.featureTagText}>Security: {method.security_score.toFixed(0)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface TaxBreakdownProps {
  taxCalculation: TaxCalculation;
  subtotal: number;
}

export const TaxBreakdown: React.FC<TaxBreakdownProps> = ({ taxCalculation, subtotal }) => {
  if (taxCalculation.total_tax === 0) {
    return (
      <View style={styles.taxSection}>
        <Text style={styles.taxTitle}>Tax Information</Text>
        <Text style={styles.noTaxText}>No tax applicable for {taxCalculation.country}</Text>
      </View>
    );
  }

  return (
    <View style={styles.taxSection}>
      <Text style={styles.taxTitle}>Tax Breakdown</Text>
      
      {taxCalculation.lines.map((line, index) => (
        <View key={index} style={styles.taxLine}>
          <Text style={styles.taxLineLabel}>
            {line.tax_type} ({(line.rate * 100).toFixed(1)}%)
          </Text>
          <Text style={styles.taxLineAmount}>${line.amount.toFixed(2)}</Text>
        </View>
      ))}
      
      <View style={styles.taxSummary}>
        <View style={styles.taxSummaryRow}>
          <Text style={styles.taxSummaryLabel}>Subtotal:</Text>
          <Text style={styles.taxSummaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.taxSummaryRow}>
          <Text style={styles.taxSummaryLabel}>Total Tax:</Text>
          <Text style={[styles.taxSummaryValue, styles.taxAmount]}>
            ${taxCalculation.total_tax.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.taxSummaryRow, styles.taxTotalRow]}>
          <Text style={styles.taxTotalLabel}>Total with Tax:</Text>
          <Text style={styles.taxTotalValue}>
            ${(subtotal + taxCalculation.total_tax).toFixed(2)}
          </Text>
        </View>
      </View>

      {taxCalculation.ai_insights && (
        <View style={styles.aiInsights}>
          <Ionicons name="bulb-outline" size={16} color="#FF9800" />
          <Text style={styles.aiInsightsText}>{taxCalculation.ai_insights}</Text>
        </View>
      )}
    </View>
  );
};

interface FraudAssessmentCardProps {
  assessment: FraudAssessment;
}

export const FraudAssessmentCard: React.FC<FraudAssessmentCardProps> = ({ assessment }) => {
  const getRiskColor = () => {
    switch (assessment.risk_level) {
      case 'low':
        return '#4CAF50';
      case 'medium':  
        return '#FF9800';
      case 'high':
        return '#F44336';
      case 'very_high':
        return '#D32F2F';
      default:
        return '#666';
    }
  };

  const getRiskIcon = () => {
    switch (assessment.risk_level) {
      case 'low':
        return 'shield-checkmark-outline';
      case 'medium':
        return 'alert-circle-outline';
      case 'high':
        return 'warning-outline';
      case 'very_high':
        return 'close-circle-outline';
      default:
        return 'shield-outline';
    }
  };

  if (assessment.risk_level === 'low') {
    // Don't show fraud assessment for low risk transactions
    return null;
  }

  return (
    <View style={[styles.fraudCard, { borderLeftColor: getRiskColor() }]}>
      <View style={styles.fraudHeader}>
        <Ionicons name={getRiskIcon() as any} size={20} color={getRiskColor()} />
        <Text style={[styles.fraudTitle, { color: getRiskColor() }]}>
          {assessment.risk_level.toUpperCase()} RISK DETECTED
        </Text>
        <Text style={styles.fraudScore}>{assessment.risk_score}/100</Text>
      </View>

      {assessment.risk_factors.length > 0 && (
        <View style={styles.riskFactors}>
          {assessment.risk_factors.slice(0, 3).map((factor, index) => (
            <Text key={index} style={styles.riskFactor}>• {factor}</Text>
          ))}
        </View>
      )}

      <Text style={styles.fraudAction}>
        Action: {assessment.action.replace('_', ' ').toUpperCase()}
      </Text>

      {assessment.ai_insights && (
        <View style={styles.aiInsights}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.aiInsightsText}>{assessment.ai_insights}</Text>
        </View>
      )}
    </View>
  );
};

interface AIInsightsCardProps {
  insights: string;
  title: string;
  icon?: string;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ 
  insights, 
  title, 
  icon = 'bulb-outline' 
}) => {
  if (!insights) return null;

  return (
    <View style={styles.aiCard}>
      <View style={styles.aiCardHeader}>
        <Ionicons name={icon as any} size={20} color="#007AFF" />
        <Text style={styles.aiCardTitle}>{title}</Text>
      </View>
      <Text style={styles.aiCardText}>{insights}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentMethodMeta: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  processingFee: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentFeatures: {
    flexDirection: 'row',
  },
  featureTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  featureTagText: {
    fontSize: 12,
    color: '#666',
  },
  taxSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  taxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noTaxText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  taxLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  taxLineLabel: {
    fontSize: 14,
    color: '#666',
  },
  taxLineAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  taxSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  taxSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  taxSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  taxSummaryValue: {
    fontSize: 14,
    color: '#333',
  },
  taxAmount: {
    fontWeight: '600',
    color: '#FF9800',
  },
  taxTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  taxTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taxTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  fraudCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  fraudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fraudTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  fraudScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  riskFactors: {
    marginBottom: 8,
  },
  riskFactor: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  fraudAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  aiInsights: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  aiInsightsText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  aiCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  aiCardText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});