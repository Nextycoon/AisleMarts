# AisleMarts Investor Demo QA Verification Checklist

## Overview
Comprehensive 5-step smoke testing protocol ensuring every investor demo bundle delivers flawless experience.

## Universal Testing Protocol

### Pre-Test Setup
- [ ] Demo environment accessible: `https://infinity-stories.preview.emergentagent.com`
- [ ] Bundle-specific credentials loaded
- [ ] Awareness Engine context parameters ready
- [ ] UTM tracking codes configured
- [ ] Fresh seed data confirmed

## 5-Step Smoke Test (Per Bundle)

### Step 1: Home Renders with Context Awareness ✅
**Objective**: Verify awareness engine adapts UI/content based on investor context

**Test Procedure**:
1. Access bundle home URL with context parameters:
   `{BASE}/?locale={LOCALE}&currency={CURRENCY}&tz={TIMEZONE}&device={DEVICE}`

2. **Validate Elements**:
   - [ ] **Locale Display**: UI text in correct language ({LOCALE})
   - [ ] **Currency Integration**: Prices display in {CURRENCY} format
   - [ ] **Timezone Awareness**: Time-based greetings appropriate for {TIMEZONE}
   - [ ] **Device Optimization**: Layout optimized for {DEVICE} (mobile/desktop)
   - [ ] **Cultural Adaptation**: RTL support for Arabic locales if applicable

**Success Criteria**:
- All 4 awareness dimensions (locale/currency/timezone/device) correctly applied
- No console errors related to localization
- Proper currency formatting (symbols, decimal places)
- Time-based content matches bundle timezone

**Bundle-Specific Validations**:
- **LVMH**: French language display, EUR currency, CET timezone
- **Tiger Global**: Singapore English, SGD currency, SGT timezone
- **Index**: British English, GBP currency, GMT timezone

---

### Step 2: AI Mood-to-Cart Returns Localized Catalog ✅
**Objective**: Confirm AI system generates contextually appropriate product recommendations

**Test Procedure**:
1. Navigate to: `{BASE}/mood-to-cart?preset=luxurious&locale={LOCALE}&currency={CURRENCY}`
2. Trigger AI cart generation for "luxurious" mood

**Validate Elements**:
   - [ ] **Product Localization**: Products appropriate for {LOCALE} market
   - [ ] **Currency Pricing**: All prices in {CURRENCY} with correct formatting
   - [ ] **Cultural Relevance**: Product selection matches regional preferences
   - [ ] **AI Reasoning**: Explanations in correct language
   - [ ] **Cart Total**: Accurate currency conversion and tax calculation

**Success Criteria**:
- 2-3 products generated with mood-appropriate selection
- Cart total calculated correctly in bundle currency
- AI explanations > 100 characters per product
- No English text in non-English locales (except brand names)

**RTL Testing** (Arabic bundles):
- [ ] Cart interface displays right-to-left
- [ ] Currency symbols positioned correctly
- [ ] Product cards maintain RTL layout

---

### Step 3: LiveSale Deep Link Shows Localized Experience ✅
**Objective**: Validate live commerce features with regional/cultural adaptations

**Test Procedure**:
1. Access: `{BASE}/livesale/{eventId}?locale={LOCALE}&currency={CURRENCY}&countdown=true`
2. Join demo LiveSale session

**Validate Elements**:
   - [ ] **Pricing Display**: Products show prices in {CURRENCY}
   - [ ] **Countdown Timer**: Time zones correctly calculated
   - [ ] **Purchase CTA**: Buttons/text in {LOCALE} language
   - [ ] **Creator Content**: Appropriate for regional audience
   - [ ] **Social Proof**: Viewer counts, engagement in local format

**Success Criteria**:
- Live event accessible with correct scheduling
- Countdown reflects bundle timezone
- Purchase flow maintains language consistency
- No broken translations or mixed languages

**Investor-Specific Focus**:
- **Sequoia**: Network effects metrics visible
- **LVMH**: Luxury brand partnerships prominent
- **Lightspeed**: Social engagement features highlighted

---

### Step 4: DM→Leads Flow Creates Awareness-Tagged Lead ✅  
**Objective**: Confirm communication suite integrates with business tools using awareness data

**Test Procedure**:
1. Access: `{BASE}/chat?demo_mode=investor&locale={LOCALE}`
2. Start conversation with demo lead
3. Convert conversation to business lead via: `{BASE}/business/leads`

**Validate Elements**:
   - [ ] **Conversation Creation**: DM interface in correct {LOCALE}
   - [ ] **Lead Generation**: Lead record created with awareness tags
   - [ ] **Context Preservation**: Locale/currency/timezone carried through
   - [ ] **Business Integration**: Lead appears in Kanban with proper formatting
   - [ ] **Data Integrity**: All awareness fields populated correctly

**Success Criteria**:
- Lead record contains: locale, currency, timezone, device context
- Business value displayed in correct currency
- Lead notes maintain language consistency
- Kanban interface adapts to locale

**Awareness Tags Validation**:
```json
{
  "lead_awareness": {
    "locale": "{LOCALE}",
    "currency": "{CURRENCY}", 
    "timezone": "{TIMEZONE}",
    "device": "{DEVICE}",
    "source": "investor_demo"
  }
}
```

---

### Step 5: Analytics Investor View Displays KPIs in Bundle Currency ✅
**Objective**: Ensure investor-facing metrics display with proper regional formatting

**Test Procedure**:
1. Access: `{BASE}/analytics?view=investor&currency={CURRENCY}&timeframe=30d`
2. Review all KPI dashboards

**Validate Elements**:
   - [ ] **GMV Display**: Gross Merchandise Value in {CURRENCY}
   - [ ] **AOV Calculation**: Average Order Value with correct currency symbols
   - [ ] **Conversion Rates**: Percentage format appropriate for locale
   - [ ] **Growth Metrics**: Time-based data reflects bundle timezone
   - [ ] **Performance Charts**: Axis labels and legends in {LOCALE}

**Success Criteria**:
- All monetary values display in bundle currency
- Number formatting follows locale conventions (1,000.00 vs 1.000,00)
- No mixing of currency symbols within views
- Growth rates calculated correctly for timezone

**Investor-Specific KPIs**:
- **Sequoia**: Network density, viral coefficient
- **a16z**: AI engagement rates, consumer retention  
- **LVMH**: Luxury AOV, European GMV breakdown
- **General Catalyst**: Marketplace health metrics
- **Lightspeed**: Social conversion, mobile engagement
- **Index**: European revenue, multi-market growth
- **Bessemer**: Marketplace take rate, SaaS metrics
- **Tiger Global**: Global GMV, emerging market penetration

## Bundle-Specific Test Matrix

| Bundle | Locale | Currency | Key Validation Focus |
|--------|--------|----------|---------------------|
| Sequoia | en-US | USD | Network effects metrics, B2B growth |
| a16z | en-US | USD | AI engagement, consumer retention |
| LVMH | fr-FR | EUR | French localization, luxury brands |
| General Catalyst | en-US | USD | Marketplace health, unit economics |
| Lightspeed | en-US | USD | Social engagement, mobile conversion |
| Index | en-GB | GBP | European compliance, multi-market |
| Bessemer | en-US | USD | SaaS metrics, marketplace take rate |
| Tiger Global | en-SG | SGD | Multi-currency, emerging markets |

## Pass/Fail Criteria

### ✅ PASS Requirements
- **4/5 steps** must pass completely
- **Critical failures**: None in Step 1 (Home) or Step 5 (Analytics)
- **Language consistency**: No mixed locale content
- **Currency accuracy**: All conversions within 1% tolerance
- **Performance**: Page loads < 3 seconds

### ❌ FAIL Triggers
- Home page fails to render with context
- Currency calculations incorrect
- Major UI breaks in non-English locales
- Analytics display wrong or missing data
- Any critical console errors

## Automated Testing Integration

### Smoke Test Execution
```bash
# Run full bundle smoke test
npm run test:demo:smoke -- --bundle=SEQUOIA_ROELOF_BOTHA

# Parallel execution for all bundles  
npm run test:demo:all-bundles

# Quick validation (Steps 1, 3, 5 only)
npm run test:demo:quick -- --bundle=A16Z_CHRIS_DIXON
```

### Continuous Monitoring
- **Frequency**: Every 4 hours during business days
- **Alert Threshold**: 2+ consecutive failures
- **Escalation**: Immediate Slack notification to #investor-demos

## Post-Test Reporting

### Success Report Template
```markdown
✅ BUNDLE QA COMPLETE: {BUNDLE_NAME}
- Smoke Test: 5/5 PASS
- Context Awareness: OPERATIONAL  
- Currency Display: ACCURATE
- Localization: CONSISTENT
- Performance: < 2s average
- Ready for investor demo: YES
```

### Failure Report Template  
```markdown
❌ BUNDLE QA FAILED: {BUNDLE_NAME}
- Failed Steps: {STEP_NUMBERS}
- Critical Issues: {ISSUE_LIST}
- Impact: {HIGH/MEDIUM/LOW}
- ETA Fix: {TIMESTAMP}
- Demo Ready: NO - HOLD
```

## Quality Gates

### Pre-Launch Requirements
- [ ] All 8 bundles pass 5-step smoke test
- [ ] Currency conversion accuracy verified
- [ ] Multi-language functionality confirmed
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Investor feedback incorporated

### Ongoing Maintenance
- [ ] Daily smoke tests pass >95%
- [ ] Real-time monitoring active
- [ ] Backup/restore procedures validated
- [ ] Demo data freshness confirmed
- [ ] UTM tracking accuracy verified