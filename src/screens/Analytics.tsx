import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import StatTile from '../components/StatTile';

export default function Analytics(){
  const [kpis, setKpis] = useState({ revenue30: 0, orders30: 0, aov: 0, ctr: 0, aiShare: 0 });

  useEffect(()=>{
    // TODO: fetch /seller/analytics/summary
    setKpis({ revenue30: 12450, orders30: 312, aov: 39.9, ctr: 3.4, aiShare: 0.62 });
  },[]);

  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>Analytics</Text>
      <View style={{flexDirection:'row', flexWrap:'wrap', marginTop:12}}>
        <StatTile label="Revenue (30d)" value={`$${kpis.revenue30.toLocaleString()}`} />
        <StatTile label="Orders (30d)" value={kpis.orders30} />
        <StatTile label="AOV" value={`$${kpis.aov}`} />
        <StatTile label="CTR (AI Suggestions)" value={`${kpis.ctr}%`} />
        <StatTile label="AI-driven Sales" value={`${Math.round(kpis.aiShare*100)}%`} sub="Share of total" />
      </View>
      <Text style={{color:'#B8C2CC', marginTop:16}}>Charts placeholder — connect to /seller/analytics/timeseries</Text>
    </ScrollView>
  );
}
