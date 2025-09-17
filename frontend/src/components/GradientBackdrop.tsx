import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { useUser } from '../state/user';
import { colors } from '../theme/tokens';

export const GradientBackdrop = () => {
  const r = useUser(s => s.role);
  const stops = r === 'shopper' ? colors.shopper : r === 'seller' ? colors.seller : colors.hybrid;
  return <LinearGradient colors={stops} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.g} />;
};

const styles = StyleSheet.create({ 
  g: { 
    position: 'absolute', 
    top: -200, 
    left: -100, 
    right: -100, 
    height: 420, 
    opacity: 0.35, 
    borderRadius: 24 
  }
});