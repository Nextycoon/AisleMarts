# AisleMarts Investor Demo Reset & Seed Playbook

## Overview
Automated nightly reset system ensuring pristine demo environment for every investor interaction.

## Reset Schedule
- **Primary Reset**: 03:00 local time per bundle timezone
- **Secondary Reset**: On-demand via admin interface
- **Emergency Reset**: Manual trigger for critical demos

## Bundle-Specific Reset Times

| Bundle | Timezone | Reset Time (Local) | UTC Time |
|--------|----------|-------------------|----------|
| Sequoia | America/Los_Angeles | 03:00 PST/PDT | 11:00/10:00 UTC |
| a16z | America/New_York | 03:00 EST/EDT | 08:00/07:00 UTC |
| LVMH | Europe/Paris | 03:00 CET/CEST | 02:00/01:00 UTC |
| General Catalyst | America/New_York | 03:00 EST/EDT | 08:00/07:00 UTC |
| Lightspeed | America/Los_Angeles | 03:00 PST/PDT | 11:00/10:00 UTC |
| Index | Europe/London | 03:00 GMT/BST | 03:00/02:00 UTC |
| Bessemer | America/New_York | 03:00 EST/EDT | 08:00/07:00 UTC |
| Tiger Global | Asia/Singapore | 03:00 SGT | 19:00 UTC (prev day) |

## Seed Data Structure

### 1. Product Catalog (50 luxury SKUs per region)

#### US/Global SKUs (Sequoia, a16z, General Catalyst, Lightspeed, Bessemer)
```json
{
  "luxury_fashion": [
    {"id": "LUX-001", "name": "Hermès Birkin 35", "price_usd": 12000, "category": "handbags"},
    {"id": "LUX-002", "name": "Rolex Submariner", "price_usd": 8500, "category": "watches"},
    {"id": "LUX-003", "name": "Tom Ford Suit", "price_usd": 3200, "category": "menswear"}
  ],
  "luxury_tech": [
    {"id": "TECH-001", "name": "Bang & Olufsen Beolab 50", "price_usd": 18000, "category": "audio"},
    {"id": "TECH-002", "name": "Leica M11 Camera", "price_usd": 8300, "category": "photography"}
  ],
  "luxury_home": [
    {"id": "HOME-001", "name": "Baccarat Crystal Chandelier", "price_usd": 15000, "category": "lighting"},
    {"id": "HOME-002", "name": "Hermès Avalon Blanket", "price_usd": 1800, "category": "textiles"}
  ]
}
```

#### European SKUs (LVMH, Index)
```json
{
  "european_luxury": [
    {"id": "EUR-001", "name": "Louis Vuitton Capucines MM", "price_eur": 4950, "category": "handbags"},
    {"id": "EUR-002", "name": "Dior J'adore Parfum", "price_eur": 120, "category": "fragrance"},
    {"id": "EUR-003", "name": "Bulgari Serpenti Watch", "price_eur": 7200, "category": "jewelry"}
  ]
}
```

#### APAC SKUs (Tiger Global)
```json
{
  "apac_luxury": [
    {"id": "APAC-001", "name": "Mikimoto Pearl Necklace", "price_sgd": 8500, "category": "jewelry"},
    {"id": "APAC-002", "name": "Shiseido Prestige Collection", "price_sgd": 450, "category": "skincare"}
  ]
}
```

### 2. Creator Profiles (3 per region)

#### Global Creators
```json
{
  "creators": [
    {
      "id": "creator-001",
      "name": "Isabella Luxe",
      "region": "US",
      "followers": 250000,
      "specialty": "luxury_fashion",
      "avg_session_viewers": 1200,
      "conversion_rate": 0.045
    },
    {
      "id": "creator-002", 
      "name": "Marie Élégance",
      "region": "EU",
      "followers": 180000,
      "specialty": "french_luxury",
      "avg_session_viewers": 800,
      "conversion_rate": 0.052
    },
    {
      "id": "creator-003",
      "name": "Yuki Premium",
      "region": "APAC", 
      "followers": 320000,
      "specialty": "asian_luxury_brands",
      "avg_session_viewers": 1500,
      "conversion_rate": 0.038
    }
  ]
}
```

### 3. Scheduled LiveSale Events

#### Event Timing (T+48h from demo access)
```json
{
  "livesale_schedule": [
    {
      "bundle": "SEQUOIA_ROELOF_BOTHA",
      "event_id": "LS-SEQ-001",
      "title": "Network Effects in Luxury: Hermès Exclusive Drop",
      "creator": "Isabella Luxe",
      "scheduled_time": "T+48h 18:00 PST",
      "featured_products": ["LUX-001", "LUX-003"],
      "expected_viewers": 1200,
      "demo_focus": "network_effects"
    },
    {
      "bundle": "LVMH_JULIE_BERCOVY", 
      "event_id": "LS-LVMH-001",
      "title": "Paris Fashion Week: Louis Vuitton Première",
      "creator": "Marie Élégance",
      "scheduled_time": "T+48h 20:00 CET",
      "featured_products": ["EUR-001", "EUR-002"],
      "expected_viewers": 800,
      "demo_focus": "luxury_brand_integration"
    }
  ]
}
```

### 4. Business Leads Sample Data

#### Kanban Board Setup (5 sample cards per bundle)
```json
{
  "leads_kanban": {
    "columns": ["new", "qualified", "proposal", "negotiation", "closed"],
    "sample_leads": [
      {
        "id": "LEAD-001",
        "company": "Nordstrom Luxury",
        "contact": "Sarah Chen",
        "value": "$2.4M",
        "stage": "proposal",
        "source": "awareness_engine_referral",
        "locale": "en-US",
        "currency": "USD",
        "notes": "Interested in AI-powered luxury recommendations"
      },
      {
        "id": "LEAD-002",
        "company": "Galeries Lafayette",
        "contact": "Pierre Dubois", 
        "value": "€1.8M",
        "stage": "qualified",
        "source": "livesale_engagement",
        "locale": "fr-FR", 
        "currency": "EUR",
        "notes": "Wants European market integration"
      }
    ]
  }
}
```

## Reset Procedures

### 1. Data Cleanup
```bash
# Clear demo user sessions
db.user_sessions.deleteMany({"email": /\.demo@aislemarts\.luxury$/})

# Reset product inventory
db.products.updateMany({}, {"$set": {"inventory": 100, "reserved": 0}})

# Clear demo conversations
db.conversations.deleteMany({"participants.email": /\.demo@aislemarts\.luxury$/})

# Reset analytics counters
db.analytics.deleteMany({"user_type": "demo"})
```

### 2. Fresh Seed Data Insertion
```bash
# Insert luxury product catalog
mongoimport --db aislemarts --collection products --file /seeds/luxury_products.json

# Insert creator profiles
mongoimport --db aislemarts --collection creators --file /seeds/creator_profiles.json

# Schedule LiveSale events
mongoimport --db aislemarts --collection livesales --file /seeds/livesale_schedule.json

# Populate leads kanban
mongoimport --db aislemarts --collection leads --file /seeds/business_leads.json
```

### 3. Awareness Engine Context Refresh
```bash
# Update context profiles
curl -X POST /api/awareness/refresh-contexts \
  -H "Content-Type: application/json" \
  -d @/seeds/awareness_contexts.json

# Validate currency rates
curl -X GET /api/awareness/currency/validate

# Test locale adaptations
curl -X GET /api/awareness/test-localization
```

### 4. Performance Optimization
```bash
# Rebuild search indexes
db.products.reIndex()
db.conversations.reIndex()

# Clear cache layers
redis-cli FLUSHDB

# Warm up CDN
curl -X POST /api/admin/cdn-warmup
```

## Verification Checklist

### Post-Reset Validation (Automated)
- [ ] Product catalog: 50 items per region
- [ ] Creator profiles: 3 active creators
- [ ] LiveSale events: Scheduled T+48h per bundle
- [ ] Leads kanban: 5 sample leads with awareness tags
- [ ] Currency rates: Real-time updated
- [ ] Locale files: All 7 languages loaded
- [ ] Analytics: Clean slate, tracking enabled
- [ ] Authentication: Demo accounts functional

### Bundle-Specific Checks
- [ ] Sequoia: Network effects demo data ready
- [ ] a16z: AI infrastructure examples loaded
- [ ] LVMH: French luxury brands featured
- [ ] General Catalyst: Marketplace metrics seeded
- [ ] Lightspeed: Social engagement data ready
- [ ] Index: European compliance features active
- [ ] Bessemer: SaaS marketplace examples loaded
- [ ] Tiger Global: Multi-currency operations ready

## Emergency Procedures

### Immediate Reset (< 5 minutes)
```bash
# One-command emergency reset
./scripts/emergency_demo_reset.sh {BUNDLE_NAME}

# Validate core functionality
./scripts/demo_smoke_test.sh {BUNDLE_NAME}
```

### Rollback to Previous State
```bash
# Restore from backup (if reset fails)
mongorestore --db aislemarts /backups/demo_state_$(date -d yesterday +%Y%m%d)/

# Verify rollback success
./scripts/verify_demo_state.sh
```

## Monitoring & Alerts

### Reset Success Notifications
- **Slack**: `#investor-demos` channel
- **Email**: `demos@aislemarts.luxury` 
- **Dashboard**: Admin panel status indicator

### Failure Escalation
- **Critical**: Page on-call engineer immediately
- **High**: Email engineering team + sales lead
- **Medium**: Slack notification with retry attempt