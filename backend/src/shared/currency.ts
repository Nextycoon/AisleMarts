import Decimal from "decimal.js";

export const MINOR_UNITS: Record<string, number> = {
  USD: 2, EUR: 2, GBP: 2, JPY: 0,
  // add others as needed
};

export function toMinorUnits(amount: number | string, currency: string): bigint {
  const mu = MINOR_UNITS[currency] ?? 2;
  const d = new Decimal(amount);
  const scaled = d.mul(new Decimal(10).pow(mu)).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return BigInt(scaled.toString());
}

export function fromMinorUnits(minor: bigint, currency: string): string {
  const mu = MINOR_UNITS[currency] ?? 2;
  const d = new Decimal(minor.toString()).div(new Decimal(10).pow(mu));
  return d.toFixed(mu); // "2dp" or "0dp" as per currency
}

// commission = rate% of gross, rounded to currency minor units
export function commission(minorGross: bigint, ratePct: number, currency: string): bigint {
  const mu = MINOR_UNITS[currency] ?? 2;
  const gross = new Decimal(minorGross.toString());
  const result = gross.mul(ratePct).div(100);
  const scaled = result.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return BigInt(scaled.toString());
}

// Legacy compatibility functions (keep existing API working)
export const CURRENCY_DECIMALS = MINOR_UNITS;
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];

export function roundMinor(amount: number | string, currencyCode: string): number {
  const decimals = MINOR_UNITS[currencyCode] || 2;
  const factor = Math.pow(10, decimals);
  return Math.round(parseFloat(amount.toString()) * factor) / factor;
}

export function assertSupported(currencyCode: string): string {
  if (!currencyCode) {
    throw new Error('Currency code is required');
  }
  
  const upperCode = currencyCode.toString().toUpperCase();
  
  if (!SUPPORTED_CURRENCIES.includes(upperCode)) {
    throw new Error(`Unsupported currency: ${currencyCode}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
  }
  
  return upperCode;
}

export function convertToUSD(amount: number, fromCurrency: string, fxRates: Record<string, number> = {}): number {
  if (fromCurrency === 'USD') return amount;
  
  // Default FX rates (approximate)
  const defaultRates: Record<string, number> = {
    EUR: 1.087,
    GBP: 1.266, 
    JPY: 0.006667
  };
  
  const rate = fxRates[fromCurrency] || defaultRates[fromCurrency] || 1;
  return roundMinor(amount * rate, 'USD');
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const rounded = roundMinor(amount, currencyCode);
  const decimals = MINOR_UNITS[currencyCode] || 2;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(rounded);
}