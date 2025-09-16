import React from 'react';
import { router } from 'expo-router';

export default function IndexScreen() {
  // Immediate redirect to Live AI Avatar experience
  React.useEffect(() => {
    router.replace('/live-avatar');
  }, []);

  return null;
}