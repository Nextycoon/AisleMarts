import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
// import { OfflineProvider } from '@/src/utils/OfflineManager';
// import { ThemeProvider } from '@/src/theme/ThemeProvider';
// import { ToastProvider, ToastHost } from '@/src/components/ToastHost';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <UserRolesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ title: 'AisleMarts' }} />
              <Stack.Screen name="checkout" options={{ title: 'Checkout', headerShown: true, headerStyle: { backgroundColor: '#0f0f23' }, headerTintColor: '#ffffff' }} />
              <Stack.Screen name="cart" options={{ title: 'Shopping Cart' }} />
              <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
            </Stack>
          </UserRolesProvider>
        </AuthProvider>
        <StatusBar style="light" />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}