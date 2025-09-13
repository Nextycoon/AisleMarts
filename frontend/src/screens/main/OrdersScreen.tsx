import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrdersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Orders Screen - Coming Soon</Text>
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

export default OrdersScreen;