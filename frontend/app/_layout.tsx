import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext'; 
import { UserRolesProvider } from '@/src/context/UserRolesContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import GlobalLanguageProvider from '../components/GlobalLanguageProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Environment-based Configuration - FULL MODE GO-LIVE with Safety Rails
const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE === 'true';
const enableAwareness = process.env.NEXT_PUBLIC_AWARENESS_ENABLED === 'true';

function AppProviders({ children }: { children: React.ReactNode }) {
  if (safeMode || !enableAwareness) {
    console.log('🛡️ SAFE MODE ACTIVE: All enhanced features available except awareness');
    return <>{children}</>;
  }
  
  try {
    console.log('🌊 FULL MODE ACTIVE: Loading Awareness Context - Blue Wave Go-Live');
    // Lazy import with safety guard to prevent cache issues
    const { AwarenessProvider } = require('../lib/awarenessContext');
    return (
      <AwarenessProvider>
        {children}
      </AwarenessProvider>
    );
  } catch (error) {
    console.warn('🔄 Awareness Context failed to load, falling back to Safe Mode:', error);
    return <>{children}</>;
  }
}

export default function RootLayout() {
  return (
    <GlobalLanguageProvider>
      <View style={styles.container}>
        {/* Language Switcher - Global Access */}
        <View style={styles.languageToggle}>
          <LanguageSwitcher compact={true} />
        </View>
        
        <StatusBar style="light" backgroundColor="transparent" translucent={true} hidden={false} />
        
        {/* Digital Lifestyle Universe Badge */}
        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>
            🌍 AisleMarts • The Digital Lifestyle Universe
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
    </GlobalLanguageProvider>
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
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: 12,
    zIndex: 10000,
  },
  networkBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    zIndex: 9999,
    backdropFilter: 'blur(10px)',
  },
  networkText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});