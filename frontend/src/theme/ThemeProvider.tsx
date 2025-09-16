import React, { createContext, useContext } from 'react';
import { theme } from './theme';
import { tokens } from './tokens';

interface ThemeContextType {
  theme: typeof theme;
  tokens: typeof tokens;
}

const ThemeContext = createContext<ThemeContextType>({
  theme,
  tokens,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const value: ThemeContextType = {
    theme,
    tokens,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};