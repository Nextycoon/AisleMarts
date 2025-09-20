import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
// Temporarily disabled due to cache artifact - will re-enable post cache purge
// import { AwarenessProvider } from '../lib/awarenessContext';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} hidden={false} />
      <ErrorBoundary>
        {/* Temporarily disabled - cache purge in progress */}
        {/* <AwarenessProvider> */}
          <AuthProvider>
            <UserRolesProvider>
              <Stack 
                screenOptions={{ 
                  headerShown: false,
                  contentStyle: styles.screen,
                  animation: 'fade',
                }} 
              />
            </UserRolesProvider>
          </AuthProvider>
        {/* </AwarenessProvider> */}
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    margin: 0,
    padding: 0,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    margin: 0,
    padding: 0,
  },
});