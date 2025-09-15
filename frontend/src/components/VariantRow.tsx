import React from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

export interface Variant {
  id: string;
  name: string;
  sku?: string;
  priceDelta?: number;
  stock?: number;
}

interface VariantRowProps {
  variant: Variant;
  onChange: (variant: Variant) => void;
  onRemove: () => void;
}

export default function VariantRow({ variant, onChange, onRemove }: VariantRowProps) {
  const updateField = (field: keyof Variant, value: string | number) => {
    onChange({ ...variant, [field]: value });
  };

  return (
    <View style={{
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.sm,
      padding: theme.space.md,
      marginBottom: theme.space.sm,
      borderWidth: 1,
      borderColor: theme.colors.textDim + '20'
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.space.sm
      }}>
        <Text style={{
          color: theme.colors.text,
          fontWeight: '600'
        }}>
          Variant
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Text style={{
            color: theme.colors.warning,
            fontWeight: '600',
            fontSize: 12
          }}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: theme.space.sm }}>
        <View>
          <Text style={{
            color: theme.colors.textDim,
            fontSize: 12,
            marginBottom: 4
          }}>
            Variant Name *
          </Text>
          <TextInput
            placeholder="e.g., Black / 64GB, Large, Blue"
            placeholderTextColor={theme.colors.textDim}
            value={variant.name}
            onChangeText={(text) => updateField('name', text)}
            style={{
              backgroundColor: theme.colors.bg,
              color: theme.colors.text,
              borderRadius: theme.radius.sm,
              padding: theme.space.sm,
              fontSize: 14,
              borderWidth: 1,
              borderColor: theme.colors.textDim + '30'
            }}
          />
        </View>

        <View>
          <Text style={{
            color: theme.colors.textDim,
            fontSize: 12,
            marginBottom: 4
          }}>
            SKU (Optional)
          </Text>
          <TextInput
            placeholder="Variant SKU"
            placeholderTextColor={theme.colors.textDim}
            value={variant.sku || ''}
            onChangeText={(text) => updateField('sku', text)}
            style={{
              backgroundColor: theme.colors.bg,
              color: theme.colors.text,
              borderRadius: theme.radius.sm,
              padding: theme.space.sm,
              fontSize: 14,
              borderWidth: 1,
              borderColor: theme.colors.textDim + '30'
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: theme.colors.textDim,
              fontSize: 12,
              marginBottom: 4
            }}>
              Price Difference (KES)
            </Text>
            <TextInput
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.textDim}
              value={variant.priceDelta?.toString() || ''}
              onChangeText={(text) => updateField('priceDelta', Number(text) || 0)}
              style={{
                backgroundColor: theme.colors.bg,
                color: theme.colors.text,
                borderRadius: theme.radius.sm,
                padding: theme.space.sm,
                fontSize: 14,
                borderWidth: 1,
                borderColor: theme.colors.textDim + '30'
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{
              color: theme.colors.textDim,
              fontSize: 12,
              marginBottom: 4
            }}>
              Stock
            </Text>
            <TextInput
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor={theme.colors.textDim}
              value={variant.stock?.toString() || ''}
              onChangeText={(text) => updateField('stock', Number(text) || 0)}
              style={{
                backgroundColor: theme.colors.bg,
                color: theme.colors.text,
                borderRadius: theme.radius.sm,
                padding: theme.space.sm,
                fontSize: 14,
                borderWidth: 1,
                borderColor: theme.colors.textDim + '30'
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}