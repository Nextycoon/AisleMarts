import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Types for Awareness Context
interface LocationContext {
  country: string;
  country_code: string;
  region: string;
  city: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  currency: string;
  language: string;
  cultural_context: Record<string, any>;
}

interface TimeContext {
  local_time: Date;
  timezone: string;
  day_of_week: string;
  is_weekend: boolean;
  is_holiday: boolean;
  business_hours: boolean;
  time_category: 'morning' | 'afternoon' | 'evening' | 'night';
  seasonal_context: 'spring' | 'summer' | 'fall' | 'winter';
}

interface UserContext {
  user_id: string;
  role: string;
  preferences: Record<string, any>;
  purchase_history: any[];
  behavioral_patterns: Record<string, any>;
  loyalty_tier: string;
  language_preference?: string;
  currency_preference?: string;
}

interface CurrencyContext {
  primary_currency: string;
  exchange_rates: Record<string, number>;
  display_dual_currency: boolean;
  secondary_currency?: string;
  local_tax_rate: number;
  payment_methods: string[];
}

interface DeviceContext {
  device_type: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  screen_size: 'small' | 'medium' | 'large';
  connection_speed: 'slow' | 'medium' | 'fast';
  capabilities: string[];
}

interface AwarenessProfile {
  session_id: string;
  user_context?: UserContext;
  location_context?: LocationContext;
  time_context?: TimeContext;
  currency_context?: CurrencyContext;
  device_context?: DeviceContext;
  language: string;
  personalization_score: number;
  last_updated: Date;
  privacy_settings: Record<string, boolean>;
}

interface AdaptiveResponse {
  ui_config: Record<string, any>;
  content_adaptations: Record<string, any>;
  pricing_adjustments: Record<string, any>;
  language_pack: Record<string, string>;
  recommendations: any[];
  notifications: any[];
}

interface AwarenessContextType {
  profile: AwarenessProfile | null;
  adaptiveResponse: AdaptiveResponse | null;
  isLoading: boolean;
  error: string | null;
  detectContext: () => Promise<void>;
  updatePreferences: (preferences: Record<string, any>) => Promise<void>;
  getLanguagePack: () => Record<string, string>;
  formatCurrency: (amount: number) => string;
  formatDateTime: (date: Date) => string;
  shouldShowFeature: (feature: string) => boolean;
  getLocalizedContent: (key: string) => string;
}

// Default language pack
const DEFAULT_LANGUAGE_PACK = {
  welcome: 'Welcome to AisleMarts',
  cart: 'Shopping Cart',
  checkout: 'Checkout',
  search: 'Search products',
  profile: 'My Profile',
  orders: 'My Orders',
  deals: "Today's Deals",
  live_sale: 'Live Sale',
  chat: 'Messages',
  currency: 'Currency',
  language: 'Language',
};

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  KES: 'KSh',
  NGN: '₦',
  ZAR: 'R',
  AED: 'د.إ',
  SAR: '﷼',
};

// Create the context
const AwarenessContext = createContext<AwarenessContextType | undefined>(undefined);

// Provider component
interface AwarenessProviderProps {
  children: ReactNode;
}

export const AwarenessProvider: React.FC<AwarenessProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<AwarenessProfile | null>(null);
  const [adaptiveResponse, setAdaptiveResponse] = useState<AdaptiveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect context on mount
  useEffect(() => {
    detectContext();
  }, []);

  const detectContext = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Detect device context
      const deviceContext = detectDeviceContext();
      
      // Detect location context
      const locationContext = await detectLocationContext();
      
      // Detect time context
      const timeContext = detectTimeContext(locationContext?.timezone || 'UTC');
      
      // Detect language
      const detectedLanguage = detectLanguage();
      
      // Load user context from storage
      const userContext = await loadUserContext();
      
      // Detect currency context
      const currencyContext = detectCurrencyContext(locationContext, userContext);
      
      // Calculate personalization score
      const personalizationScore = calculatePersonalizationScore(userContext, locationContext, timeContext);
      
      // Create awareness profile
      const awarenessProfile: AwarenessProfile = {
        session_id: `session_${Date.now()}`,
        user_context: userContext,
        location_context: locationContext,
        time_context: timeContext,
        currency_context: currencyContext,
        device_context: deviceContext,
        language: detectedLanguage,
        personalization_score: personalizationScore,
        last_updated: new Date(),
        privacy_settings: {
          location_sharing: true,
          behavioral_tracking: true,
          personalized_ads: true,
          cross_device_sync: true,
        },
      };

      setProfile(awarenessProfile);

      // Save to backend and get adaptive response
      await sendContextToBackend(awarenessProfile);
      
    } catch (err) {
      console.error('Context detection failed:', err);
      setError(err instanceof Error ? err.message : 'Context detection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const detectDeviceContext = (): DeviceContext => {
    const deviceType = Platform.OS === 'web' ? 'desktop' : 
                      Platform.isPad ? 'tablet' : 'mobile';
    
    const screenSize = deviceType === 'mobile' ? 'small' :
                      deviceType === 'tablet' ? 'medium' : 'large';

    return {
      device_type: deviceType,
      platform: Platform.OS as 'ios' | 'android' | 'web',
      screen_size: screenSize,
      connection_speed: 'medium', // Would detect from network info in production
      capabilities: ['touch', 'camera', 'location', 'notifications'],
    };
  };

  const detectLocationContext = async (): Promise<LocationContext | null> => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Fallback to locale-based detection
        return detectLocationFromLocale();
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      
      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (!address) {
        return detectLocationFromLocale();
      }

      // Map to our location context format
      return {
        country: address.country || 'Unknown',
        country_code: address.isoCountryCode || 'US',
        region: address.region || address.subregion || 'Unknown',
        city: address.city || 'Unknown',
        timezone: Localization.timezone,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        currency: getCurrencyForCountry(address.isoCountryCode || 'US'),
        language: Localization.locale.split('-')[0],
        cultural_context: {
          date_format: getDateFormatForLocale(Localization.locale),
          time_format: '24h', // Default, could be enhanced
        },
      };
    } catch (error) {
      console.error('Location detection failed:', error);
      return detectLocationFromLocale();
    }
  };

  const detectLocationFromLocale = (): LocationContext => {
    const locale = Localization.locale;
    const countryCode = locale.split('-')[1] || 'US';
    const language = locale.split('-')[0];

    return {
      country: getCountryName(countryCode),
      country_code: countryCode,
      region: 'Unknown',
      city: 'Unknown',
      timezone: Localization.timezone,
      currency: getCurrencyForCountry(countryCode),
      language: language,
      cultural_context: {
        date_format: getDateFormatForLocale(locale),
        time_format: '24h',
      },
    };
  };

  const detectTimeContext = (timezone: string): TimeContext => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const hour = now.getHours();

    let timeCategory: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeCategory = 'morning';
    else if (hour >= 12 && hour < 17) timeCategory = 'afternoon';
    else if (hour >= 17 && hour < 22) timeCategory = 'evening';
    else timeCategory = 'night';

    const month = now.getMonth();
    let seasonalContext: 'spring' | 'summer' | 'fall' | 'winter';
    if (month >= 2 && month <= 4) seasonalContext = 'spring';
    else if (month >= 5 && month <= 7) seasonalContext = 'summer';
    else if (month >= 8 && month <= 10) seasonalContext = 'fall';
    else seasonalContext = 'winter';

    return {
      local_time: now,
      timezone: timezone,
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      is_holiday: false, // Would integrate with holiday API
      business_hours: hour >= 9 && hour < 18 && !isWeekend,
      time_category: timeCategory,
      seasonal_context: seasonalContext,
    };
  };

  const detectLanguage = (): string => {
    const locale = Localization.locale;
    const language = locale.split('-')[0];
    
    // Supported languages
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'];
    
    return supportedLanguages.includes(language) ? language : 'en';
  };

  const loadUserContext = async (): Promise<UserContext | undefined> => {
    try {
      const stored = await AsyncStorage.getItem('user_context');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load user context:', error);
    }
    return undefined;
  };

  const detectCurrencyContext = (locationContext: LocationContext | null, userContext: UserContext | undefined): CurrencyContext => {
    const primaryCurrency = userContext?.currency_preference || 
                           locationContext?.currency || 
                           'USD';

    return {
      primary_currency: primaryCurrency,
      exchange_rates: {}, // Would fetch from API
      display_dual_currency: primaryCurrency !== 'USD',
      secondary_currency: primaryCurrency !== 'USD' ? 'USD' : undefined,
      local_tax_rate: 0.08, // Default, would be location-specific
      payment_methods: ['card', 'digital_wallet', 'bank_transfer'],
    };
  };

  const calculatePersonalizationScore = (
    userContext: UserContext | undefined,
    locationContext: LocationContext | null,
    timeContext: TimeContext
  ): number => {
    let score = 0;
    
    if (userContext?.purchase_history?.length) score += 0.3;
    if (userContext?.preferences && Object.keys(userContext.preferences).length > 0) score += 0.2;
    if (userContext?.behavioral_patterns && Object.keys(userContext.behavioral_patterns).length > 0) score += 0.2;
    if (locationContext) score += 0.15;
    if (timeContext) score += 0.15;
    
    return Math.min(score, 1.0);
  };

  const sendContextToBackend = async (awarenessProfile: AwarenessProfile) => {
    try {
      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
                        process.env.EXPO_PUBLIC_BACKEND_URL || 
                        'http://localhost:8001';

      // Send context to backend
      const contextResponse = await fetch(`${backendUrl}/api/awareness/detect-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`, // Would get from auth context
        },
        body: JSON.stringify(awarenessProfile),
      });

      if (contextResponse.ok) {
        const backendProfile = await contextResponse.json();
        setProfile(backendProfile);

        // Get adaptive response
        const adaptiveResponse = await fetch(
          `${backendUrl}/api/awareness/adaptive-response/${backendProfile.session_id}`,
          {
            headers: {
              'Authorization': `Bearer ${await getAuthToken()}`,
            },
          }
        );

        if (adaptiveResponse.ok) {
          const response = await adaptiveResponse.json();
          setAdaptiveResponse(response);
        }
      }
    } catch (error) {
      console.error('Failed to send context to backend:', error);
      // Continue with local profile if backend fails
    }
  };

  const updatePreferences = async (preferences: Record<string, any>) => {
    try {
      if (!profile) return;

      // Update local profile
      const updatedProfile = {
        ...profile,
        user_context: {
          ...profile.user_context!,
          preferences: { ...profile.user_context?.preferences, ...preferences },
        },
        last_updated: new Date(),
      };

      if (preferences.language) {
        updatedProfile.language = preferences.language;
      }

      setProfile(updatedProfile);

      // Save to AsyncStorage
      await AsyncStorage.setItem('user_context', JSON.stringify(updatedProfile.user_context));

      // Update backend
      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
                        process.env.EXPO_PUBLIC_BACKEND_URL || 
                        'http://localhost:8001';

      await fetch(`${backendUrl}/api/awareness/update-preferences/${profile.session_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify(preferences),
      });

    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const getLanguagePack = (): Record<string, string> => {
    return adaptiveResponse?.language_pack || DEFAULT_LANGUAGE_PACK;
  };

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency_context?.primary_currency || 'USD';
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDateTime = (date: Date): string => {
    const locale = profile?.language === 'en' ? 'en-US' : profile?.language || 'en-US';
    const timeFormat = profile?.location_context?.cultural_context?.time_format === '12h' ? 
      { hour12: true } : { hour12: false };
    
    return date.toLocaleString(locale, {
      ...timeFormat,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shouldShowFeature = (feature: string): boolean => {
    const config = adaptiveResponse?.ui_config;
    if (!config) return true;
    
    // Feature visibility logic based on context
    if (feature === 'live_sale' && profile?.time_context?.time_category === 'night') {
      return false; // Don't show live sales at night
    }
    
    return config[`show_${feature}`] !== false;
  };

  const getLocalizedContent = (key: string): string => {
    const languagePack = getLanguagePack();
    return languagePack[key] || key;
  };

  // Helper functions
  const getAuthToken = async (): Promise<string> => {
    try {
      return await AsyncStorage.getItem('auth_token') || '';
    } catch {
      return '';
    }
  };

  const getCurrencyForCountry = (countryCode: string): string => {
    const currencyMap: Record<string, string> = {
      US: 'USD', GB: 'GBP', JP: 'JPY', CA: 'CAD', AU: 'AUD',
      CN: 'CNY', IN: 'INR', BR: 'BRL', MX: 'MXN', KE: 'KES',
      NG: 'NGN', ZA: 'ZAR', AE: 'AED', SA: 'SAR',
      // EU countries
      DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
    };
    return currencyMap[countryCode] || 'USD';
  };

  const getCountryName = (countryCode: string): string => {
    const countryNames: Record<string, string> = {
      US: 'United States', GB: 'United Kingdom', JP: 'Japan',
      CA: 'Canada', AU: 'Australia', CN: 'China', IN: 'India',
      BR: 'Brazil', MX: 'Mexico', KE: 'Kenya', NG: 'Nigeria',
      ZA: 'South Africa', AE: 'United Arab Emirates', SA: 'Saudi Arabia',
      DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain',
    };
    return countryNames[countryCode] || 'Unknown';
  };

  const getDateFormatForLocale = (locale: string): string => {
    if (locale.startsWith('en-US')) return 'MM/DD/YYYY';
    if (locale.startsWith('ja')) return 'YYYY/MM/DD';
    return 'DD/MM/YYYY'; // Default for most locales
  };

  const contextValue: AwarenessContextType = {
    profile,
    adaptiveResponse,
    isLoading,
    error,
    detectContext,
    updatePreferences,
    getLanguagePack,
    formatCurrency,
    formatDateTime,
    shouldShowFeature,
    getLocalizedContent,
  };

  return (
    <AwarenessContext.Provider value={contextValue}>
      {children}
    </AwarenessContext.Provider>
  );
};

// Hook to use the awareness context
export const useAwareness = (): AwarenessContextType => {
  const context = useContext(AwarenessContext);
  if (context === undefined) {
    throw new Error('useAwareness must be used within an AwarenessProvider');
  }
  return context;
};

// Higher-order component for awareness-aware components
export const withAwareness = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const awareness = useAwareness();
    return <Component {...props} awareness={awareness} />;
  };
};

export type { AwarenessProfile, AdaptiveResponse, AwarenessContextType };