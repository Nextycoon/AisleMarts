/**
 * Luxury Design Tokens - World-Class Cinematic AisleMarts
 * Fashion-forward, high-end, sophisticated design system
 */

// PREMIUM COLOR PALETTE - Fashion & Luxury Inspired
export const colors = {
  // Primary Luxury Gradient
  primary: {
    50: '#faf7ff',
    100: '#f3edff',
    200: '#e9deff',
    300: '#d8c2ff',
    400: '#c298ff',
    500: '#a855f7', // Royal Purple - Main
    600: '#9333ea',
    700: '#7c2d12',
    800: '#581c87',
    900: '#3b0268',
  },
  
  // Platinum & Gold Accents
  platinum: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  
  gold: {
    50: '#fffdf7',
    100: '#fffbeb',
    200: '#fef3c7',
    300: '#fde68a',
    400: '#fcd34d',
    500: '#f59e0b', // Premium Gold
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Cinematic Dark Modes
  dark: {
    bg: '#0a0a0b',
    surface: '#1a1a1b',
    elevated: '#242425',
    border: '#2a2a2b',
    text: '#ffffff',
    textSecondary: '#a1a1a3',
  },
  
  // Fashion Brand Colors
  fashion: {
    midnight: '#0f0f23',
    charcoal: '#1a1a2e',
    smokeGray: '#2d2d44',
    silverMist: '#8b8ba7',
    pearl: '#f8f8ff',
  },
  
  // Luxury Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
    gold: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    platinum: 'linear-gradient(135deg, #f4f4f5 0%, #d4d4d8 100%)',
    cinematic: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #2d2d44 100%)',
    royal: 'linear-gradient(135deg, #581c87 0%, #7c2d12 50%, #a855f7 100%)',
    midnight: 'linear-gradient(180deg, #0a0a0b 0%, #1a1a1b 100%)',
  },
};

// PREMIUM TYPOGRAPHY - Fashion Magazine Inspired
export const typography = {
  // Luxury Font Families
  fonts: {
    heading: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    body: 'SF Pro Text, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    mono: 'SF Mono, Monaco, Consolas, monospace',
    luxury: 'Playfair Display, Georgia, serif', // For premium headlines
  },
  
  // Fashion-Forward Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
  },
  
  // Elegant Font Weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Letter Spacing for Luxury
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Line Heights for Readability
  leading: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// PREMIUM SPACING - Golden Ratio Inspired
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
};

// CINEMATIC SHADOWS & DEPTH
export const shadows = {
  // Luxury Card Shadows
  luxury: {
    sm: '0 2px 8px rgba(139, 139, 167, 0.08)',
    md: '0 4px 16px rgba(139, 139, 167, 0.12)',
    lg: '0 8px 32px rgba(139, 139, 167, 0.16)',
    xl: '0 16px 64px rgba(139, 139, 167, 0.20)',
  },
  
  // Cinematic Glows
  glow: {
    purple: '0 0 32px rgba(168, 85, 247, 0.3)',
    gold: '0 0 32px rgba(245, 158, 11, 0.3)',
    platinum: '0 0 32px rgba(139, 139, 167, 0.2)',
  },
  
  // Glass Morphism
  glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
};

// LUXURY BORDER RADIUS
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
  
  // Premium Card Styles
  card: 16,
  button: 12,
  input: 8,
  modal: 20,
};

// PREMIUM ANIMATIONS & TRANSITIONS
export const animations = {
  // Easing Functions - Fashion Brand Inspired
  easing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    luxury: 'cubic-bezier(0.4, 0, 0.2, 1)', // Premium smooth
    cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)', // Dramatic entrance
  },
  
  // Duration Scales
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    cinematic: 800,
  },
  
  // Spring Configurations
  spring: {
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
    luxury: { tension: 200, friction: 18 },
  },
};

// GLASS MORPHISM EFFECTS
export const glassMorphism = {
  // Luxury Glass Cards
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.card,
    boxShadow: shadows.glass,
  },
  
  // Premium Navigation
  nav: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  
  // Elegant Overlays
  overlay: {
    background: 'rgba(10, 10, 11, 0.8)',
    backdropFilter: 'blur(24px)',
  },
};

// LUXURY COMPONENT VARIANTS
export const variants = {
  // Premium Button Styles
  button: {
    primary: {
      background: colors.gradients.royal,
      color: colors.dark.text,
      shadow: shadows.luxury.md,
      borderRadius: borderRadius.button,
    },
    
    secondary: {
      background: glassMorphism.card.background,
      backdropFilter: glassMorphism.card.backdropFilter,
      border: glassMorphism.card.border,
      color: colors.dark.text,
      borderRadius: borderRadius.button,
    },
    
    luxury: {
      background: colors.gradients.gold,
      color: colors.dark.bg,
      shadow: shadows.glow.gold,
      borderRadius: borderRadius.button,
    },
  },
  
  // Elegant Card Styles
  card: {
    glass: glassMorphism.card,
    luxury: {
      background: colors.gradients.platinum,
      shadow: shadows.luxury.lg,
      borderRadius: borderRadius.card,
    },
    cinematic: {
      background: colors.gradients.cinematic,
      shadow: shadows.luxury.xl,
      borderRadius: borderRadius.card,
    },
  },
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  glassMorphism,
  variants,
};