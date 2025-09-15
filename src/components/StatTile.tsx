import React from 'react';
import { View, Text } from 'react-native';

export default function StatTile({label, value, sub}:{label:string, value:string|number, sub?:string}){
  return (
    <View style={{backgroundColor:'#121A2A', padding:16, borderRadius:12, minWidth:140, marginRight:12, marginBottom:12}}>
      <Text style={{color:'#B8C2CC', fontSize:12}}>{label}</Text>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800', marginTop:6}}>{value}</Text>
      {sub ? <Text style={{color:'#7CB3FF', marginTop:4}}>{sub}</Text> : null}
    </View>
  );
}
