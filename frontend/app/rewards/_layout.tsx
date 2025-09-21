import React from 'react';
import { Stack } from 'expo-router';

export default function RewardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1A1A1A' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="weekly" 
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="leaderboard" 
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="history" 
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="analytics" 
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="withdraw" 
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}