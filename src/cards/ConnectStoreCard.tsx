import { View, Text, TouchableOpacity } from 'react-native';

export function ConnectStoreCard({onConnect}:{onConnect:(p:{platform:string})=>void}) {
  const rows = [
    {label:'Shopify', key:'shopify'},
    {label:'WooCommerce', key:'woo'},
    {label:'CS-Cart', key:'cscart'}
  ];
  return (
    <View style={{backgroundColor:'#121A2A', padding:16, borderRadius:12}}>
      <Text style={{color:'#fff', fontWeight:'700'}}>Connect your store</Text>
      <Text style={{color:'#B8C2CC', marginTop:6}}>AI will import your catalog & optimize listings.</Text>
      {rows.map(r=>(
        <TouchableOpacity key={r.key} onPress={()=>onConnect({platform:r.key})} style={{marginTop:10, backgroundColor:'#0E1A33', padding:12, borderRadius:10}}>
          <Text style={{color:'#E6EDF3'}}>Link {r.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
