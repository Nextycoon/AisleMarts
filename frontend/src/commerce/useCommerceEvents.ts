/**
 * Phase 3 Commerce Tracking Hook
 * Tracks story impressions, CTAs, and purchases for affiliate attribution
 */
import { useCallback } from 'react';
import Constants from 'expo-constants';

type CommerceEventHook = {
  trackImpression: (storyId: string, userId?: string) => Promise<void>;
  trackCTA: (storyId: string, productId?: string, userId?: string) => Promise<void>;
  trackPurchase: (
    orderId: string, 
    productId: string, 
    amount: number, 
    currency: string, 
    referrerStoryId?: string, 
    userId?: string
  ) => Promise<{ ok: boolean; commission?: number; creatorId?: string }>;
};

export function useCommerceEvents(userId?: string): CommerceEventHook {
  const getBaseUrl = () => {
    return Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
  };

  const trackImpression = useCallback(async (storyId: string, userIdOverride?: string) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/track/impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          userId: userIdOverride || userId,
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to track impression:', response.status);
      } else {
        console.log(`✅ Impression tracked: ${storyId}`);
      }
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }, [userId]);

  const trackCTA = useCallback(async (storyId: string, productId?: string, userIdOverride?: string) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/track/cta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          productId,
          userId: userIdOverride || userId,
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to track CTA:', response.status);
      } else {
        console.log(`✅ CTA tracked: ${storyId} -> ${productId}`);
      }
    } catch (error) {
      console.error('Error tracking CTA:', error);
    }
  }, [userId]);

  const trackPurchase = useCallback(async (
    orderId: string,
    productId: string,
    amount: number,
    currency: string,
    referrerStoryId?: string,
    userIdOverride?: string
  ) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/track/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          userId: userIdOverride || userId,
          productId,
          amount,
          currency,
          referrerStoryId,
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to track purchase:', response.status);
        return { ok: false };
      }
      
      const result = await response.json();
      console.log(`✅ Purchase tracked: ${orderId} -> Commission: $${result.commission} to creator: ${result.creatorId}`);
      return result;
    } catch (error) {
      console.error('Error tracking purchase:', error);
      return { ok: false };
    }
  }, [userId]);

  return {
    trackImpression,
    trackCTA,
    trackPurchase,
  };
}