import { View, Text } from 'react-native';

export function CompareCard({items}:{items:{title:string,price:number,rating:number,eta:string}[]}) {
  const best = items.reduce((a,b)=> (a.price<=b.price ? a : b));
  return (
    <View style={{backgroundColor:'#121A2A', borderRadius:12, padding:14}}>
      <Text style={{color:'#fff', fontWeight:'700'}}>Compare</Text>
      {items.map((it, i)=>(
        <View key={i} style={{paddingVertical:8, borderBottomWidth:i<items.length-1?1:0, borderColor:'#1F2A44'}}>
          <Text style={{color:'#E6EDF3'}}>{it.title}</Text>
          <Text style={{color:'#B8C2CC'}}>${it.price} • ⭐ {it.rating} • ETA {it.eta}</Text>
        </View>
      ))}
      <View style={{marginTop:10, padding:10, backgroundColor:'#0E1A33', borderRadius:10}}>
        <Text style={{color:'#22C55E'}}>Best pick</Text>
        <Text style={{color:'#fff', fontWeight:'700'}}>{best.title}</Text>
      </View>
    </View>
  );
}
