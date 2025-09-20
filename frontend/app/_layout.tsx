import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Import global providers
import { CurrencyProvider } from '../lib/currency/CurrencyProvider';

export default function RootLayout() {
  return (
    <CurrencyProvider>
      <LocationProvider>
        <StatusBar style="light" backgroundColor="#1A1A1A" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1A1A1A' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="aisle-agent" 
            options={{
              headerShown: false,
              presentation: 'card',
              animationTypeForReplace: 'push',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="cart" 
            options={{
              headerShown: false,
              presentation: 'card',
              animationTypeForReplace: 'push',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="chat" 
            options={{
              headerShown: false,
              presentation: 'card',
              animationTypeForReplace: 'push',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="fusion-dashboard" 
            options={{
              title: '🌊 BlueWave • Family-Safe AI Commerce',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
              },
              headerTintColor: '#D4AF37',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 16,
              },
            }}
          />
          <Stack.Screen 
            name="fusion-dashboard-i18n" 
            options={{
              title: 'Language-Infinity Engine',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
              },
              headerTintColor: '#D4AF37',
            }}
          />
          <Stack.Screen 
            name="currency-fusion-dashboard" 
            options={{
              title: 'Currency-Infinity Engine v2.0',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
              },
              headerTintColor: '#D4AF37',
            }}
          />
          <Stack.Screen 
            name="currency-fusion-dashboard-v2" 
            options={{
              title: 'Currency-Infinity Engine v2.0',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
              },
              headerTintColor: '#D4AF37',
            }}
          />
          <Stack.Screen 
            name="universal-ai-hub" 
            options={{
              title: 'Universal Commerce AI Hub',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
              },
              headerTintColor: '#D4AF37',
            }}
          />
          <Stack.Screen 
            name="executive-dashboard" 
            options={{
              title: 'Executive Dashboard',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
              },
              headerTintColor: '#D4AF37',
            }}
          />
          <Stack.Screen 
            name="enhanced-features-hub" 
            options={{
              title: 'Enhanced Features Hub',
              headerShown: true,
              headerStyle: {
                backgroundColor: '#1A1A1A',
              },
              headerTintColor: '#D4AF37',
            }}
          />
        </Stack>
      </LocationProvider>
    </CurrencyProvider>
  );
}