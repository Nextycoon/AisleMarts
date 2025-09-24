import React,{useEffect,useMemo,useState} from 'react'; import { SafeAreaView, Text } from 'react-native';
import type { Creator, Story } from './types'; import { VirtualizedRings } from './VirtualizedRings'; import { StoryViewer } from './StoryViewer';
import { MediaCacheLRU } from './MediaCacheLRU'; import { PreloadCoordinator } from './PreloadCoordinator';
export const InfinityStoriesScreen:React.FC=()=>{
  const [creators,setCreators]=useState<Creator[]>([]); const [viewed,setViewed]=useState<Record<string,boolean>>({});
  const [open,setOpen]=useState(false); const [current,setCurrent]=useState<Creator|null>(null);
  const [storiesBy,setStoriesBy]=useState<Record<string,Story[]>>({});
  const cache=useMemo(()=>new MediaCacheLRU(),[]); const preload=useMemo(()=>new PreloadCoordinator(cache),[cache]);
  useEffect(()=>{ fetch('/api/creators').then(r=>r.json()).then(setCreators).catch(()=>{}); fetch('/api/stories?limit=24').then(r=>r.json()).then(({data})=>{
    const g:Record<string,Story[]>= {}; const now=Date.now(); for(const s of data){ if(now < new Date(s.expiresAt).getTime()) { (g[s.creatorId] ||= []).push(s); } } setStoriesBy(g);
  }); },[]);
  return (<SafeAreaView style={{flex:1,backgroundColor:'#000'}}>
    <VirtualizedRings creators={creators} viewed={viewed} onPress={(c)=>{setCurrent(c); setOpen(true);}} />
    {open && current && <StoryViewer stories={storiesBy[current.id]||[]} onClose={()=>setOpen(false)} onExit={()=>{ setViewed(v=>({...v,[current!.id]:true})); setOpen(false); }} onProduct={(pid)=>{}} preload={preload} />}
    <Text style={{color:'#888',textAlign:'center',margin:8}}>Infinity Stories</Text>
  </SafeAreaView>);
};
export default InfinityStoriesScreen;
