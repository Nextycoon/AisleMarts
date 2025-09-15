import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import ImagePickerRow from '../components/ImagePickerRow';
import VariantRow, { Variant } from '../components/VariantRow';

export default function ProductEditor({route}:any){
  const editing = !!route?.params?.id;
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [desc, setDesc] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const addVariant = ()=> setVariants(v => [...v, {id: String(Date.now()), name:'', sku:'', stock:0, priceDelta:0}]);
  const removeVariant = (id:string)=> setVariants(v => v.filter(x=>x.id!==id));
  const updateVariant = (id:string, nv:Variant)=> setVariants(v => v.map(x=>x.id===id?nv:x));

  const save = ()=>{
    // TODO: POST/PUT /seller/products with {title, price, stock, sku, desc, images, variants}
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
        <ImagePickerRow images={images} onPick={()=>{/* wire native image picker */}} />
      </View>

      <View style={{marginTop:8}}>
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <Text style={{color:'#fff', fontWeight:'700'}}>Variants</Text>
          <TouchableOpacity onPress={addVariant}><Text style={{color:'#7CB3FF'}}>+ Add Variant</Text></TouchableOpacity>
        </View>
        {variants.map(v => <VariantRow key={v.id} v={v} onChange={(nv)=>updateVariant(v.id, nv)} onRemove={()=>removeVariant(v.id)} />)}
      </View>

      <TouchableOpacity onPress={save} style={{marginTop:16, backgroundColor:'#0056D2', padding:14, borderRadius:12, alignItems:'center'}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>{editing ? 'Save Changes' : 'Create Product'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
