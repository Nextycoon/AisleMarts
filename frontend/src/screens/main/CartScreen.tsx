import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CartScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cart Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  text: {
    fontSize: 18,
    color: '#1C1C1E',
  },
});

export default CartScreen;