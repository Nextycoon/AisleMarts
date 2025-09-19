# 💱 **AisleMarts Currency & Location Adapter Documentation**

## 🎯 **Overview**

The Currency & Location Adapter is a sophisticated system that automatically detects user location and provides seamless currency conversion, regional pricing, tax calculation, and location-aware commerce features for the AisleMarts luxury platform.

---

## 🌍 **Location Detection System**

### **Multi-Tier Location Detection**
```typescript
interface LocationDetectionStrategy {
  primary: 'gps_coordinates';
  secondary: 'ip_geolocation';
  tertiary: 'browser_locale';
  fallback: 'user_input';
}

interface LocationContext {
  country: string;
  country_code: string; // ISO 3166-1 alpha-2
  region: string;
  city: string;
  timezone: string; // IANA timezone identifier
  latitude?: number;
  longitude?: number;
  currency: string; // ISO 4217 currency code
  language: string; // ISO 639-1 language code
  cultural_context: CulturalSettings;
}
```

### **GPS-Based Location Detection**
```typescript
class PreciseLocationDetector {
  async detectLocation(): Promise<LocationContext> {
    try {
      // Request high-accuracy location
      const position = await navigator.geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      });
      
      // Reverse geocoding for detailed address
      const address = await this.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      );
      
      return this.buildLocationContext(address, position.coords);
    } catch (error) {
      return this.fallbackToIPLocation();
    }
  }
  
  private async reverseGeocode(lat: number, lon: number): Promise<Address> {
    // Integration with multiple geocoding services for reliability
    const services = [
      'nominatim', 'google_geocoding', 'mapbox_geocoding'
    ];
    
    for (const service of services) {
      try {
        return await this.callGeocodingService(service, lat, lon);
      } catch (error) {
        console.warn(`Geocoding service ${service} failed:`, error);
      }
    }
    
    throw new Error('All geocoding services failed');
  }
}
```

### **IP-Based Location Fallback**
```typescript
class IPLocationDetector {
  private readonly IP_SERVICES = [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/',
    'https://ipinfo.io/json'
  ];
  
  async detectLocationFromIP(): Promise<LocationContext> {
    for (const service of this.IP_SERVICES) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        return {
          country: data.country_name || data.country,
          country_code: data.country_code || data.countryCode,
          region: data.region || data.regionName,
          city: data.city,
          timezone: data.timezone,
          latitude: parseFloat(data.latitude || data.lat),
          longitude: parseFloat(data.longitude || data.lon),
          currency: this.getCurrencyForCountry(data.country_code),
          language: this.getLanguageForCountry(data.country_code),
          cultural_context: this.getCulturalContext(data.country_code)
        };
      } catch (error) {
        console.warn(`IP service ${service} failed:`, error);
      }
    }
    
    return this.getDefaultLocation();
  }
}
```

---

## 💰 **Currency Management System**

### **Comprehensive Currency Support**
```typescript
interface CurrencyConfiguration {
  code: string; // ISO 4217
  symbol: string;
  name: string;
  decimal_places: number;
  symbol_position: 'before' | 'after';
  thousands_separator: string;
  decimal_separator: string;
  rtl_support: boolean;
}

const SUPPORTED_CURRENCIES: Record<string, CurrencyConfiguration> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimal_places: 2,
    symbol_position: 'before',
    thousands_separator: ',',
    decimal_separator: '.',
    rtl_support: false
  },
  EUR: {
    code: 'EUR', 
    symbol: '€',
    name: 'Euro',
    decimal_places: 2,
    symbol_position: 'after',
    thousands_separator: '.',
    decimal_separator: ',',
    rtl_support: false
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    decimal_places: 2,
    symbol_position: 'after', 
    thousands_separator: ',',
    decimal_separator: '.',
    rtl_support: true
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimal_places: 0,
    symbol_position: 'before',
    thousands_separator: ',',
    decimal_separator: '.',
    rtl_support: false
  }
  // ... additional currencies
};
```

### **Real-Time Exchange Rate System**
```typescript
class ExchangeRateManager {
  private readonly RATE_PROVIDERS = [
    'exchangerate-api.com',
    'fixer.io',
    'openexchangerates.org'
  ];
  
  private rateCache = new Map<string, ExchangeRateData>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  async getExchangeRates(baseCurrency: string): Promise<ExchangeRates> {
    const cacheKey = `rates_${baseCurrency}`;
    const cached = this.rateCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rates;
    }
    
    try {
      const rates = await this.fetchFreshRates(baseCurrency);
      this.rateCache.set(cacheKey, {
        rates,
        timestamp: Date.now()
      });
      return rates;
    } catch (error) {
      console.error('Exchange rate fetch failed:', error);
      return cached?.rates || this.getFallbackRates(baseCurrency);
    }
  }
  
  private async fetchFreshRates(baseCurrency: string): Promise<ExchangeRates> {
    for (const provider of this.RATE_PROVIDERS) {
      try {
        return await this.callRateProvider(provider, baseCurrency);  
      } catch (error) {
        console.warn(`Rate provider ${provider} failed:`, error);
      }
    }
    
    throw new Error('All exchange rate providers failed');
  }
  
  convertAmount(
    amount: number,
    fromCurrency: string, 
    toCurrency: string,
    rates: ExchangeRates
  ): number {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = rates[toCurrency] / rates[fromCurrency];
    return parseFloat((amount * rate).toFixed(SUPPORTED_CURRENCIES[toCurrency].decimal_places));
  }
}
```

### **Smart Currency Display**
```typescript
class CurrencyFormatter {
  formatCurrency(
    amount: number,
    currencyCode: string,
    locale?: string
  ): string {
    const config = SUPPORTED_CURRENCIES[currencyCode];
    if (!config) throw new Error(`Unsupported currency: ${currencyCode}`);
    
    const formattedAmount = this.formatNumber(
      amount,
      config.decimal_places,
      config.thousands_separator,
      config.decimal_separator
    );
    
    if (config.symbol_position === 'before') {
      return `${config.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${config.symbol}`;
    }
  }
  
  formatDualCurrency(
    amount: number,
    primaryCurrency: string,
    secondaryCurrency: string,
    exchangeRate: number
  ): string {
    const primaryFormatted = this.formatCurrency(amount, primaryCurrency);
    const convertedAmount = amount * exchangeRate;
    const secondaryFormatted = this.formatCurrency(convertedAmount, secondaryCurrency);
    
    return `${primaryFormatted} (${secondaryFormatted})`;
  }
  
  private formatNumber(
    value: number,
    decimals: number,
    thousandsSep: string,
    decimalSep: string
  ): string {
    const fixed = value.toFixed(decimals);
    const parts = fixed.split('.');
    
    // Add thousands separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    
    return parts.join(decimalSep);
  }
}
```

---

## 🏛️ **Regional Tax & Compliance System**

### **Tax Calculation Engine**
```typescript
interface TaxConfiguration {
  country_code: string;
  tax_type: 'VAT' | 'GST' | 'Sales_Tax' | 'None';
  standard_rate: number;
  luxury_rate?: number;
  digital_services_rate?: number;
  exemptions: string[];
  tax_inclusive_display: boolean;
}

const TAX_CONFIGURATIONS: Record<string, TaxConfiguration> = {
  US: {
    country_code: 'US',
    tax_type: 'Sales_Tax',
    standard_rate: 0.08, // Varies by state
    luxury_rate: 0.10,
    exemptions: ['food', 'medicine'],
    tax_inclusive_display: false
  },
  GB: {
    country_code: 'GB', 
    tax_type: 'VAT',
    standard_rate: 0.20,
    luxury_rate: 0.20,
    digital_services_rate: 0.20,
    exemptions: ['books', 'children_clothing'],
    tax_inclusive_display: true
  },
  AE: {
    country_code: 'AE',
    tax_type: 'VAT', 
    standard_rate: 0.05,
    luxury_rate: 0.05,
    exemptions: ['education', 'healthcare'],
    tax_inclusive_display: false
  }
};

class TaxCalculator {
  calculateTax(
    amount: number,
    productCategory: string,
    locationContext: LocationContext
  ): TaxCalculation {
    const taxConfig = TAX_CONFIGURATIONS[locationContext.country_code];
    
    if (!taxConfig || taxConfig.tax_type === 'None') {
      return {
        base_amount: amount,
        tax_amount: 0,
        total_amount: amount,
        tax_rate: 0,
        tax_type: 'None'
      };
    }
    
    // Check for exemptions
    if (taxConfig.exemptions.includes(productCategory)) {
      return {
        base_amount: amount,
        tax_amount: 0,
        total_amount: amount,
        tax_rate: 0,
        tax_type: taxConfig.tax_type,
        exemption_reason: productCategory
      };
    }
    
    // Determine applicable tax rate
    const taxRate = this.getTaxRate(productCategory, taxConfig);
    const taxAmount = amount * taxRate;
    
    return {
      base_amount: amount,
      tax_amount: taxAmount,
      total_amount: amount + taxAmount,
      tax_rate: taxRate,
      tax_type: taxConfig.tax_type
    };
  }
  
  private getTaxRate(category: string, config: TaxConfiguration): number {
    if (category === 'luxury' && config.luxury_rate) {
      return config.luxury_rate;
    }
    if (category === 'digital' && config.digital_services_rate) {
      return config.digital_services_rate;
    }
    return config.standard_rate;
  }
}
```

---

## 🚚 **Location-Aware Logistics**

### **Shipping & Delivery Options**
```typescript
interface ShippingOption {
  id: string;
  name: string;
  description: string;
  estimated_days: number;
  cost: number;
  currency: string;
  available_countries: string[];
  luxury_service: boolean;
  tracking_available: boolean;
  insurance_included: boolean;
}

class LocationBasedLogistics {
  async getShippingOptions(
    destination: LocationContext,
    orderValue: number,
    productCategories: string[]
  ): Promise<ShippingOption[]> {
    const countryCode = destination.country_code;
    const baseOptions = await this.getBaseShippingOptions(countryCode);
    
    // Filter and enhance options based on location and order details
    return baseOptions
      .filter(option => option.available_countries.includes(countryCode))
      .map(option => this.enhanceShippingOption(option, destination, orderValue))
      .sort((a, b) => a.estimated_days - b.estimated_days);
  }
  
  private enhanceShippingOption(
    option: ShippingOption,
    destination: LocationContext,
    orderValue: number
  ): ShippingOption {
    const enhanced = { ...option };
    
    // Apply free shipping thresholds
    if (orderValue >= this.getFreeShippingThreshold(destination.country_code)) {
      enhanced.cost = 0;
      enhanced.name += ' (Free)';
    }
    
    // Add luxury services for premium locations
    if (this.isPremiumLocation(destination) && orderValue >= 500) {
      enhanced.luxury_service = true;
      enhanced.description += ' | White-glove delivery available';
    }
    
    // Adjust delivery time for remote locations
    if (this.isRemoteLocation(destination)) {
      enhanced.estimated_days += 2;
    }
    
    return enhanced;
  }
  
  private getFreeShippingThreshold(countryCode: string): number {
    const thresholds: Record<string, number> = {
      'US': 100,
      'GB': 75,
      'EU': 80,
      'AE': 200,
      'JP': 150,
      'AU': 120
    };
    
    return thresholds[countryCode] || 100;
  }
}
```

### **Local Fulfillment Centers**
```typescript
interface FulfillmentCenter {
  id: string;
  location: LocationContext;
  inventory_categories: string[];
  service_areas: string[];
  luxury_services: boolean;
  same_day_delivery: boolean;
  operating_hours: {
    timezone: string;
    schedule: Record<string, { open: string; close: string }>;
  };
}

class FulfillmentOptimizer {
  async findOptimalFulfillment(
    destination: LocationContext,
    products: Product[]
  ): Promise<FulfillmentPlan> {
    const availableCenters = await this.getAvailableCenters(destination);
    const productRequirements = this.analyzeProducts(products);
    
    return this.optimizeFulfillment(
      availableCenters,
      productRequirements,
      destination
    );
  }
  
  private calculateDeliveryTime(
    center: FulfillmentCenter,
    destination: LocationContext
  ): number {
    const distance = this.calculateDistance(
      center.location,
      destination
    );
    
    // Base delivery time calculation
    if (distance <= 50) return 1; // Same day possible
    if (distance <= 200) return 2; // Next day
    if (distance <= 500) return 3; // 2-3 days
    return 5; // Standard shipping
  }
}
```

---

## 🌐 **Cultural & Regional Adaptations**

### **Cultural Commerce Rules**
```typescript
interface CulturalAdaptations {
  business_hours: {
    standard: { open: string; close: string };
    friday?: { open: string; close: string }; // Islamic countries
    saturday?: { open: string; close: string }; // Jewish sabbath consideration
  };
  holiday_calendar: string[]; // Country-specific holidays
  payment_preferences: string[]; // Preferred payment methods
  customer_service_style: 'formal' | 'casual' | 'hierarchical';
  gift_wrapping_customs: GiftWrapRules;
  return_policy_adjustments: ReturnRules;
}

const CULTURAL_ADAPTATIONS: Record<string, CulturalAdaptations> = {
  AE: {
    business_hours: {
      standard: { open: '09:00', close: '21:00' },
      friday: { open: '14:00', close: '21:00' } // After Friday prayers
    },
    holiday_calendar: ['ramadan', 'eid_fitr', 'eid_adha', 'national_day'],
    payment_preferences: ['card', 'cash_on_delivery', 'bank_transfer'],
    customer_service_style: 'formal',
    gift_wrapping_customs: {
      avoid_colors: ['black'],
      preferred_colors: ['gold', 'silver', 'blue'],
      include_message: true
    },
    return_policy_adjustments: {
      extended_ramadan: true, // Extended return period during Ramadan
      cultural_sensitivity: true
    }
  },
  JP: {
    business_hours: {
      standard: { open: '10:00', close: '20:00' }
    },
    holiday_calendar: ['golden_week', 'obon', 'new_year'],
    payment_preferences: ['card', 'konbini', 'bank_transfer'],
    customer_service_style: 'hierarchical',
    gift_wrapping_customs: {
      meticulous_wrapping: true,
      seasonal_themes: true,
      business_card_exchange: true
    },
    return_policy_adjustments: {
      quality_focused: true,
      detailed_reasons_required: true
    }
  }
};
```

### **Language & Localization Integration**
```typescript
class LocalizationAdapter {
  async adaptForRegion(
    content: any,
    locationContext: LocationContext
  ): Promise<LocalizedContent> {
    const adaptations = CULTURAL_ADAPTATIONS[locationContext.country_code];
    
    return {
      currency_display: this.adaptCurrencyDisplay(content, locationContext),
      date_formats: this.adaptDatesForRegion(content, locationContext),
      business_hours: this.adaptBusinessHours(adaptations?.business_hours),
      payment_options: this.filterPaymentMethods(
        content.payment_options,
        adaptations?.payment_preferences
      ),
      cultural_messaging: this.adaptMessaging(
        content.messages,
        adaptations?.customer_service_style
      )
    };
  }
  
  private adaptCurrencyDisplay(
    content: any,
    location: LocationContext
  ): CurrencyDisplayRules {
    const currency = SUPPORTED_CURRENCIES[location.currency];
    
    return {
      primary_currency: location.currency,
      symbol_position: currency.symbol_position,
      decimal_places: currency.decimal_places,
      rtl_support: currency.rtl_support,
      dual_display: location.currency !== 'USD'
    };
  }
}
```

---

## 📊 **Analytics & Optimization**

### **Location-Based Performance Metrics**
```typescript
interface LocationAnalytics {
  region: string;
  conversion_rate: number;
  average_order_value: number;
  preferred_currencies: Record<string, number>;
  shipping_preferences: Record<string, number>;
  payment_method_usage: Record<string, number>;
  return_rates: number;
  customer_satisfaction: number;
  tax_compliance_score: number;
}

class LocationPerformanceAnalyzer {
  async analyzeRegionalPerformance(
    timeframe: string
  ): Promise<LocationAnalytics[]> {
    const regions = await this.getActiveRegions();
    
    return Promise.all(
      regions.map(region => this.analyzeRegion(region, timeframe))
    );
  }
  
  async optimizeForRegion(
    countryCode: string,
    analytics: LocationAnalytics
  ): Promise<OptimizationRecommendations> {
    return {
      currency_recommendations: this.analyzeCurrencyPerformance(analytics),
      shipping_optimizations: this.analyzeShippingPreferences(analytics),
      tax_display_recommendations: this.analyzeTaxPreferences(analytics),
      payment_method_priorities: this.analyzePaymentUsage(analytics),
      cultural_adaptations: this.recommendCulturalChanges(analytics)
    };
  }
}
```

---

## 🔐 **Privacy & Compliance**

### **GDPR/Privacy Compliance**
```typescript
interface LocationPrivacySettings {
  precise_location: boolean;
  ip_location: boolean;
  location_history: boolean;
  cross_border_data: boolean;
  marketing_location_use: boolean;
}

class LocationPrivacyManager {
  async requestLocationPermissions(): Promise<LocationPermissionStatus> {
    const permissions: LocationPrivacySettings = {
      precise_location: false,
      ip_location: true, // Default for basic functionality
      location_history: false,
      cross_border_data: false,
      marketing_location_use: false
    };
    
    // Request user consent for each level
    return this.requestConsentFlow(permissions);
  }
  
  async anonymizeLocationData(
    locationData: LocationContext
  ): Promise<AnonymizedLocation> {
    return {
      country_code: locationData.country_code,
      currency: locationData.currency,
      timezone: locationData.timezone,
      // Remove precise coordinates and city-level data
      approximate_region: this.approximateRegion(locationData)
    };
  }
}
```

---

## 🚀 **Future Enhancements**

### **Planned Features**
1. **AI-Powered Location Prediction**: Anticipate user location changes
2. **Blockchain Currency Support**: Cryptocurrency integration
3. **Real-Time Regulatory Updates**: Automatic compliance adjustments  
4. **Micro-Location Services**: Store-level location awareness
5. **Cross-Border Tax Optimization**: Automatic duty and tax calculations

### **Advanced Location Services**
- **Weather-Based Adaptations**: Product recommendations based on local weather
- **Event-Aware Commerce**: Location-based event integration
- **Traffic-Optimized Delivery**: Real-time delivery route optimization
- **Geo-Fenced Promotions**: Location-triggered special offers

---

**🌊 Blue Wave Commander Classification: LUXURY-COMMERCE-LOCATION-CURRENCY-CORE**