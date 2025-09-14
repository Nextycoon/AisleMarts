/**
 * AisleMarts Localization Service - Frontend
 * Handles automatic localization, currency display, and language preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

// Get backend URL from env
const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_BACKEND_URL || 'http://localhost:8001';

export interface LocalizationData {
  country_code: string;
  country_name: string;
  currency: string;
  currency_symbol: string;
  currency_name: string;
  language: string;
  city?: string;
  region?: string;
  ip: string;
}

export interface CurrencyConversion {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
  conversion_rate: number;
  original_amount?: number;
  original_currency?: string;
}

export interface SupportedCountry {
  currency: string;
  symbol: string;
  name: string;
  language: string;
}

class LocalizationService {
  private localizationData: LocalizationData | null = null;
  private supportedCountries: Record<string, SupportedCountry> = {};
  
  // Cache keys
  private readonly LOCALIZATION_CACHE_KEY = '@aislemarts_localization';
  private readonly CURRENCY_PREFERENCE_KEY = '@aislemarts_currency_preference';
  private readonly LANGUAGE_PREFERENCE_KEY = '@aislemarts_language_preference';
  
  constructor() {
    this.loadCachedData();
  }

  /**
   * Load cached localization data and preferences
   */
  private async loadCachedData(): Promise<void> {
    try {
      const cachedData = await AsyncStorage.getItem(this.LOCALIZATION_CACHE_KEY);
      if (cachedData) {
        this.localizationData = JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error loading cached localization data:', error);
    }
  }

  /**
   * Auto-detect user's location and preferences
   */
  async detectUserLocalization(): Promise<LocalizationData> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/localization/detect`);
      
      if (response.data) {
        this.localizationData = response.data;
        
        // Cache the data
        await AsyncStorage.setItem(
          this.LOCALIZATION_CACHE_KEY, 
          JSON.stringify(this.localizationData)
        );
        
        console.log('Localization detected:', this.localizationData);
        return this.localizationData;
      }
    } catch (error) {
      console.error('Error detecting localization:', error);
    }
    
    // Fallback to Kenya (pilot market)
    const fallbackData: LocalizationData = {
      country_code: 'KE',
      country_name: 'Kenya',
      currency: 'KES',
      currency_symbol: 'KSh',
      currency_name: 'Kenyan Shilling',
      language: 'en',
      ip: 'unknown'
    };
    
    this.localizationData = fallbackData;
    return fallbackData;
  }

  /**
   * Get current localization data (cached or detect if not available)
   */
  async getCurrentLocalization(): Promise<LocalizationData> {
    if (this.localizationData) {
      return this.localizationData;
    }
    
    return await this.detectUserLocalization();
  }

  /**
   * Convert price to user's preferred currency
   */
  async convertPrice(
    amount: number, 
    fromCurrency: string, 
    toCurrency?: string
  ): Promise<CurrencyConversion> {
    try {
      // Use user's current currency if not specified
      if (!toCurrency) {
        const localization = await this.getCurrentLocalization();
        toCurrency = await this.getPreferredCurrency() || localization.currency;
      }
      
      const response = await axios.post(`${BACKEND_URL}/api/localization/convert-currency`, {
        amount,
        from_currency: fromCurrency,
        to_currency: toCurrency
      });
      
      return response.data;
    } catch (error) {
      console.error('Error converting currency:', error);
      
      // Fallback conversion (basic estimation)
      const localization = await this.getCurrentLocalization();
      return {
        amount: amount,
        currency: localization.currency,
        symbol: localization.currency_symbol,
        formatted: `${localization.currency_symbol}${amount.toFixed(2)}`,
        conversion_rate: 1.0
      };
    }
  }

  /**
   * Format price in user's currency
   */
  async formatPrice(amount: number, currency?: string): Promise<string> {
    try {
      const localization = await this.getCurrentLocalization();
      const targetCurrency = currency || localization.currency;
      
      if (targetCurrency === localization.currency) {
        return `${localization.currency_symbol}${amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
      
      // Convert if different currency
      const conversion = await this.convertPrice(amount, 'USD', targetCurrency);
      return conversion.formatted;
    } catch (error) {
      console.error('Error formatting price:', error);
      return `$${amount.toFixed(2)}`;
    }
  }

  /**
   * Get localized greeting for Aisle AI
   */
  async getLocalizedGreeting(): Promise<string> {
    try {
      const localization = await this.getCurrentLocalization();
      const language = await this.getPreferredLanguage() || localization.language;
      
      const response = await axios.get(
        `${BACKEND_URL}/api/localization/greeting/${localization.country_code}?language=${language}`
      );
      
      return response.data.greeting;
    } catch (error) {
      console.error('Error getting localized greeting:', error);
      return "Welcome to AisleMarts! 🌍 I'm Aisle, your global shopping companion ready to help you discover amazing products worldwide.";
    }
  }

  /**
   * Get supported countries
   */
  async getSupportedCountries(): Promise<Record<string, SupportedCountry>> {
    try {
      if (Object.keys(this.supportedCountries).length === 0) {
        const response = await axios.get(`${BACKEND_URL}/api/localization/supported-countries`);
        this.supportedCountries = response.data.countries;
      }
      
      return this.supportedCountries;
    } catch (error) {
      console.error('Error getting supported countries:', error);
      return {};
    }
  }

  /**
   * Set user's preferred currency
   */
  async setPreferredCurrency(currency: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CURRENCY_PREFERENCE_KEY, currency);
      console.log('Currency preference set:', currency);
    } catch (error) {
      console.error('Error setting currency preference:', error);
    }
  }

  /**
   * Get user's preferred currency
   */
  async getPreferredCurrency(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.CURRENCY_PREFERENCE_KEY);
    } catch (error) {
      console.error('Error getting currency preference:', error);
      return null;
    }
  }

  /**
   * Set user's preferred language
   */
  async setPreferredLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.LANGUAGE_PREFERENCE_KEY, language);
      console.log('Language preference set:', language);
    } catch (error) {
      console.error('Error setting language preference:', error);
    }
  }

  /**
   * Get user's preferred language
   */
  async getPreferredLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.LANGUAGE_PREFERENCE_KEY);
    } catch (error) {
      console.error('Error getting language preference:', error);
      return null;
    }
  }

  /**
   * Check if country is supported
   */
  async isCountrySupported(countryCode: string): Promise<boolean> {
    const countries = await this.getSupportedCountries();
    return countryCode in countries;
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/localization/exchange-rate/${fromCurrency}/${toCurrency}`
      );
      
      return response.data.rate;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return 1.0;
    }
  }

  /**
   * Get currency info
   */
  async getCurrencyInfo(currencyCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/localization/currency-info/${currencyCode}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting currency info:', error);
      return {
        currency_code: currencyCode,
        currency: currencyCode,
        symbol: '$',
        name: 'Unknown Currency'
      };
    }
  }

  /**
   * Clear cached data (useful for testing or user logout)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.LOCALIZATION_CACHE_KEY,
        this.CURRENCY_PREFERENCE_KEY,
        this.LANGUAGE_PREFERENCE_KEY
      ]);
      
      this.localizationData = null;
      this.supportedCountries = {};
      
      console.log('Localization cache cleared');
    } catch (error) {
      console.error('Error clearing localization cache:', error);
    }
  }

  /**
   * Get country flag emoji
   */
  getCountryFlag(countryCode: string): string {
    const flagMap: Record<string, string> = {
      'KE': '🇰🇪', 'NG': '🇳🇬', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'MA': '🇲🇦',
      'IT': '🇮🇹', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'GB': '🇬🇧',
      'TR': '🇹🇷', 'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷',
      'IN': '🇮🇳', 'CN': '🇨🇳', 'JP': '🇯🇵', 'AE': '🇦🇪', 'SA': '🇸🇦'
    };
    
    return flagMap[countryCode] || '🌍';
  }

  /**
   * Get localized AisleMarts branding
   */
  async getLocalizedBranding(): Promise<{title: string, subtitle: string}> {
    const localization = await this.getCurrentLocalization();
    const flag = this.getCountryFlag(localization.country_code);
    
    return {
      title: `AisleMarts ${localization.country_name}`,
      subtitle: `Global Marketplace • Local Power ${flag}`
    };
  }
}

// Export singleton instance
export const localizationService = new LocalizationService();
export default localizationService;