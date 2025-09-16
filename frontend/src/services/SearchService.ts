/**
 * Enhanced Search Service
 * Frontend service layer for Universal AI Commerce Engine Phase 1
 * Integrates with /v1/search and /v1/products/{id}/offers APIs
 */
import { API as client } from '../api/client';

// ============= TYPESCRIPT INTERFACES =============

export interface BestPick {
  offer_id: string;
  price_minor: number;
  currency: string;
  score: number;
  reasons: ('price' | 'trust' | 'eta' | 'cultural_fit' | 'stock')[];
  explanation: string;
}

export interface Merchant {
  id: string;
  name: string;
  type: 'retail' | 'wholesale' | 'factory' | 'farm';
  trust_score: number;
  country?: string;
  verification_status: 'pending' | 'verified' | 'suspended';
}

export interface Offer {
  id: string;
  merchant: Merchant;
  price_minor: number;
  currency: string;
  delivery_days: number;
  stock: number;
  condition: 'new' | 'used' | 'refurbished';
  attrs: Record<string, string>;
  last_seen_at: string;
}

export interface SearchResult {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    brand?: string;
    category_id?: string;
    [key: string]: any;
  };
  best_pick: BestPick;
  offers_count: number;
  dedup_info?: Record<string, string>;
}

export interface SearchResponse {
  query: string;
  mode: 'retail' | 'b2b' | 'all';
  results: SearchResult[];
  page: number;
  limit: number;
  total: number;
  filters_applied: Record<string, string>;
}

export interface OffersResponse {
  product_id: string;
  offers: Offer[];
  total_offers: number;
  dedup_clusters: Record<string, string[]>;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'brand';
  highlight: string;
}

export interface SearchSuggestionsResponse {
  query: string;
  suggestions: SearchSuggestion[];
  language: string;
}

export interface SearchHealthResponse {
  status: string;
  timestamp: string;
  database: {
    products: number;
    merchants: number;
    offers: number;
    locations: number;
  };
  cache: {
    hits: number;
    misses: number;
    hit_rate: number;
    redis_connected: boolean;
  };
  features: {
    multilingual_search: boolean;
    best_pick_scoring: boolean;
    offer_deduplication: boolean;
    redis_caching: boolean;
  };
  supported_languages: string[];
  supported_modes: string[];
}

// ============= SEARCH PARAMETERS =============

export interface SearchParams {
  q: string;
  mode?: 'retail' | 'b2b' | 'all';
  lang?: 'en' | 'sw' | 'ar' | 'tr' | 'fr';
  lat?: number;
  lon?: number;
  page?: number;
  limit?: number;
  image?: string;
  barcode?: string;
}

export interface SuggestionsParams {
  q: string;
  lang?: 'en' | 'sw' | 'ar' | 'tr' | 'fr';
  limit?: number;
}

// ============= SEARCH SERVICE CLASS =============

export class SearchService {
  private baseUrl = '/v1';

  /**
   * Get search system health status
   */
  async getHealth(): Promise<SearchHealthResponse> {
    try {
      const response = await client.get(`${this.baseUrl}/search/health`);
      return response.data;
    } catch (error) {
      console.error('Search health check failed:', error);
      throw new Error('Failed to get search system health');
    }
  }

  /**
   * Enhanced product search with multilingual support and Best Pick scoring
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    try {
      // Validate required parameters
      if (!params.q || params.q.trim().length === 0) {
        throw new Error('Search query cannot be empty');
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.q.trim());
      
      if (params.mode) queryParams.append('mode', params.mode);
      if (params.lang) queryParams.append('lang', params.lang);
      if (params.lat !== undefined) queryParams.append('lat', params.lat.toString());
      if (params.lon !== undefined) queryParams.append('lon', params.lon.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.image) queryParams.append('image', params.image);
      if (params.barcode) queryParams.append('barcode', params.barcode);

      const response = await client.get(`${this.baseUrl}/search?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Enhanced search failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.detail || 'Invalid search parameters');
      }
      
      throw new Error('Search failed. Please try again.');
    }
  }

  /**
   * Get all offers for a specific product
   */
  async getProductOffers(productId: string): Promise<OffersResponse> {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      const response = await client.get(`${this.baseUrl}/products/${productId}/offers`);
      return response.data;
    } catch (error: any) {
      console.error('Get product offers failed:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Product not found');
      }
      
      throw new Error('Failed to get product offers');
    }
  }

  /**
   * Get search suggestions and auto-complete
   */
  async getSuggestions(params: SuggestionsParams): Promise<SearchSuggestionsResponse> {
    try {
      if (!params.q || params.q.length < 2) {
        return {
          query: params.q,
          suggestions: [],
          language: params.lang || 'en'
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.append('q', params.q);
      if (params.lang) queryParams.append('lang', params.lang);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await client.get(`${this.baseUrl}/search/suggestions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get suggestions failed:', error);
      return {
        query: params.q,
        suggestions: [],
        language: params.lang || 'en'
      };
    }
  }

  /**
   * Initialize search system (for development/testing)
   */
  async initialize(): Promise<{ status: string; message: string }> {
    try {
      const response = await client.post(`${this.baseUrl}/search/initialize`);
      return response.data;
    } catch (error) {
      console.error('Search initialization failed:', error);
      throw new Error('Failed to initialize search system');
    }
  }

  /**
   * Get search analytics and performance metrics
   */
  async getAnalytics(): Promise<any> {
    try {
      const response = await client.get(`${this.baseUrl}/search/analytics`);
      return response.data;
    } catch (error) {
      console.error('Get search analytics failed:', error);
      throw new Error('Failed to get search analytics');
    }
  }

  /**
   * Clear search cache (for development/debugging)
   */
  async clearCache(): Promise<{ status: string; message: string }> {
    try {
      const response = await client.delete(`${this.baseUrl}/search/cache`);
      return response.data;
    } catch (error) {
      console.error('Clear cache failed:', error);
      throw new Error('Failed to clear cache');
    }
  }

  /**
   * Warm search cache with popular queries
   */
  async warmCache(queries?: Array<{query: string; mode: string; lang: string}>): Promise<any> {
    try {
      const defaultQueries = queries || [
        { query: 'smartphone', mode: 'retail', lang: 'en' },
        { query: 'laptop', mode: 'retail', lang: 'en' },
        { query: 'simu', mode: 'retail', lang: 'sw' },
        { query: 'headphones', mode: 'all', lang: 'en' }
      ];

      const response = await client.post(`${this.baseUrl}/search/warm-cache`, defaultQueries);
      return response.data;
    } catch (error) {
      console.error('Warm cache failed:', error);
      throw new Error('Failed to warm cache');
    }
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Format price from minor units to display format
 */
export const formatPrice = (priceMinor: number, currency: string): string => {
  const price = priceMinor / 100; // Convert from minor units
  
  const formatters: Record<string, Intl.NumberFormat> = {
    'KES': new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }),
    'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    'GBP': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    'EUR': new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }),
  };
  
  const formatter = formatters[currency.toUpperCase()];
  return formatter ? formatter.format(price) : `${currency} ${price.toFixed(2)}`;
};

/**
 * Get Best Pick badge color based on score
 */
export const getBestPickBadgeColor = (score: number): string => {
  if (score >= 0.9) return '#10B981'; // Green
  if (score >= 0.8) return '#3B82F6'; // Blue  
  if (score >= 0.7) return '#F59E0B'; // Yellow
  return '#6B7280'; // Gray
};

/**
 * Get reason emoji for Best Pick reasons
 */
export const getReasonEmoji = (reason: string): string => {
  const emojiMap: Record<string, string> = {
    price: '💰',
    trust: '🛡️',
    eta: '⚡',
    cultural_fit: '🌍',
    stock: '📦'
  };
  return emojiMap[reason] || '✨';
};

/**
 * Get delivery ETA display text
 */
export const getDeliveryText = (deliveryDays: number, lang: string = 'en'): string => {
  const translations: Record<string, Record<number, string>> = {
    en: {
      0: 'Same day',
      1: '1 day',
      2: '2 days',
      3: '3 days'
    },
    sw: {
      0: 'Siku hii hii',
      1: 'Siku 1',
      2: 'Siku 2', 
      3: 'Siku 3'
    }
  };
  
  const langMap = translations[lang] || translations.en;
  return langMap[deliveryDays] || `${deliveryDays} days`;
};

/**
 * Get merchant trust level text
 */
export const getTrustLevelText = (trustScore: number, lang: string = 'en'): string => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      high: 'Trusted Seller',
      medium: 'Verified Seller',
      low: 'New Seller'
    },
    sw: {
      high: 'Muuzaji wa Kuaminika',
      medium: 'Muuzaji Aliyethibitishwa', 
      low: 'Muuzaji Mpya'
    }
  };
  
  const level = trustScore >= 0.8 ? 'high' : trustScore >= 0.6 ? 'medium' : 'low';
  const langMap = translations[lang] || translations.en;
  return langMap[level];
};

// ============= SEARCH MODES AND LANGUAGES =============

export const SEARCH_MODES = {
  ALL: 'all' as const,
  RETAIL: 'retail' as const,
  B2B: 'b2b' as const
};

export const SEARCH_LANGUAGES = {
  ENGLISH: 'en' as const,
  SWAHILI: 'sw' as const,
  ARABIC: 'ar' as const,
  TURKISH: 'tr' as const,
  FRENCH: 'fr' as const
};

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  sw: 'Kiswahili',
  ar: 'العربية',
  tr: 'Türkçe',
  fr: 'Français'
};

// Export singleton instance
export const searchService = new SearchService();