/**
 * AisleMarts Awareness Context - Clean Implementation
 * Blue Wave Cache-Busted Version
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  id: string;
  locale: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark';
}

interface AwarenessContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  formatCurrency: (amount: number, currency?: string) => string;
}

const defaultProfile: UserProfile = {
  id: 'user_001',
  locale: 'en-US',
  currency: 'USD',
  timezone: 'America/New_York',
  theme: 'dark',
};

const AwarenessContext = createContext<AwarenessContextType | undefined>(undefined);

export function AwarenessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(defaultProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const currencyToUse = currency || profile?.currency || 'USD';
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', SGD: 'S$'
    };
    return `${symbols[currencyToUse] || currencyToUse}${amount.toLocaleString()}`;
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

export const useAwareness = (): AwarenessContextType => {
  const context = useContext(AwarenessContext);
  if (context === undefined) {
    throw new Error('useAwareness must be used within an AwarenessProvider');
  }
  return context;
};