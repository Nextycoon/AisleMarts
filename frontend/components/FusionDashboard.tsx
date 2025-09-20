import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

// Import AI services
import { UniversalCommerceAI } from '../lib/ai/UniversalCommerceAI';
import { useCurrency } from '../lib/currency/CurrencyProvider';

const { width, height } = Dimensions.get('window');

export default function FusionDashboard() {
  const router = useRouter();
  const { currentCurrency, formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAIStatus] = useState('initializing');

  useEffect(() => {
    initializeAI();
  }, []);

  const initializeAI = async () => {
    try {
      setIsLoading(true);
      const ai = UniversalCommerceAI.getInstance();
      await ai.initialize();
      setAIStatus('operational');
    } catch (error) {
      console.error('AI initialization failed:', error);
      setAIStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />
      
      {/* Header Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🌊 BlueWave • Family-Safe AI Commerce</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>BlueWave Control Center</Text>
          <Text style={styles.subtitle}>Family-Safe AI-Powered Commerce Platform</Text>
        </View>

        {/* Status Grid */}
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <Text style={styles.statusEmoji}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.statusTitle}>Family Safety</Text>
            <Text style={styles.statusValue}>Active</Text>
          </View>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusEmoji}>⭐</Text>
            <Text style={styles.statusTitle}>Business Console</Text>
            <Text style={styles.statusValue}>Ready</Text>
          </View>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusEmoji}>🤖</Text>
            <Text style={styles.statusTitle}>AI Systems</Text>
            <Text style={styles.statusValue}>{aiStatus}</Text>
          </View>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusEmoji}>💱</Text>
            <Text style={styles.statusTitle}>Currency Engine</Text>
            <Text style={styles.statusValue}>{currentCurrency}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleNavigation('/family/dashboard')}
          >
            <Text style={styles.actionIcon}>👨‍👩‍👧‍👦</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Family Dashboard</Text>
              <Text style={styles.actionDescription}>Manage family safety and wellbeing</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleNavigation('/business/dashboard')}
          >
            <Text style={styles.actionIcon}>⭐</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Business Console</Text>
              <Text style={styles.actionDescription}>Analytics, content, and growth tools</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleNavigation('/universal-ai-hub')}
          >
            <Text style={styles.actionIcon}>🤖</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>AI Hub</Text>
              <Text style={styles.actionDescription}>Universal Commerce AI systems</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleNavigation('/currency-fusion-dashboard-v2')}
          >
            <Text style={styles.actionIcon}>💱</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Currency Engine</Text>
              <Text style={styles.actionDescription}>185 currencies, real-time rates</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          
          <View style={styles.systemStatus}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Family Safety System</Text>
              <View style={styles.statusIndicator}>
                <Text style={styles.statusDot}>🟢</Text>
                <Text style={styles.statusText}>Operational</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Business Console</Text>
              <View style={styles.statusIndicator}>
                <Text style={styles.statusDot}>🟢</Text>
                <Text style={styles.statusText}>Operational</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>AI Commerce Hub</Text>
              <View style={styles.statusIndicator}>
                <Text style={styles.statusDot}>🟢</Text>
                <Text style={styles.statusText}>32/32 Connected</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Currency Engine</Text>
              <View style={styles.statusIndicator}>
                <Text style={styles.statusDot}>🟢</Text>
                <Text style={styles.statusText}>185 Currencies</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🌊 Powered by BlueWave Technology
          </Text>
          <Text style={styles.footerSubtext}>
            Family-Safe AI Commerce Platform
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  badge: {
    backgroundColor: '#0066CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3FF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E95A3',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statusCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E95A3',
    lineHeight: 20,
  },
  actionArrow: {
    fontSize: 24,
    color: '#0066CC',
    fontWeight: '300',
  },
  systemStatus: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6F3FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    fontSize: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#8E95A3',
  },
});