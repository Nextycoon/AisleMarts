import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useCurrency } from "../../lib/currency/CurrencyProvider";

interface CryptoRate {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h: number;
}

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB'] as const;

export default function CryptoTertiaryDisplay() {
  const { convert, prefs } = useCurrency();
  const [cryptoRates, setCryptoRates] = useState<Record<string, CryptoRate>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Simulate crypto price updates (in production, connect to real crypto API)
  useEffect(() => {
    const updateCryptoRates = () => {
      const mockRates: Record<string, CryptoRate> = {
        BTC: {
          symbol: 'BTC',
          name: 'Bitcoin',
          price_usd: 62500 + (Math.random() - 0.5) * 2000,
          change_24h: -2.5 + (Math.random() - 0.5) * 10,
        },
        ETH: {
          symbol: 'ETH',
          name: 'Ethereum',
          price_usd: 2340 + (Math.random() - 0.5) * 200,
          change_24h: 1.2 + (Math.random() - 0.5) * 8,
        },
        USDT: {
          symbol: 'USDT',
          name: 'Tether',
          price_usd: 1.0 + (Math.random() - 0.5) * 0.01,
          change_24h: 0.01 + (Math.random() - 0.5) * 0.1,
        },
        USDC: {
          symbol: 'USDC',
          name: 'USD Coin',
          price_usd: 1.0 + (Math.random() - 0.5) * 0.005,
          change_24h: 0.0 + (Math.random() - 0.5) * 0.05,
        },
        BNB: {
          symbol: 'BNB',
          name: 'Binance Coin',
          price_usd: 590 + (Math.random() - 0.5) * 50,
          change_24h: 3.8 + (Math.random() - 0.5) * 6,
        },
      };
      setCryptoRates(mockRates);
    };

    updateCryptoRates();
    const interval = setInterval(updateCryptoRates, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Pulse animation for crypto updates
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const convertCryptoPrice = (usdPrice: number) => {
    const converted = convert(usdPrice, 'USD', prefs.primary);
    return converted || usdPrice;
  };

  const formatCryptoPrice = (price: number) => {
    if (price > 1000) {
      return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
    } else if (price > 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(4);
    }
  };

  const getCryptoSymbol = (symbol: string) => {
    const symbols: Record<string, string> = {
      BTC: '₿',
      ETH: 'Ξ',
      USDT: '₮',
      USDC: '$',
      BNB: 'BNB',
    };
    return symbols[symbol] || symbol;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Animated.View style={[styles.cryptoIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.cryptoDot}>●</Text>
        </Animated.View>
        <Text style={styles.headerText}>CRYPTO TERTIARY</Text>
        <Text style={styles.displayOnlyBadge}>DISPLAY ONLY</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.cryptoList}>
          {CRYPTO_SYMBOLS.map((symbol) => {
            const crypto = cryptoRates[symbol];
            if (!crypto) return null;

            const convertedPrice = convertCryptoPrice(crypto.price_usd);
            const isPositive = crypto.change_24h >= 0;

            return (
              <View key={symbol} style={styles.cryptoRow}>
                <View style={styles.cryptoInfo}>
                  <Text style={styles.cryptoSymbol}>
                    {getCryptoSymbol(symbol)}
                  </Text>
                  <View style={styles.cryptoDetails}>
                    <Text style={styles.cryptoName}>{crypto.name}</Text>
                    <Text style={styles.cryptoCode}>{symbol}</Text>
                  </View>
                </View>

                <View style={styles.cryptoPricing}>
                  <Text style={styles.cryptoPrice}>
                    {prefs.primary} {formatCryptoPrice(convertedPrice)}
                  </Text>
                  <Text style={[
                    styles.cryptoChange,
                    { color: isPositive ? '#00ff88' : '#ff6b6b' }
                  ]}>
                    {isPositive ? '+' : ''}{crypto.change_24h.toFixed(2)}%
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ Crypto prices are highly volatile • Display only • Not for trading
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cryptoIndicator: {
    marginRight: 8,
  },
  cryptoDot: {
    fontSize: 12,
    color: '#a855f7',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a855f7',
    letterSpacing: 0.5,
    flex: 1,
  },
  displayOnlyBadge: {
    fontSize: 8,
    fontWeight: '600',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '700',
  },
  cryptoList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.2)',
  },
  cryptoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 18,
    color: '#a855f7',
    fontWeight: '700',
    marginRight: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  cryptoDetails: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cryptoCode: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  cryptoPricing: {
    alignItems: 'flex-end',
  },
  cryptoPrice: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cryptoChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  disclaimer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.2)',
  },
  disclaimerText: {
    fontSize: 10,
    color: 'rgba(245, 158, 11, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});