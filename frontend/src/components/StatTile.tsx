import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme/theme';

export default function StatTile({label, value, sub}:{label:string, value:string|number, sub?:string}){
  return (
    <View style={{
      backgroundColor: theme.colors.card, 
      padding: theme.space.md, 
      borderRadius: theme.radius.md, 
      minWidth: 140, 
      marginRight: theme.space.sm, 
      marginBottom: theme.space.sm
    }}>
      <Text style={{color: theme.colors.textDim, fontSize: 12}}>{label}</Text>
      <Text style={{
        color: theme.colors.text, 
        fontSize: 22, 
        fontWeight: '800', 
        marginTop: 6
      }}>
        {value}
      </Text>
      {sub ? <Text style={{color: theme.colors.primary, marginTop: 4}}>{sub}</Text> : null}
    </View>
  );
}