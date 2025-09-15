import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function SellerOrderDetail({route}:any){
  const { id } = route?.params || { id: 'O-10023' };
  const [order, setOrder] = useState<any>(null);

  useEffect(()=>{
    // TODO: GET /seller/orders/:id
    setOrder({
      id,
      status:'paid',
      customer:{name:'A. Njeri', phone:'+254712345678'},
      items:[{title:'Wireless Earbuds X', qty:1, price:3999}, {title:'Travel Charger 65W', qty:2, price:2900}],
      subtotal: 9799,
      shipping: 200,
      total: 9999,
      address:'Nairobi CBD',
      method:'Delivery',
      events:[
        {t:'2025-09-12 10:10', e:'Order placed'},
        {t:'2025-09-12 10:12', e:'Payment received (M-Pesa)'},
      ]
    });
  },[id]);

  const setStatus = (s:'shipped'|'delivered'|'cancelled')=>{
    // TODO: POST /seller/orders/:id {status:s}
  };

  if(!order) return null;

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
        {order.items.map((it:any,i:number)=>(
          <View key={i} style={{flexDirection:'row', justifyContent:'space-between', marginTop:6}}>
            <Text style={{color:'#E6EDF3'}}>{it.title} × {it.qty}</Text>
            <Text style={{color:'#B8C2CC'}}>KES {(it.qty*it.price).toFixed(0)}</Text>
          </View>
        ))}
        <View style={{height:1, backgroundColor:'#1F2A44', marginVertical:8}} />
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={{color:'#fff'}}>Subtotal</Text><Text style={{color:'#fff'}}>KES {order.subtotal.toFixed(0)}</Text>
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={{color:'#fff'}}>Shipping</Text><Text style={{color:'#fff'}}>KES {order.shipping.toFixed(0)}</Text>
        </View>
        <View style={{height:1, backgroundColor:'#1F2A44', marginVertical:8}} />
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={{color:'#fff', fontWeight:'800'}}>Total</Text><Text style={{color:'#fff', fontWeight:'800'}}>KES {order.total.toFixed(0)}</Text>
        </View>
      </View>

      <View style={{backgroundColor:'#121A2A', padding:12, borderRadius:12, marginBottom:12}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>Timeline</Text>
        {order.events.map((ev:any,i:number)=>(
          <Text key={i} style={{color:'#B8C2CC'}}>• {ev.t} — {ev.e}</Text>
        ))}
      </View>

      <View style={{flexDirection:'row', gap:10}}>
        <TouchableOpacity onPress={()=>setStatus('shipped')} style={{flex:1, backgroundColor:'#2563EB', padding:14, borderRadius:12, alignItems:'center'}}>
          <Text style={{color:'#fff', fontWeight:'700'}}>Mark as Shipped</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setStatus('delivered')} style={{flex:1, backgroundColor:'#059669', padding:14, borderRadius:12, alignItems:'center'}}>
          <Text style={{color:'#fff', fontWeight:'700'}}>Mark as Delivered</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
