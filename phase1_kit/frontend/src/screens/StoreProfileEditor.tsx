import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import ImagePickerRow from '../components/ImagePickerRow';

export default function StoreProfileEditor(){
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [mpesaPaybill, setMpesaPaybill] = useState('');
  const [logo, setLogo] = useState<string[]>([]);

  const save = ()=>{
    // TODO: PUT /seller/profile
  };

  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>Store Profile</Text>
      <View style={{marginTop:12}}>
        <TextInput placeholder="Store Name" placeholderTextColor="#8AA0B3" value={storeName} onChangeText={setStoreName} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <TextInput placeholder="Contact Email" keyboardType="email-address" placeholderTextColor="#8AA0B3" value={contactEmail} onChangeText={setContactEmail} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <TextInput placeholder="Contact Phone (+254...)" keyboardType="phone-pad" placeholderTextColor="#8AA0B3" value={contactPhone} onChangeText={setContactPhone} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <TextInput placeholder="M-Pesa Paybill/Till" placeholderTextColor="#8AA0B3" value={mpesaPaybill} onChangeText={setMpesaPaybill} style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:10, padding:12, marginBottom:10}} />
        <ImagePickerRow images={logo} onPick={()=>{/* pick logo */}} />
      </View>
      <TouchableOpacity onPress={save} style={{marginTop:16, backgroundColor:'#0056D2', padding:14, borderRadius:12, alignItems:'center'}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
