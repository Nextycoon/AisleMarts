import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function AvatarHome() {
  const [q, setQ] = useState('');
  const send = (payload:any)=>{/* TODO: call /ai/intents */};

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>AisleMarts — AI for Shopping</Text>
      <Text style={{color:'#B8C2CC'}}>Smarter. Faster. Everywhere.</Text>

      <View style={{flexDirection:'row', gap:8}}>
        <TouchableOpacity onPress={()=>send({type:'voice'})}><Text>🎤</Text></TouchableOpacity>
        <TouchableOpacity
          onPress={async ()=>{
            const res = await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images});
            if(!res.canceled) send({type:'image', uri: res.assets[0].uri});
          }}>
          <Text>🖼️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>send({type:'barcode'})}><Text>🏷️</Text></TouchableOpacity>
      </View>

      <TextInput
        placeholder="Ask me to find, compare, or bundle…"
        placeholderTextColor="#99A8B2"
        value={q} onChangeText={setQ}
        onSubmitEditing={()=>send({type:'text', text:q})}
        style={{backgroundColor:'#121A2A', color:'#fff', borderRadius:12, padding:14}}
      />

      <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
        {['Best deal nearby','Compare two products','Bundle under $200','Help me sell this'].map((t)=>(
          <TouchableOpacity key={t} onPress={()=>send({type:'prompt', text:t})} style={{backgroundColor:'#121A2A', paddingVertical:8, paddingHorizontal:12, borderRadius:999}}>
            <Text style={{color:'#E6EDF3'}}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{flex:1, marginTop:8}}>
        {/* Render SmartCards from AI */}
      </View>
    </View>
  );
}
