import React,{useMemo,useRef,useEffect} from 'react';import {FlatList,FlatListProps} from 'react-native';import {registerStoriesRef,registerStoriesData}from'../navigation/storyRegistry';
type Story={id:string};type Props<ItemT extends Story>=Omit<FlatListProps<ItemT>,'ref'>&{testIdBase?:string};
export default function StoriesBinder<ItemT extends Story>(props:Props<ItemT>){const{data,testIdBase='story-card',...rest}=props as any;const ref=useRef<FlatList<ItemT>>(null);
useEffect(()=>{registerStoriesRef(ref);},[]);useEffect(()=>{registerStoriesData((data??[]) as any);},[data]);
const renderItem=useMemo(()=>{const r=(props as any).renderItem;if(!r)return undefined;return({item,index}:any)=>{const node=r({item,index});return React.cloneElement(node,{testID:`${testIdBase}-${index}`,...(node.props||{})});};},[props]);
return <FlatList ref={ref} testID="stories-tray" data={data} renderItem={renderItem} {...rest}/>;}
