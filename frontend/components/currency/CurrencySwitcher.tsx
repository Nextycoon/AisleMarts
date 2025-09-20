import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useCurrency } from "../../lib/currency/CurrencyProvider";
import { CURRENCY_DATA } from "../../lib/currency/regionMaps";

export default function CurrencySwitcher() {
  const { prefs, setPrimary, setSecondary, available } = useCurrency();
  const [list, setList] = useState<string[]>([]);
  const [showPrimaryList, setShowPrimaryList] = useState(false);
  const [showSecondaryList, setShowSecondaryList] = useState(false);

  useEffect(() => {
    available().then(setList).catch(() => setList([]));
  }, [available]);

  const renderCurrencyOption = (code: string, onSelect: (code: string) => void) => {
    const currency = CURRENCY_DATA[code];
    return (
      <TouchableOpacity
        key={code}
        style={styles.currencyOption}
        onPress={() => {
          onSelect(code);
          setShowPrimaryList(false);
          setShowSecondaryList(false);
        }}
      >
        <Text style={styles.currencySymbol}>{currency?.symbol || code}</Text>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyCode}>{code}</Text>
          <Text style={styles.currencyName}>{currency?.name || code}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.label}>Primary Currency</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowPrimaryList(!showPrimaryList)}
          >
            <Text style={styles.selectorSymbol}>
              {CURRENCY_DATA[prefs.primary]?.symbol || prefs.primary}
            </Text>
            <Text style={styles.selectorText}>{prefs.primary}</Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
          
          {showPrimaryList && (
            <ScrollView style={styles.dropdown} nestedScrollEnabled>
              {list.map(code => renderCurrencyOption(code, setPrimary))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Secondary Currency</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowSecondaryList(!showSecondaryList)}
          >
            <Text style={styles.selectorSymbol}>
              {prefs.secondary ? CURRENCY_DATA[prefs.secondary]?.symbol || prefs.secondary : '—'}
            </Text>
            <Text style={styles.selectorText}>
              {prefs.secondary || 'None'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
          
          {showSecondaryList && (
            <ScrollView style={styles.dropdown} nestedScrollEnabled>
              <TouchableOpacity
                style={styles.currencyOption}
                onPress={() => {
                  setSecondary(undefined);
                  setShowSecondaryList(false);
                }}
              >
                <Text style={styles.currencySymbol}>—</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>None</Text>
                  <Text style={styles.currencyName}>No secondary currency</Text>
                </View>
              </TouchableOpacity>
              {list.map(code => renderCurrencyOption(code, setSecondary))}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  section: {
    flex: 1,
    position: 'relative',
  },
  label: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectorSymbol: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '700',
    marginRight: 8,
    minWidth: 24,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'rgba(15, 15, 35, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    marginTop: 4,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    minHeight: 48,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '700',
    marginRight: 12,
    minWidth: 24,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});