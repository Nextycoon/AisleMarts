# AisleMarts Investor Demo Deep Links Index

## Base Configuration
- **Dev Environment**: `https://social-ecosystem.preview.emergentagent.com`
- **Awareness Engine**: Auto-detects context parameters and adapts UI/content/pricing
- **UTM Tracking**: All links include investor-specific tracking codes

## Universal Deep Link Pattern
```
{BASE_URL}?locale={LOCALE}&currency={CURRENCY}&tz={TIMEZONE}&device={DEVICE}&utm_source=investor&utm_medium=email&utm_campaign=series_a&utm_bundle={BUNDLE_NAME}
```

## Core Demo Routes

### 1. Awareness-Enhanced Home
**Purpose**: Demonstrate contextual adaptation and AI-powered personalization
```
{BASE}/?locale={LOCALE}&currency={CURRENCY}&tz={TIMEZONE}&device={DEVICE}
```
**Features**: Time-based greetings, currency display, localized content, device-optimized layout

### 2. AI Mood-to-Cart™ Experience
**Purpose**: Showcase revolutionary AI shopping experience
```
{BASE}/mood-to-cart?preset=luxurious&locale={LOCALE}&currency={CURRENCY}
```
**Features**: AI-powered cart generation, mood-based product curation, personalized recommendations

### 3. LiveSale Commerce Stream
**Purpose**: Demonstrate live commerce capabilities and FOMO generation
```
{BASE}/livesale/{eventId}?locale={LOCALE}&currency={CURRENCY}&countdown=true
```
**Features**: Real-time streaming, product drops, countdown timers, social proof

### 4. Communication Suite Hub
**Purpose**: Show comprehensive communication platform
```
{BASE}/chat?demo_mode=investor&locale={LOCALE}
```
**Features**: Direct messaging, group channels, business leads integration

### 5. Business Analytics Dashboard
**Purpose**: Display investor-ready KPIs and performance metrics
```
{BASE}/analytics?view=investor&currency={CURRENCY}&timeframe=30d
```
**Features**: GMV tracking, conversion rates, user engagement, growth metrics

### 6. Creator Channel Experience
**Purpose**: Demonstrate creator economy and 80/20 value distribution
```
{BASE}/channels/{channelId}?creator_spotlight=true&locale={LOCALE}
```
**Features**: Creator content, audience engagement, monetization tools

### 7. Multi-Currency Global Commerce
**Purpose**: Show global scalability and currency adaptation
```
{BASE}/categories/luxury?currency={CURRENCY}&region={REGION}
```
**Features**: Real-time currency conversion, regional pricing, tax calculations

### 8. AI-Powered Shopping Assistant
**Purpose**: Showcase conversational commerce and AI integration
```
{BASE}/ai-assistant?context=investor_demo&locale={LOCALE}
```
**Features**: Natural language shopping, contextual recommendations, market insights

### 9. Business Leads Kanban System
**Purpose**: Demonstrate B2B sales funnel and CRM integration
```
{BASE}/business/leads?view=kanban&demo_data=true
```
**Features**: Lead management, conversion tracking, sales pipeline visualization

### 10. Social Commerce Feed
**Purpose**: Show social shopping and "Shop the Look" features
```
{BASE}/social?feed_type=shop_the_look&locale={LOCALE}
```
**Features**: Social product discovery, user-generated content, purchase integration

## Investor-Specific Deep Link Sequences

### Sequoia (Network Effects Focus)
1. Home → AI Mood-to-Cart → Social Feed → Analytics (Network Metrics)

### a16z (AI Infrastructure Focus)  
1. Home → AI Assistant → Mood-to-Cart → LiveSale → Analytics (AI Metrics)

### LVMH (Luxury Brand Focus)
1. Home → Luxury Collections → Brand Partnerships → European Features

### General Catalyst (Marketplace Focus)
1. Home → Vendor Portal → Leads Kanban → Marketplace Analytics

### Lightspeed (Social Mobile Focus)
1. Home → Social Feed → Communication Suite → Mobile Analytics

### Index (European Enterprise Focus)
1. Home → Multi-Currency → Compliance Features → Enterprise Dashboard

### Bessemer (SaaS Marketplace Focus)
1. Home → Vendor Portal → Analytics → SaaS Features → Leads Management

### Tiger Global (Global Growth Focus)
1. Home → Multi-Currency → Global Features → Growth Analytics

## UTM Parameter Structure
- `utm_source=investor`
- `utm_medium=email` 
- `utm_campaign=series_a`
- `utm_bundle={INVESTOR_BUNDLE_NAME}`
- `utm_content={DEMO_FLOW_STEP}`

## Tracking Events
- `demo_started`: When investor accesses first link
- `demo_progression`: Each route navigation
- `demo_engagement`: Feature interactions
- `demo_completed`: Full flow completion
- `demo_conversion`: Follow-up meeting booked