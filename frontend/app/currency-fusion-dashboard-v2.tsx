import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Localization from "expo-localization";
import * as Location from "expo-location";
import Constants from 'expo-constants';

/**
 * Currency-Infinity v2.0 Demo Screen (React Native)
 * - Auto location → currency mapping
 * - Live rates fetch with 3-min refresh
 * - Dual-currency display (primary + secondary)
 * - Crypto tertiary (display-only) with volatility note
 * - Banker's rounding to minor units
 * - Retail FX margin label (0.90%)
 * - Observability counters (client)
 */

const GOLD = "#D4AF37";
const INK = "#0f0f23";
const INK2 = "#1a1a2e";
const INK3 = "#16213e";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const BADGE = "rgba(212,175,55,0.14)";
const CARD = "rgba(255,255,255,0.06)";
const OK = "#32d583";
const WARN = "#f4cf5c";
const ERROR = "#ff6b6b";

const { width } = Dimensions.get('window');

type RatesResponse = {
  base: string;
  ts: number;
  rates: Record<string, number>;
  provider?: string;
  count?: number;
};

type SupportedResponse = {
  currencies: string[];
  count: number;
  regions: Record<string, string[]>;
};

const RETAIL_MARGIN_BPS = 90; // 0.90%

// Country to currency mapping
const COUNTRY_TO_CC: Record<string, string> = {
  US: "USD", GB: "GBP", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", JO: "JOD", TR: "TRY",
  JP: "JPY", CN: "CNY", KR: "KRW", IN: "INR", SG: "SGD", ID: "IDR", TH: "THB",
  CA: "CAD", BR: "BRL", MX: "MXN", AR: "ARS", CH: "CHF", SE: "SEK", NO: "NOK",
  ZA: "ZAR", NG: "NGN", KE: "KES", MA: "MAD", EG: "EGP", TN: "TND", DZ: "DZD",
  AU: "AUD", NZ: "NZD", FJ: "FJD", PF: "XPF", IS: "ISK", RU: "RUB"
};

// High precision currencies
const MINOR_UNITS: Record<string, number> = {
  JPY: 0, KRW: 0, VND: 0, CLP: 0, IDR: 0, HUF: 0, PYG: 0, RWF: 0, UGX: 0, VUV: 0,
  KWD: 3, BHD: 3, JOD: 3, TND: 3, OMR: 3,
};

function bankersRound(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  const n = value * f;
  const i = Math.floor(n);
  const frac = n - i;
  if (frac > 0.5) return (i + 1) / f;
  if (frac < 0.5) return i / f;
  // exactly .5 → round to even
  return (i % 2 === 0 ? i : i + 1) / f;
}

function applyRetailMargin(rate: number, bps = RETAIL_MARGIN_BPS) {
  return rate * (1 + bps / 10_000);
}

function formatMoney(amount: number, code: string, locale: string, minorUnits: Record<string, number>) {
  const mu = minorUnits[code] ?? 2;
  const rounded = bankersRound(amount, mu);
  
  // For crypto, show more precision
  if (['BTC', 'ETH', 'USDT', 'USDC', 'BNB'].includes(code)) {
    return `${rounded.toFixed(8)} ${code}`;
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: mu,
      maximumFractionDigits: mu,
    }).format(rounded);
  } catch {
    return `${code} ${rounded.toFixed(mu)}`;
  }
}

export default function CurrencyFusionDashboardV2() {
  const [supported, setSupported] = useState<SupportedResponse | null>(null);
  const [rates, setRates] = useState<RatesResponse | null>(null);
  const [primary, setPrimary] = useState<string>("USD");
  const [secondary, setSecondary] = useState<string>("EUR");
  const [cryptoTertiary, setCryptoTertiary] = useState<string>("BTC");
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [observability, setObservability] = useState({ fx_fetch_ok: 0, fx_fetch_fail: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const locale = Localization.locale ?? "en-US";
  const backendUrl = Constants.expoConfig?.extra?.EXPO_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

  const loadSupported = useCallback(async () => {
    const r = await fetch(`${backendUrl}/api/currency/supported`);
    if (!r.ok) throw new Error("supported failed");
    const json = await r.json() as SupportedResponse;
    setSupported(json);
  }, [backendUrl]);

  const fetchRates = useCallback(async (base: string) => {
    const res = await fetch(`${backendUrl}/api/currency/rates?base=${encodeURIComponent(base)}`);
    if (!res.ok) throw new Error("rates failed");
    const json = await res.json() as RatesResponse;
    setRates(json);
    setObservability(o => ({ ...o, fx_fetch_ok: o.fx_fetch_ok + 1 }));
  }, [backendUrl]);

  // Auto detect currency via GPS → country → code
  const detectCurrency = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let cc = "USD";
      
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
          timeout: 10000,
        });
        const rev = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        const iso = rev?.[0]?.isoCountryCode?.toUpperCase();
        if (iso && COUNTRY_TO_CC[iso]) {
          cc = COUNTRY_TO_CC[iso];
        }
      } else {
        // Fallback to device region
        const region = Localization.region?.toUpperCase();
        if (region && COUNTRY_TO_CC[region]) {
          cc = COUNTRY_TO_CC[region];
        }
      }
      
      console.log(`🌍 Auto-detected currency: ${cc}`);
      setPrimary(cc);
    } catch (error) {
      console.warn('Currency auto-detection failed:', error);
    }
  }, []);

  // Boot sequence
  useEffect(() => {
    (async () => {
      try {
        await loadSupported();
        if (autoDetect) {
          await detectCurrency();
        }
      } catch (e) {
        console.error('Initialization failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [autoDetect, loadSupported, detectCurrency]);

  // Refresh rates (3-minute cadence)
  useEffect(() => {
    let stopped = false;
    
    (async () => {
      try {
        await fetchRates(primary);
      } catch (error) {
        console.error('Initial rates fetch failed:', error);
        setObservability(o => ({ ...o, fx_fetch_fail: o.fx_fetch_fail + 1 }));
      }
      
      if (!stopped) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(async () => {
          try {
            await fetchRates(primary);
          } catch (error) {
            console.error('Rates refresh failed:', error);
            setObservability(o => ({ ...o, fx_fetch_fail: o.fx_fetch_fail + 1 }));
          }
        }, 180_000); // 3 minutes
      }
    })();
    
    return () => {
      stopped = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [primary, fetchRates]);

  const fxAge = useMemo(() => {
    if (!rates?.ts) return "—";
    const age = Math.max(0, Math.floor((Date.now() - rates.ts) / 1000));
    if (age < 60) return `${age}s`;
    const minutes = Math.floor(age / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }, [rates?.ts]);

  const cryptoCodes = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'MATIC'];
  
  const codes = useMemo(() => {
    if (!supported) return [];
    const pool = supported.currencies || [];
    if (!query) return pool.slice(0, 60);
    const q = query.toUpperCase();
    return pool.filter(c => c.includes(q)).slice(0, 60);
  }, [supported, query]);

  const demoSKUs = useMemo(
    () => [
      { name: "Milan Atelier Bag", code: "EUR", price: 2480 },
      { name: "Tokyo Edition Watch", code: "JPY", price: 572000 },
      { name: "Dubai Gold Cuff", code: "AED", price: 9280 },
      { name: "Swiss Chrono", code: "CHF", price: 12450 },
      { name: "Seoul Silk Scarf", code: "KRW", price: 398000 },
      { name: "Riyadh Oud", code: "SAR", price: 1590 },
    ],
    []
  );

  const convert = useCallback(
    (amount: number, from: string, to: string) => {
      if (!rates) return { ok: false as const, amount: 0 };
      if (from === to) return { ok: true as const, amount };
      
      const rFrom = rates.rates[from] ? 1 / rates.rates[from] : (rates.base === from ? 1 : undefined);
      const rTo = rates.rates[to] ?? (rates.base === to ? 1 : undefined);
      
      if (rFrom === undefined || rTo === undefined) {
        return { ok: false as const, amount: 0 };
      }
      
      const cross = rTo * rFrom;
      const withMargin = applyRetailMargin(cross, RETAIL_MARGIN_BPS);
      return { ok: true as const, amount: amount * withMargin };
    },
    [rates]
  );

  const isCrypto = useCallback((c: string) => cryptoCodes.includes(c), []);

  const healthStatus = useMemo(() => {
    const age = rates?.ts ? Math.floor((Date.now() - rates.ts) / 1000) : 999;
    const hasErrors = observability.fx_fetch_fail > 0;
    
    if (age > 600 || hasErrors > 2) return { status: 'Critical', color: ERROR };
    if (age > 300 || hasErrors > 0) return { status: 'Warning', color: WARN };
    return { status: 'Healthy', color: OK };
  }, [rates?.ts, observability.fx_fetch_fail]);

  if (loading || !supported) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={[INK, INK2, INK3]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Loading Currency-Infinity v2.0…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[INK, INK2, INK3, '#581c87']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>💱 Currency-Infinity v2.0</Text>
          <Text style={styles.subtitle}>
            185 currencies • auto-detect • dual display • crypto tertiary • FX age {fxAge}
          </Text>
          
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌊 BlueWave • Family-Safe AI Commerce</Text>
          </View>
          
          {/* Health Status */}
          <View style={[styles.healthBadge, { borderColor: healthStatus.color }]}>
            <View style={[styles.healthDot, { backgroundColor: healthStatus.color }]} />
            <Text style={[styles.healthText, { color: healthStatus.color }]}>
              FX Engine: {healthStatus.status}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.controlsCard}>
            <Text style={styles.controlsTitle}>Primary / Secondary / Crypto</Text>
            <View style={styles.pickersRow}>
              <CurrencyPicker
                code={primary}
                setCode={setPrimary}
                currencies={supported.currencies}
                label="Primary"
                cryptoCodes={cryptoCodes}
              />
              <CurrencyPicker
                code={secondary}
                setCode={setSecondary}
                currencies={supported.currencies}
                label="Secondary"
                cryptoCodes={cryptoCodes}
              />
              <CurrencyPicker
                code={cryptoTertiary}
                setCode={setCryptoTertiary}
                currencies={cryptoCodes}
                label="Crypto"
                cryptoCodes={cryptoCodes}
              />
            </View>
            
            <View style={styles.metaRow}>
              <TouchableOpacity
                onPress={() => setAutoDetect(v => !v)}
                style={[styles.autoDetectButton, { backgroundColor: autoDetect ? BADGE : CARD }]}
              >
                <Text style={styles.buttonText}>
                  {autoDetect ? "Auto-Detect: ON" : "Auto-Detect: OFF"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.metaText}>Provider: {rates?.provider || "—"}</Text>
              <Text style={styles.metaText}>FX Age: {fxAge}</Text>
              <Text style={styles.metaText}>Margin: {(RETAIL_MARGIN_BPS / 100).toFixed(2)}%</Text>
            </View>
          </View>

          {/* Search currencies */}
          <View style={styles.searchCard}>
            <Text style={styles.controlsTitle}>Find a currency</Text>
            <TextInput
              placeholder="Type code (e.g., KWD, JPY, BTC)…"
              placeholderTextColor={MUTED}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
            <FlatList
              style={styles.currencyList}
              data={codes}
              keyExtractor={(c) => c}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (isCrypto(item)) {
                      setCryptoTertiary(item);
                    } else if (item === primary) {
                      setSecondary(item);
                    } else {
                      setSecondary(item);
                    }
                  }}
                  style={styles.currencyChip}
                >
                  <Text style={styles.currencyChipText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>

        {/* Demo SKUs */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>
            Demo Products (canonical → dual + crypto tertiary)
          </Text>
          
          {demoSKUs.map((sku, idx) => {
            const toPrimary = convert(sku.price, sku.code, primary);
            const toSecondary = convert(sku.price, sku.code, secondary);
            const tertiary = convert(sku.price, sku.code, cryptoTertiary);
            const stale = rates?.ts ? (Date.now() - rates.ts) / 1000 > 240 : false;

            return (
              <View key={idx} style={styles.productCard}>
                <Text style={styles.productName}>{sku.name}</Text>
                <Text style={styles.canonicalPrice}>
                  Canonical: {formatMoney(sku.price, sku.code, locale, MINOR_UNITS)}
                </Text>

                <View style={styles.conversionRow}>
                  <View style={styles.conversionCard}>
                    <Text style={styles.conversionLabel}>Primary ({primary})</Text>
                    <Text style={styles.conversionValue}>
                      {toPrimary.ok
                        ? formatMoney(toPrimary.amount, primary, locale, MINOR_UNITS)
                        : "—"}
                    </Text>
                  </View>
                  <View style={styles.conversionCard}>
                    <Text style={styles.conversionLabel}>Secondary ({secondary})</Text>
                    <Text style={styles.conversionValue}>
                      {toSecondary.ok
                        ? formatMoney(toSecondary.amount, secondary, locale, MINOR_UNITS)
                        : "—"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cryptoCard}>
                  <Text style={styles.conversionLabel}>
                    Crypto (display-only): {cryptoTertiary}
                  </Text>
                  <Text style={styles.conversionValue}>
                    {tertiary.ok
                      ? `${bankersRound(tertiary.amount, 8).toFixed(8)} ${cryptoTertiary}`
                      : "—"}
                  </Text>
                  <Text style={styles.volatilityWarning}>
                    ⚠️ Volatility: Crypto rates are indicative (display-only, not used for checkout).
                  </Text>
                </View>

                <View style={styles.badgesRow}>
                  <Badge color={OK} text="Banker's rounding" />
                  <Badge color={GOLD} text={`FX margin ${(RETAIL_MARGIN_BPS / 100).toFixed(2)}%`} />
                  {stale && <Badge color={WARN} text="Stale rate (auto-refreshing)" />}
                </View>
              </View>
            );
          })}
        </View>

        {/* Observability */}
        <View style={styles.observabilitySection}>
          <Text style={styles.observabilityTitle}>Observability</Text>
          <View style={styles.observabilityCard}>
            <Text style={styles.observabilityRow}>
              fx_rates_fetch_ok: <Text style={styles.observabilityValue}>
                {observability.fx_fetch_ok}
              </Text>
            </Text>
            <Text style={styles.observabilityRow}>
              fx_rates_fetch_fail: <Text style={styles.observabilityValue}>
                {observability.fx_fetch_fail}
              </Text>
            </Text>
            <Text style={styles.observabilityRow}>
              provider: <Text style={styles.observabilityValue}>
                {rates?.provider || "—"}
              </Text>
            </Text>
            <Text style={styles.observabilityRow}>
              base: <Text style={styles.observabilityValue}>
                {rates?.base || "—"}
              </Text>
            </Text>
            <Text style={styles.observabilityRow}>
              fx_age_seconds: <Text style={styles.observabilityValue}>
                {rates?.ts ? Math.floor((Date.now() - rates.ts) / 1000) : "—"}
              </Text>
            </Text>
          </View>
          
          <Text style={styles.footerText}>
            🌊 BlueWave • Family-Safe AI Commerce
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Currency Picker Component
function CurrencyPicker({
  code,
  setCode,
  currencies,
  label,
  cryptoCodes
}: {
  code: string;
  setCode: (c: string) => void;
  currencies: string[];
  label: string;
  cryptoCodes: string[];
}) {
  const pool = label === 'Crypto' ? cryptoCodes : currencies.slice(0, 80);
  
  const next = useCallback(() => {
    if (!pool.length) return;
    const idx = Math.max(0, pool.indexOf(code));
    const nextIdx = (idx + 1) % pool.length;
    setCode(pool[nextIdx]);
  }, [code, pool, setCode]);

  return (
    <TouchableOpacity onPress={next} style={styles.picker}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Text style={styles.pickerValue}>{code}</Text>
    </TouchableOpacity>
  );
}

// Badge Component  
function Badge({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.badgeContainer, { borderColor: color }]}>
      <Text style={[styles.badgeInnerText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: INK,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: TEXT,
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BADGE,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: GOLD,
    fontWeight: '700',
    fontSize: 12,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  controlsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  controlsCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
  },
  controlsTitle: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
  pickersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    backgroundColor: INK2,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: INK3,
    minHeight: 56,
  },
  pickerLabel: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 4,
  },
  pickerValue: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  autoDetectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD,
  },
  buttonText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    color: MUTED,
    fontSize: 12,
  },
  searchCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
  },
  searchInput: {
    color: TEXT,
    backgroundColor: INK3,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: INK2,
    marginBottom: 12,
  },
  currencyList: {
    maxHeight: 160,
  },
  currencyChip: {
    backgroundColor: INK2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: INK3,
  },
  currencyChipText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '600',
  },
  productsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  productsTitle: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: INK2,
    marginBottom: 16,
  },
  productName: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  canonicalPrice: {
    color: MUTED,
    fontSize: 14,
    marginBottom: 12,
  },
  conversionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  conversionCard: {
    flex: 1,
    backgroundColor: INK2,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: INK3,
  },
  conversionLabel: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 4,
  },
  conversionValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '600',
  },
  cryptoCard: {
    backgroundColor: INK2,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: INK3,
    marginBottom: 12,
  },
  volatilityWarning: {
    color: WARN,
    fontSize: 11,
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  badgeInnerText: {
    fontSize: 10,
    fontWeight: '700',
  },
  observabilitySection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  observabilityTitle: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
  observabilityCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: INK2,
    marginBottom: 16,
  },
  observabilityRow: {
    color: MUTED,
    fontSize: 14,
    marginBottom: 4,
  },
  observabilityValue: {
    color: TEXT,
    fontWeight: '600',
  },
  footerText: {
    color: MUTED,
    textAlign: 'right',
    fontSize: 12,
  },
});