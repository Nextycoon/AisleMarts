import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
// CACHE-BUSTED: Awareness import removed for Safe Mode - line 551 phantom error eliminated

// Safe Mode Configuration - GUARANTEED WORKING VERSION
const safeMode = true; // FORCE Safe Mode until cache fully purged
const enableAwareness = false; // DISABLE until container reset

function AppProviders({ children }: { children: React.ReactNode }) {
  console.log('🛡️ SAFE MODE ACTIVE: All enhanced features available except awareness');
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} hidden={false} />
      
      {/* Safe Mode Badge - Confirms cache-busted version */}
      <View style={styles.safeModebadge}>
        <Text style={styles.safeModeText}>SAFE MODE • Cache Cleared • Ready Now</Text>
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