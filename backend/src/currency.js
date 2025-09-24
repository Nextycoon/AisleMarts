// Multi-currency handling and rounding logic for EUR/GBP/JPY support

export const CURRENCY_DECIMALS = {
  USD: 2,
  EUR: 2, 
  GBP: 2,
  JPY: 0
};

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];

/**
 * Round amount to proper decimal places for currency
 */
export function roundMinor(amount, currencyCode) {
  const decimals = CURRENCY_DECIMALS[currencyCode] || 2;
  const factor = Math.pow(10, decimals);
  return Math.round(parseFloat(amount) * factor) / factor;
}

/**
 * Validate and normalize currency code
 */
export function assertSupported(currencyCode) {
  if (!currencyCode) {
    throw new Error('Currency code is required');
  }
  
  const upperCode = currencyCode.toString().toUpperCase();
  
  if (!SUPPORTED_CURRENCIES.includes(upperCode)) {
    throw new Error(`Unsupported currency: ${currencyCode}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
  }
  
  return upperCode;
}

/**
 * Convert amount to USD for normalization
 */
export function convertToUSD(amount, fromCurrency, fxRates = {}) {
  if (fromCurrency === 'USD') return amount;
  
  // Default FX rates (approximate)
  const defaultRates = {
    EUR: 1.087,
    GBP: 1.266, 
    JPY: 0.006667
  };
  
  const rate = fxRates[fromCurrency] || defaultRates[fromCurrency] || 1;
  return roundMinor(amount * rate, 'USD');
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount, currencyCode) {
  const rounded = roundMinor(amount, currencyCode);
  const decimals = CURRENCY_DECIMALS[currencyCode];
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(rounded);
}