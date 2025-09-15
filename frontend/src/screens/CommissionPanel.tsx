import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatTile from '../components/StatTile';
import { theme } from '../theme/theme';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface CommissionSummary {
  gross_sales: number;
  commission_earned: number;
  net_payout: number;
  period: string;
  currency: string;
}

interface PayoutHistory {
  id: string;
  amount: number;
  period: string;
  status: 'scheduled' | 'paid' | 'pending';
  created_at: string;
}

export default function CommissionPanel() {
  const [summary, setSummary] = useState<CommissionSummary>({
    gross_sales: 0,
    commission_earned: 0,
    net_payout: 0,
    period: '30 days',
    currency: 'KES'
  });
  const [history, setHistory] = useState<PayoutHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommissionData();
  }, []);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      
      // Try to get analytics for commission calculation
      try {
        const analyticsRes = await axios.get(`${API_BASE_URL}/api/seller/analytics/summary`);
        if (analyticsRes.data.success) {
          const analytics = analyticsRes.data.analytics;
          setSummary({
            gross_sales: analytics.revenue_30d + analytics.commission_30d, // Add back commission to get gross
            commission_earned: analytics.commission_30d,
            net_payout: analytics.revenue_30d, // This is what seller receives
            period: '30 days',
            currency: 'KES'
          });
        }
      } catch (error) {
        console.log('Analytics error:', error);
        // Use mock data
        setSummary({
          gross_sales: 12574.50,
          commission_earned: 125.75,
          net_payout: 12448.75,
          period: '30 days',
          currency: 'KES'
        });
      }

      // Mock commission history
      setHistory([
        {
          id: 'C-2025-08',
          amount: 98.20,
          period: 'August 2025',
          status: 'paid',
          created_at: '2024-08-31T23:59:59Z'
        },
        {
          id: 'C-2025-09',
          amount: 27.55,
          period: 'September 2025 (to date)',
          status: 'scheduled',
          created_at: '2024-09-15T00:00:00Z'
        }
      ]);
      
    } catch (error) {
      console.error('Commission data error:', error);
      Alert.alert('Error', 'Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return theme.colors.success;
      case 'scheduled': return theme.colors.primary;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.textDim;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '✅ PAID';
      case 'scheduled': return '🗓️ SCHEDULED';
      case 'pending': return '⏳ PENDING';
      default: return status.toUpperCase();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView style={{ flex: 1, padding: theme.space.md }}>
        {/* Header */}
        <View style={{ marginBottom: theme.space.lg }}>
          <Text style={{
            color: theme.colors.text,
            fontSize: 24,
            fontWeight: '800'
          }}>
            💰 Commissions (1%)
          </Text>
          <Text style={{
            color: theme.colors.textDim,
            marginTop: 4
          }}>
            AisleMarts charges 1% commission on all sales
          </Text>
        </View>

        {loading ? (
          <View style={{
            padding: theme.space.xl,
            alignItems: 'center'
          }}>
            <Text style={{ color: theme.colors.textDim }}>Loading commission data...</Text>
          </View>
        ) : (
          <>
            {/* Commission Overview */}
            <View style={{ marginBottom: theme.space.lg }}>
              <Text style={{
                color: theme.colors.text,
                fontWeight: '700',
                fontSize: 18,
                marginBottom: theme.space.md
              }}>
                Commission Overview ({summary.period})
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
              >
                <StatTile
                  label="Gross Sales"
                  value={`${summary.currency} ${summary.gross_sales.toLocaleString()}`}
                  sub="Total revenue"
                />
                <StatTile
                  label="Commission (1%)"
                  value={`${summary.currency} ${summary.commission_earned.toFixed(2)}`}
                  sub="AisleMarts fee"
                />
                <StatTile
                  label="Your Payout"
                  value={`${summary.currency} ${summary.net_payout.toLocaleString()}`}
                  sub="What you receive"
                />
              </ScrollView>
            </View>

            {/* Commission Breakdown */}
            <View style={{
              backgroundColor: theme.colors.card,
              borderRadius: theme.radius.md,
              padding: theme.space.md,
              marginBottom: theme.space.lg,
              borderWidth: 2,
              borderColor: theme.colors.primary + '30'
            }}>
              <Text style={{
                color: theme.colors.text,
                fontWeight: '700',
                fontSize: 16,
                marginBottom: theme.space.sm
              }}>
                💡 How Commission Works
              </Text>
              
              <View style={{ gap: theme.space.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.colors.textDim }}>Customer pays:</Text>
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                    {summary.currency} {summary.gross_sales.toLocaleString()}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.colors.textDim }}>AisleMarts fee (1%):</Text>
                  <Text style={{ color: theme.colors.warning, fontWeight: '600' }}>
                    -{summary.currency} {summary.commission_earned.toFixed(2)}
                  </Text>
                </View>
                
                <View style={{
                  height: 1,
                  backgroundColor: theme.colors.textDim + '30',
                  marginVertical: theme.space.sm
                }} />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>You receive:</Text>
                  <Text style={{ 
                    color: theme.colors.success, 
                    fontWeight: '700',
                    fontSize: 16
                  }}>
                    {summary.currency} {summary.net_payout.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payout History */}
            <View>
              <Text style={{
                color: theme.colors.text,
                fontWeight: '700',
                fontSize: 18,
                marginBottom: theme.space.md
              }}>
                Payout History
              </Text>
              
              {history.length === 0 ? (
                <View style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: theme.radius.md,
                  padding: theme.space.lg,
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: '600',
                    marginBottom: 8
                  }}>
                    No Payouts Yet
                  </Text>
                  <Text style={{
                    color: theme.colors.textDim,
                    textAlign: 'center'
                  }}>
                    Your first payout will appear here once you make sales
                  </Text>
                </View>
              ) : (
                history.map(payout => (
                  <View
                    key={payout.id}
                    style={{
                      backgroundColor: theme.colors.card,
                      borderRadius: theme.radius.md,
                      padding: theme.space.md,
                      marginBottom: theme.space.sm,
                      borderLeftWidth: 4,
                      borderLeftColor: getStatusColor(payout.status)
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: theme.space.sm
                    }}>
                      <Text style={{
                        color: theme.colors.text,
                        fontWeight: '700',
                        fontSize: 16
                      }}>
                        {payout.period}
                      </Text>
                      <Text style={{
                        color: getStatusColor(payout.status),
                        fontWeight: '600',
                        fontSize: 12
                      }}>
                        {getStatusText(payout.status)}
                      </Text>
                    </View>
                    
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        color: theme.colors.textDim,
                        fontSize: 14
                      }}>
                        Commission earned
                      </Text>
                      <Text style={{
                        color: theme.colors.text,
                        fontWeight: '700',
                        fontSize: 16
                      }}>
                        {summary.currency} {payout.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}