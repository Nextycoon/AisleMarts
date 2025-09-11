import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';

// Conditionally import StripeProvider only for native platforms
let StripeProvider: any = ({ children }: { children: React.ReactNode }) => <>{children}</>;

if (Platform.OS !== 'web') {
  try {
    const { StripeProvider: NativeStripeProvider } = require('@stripe/stripe-react-native');
    StripeProvider = NativeStripeProvider;
  } catch (error) {
    console.warn('Stripe React Native not available:', error);
  }
}

// For demo purposes - in production, this should come from your backend
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51H1vp5AaIRt1ZjmxPMq6UGPJFgS5s5sOQpC0dGmP4P4zF9gCfH6LZQR8yGkD1HkRvP8YlGhTl5nH8jcPJGkA2tL';

export default function RootLayout() {
  const stripeProps = Platform.OS !== 'web' ? { publishableKey: STRIPE_PUBLISHABLE_KEY } : {};
  
  return (
    <SafeAreaProvider>
      <StripeProvider {...stripeProps}>
        <AuthProvider>
          <CartProvider>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#000',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen name="index" options={{ title: 'AisleMarts' }} />
              <Stack.Screen name="auth" options={{ title: 'Sign In' }} />
              <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
              <Stack.Screen name="cart" options={{ title: 'Shopping Cart' }} />
              <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
              <Stack.Screen name="orders" options={{ title: 'My Orders' }} />
              <Stack.Screen name="profile" options={{ title: 'Profile' }} />
            </Stack>
            <StatusBar style="dark" />
          </CartProvider>
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}