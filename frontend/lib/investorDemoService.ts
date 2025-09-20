/**
 * AisleMarts Investor Demo Service
 * 
 * Handles investor-specific demo experiences with awareness context,
 * UTM tracking, and personalized interfaces for Series A outreach.
 */

import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.EXPO_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export interface InvestorContext {
  locale: string;
  currency: string;
  timezone: string;
  device: string;
  firm_focus: string;
  investment_thesis: string;
  demo_emphasis: string;
  key_metrics: string[];
  preferred_language: string;
  demo_duration: string;
}

export interface DemoBundle {
  bundle: string;
  investor: string;
  locale: string;
  currency: string;
  timezone: string;
  device: string;
  focus: string;
  demo_url: string;
  status: string;
}

export interface DemoAnalytics {
  bundle: string;
  timeframe_days: number;
  metrics: {
    total_sessions: number;
    unique_visitors: number;
    avg_session_duration: string;
    bounce_rate: number;
    conversion_to_meeting: number;
    feature_engagement: Record<string, number>;
  };
  investor_focus_metrics: Record<string, number>;
  demo_progression: Array<{
    step: number;
    completion_rate: number;
    avg_time: string;
  }>;
}

export interface InvestorKPIs {
  bundle: string;
  currency: string;
  base_metrics: {
    gmv_current: number;
    gmv_projected: number;
    arr_current: number;
    users_active: number;
    conversion_rate: number;
    aov: number;
  };
  investor_focus_metrics: Record<string, number>;
  growth_trajectory: {
    current_month: number;
    projected_6_months: number;
    projected_12_months: number;
  };
}

class InvestorDemoService {
  private apiBase: string;

  constructor() {
    this.apiBase = `${API_BASE}/api`;
  }

  /**
   * Get investor demo context for specific bundle
   */
  async getDemoContext(bundleName: string): Promise<{
    bundle: string;
    context: InvestorContext;
    demo_urls: Record<string, string>;
  }> {
    const response = await fetch(`${this.apiBase}/demo/context/${bundleName}`);
    if (!response.ok) {
      throw new Error(`Failed to get demo context: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Track investor demo interaction
   */
  async trackInteraction(
    bundle: string,
    eventType: 'demo_started' | 'demo_progression' | 'demo_engagement' | 'demo_completed',
    page: string,
    utmContent?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      await fetch(`${this.apiBase}/demo/track-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bundle,
          event_type: eventType,
          page,
          utm_content: utmContent,
          session_id: sessionId,
        }),
      });
    } catch (error) {
      console.warn('Failed to track demo interaction:', error);
    }
  }

  /**
   * Get demo analytics for investor bundle
   */
  async getDemoAnalytics(bundleName: string, days: number = 30): Promise<DemoAnalytics> {
    const response = await fetch(`${this.apiBase}/demo/analytics/${bundleName}?days=${days}`);
    if (!response.ok) {
      throw new Error(`Failed to get demo analytics: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get investor-specific KPIs
   */
  async getInvestorKPIs(bundleName: string, currency?: string): Promise<InvestorKPIs> {
    const url = `${this.apiBase}/demo/kpis/${bundleName}${currency ? `?currency=${currency}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to get investor KPIs: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Run smoke test for investor bundle
   */
  async runSmokeTest(bundleName: string): Promise<{
    bundle: string;
    overall_status: 'PASS' | 'FAIL';
    tests: Record<string, any>;
    performance: Record<string, string>;
    demo_ready: boolean;
  }> {
    const response = await fetch(`${this.apiBase}/demo/smoke-test/${bundleName}`);
    if (!response.ok) {
      throw new Error(`Failed to run smoke test: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get all available demo bundles
   */
  async getAllBundles(): Promise<{
    total_bundles: number;
    bundles: DemoBundle[];
    last_updated: string;
  }> {
    const response = await fetch(`${this.apiBase}/demo/all-bundles`);
    if (!response.ok) {
      throw new Error(`Failed to get demo bundles: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Reset demo environment
   */
  async resetDemo(bundleName: string): Promise<{
    bundle: string;
    reset_completed: boolean;
    timestamp: string;
    next_scheduled_reset: string;
    seed_data_status: string;
    demo_ready: boolean;
  }> {
    const response = await fetch(`${this.apiBase}/demo/reset/${bundleName}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to reset demo: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Extract investor bundle from URL parameters
   */
  getInvestorBundleFromURL(): string | null {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('utm_bundle');
    }
    return null;
  }

  /**
   * Generate deep link for investor demo
   */
  generateDeepLink(
    bundleName: string,
    context: InvestorContext,
    route: string = '/',
    utmContent?: string
  ): string {
    const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || 'https://retail-fusion-5.preview.emergentagent.com';
    const params = new URLSearchParams({
      locale: context.locale,
      currency: context.currency,
      tz: context.timezone,
      device: context.device,
      utm_source: 'investor',
      utm_medium: 'email',
      utm_campaign: 'series_a',
      utm_bundle: bundleName,
    });

    if (utmContent) {
      params.set('utm_content', utmContent);
    }

    return `${baseUrl}${route}?${params.toString()}`;
  }

  /**
   * Apply investor context to awareness engine
   */
  async applyInvestorContext(bundleName: string): Promise<void> {
    try {
      const { context } = await this.getDemoContext(bundleName);
      
      // Store context in local storage for awareness engine
      if (typeof window !== 'undefined') {
        localStorage.setItem('investor_demo_context', JSON.stringify({
          bundle: bundleName,
          ...context,
          applied_at: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.warn('Failed to apply investor context:', error);
    }
  }

  /**
   * Get current demo session info
   */
  getCurrentDemoSession(): {
    bundle: string | null;
    sessionId: string;
    startTime: string;
  } {
    const bundle = this.getInvestorBundleFromURL();
    
    // Generate or retrieve session ID
    let sessionId = '';
    if (typeof window !== 'undefined') {
      sessionId = sessionStorage.getItem('demo_session_id') || 
                  `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('demo_session_id', sessionId);
    }

    return {
      bundle,
      sessionId,
      startTime: new Date().toISOString(),
    };
  }

  /**
   * Format currency for investor display
   */
  formatCurrency(amount: number, currency: string): string {
    const formatters = {
      USD: (amt: number) => `$${amt.toLocaleString()}`,
      EUR: (amt: number) => `€${amt.toLocaleString()}`,
      GBP: (amt: number) => `£${amt.toLocaleString()}`,
      SGD: (amt: number) => `S$${amt.toLocaleString()}`,
    };

    const formatter = formatters[currency as keyof typeof formatters];
    return formatter ? formatter(amount) : `${currency} ${amount.toLocaleString()}`;
  }

  /**
   * Get investor-specific demo emphasis
   */
  getDemoEmphasis(bundleName: string): {
    primary_metrics: string[];
    demo_flow: string[];
    key_features: string[];
  } {
    const emphasisMap: Record<string, any> = {
      'SEQUOIA_ROELOF_BOTHA': {
        primary_metrics: ['viral_coefficient', 'network_density', 'b2b_vendor_growth'],
        demo_flow: ['network_effects_home', 'ai_mood_cart', 'social_feed', 'analytics'],
        key_features: ['network_effects', 'viral_loops', 'b2b_marketplace'],
      },
      'A16Z_CHRIS_DIXON': {
        primary_metrics: ['ai_engagement_rate', 'ai_revenue_impact', 'consumer_retention'],
        demo_flow: ['ai_awareness_home', 'ai_assistant', 'ai_mood_cart', 'ai_analytics'],
        key_features: ['ai_infrastructure', 'conversational_commerce', 'contextual_intelligence'],
      },
      'LVMH_JULIE_BERCOVY': {
        primary_metrics: ['luxury_aov', 'brand_partnerships', 'european_gmv'],
        demo_flow: ['french_home', 'luxury_collections', 'brand_partnerships', 'european_analytics'],
        key_features: ['luxury_brands', 'european_market', 'cultural_adaptation'],
      },
      'TIGER_GLOBAL_CHASE_COLEMAN': {
        primary_metrics: ['global_gmv', 'multi_currency_transactions', 'emerging_markets'],
        demo_flow: ['global_home', 'multi_currency', 'global_features', 'growth_analytics'],
        key_features: ['global_commerce', 'multi_currency', 'emerging_markets'],
      },
    };

    return emphasisMap[bundleName] || {
      primary_metrics: ['gmv_growth', 'user_engagement', 'conversion_rate'],
      demo_flow: ['home', 'ai_features', 'commerce', 'analytics'],
      key_features: ['ai_powered', 'luxury_commerce', 'social_platform'],
    };
  }
}

// Export singleton instance
export const investorDemoService = new InvestorDemoService();
export default investorDemoService;