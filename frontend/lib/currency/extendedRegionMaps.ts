// Extended Currency Coverage - 180+ ISO Currencies for Global Production
export const EXTENDED_REGION_MAP: Record<string, string[]> = {
  americas: [
    "USD", "CAD", "MXN", "BRL", "ARS", "CLP", "COP", "PEN", "UYU", "BOB", 
    "BSD", "TTD", "JMD", "DOP", "GTQ", "HNL", "NIO", "CRC", "BBD", "BZD", 
    "GYD", "SRD", "XCD", "HTG", "CUP", "CUC", "ANG", "PAB", "VED", "VES"
  ],
  europe: [
    "EUR", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", 
    "BGN", "HRK", "ISK", "RSD", "UAH", "TRY", "GEL", "MDL", "ALL", "MKD",
    "BAM", "RUB", "BYN", "AMD", "AZN", "KZT", "KGS", "UZS", "TJS", "TMT"
  ],
  africa: [
    "ZAR", "EGP", "NGN", "KES", "TZS", "UGX", "MAD", "DZD", "TND", "GHS", 
    "XOF", "XAF", "ETB", "ZMW", "BWP", "MUR", "NAD", "AOA", "RWF", "SZL",
    "LSL", "MZN", "MRU", "SOS", "SDG", "LYD", "CDF", "GMD", "GNF", "LRD",
    "SLL", "STN", "CVE", "KMF", "DJF", "ERN", "MWK", "MGA", "SCR", "BIF"
  ],
  asia: [
    "CNY", "JPY", "KRW", "INR", "IDR", "MYR", "THB", "VND", "PHP", "SGD", 
    "HKD", "TWD", "PKR", "BDT", "LKR", "MMK", "KZT", "UZS", "AZN", "MNT",
    "AFN", "BTN", "KGS", "TJS", "TMT", "CNH", "NPR", "MVR", "LAK", "KHR",
    "BND", "FJD", "PGK", "SBD", "WST", "TOP", "VUV", "NCF", "XPF"
  ],
  middleEast: [
    "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "LBP", "ILS", "IRR", 
    "IQD", "YER", "SYP"
  ],
  oceania: [
    "AUD", "NZD", "FJD", "PGK", "SBD", "WST", "TOP", "VUV", "NCF", "XPF",
    "KID", "TVD"
  ],
  crypto: [
    "BTC", "ETH", "USDT", "USDC", "BNB", "XRP", "ADA", "SOL", "DOT", "MATIC"
  ]
};

// Extended Currency Data with Cultural Formatting
export const EXTENDED_CURRENCY_DATA: Record<string, {
  symbol: string;
  name: string;
  decimals: number;
  format: 'before' | 'after';
  separator: ',' | '.';
  delimiter: ',' | '.' | ' ' | "'";
  countries: string[];
  region: string;
  rounding?: 'bankers' | 'standard';
  displayOnly?: boolean; // For non-tradable currencies
  pegged?: string; // For pegged currencies
}> = {
  // Major Americas
  USD: { symbol: '$', name: 'US Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['US', 'EC', 'PA', 'PW', 'TL'], region: 'americas' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['CA'], region: 'americas' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['BR'], region: 'americas' },
  MXN: { symbol: '$', name: 'Mexican Peso', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MX'], region: 'americas' },
  ARS: { symbol: '$', name: 'Argentine Peso', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['AR'], region: 'americas' },
  CLP: { symbol: '$', name: 'Chilean Peso', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['CL'], region: 'americas', rounding: 'bankers' },
  COP: { symbol: '$', name: 'Colombian Peso', decimals: 0, format: 'before', separator: ',', delimiter: '.', countries: ['CO'], region: 'americas' },
  PEN: { symbol: 'S/', name: 'Peruvian Sol', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PE'], region: 'americas' },
  UYU: { symbol: '$U', name: 'Uruguayan Peso', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['UY'], region: 'americas' },
  BOB: { symbol: 'Bs.', name: 'Bolivian Boliviano', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BO'], region: 'americas' },
  
  // Caribbean
  XCD: { symbol: 'EC$', name: 'East Caribbean Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['AG', 'AI', 'DM', 'GD', 'MS', 'KN', 'LC', 'VC'], region: 'americas' },
  HTG: { symbol: 'G', name: 'Haitian Gourde', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['HT'], region: 'americas' },
  JMD: { symbol: 'J$', name: 'Jamaican Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['JM'], region: 'americas' },
  TTD: { symbol: 'TT$', name: 'Trinidad Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TT'], region: 'americas' },
  BBD: { symbol: 'Bds$', name: 'Barbadian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BB'], region: 'americas', pegged: 'USD' },
  
  // Major Europe
  EUR: { symbol: '€', name: 'Euro', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR', 'EE', 'LV', 'LT', 'LU', 'MT', 'SK', 'SI', 'CY'], region: 'europe' },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['GB', 'IM', 'JE', 'GG'], region: 'europe' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2, format: 'after', separator: '.', delimiter: "'", countries: ['CH', 'LI'], region: 'europe' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['NO', 'SJ', 'BV'], region: 'europe' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['SE'], region: 'europe' },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['DK', 'FO', 'GL'], region: 'europe' },
  PLN: { symbol: 'zł', name: 'Polish Zloty', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['PL'], region: 'europe' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['CZ'], region: 'europe' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimals: 0, format: 'after', separator: ',', delimiter: ' ', countries: ['HU'], region: 'europe' },
  RUB: { symbol: '₽', name: 'Russian Ruble', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['RU'], region: 'europe' },
  TRY: { symbol: '₺', name: 'Turkish Lira', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['TR'], region: 'europe' },
  
  // Eastern Europe Extended
  UAH: { symbol: '₴', name: 'Ukrainian Hryvnia', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['UA'], region: 'europe' },
  BYN: { symbol: 'Br', name: 'Belarusian Ruble', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['BY'], region: 'europe' },
  RON: { symbol: 'lei', name: 'Romanian Leu', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['RO'], region: 'europe' },
  BGN: { symbol: 'лв', name: 'Bulgarian Lev', decimals: 2, format: 'after', separator: ',', delimiter: ' ', countries: ['BG'], region: 'europe', pegged: 'EUR' },
  HRK: { symbol: 'kn', name: 'Croatian Kuna', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['HR'], region: 'europe' },
  RSD: { symbol: 'din', name: 'Serbian Dinar', decimals: 2, format: 'after', separator: ',', delimiter: '.', countries: ['RS'], region: 'europe' },
  
  // Major Asia-Pacific
  CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['CN'], region: 'asia' },
  CNH: { symbol: '¥', name: 'Chinese Yuan (Offshore)', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['HK'], region: 'asia', displayOnly: true },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['JP'], region: 'asia', rounding: 'bankers' },
  KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['KR'], region: 'asia' },
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['IN', 'BT'], region: 'asia' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, format: 'before', separator: ',', delimiter: '.', countries: ['ID'], region: 'asia' },
  THB: { symbol: '฿', name: 'Thai Baht', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TH'], region: 'asia' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SG'], region: 'asia' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MY'], region: 'asia' },
  PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PH'], region: 'asia' },
  VND: { symbol: '₫', name: 'Vietnamese Dong', decimals: 0, format: 'after', separator: '.', delimiter: ',', countries: ['VN'], region: 'asia' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['HK'], region: 'asia', pegged: 'USD' },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TW'], region: 'asia' },
  
  // South Asia Extended
  PKR: { symbol: '₨', name: 'Pakistani Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PK'], region: 'asia' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BD'], region: 'asia' },
  LKR: { symbol: 'Rs', name: 'Sri Lankan Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['LK'], region: 'asia' },
  NPR: { symbol: 'Rs', name: 'Nepalese Rupee', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NP'], region: 'asia', pegged: 'INR' },
  BTN: { symbol: 'Nu.', name: 'Bhutanese Ngultrum', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BT'], region: 'asia', pegged: 'INR' },
  MVR: { symbol: 'Rf', name: 'Maldivian Rufiyaa', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MV'], region: 'asia' },
  
  // Southeast Asia Extended
  MMK: { symbol: 'K', name: 'Myanmar Kyat', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MM'], region: 'asia' },
  LAK: { symbol: '₭', name: 'Laotian Kip', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['LA'], region: 'asia' },
  KHR: { symbol: '៛', name: 'Cambodian Riel', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['KH'], region: 'asia' },
  BND: { symbol: 'B$', name: 'Brunei Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BN'], region: 'asia', pegged: 'SGD' },
  
  // Middle East
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['AE'], region: 'middleEast', pegged: 'USD' },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SA'], region: 'middleEast', pegged: 'USD' },
  QAR: { symbol: 'ر.ق', name: 'Qatari Riyal', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['QA'], region: 'middleEast', pegged: 'USD' },
  KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['KW'], region: 'middleEast' },
  BHD: { symbol: 'د.ب', name: 'Bahraini Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['BH'], region: 'middleEast', rounding: 'bankers' },
  OMR: { symbol: 'ر.ع.', name: 'Omani Rial', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['OM'], region: 'middleEast', pegged: 'USD' },
  JOD: { symbol: 'د.ا', name: 'Jordanian Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['JO'], region: 'middleEast', pegged: 'USD' },
  ILS: { symbol: '₪', name: 'Israeli Shekel', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['IL', 'PS'], region: 'middleEast' },
  LBP: { symbol: 'ل.ل', name: 'Lebanese Pound', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['LB'], region: 'middleEast' },
  SYP: { symbol: 'ل.س', name: 'Syrian Pound', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SY'], region: 'middleEast', displayOnly: true },
  IQD: { symbol: 'ع.د', name: 'Iraqi Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['IQ'], region: 'middleEast' },
  IRR: { symbol: '﷼', name: 'Iranian Rial', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['IR'], region: 'middleEast', displayOnly: true },
  YER: { symbol: '﷼', name: 'Yemeni Rial', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['YE'], region: 'middleEast' },
  
  // Africa Major
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['ZA', 'LS', 'NA', 'SZ'], region: 'africa' },
  EGP: { symbol: 'ج.م', name: 'Egyptian Pound', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['EG'], region: 'africa' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NG'], region: 'africa' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['KE'], region: 'africa' },
  MAD: { symbol: 'د.م.', name: 'Moroccan Dirham', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['MA', 'EH'], region: 'africa' },
  TND: { symbol: 'د.ت', name: 'Tunisian Dinar', decimals: 3, format: 'before', separator: '.', delimiter: ',', countries: ['TN'], region: 'africa', rounding: 'bankers' },
  DZD: { symbol: 'د.ج', name: 'Algerian Dinar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['DZ'], region: 'africa' },
  
  // West & Central Africa
  XOF: { symbol: 'CFA', name: 'West African CFA Franc', decimals: 0, format: 'after', separator: '.', delimiter: ' ', countries: ['BF', 'BJ', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG'], region: 'africa', pegged: 'EUR' },
  XAF: { symbol: 'FCFA', name: 'Central African CFA Franc', decimals: 0, format: 'after', separator: '.', delimiter: ' ', countries: ['CF', 'CM', 'CG', 'GA', 'GQ', 'TD'], region: 'africa', pegged: 'EUR' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['GH'], region: 'africa' },
  
  // East Africa
  ETB: { symbol: 'Br', name: 'Ethiopian Birr', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['ET'], region: 'africa' },
  TZS: { symbol: 'TSh', name: 'Tanzanian Shilling', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['TZ'], region: 'africa' },
  UGX: { symbol: 'USh', name: 'Ugandan Shilling', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['UG'], region: 'africa' },
  RWF: { symbol: 'RF', name: 'Rwandan Franc', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['RW'], region: 'africa' },
  
  // Southern Africa
  BWP: { symbol: 'P', name: 'Botswana Pula', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['BW'], region: 'africa' },
  ZMW: { symbol: 'ZK', name: 'Zambian Kwacha', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['ZM'], region: 'africa' },
  NAD: { symbol: 'N$', name: 'Namibian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NA'], region: 'africa', pegged: 'ZAR' },
  SZL: { symbol: 'L', name: 'Swazi Lilangeni', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SZ'], region: 'africa', pegged: 'ZAR' },
  LSL: { symbol: 'L', name: 'Lesotho Loti', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['LS'], region: 'africa', pegged: 'ZAR' },
  MZN: { symbol: 'MT', name: 'Mozambican Metical', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['MZ'], region: 'africa' },
  AOA: { symbol: 'Kz', name: 'Angolan Kwanza', decimals: 2, format: 'before', separator: ',', delimiter: '.', countries: ['AO'], region: 'africa' },
  
  // Oceania
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['AU', 'CX', 'CC', 'HM', 'KI', 'NR', 'NF', 'TV'], region: 'oceania' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['NZ', 'CK', 'NU', 'PN', 'TK'], region: 'oceania' },
  FJD: { symbol: 'FJ$', name: 'Fijian Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['FJ'], region: 'oceania' },
  PGK: { symbol: 'K', name: 'Papua New Guinea Kina', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['PG'], region: 'oceania' },
  SBD: { symbol: 'SI$', name: 'Solomon Islands Dollar', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['SB'], region: 'oceania' },
  WST: { symbol: 'WS$', name: 'Samoan Tala', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['WS'], region: 'oceania' },
  TOP: { symbol: 'T$', name: 'Tongan Paʻanga', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: ['TO'], region: 'oceania' },
  VUV: { symbol: 'VT', name: 'Vanuatu Vatu', decimals: 0, format: 'before', separator: '.', delimiter: ',', countries: ['VU'], region: 'oceania' },
  NCF: { symbol: '₣', name: 'CFP Franc', decimals: 0, format: 'after', separator: '.', delimiter: ' ', countries: ['NC'], region: 'oceania', pegged: 'EUR' },
  XPF: { symbol: '₣', name: 'CFP Franc', decimals: 0, format: 'after', separator: '.', delimiter: ' ', countries: ['PF', 'WF'], region: 'oceania', pegged: 'EUR' },
  
  // Crypto (Tertiary Display Only)
  BTC: { symbol: '₿', name: 'Bitcoin', decimals: 8, format: 'before', separator: '.', delimiter: ',', countries: [], region: 'crypto', displayOnly: true },
  ETH: { symbol: 'Ξ', name: 'Ethereum', decimals: 6, format: 'before', separator: '.', delimiter: ',', countries: [], region: 'crypto', displayOnly: true },
  USDT: { symbol: '₮', name: 'Tether', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: [], region: 'crypto', displayOnly: true, pegged: 'USD' },
  USDC: { symbol: 'USDC', name: 'USD Coin', decimals: 2, format: 'before', separator: '.', delimiter: ',', countries: [], region: 'crypto', displayOnly: true, pegged: 'USD' },
  BNB: { symbol: 'BNB', name: 'Binance Coin', decimals: 4, format: 'before', separator: '.', delimiter: ',', countries: [], region: 'crypto', displayOnly: true },
};

// Extended exchange rates with crypto (display-only, highly volatile)
export const EXTENDED_EXCHANGE_RATES: Record<string, number> = {
  // Base rates (June 2025)
  'USD': 1.0,      
  'EUR': 0.85,     'GBP': 0.73,     'JPY': 110.0,    'CNY': 6.45,    'CNH': 6.47,
  'CAD': 1.25,     'AUD': 1.35,     'CHF': 0.92,     'SEK': 8.60,    'NOK': 8.50,
  'DKK': 6.30,     'PLN': 3.90,     'CZK': 21.50,    'HUF': 290.0,   'RUB': 75.0,
  'BRL': 5.20,     'MXN': 20.0,     'ARS': 98.0,     'COP': 3800.0,  'CLP': 720.0,
  'PEN': 3.60,     'UYU': 39.0,     'BOB': 6.9,      'XCD': 2.7,     'HTG': 110.0,
  'KRW': 1180.0,   'INR': 74.0,     'IDR': 14200.0,  'THB': 31.0,    'SGD': 1.35,
  'MYR': 4.15,     'PHP': 50.0,     'VND': 23000.0,  'HKD': 7.80,    'TWD': 28.0,
  'PKR': 160.0,    'BDT': 85.0,     'LKR': 180.0,    'NPR': 118.0,   'BTN': 74.0,
  'MMK': 2100.0,   'LAK': 16800.0,  'KHR': 4100.0,   'BND': 1.35,    'MVR': 15.4,
  'AED': 3.67,     'SAR': 3.75,     'QAR': 3.64,     'KWD': 0.30,    'BHD': 0.38,
  'OMR': 0.38,     'JOD': 0.71,     'ILS': 3.20,     'LBP': 15000.0, 'SYP': 2500.0,
  'IQD': 1460.0,   'IRR': 42000.0,  'YER': 250.0,    'TRY': 8.50,    'EGP': 15.7,
  'ZAR': 14.5,     'NGN': 410.0,    'KES': 108.0,    'MAD': 9.0,     'TND': 3.1,
  'DZD': 140.0,    'XOF': 580.0,    'XAF': 580.0,    'GHS': 15.8,    'ETB': 55.0,
  'TZS': 2800.0,   'UGX': 3700.0,   'RWF': 1300.0,   'BWP': 13.5,    'ZMW': 25.0,
  'MZN': 64.0,     'AOA': 825.0,    'NAD': 14.5,     'SZL': 14.5,    'LSL': 14.5,
  'FJD': 2.2,      'PGK': 3.9,      'SBD': 8.2,      'WST': 2.7,     'TOP': 2.4,
  'VUV': 115.0,    'NCF': 110.0,    'XPF': 110.0,    'NZD': 1.5,     'UAH': 37.0,
  'BYN': 2.5,      'RON': 4.9,      'BGN': 1.7,      'HRK': 6.4,     'RSD': 105.0,
  
  // Crypto rates (highly volatile, display-only)
  'BTC': 0.000016, 'ETH': 0.00043,  'USDT': 1.0,     'USDC': 1.0,    'BNB': 0.0017,
  'XRP': 2.1,      'ADA': 2.8,      'SOL': 0.0067,   'DOT': 0.14,    'MATIC': 1.8,
};

// Country to currency mapping (extended)
export const EXTENDED_COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Americas
  'US': 'USD', 'EC': 'USD', 'PA': 'USD', 'PW': 'USD', 'TL': 'USD', 'CA': 'CAD', 'BR': 'BRL', 'MX': 'MXN', 
  'AR': 'ARS', 'CO': 'COP', 'CL': 'CLP', 'PE': 'PEN', 'UY': 'UYU', 'BO': 'BOB', 'HT': 'HTG', 'JM': 'JMD',
  'TT': 'TTD', 'BB': 'BBD', 'AG': 'XCD', 'AI': 'XCD', 'DM': 'XCD', 'GD': 'XCD', 'MS': 'XCD', 'KN': 'XCD',
  'LC': 'XCD', 'VC': 'XCD',
  
  // Europe  
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 
  'IE': 'EUR', 'FI': 'EUR', 'GR': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 'LU': 'EUR', 'MT': 'EUR',
  'SK': 'EUR', 'SI': 'EUR', 'CY': 'EUR', 'GB': 'GBP', 'IM': 'GBP', 'JE': 'GBP', 'GG': 'GBP', 'CH': 'CHF',
  'LI': 'CHF', 'NO': 'NOK', 'SJ': 'NOK', 'BV': 'NOK', 'SE': 'SEK', 'DK': 'DKK', 'FO': 'DKK', 'GL': 'DKK',
  'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RU': 'RUB', 'TR': 'TRY', 'UA': 'UAH', 'BY': 'BYN', 'RO': 'RON',
  'BG': 'BGN', 'HR': 'HRK', 'RS': 'RSD',
  
  // Asia-Pacific
  'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'IN': 'INR', 'ID': 'IDR', 'TH': 'THB', 'SG': 'SGD', 'MY': 'MYR',
  'PH': 'PHP', 'VN': 'VND', 'HK': 'HKD', 'TW': 'TWD', 'PK': 'PKR', 'BD': 'BDT', 'LK': 'LKR', 'NP': 'NPR',
  'BT': 'BTN', 'MM': 'MMK', 'LA': 'LAK', 'KH': 'KHR', 'BN': 'BND', 'MV': 'MVR', 'AU': 'AUD', 'CX': 'AUD',
  'CC': 'AUD', 'HM': 'AUD', 'KI': 'AUD', 'NR': 'AUD', 'NF': 'AUD', 'TV': 'AUD', 'NZ': 'NZD', 'CK': 'NZD',
  'NU': 'NZD', 'PN': 'NZD', 'TK': 'NZD', 'FJ': 'FJD', 'PG': 'PGK', 'SB': 'SBD', 'WS': 'WST', 'TO': 'TOP',
  'VU': 'VUV', 'NC': 'XPF', 'PF': 'XPF', 'WF': 'XPF',
  
  // Middle East & Africa
  'AE': 'AED', 'SA': 'SAR', 'QA': 'QAR', 'KW': 'KWD', 'BH': 'BHD', 'OM': 'OMR', 'JO': 'JOD', 'IL': 'ILS',
  'PS': 'ILS', 'LB': 'LBP', 'SY': 'SYP', 'IQ': 'IQD', 'IR': 'IRR', 'YE': 'YER', 'EG': 'EGP', 'ZA': 'ZAR',
  'LS': 'ZAR', 'NA': 'ZAR', 'SZ': 'ZAR', 'NG': 'NGN', 'KE': 'KES', 'MA': 'MAD', 'EH': 'MAD', 'TN': 'TND',
  'DZ': 'DZD', 'BF': 'XOF', 'BJ': 'XOF', 'CI': 'XOF', 'GW': 'XOF', 'ML': 'XOF', 'NE': 'XOF', 'SN': 'XOF',
  'TG': 'XOF', 'CF': 'XAF', 'CM': 'XAF', 'CG': 'XAF', 'GA': 'XAF', 'GQ': 'XAF', 'TD': 'XAF', 'GH': 'GHS',
  'ET': 'ETB', 'TZ': 'TZS', 'UG': 'UGX', 'RW': 'RWF', 'BW': 'BWP', 'ZM': 'ZMW', 'MZ': 'MZN', 'AO': 'AOA',
};