# Sequoia Capital Bundle - 5-Step Smoke Test

## Bundle Context
- **Investor**: Roelof Botha, Sequoia Capital
- **Focus**: Network Effects & B2B Infrastructure
- **Locale**: en-US (English - United States)
- **Currency**: USD (US Dollar)
- **Timezone**: America/Los_Angeles (Pacific Time)
- **Device**: Desktop

## Pre-Test Setup ✅
- [ ] Demo environment: https://shopstream-app.preview.emergentagent.com
- [ ] Credentials: sequoia.demo@aislemarts.luxury / Seq8#mB9kL2pQw7$vN3x
- [ ] Fresh seed data confirmed (daily 3:00 AM PST reset)
- [ ] Network effects demo data populated

---

## Step 1: Home Renders with Network Effects Context ✅

### Test URL
```
https://shopstream-app.preview.emergentagent.com/?locale=en-US&currency=USD&tz=America/Los_Angeles&device=desktop&utm_source=investor&utm_medium=email&utm_campaign=series_a&utm_bundle=SEQUOIA_ROELOF_BOTHA
```

### Validation Checklist
- [ ] **Locale Display**: UI text in English (US format)
- [ ] **Currency Integration**: All prices display in USD ($1,234.56 format)
- [ ] **Timezone Awareness**: Pacific time-based greetings
  - Morning (6AM-12PM PST): "Good morning from San Francisco"
  - Afternoon (12PM-6PM PST): "Good afternoon"
  - Evening (6PM-12AM PST): "Good evening"
- [ ] **Device Optimization**: Desktop layout with full analytics sidebar
- [ ] **Network Effects Indicators**: User count, connections/user, growth metrics visible

### Success Criteria
- All awareness dimensions correctly applied
- Network growth indicators prominent (user count: 127K+)
- No console errors related to localization
- Page load time < 2 seconds

### Network Effects Specific Validations
- [ ] **User Count Widget**: Shows active user growth
- [ ] **Network Density**: "3.2 connections per user" displayed
- [ ] **Viral Coefficient**: "45% viral growth" badge visible
- [ ] **B2B Metrics**: Vendor network growth indicator

---

## Step 2: AI Mood-to-Cart Returns Network-Enhanced Catalog ✅

### Test URL
```
https://shopstream-app.preview.emergentagent.com/mood-to-cart?preset=luxurious&locale=en-US&currency=USD&network_effects=true&utm_bundle=SEQUOIA_ROELOF_BOTHA
```

### Test Procedure
1. Navigate to AI Mood-to-Cart
2. Select "Luxurious" mood preset
3. Generate AI-powered cart

### Validation Checklist
- [ ] **Network Learning Display**: "Based on 45,000 similar users..." messaging
- [ ] **USD Currency**: All prices in USD format ($X,XXX.XX)
- [ ] **Luxury Products**: Hermès, Rolex, luxury tech items
- [ ] **AI Reasoning**: Network-enhanced explanations >100 chars each
- [ ] **Cart Total**: Accurate USD calculation with tax

### Success Criteria
- Cart generates 2-3 luxury products appropriate for US market
- Network learning indicators visible in AI reasoning
- Total value $2,000+ (luxury tier appropriate)
- No mixed currency symbols

### Network Intelligence Validations
- [ ] **Collaborative Filtering**: "Users like you also bought..."
- [ ] **Network Trends**: "Trending in your network" indicators
- [ ] **Social Proof**: "45,000 users rated this..." messaging
- [ ] **Network Effect**: AI confidence increases with user count mentions

---

## Step 3: LiveSale Shows Network Amplification ✅

### Test URL
```
https://shopstream-app.preview.emergentagent.com/livesale/LS-SEQ-001?locale=en-US&currency=USD&show_network_metrics=true&utm_bundle=SEQUOIA_ROELOF_BOTHA
```

### Test Procedure
1. Access Sequoia-specific LiveSale event
2. Verify network effects metrics visible
3. Check social proof and community features

### Validation Checklist
- [ ] **Event Details**: "Network Effects in Luxury: Hermès Exclusive Drop"
- [ ] **USD Pricing**: Hermès Birkin ($12,000), Tom Ford Suit ($3,200)
- [ ] **Countdown Timer**: Pacific timezone calculation
- [ ] **Network Metrics**: Expected viewers (1,200), current viewers
- [ ] **Social Proof**: Comments, reactions, purchase indicators

### Success Criteria
- LiveSale event accessible and properly scheduled
- Network effects prominently displayed
- Social interaction features functional
- Purchase CTAs in English

### Network Amplification Validations
- [ ] **Viewer Count Effect**: "1,200 expected - join to increase value!"
- [ ] **Social Proof Cascade**: Comments driving purchase urgency
- [ ] **Community Formation**: Connection suggestions during event
- [ ] **Viral Mechanics**: Share buttons with network tracking

---

## Step 4: DM→Leads Flow Creates Network-Aware Lead ✅

### Test Procedure
1. Access: `https://shopstream-app.preview.emergentagent.com/chat?demo_mode=investor&locale=en-US`
2. Start conversation with demo prospect
3. Convert to business lead: `https://shopstream-app.preview.emergentagent.com/business/leads`

### Validation Checklist
- [ ] **DM Interface**: English language, USD context preserved
- [ ] **Lead Creation**: Conversation converts to business opportunity
- [ ] **Network Context**: Lead tagged with network source
- [ ] **Kanban Integration**: Lead appears with network effects indicators

### Success Criteria
- Lead record created with network awareness tags
- Business value displayed in USD
- Network source attribution visible
- Connection to social/LiveSale interactions tracked

### Network-Aware Lead Validation
```json
{
  "lead_id": "LEAD-SEQ-001",
  "company": "Network Luxury Partners",
  "contact": "Sarah Chen",
  "value": "$2,400,000",
  "source": "social_commerce_network",
  "network_context": {
    "locale": "en-US",
    "currency": "USD",
    "timezone": "America/Los_Angeles", 
    "device": "desktop",
    "network_effects": {
      "referred_by": "influencer_network",
      "social_proof_score": 0.78,
      "network_connections": 12
    }
  }
}
```

---

## Step 5: Analytics Display Network Effects KPIs in USD ✅

### Test URL
```
https://shopstream-app.preview.emergentagent.com/analytics?view=investor&currency=USD&focus=network_effects&timeframe=30d&utm_bundle=SEQUOIA_ROELOF_BOTHA
```

### Validation Checklist
- [ ] **GMV in USD**: $2.4M current, $12M projected
- [ ] **Network Density**: 3.2 connections per user (growing)
- [ ] **Viral Coefficient**: 45% with upward trend
- [ ] **B2B Growth**: 23% MoM vendor network expansion
- [ ] **Creator Economy**: 80/20 revenue split driving content

### Success Criteria
- All monetary values in USD ($X.XM format)
- Network effects KPIs prominently displayed
- Growth trajectories showing compound effects
- Sequoia-relevant metrics highlighted

### Network Effects KPI Dashboard
- [ ] **Primary Metrics Section**:
  - Viral Coefficient: 0.45 (target: 0.70)
  - Network Density: 3.2 connections/user
  - Network GMV Effect: $340 per new user
  - B2B Vendor Network: +23% MoM
  
- [ ] **Growth Indicators**:
  - User Network Growth Rate
  - Creator Network Expansion
  - B2B Partnership Velocity
  - AI Network Learning Curve

- [ ] **Compound Growth Visualization**:
  - Network effects timeline
  - Viral loop progression
  - Multi-sided marketplace growth
  - Revenue compound curves

---

## Pass/Fail Criteria

### ✅ PASS Requirements (Sequoia Focus)
- **4/5 steps** must pass completely
- **Network effects metrics** visible in all relevant sections
- **USD currency** consistent throughout
- **Pacific timezone** awareness working
- **Network KPIs** accurate and compelling

### ❌ FAIL Triggers
- Network effects indicators missing or broken  
- Currency mixing (non-USD symbols appearing)
- Timezone errors (showing non-Pacific time)
- Analytics missing viral coefficient or network density
- LiveSale event not scheduled correctly

## Automated Test Command
```bash
npm run test:demo:smoke -- --bundle=SEQUOIA_ROELOF_BOTHA --focus=network_effects
```

## Success Report Template
```markdown
✅ SEQUOIA BUNDLE QA COMPLETE
- Smoke Test: 5/5 PASS
- Network Effects: PROMINENT & ACCURATE
- USD Currency: CONSISTENT  
- Pacific Timezone: CORRECT
- Network KPIs: COMPELLING
- Demo Ready: YES - GO FOR INVESTOR MEETING
```