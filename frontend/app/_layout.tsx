import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AwarenessProvider } from '../lib/awarenessContext';

// Environment-based Configuration - FULL MODE GO-LIVE
const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE === 'true';
const enableAwareness = process.env.NEXT_PUBLIC_AWARENESS_ENABLED === 'true';

function AppProviders({ children }: { children: React.ReactNode }) {
  if (safeMode || !enableAwareness) {
    console.log('🛡️ SAFE MODE ACTIVE: All enhanced features available except awareness');
    return <>{children}</>;
  }
  
  console.log('🌊 FULL MODE ACTIVE: Awareness Context Enabled - Blue Wave Go-Live');
  return (
    <AwarenessProvider>
      {children}
    </AwarenessProvider>
  );
}

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} hidden={false} />
      
      {/* Mode Status Badge */}
      <View style={styles.modeBadge}>
        <Text style={styles.modeText}>
          {safeMode || !enableAwareness ? 'SAFE MODE • Awareness disabled' : 'FULL MODE • Blue Wave Live 🌊'}
        </Text>
      </View>
      
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
  safeModebadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(15, 111, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#0F6FFF',
    borderRadius: 8,
    zIndex: 9999,
  },
  safeModeText: {
    fontSize: 12,
    color: '#0F6FFF',
    fontWeight: '600',
  },
});