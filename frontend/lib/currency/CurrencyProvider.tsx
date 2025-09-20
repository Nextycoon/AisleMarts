import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyContextValue, CurrencyPrefs, IsoCurrency } from "./types";
import { getFx } from "./fxClient";
import { REGION_MAP } from "./regionMaps";
import { formatAmount } from "./format";
import { getUserCurrency } from "./locationDetector";

const CurrencyCtx = createContext<CurrencyContextValue | null>(null);

function detectBrowserCurrency(): IsoCurrency {
  // This will be replaced by proper location detection in mobile
  return 'USD';
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<CurrencyPrefs>({
    primary: 'USD',
    secondary: undefined,
    region: undefined,
    autoDetect: true
  });
  const [baseQuote, setBaseQuote] = useState<Record<IsoCurrency, number>>({});
  const [baseCode, setBaseCode] = useState<IsoCurrency>("USD");
  const [lastUpdated, setLastUpdated] = useState<number | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize currency detection
  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        // Try to load saved preferences
        const savedPrefs = await AsyncStorage.getItem('currencyPrefs');
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          console.log('💾 Loaded saved currency preferences:', parsed);
          setPrefs(parsed);
          setBaseCode(parsed.primary);
        } else if (prefs.autoDetect) {
          // Auto-detect user currency
          console.log('🌍 Auto-detecting user currency...');
          const detectedCurrency = await getUserCurrency();
          const newPrefs = {
            ...prefs,
            primary: detectedCurrency,
            region: getRegionForCurrency(detectedCurrency)
          };
          setPrefs(newPrefs);
          setBaseCode(detectedCurrency);
          
          // Save the detected preferences
          await AsyncStorage.setItem('currencyPrefs', JSON.stringify(newPrefs));
          console.log(`💱 Currency-Infinity Engine: Initialized with ${detectedCurrency}`);
        }
      } catch (error) {
        console.error('Currency initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCurrency();
  }, []);

  // Lazy assign region if missing (guess by currency)
  useEffect(() => {
    if (prefs.region || !isInitialized) return;
    const r = Object.entries(REGION_MAP).find(([, list]) => list.includes(prefs.primary));
    if (r) {
      const newPrefs = { ...prefs, region: r[0] as any };
      setPrefs(newPrefs);
      AsyncStorage.setItem('currencyPrefs', JSON.stringify(newPrefs));
    }
  }, [prefs.primary, prefs.region, isInitialized]);

  // Keep FX base same as primary for lowest error accumulation
  useEffect(() => {
    if (isInitialized) {
      setBaseCode(prefs.primary);
    }
  }, [prefs.primary, isInitialized]);

  // Fetch rates
  const refreshRates = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      console.log(`💱 Refreshing exchange rates for ${baseCode}...`);
      const q = await getFx(baseCode);
      setBaseQuote(q.rates || {});
      setLastUpdated(q.ts);
      console.log(`✅ Exchange rates updated: ${Object.keys(q.rates || {}).length} currencies`);
    } catch (e) {
      console.warn("FX refresh failed", e);
    }
  }, [baseCode, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    
    refreshRates();
    const id = setInterval(refreshRates, 3 * 60 * 1000); // 3 minutes
    return () => clearInterval(id);
  }, [refreshRates, isInitialized]);

  const convert = useCallback((amount: number, from: IsoCurrency, to: IsoCurrency) => {
    if (from === to) return amount;
    if (!baseQuote || Object.keys(baseQuote).length === 0) return null;
    
    // Convert via baseCode
    const toBase = from === baseCode ? amount : (amount / (baseQuote[from] || 0));
    if (!isFinite(toBase)) return null;
    const res = toBase * (baseQuote[to] || 0);
    return isFinite(res) ? res : null;
  }, [baseQuote, baseCode]);

  const setPrimary = useCallback(async (c: IsoCurrency) => {
    const newPrefs = { ...prefs, primary: c };
    setPrefs(newPrefs);
    await AsyncStorage.setItem('currencyPrefs', JSON.stringify(newPrefs));
    console.log(`💱 Primary currency changed to: ${c}`);
  }, [prefs]);

  const setSecondary = useCallback(async (c?: IsoCurrency) => {
    const newPrefs = { ...prefs, secondary: c };
    setPrefs(newPrefs);
    await AsyncStorage.setItem('currencyPrefs', JSON.stringify(newPrefs));
    console.log(`💱 Secondary currency changed to: ${c || 'none'}`);
  }, [prefs]);

  const setAutoDetect = useCallback(async (v: boolean) => {
    const newPrefs = { ...prefs, autoDetect: v };
    setPrefs(newPrefs);
    await AsyncStorage.setItem('currencyPrefs', JSON.stringify(newPrefs));
    console.log(`🌍 Auto-detect ${v ? 'enabled' : 'disabled'}`);
  }, [prefs]);

  const available = useCallback(async () => {
    // Region-aware lazy list
    const r = prefs.region || "americas";
    return REGION_MAP[r] || REGION_MAP.americas;
  }, [prefs.region]);

  const format = useCallback((amount: number, code: IsoCurrency, locale?: string) => {
    return formatAmount(amount, code, locale);
  }, []);

  const value = useMemo<CurrencyContextValue>(() => ({
    prefs, setPrimary, setSecondary, setAutoDetect, convert, format, available, lastUpdated
  }), [prefs, setPrimary, setSecondary, setAutoDetect, convert, format, available, lastUpdated]);

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyCtx);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

// Helper function to get region for currency
function getRegionForCurrency(currency: string): string {
  for (const [region, currencies] of Object.entries(REGION_MAP)) {
    if (currencies.includes(currency)) {
      return region;
    }
  }
  return 'americas'; // fallback
}