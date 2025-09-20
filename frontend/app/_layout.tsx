import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AwarenessProvider } from '../lib/awarenessContext';

// Safe Mode Configuration
const safeMode = process.env.EXPO_PUBLIC_SAFE_MODE === 'true' || true; // Force Safe Mode for preview
const enableAwareness = process.env.EXPO_PUBLIC_AWARENESS_ENABLED === 'true' && !safeMode;

function AppProviders({ children }: { children: React.ReactNode }) {
  if (safeMode || !enableAwareness) {
    console.log('🛡️ SAFE MODE: Awareness disabled in preview');
    return <>{children}</>;
  }
  return <AwarenessProvider>{children}</AwarenessProvider>;
}

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} hidden={false} />
      
      {/* Safe Mode Badge */}
      {safeMode && (
        <View style={styles.safeModebadge}>
          <Text style={styles.safeModeText}>SAFE MODE • Awareness disabled (preview)</Text>
        </View>
      )}
      
      <ErrorBoundary>
        <AppProviders>
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
        </AppProviders>
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