/**
 * Smart Navigation & Preloading System
 * Optimizes navigation performance and user experience
 */

import { router } from 'expo-router';
import { InteractionManager } from 'react-native';

// Critical screens to preload for instant navigation
const CRITICAL_SCREENS = [
  '/nearby',
  '/b2b',
  '/discover',
  '/command-center',
  '/merchant/pickup'
];

// Preload critical screens after UI interactions complete
export const preloadCriticalScreens = () => {
  const task = InteractionManager.runAfterInteractions(() => {
    console.log('📱 Preloading critical screens for instant navigation...');
    
    CRITICAL_SCREENS.forEach(screen => {
      try {
        router.prefetch(screen);
      } catch (error) {
        console.warn(`Failed to prefetch ${screen}:`, error);
      }
    });
  });
  
  return () => task.cancel();
};

// Smart navigation with Command Center context
export const pushFromCommandCenter = (route: string, origin = "command_center") => {
  router.push({
    pathname: route,
    params: { origin }
  });
};

export const pushFromHome = (route: string, origin = "home") => {
  router.push({
    pathname: route,
    params: { origin }
  });
};

// Smart back navigation that respects context
export const smartGoBack = (currentParams?: any) => {
  const origin = currentParams?.origin;
  
  switch (origin) {
    case "command_center":
      router.replace("/command-center");
      break;
    case "home":
      router.replace("/");
      break;
    default:
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
  }
};

// Navigation performance tracking
export const trackNavigationPerformance = (from: string, to: string, startTime: number) => {
  const duration = Date.now() - startTime;
  
  if (__DEV__) {
    console.log(`🚀 Navigation ${from} → ${to}: ${duration}ms`);
  }
  
  // In production, send to analytics
  // analytics.track('navigation_performance', { from, to, duration });
};

// Preload based on user behavior patterns
export const intelligentPreload = (userRole: string, recentScreens: string[]) => {
  const recommendations: string[] = [];
  
  // Business user patterns
  if (userRole === 'merchant') {
    recommendations.push('/merchant/pickup', '/merchant/inventory/upload');
  }
  
  // Frequent screen combinations
  if (recentScreens.includes('/nearby')) {
    recommendations.push('/nearby/scan');
  }
  
  if (recentScreens.includes('/b2b')) {
    recommendations.push('/b2b/rfq/new');
  }
  
  // Preload recommendations
  recommendations.forEach(screen => {
    try {
      router.prefetch(screen);
    } catch (error) {
      console.warn(`Intelligent preload failed for ${screen}:`, error);
    }
  });
  
  return recommendations;
};

export default {
  preloadCriticalScreens,
  pushFromCommandCenter,
  pushFromHome,
  smartGoBack,
  trackNavigationPerformance,
  intelligentPreload
};