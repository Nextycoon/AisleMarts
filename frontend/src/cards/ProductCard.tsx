import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme/theme';

interface ProductCardProps {
  product: {
    title: string;
    description?: string;
    price: number;
    rating: number;
    eta: string;
    image?: string;
    savings?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View style={{
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.md,
      padding: theme.space.md,
      borderWidth: 1,
      borderColor: '#1F2A44'
    }}>
      {/* Product Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        gap: theme.space.sm,
        marginBottom: theme.space.sm 
      }}>
        {product.image && (
          <Image 
            source={{ uri: product.image }}
            style={{
              width: 60,
              height: 60,
              borderRadius: theme.radius.sm,
              backgroundColor: '#1F2A44'
            }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 4
          }}>
            {product.title}
          </Text>
          {product.description && (
            <Text style={{
              color: theme.colors.textDim,
              fontSize: 14,
              lineHeight: 20
            }}>
              {product.description}
            </Text>
          )}
        </View>
      </View>

      {/* Product Details */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.space.md
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
          {product.price > 0 && (
            <Text style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: '700'
            }}>
              ${product.price}
            </Text>
          )}
          {product.savings && (
            <View style={{
              backgroundColor: theme.colors.success,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                Save ${product.savings}
              </Text>
            </View>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
          <Text style={{ color: theme.colors.textDim, fontSize: 14 }}>
            ⭐ {product.rating}
          </Text>
          <Text style={{ color: theme.colors.textDim, fontSize: 14 }}>
            • ETA {product.eta}
          </Text>
        </View>
      </View>

      {/* AI Badge */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.xs,
        marginBottom: theme.space.md
      }}>
        <Text style={{ fontSize: 16 }}>🤖</Text>
        <Text style={{
          color: theme.colors.primary,
          fontSize: 12,
          fontWeight: '600'
        }}>
          AI-Powered Recommendation
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{
        flexDirection: 'row',
        gap: theme.space.sm
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.space.sm,
            borderRadius: theme.radius.sm,
            alignItems: 'center'
          }}
        >
          <Text style={{
            color: 'white',
            fontWeight: '600',
            fontSize: 14
          }}>
            {product.price > 0 ? `Add to Cart - $${product.price}` : 'Learn More'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#0E1A33',
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.md,
            borderRadius: theme.radius.sm,
            alignItems: 'center'
          }}
        >
          <Text style={{
            color: theme.colors.textDim,
            fontWeight: '600',
            fontSize: 14
          }}>
            Compare
          </Text>
        </TouchableOpacity>
      </View>

      {/* Smart Suggestion */}
      {product.price > 0 && (
        <View style={{
          marginTop: theme.space.sm,
          padding: theme.space.sm,
          backgroundColor: '#0A2F1A',
          borderRadius: theme.radius.sm,
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.success
        }}>
          <Text style={{
            color: theme.colors.success,
            fontSize: 12,
            fontWeight: '600'
          }}>
            💡 AI Insight: This is the best price in your area for this item
          </Text>
        </View>
      )}
    </View>
  );
}