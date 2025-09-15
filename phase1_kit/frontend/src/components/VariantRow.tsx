import React from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

export type Variant = { id: string; name: string; sku?: string; priceDelta?: number; stock?: number };

export default function VariantRow({v, onChange, onRemove}:{v:Variant; onChange:(nv:Variant)=>void; onRemove:()=>void}){
  return (
    <View style={{backgroundColor:'#0F172A', borderRadius:10, padding:12, marginBottom:10}}>
      <Text style={{color:'#9FB0C0', marginBottom:6}}>Variant</Text>
      <TextInput placeholder="Name (e.g., Black / 64GB)" placeholderTextColor="#8AA0B3" value={v.name}
        onChangeText={(t)=>onChange({...v, name:t})}
        style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:8, padding:10, marginBottom:8}} />
      <TextInput placeholder="SKU" placeholderTextColor="#8AA0B3" value={v.sku}
        onChangeText={(t)=>onChange({...v, sku:t})}
        style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:8, padding:10, marginBottom:8}} />
      <TextInput placeholder="Price Delta (optional)" keyboardType="decimal-pad" placeholderTextColor="#8AA0B3" value={v.priceDelta?.toString() || ''}
        onChangeText={(t)=>onChange({...v, priceDelta: Number(t) || 0})}
        style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:8, padding:10, marginBottom:8}} />
      <TextInput placeholder="Stock" keyboardType="number-pad" placeholderTextColor="#8AA0B3" value={v.stock?.toString() || ''}
        onChangeText={(t)=>onChange({...v, stock: Number(t) || 0})}
        style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:8, padding:10}} />
      <TouchableOpacity onPress={onRemove} style={{marginTop:10}}><Text style={{color:'#FCA5A5'}}>Remove</Text></TouchableOpacity>
    </View>
  );
}
