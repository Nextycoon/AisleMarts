import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#000',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'AisleMarts' }} />
            <Stack.Screen name="blue-era-home" options={{ title: 'Blue Era', headerShown: false }} />
            <Stack.Screen name="blue-era-dashboard" options={{ title: 'Blue Era Dashboard', headerShown: false }} />
            <Stack.Screen name="auth" options={{ title: 'Sign In' }} />
            <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
            <Stack.Screen name="cart" options={{ title: 'Shopping Cart' }} />
            <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="orders" options={{ title: 'My Orders' }} />
            <Stack.Screen name="profile" options={{ title: 'Profile' }} />
            <Stack.Screen name="vendor-dashboard" options={{ title: 'Seller Dashboard' }} />
          </Stack>
          <StatusBar style="dark" />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}