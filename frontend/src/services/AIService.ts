import { API } from '../api/client';
import { Platform } from 'react-native';

export interface LocaleInfo {
  country: string;
  language: string;
  currency: string;
  recommendations: {
    message: string;
    categories: string[];
    next_steps: string[];
  };
}

export interface ChatResponse {
  response: string;
  agent_id: string;
  timestamp: string;
}

export interface ProductRecommendation {
  id: string;
  title: string;
  price: number;
  currency: string;
  brand: string;
  images: string[];
}

export interface RecommendationResponse {
  recommendations: ProductRecommendation[];
  ai_explanation: string;
  query: string;
}

export interface IntentAnalysis {
  intent_type: string;
  extracted_keywords: string[];
  suggested_actions: string[];
  urgency_level: string;
}

class AIService {
  private static instance: AIService;
  private voiceService: any = null;

  private constructor() {
    this.initializeVoiceService();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeVoiceService() {
    if (Platform.OS !== 'web') {
      try {
        const Voice = require('@react-native-voice/voice');
        this.voiceService = Voice.default || Voice;
      } catch (error) {
        console.warn('Voice service not available:', error);
      }
    }
  }

  /**
   * Detect user's locale and get AI-powered recommendations
   */
  async detectLocale(): Promise<LocaleInfo> {
    try {
      const response = await API.get('/ai/locale-detection');
      return response.data;
    } catch (error) {
      console.error('Locale detection failed:', error);
      // Fallback locale
      return {
        country: 'US',
        language: 'en',
        currency: 'USD',
        recommendations: {
          message: 'Welcome to AisleMarts! Start exploring our global marketplace.',
          categories: ['Electronics', 'Fashion', 'Home & Garden'],
          next_steps: ['Browse products', 'Set up profile', 'Add items to cart']
        }
      };
    }
  }

  /**
   * Chat with personal AI agent
   */
  async chatWithAgent(message: string, context?: any): Promise<ChatResponse> {
    try {
      const response = await API.post('/ai/chat', {
        message,
        context
      });
      return response.data;
    } catch (error) {
      console.error('AI chat failed:', error);
      return {
        response: "I'm having trouble right now. Please try again later.",
        agent_id: 'fallback',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get AI-powered onboarding guidance
   */
  async getOnboardingGuidance(userInfo: any): Promise<{ guidance: string; user_role: string }> {
    try {
      const response = await API.post('/ai/onboarding', {
        user_info: userInfo
      });
      return response.data;
    } catch (error) {
      console.error('Onboarding guidance failed:', error);
      return {
        guidance: 'Welcome to AisleMarts! Explore products, add to cart, and enjoy seamless global shopping.',
        user_role: 'buyer'
      };
    }
  }

  /**
   * Get AI-powered product recommendations
   */
  async getProductRecommendations(query: string, maxResults: number = 10): Promise<RecommendationResponse> {
    try {
      const response = await API.post('/ai/recommendations', {
        query,
        max_results: maxResults
      });
      return response.data;
    } catch (error) {
      console.error('Product recommendations failed:', error);
      return {
        recommendations: [],
        ai_explanation: 'Unable to get AI recommendations at this time.',
        query
      };
    }
  }

  /**
   * Enhance search query with AI
   */
  async enhanceSearchQuery(query: string, context?: any): Promise<any> {
    try {
      const response = await API.post('/ai/search/enhance', {
        query,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Search enhancement failed:', error);
      return {
        original_query: query,
        enhanced_keywords: query.split(),
        suggested_filters: {},
        search_intent: 'product_search',
        synonyms: []
      };
    }
  }

  /**
   * Analyze user intent
   */
  async analyzeIntent(message: string): Promise<IntentAnalysis> {
    try {
      const response = await API.post('/ai/intent-analysis', null, {
        params: { message }
      });
      return response.data;
    } catch (error) {
      console.error('Intent analysis failed:', error);
      return {
        intent_type: 'general_help',
        extracted_keywords: [message],
        suggested_actions: ['Browse products'],
        urgency_level: 'low'
      };
    }
  }

  /**
   * Track user activity for AI personalization
   */
  async trackActivity(activityData: any): Promise<void> {
    try {
      await API.post('/ai/track-activity', activityData);
    } catch (error) {
      console.error('Activity tracking failed:', error);
    }
  }

  /**
   * Voice search functionality
   */
  async startVoiceSearch(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.voiceService || Platform.OS === 'web') {
        reject(new Error('Voice search not available on this platform'));
        return;
      }

      const timeout = setTimeout(() => {
        this.voiceService.stop();
        reject(new Error('Voice search timeout'));
      }, 10000);

      this.voiceService.onSpeechResults = (event: any) => {
        clearTimeout(timeout);
        const results = event.value || [];
        if (results.length > 0) {
          resolve(results[0]);
        } else {
          reject(new Error('No speech recognized'));
        }
      };

      this.voiceService.onSpeechError = (event: any) => {
        clearTimeout(timeout);
        reject(new Error(event.error?.message || 'Voice search failed'));
      };

      this.voiceService.start('en-US').catch((error: any) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Stop voice search
   */
  async stopVoiceSearch(): Promise<void> {
    if (this.voiceService && Platform.OS !== 'web') {
      try {
        await this.voiceService.stop();
      } catch (error) {
        console.error('Failed to stop voice search:', error);
      }
    }
  }

  /**
   * Process voice search query
   */
  async processVoiceSearch(audioText: string): Promise<any> {
    try {
      const response = await API.post('/ai/voice-search', null, {
        params: { audio_text: audioText }
      });
      return response.data;
    } catch (error) {
      console.error('Voice search processing failed:', error);
      return {
        original_query: audioText,
        enhanced_query: { original_query: audioText },
        products: [],
        response_type: 'voice_search'
      };
    }
  }

  /**
   * Get AI welcome message based on user profile
   */
  async getWelcomeMessage(user?: any): Promise<string> {
    if (!user) {
      return "Welcome to AisleMarts! 🌍 Your AI-powered global marketplace. What can I help you find today?";
    }

    try {
      const context = {
        user_name: user.name,
        user_roles: user.roles,
        returning_user: true
      };

      const response = await this.chatWithAgent(
        "Give me a personalized welcome message for this returning user",
        context
      );

      return response.response;
    } catch (error) {
      return `Welcome back, ${user.name || 'friend'}! 🌍 Ready to explore more amazing products from around the world?`;
    }
  }

  /**
   * Get smart search suggestions
   */
  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    try {
      const response = await this.enhanceSearchQuery(partialQuery);
      return [
        response.original_query,
        ...(response.enhanced_keywords || []),
        ...(response.synonyms || [])
      ].filter(Boolean).slice(0, 5);
    } catch (error) {
      console.error('Search suggestions failed:', error);
      return [partialQuery];
    }
  }

  /**
   * Get contextual help based on current screen
   */
  async getContextualHelp(screenName: string, context?: any): Promise<string> {
    const helpPrompts = {
      home: "How can I help you find products on the home screen?",
      product: "Do you need help with this product or have questions about it?",
      cart: "Need help with your shopping cart or checkout process?",
      profile: "How can I assist with your account or settings?",
      orders: "Do you have questions about your orders or order history?"
    };

    const prompt = helpPrompts[screenName as keyof typeof helpPrompts] || 
                   "How can I help you navigate AisleMarts?";

    try {
      const response = await this.chatWithAgent(prompt, { screen: screenName, ...context });
      return response.response;
    } catch (error) {
      return "I'm here to help! Ask me anything about finding products, placing orders, or using AisleMarts.";
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
export default aiService;