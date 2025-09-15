import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function ProductEditor({route}:any){
  const editing = !!route?.params?.id;
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [desc, setDesc] = useState('');

  const save = ()=>{
    // TODO: POST/PUT /seller/products
  };

  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>{editing ? 'Edit Product' : 'Add Product'}</Text>
      <View style={{marginTop:12}}>
        <TextInput placeholder="Title" placeholderTextColor="#8AA0B3" value={title} onChangeText={setTitle} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <TextInput placeholder="Price" keyboardType="decimal-pad" placeholderTextColor="#8AA0B3" value={price} onChangeText={setPrice} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <TextInput placeholder="Stock" keyboardType="number-pad" placeholderTextColor="#8AA0B3" value={stock} onChangeText={setStock} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <TextInput placeholder="SKU" placeholderTextColor="#8AA0B3" value={sku} onChangeText={setSku} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <TextInput placeholder="Description" placeholderTextColor="#8AA0B3" value={desc} onChangeText={setDesc} multiline numberOfLines={5} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, minHeight:120}} />
      </View>
      <TouchableOpacity onPress={save} style={{marginTop:16, backgroundColor:'#0056D2', padding:14, borderRadius:12, alignItems:'center'}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>{editing ? 'Save Changes' : 'Create Product'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
