import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useUser } from '../state/user';
import { colors, tierLabel, Tier } from '../theme/tokens';

const tiers: Tier[] = ['regular','premium','pro','business','firstclass','worldclass'];

export default function TierSwitcher(){
  const tier  = useUser(s => s.tier);
  const setTier = useUser(s => s.setTier);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {tiers.map(t => {
        const active = t === tier;
        return (
          <TouchableOpacity
            key={t}
            onPress={() => { Haptics.selectionAsync(); setTier(t); }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.txt, active && styles.txtActive]}>
              {tierLabel[t]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row:{ paddingVertical:6 },
  chip:{
    backgroundColor: colors.glass.primary,
    borderRadius:12,
    paddingVertical:6,
    paddingHorizontal:10,
    borderWidth:1,
    borderColor: colors.border.primary,
    marginRight:8,
  },
  chipActive:{ backgroundColor:'#fff' },
  txt:{ color:'#fff', fontSize:12, fontWeight:'600' },
  txtActive:{ color:'#000' },
});