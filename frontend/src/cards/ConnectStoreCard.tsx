import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

interface ConnectStoreCardProps {
  onConnect: (platform: { platform: string }) => void;
}

export function ConnectStoreCard({ onConnect }: ConnectStoreCardProps) {
  const platforms = [
    { label: 'Shopify', key: 'shopify', icon: '🛍️' },
    { label: 'WooCommerce', key: 'woo', icon: '🌐' },
    { label: 'CS-Cart', key: 'cscart', icon: '🛒' },
    { label: 'Custom Store', key: 'custom', icon: '⚡' }
  ];

  return (
    <View style={{
      backgroundColor: theme.colors.card,
      padding: theme.space.md,
      borderRadius: theme.radius.md
    }}>
      <Text style={{
        color: theme.colors.text,
        fontWeight: '700',
        fontSize: 18,
        marginBottom: theme.space.xs
      }}>
        🤖 Connect Your Store
      </Text>
      
      <Text style={{
        color: theme.colors.textDim,
        marginBottom: theme.space.md,
        lineHeight: 20
      }}>
        AI will import your catalog, optimize listings, and help you reach global customers with just 1% commission.
      </Text>
      
      {platforms.map(platform => (
        <TouchableOpacity
          key={platform.key}
          onPress={() => onConnect({ platform: platform.key })}
          style={{
            marginTop: theme.space.sm,
            backgroundColor: '#0E1A33',
            padding: theme.space.md,
            borderRadius: theme.radius.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.sm
          }}
        >
          <Text style={{ fontSize: 20 }}>{platform.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#E6EDF3', fontWeight: '600' }}>
              Link {platform.label}
            </Text>
            <Text style={{ color: theme.colors.textDim, fontSize: 12, marginTop: 2 }}>
              10-minute setup • AI-powered optimization
            </Text>
          </View>
          <Text style={{ color: theme.colors.primary, fontSize: 18 }}>→</Text>
        </TouchableOpacity>
      ))}
      
      <View style={{
        marginTop: theme.space.md,
        padding: theme.space.sm,
        backgroundColor: '#0A2F1A',
        borderRadius: theme.radius.sm,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.success
      }}>
        <Text style={{ color: theme.colors.success, fontWeight: '600' }}>
          ✨ Why AisleMarts?
        </Text>
        <Text style={{ color: '#E6EDF3', fontSize: 12, marginTop: 4 }}>
          Only 1% commission • M-Pesa payments • Global reach • AI optimization
        </Text>
      </View>
    </View>
  );
}