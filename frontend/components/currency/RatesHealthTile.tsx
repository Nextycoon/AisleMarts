import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useCurrency } from "../../lib/currency/CurrencyProvider";
import { router } from 'expo-router';

interface HealthMetrics {
  fx_fetch_ok: number;
  fx_fetch_fail: number;
  last_error?: string;
  consecutive_failures: number;
}

export default function RatesHealthTile() {
  const { prefs, lastUpdated } = useCurrency();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    fx_fetch_ok: 0,
    fx_fetch_fail: 0,
    consecutive_failures: 0,
  });
  const [pulseAnim] = useState(new Animated.Value(1));

  // Simulate metrics (in production, this would come from observability service)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        fx_fetch_ok: prev.fx_fetch_ok + (Math.random() > 0.95 ? 1 : 0),
        fx_fetch_fail: prev.fx_fetch_fail + (Math.random() > 0.98 ? 1 : 0),
        consecutive_failures: Math.random() > 0.98 ? prev.consecutive_failures + 1 : 0,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Health status calculation
  const healthStatus = useMemo(() => {
    const age = lastUpdated ? Math.floor((Date.now() - lastUpdated) / 1000) : 999;
    const errorRate = metrics.fx_fetch_fail / Math.max(1, metrics.fx_fetch_ok + metrics.fx_fetch_fail);
    const hasConsecutiveFailures = metrics.consecutive_failures > 2;
    
    // Critical: Very old data, high error rate, or consecutive failures
    if (age > 600 || errorRate > 0.5 || hasConsecutiveFailures) {
      return {
        status: 'Critical',
        color: '#ff4444',
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        icon: '🔴',
        description: 'FX service degraded'
      };
    }
    
    // Warning: Moderately old data or some errors
    if (age > 300 || errorRate > 0.2 || metrics.fx_fetch_fail > 0) {
      return {
        status: 'Warning',
        color: '#ffaa00',
        backgroundColor: 'rgba(255, 170, 0, 0.1)',
        icon: '🟡',
        description: 'FX service issues'
      };
    }
    
    // Healthy: Fresh data, no errors
    return {
      status: 'Healthy',
      color: '#00ff88',
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      icon: '🟢',
      description: 'FX service operational'
    };
  }, [lastUpdated, metrics]);

  // Pulse animation for critical status
  useEffect(() => {
    if (healthStatus.status === 'Critical') {
      const pulse = Animated.loop(
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
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [healthStatus.status]);

  const formatAge = () => {
    if (!lastUpdated) return 'Never';
    const age = Math.floor((Date.now() - lastUpdated) / 1000);
    if (age < 60) return `${age}s`;
    const minutes = Math.floor(age / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <TouchableOpacity
      onPress={() => router.push('/currency-fusion-dashboard-v2')}
      style={[styles.container, { backgroundColor: healthStatus.backgroundColor }]}
    >
      <Animated.View 
        style={[
          styles.content,
          { 
            borderColor: healthStatus.color,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        {/* Status Icon & Primary Info */}
        <View style={styles.header}>
          <Text style={styles.icon}>{healthStatus.icon}</Text>
          <View style={styles.headerText}>
            <Text style={[styles.statusText, { color: healthStatus.color }]}>
              {healthStatus.status}
            </Text>
            <Text style={styles.descriptionText}>
              {healthStatus.description}
            </Text>
          </View>
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{prefs.primary}</Text>
            <Text style={styles.metricLabel}>Base</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{formatAge()}</Text>
            <Text style={styles.metricLabel}>Age</Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, { color: healthStatus.color }]}>
              {metrics.fx_fetch_ok}
            </Text>
            <Text style={styles.metricLabel}>OK</Text>
          </View>
          {metrics.fx_fetch_fail > 0 && (
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: '#ff4444' }]}>
                {metrics.fx_fetch_fail}
              </Text>
              <Text style={styles.metricLabel}>Fail</Text>
            </View>
          )}
        </View>

        {/* Tap to expand hint */}
        <Text style={styles.expandHint}>Tap for full dashboard</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginVertical: 2,
  },
  content: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metric: {
    alignItems: 'center',
    minWidth: 32,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },
  expandHint: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});