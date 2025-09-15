import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import StatTile from '../components/StatTile';

type Payout = { id:string; amount:number; period:string; status:'scheduled'|'paid' };

export default function CommissionPanel(){
  const [totals, setTotals] = useState({gross:0, commission:0, net:0});
  const [history, setHistory] = useState<Payout[]>([]);

  useEffect(()=>{
    // TODO: GET /seller/commissions/summary and /seller/commissions/history
    setTotals({gross:12450, commission:124.5, net:12325.5});
    setHistory([
      {id:'C-2025-08', amount:98.2, period:'Aug 2025', status:'paid'},
      {id:'C-2025-09', amount:26.3, period:'Sep 2025 (to date)', status:'scheduled'}
    ]);
  },[]);

  return (
    <ScrollView style={{flex:1, padding:16}}>
      <Text style={{color:'#fff', fontSize:22, fontWeight:'800'}}>Commissions (1%)</Text>
      <View style={{flexDirection:'row', flexWrap:'wrap', marginTop:12}}>
        <StatTile label="Gross Sales (30d)" value={`$${totals.gross.toLocaleString()}`} />
        <StatTile label="Commission (1%)" value={`$${totals.commission.toFixed(2)}`} />
        <StatTile label="Net Payout" value={`$${totals.net.toFixed(2)}`} />
      </View>

      <Text style={{color:'#B8C2CC', marginTop:16}}>History</Text>
      {history.map(h=> (
        <View key={h.id} style={{backgroundColor:'#121A2A', padding:12, borderRadius:12, marginTop:8}}>
          <Text style={{color:'#fff', fontWeight:'700'}}>{h.period}</Text>
          <Text style={{color:'#B8C2CC'}}>${h.amount.toFixed(2)} • {h.status.toUpperCase()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
