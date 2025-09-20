import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { COUNTRY_TO_CURRENCY } from './regionMaps';

// Auto-detect user location and currency
export const detectUserLocation = async (): Promise<string> => {
  try {
    // Try GPS location first (best accuracy)
    const gpsCountry = await detectByGPS();
    if (gpsCountry) {
      console.log(`🌍 Currency-Infinity Engine: GPS detected country: ${gpsCountry}`);
      return gpsCountry;
    }
    
    // Fallback to locale-based detection
    const localeCountry = detectByLocale();
    console.log(`🌐 Currency-Infinity Engine: Locale detected country: ${localeCountry}`);
    return localeCountry;
  } catch (error) {
    console.warn('Location detection failed, using fallback:', error);
    return 'US'; // Ultimate fallback
  }
};

async function detectByGPS(): Promise<string | null> {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return null;
    }
    
    // Get current location with timeout
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000, // 10 second timeout
    });
    
    // Reverse geocode to get country
    const geocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    
    if (geocode && geocode.length > 0) {
      const countryCode = geocode[0].isoCountryCode?.toUpperCase();
      if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
        return countryCode;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('GPS location detection failed:', error);
    return null;
  }
}

function detectByLocale(): string {
  // Get device locale information
  const locale = Localization.locale;
  const region = Localization.region;
  
  console.log(`📱 Device locale: ${locale}, region: ${region}`);
  
  // Try region first
  if (region && COUNTRY_TO_CURRENCY[region.toUpperCase()]) {
    return region.toUpperCase();
  }
  
  // Extract country from locale (e.g., "en-US" -> "US")
  if (locale) {
    const parts = locale.split(/[-_]/);
    if (parts.length > 1) {
      const countryCode = parts[1].toUpperCase();
      if (COUNTRY_TO_CURRENCY[countryCode]) {
        return countryCode;
      }
    }
    
    // Try language-based mapping
    const languageCode = parts[0].toLowerCase();
    const languageToCountry = getLanguageToCountryMapping();
    if (languageToCountry[languageCode]) {
      return languageToCountry[languageCode];
    }
  }
  
  // Final fallback
  return 'US';
}

function getLanguageToCountryMapping(): Record<string, string> {
  return {
    'en': 'US', 'fr': 'FR', 'de': 'DE', 'es': 'ES', 'pt': 'BR', 'it': 'IT',
    'ru': 'RU', 'ja': 'JP', 'ko': 'KR', 'zh': 'CN', 'ar': 'SA', 'hi': 'IN',
    'th': 'TH', 'vi': 'VN', 'id': 'ID', 'tr': 'TR', 'he': 'IL', 'sv': 'SE',
    'no': 'NO', 'da': 'DK', 'fi': 'FI', 'pl': 'PL', 'cs': 'CZ', 'hu': 'HU',
    'nl': 'NL', 'ms': 'MY', 'tl': 'PH', 'uk': 'UA', 'bg': 'BG', 'hr': 'HR',
    'sk': 'SK', 'sl': 'SI', 'et': 'EE', 'lv': 'LV', 'lt': 'LT',
  };
}

// Get currency for country
export const getCurrencyForCountry = (countryCode: string): string => {
  return COUNTRY_TO_CURRENCY[countryCode] || 'USD';
};

// Get current user currency (with caching)
let cachedUserCurrency: string | null = null;

export const getUserCurrency = async (): Promise<string> => {
  try {
    // Auto-detect based on location
    const country = await detectUserLocation();
    const currency = getCurrencyForCountry(country);
    
    // Cache the result
    cachedUserCurrency = currency;
    
    console.log(`🌍 Currency-Infinity Engine: Auto-detected ${currency} for ${country}`);
    return currency;
  } catch (error) {
    console.error('Currency detection failed:', error);
    cachedUserCurrency = 'USD';
    return 'USD';
  }
};