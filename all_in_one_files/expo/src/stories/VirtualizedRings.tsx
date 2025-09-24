import React from 'react'; import { View, FlatList } from 'react-native';
import type { Creator } from './types';
export const VirtualizedRings: React.FC<{ creators:Creator[]; viewed:Record<string,boolean>; onPress:(c:Creator,i:number)=>void }>=({creators,viewed,onPress})=>{
  return (<View testID="story-tray"><FlatList horizontal data={creators} keyExtractor={(i)=>i.id} removeClippedSubviews initialNumToRender={12} maxToRenderPerBatch={16} windowSize={5} renderItem={({item,index})=>(<View style={{width:80,margin:8}}>
    <View style={{width:64,height:64,borderRadius:32,borderWidth:3,borderColor:viewed[item.id]?'#9CA3AF':(item.tier==='gold'?'#D4AF37':item.tier==='blue'?'#3B82F6':item.tier==='grey'?'#9CA3AF':'#6B7280')}} />
    <View onTouchEnd={()=>onPress(item,index)} testID={`creator-ring-${index}`} />
  </View>)} /></View>);
};
