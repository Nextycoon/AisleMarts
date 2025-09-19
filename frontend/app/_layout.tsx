import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <UserRolesProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: '#000000' }, // Ensure full black background
                animation: 'fade',
              }} 
            />
          </UserRolesProvider>
        </AuthProvider>
        <StatusBar style="light" backgroundColor="#000000" translucent={true} />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}