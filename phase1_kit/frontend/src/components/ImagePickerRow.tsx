import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function ImagePickerRow({images, onPick}:{images:string[]; onPick:()=>void}){
  return (
    <View style={{backgroundColor:'#0F172A', borderRadius:10, padding:12, marginBottom:10}}>
      <Text style={{color:'#9FB0C0', marginBottom:10}}>Images</Text>
      <View style={{flexDirection:'row'}}>
        {images.map((uri, i)=> <Image key={i} source={{uri}} style={{width:56, height:56, borderRadius:8, marginRight:8}} />)}
        <TouchableOpacity onPress={onPick} style={{backgroundColor:'#111827', paddingHorizontal:14, paddingVertical:10, borderRadius:8}}>
          <Text style={{color:'#7CB3FF'}}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
