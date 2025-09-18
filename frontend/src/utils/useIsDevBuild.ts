import { useMemo } from 'react';
import Constants from 'expo-constants';

/**
 * Hook to determine if app is running in development mode
 * Uses Expo's development mode detection
 */
export const useIsDevBuild = (): boolean => {
  return useMemo(() => {
    return __DEV__ || Constants.expoConfig?.debuggerHost !== undefined;
  }, []);
};