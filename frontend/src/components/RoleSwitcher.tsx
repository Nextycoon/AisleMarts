import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useUser } from '../state/user';
import { colors } from '../theme/tokens';

const roles: Array<{key:'shopper'|'seller'|'hybrid'; label:string; emoji:string}> = [
  { key:'shopper', label:'Shopper', emoji:'🛒' },
  { key:'seller',  label:'Seller',  emoji:'🏪' },
  { key:'hybrid',  label:'Hybrid',  emoji:'🔁' },
];

export default function RoleSwitcher(){
  const role = useUser(s => s.role);
  const setRole = useUser(s => s.setRole);

  return (
    <View style={styles.wrap}>
      {roles.map(r => {
        const active = r.key === role;
        return (
          <TouchableOpacity
            key={r.key}
            onPress={() => { Haptics.selectionAsync(); setRole(r.key); }}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.txt, active && styles.txtActive]}>
              {r.emoji} {r.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{
    flexDirection:'row',
    backgroundColor: colors.glass.primary,
    borderRadius:14,
    padding:4,
    borderWidth:1,
    borderColor: colors.border.primary,
  },
  btn:{
    paddingVertical:8,
    paddingHorizontal:10,
    borderRadius:10,
    marginHorizontal:2,
  },
  btnActive:{
    backgroundColor:'#ffffff',
  },
  txt:{ color:'#fff', fontWeight:'600', fontSize:13 },
  txtActive:{ color:'#000' },
});