import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import TabNavigator from '../navigation/TabNavigator';
import { RewardsAPI, Balances } from '../../lib/RewardsAPI';

export default function WithdrawScreen() {
  const router = useRouter();
  
  // State
  const [balances, setBalances] = useState<Balances | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'bank'>('wallet');
  const [kycCompleted, setKycCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [kycToken] = useState('kyc_mock_token_12345'); // Mock KYC token

  useEffect(() => {
    loadWithdrawData();
  }, []);

  const loadWithdrawData = async () => {
    try {
      const data = await RewardsAPI.getBalances();
      setBalances(data);
      // Mock KYC status - in production, check real KYC status
      setKycCompleted(true);
    } catch (error) {
      console.error('Withdraw data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateWithdrawal = (): string | null => {
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || isNaN(amount)) {
      return 'Please enter a valid amount';
    }
    
    if (amount < 100) {
      return 'Minimum withdrawal amount is 100 AisleCoins';
    }
    
    if (!balances || amount > balances.aisleCoins) {
      return 'Insufficient AisleCoins balance';
    }
    
    if (!kycCompleted) {
      return 'KYC verification required';
    }
    
    return null;
  };

  const handleWithdraw = async () => {
    const validationError = validateWithdrawal();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      setWithdrawing(true);
      
      const result = await RewardsAPI.withdrawAisleCoins({
        amount: parseFloat(withdrawAmount),
        method: selectedMethod,
        kyc_token: kycToken
      });

      Alert.alert(
        'Withdrawal Initiated',
        `Your withdrawal of ${withdrawAmount} AisleCoins has been initiated. Estimated completion: ${new Date(result.estimatedCompletion).toLocaleDateString()}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error: any) {
      Alert.alert('Withdrawal Error', error.message || 'Failed to process withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const calculateFee = (): number => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount)) return 0;
    
    // 2.5% withdrawal fee
    return amount * 0.025;
  };

  const calculateReceiveAmount = (): number => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount)) return 0;
    
    return amount - calculateFee();
  };

  const renderMethodCard = (method: 'wallet' | 'bank', title: string, subtitle: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.methodCard,
        selectedMethod === method && styles.selectedMethodCard
      ]}
      onPress={() => setSelectedMethod(method)}
    >
      <View style={styles.methodIcon}>
        <Text style={styles.methodIconText}>{icon}</Text>
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodSubtitle}>{subtitle}</Text>
      </View>
      <View style={[
        styles.methodSelector,
        selectedMethod === method && styles.selectedMethodSelector
      ]}>
        {selectedMethod === method && <View style={styles.selectorInner} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading withdrawal options...</Text>
        </View>
        <TabNavigator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Withdraw AisleCoins</Text>
          <Text style={styles.headerSubtitle}>Convert to real money</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {/* Balance Card */}
          <View style={styles.section}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceIcon}>💠</Text>
                <View>
                  <Text style={styles.balanceTitle}>Available Balance</Text>
                  <Text style={styles.balanceAmount}>
                    {balances?.aisleCoins.toLocaleString()} AisleCoins
                  </Text>
                </View>
              </View>
              <Text style={styles.balanceNote}>
                Minimum withdrawal: 100 AisleCoins
              </Text>
            </View>
          </View>

          {/* Withdrawal Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Enter amount..."
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.amountCurrency}>AisleCoins</Text>
            </View>
            
            <View style={styles.quickAmounts}>
              {[100, 500, 1000, 2500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountChip}
                  onPress={() => setWithdrawAmount(amount.toString())}
                  disabled={!balances || amount > balances.aisleCoins}
                >
                  <Text style={[
                    styles.quickAmountText,
                    (!balances || amount > balances.aisleCoins) && styles.disabledAmountText
                  ]}>
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Withdrawal Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Withdrawal Method</Text>
            <View style={styles.methodsContainer}>
              {renderMethodCard(
                'wallet',
                'Digital Wallet',
                '1-2 business days • Lower fees',
                '📱'
              )}
              {renderMethodCard(
                'bank',
                'Bank Transfer',
                '3-5 business days • Higher fees',
                '🏦'
              )}
            </View>
          </View>

          {/* Fee Breakdown */}
          {withdrawAmount && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fee Breakdown</Text>
              <View style={styles.feeCard}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Withdrawal Amount</Text>
                  <Text style={styles.feeValue}>{withdrawAmount} AisleCoins</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Processing Fee (2.5%)</Text>
                  <Text style={styles.feeValue}>-{calculateFee().toFixed(2)} AisleCoins</Text>
                </View>
                <View style={styles.feeDivider} />
                <View style={styles.feeRow}>
                  <Text style={styles.feeTotalLabel}>You will receive</Text>
                  <Text style={styles.feeTotalValue}>${calculateReceiveAmount().toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* KYC Status */}
          <View style={styles.section}>
            <View style={[styles.kycCard, kycCompleted ? styles.kycVerified : styles.kycPending]}>
              <Text style={styles.kycIcon}>{kycCompleted ? '✅' : '⏳'}</Text>
              <View style={styles.kycInfo}>
                <Text style={styles.kycTitle}>
                  {kycCompleted ? 'Identity Verified' : 'Identity Verification Required'}
                </Text>
                <Text style={styles.kycSubtitle}>
                  {kycCompleted 
                    ? 'You can withdraw up to $10,000 per month'
                    : 'Complete KYC verification to enable withdrawals'
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Withdrawal Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.withdrawButton,
                (!kycCompleted || !withdrawAmount || withdrawing) && styles.withdrawButtonDisabled
              ]}
              onPress={handleWithdraw}
              disabled={!kycCompleted || !withdrawAmount || withdrawing}
            >
              {withdrawing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.withdrawButtonText}>
                  {kycCompleted ? 'Withdraw AisleCoins' : 'Complete KYC First'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Important Notes */}
          <View style={styles.section}>
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Important Notes</Text>
              <Text style={styles.noteItem}>• Minimum withdrawal: 100 AisleCoins</Text>
              <Text style={styles.noteItem}>• Processing fee: 2.5% of withdrawal amount</Text>
              <Text style={styles.noteItem}>• Digital wallet: 1-2 business days</Text>
              <Text style={styles.noteItem}>• Bank transfer: 3-5 business days</Text>
              <Text style={styles.noteItem}>• Monthly limit: $10,000 for verified accounts</Text>
              <Text style={styles.noteItem}>• Withdrawals are processed Monday-Friday</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <TabNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    minWidth: 60,
  },
  backButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    minWidth: 60,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 204, 0.3)',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  balanceTitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#0066CC',
    fontSize: 24,
    fontWeight: '700',
  },
  balanceNote: {
    color: '#666666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 16,
  },
  amountCurrency: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAmountChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickAmountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledAmountText: {
    color: '#666666',
  },
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedMethodCard: {
    borderColor: '#0066CC',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodIconText: {
    fontSize: 18,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtitle: {
    color: '#666666',
    fontSize: 12,
  },
  methodSelector: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMethodSelector: {
    borderColor: '#0066CC',
  },
  selectorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
  },
  feeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feeLabel: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  feeValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  feeDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  feeTotalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  feeTotalValue: {
    color: '#34C759',
    fontSize: 18,
    fontWeight: '700',
  },
  kycCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  kycVerified: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  kycPending: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  kycIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  kycInfo: {
    flex: 1,
  },
  kycTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  kycSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  withdrawButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonDisabled: {
    backgroundColor: '#333333',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  notesTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  noteItem: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
});