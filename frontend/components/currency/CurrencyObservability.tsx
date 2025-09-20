import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useCurrency } from "../../lib/currency/CurrencyProvider";

interface ObservabilityMetrics {
  fx_rates_fetch_ok: number;
  fx_rates_fetch_fail: number;
  fx_age_seconds: number;
  currency_auto_detect_hits: number;
  manual_override_hits: number;
  rounding_adjustment_cents_total: number;
}

export default function CurrencyObservability() {
  const { prefs, lastUpdated } = useCurrency();
  const [metrics, setMetrics] = useState<ObservabilityMetrics>({
    fx_rates_fetch_ok: 0,
    fx_rates_fetch_fail: 0,
    fx_age_seconds: 0,
    currency_auto_detect_hits: 0,
    manual_override_hits: 0,
    rounding_adjustment_cents_total: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0.7));

  // Simulate metrics collection (in production, these would come from analytics)
  useEffect(() => {
    const updateMetrics = () => {
      const ageSeconds = lastUpdated ? Math.floor((Date.now() - lastUpdated) / 1000) : 0;
      
      setMetrics(prev => ({
        ...prev,
        fx_age_seconds: ageSeconds,
        fx_rates_fetch_ok: prev.fx_rates_fetch_ok + (Math.random() > 0.9 ? 1 : 0),
        fx_rates_fetch_fail: prev.fx_rates_fetch_fail + (Math.random() > 0.95 ? 1 : 0),
        currency_auto_detect_hits: prefs.autoDetect ? prev.currency_auto_detect_hits + 1 : prev.currency_auto_detect_hits,
        manual_override_hits: !prefs.autoDetect ? prev.manual_override_hits + 1 : prev.manual_override_hits,
        rounding_adjustment_cents_total: prev.rounding_adjustment_cents_total + (Math.random() * 0.1),
      }));
    };

    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [lastUpdated, prefs.autoDetect]);

  // Pulse animation for alerts
  useEffect(() => {
    if (metrics.fx_age_seconds > 300) { // 5 minutes
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      fadeAnim.setValue(0.7);
    }
  }, [metrics.fx_age_seconds]);

  const getHealthStatus = () => {
    if (metrics.fx_age_seconds > 600) return { status: 'Critical', color: '#ff4444' };
    if (metrics.fx_age_seconds > 300) return { status: 'Warning', color: '#ffaa00' };
    return { status: 'Healthy', color: '#00ff88' };
  };

  const health = getHealthStatus();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: health.color }]} />
          <Text style={styles.statusText}>FX Engine: {health.status}</Text>
          <Text style={styles.ageText}>
            {metrics.fx_age_seconds < 60 
              ? `${metrics.fx_age_seconds}s ago` 
              : `${Math.floor(metrics.fx_age_seconds / 60)}m ago`}
          </Text>
        </View>
        <Text style={styles.expandIcon}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.fx_rates_fetch_ok}</Text>
              <Text style={styles.metricLabel}>Successful Fetches</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#ff6b6b' }]}>
                {metrics.fx_rates_fetch_fail}
              </Text>
              <Text style={styles.metricLabel}>Failed Fetches</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.currency_auto_detect_hits}</Text>
              <Text style={styles.metricLabel}>Auto-Detect Hits</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.manual_override_hits}</Text>
              <Text style={styles.metricLabel}>Manual Overrides</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>
              Primary: {prefs.primary} • Secondary: {prefs.secondary || 'None'}
            </Text>
            <Text style={styles.detailsText}>
              Region: {prefs.region?.toUpperCase() || 'Auto'} • 
              Rounding Adj: ${metrics.rounding_adjustment_cents_total.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  ageText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  expandIcon: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '700',
  },
  metricsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricsGrid: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailsText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 2,
  },
});