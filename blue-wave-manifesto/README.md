# Blue Wave Manifesto - Interactive Website Package

## Overview
This package contains the complete interactive website for the "Blue Wave Manifesto" - AisleMarts' revolutionary vision for conversational commerce. The site features a cinematic glass-morphism design with premium animations and comprehensive analytics integration.

## 🚀 Features

### Design & UX
- **Cinematic Glass-Morphism**: Premium visual effects with backdrop filters and transparency
- **Responsive Design**: Optimized for desktop, tablet, and mobile experiences
- **Interactive Elements**: Hover effects, smooth scrolling, and micro-animations
- **Accessibility**: WCAG-compliant color contrast and keyboard navigation

### Content Sections
1. **Hero Section**: Animated avatar orb with manifesto introduction
2. **Vision Section**: Four core principles of conversational commerce
3. **Principles Section**: Detailed philosophy and approach
4. **Join Section**: Lead capture form with role-based interest tracking
5. **Press Kit**: Media resources and brand assets for journalists

### Analytics & Tracking
- **Google Tag Manager**: Comprehensive event tracking
- **Custom Events**: Page views, CTA clicks, form submissions, downloads
- **Engagement Metrics**: Scroll depth, section impressions, share tracking
- **Conversion Funnel**: Lead generation and user journey analysis

### Press Kit Integration
- **Brand Assets**: Logo packs, color palettes, typography guidelines
- **Media Resources**: High-resolution screenshots, press photos
- **Fact Sheet**: Company data, statistics, market information
- **Founder Quotes**: Ready-to-use statements for media coverage

## 📁 File Structure

```
blue-wave-manifesto/
├── index.html          # Main website file
├── styles.css          # Complete styling with glass-morphism effects
├── script.js           # Interactive functionality and analytics
├── README.md           # This documentation
├── assets/
│   ├── logo.svg        # AisleMarts logo (white version)
│   ├── og-image.png    # Social media Open Graph image (1200x630)
│   ├── og-image-specs.md # OG image specifications and guidelines
│   └── press/
│       ├── aislemarts-logo-pack.zip    # Complete brand asset package
│       ├── press-photos.zip            # High-resolution media photos
│       ├── fact-sheet.pdf              # Company fact sheet
│       └── founder-quotes.txt          # Media-ready quotes
```

## 🔧 Setup Instructions

### 1. Google Tag Manager Configuration
Replace placeholder values in `index.html`:
```html
<!-- Update GA_MEASUREMENT_ID with your actual ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
```

### 2. Lead Form Integration
Update the form endpoint in `script.js`:
```javascript
const response = await fetch('/api/leads', {
    method: 'POST',
    // ... your endpoint configuration
});
```

### 3. Asset Population
1. **Logo**: Replace `/bluewave/assets/logo.svg` with your AisleMarts logo
2. **OG Image**: Add your custom OG image at `/bluewave/assets/og-image.png`
3. **Press Assets**: Populate the `/bluewave/assets/press/` directory with:
   - Brand logo packages
   - High-resolution press photos
   - Updated fact sheet PDF
   - Current founder quotes

### 4. URL Configuration
Update all meta tags and canonical URLs:
```html
<meta property="og:url" content="https://yourdomain.com/bluewave/">
<meta property="twitter:url" content="https://yourdomain.com/bluewave/">
```

## 📊 Analytics Events

The site tracks these key events:
- **Page Views**: Initial load and navigation
- **CTA Clicks**: Primary and secondary call-to-action buttons
- **Form Submissions**: Lead capture with success/error states
- **Downloads**: Press kit asset downloads
- **Share Actions**: Social sharing with method tracking
- **Scroll Depth**: 25%, 50%, 75%, 100% milestones
- **Section Views**: Individual section impression tracking

## 🎨 Design System

### Color Palette
- **Primary Blue**: #00bfff
- **Secondary Blue**: #1e90ff  
- **Accent Teal**: #00ffff
- **Background**: #0a0a23 to #2a2a5e gradient
- **Glass Effects**: rgba(255,255,255,0.05-0.1) with backdrop-filter

### Typography
- **Font Stack**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Weights**: 300 (Light), 400 (Regular), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- **Responsive Scaling**: clamp() functions for fluid typography

### Glass-Morphism Effects
- **Backdrop Filter**: blur(10px-20px) for depth
- **Transparency**: rgba values for layered effects
- **Borders**: 1px solid rgba(255,255,255,0.1-0.3)
- **Shadows**: Multi-layer box-shadows for premium feel

## 📱 Responsive Breakpoints
- **Desktop**: 1200px+ (full featured experience)
- **Tablet**: 768px-1199px (adapted layout)
- **Mobile**: 320px-767px (simplified navigation, stacked layout)

## 🔍 SEO Optimization
- **Meta Tags**: Complete Open Graph and Twitter Card integration
- **Structured Data**: Schema markup for enhanced search results
- **Performance**: Optimized images, minified assets, lazy loading
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## 🚀 Deployment Checklist
- [ ] Update Google Analytics ID
- [ ] Configure lead form endpoint
- [ ] Add all brand assets to `/assets/` directory
- [ ] Update all URLs and domain references
- [ ] Test form submissions
- [ ] Validate social media previews
- [ ] Check mobile responsiveness
- [ ] Verify analytics event firing
- [ ] Test press kit downloads
- [ ] Confirm accessibility compliance

## 🔗 Integration Points
- **Main Platform**: Link to aislemarts.com
- **Lead System**: CRM integration for form submissions  
- **Press Inquiries**: Email routing for media contacts
- **Social Sharing**: Automated social media integration
- **Analytics**: Dashboard integration for performance monitoring

## 📈 Performance Metrics
Target performance benchmarks:
- **Page Load**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **Mobile PageSpeed**: > 90
- **Desktop PageSpeed**: > 95

## 🤝 Usage Rights
This design and code package is proprietary to AisleMarts. The glass-morphism design system, color palette, and interactive elements are part of the AisleMarts brand identity.

---

**Contact**: For technical support or customization requests, contact the development team at dev@aislemarts.com