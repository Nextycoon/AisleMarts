import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <ErrorBoundary>
        <AuthProvider>
          <UserRolesProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: '#000000' },
                animation: 'fade',
              }} 
            />
          </UserRolesProvider>
        </AuthProvider>
        <StatusBar style="light" backgroundColor="transparent" translucent={true} hidden={false} />
      </ErrorBoundary>
    </View>
  );
}