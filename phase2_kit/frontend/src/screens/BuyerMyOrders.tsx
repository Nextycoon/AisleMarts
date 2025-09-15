import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

type Order = { id: string; createdAt: string; total: number; status: 'pending'|'paid'|'shipped'|'delivered'|'cancelled'; seller: string };

export default function BuyerMyOrders({navigation}:any){
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(()=>{
    // TODO: GET /buyer/orders (secure)
    setOrders([
      {id:'O-10023', createdAt:'2025-09-12', total:9999, status:'paid', seller:'My Awesome Store'}
    ]);
  },[]);
  const badge = (s:Order['status'])=>{
    const colors:any = {pending:'#F59E0B', paid:'#22C55E', shipped:'#60A5FA', delivered:'#34D399', cancelled:'#EF4444'};
    return <Text style={{color:colors[s], fontWeight:'700'}}>{s.toUpperCase()}</Text>;
  };
  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>My Orders</Text>
      {orders.map(o=>(
        <View key={o.id} style={{backgroundColor:'#121A2A', padding:14, borderRadius:12, marginTop:10}}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text style={{color:'#fff', fontWeight:'700'}}>{o.id} • {o.seller}</Text>
            {badge(o.status)}
          </View>
          <Text style={{color:'#B8C2CC'}}>{o.createdAt} • KES {o.total.toFixed(0)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
