import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

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

export default function ProductListItem({ title, price, stock, sku, image, onEdit, onToggle, active=true }: Props) {
  return (
    <View style={{flexDirection:'row', padding:12, borderRadius:12, backgroundColor:'#121A2A', marginBottom:10}}>
      <Image source={{uri: image || 'https://via.placeholder.com/64'}} style={{width:64,height:64,borderRadius:8, marginRight:12}} />
      <View style={{flex:1}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>{title}</Text>
        <Text style={{color:'#B8C2CC'}}>${price.toFixed(2)} • Stock {stock}{sku ? ` • ${sku}` : ''}</Text>
        <View style={{flexDirection:'row', marginTop:8}}>
          <TouchableOpacity onPress={onEdit} style={{marginRight:16}}><Text style={{color:'#7CB3FF'}}>Edit</Text></TouchableOpacity>
          <TouchableOpacity onPress={onToggle}><Text style={{color: active ? '#22C55E' : '#F59E0B'}}>{active ? 'Active' : 'Paused'}</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
