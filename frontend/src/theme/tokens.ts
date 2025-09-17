/**
 * Design Tokens - Cinematic Luxury Theme
 * Centralized palette + elevations for consistent high-end aesthetic
 */

// Color Palette - Dark Premium Theme
export const colors = {
  // Backgrounds
  bg: "#0C0F14",                    // Primary dark background
  bgSecondary: "#111827",           // Secondary background for gradients
  panel: "rgba(255,255,255,0.04)",  // Glass panels
  panelHover: "rgba(255,255,255,0.06)", // Panel hover state
  
  // Borders & Lines  
  line: "rgba(255,255,255,0.10)",   // Subtle borders
  lineAccent: "rgba(255,255,255,0.16)", // Accent borders
  
  // Text Colors
  text: "#FFFFFF",                  // Primary text
  textSecondary: "#E5E7EB",        // Secondary text
  textDim: "#9CA3AF",              // Dimmed text
  textMuted: "#6B7280",            // Muted text
  
  // Brand Colors - Cinematic Accents
  cyan: "#22D3EE",                  // Primary CTA (Discover)
  cyanDark: "#0891B2",             // Cyan dark variant
  violet: "#A855F7",               // Secondary CTA (RFQ)
  violetDark: "#7C3AED",           // Violet dark variant
  
  // Status Colors
  success: "#34D399",              // Success states (✅)
  successDark: "#10B981",          // Success dark
  warning: "#FBBF24",              // Warning states (NEW)
  warningDark: "#F59E0B",          // Warning dark
  error: "#F87171",                // Error states
  errorDark: "#EF4444",            // Error dark
  info: "#60A5FA",                 // Info states
  infoDark: "#3B82F6",             // Info dark
  
  // Glass Morphism Variants
  glass: {
    primary: "rgba(255,255,255,0.04)",
    secondary: "rgba(255,255,255,0.06)", 
    accent: "rgba(34,211,238,0.10)",     // Cyan glass
    violet: "rgba(168,85,247,0.18)",     // Violet glass
    success: "rgba(52,211,153,0.10)",    // Success glass
    warning: "rgba(251,191,36,0.10)",    // Warning glass
  },
  
  // Border Variants for Glass
  border: {
    primary: "rgba(255,255,255,0.10)",
    secondary: "rgba(255,255,255,0.16)",
    accent: "rgba(34,211,238,0.35)",     // Cyan border
    violet: "rgba(168,85,247,0.35)",     // Violet border
    success: "rgba(52,211,153,0.20)",    // Success border
    warning: "rgba(251,191,36,0.20)",    // Warning border
  },

  // CINEMATIC ROLE-BASED COLORS - AisleMarts 2.0 Upgrade
  shopper: ['#4facfe', '#00f2fe'],
  seller:  ['#43e97b', '#38f9d7'], 
  hybrid:  ['#667eea', '#764ba2'],
};

// Role and Tier Types for AisleMarts 2.0
export type Role = 'shopper' | 'seller' | 'hybrid';
export type Tier = 'regular' | 'premium' | 'pro' | 'business' | 'firstclass' | 'worldclass';

export const tierLabel: Record<Tier,string> = {
  regular:'Regular', 
  premium:'Premium', 
  pro:'Pro',
  business:'Business', 
  firstclass:'First-Class', 
  worldclass:'World-Class',
};

// Border Radius - Consistent Curvature
export const radii = {
  xs: 6,      // Small elements
  sm: 10,     // Buttons, chips
  md: 12,     // Cards, inputs
  lg: 16,     // Large cards, panels
  xl: 20,     // Hero sections
  full: 9999, // Pills, badges
};

// Spacing - 8pt Grid System
export const spacing = {
  xs: 8,      // 8px - Tight spacing
  sm: 12,     // 12px - Small spacing
  md: 16,     // 16px - Medium spacing  
  lg: 20,     // 20px - Large spacing
  xl: 24,     // 24px - Extra large
  xxl: 32,    // 32px - Section spacing
  xxxl: 40,   // 40px - Hero spacing
};

// Typography - Cinematic Hierarchy
export const typography = {
  // Font Sizes
  fontSize: {
    xs: 10,     // Small labels
    sm: 12,     // Captions, badges
    base: 14,   // Body text
    md: 16,     // Large body, buttons
    lg: 18,     // Section titles
    xl: 20,     // Page titles
    xxl: 24,    // Important titles
    hero: 40,   // Hero headlines
  },
  
  // Font Weights
  fontWeight: {
    normal: "400",
    medium: "500", 
    semibold: "600",
    bold: "700",
    heavy: "800",
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.1,   // Headlines
    normal: 1.4,  // Body text
    relaxed: 1.6, // Long form text
  }
};

// Shadows & Elevation - Cinematic Depth
export const shadows = {
  // Card Elevations
  sm: {
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  
  md: {
    elevation: 4,
    shadowColor: "#000", 
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  
  lg: {
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  
  // Special Effects
  depth: {
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  
  glow: {
    elevation: 16,
    shadowColor: "#22D3EE",
    shadowOpacity: 0.4,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  }
};

// Animation Durations - Smooth Motion
export const animations = {
  fast: 200,      // Quick interactions
  normal: 300,    // Standard transitions
  slow: 500,      // Cinematic reveals
  hero: 800,      // Hero animations
};

// Component Presets - Ready-to-use Combinations
export const presets = {
  // Glass Card
  glassCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.lg,
    ...shadows.md,
  },
  
  // Primary CTA Button
  primaryButton: {
    backgroundColor: colors.cyan,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  
  // Secondary CTA Button
  secondaryButton: {
    backgroundColor: colors.glass.primary,
    borderColor: colors.border.secondary,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  
  // Status Chip
  statusChip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: colors.bg,
    minHeight: 420,
    padding: spacing.lg,
  },
  
  // Feature Tile
  featureTile: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    minHeight: 110,
    ...shadows.sm,
  }
};

// Utility Functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case "working": return colors.success;
    case "new": return colors.warning;
    case "enhanced": return colors.cyan;
    default: return colors.textDim;
  }
};

export const getStatusBg = (status: string) => {
  switch (status) {
    case "working": return colors.glass.success;
    case "new": return colors.glass.warning;
    case "enhanced": return colors.glass.accent;
    default: return colors.panel;
  }
};