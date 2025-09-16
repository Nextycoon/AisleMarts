import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Temporarily commented out to isolate error
// import { AuthProvider } from '@/src/context/AuthContext'; 
// import { OfflineProvider } from '@/src/utils/OfflineManager';
// import { ThemeProvider } from '@/src/theme/ThemeProvider';
// import { ToastProvider, ToastHost } from '@/src/components/ToastHost';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
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
          <Stack.Screen name="discover" options={{ title: 'Discover', headerShown: false }} />
          <Stack.Screen name="command-center" options={{ title: 'Command Center', headerShown: false }} />
          <Stack.Screen name="ai-chat" options={{ title: 'AI Assistant', headerShown: false }} />
          <Stack.Screen name="b2b" options={{ title: 'B2B Portal', headerShown: false }} />
          <Stack.Screen name="nearby" options={{ title: 'Nearby', headerShown: false }} />
          <Stack.Screen name="merchant" options={{ title: 'Merchant Tools', headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}