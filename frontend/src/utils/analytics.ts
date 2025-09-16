/**
 * Analytics Tracking - User Behavior Insights
 * Track feature usage to guide roadmap decisions
 */

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Event Types
export const ANALYTICS_EVENTS = {
  // Profile/Command Center Events
  PROFILE_TILE_CLICK: 'profile_tile_click',
  QUICK_ACTION_CLICK: 'quick_action_click',
  
  // Home Screen Events  
  HOME_CTA_CLICK: 'home_cta_click',
  BEST_PICK_VIEW: 'best_pick_card_view',
  SEARCH_PILL_CLICK: 'search_pill_click',
  
  // Navigation Events
  SCREEN_VIEW: 'screen_view',
  NAVIGATION_BACK: 'navigation_back',
  
  // Feature Usage
  FEATURE_ACCESS: 'feature_access',
  FEATURE_ERROR: 'feature_error',
} as const;

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private enabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public track(event: string, properties: Record<string, any> = {}) {
    if (!this.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        platform: 'mobile',
        app_version: '3.0.0',
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);
    
    // Log to console for development
    if (__DEV__) {
      console.log('📊 Analytics:', event, properties);
    }

    // In production, send to analytics service
    this.sendToAnalyticsService(analyticsEvent);
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    try {
      // TODO: Send to your analytics provider (Firebase, Mixpanel, etc.)
      // For now, just store locally
      if (this.events.length > 100) {
        this.events = this.events.slice(-50); // Keep last 50 events
      }
    } catch (error) {
      console.warn('Analytics send failed:', error);
    }
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public clearEvents() {
    this.events = [];
  }

  // Convenience methods for common events
  public trackProfileTileClick(featureKey: string, route: string, userRole: string) {
    this.track(ANALYTICS_EVENTS.PROFILE_TILE_CLICK, {
      feature_key: featureKey,
      route,
      user_role: userRole,
    });
  }

  public trackHomeCTAClick(cta: 'discover' | 'nearby' | 'rfq') {
    this.track(ANALYTICS_EVENTS.HOME_CTA_CLICK, {
      cta,
      section: 'hero',
    });
  }

  public trackBestPickView(productId: string, position: number) {
    this.track(ANALYTICS_EVENTS.BEST_PICK_VIEW, {
      product_id: productId,
      position,
      section: 'best_picks_carousel',
    });
  }

  public trackScreenView(screenName: string, source?: string) {
    this.track(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      source,
    });
  }

  public trackFeatureAccess(featureKey: string, accessMethod: 'profile' | 'home' | 'navigation') {
    this.track(ANALYTICS_EVENTS.FEATURE_ACCESS, {
      feature_key: featureKey,
      access_method: accessMethod,
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React Hook for easy component usage
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackProfileTileClick: analytics.trackProfileTileClick.bind(analytics),
    trackHomeCTAClick: analytics.trackHomeCTAClick.bind(analytics),
    trackBestPickView: analytics.trackBestPickView.bind(analytics),
    trackScreenView: analytics.trackScreenView.bind(analytics),
    trackFeatureAccess: analytics.trackFeatureAccess.bind(analytics),
  };
};

export default analytics;