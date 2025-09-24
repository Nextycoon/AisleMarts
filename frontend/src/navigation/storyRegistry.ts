import { RefObject } from 'react';import { FlatList } from 'react-native';type Story={id:string};let _ref:RefObject<FlatList<any>>|null=null;let _data:Story[]=[];let _indexById=new Map<string,number>();let _queue:string[]=[];
export function registerStoriesRef(ref:RefObject<FlatList<any>>){_ref=ref;flushQueue();}
export function registerStoriesData(data:Story[]){_data=data||[];_indexById=new Map(_data.map((s,i)=>[s.id,i]));flushQueue();}
export function scrollToStory(id:string){if(!_ref||!_ref.current||!_indexById.has(id)){_queue.push(id);return false;}const index=_indexById.get(id)!;try{_ref.current!.scrollToIndex({index,animated:true});return true;}catch{return false;}}
function flushQueue(){if(!_ref||!_ref.current||!_indexById.size)return;const q=[..._queue];_queue=[];for(const id of q)if(_indexById.has(id)){try{_ref.current!.scrollToIndex({index:_indexById.get(id)!,animated:true});}catch{}}}
