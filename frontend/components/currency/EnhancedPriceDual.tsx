import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCurrency } from "../../lib/currency/CurrencyProvider";
import { EXTENDED_CURRENCY_DATA } from "../../lib/currency/extendedRegionMaps";

interface EnhancedPriceDualProps {
  amount: number;
  code: string;
  style?: any;
  showBase?: boolean;
  showFXAge?: boolean;
  originalPrice?: number; // For discount display
  fxMarginBps?: number; // For retail FX margin
}

export default function EnhancedPriceDual({ 
  amount, 
  code, 
  style, 
  showBase = false,
  showFXAge = false,
  originalPrice,
  fxMarginBps = 0
}: EnhancedPriceDualProps) {
  const { prefs, convert, format, lastUpdated } = useCurrency();
  
  // Apply FX margin if specified (retail buffer)
  const marginMultiplier = 1 + (fxMarginBps / 10000);
  
  const primaryVal = convert(amount, code, prefs.primary);
  const secondaryVal = prefs.secondary ? convert(amount, code, prefs.secondary) : null;
  
  // Apply margin to converted amounts
  const adjustedPrimary = primaryVal ? primaryVal * marginMultiplier : null;
  const adjustedSecondary = secondaryVal ? secondaryVal * marginMultiplier : null;
  
  // Format with banker's rounding for certain currencies
  const formatWithRounding = (val: number, currency: string): string => {
    const currencyData = EXTENDED_CURRENCY_DATA[currency];
    if (currencyData?.rounding === 'bankers') {
      // Banker's rounding (round to nearest even)
      const factor = Math.pow(10, currencyData.decimals);
      const rounded = Math.round(val * factor) / factor;
      return format(rounded, currency);
    }
    return format(val, currency);
  };
  
  // Calculate FX age for display
  const getFXAge = (): string => {
    if (!lastUpdated) return '';
    const ageMinutes = Math.floor((Date.now() - lastUpdated) / 60000);
    if (ageMinutes < 1) return 'just now';
    if (ageMinutes < 60) return `${ageMinutes}m ago`;
    const ageHours = Math.floor(ageMinutes / 60);
    return `${ageHours}h ago`;
  };
  
  // Check if currency is display-only or pegged
  const primaryCurrencyData = EXTENDED_CURRENCY_DATA[prefs.primary];
  const isDisplayOnly = primaryCurrencyData?.displayOnly;
  const isPegged = primaryCurrencyData?.pegged;

  return (
    <View style={[styles.container, style]}>
      {/* Primary Price */}
      <Text style={styles.primaryPrice}>
        {adjustedPrimary != null ? formatWithRounding(adjustedPrimary, prefs.primary) : "—"}
        {isDisplayOnly && <Text style={styles.displayOnlyBadge}> DISPLAY</Text>}
        {isPegged && <Text style={styles.peggedBadge}> ≈{isPegged}</Text>}
      </Text>
      
      {/* Original Price (Discount) */}
      {originalPrice && originalPrice > amount && (
        <Text style={styles.originalPrice}>
          {adjustedPrimary != null ? formatWithRounding(convert(originalPrice, code, prefs.primary) * marginMultiplier, prefs.primary) : "—"}
        </Text>
      )}
      
      {/* Secondary Price */}
      {prefs.secondary && adjustedSecondary != null && (
        <Text style={styles.secondaryPrice}>
          {formatWithRounding(adjustedSecondary, prefs.secondary)} • {prefs.secondary}
          {EXTENDED_CURRENCY_DATA[prefs.secondary]?.pegged && 
            <Text style={styles.peggedIndicator}> ≈{EXTENDED_CURRENCY_DATA[prefs.secondary]?.pegged}</Text>}
        </Text>
      )}
      
      {/* Base Price (Optional) */}
      {showBase && (
        <Text style={styles.basePrice}>
          Base: {code} {amount.toFixed(EXTENDED_CURRENCY_DATA[code]?.decimals || 2)}
        </Text>
      )}
      
      {/* FX Age & Margin Info (Optional) */}
      {showFXAge && (
        <Text style={styles.fxInfo}>
          FX: {getFXAge()}{fxMarginBps > 0 ? ` +${(fxMarginBps/100).toFixed(1)}%` : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  primaryPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  secondaryPrice: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  basePrice: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 1,
  },
  fxInfo: {
    fontSize: 9,
    color: 'rgba(212, 175, 55, 0.7)',
    fontStyle: 'italic',
  },
  displayOnlyBadge: {
    fontSize: 8,
    color: '#f59e0b',
    fontWeight: '600',
  },
  peggedBadge: {
    fontSize: 8,
    color: '#10b981',
    fontWeight: '600',
  },
  peggedIndicator: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '500',
  },
});