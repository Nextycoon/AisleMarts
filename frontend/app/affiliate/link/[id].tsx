/**
 * Affiliate Link Handler - Deep Link Entry Point
 * Handles incoming affiliate link clicks and redirects to products
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://marketplace-docs.preview.emergentagent.com';

interface AffiliateLinkData {
  id: string;
  title: string;
  description: string;
  url: string;
  product_ids: string[];
  campaign_id?: string;
  commission_rate: number;
  status: string;
  expires_at?: string;
}

export default function AffiliateLinkHandler() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState<AffiliateLinkData | null>(null);

  useEffect(() => {
    if (id) {
      handleAffiliateLinkClick(id);
    }
  }, [id]);

  const handleAffiliateLinkClick = async (linkId: string) => {
    try {
      setLoading(true);

      // Get deep link context if available
      const deeplinkContext = await AsyncStorage.getItem('deeplink_context');
      const context = deeplinkContext ? JSON.parse(deeplinkContext) : null;

      console.log('🔗 Processing affiliate link:', linkId, 'Context:', context);

      // Track affiliate click first
      await trackAffiliateClick(linkId, context);

      // Fetch affiliate link data
      const response = await fetch(`${API_BASE}/api/affiliate/links/link/${linkId}`);
      
      if (!response.ok) {
        throw new Error(`Link not found: ${response.status}`);
      }

      const data = await response.json();
      setLinkData(data.link);

      // Check if link is valid and not expired
      if (data.link.status !== 'active') {
        Alert.alert(
          'Link Unavailable',
          'This affiliate link is no longer active.',
          [
            { text: 'OK', onPress: () => router.replace('/shop') }
          ]
        );
        return;
      }

      if (data.link.expires_at && new Date(data.link.expires_at) < new Date()) {
        Alert.alert(
          'Link Expired',
          'This affiliate link has expired.',
          [
            { text: 'OK', onPress: () => router.replace('/shop') }
          ]
        );
        return;
      }

      // Redirect to product or shop
      await redirectToDestination(data.link, context);

    } catch (error) {
      console.error('Error handling affiliate link:', error);
      
      Alert.alert(
        'Link Error',
        'Unable to process this link. Redirecting to shop.',
        [
          { text: 'OK', onPress: () => router.replace('/shop') }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const trackAffiliateClick = async (linkId: string, context: any) => {
    try {
      const eventData = {
        name: 'affiliate_click',
        props: {
          link_id: linkId,
          utm_source: context?.utm?.source,
          utm_medium: context?.utm?.medium,
          utm_campaign: context?.utm?.campaign,
          referrer: context?.source || 'deep_link',
          click_timestamp: Date.now(),
          user_agent: 'AisleMarts-App/1.0'
        },
        source: 'mobile_app'
      };

      // Send to analytics endpoint
      const response = await fetch(`${API_BASE}/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        console.log('✅ Affiliate click tracked successfully');
      } else {
        console.warn('⚠️ Failed to track affiliate click:', response.status);
      }

    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  };

  const redirectToDestination = async (linkData: AffiliateLinkData, context: any) => {
    // Store affiliate context for attribution
    const affiliateContext = {
      link_id: linkData.id,
      campaign_id: linkData.campaign_id,
      commission_rate: linkData.commission_rate,
      utm: context?.utm,
      click_timestamp: Date.now()
    };

    await AsyncStorage.setItem('affiliate_context', JSON.stringify(affiliateContext));

    // If link has specific products, go to first product
    if (linkData.product_ids && linkData.product_ids.length > 0) {
      const productId = linkData.product_ids[0];
      
      // Add slight delay for better UX
      setTimeout(() => {
        router.replace(`/product/${productId}` as any);
      }, 1000);
      
    } else {
      // No specific product, go to shop with campaign filter
      const shopRoute = linkData.campaign_id 
        ? `/shop?campaign=${linkData.campaign_id}`
        : '/shop';
      
      setTimeout(() => {
        router.replace(shopRoute as any);
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#667eea" />
        
        <Text style={styles.title}>Processing Link...</Text>
        
        <Text style={styles.message}>
          {linkData 
            ? `Redirecting to ${linkData.title}`
            : 'Validating affiliate link and preparing your personalized experience.'
          }
        </Text>

        {linkData && (
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>{linkData.title}</Text>
            <Text style={styles.linkDescription}>{linkData.description}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  linkInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  linkDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});