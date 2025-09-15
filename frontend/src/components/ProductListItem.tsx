import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

type Props = {
  title: string;
  price: number;
  stock: number;
  sku?: string;
  image?: string;
  onEdit?: () => void;
  onToggle?: () => void;
  active?: boolean;
};

export default function ProductListItem({ 
  title, 
  price, 
  stock, 
  sku, 
  image, 
  onEdit, 
  onToggle, 
  active = true 
}: Props) {
  const stockStatus = stock > 0 ? `Stock ${stock}` : 'Out of stock';
  const stockColor = stock > 0 ? theme.colors.textDim : theme.colors.warning;

  return (
    <View style={{
      flexDirection: 'row', 
      padding: theme.space.md, 
      borderRadius: theme.radius.md, 
      backgroundColor: theme.colors.card, 
      marginBottom: theme.space.sm,
      borderWidth: active ? 0 : 1,
      borderColor: active ? 'transparent' : theme.colors.warning
    }}>
      <Image 
        source={{uri: image || 'https://via.placeholder.com/64x64/333/fff?text=Product'}} 
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radius.sm, 
          marginRight: theme.space.md
        }} 
      />
      <View style={{flex: 1}}>
        <Text style={{
          color: theme.colors.text, 
          fontWeight: '700',
          fontSize: 16,
          marginBottom: 4
        }}>
          {title}
        </Text>
        <Text style={{color: stockColor, marginBottom: 8}}>
          KES {price.toFixed(2)} • {stockStatus}{sku ? ` • ${sku}` : ''}
        </Text>
        <View style={{flexDirection: 'row', gap: theme.space.md}}>
          <TouchableOpacity onPress={onEdit}>
            <Text style={{color: theme.colors.primary, fontWeight: '600'}}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggle}>
            <Text style={{
              color: active ? theme.colors.success : theme.colors.warning,
              fontWeight: '600'
            }}>
              {active ? 'Active' : 'Paused'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}