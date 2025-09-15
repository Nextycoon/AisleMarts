import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import StatTile from '../components/StatTile';
import ProductListItem from '../components/ProductListItem';

export default function SellerDashboard(){
  const [stats, setStats] = useState({revenue: 0, orders: 0, views: 0, commission: 0});
  const [products, setProducts] = useState<any[]>([]);

  useEffect(()=>{
    // TODO: fetch from /seller/analytics/summary and /seller/products
    setStats({revenue: 12450, orders: 312, views: 9821, commission: 124.5});
    setProducts([
      {id:'p1', title:'Wireless Earbuds X', price:39.99, stock:120, sku:'WX-100', image:'', active:true},
      {id:'p2', title:'Noise Cancelling Headphones', price:99.00, stock:45, sku:'NC-200', image:'', active:true},
      {id:'p3', title:'Travel Charger 65W', price:29.00, stock:0, sku:'TC-65', image:'', active:false}
    ]);
  },[]);

  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>Seller Dashboard</Text>
      <Text style={{color:'#B8C2CC', marginBottom:12}}>Manage products, orders, and performance</Text>

      <View style={{flexDirection:'row', flexWrap:'wrap'}}>
        <StatTile label="Revenue (30d)" value={`$${stats.revenue.toLocaleString()}`} sub="+12% vs prev" />
        <StatTile label="Orders (30d)" value={stats.orders} sub="+8%" />
        <StatTile label="Views (30d)" value={stats.views} sub="+22%" />
        <StatTile label="Commission (1%)" value={`$${stats.commission.toFixed(2)}`} />
      </View>

      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginVertical:8}}>
        <Text style={{color:'#fff', fontWeight:'700'}}>Products</Text>
        <TouchableOpacity onPress={()=>{/* navigate to ProductEditor */}}><Text style={{color:'#7CB3FF'}}>+ Add Product</Text></TouchableOpacity>
      </View>

      {products.map(p=>(
        <ProductListItem key={p.id} title={p.title} price={p.price} stock={p.stock} sku={p.sku} image={p.image}
          active={p.active}
          onEdit={()=>{/* navigate with p.id */}}
          onToggle={()=>{/* call /seller/products/:id/toggle */}} />
      ))}
    </ScrollView>
  );
}
