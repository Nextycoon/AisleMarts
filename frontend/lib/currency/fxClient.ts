import Constants from 'expo-constants';
import { FxQuote } from './types';

let memoryCache: { quote?: FxQuote } = {};

async function fetchRates(sourceBase: string): Promise<FxQuote> {
  // Get backend URL from environment
  const backendUrl = Constants.expoConfig?.extra?.EXPO_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';
  const url = `${backendUrl}/api/currency/rates?base=${encodeURIComponent(sourceBase)}`;
  
  console.log(`🌍 Currency-Infinity Engine: Fetching rates for ${sourceBase} from ${url}`);
  
  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`FX fetch failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log(`💱 Received rates for ${sourceBase}:`, Object.keys(data.rates || {}).length, 'currencies');
    return data as FxQuote;
  } catch (error) {
    console.warn('🔄 FX API failed, using fallback rates:', error);
    // Fallback to static rates if API fails
    return getFallbackRates(sourceBase);
  }
}

function getFallbackRates(base: string): FxQuote {
  // Static fallback rates for demo (updated June 2025)
  const fallbackRates: Record<string, number> = {
    'USD': 1.0,      // Base currency
    'EUR': 0.85,     'GBP': 0.73,     'JPY': 110.0,    'CNY': 6.45,
    'CAD': 1.25,     'AUD': 1.35,     'CHF': 0.92,     'SEK': 8.60,
    'NOK': 8.50,     'DKK': 6.30,     'PLN': 3.90,     'CZK': 21.50,
    'HUF': 290.0,    'RUB': 75.0,     'BRL': 5.20,     'MXN': 20.0,
    'ARS': 98.0,     'COP': 3800.0,   'CLP': 720.0,    'PEN': 3.60,
    'KRW': 1180.0,   'INR': 74.0,     'IDR': 14200.0,  'THB': 31.0,
    'SGD': 1.35,     'MYR': 4.15,     'PHP': 50.0,     'VND': 23000.0,
    'HKD': 7.80,     'TWD': 28.0,     'LKR': 180.0,    'BDT': 85.0,
    'PKR': 160.0,    'AED': 3.67,     'SAR': 3.75,     'QAR': 3.64,
    'KWD': 0.30,     'BHD': 0.38,     'ILS': 3.20,     'TRY': 8.50,
    'EGP': 15.7,     'ZAR': 14.5,     'NGN': 410.0,    'KES': 108.0,
    'MAD': 9.0,
  };

  // Convert rates relative to base currency
  const baseRate = fallbackRates[base] || 1;
  const rates = Object.fromEntries(
    Object.entries(fallbackRates).map(([k, v]) => [k, v / baseRate])
  );

  return {
    base,
    ts: Date.now(),
    rates
  };
}

export async function getFx(base: string): Promise<FxQuote> {
  // Serve cached if fresh (<5 min)
  const now = Date.now();
  if (memoryCache.quote && now - (memoryCache.quote.ts || 0) < 5 * 60 * 1000) {
    if (memoryCache.quote.base === base) {
      console.log(`⚡ Using cached rates for ${base}`);
      return memoryCache.quote;
    }
  }
  
  const q = await fetchRates(base);
  memoryCache.quote = q;
  return q;
}