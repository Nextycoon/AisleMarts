import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Import global providers
import { CurrencyProvider } from '../lib/currency/CurrencyProvider';

export default function RootLayout() {
  return (
    <CurrencyProvider>
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
          
          {/* Main Dashboard and Core Features */}
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
            name="for-you" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="following" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="explore" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          
          {/* AI and Advanced Features */}
          <Stack.Screen 
            name="ai-super-agent" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="live-marketplace" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="voice-assistant" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ar-vr-experience" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          
          {/* Rewards System */}
          <Stack.Screen 
            name="rewards" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="notifications" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          
          {/* Creator and Business Features */}
          <Stack.Screen 
            name="creator-studio" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="creator-studio-hub" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="live-streaming" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="duet-creator" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="stitch-creator" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          
          {/* Premium and Membership */}
          <Stack.Screen 
            name="premium-membership" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="sustainability-dashboard" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="global-languages" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          
          {/* Lifestyle and Marketplace */}
          <Stack.Screen 
            name="lifestyle-hub" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ai-marketplace" 
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          
          {/* E-commerce Features */}
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
          
          {/* Legacy Dashboard Screens */}
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
    </CurrencyProvider>
  );
}