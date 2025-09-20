import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useCurrency } from "@/lib/currency/CurrencyProvider";
import { CURRENCY_DATA } from "@/lib/currency/regionMaps";

export default function LiveCurrencyDisplay() {
  const { prefs, lastUpdated } = useCurrency();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Pulse animation for live indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Update time ago display
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdated) {
        setTimeAgo('Never');
        return;
      }
      
      const now = Date.now();
      const diff = now - lastUpdated;
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) {
        setTimeAgo('Just now');
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const primaryCurrency = CURRENCY_DATA[prefs.primary];
  const secondaryCurrency = prefs.secondary ? CURRENCY_DATA[prefs.secondary] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.liveDot}>●</Text>
        </Animated.View>
        <Text style={styles.liveText}>LIVE CURRENCY</Text>
        <Text style={styles.lastUpdated}>{timeAgo}</Text>
      </View>
      
      <View style={styles.currencyRow}>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencySymbol}>{primaryCurrency?.symbol || prefs.primary}</Text>
          <View>
            <Text style={styles.currencyCode}>{prefs.primary}</Text>
            <Text style={styles.currencyName}>{primaryCurrency?.name || 'Unknown'}</Text>
          </View>
        </View>
        <Text style={styles.primaryBadge}>PRIMARY</Text>
      </View>

      {secondaryCurrency && (
        <View style={styles.currencyRow}>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencySymbol}>{secondaryCurrency.symbol}</Text>
            <View>
              <Text style={styles.currencyCode}>{prefs.secondary}</Text>
              <Text style={styles.currencyName}>{secondaryCurrency.name}</Text>
            </View>
          </View>
          <Text style={styles.secondaryBadge}>SECONDARY</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌍 Auto-detected • {prefs.region?.toUpperCase() || 'GLOBAL'} region
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveIndicator: {
    marginRight: 8,
  },
  liveDot: {
    fontSize: 12,
    color: '#00FF88',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00FF88',
    letterSpacing: 0.5,
    flex: 1,
  },
  lastUpdated: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '700',
    marginRight: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  currencyCode: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  primaryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  secondaryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});