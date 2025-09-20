export type IsoCurrency = string; // e.g. "USD", "EUR"
export type RegionKey = "americas" | "europe" | "africa" | "asia" | "middleEast" | "oceania";

export interface FxQuote {
  base: IsoCurrency;              // the base symbol (e.g. "USD")
  ts: number;                     // epoch ms
  rates: Record<IsoCurrency, number>; // quote is 1 base * rate = quote
}

export interface CurrencyPrefs {
  primary: IsoCurrency;           // chosen/displayed currency
  secondary?: IsoCurrency;        // optional dual display
  region?: RegionKey;             // for lazy loading clusters
  autoDetect: boolean;
}

export interface CurrencyContextValue {
  prefs: CurrencyPrefs;
  setPrimary: (c: IsoCurrency) => void;
  setSecondary: (c?: IsoCurrency) => void;
  setAutoDetect: (v: boolean) => void;
  convert: (amount: number, from: IsoCurrency, to: IsoCurrency) => number | null;
  format: (amount: number, code: IsoCurrency, locale?: string) => string;
  available: () => Promise<IsoCurrency[]>; // lazy by region
  lastUpdated?: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  format: 'before' | 'after';
  separator: ',' | '.';
  delimiter: ',' | '.' | ' ';
  countries: string[];
  region: string;
}