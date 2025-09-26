/**
 * AisleMarts Deep Link Handler - Production Ready
 * Handles affiliate links, product deep links, and app navigation
 */

import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeepLinkData {
  type: 'affiliate' | 'product' | 'rfq' | 'campaign' | 'unknown';
  id?: string;
  params?: Record<string, string>;
  source?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

class DeepLinkHandler {
  private static instance: DeepLinkHandler;
  private listeners: Array<(data: DeepLinkData) => void> = [];
  
  public static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler();
    }
    return DeepLinkHandler.instance;
  }

  /**
   * Initialize deep link handling
   */
  public initialize() {
    // Handle initial URL if app was launched from a link
    this.handleInitialURL();
    
    // Listen for incoming links while app is running
    Linking.addEventListener('url', this.handleDeepLink.bind(this));
  }

  /**
   * Add listener for deep link events
   */
  public addListener(callback: (data: DeepLinkData) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Handle initial URL when app launches
   */
  private async handleInitialURL() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('🔗 Initial URL detected:', initialUrl);
        this.processDeepLink(initialUrl);
      }
    } catch (error) {
      console.error('Error handling initial URL:', error);
    }
  }

  /**
   * Handle incoming deep link while app is running
   */
  private handleDeepLink = (event: { url: string }) => {
    console.log('🔗 Deep link received:', event.url);
    this.processDeepLink(event.url);
  };

  /**
   * Process and route deep link
   */
  private async processDeepLink(url: string) {
    try {
      const linkData = this.parseDeepLink(url);
      console.log('🔍 Parsed deep link:', linkData);

      // Track the deep link event
      await this.trackDeepLinkEvent(url, linkData);

      // Notify listeners
      this.listeners.forEach(listener => listener(linkData));

      // Route to appropriate screen
      await this.routeDeepLink(linkData);

    } catch (error) {
      console.error('Error processing deep link:', error);
      // Fallback to home screen
      router.replace('/');
    }
  }

  /**
   * Parse deep link URL into structured data
   */
  private parseDeepLink(url: string): DeepLinkData {
    const parsed = Linking.parse(url);
    const { hostname, path, queryParams } = parsed;

    console.log('🔍 URL Components:', { hostname, path, queryParams });

    // Handle custom scheme links (aislemarts://)
    if (parsed.scheme === 'aislemarts') {
      return this.parseCustomSchemeLink(parsed);
    }

    // Handle universal links (https://aislemarts.com/...)
    if (hostname && (hostname.includes('aislemarts') || hostname.includes('emergentagent'))) {
      return this.parseUniversalLink(path || '', queryParams || {});
    }

    return { type: 'unknown', params: queryParams || {} };
  }

  /**
   * Parse custom scheme links (aislemarts://)
   */
  private parseCustomSchemeLink(parsed: any): DeepLinkData {
    const { hostname, path, queryParams } = parsed;
    
    // aislemarts://affiliate/link/123?utm_source=instagram
    if (hostname === 'affiliate' || path?.startsWith('/affiliate')) {
      const linkId = path?.split('/').pop() || hostname;
      return {
        type: 'affiliate',
        id: linkId,
        params: queryParams || {},
        utm: this.extractUTMParams(queryParams || {})
      };
    }

    // aislemarts://product/123
    if (hostname === 'product' || path?.startsWith('/product')) {
      const productId = path?.split('/').pop() || hostname;
      return {
        type: 'product',
        id: productId,
        params: queryParams || {}
      };
    }

    // aislemarts://rfq/456
    if (hostname === 'rfq' || path?.startsWith('/rfq')) {
      const rfqId = path?.split('/').pop() || hostname;
      return {
        type: 'rfq',
        id: rfqId,
        params: queryParams || {}
      };
    }

    return { type: 'unknown', params: queryParams || {} };
  }

  /**
   * Parse universal links (https://aislemarts.com/...)
   */
  private parseUniversalLink(path: string, queryParams: Record<string, any>): DeepLinkData {
    const pathSegments = path.split('/').filter(Boolean);

    // https://aislemarts.com/affiliate/link/abc123?utm_source=tiktok
    if (pathSegments[0] === 'affiliate' && pathSegments[1] === 'link' && pathSegments[2]) {
      return {
        type: 'affiliate',
        id: pathSegments[2],
        params: queryParams,
        utm: this.extractUTMParams(queryParams),
        source: 'universal_link'
      };
    }

    // https://aislemarts.com/product/xyz789
    if (pathSegments[0] === 'product' && pathSegments[1]) {
      return {
        type: 'product',
        id: pathSegments[1],
        params: queryParams,
        source: 'universal_link'
      };
    }

    // https://aislemarts.com/rfq/rfq123
    if (pathSegments[0] === 'rfq' && pathSegments[1]) {
      return {
        type: 'rfq',
        id: pathSegments[1],
        params: queryParams,
        source: 'universal_link'
      };
    }

    // https://aislemarts.com/campaign/summer2024
    if (pathSegments[0] === 'campaign' && pathSegments[1]) {
      return {
        type: 'campaign',
        id: pathSegments[1],
        params: queryParams,
        source: 'universal_link'
      };
    }

    return { type: 'unknown', params: queryParams, source: 'universal_link' };
  }

  /**
   * Extract UTM parameters for tracking
   */
  private extractUTMParams(queryParams: Record<string, any>) {
    return {
      source: queryParams.utm_source,
      medium: queryParams.utm_medium,
      campaign: queryParams.utm_campaign,
      content: queryParams.utm_content,
      term: queryParams.utm_term,
    };
  }

  /**
   * Route to appropriate screen based on deep link data
   */
  private async routeDeepLink(linkData: DeepLinkData) {
    // Store deep link context for screens to access
    await AsyncStorage.setItem('deeplink_context', JSON.stringify(linkData));

    switch (linkData.type) {
      case 'affiliate':
        if (linkData.id) {
          // Navigate to affiliate link handler (which will redirect to product)
          router.push(`/affiliate/link/${linkData.id}` as any);
        } else {
          router.push('/affiliate');
        }
        break;

      case 'product':
        if (linkData.id) {
          router.push(`/product/${linkData.id}` as any);
        } else {
          router.push('/shop');
        }
        break;

      case 'rfq':
        if (linkData.id) {
          router.push(`/b2b/rfq/${linkData.id}` as any);
        } else {
          router.push('/b2b');
        }
        break;

      case 'campaign':
        if (linkData.id) {
          router.push(`/affiliate/campaigns/${linkData.id}` as any);
        } else {
          router.push('/affiliate/campaigns');
        }
        break;

      default:
        // Unknown link type - go to home
        router.push('/');
        break;
    }
  }

  /**
   * Track deep link event for analytics
   */
  private async trackDeepLinkEvent(url: string, linkData: DeepLinkData) {
    try {
      // Send tracking event to analytics
      const eventData = {
        name: 'deep_link_opened',
        props: {
          url: url,
          link_type: linkData.type,
          link_id: linkData.id,
          utm_source: linkData.utm?.source,
          utm_medium: linkData.utm?.medium,
          utm_campaign: linkData.utm?.campaign,
          source: linkData.source,
          timestamp: Date.now()
        },
        source: 'mobile_app'
      };

      // In a real app, send this to your analytics endpoint
      console.log('📊 Deep link tracking event:', eventData);
      
      // Store for potential batch sending later
      await AsyncStorage.setItem('last_deeplink_event', JSON.stringify(eventData));

    } catch (error) {
      console.error('Error tracking deep link event:', error);
    }
  }

  /**
   * Generate deep link for sharing
   */
  public static generateAffiliateLink(linkId: string, utmParams?: Record<string, string>): string {
    const baseUrl = 'https://aislemarts.com/affiliate/link';
    const url = new URL(`${baseUrl}/${linkId}`);
    
    // Add UTM parameters
    if (utmParams) {
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key.startsWith('utm_') ? key : `utm_${key}`, value);
        }
      });
    }

    return url.toString();
  }

  /**
   * Generate product deep link
   */
  public static generateProductLink(productId: string, source?: string): string {
    const baseUrl = 'https://aislemarts.com/product';
    const url = new URL(`${baseUrl}/${productId}`);
    
    if (source) {
      url.searchParams.set('utm_source', source);
    }

    return url.toString();
  }

  /**
   * Check if a URL is a valid AisleMarts deep link
   */
  public static isValidDeepLink(url: string): boolean {
    try {
      const parsed = new URL(url);
      
      // Check for custom scheme
      if (parsed.protocol === 'aislemarts:') {
        return true;
      }
      
      // Check for universal link domains
      const validDomains = [
        'aislemarts.com',
        'app.aislemarts.com',
        'aislemarts.preview.emergentagent.com'
      ];
      
      return validDomains.some(domain => parsed.hostname.includes(domain));
      
    } catch (error) {
      return false;
    }
  }
}

export default DeepLinkHandler;
export type { DeepLinkData };