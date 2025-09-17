import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/tokens';

export function Glass({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.wrap, style]} {...rest}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.border} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    backgroundColor: colors.glass.primary 
  },
  border: { 
    ...StyleSheet.absoluteFillObject, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: colors.border.primary 
  }
});