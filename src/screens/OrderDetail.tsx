import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function OrderDetail({route}:any){
  const { id } = route?.params || { id: 'O-10023' };
  // TODO: fetch /seller/orders/:id
  const order = {
    id,
    status:'paid',
    customer:{name:'A. Njeri', phone:'+2547...'},
    items:[{title:'Wireless Earbuds X', qty:1, price:39.99},{title:'Travel Charger 65W', qty:2, price:29.00}],
    total:97.99,
    shipping:{address:'Nairobi CBD', method:'Standard', eta:'2 days'}
  };

  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>Order {order.id}</Text>
      <Text style={{color:'#B8C2CC', marginBottom:8}}>Status: {order.status.toUpperCase()}</Text>

      <View style={{backgroundColor:'#121A2A', padding:12, borderRadius:12, marginBottom:12}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>Customer</Text>
        <Text style={{color:'#B8C2CC'}}>{order.customer.name} • {order.customer.phone}</Text>
      </View>

      <View style={{backgroundColor:'#121A2A', padding:12, borderRadius:12, marginBottom:12}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>Items</Text>
        {order.items.map((it,i)=>(
          <View key={i} style={{flexDirection:'row', justifyContent:'space-between', marginTop:6}}>
            <Text style={{color:'#E6EDF3'}}>{it.title} × {it.qty}</Text>
            <Text style={{color:'#B8C2CC'}}>${(it.qty*it.price).toFixed(2)}</Text>
          </View>
        ))}
        <View style={{height:1, backgroundColor:'#1F2A44', marginVertical:8}} />
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={{color:'#fff', fontWeight:'700'}}>Total</Text>
          <Text style={{color:'#fff', fontWeight:'700'}}>${order.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={{backgroundColor:'#121A2A', padding:12, borderRadius:12}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>Shipping</Text>
        <Text style={{color:'#B8C2CC'}}>{order.shipping.address} • {order.shipping.method} • ETA {order.shipping.eta}</Text>
      </View>

      <TouchableOpacity style={{marginTop:16, backgroundColor:'#0056D2', padding:14, borderRadius:12, alignItems:'center'}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>Mark as Shipped</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
