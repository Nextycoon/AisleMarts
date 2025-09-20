export const REGION_MAP: Record<string, string[]> = {
  americas: [
    "USD", "CAD", "MXN", "BRL", "ARS", "CLP", "COP", "PEN", "UYU", "BOB", 
    "BSD", "TTD", "JMD", "DOP", "GTQ", "HNL", "NIO", "CRC", "BBD", "BZD", 
    "GYD", "SRD", "XCD"
  ],
  europe: [
    "EUR", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", 
    "BGN", "HRK", "ISK", "RSD", "UAH", "TRY", "GEL", "MDL", "ALL", "MKD",
    "BAM", "RUB"
  ],
  africa: [
    "ZAR", "EGP", "NGN", "KES", "TZS", "UGX", "MAD", "DZD", "TND", "GHS", 
    "XOF", "XAF", "ETB", "ZMW", "BWP", "MUR", "NAD", "AOA", "RWF", "SZL",
    "LSL", "MZN"
  ],
  asia: [
    "CNY", "JPY", "KRW", "INR", "IDR", "MYR", "THB", "VND", "PHP", "SGD", 
    "HKD", "TWD", "PKR", "BDT", "LKR", "MMK", "KZT", "UZS", "AZN", "MNT",
    "AFN", "BTN", "KGS", "TJS", "TMT"
  ],
  middleEast: [
    "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "LBP", "ILS", "IRR", 
    "IQD", "YER", "SYP"
  ],
  oceania: [
    "AUD", "NZD", "FJD", "PGK", "SBD", "WST", "TOP", "VUV", "NCF", "XPF"
  ]
};

// Major World Currencies with detailed formatting info
export const CURRENCY_DATA: Record<string, {
  symbol: string;
  name: string;
  decimals: number;
  format: 'before' | 'after';
  separator: ',' | '.';
  delimiter: ',' | '.' | ' ';
  countries: string[];
  region: string;
}> = {
  // Americas
  USD: { symbol: '$', name: 'US Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['US', 'EC', 'PA'], region: 'americas' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['CA'], region: 'americas' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['BR'], region: 'americas' },
  MXN: { symbol: '$', name: 'Mexican Peso', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MX'], region: 'americas' },
  ARS: { symbol: '$', name: 'Argentine Peso', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['AR'], region: 'americas' },
  COP: { symbol: '$', name: 'Colombian Peso', decimals: 0, format: 'before', separator: ',', delimiter: '.', countries: ['CO'], region: 'americas' },
  CLP: { symbol: '$', name: 'Chilean Peso', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['CL'], region: 'americas' },
  PEN: { symbol: 'S/', name: 'Peruvian Sol', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PE'], region: 'americas' },

  // Europe
  EUR: { symbol: '€', name: 'Euro', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR'], region: 'europe' },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['GB'], region: 'europe' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2, format: 'after', separator: '.', delimiter: "'", countries: ['CH'], region: 'europe' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['NO'], region: 'europe' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['SE'], region: 'europe' },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['DK'], region: 'europe' },
  PLN: { symbol: 'zł', name: 'Polish Zloty', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['PL'], region: 'europe' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['CZ'], region: 'europe' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimals: 0, format: 'after', separator: ',', delimiter: ' ', countries: ['HU'], region: 'europe' },
  RUB: { symbol: '₽', name: 'Russian Ruble', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['RU'], region: 'europe' },
  TRY: { symbol: '₺', name: 'Turkish Lira', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['TR'], region: 'europe' },

  // Asia-Pacific
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['JP'], region: 'asia' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['CN'], region: 'asia' },
  KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['KR'], region: 'asia' },
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['IN'], region: 'asia' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, format: 'before', separator: ',', delimiter: '.', countries: ['ID'], region: 'asia' },
  THB: { symbol: '฿', name: 'Thai Baht', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TH'], region: 'asia' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SG'], region: 'asia' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MY'], region: 'asia' },
  PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PH'], region: 'asia' },
  VND: { symbol: '₫', name: 'Vietnamese Dong', decimals: 0, format: 'after', separator: '.', delimiter: ',', countries: ['VN'], region: 'asia' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['AU'], region: 'oceania' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NZ'], region: 'oceania' },

  // Middle East & Africa
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['AE'], region: 'middleEast' },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SA'], region: 'middleEast' },
  QAR: { symbol: 'ر.ق', name: 'Qatari Riyal', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['QA'], region: 'middleEast' },
  KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['KW'], region: 'middleEast' },
  BHD: { symbol: 'د.ب', name: 'Bahraini Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['BH'], region: 'middleEast' },
  ILS: { symbol: '₪', name: 'Israeli Shekel', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['IL'], region: 'middleEast' },
  EGP: { symbol: 'ج.م', name: 'Egyptian Pound', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['EG'], region: 'middleEast' },
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['ZA'], region: 'africa' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NG'], region: 'africa' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['KE'], region: 'africa' },
  MAD: { symbol: 'د.م.', name: 'Moroccan Dirham', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MA'], region: 'africa' },

  // Additional Major Currencies
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['HK'], region: 'asia' },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TW'], region: 'asia' },
  LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['LK'], region: 'asia' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BD'], region: 'asia' },
  PKR: { symbol: '₨', name: 'Pakistani Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PK'], region: 'asia' },
};

// Country to Currency Mapping (ISO 3166-1 alpha-2)
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Americas
  'US': 'USD', 'EC': 'USD', 'PA': 'USD', 'CA': 'CAD', 'BR': 'BRL', 'MX': 'MXN', 
  'AR': 'ARS', 'CO': 'COP', 'CL': 'CLP', 'PE': 'PEN',
  // Europe  
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 
  'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'FI': 'EUR', 'GR': 'EUR',
  'GB': 'GBP', 'CH': 'CHF', 'NO': 'NOK', 'SE': 'SEK', 'DK': 'DKK', 'PL': 'PLN', 
  'CZ': 'CZK', 'HU': 'HUF', 'RU': 'RUB', 'TR': 'TRY',
  // Asia-Pacific
  'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR', 'ID': 'IDR', 'TH': 'THB', 
  'SG': 'SGD', 'MY': 'MYR', 'PH': 'PHP', 'VN': 'VND',
  'AU': 'AUD', 'NZ': 'NZD', 'HK': 'HKD', 'TW': 'TWD', 'LK': 'LKR', 'BD': 'BDT', 'PK': 'PKR',
  // Middle East & Africa
  'AE': 'AED', 'SA': 'SAR', 'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD', 'IL': 'ILS', 'EG': 'EGP',
  'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES', 'MA': 'MAD',
};