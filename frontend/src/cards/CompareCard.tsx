import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

interface CompareItem {
  title: string;
  price: number;
  rating: number;
  eta: string;
}

interface CompareCardProps {
  items: CompareItem[];
}

export function CompareCard({ items }: CompareCardProps) {
  const best = items.reduce((a, b) => (a.price <= b.price ? a : b));
  
  return (
    <View style={{
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.space.md
    }}>
      <Text style={{
        color: theme.colors.text,
        fontWeight: '700',
        fontSize: 18,
        marginBottom: theme.space.sm
      }}>
        Compare Products
      </Text>
      
      {items.map((item, i) => (
        <View
          key={i}
          style={{
            paddingVertical: theme.space.sm,
            borderBottomWidth: i < items.length - 1 ? 1 : 0,
            borderColor: '#1F2A44'
          }}
        >
          <Text style={{ color: '#E6EDF3', fontSize: 16, fontWeight: '600' }}>
            {item.title}
          </Text>
          <Text style={{ color: theme.colors.textDim, marginTop: 4 }}>
            ${item.price} • ⭐ {item.rating} • ETA {item.eta}
          </Text>
        </View>
      ))}
      
      <View style={{
        marginTop: theme.space.md,
        padding: theme.space.sm,
        backgroundColor: '#0E1A33',
        borderRadius: theme.radius.sm
      }}>
        <Text style={{ color: theme.colors.success, fontWeight: '600' }}>
          🏆 Best Pick (Lowest Price)
        </Text>
        <Text style={{
          color: theme.colors.text,
          fontWeight: '700',
          fontSize: 16,
          marginTop: 4
        }}>
          {best.title}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.md,
            borderRadius: theme.radius.sm,
            marginTop: theme.space.sm,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Add to Cart - ${best.price}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}