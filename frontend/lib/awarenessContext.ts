/**
 * AisleMarts Awareness Engine Context (Simplified Version)
 * 
 * Provides contextual awareness for user experience adaptation
 * including location, language, currency, and device preferences.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';

// Basic user profile structure
export interface UserProfile {
  id: string;
  locale: string;
  currency: string;
  timezone: string;
  location: {
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Context type definition
export interface AwarenessContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  formatCurrency: (amount: number, currency?: string) => string;
}

// Default user profile
const defaultProfile: UserProfile = {
  id: 'user_001',
  locale: 'en-US',
  currency: 'USD',
  timezone: 'America/New_York',
  location: {
    country: 'United States',
    city: 'New York',
  },
  preferences: {
    language: 'en',
    theme: 'dark',
    notifications: true,
  },
};

// Create context
const AwarenessContext = createContext<AwarenessContextType | undefined>(undefined);

// Provider component
export function AwarenessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(defaultProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const currencyToUse = currency || profile?.currency || 'USD';
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      SGD: 'S$',
    };
    
    const symbol = currencySymbols[currencyToUse] || currencyToUse;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const contextValue: AwarenessContextType = {
    profile,
    isLoading,
    error,
    updateProfile,
    formatCurrency,
  };

  return (
    <AwarenessContext.Provider value={contextValue}>
      {children}
    </AwarenessContext.Provider>
  );
}

// Hook to use the awareness context
export const useAwareness = (): AwarenessContextType => {
  const context = useContext(AwarenessContext);
  if (context === undefined) {
    throw new Error('useAwareness must be used within an AwarenessProvider');
  }
  return context;
};

// HOC for awareness-aware components
export const withAwareness = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const awareness = useAwareness();
    return <Component {...props} awareness={awareness} />;
  };
};