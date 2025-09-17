/**
 * ONE-SCREEN, ONE-COLOR UI DOCTRINE
 * Every screen uses a single background color with no mixed hues
 * Shopper-first approach with monochrome variants only
 */

// Core color tokens - one per user type
export const oneColorTheme = {
  screen: {
    shopper: '#0D47A1',   // Blue 900 - Primary interface
    vendor:  '#1A237E',   // Indigo 900 - Seller extension  
    business:'#004D40',   // Teal 900 - Enterprise crown
  },
  
  // Universal constants (same across all screens)
  on: '#FFFFFF',          // Text/icons on solid backgrounds
  onGlass: 'rgba(255,255,255,0.90)', // Text on glass overlays
  onDim: 'rgba(255,255,255,0.70)',   // Secondary text
  onMuted: 'rgba(255,255,255,0.50)', // Tertiary text
  
  // Glass effects (translucency of base color only)
  glass: {
    primary: 'rgba(255,255,255,0.08)',   // Light glass overlay
    secondary: 'rgba(255,255,255,0.12)', // Medium glass overlay
    accent: 'rgba(255,255,255,0.16)',    // Strong glass overlay
    modal: 'rgba(255,255,255,0.20)',     // Modal backgrounds
  },
  
  // Borders (same hue family only)
  border: {
    subtle: 'rgba(255,255,255,0.12)',
    medium: 'rgba(255,255,255,0.20)',
    strong: 'rgba(255,255,255,0.28)',
    focus: 'rgba(255,255,255,0.40)',
  },
  
  // States (rendered by opacity/elevation, not hue)
  state: {
    success: { opacity: 0.9, elevation: 2 },
    warning: { opacity: 0.8, elevation: 1 },
    error: { opacity: 0.85, elevation: 3 },
    info: { opacity: 0.75, elevation: 1 },
  }
};

// Get theme for specific user type
export const getScreenTheme = (userType: 'shopper' | 'vendor' | 'business') => {
  const baseColor = oneColorTheme.screen[userType];
  
  return {
    background: baseColor,
    statusBar: baseColor,
    navigation: baseColor,
    
    // All other properties remain the same
    ...oneColorTheme,
    
    // Dynamic variants of the base color
    variants: {
      lighter: adjustBrightness(baseColor, 20),
      darker: adjustBrightness(baseColor, -20),
      muted: adjustOpacity(baseColor, 0.8),
    }
  };
};

// Utility functions
const adjustBrightness = (hexColor: string, percent: number): string => {
  const num = parseInt(hexColor.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
};

const adjustOpacity = (hexColor: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return hexColor + alpha;
};

// React Hook for current theme
import { useUser } from '../state/user';

export const useOneColorTheme = () => {
  const { role } = useUser();
  
  // Map all role types to the correct theme
  let userType: 'shopper' | 'vendor' | 'business';
  
  if (role === 'seller' || role === 'vendor') {
    userType = 'vendor';
  } else if (role === 'business' || role === 'hybrid') {
    userType = 'business';
  } else {
    userType = 'shopper';
  }
  
  return getScreenTheme(userType);
};