// Currency-Infinity Engine - Automatic Location-Based Currency Detection
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

// Major World Currencies - Lazy Loaded by Region
export const currencies: { [key: string]: Currency } = {
  // Americas
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['US', 'EC', 'PA'], region: 'americas' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['CA'], region: 'americas' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['BR'], region: 'americas' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MX'], region: 'americas' },
  ARS: { code: 'ARS', symbol: '$', name: 'Argentine Peso', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['AR'], region: 'americas' },
  COP: { code: 'COP', symbol: '$', name: 'Colombian Peso', decimals: 0, format: 'before', separator: ',', delimiter: '.', countries: ['CO'], region: 'americas' },
  CLP: { code: 'CLP', symbol: '$', name: 'Chilean Peso', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['CL'], region: 'americas' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PE'], region: 'americas' },

  // Europe
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR'], region: 'europe' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['GB'], region: 'europe' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2, format: 'after', separator: '.', delimiter: "'", countries: ['CH'], region: 'europe' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['NO'], region: 'europe' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['SE'], region: 'europe' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['DK'], region: 'europe' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['PL'], region: 'europe' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['CZ'], region: 'europe' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', decimals: 0, format: 'after', separator: ',', delimiter: ' ', countries: ['HU'], region: 'europe' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['RU'], region: 'europe' },

  // Asia-Pacific
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['JP'], region: 'asia' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['CN'], region: 'asia' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['KR'], region: 'asia' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['IN'], region: 'asia' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, format: 'before', separator: ',', delimiter: '.', countries: ['ID'], region: 'asia' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TH'], region: 'asia' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SG'], region: 'asia' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MY'], region: 'asia' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PH'], region: 'asia' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0, format: 'after', separator: '.', delimiter: ',', countries: ['VN'], region: 'asia' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['AU'], region: 'asia' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NZ'], region: 'asia' },

  // Middle East & Africa
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['AE'], region: 'middle_east' },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SA'], region: 'middle_east' },
  QAR: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['QA'], region: 'middle_east' },
  KWD: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['KW'], region: 'middle_east' },
  BHD: { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['BH'], region: 'middle_east' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['IL'], region: 'middle_east' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['TR'], region: 'middle_east' },
  EGP: { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['EG'], region: 'middle_east' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['ZA'], region: 'africa' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NG'], region: 'africa' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['KE'], region: 'africa' },
  MAD: { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MA'], region: 'africa' },

  // Additional Major Currencies
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['HK'], region: 'asia' },
  TWD: { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TW'], region: 'asia' },
  LKR: { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['LK'], region: 'asia' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BD'], region: 'asia' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PK'], region: 'asia' },
};

// Country to Currency Mapping (ISO 3166-1 alpha-2)
const countryToCurrency: { [key: string]: string } = {
  // Americas
  'US': 'USD', 'EC': 'USD', 'PA': 'USD', 'CA': 'CAD', 'BR': 'BRL', 'MX': 'MXN', 'AR': 'ARS', 'CO': 'COP', 'CL': 'CLP', 'PE': 'PEN',
  // Europe  
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'FI': 'EUR', 'GR': 'EUR',
  'GB': 'GBP', 'CH': 'CHF', 'NO': 'NOK', 'SE': 'SEK', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RU': 'RUB',
  // Asia-Pacific
  'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR', 'ID': 'IDR', 'TH': 'THB', 'SG': 'SGD', 'MY': 'MYR', 'PH': 'PHP', 'VN': 'VND',
  'AU': 'AUD', 'NZ': 'NZD', 'HK': 'HKD', 'TW': 'TWD', 'LK': 'LKR', 'BD': 'BDT', 'PK': 'PKR',
  // Middle East & Africa
  'AE': 'AED', 'SA': 'SAR', 'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD', 'IL': 'ILS', 'TR': 'TRY', 'EG': 'EGP',
  'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES', 'MA': 'MAD',
};

// Simple exchange rates (in production, these would come from live API)
const exchangeRates: { [key: string]: number } = {
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

// Automatic location detection for currency
export const detectUserLocation = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'US';
  
  try {
    // Try geolocation API first
    if (navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // In production, you'd use a geolocation API here
              // For now, we'll use timezone and language as fallbacks
              const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              const country = timezoneToCountry(timezone);
              resolve(country);
            } catch (error) {
              resolve(fallbackCountryDetection());
            }
          },
          () => resolve(fallbackCountryDetection()),
          { timeout: 3000 }
        );
      });
    }
    
    return fallbackCountryDetection();
  } catch (error) {
    return fallbackCountryDetection();
  }
};

// Fallback country detection using browser info
const fallbackCountryDetection = (): string => {
  if (typeof window === 'undefined') return 'US';
  
  // Try language setting
  const language = navigator.language || navigator.languages?.[0] || 'en-US';
  const languageToCountry: { [key: string]: string } = {
    'en-US': 'US', 'en-GB': 'GB', 'en-CA': 'CA', 'en-AU': 'AU',
    'fr-FR': 'FR', 'fr-CA': 'CA', 'de-DE': 'DE', 'de-AT': 'AT', 'de-CH': 'CH',
    'es-ES': 'ES', 'es-MX': 'MX', 'es-AR': 'AR', 'pt-BR': 'BR', 'pt-PT': 'PT',
    'it-IT': 'IT', 'nl-NL': 'NL', 'ru-RU': 'RU', 'ja-JP': 'JP', 'ko-KR': 'KR',
    'zh-CN': 'CN', 'zh-TW': 'TW', 'zh-HK': 'HK', 'ar-SA': 'SA', 'ar-AE': 'AE',
    'hi-IN': 'IN', 'th-TH': 'TH', 'vi-VN': 'VN', 'id-ID': 'ID', 'ms-MY': 'MY',
    'tr-TR': 'TR', 'he-IL': 'IL', 'sv-SE': 'SE', 'no-NO': 'NO', 'da-DK': 'DK',
    'fi-FI': 'FI', 'pl-PL': 'PL', 'cs-CZ': 'CZ', 'hu-HU': 'HU',
  };
  
  if (languageToCountry[language]) {
    return languageToCountry[language];
  }
  
  // Try just the language part
  const langCode = language.split('-')[0];
  const simpleLanguageMap: { [key: string]: string } = {
    'en': 'US', 'fr': 'FR', 'de': 'DE', 'es': 'ES', 'pt': 'BR', 'it': 'IT',
    'ru': 'RU', 'ja': 'JP', 'ko': 'KR', 'zh': 'CN', 'ar': 'SA', 'hi': 'IN',
    'th': 'TH', 'vi': 'VN', 'id': 'ID', 'tr': 'TR', 'he': 'IL', 'sv': 'SE',
  };
  
  return simpleLanguageMap[langCode] || 'US';
};

// Timezone to country mapping (simplified)
const timezoneToCountry = (timezone: string): string => {
  const timezoneMap: { [key: string]: string } = {
    'America/New_York': 'US', 'America/Los_Angeles': 'US', 'America/Chicago': 'US',
    'America/Toronto': 'CA', 'America/Vancouver': 'CA',
    'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
    'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL',
    'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Seoul': 'KR',
    'Asia/Mumbai': 'IN', 'Asia/Bangkok': 'TH', 'Asia/Singapore': 'SG',
    'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Jakarta': 'ID',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
    'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX',
    'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Africa/Johannesburg': 'ZA',
  };
  
  return timezoneMap[timezone] || 'US';
};

// Get currency for country
export const getCurrencyForCountry = (countryCode: string): string => {
  return countryToCurrency[countryCode] || 'USD';
};

// Format currency with proper cultural formatting
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = currencies[currencyCode];
  if (!currency) return `${amount} ${currencyCode}`;
  
  // Apply rounding based on decimals
  const roundedAmount = Number(amount.toFixed(currency.decimals));
  
  // Format number with proper separators
  let formattedNumber: string;
  if (currency.decimals === 0) {
    formattedNumber = Math.round(roundedAmount).toString();
  } else {
    formattedNumber = roundedAmount.toFixed(currency.decimals);
  }
  
  // Apply cultural number formatting
  const parts = formattedNumber.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add thousands delimiter
  if (currency.delimiter && integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.delimiter);
  }
  
  // Combine with separator
  if (decimalPart && currency.decimals > 0) {
    formattedNumber = integerPart + currency.separator + decimalPart;
  } else {
    formattedNumber = integerPart;
  }
  
  // Apply symbol positioning
  if (currency.format === 'before') {
    return `${currency.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${currency.symbol}`;
  }
};

// Convert currency
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

// Get current user currency (cached)
let cachedUserCurrency: string | null = null;

export const getUserCurrency = async (): Promise<string> => {
  if (cachedUserCurrency) return cachedUserCurrency;
  
  try {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCurrency');
      if (saved && currencies[saved]) {
        cachedUserCurrency = saved;
        return saved;
      }
    }
    
    // Auto-detect based on location
    const country = await detectUserLocation();
    const currency = getCurrencyForCountry(country);
    
    // Cache the result
    cachedUserCurrency = currency;
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCurrency', currency);
    }
    
    console.log(`🌍 Currency-Infinity Engine: Auto-detected ${currency} for ${country}`);
    return currency;
  } catch (error) {
    console.error('Currency detection failed:', error);
    cachedUserCurrency = 'USD';
    return 'USD';
  }
};

// Set user currency
export const setUserCurrency = (currencyCode: string): void => {
  if (currencies[currencyCode]) {
    cachedUserCurrency = currencyCode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCurrency', currencyCode);
    }
    console.log(`💱 Currency changed to: ${currencyCode}`);
  }
};

// Get all supported currencies
export const getSupportedCurrencies = (): Currency[] => {
  return Object.values(currencies);
};

// Get currencies by region
export const getCurrenciesByRegion = (region: string): Currency[] => {
  return Object.values(currencies).filter(currency => currency.region === region);
};

// Smart currency formatting with user's currency
export const smartFormatCurrency = async (amount: number, baseCurrency: string = 'USD'): Promise<string> => {
  const userCurrency = await getUserCurrency();
  if (baseCurrency === userCurrency) {
    return formatCurrency(amount, userCurrency);
  }
  
  const convertedAmount = convertCurrency(amount, baseCurrency, userCurrency);
  return formatCurrency(convertedAmount, userCurrency);
};

export default {
  currencies,
  formatCurrency,
  convertCurrency,
  getUserCurrency,
  setUserCurrency,
  smartFormatCurrency,
  getSupportedCurrencies,
  getCurrenciesByRegion,
};