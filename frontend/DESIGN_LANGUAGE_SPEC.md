# AisleMarts Design Language Specification
*Cinematic Luxury • Glass Morphism • Future-Ready*

## 🎨 Visual Identity

### Color Palette
```typescript
// Dark Premium Foundation
bg: "#0C0F14"           // Primary background
bgSecondary: "#111827"   // Gradient secondary
panel: "rgba(255,255,255,0.04)"  // Glass panels
line: "rgba(255,255,255,0.10)"   // Subtle borders

// Brand Accents  
cyan: "#22D3EE"         // Primary CTA (Discover)
violet: "#A855F7"       // Secondary CTA (RFQ)
success: "#34D399"      // Status working (✅)
warning: "#FBBF24"      // Status new (NEW)
```

### Typography Hierarchy
```typescript
// Font Sizes (Mobile-First)
xs: 10     // Small labels, badges
sm: 12     // Captions, descriptions  
base: 14   // Body text
md: 16     // Large body, buttons
lg: 18     // Section titles
xl: 20     // Page titles
hero: 40   // Hero headlines

// Font Weights
normal: "400"    // Body text
medium: "500"    // Subtle emphasis
semibold: "600"  // Button text
bold: "700"      // Titles
heavy: "800"     // Hero text
```

### Spacing System (8pt Grid)
```typescript
xs: 8      // Tight spacing
sm: 12     // Small elements
md: 16     // Standard spacing
lg: 20     // Large spacing
xl: 24     // Section spacing
xxl: 32    // Hero spacing
```

### Border Radius
```typescript
xs: 6      // Small chips
sm: 10     // Buttons
md: 12     // Cards
lg: 16     // Large panels
xl: 20     // Hero sections
```

## 🔮 Glass Morphism System

### Glass Variants
```typescript
// Background Transparencies
primary: "rgba(255,255,255,0.04)"     // Default panels  
secondary: "rgba(255,255,255,0.06)"   // Hover states
accent: "rgba(34,211,238,0.10)"       // Cyan tint
violet: "rgba(168,85,247,0.18)"       // Purple tint
success: "rgba(52,211,153,0.10)"      // Success tint

// Border Transparencies  
primary: "rgba(255,255,255,0.10)"     // Default borders
secondary: "rgba(255,255,255,0.16)"   // Accent borders
accent: "rgba(34,211,238,0.35)"       // Cyan borders
violet: "rgba(168,85,247,0.35)"       // Purple borders
```

### Shadow System
```typescript
// Card Elevations
sm: { elevation: 2, shadowOpacity: 0.1, shadowRadius: 4 }
md: { elevation: 4, shadowOpacity: 0.15, shadowRadius: 8 }  
lg: { elevation: 8, shadowOpacity: 0.2, shadowRadius: 16 }

// Special Effects
depth: { elevation: 12, shadowOpacity: 0.3, shadowRadius: 24 }
glow: { elevation: 16, shadowColor: "#22D3EE", shadowOpacity: 0.4 }
```

## 🧩 Component Presets

### Ready-to-Use Components
```typescript
// Import luxury components
import { GlassCard, PrimaryButton, StatusChip, FeatureTile } from '@/components/GlassComponents';

// Glass Card Usage
<GlassCard variant="accent">     // cyan tint
<GlassCard variant="violet">     // purple tint  
<GlassCard variant="success">    // green tint

// Button Variants
<PrimaryButton title="Action" variant="primary" size="large" />
<PrimaryButton title="Secondary" variant="secondary" size="medium" />
<PrimaryButton title="RFQ" variant="violet" size="small" loading={true} />

// Status Indicators
<StatusChip status="working" />   // ✅ Green
<StatusChip status="new" />       // NEW Orange
<StatusChip status="enhanced" />  // ⚡ Cyan

// Feature Tiles
<FeatureTile 
  icon="🤖" 
  title="AI Assistant" 
  description="Smart help"
  status="new"
  onPress={() => navigate('/ai')}
/>
```

## 🎭 Animation Guidelines

### Motion System
```typescript
// Respect reduced motion
import { getDuration, shouldAnimate } from '@/theme/motion';

// Duration Values (Auto-adjusts for accessibility)
fast: 200ms     // Quick interactions
normal: 300ms   // Standard transitions
slow: 500ms     // Cinematic reveals  
hero: 800ms     // Hero animations

// Usage in Components
Animated.timing(fadeValue, {
  toValue: 1,
  duration: getDuration('normal'),  // Respects reduced motion
  useNativeDriver: true
}).start();
```

### Animation Patterns
- **Fade In**: Hero sections, content reveals
- **Slide Up**: Modal presentations, bottom sheets
- **Scale In**: Button feedback, status changes
- **Stagger**: List items, feature tiles

## 📱 Mobile-First Rules

### Touch Targets
- **Minimum size**: 44px (iOS) / 48px (Android)
- **Comfortable spacing**: 8px between interactive elements
- **Thumb-friendly**: Primary actions in bottom 60% of screen

### Responsive Breakpoints
```typescript
// Optimized for these viewports
iPhone: 390x844      // iPhone 12/13/14
Android: 360x800     // Samsung Galaxy S21
Tablet: 768x1024     // iPad
```

### Performance Standards
- **First paint**: ≤1.5s
- **CTA tap response**: ≤300-500ms (p95)
- **Memory**: Stable after 5min idle
- **Battery**: Respect reduced motion for efficiency

## 🎯 Component Composition Rules

### 1. Always Use Tokens
```typescript
// ✅ Correct - Via design tokens
backgroundColor: colors.panel,
borderColor: colors.line,
padding: spacing.md,
borderRadius: radii.lg

// ❌ Incorrect - Hardcoded values  
backgroundColor: "rgba(255,255,255,0.04)",
borderColor: "#333",
padding: 16
```

### 2. Semantic Structure
```typescript
// ✅ Correct - Semantic hierarchy
<GlassCard variant="primary">
  <Text style={typography.title}>Feature Name</Text>
  <Text style={typography.body}>Description</Text>
  <StatusChip status="working" />
</GlassCard>
```

### 3. Consistent Status System
```typescript
// Status Values (Standardized)
"working"   // ✅ Green - Feature is live and stable
"new"       // NEW Orange - Recently added feature  
"enhanced"  // ⚡ Cyan - Upgraded/improved feature
```

## 🚀 Implementation Checklist

### New Screen Checklist
- [ ] Uses glass morphism tokens (`colors.panel`, `colors.line`)
- [ ] Implements proper spacing rhythm (`spacing.md`, `spacing.lg`)
- [ ] Includes accessibility labels and proper contrast
- [ ] Respects reduced motion preferences
- [ ] Touch targets ≥44px with proper spacing
- [ ] Uses semantic typography hierarchy
- [ ] Implements proper loading and error states

### Component Guidelines
- [ ] All styling via design tokens (no hardcoded values)
- [ ] Proper TypeScript interfaces for all props
- [ ] Accessibility props (`accessibilityLabel`, `accessibilityRole`)
- [ ] Loading and disabled states handled
- [ ] Consistent naming convention (PascalCase components)

### Quality Gates
- [ ] VoiceOver/TalkBack screen reader compatibility
- [ ] Performance: First paint ≤1.5s, interaction ≤500ms
- [ ] Memory stable after 5min idle/return cycles
- [ ] Visual regression testing on 390x844 viewport
- [ ] Dark mode compliance (all components work in dark theme)

## 🎨 Brand Expression

### Personality Traits
- **Cinematic**: Dramatic lighting, smooth animations
- **Luxury**: Premium materials, sophisticated colors
- **Intelligent**: Smart defaults, contextual actions
- **Accessible**: Inclusive design, respectful of user needs
- **Future-Ready**: Scalable system, experiment-friendly

### Voice & Tone
- **Confident** but not arrogant
- **Helpful** but not overwhelming  
- **Premium** but not exclusive
- **Smart** but not complex

---

## 📋 Quick Reference

### Most Used Patterns
```typescript
// Standard Glass Card
<GlassCard style={presets.glassCard}>

// Primary Action Button  
<PrimaryButton title="Continue" variant="primary" />

// Feature Status
<StatusChip status="working" size="small" />

// Cinematic Animation
Animated.timing(fade, { duration: motion.duration.hero })
```

### Emergency Overrides
```typescript
// Only use in exceptional cases
style={{ 
  // Emergency styling that can't use tokens
  // TODO: Add to design system - [TICKET-123]
}}
```

*This spec evolves with the product. All changes require design system team approval.*

---
**Version**: 1.0 • **Last Updated**: September 2025 • **Status**: Production Ready