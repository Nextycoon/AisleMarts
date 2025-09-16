import React from 'react';
import { router } from 'expo-router';

export default function IndexScreen() {
  // Immediate redirect - no loading, no delays, no complications
  React.useEffect(() => {
    router.replace('/test-screen');
  }, []);

  // This should never be seen - immediate redirect
  return null;
}