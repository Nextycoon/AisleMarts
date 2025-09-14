import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Blue Era Design Tokens
export const themeLight = {
  // Backgrounds
  bg: '#FFFFFF',
  bgSecondary: '#F5F7FA',
  bgCard: '#FFFFFF',
  bgOverlay: 'rgba(0,0,0,0.5)',
  
  // Text Colors
  ink: '#0A2540',
  inkSecondary: '#666666',
  inkTertiary: '#8E8E93',
  inkOnPrimary: '#FFFFFF',
  
  // Blue Era Colors
  primary: '#1E90FF',        // Trust Blue
  primaryDeep: '#0A2540',    // Deep Blue
  success: '#34C759',        // Trust Green
  gold: '#FFD700',           // Accent Gold
  
  // Status Colors
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Interactive States
  buttonPrimary: '#1E90FF',
  buttonSecondary: '#F5F7FA',
  buttonSuccess: '#34C759',
  
  // Borders & Dividers
  border: '#E5E5E7',
  borderLight: '#F2F2F7',
  
  // Shadows
  shadow: 'rgba(0,0,0,0.1)',
  shadowMedium: 'rgba(0,0,0,0.2)',
  
  // Special
  aisleAvatar: '#1E90FF',
  trustBar: '#34C759',
  blueEraBadge: '#0A2540',
};

export const themeDark = {
  // Backgrounds
  bg: '#0A2540',
  bgSecondary: '#1B2A4A',
  bgCard: '#1B2A4A',
  bgOverlay: 'rgba(0,0,0,0.7)',
  
  // Text Colors
  ink: '#FFFFFF',
  inkSecondary: 'rgba(255,255,255,0.8)',
  inkTertiary: 'rgba(255,255,255,0.6)',
  inkOnPrimary: '#0A2540',
  
  // Blue Era Colors (Slightly adjusted for dark mode)
  primary: '#1E90FF',        // Trust Blue (unchanged)
  primaryDeep: '#0F3460',    // Lighter Deep Blue for contrast
  success: '#34C759',        // Trust Green (unchanged)
  gold: '#FFD700',           // Accent Gold (unchanged)
  
  // Status Colors
  error: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
  
  // Interactive States
  buttonPrimary: '#1E90FF',
  buttonSecondary: '#1B2A4A',
  buttonSuccess: '#34C759',
  
  // Borders & Dividers
  border: '#2C3E50',
  borderLight: '#34495E',
  
  // Shadows
  shadow: 'rgba(0,0,0,0.3)',
  shadowMedium: 'rgba(0,0,0,0.5)',
  
  // Special
  aisleAvatar: '#1E90FF',
  trustBar: '#34C759',
  blueEraBadge: '#1E90FF',
};

export type Theme = typeof themeLight;
export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine actual theme based on mode and system preference
  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
  const theme = isDark ? themeDark : themeLight;

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('blue_era_theme_mode');
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('blue_era_theme_mode', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  // Don't render until theme is loaded
  if (!isLoaded) {
    return null;
  }

  const value: ThemeContextType = {
    theme,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper hook for styled components
export function useThemedStyles<T>(styleFactory: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return styleFactory(theme);
}

// Color helper functions
export const createThemedColor = (lightColor: string, darkColor: string) => (isDark: boolean) =>
  isDark ? darkColor : lightColor;

export const createDynamicColor = (theme: Theme, lightColor: keyof Theme, darkColor: keyof Theme) =>
  theme === themeDark ? theme[darkColor] : theme[lightColor];

// Animation helper for theme transitions
export const THEME_TRANSITION_DURATION = 250;