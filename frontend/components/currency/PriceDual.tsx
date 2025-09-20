import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useCurrency } from "../../lib/currency/CurrencyProvider";

interface PriceDualProps {
  amount: number;
  code: string;
  style?: any;
}

export default function PriceDual({ amount, code, style }: PriceDualProps) {
  const { prefs, convert, format } = useCurrency();
  
  const primaryVal = convert(amount, code, prefs.primary);
  const secondaryVal = prefs.secondary ? convert(amount, code, prefs.secondary) : null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.primaryPrice}>
        {primaryVal != null ? format(primaryVal, prefs.primary) : "—"}
      </Text>
      {prefs.secondary && secondaryVal != null && (
        <Text style={styles.secondaryPrice}>
          {format(secondaryVal, prefs.secondary)} • {prefs.secondary}
        </Text>
      )}
      <Text style={styles.basePrice}>
        Base: {code} {amount.toFixed(2)}
      </Text>
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
  secondaryPrice: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  basePrice: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});