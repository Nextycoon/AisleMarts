# Blue Wave Manifesto OG Image Specifications

## Technical Requirements
- **Dimensions**: 1200 x 630 pixels (1.91:1 aspect ratio)
- **Format**: PNG (optimized for web)
- **File Size**: < 300KB for optimal loading
- **Color Space**: sRGB
- **Resolution**: 72 DPI

## Design Layout Specifications

### Primary Visual Elements
1. **Background Gradient**: 
   - Blue to purple to teal gradient (135° diagonal)
   - Color codes: #0a0a23 → #1a1a3e → #2a2a5e

2. **Central Avatar Orb**:
   - Position: Center-left (300px from left, vertically centered)
   - Size: 280px diameter
   - Glass-morphism effect with inner glow
   - Blue gradient: #00bfff → #1e90ff → #00ffff
   - Subtle rotation animation effect (static in image)

3. **Typography Layout**:
   ```
   Main Title: "Blue Wave Manifesto"
   - Font: System font stack (Helvetica/Arial fallback)
   - Weight: 800 (ExtraBold)
   - Size: 64px
   - Position: Right side, top aligned
   - Color: White with blue gradient accent on "Blue Wave"
   
   Subtitle: "The Constitution of Conversational Commerce"
   - Font: Same family
   - Weight: 300 (Light)
   - Size: 32px
   - Position: Below main title
   - Color: rgba(255,255,255,0.9)
   
   Supporting Text: "The World's First Conversational Shopping Marketplace"
   - Font: Same family
   - Weight: 400 (Regular)
   - Size: 24px
   - Position: Below subtitle
   - Color: rgba(255,255,255,0.8)
   ```

4. **AisleMarts Logo**:
   - Position: Bottom-right corner (40px margin)
   - Size: 48px x 48px
   - White version with subtle glow effect

### Glass-Morphism Effects
- **Orb Styling**:
  - Background: radial-gradient with transparency
  - Border: 1px solid rgba(255,255,255,0.2)
  - Backdrop-filter: blur(20px)
  - Box-shadow: Multiple layers for depth

- **Text Background Panel**:
  - Background: rgba(255,255,255,0.05)
  - Border: 1px solid rgba(255,255,255,0.1)
  - Backdrop-filter: blur(10px)
  - Border-radius: 20px
  - Padding: 40px

### Responsive Considerations
- Text should remain readable at smaller sizes (minimum 600px width)
- Orb should maintain aspect ratio when scaled
- Logo should remain visible and recognizable

## Platform-Specific Optimizations

### LinkedIn
- Ensure professional appearance
- High contrast text for business context
- Clean, minimal design approach

### Twitter/X
- Bold, eye-catching elements
- Clear hierarchy for mobile viewing
- Optimized for dark mode compatibility

### WhatsApp/Messaging
- Readable thumbnail at 300px width
- Clear brand recognition
- Compelling visual hook

### Facebook
- Balanced composition for timeline display
- Mobile-optimized text sizing
- Clear call-to-action visual

## Brand Guidelines Integration
- Primary brand colors: Blue (#00bfff), Purple (#1e90ff), Teal (#00ffff)
- Secondary colors: White, subtle grays for text
- Consistent with AisleMarts brand identity
- Maintains cinematic, premium aesthetic

## File Naming Convention
- Primary: `og-image.png`
- Variants: `og-image-[platform].png` (if needed)
- Backup: `og-image-fallback.jpg`

## Testing Checklist
- [ ] LinkedIn preview test
- [ ] Twitter card validator
- [ ] Facebook sharing debugger
- [ ] WhatsApp link preview
- [ ] Mobile display verification
- [ ] Load time optimization
- [ ] Alt text accessibility

## Implementation Notes
- Use CSS-in-JS or canvas-based generation for dynamic versions
- Consider CDN optimization for global delivery
- Monitor performance metrics post-deployment
- A/B test variations if needed for different audiences