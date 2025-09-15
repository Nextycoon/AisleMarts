import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

type Order = { id: string; createdAt: string; total: number; status: 'pending'|'paid'|'shipped'|'delivered'|'cancelled'; customer: string };

export default function SellerOrders({navigation}:any){
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(()=>{
    // TODO: fetch /seller/orders (auth required)
    setOrders([
      {id:'O-10023', createdAt:'2025-09-10', total:128.50, status:'paid', customer:'A. Njeri'},
      {id:'O-10024', createdAt:'2025-09-11', total:39.99, status:'shipped', customer:'B. Otieno'},
      {id:'O-10025', createdAt:'2025-09-12', total:229.00, status:'pending', customer:'C. Kamau'}
    ]);
  },[]);

  const badge = (s:Order['status'])=>{
    const colors:any = {pending:'#F59E0B', paid:'#22C55E', shipped:'#60A5FA', delivered:'#34D399', cancelled:'#EF4444'};
    return <Text style={{color:colors[s], fontWeight:'700'}}>{s.toUpperCase()}</Text>;
  };

  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>Orders</Text>
      {orders.map(o=>(
        <TouchableOpacity key={o.id} onPress={()=>navigation.navigate('SellerOrderDetail',{id:o.id})}
          style={{backgroundColor:'#121A2A', padding:14, borderRadius:12, marginTop:10}}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text style={{color:'#fff', fontWeight:'700'}}>{o.id}</Text>
            {badge(o.status)}
          </View>
          <Text style={{color:'#B8C2CC'}}>{o.customer} • {o.createdAt} • KES {o.total.toFixed(2)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
