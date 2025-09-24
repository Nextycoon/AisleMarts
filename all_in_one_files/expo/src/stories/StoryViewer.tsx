import React,{useMemo,useState} from 'react'; import { View, Text, TouchableOpacity, Image } from 'react-native'; import type { Story } from './types'; import { PreloadCoordinator } from './PreloadCoordinator';
export const StoryViewer:React.FC<{stories:Story[]; onClose:()=>void; onExit:()=>void; onProduct:(id:string)=>void; preload:PreloadCoordinator}>=({stories,onClose,onExit,onProduct,preload})=>{
  const [i,setI]=useState(0); const s=stories[i]; useMemo(()=>{preload.preloadNext(i,stories)},[i,stories]);
  const next=()=> i<stories.length-1 ? setI(i+1) : onExit(); const prev=()=> i>0 ? setI(i-1) : null;
  const isVideo=/\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(s.mediaUrl);
  return (<View style={{flex:1,backgroundColor:'#000'}} testID="story-viewer">
    <Text style={{position:'absolute',top:24,left:16,color:'#fff'}} testID="creator-handle">@{s.creatorId}</Text>
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}} testID="story-surface">
      {isVideo ? <Text style={{color:'#fff'}}>Video: {s.mediaUrl}</Text> : <Image source={{uri:s.mediaUrl}} style={{width:'100%',height:'100%'}} />}
    </View>
    {s.type==='product' && s.productId && <TouchableOpacity onPress={()=>onProduct(s.productId!)} testID="cta-buy-now" style={{position:'absolute',bottom:48,left:16,right:16,backgroundColor:'#ef4444',padding:12,borderRadius:8,alignItems:'center'}}><Text style={{color:'#fff'}}>Buy Now</Text></TouchableOpacity>}
    <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,flexDirection:'row'}}>
      <TouchableOpacity style={{flex:1}} onPress={prev} />
      <TouchableOpacity style={{flex:1}} onPress={next} testID="story-tap-right" />
    </View>
    <TouchableOpacity onPress={onClose} testID="close-stories" style={{position:'absolute',top:24,right:16}}><Text style={{color:'#fff'}}>×</Text></TouchableOpacity>
    <View testID="preload-ready" style={{width:1,height:1,opacity:0,position:'absolute'}} />
  </View>);
};
