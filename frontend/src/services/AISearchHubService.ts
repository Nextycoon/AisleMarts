import { API } from '../api/client';

// Types for AI Search Hub
export interface SearchFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  city_ids?: string[];
  seller_country?: string;
}

export interface QuickSearchRequest {
  q: string;
  locale: string;
  currency: string;
  country: string;
  filters: SearchFilters;
}

export interface SearchResult {
  title: string;
  id: string;
  price: number;
  currency: string;
  seller: {
    id: string;
    country: string;
    rating?: number;
  };
  cities?: string[];
}

export interface QuickSearchResponse {
  results: SearchResult[];
  applied_filters: SearchFilters;
  latency_ms: number;
}

export interface DeepSearchRequest {
  objective: string;
  time_horizon?: string;
  regions?: string[];
  evidence_required?: boolean;
}

export interface DeepSearchInsight {
  type: string;
  title: string;
  content?: string;
  data?: any;
  confidence: number;
}

export interface DeepSearchResponse {
  insights: DeepSearchInsight[];
  sources: Array<{type: string; confidence: number}>;
  confidence: number;
}

export interface ImageReadRequest {
  image_base64: string;
  tasks: Array<'ocr' | 'translate' | 'extract_entities'>;
  languages_hint?: string[];
}

export interface EntityExtraction {
  type: 'sku' | 'lot' | 'expiry' | 'brand' | 'ingredient' | 'price' | 'contact';
  value: string;
  bbox?: number[];
}

export interface ImageReadResponse {
  text_blocks: string[];
  entities: EntityExtraction[];
  translations?: Array<{original: string; translated: string}>;
}

export interface QRScanRequest {
  image_base64: string;
}

export interface QRScanResponse {
  qr_value: string;
  intent_guess: 'open_url' | 'product_lookup' | 'auth' | 'contact';
  next_action: string;
}

export interface BarcodeScanRequest {
  image_base64: string;
  symbologies: Array<'EAN13' | 'UPC' | 'CODE128' | 'QR'>;
}

export interface BarcodeScanResponse {
  barcode_value: string;
  symbology: string;
  lookup_key: string;
}

export interface VoiceInputRequest {
  audio_base64: string;
  language_hint?: string;
}

export interface VoiceInputResponse {
  transcript: string;
  language: string;
  confidence: number;
}

export interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
  suggested_tool: string;
  fallback_tool?: string;
}

export interface IntentAnalysisResponse {
  primary_intent: Intent;
  alternative_intents: Intent[];
  suggested_action: string;
}

export interface UserPreferences {
  preferred_tools: string[];
  default_currency: string;
  default_language: string;
  privacy_settings: {
    allow_camera: boolean;
    allow_microphone: boolean;
    save_search_history: boolean;
    personalized_results: boolean;
  };
}

export interface SearchAnalytics {
  summary: {
    total_searches: number;
    successful_searches: number;
    success_rate: number;
    time_period_days: number;
  };
  tool_usage: Record<string, {
    count: number;
    success_count: number;
    success_rate: number;
  }>;
  recent_searches: any[];
}

export interface ToolConfig {
  id: string;
  label: string;
  icon: string;
  default?: boolean;
}

class AISearchHubService {
  // Quick Search - Fast product search with AI enhancement
  async quickSearch(request: QuickSearchRequest): Promise<QuickSearchResponse> {
    try {
      const response = await API.post('/search-hub/quick-search', request);
      return response.data;
    } catch (error) {
      console.error('Quick search error:', error);
      throw error;
    }
  }

  // Deep Search - Market analysis and insights
  async deepSearch(request: DeepSearchRequest): Promise<DeepSearchResponse> {
    try {
      const response = await API.post('/search-hub/deep-search', request);
      return response.data;
    } catch (error) {
      console.error('Deep search error:', error);
      throw error;
    }
  }

  // Image Read - OCR and entity extraction
  async imageRead(request: ImageReadRequest): Promise<ImageReadResponse> {
    try {
      const response = await API.post('/search-hub/image-read', request);
      return response.data;
    } catch (error) {
      console.error('Image read error:', error);
      throw error;
    }
  }

  // QR Scan - QR code scanning and intent detection
  async qrScan(request: QRScanRequest): Promise<QRScanResponse> {
    try {
      const response = await API.post('/search-hub/qr-scan', request);
      return response.data;
    } catch (error) {
      console.error('QR scan error:', error);
      throw error;
    }
  }

  // Barcode Scan - Barcode scanning and product lookup
  async barcodeScan(request: BarcodeScanRequest): Promise<BarcodeScanResponse> {
    try {
      const response = await API.post('/search-hub/barcode-scan', request);
      return response.data;
    } catch (error) {
      console.error('Barcode scan error:', error);
      throw error;
    }
  }

  // Voice Input - Speech-to-text processing
  async voiceInput(request: VoiceInputRequest): Promise<VoiceInputResponse> {
    try {
      const response = await API.post('/search-hub/voice-input', request);
      return response.data;
    } catch (error) {
      console.error('Voice input error:', error);
      throw error;
    }
  }

  // Intent Analysis - Analyze user intent and suggest tools
  async analyzeIntent(query: string, context: Record<string, any> = {}): Promise<IntentAnalysisResponse> {
    try {
      const response = await API.post('/search-hub/analyze-intent', { query, context });
      return response.data;
    } catch (error) {
      console.error('Intent analysis error:', error);
      throw error;
    }
  }

  // User Preferences - Get user search preferences
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await API.get('/search-hub/user-preferences');
      return response.data;
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    }
  }

  // User Preferences - Update user search preferences
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<{status: string; message: string}> {
    try {
      const response = await API.post('/search-hub/user-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  // Analytics - Get search analytics
  async getAnalytics(days: number = 7): Promise<SearchAnalytics> {
    try {
      const response = await API.get(`/search-hub/analytics?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  }

  // Health Check - Check AI Search Hub health
  async checkHealth(): Promise<any> {
    try {
      const response = await API.get('/search-hub/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // File Upload - Upload files for processing
  async uploadFile(file: File): Promise<{base64_content: string; filename: string; content_type: string; size: number}> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/search-hub/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Utility: Convert image file to base64
  async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Utility: Convert audio file to base64
  async audioToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Utility: Get default tools configuration
  getToolsConfig(): ToolConfig[] {
    return [
      { id: 'quick_search', label: 'Search', icon: 'search', default: true },
      { id: 'deep_search', label: 'Deep Search', icon: 'radar' },
      { id: 'image_read', label: 'Read Image (OCR)', icon: 'image' },
      { id: 'qr_scan', label: 'Scan QR', icon: 'qr-code' },
      { id: 'barcode_scan', label: 'Scan Barcode', icon: 'barcode' },
      { id: 'voice_input', label: 'Voice', icon: 'mic' }
    ];
  }

  // Utility: Get user's locale info
  getUserLocale(): {country: string; currency: string; language: string} {
    // In a real app, this would detect user's location/preferences
    return {
      country: 'US',
      currency: 'USD',
      language: 'en'
    };
  }

  // Utility: Format search results for display
  formatSearchResults(results: SearchResult[]): SearchResult[] {
    return results.map(result => ({
      ...result,
      title: result.title.substring(0, 100), // Truncate long titles
      seller: {
        ...result.seller,
        rating: result.seller.rating || 0
      }
    }));
  }

  // Utility: Check if a tool requires permissions
  requiresPermission(toolId: string): {camera?: boolean; microphone?: boolean} {
    const permissions: Record<string, {camera?: boolean; microphone?: boolean}> = {
      'image_read': { camera: true },
      'qr_scan': { camera: true },
      'barcode_scan': { camera: true },
      'voice_input': { microphone: true }
    };
    
    return permissions[toolId] || {};
  }

  // Utility: Get tool icon name for Ionicons
  getToolIcon(toolId: string): string {
    const icons: Record<string, string> = {
      'quick_search': 'search-outline',
      'deep_search': 'analytics-outline',
      'image_read': 'camera-outline',
      'qr_scan': 'qr-code-outline',
      'barcode_scan': 'barcode-outline',
      'voice_input': 'mic-outline'
    };
    
    return icons[toolId] || 'help-outline';
  }
}

export const aiSearchHubService = new AISearchHubService();