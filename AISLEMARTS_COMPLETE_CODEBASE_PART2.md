# AisleMarts Complete Codebase - Part 2

## Frontend Application (Expo React Native) - Continued

### Key Frontend Screens

#### For You Feed (/app/frontend/app/for-you.tsx)
The main TikTok-style vertical video feed with infinite scroll, shoppable video overlays, and comprehensive social commerce features.

**Key Features:**
- **Infinite Content Generation**: Dynamic creator pool with realistic engagement metrics
- **Shoppable Video Integration**: Product tagging and in-feed checkout
- **Stories System**: 24-hour expiring stories with commerce indicators
- **Full-Screen Experience**: Gesture-based navigation with auto-hiding UI
- **AI Ranker Integration**: UCB1 algorithm for personalized content

**Creator Verification System:**
- **Gold Wave**: Premium creators with 15-18% commission rates
- **Blue Wave**: Verified creators with standard rates
- **Grey Wave**: Semi-verified creators
- **Unverified**: Casual creators

#### Shop Screen (/app/frontend/app/shop.tsx)  
Complete marketplace with product catalog, search, filtering, and shopping cart integration.

**Features:**
- **Product Grid**: Two-column layout with rich product cards
- **Advanced Search**: Text search with category and sort filtering
- **Zero Commission Model**: Highlighted throughout the UI
- **Seller Tiers**: Visual indicators for Gold/Diamond sellers
- **Real-time Inventory**: Stock levels and conversion rates

#### Cart Screen (/app/frontend/app/cart.tsx)
Multi-currency shopping cart with advanced pricing calculations.

**Features:**
- **Currency-Infinity Engine**: Real-time FX conversion
- **Dual Currency Display**: Primary and secondary currency support
- **FX Margin Tracking**: Retail markup transparency
- **Order Summary**: Comprehensive pricing breakdown

### Frontend Core Components

#### Tab Navigation (/app/frontend/app/(tabs)/_layout.tsx)
Bottom tab navigation with optimized icons and theming:

```tsx
<Tabs
  screenOptions={{
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#1A1A1A',
      borderTopColor: '#333',
      height: 60,
    },
    tabBarActiveTintColor: '#D4AF37',
    tabBarInactiveTintColor: '#888',
  }}
>
  <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
  <Tabs.Screen name="following" options={{ title: 'Following' }} />  
  <Tabs.Screen name="for-you" options={{ title: 'For You' }} />
  <Tabs.Screen name="stories" options={{ title: 'Stories' }} />
  <Tabs.Screen name="marketplace" options={{ title: 'Marts' }} />
  <Tabs.Screen name="business" options={{ title: 'Business' }} />
  <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
</Tabs>
```

#### Root Layout (/app/frontend/app/_layout.tsx)
Main app layout with context providers, deep linking, and navigation setup:

```tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <StatusBar style="light" backgroundColor="#1A1A1A" />
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1A1A1A' },
          animation: 'slide_from_right',
        }}>
          {/* All screen definitions */}
        </Stack>
      </CurrencyProvider>
    </AuthProvider>
  );
}
```

### Legal Documents

#### Privacy Policy (/app/legal/privacy-policy.md)
Complete privacy policy covering:
- Data collection practices
- User rights and controls
- Third-party integrations
- Cookie and tracking policies
- Contact information for privacy concerns

#### Terms of Service (/app/legal/terms-of-service.md)  
Comprehensive terms including:
- User responsibilities
- Platform usage guidelines
- Commerce and payment terms
- Intellectual property rights
- Dispute resolution procedures

### Middleware & Security

#### Authentication Middleware (/app/backend/middleware/auth.py)
JWT-based authentication with role-based access control:

```python
class UserRole:
    BUYER = "buyer"
    SUPPLIER = "supplier" 
    AFFILIATE = "affiliate"
    ADMIN = "admin"
    CREATOR = "creator"

def verify_token(token: str) -> AuthToken:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return AuthToken(
            user_id=payload.get("user_id"),
            role=payload.get("role"),
            email=payload.get("email", ""),
            business_id=payload.get("business_id", "")
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
```

#### Observability System (/app/backend/observability/)

**Event Analytics** (`events.py`):
- Batched event collection for performance
- RFQ funnel tracking
- Affiliate conversion analytics
- System monitoring events

**Metrics Collection** (`metrics.py`):
- Prometheus metrics integration
- HTTP request monitoring
- Domain-specific KPIs (RFQ, Affiliate)
- SLI/SLO tracking for reliability

#### Validation System (/app/backend/validation/rfq_validation.py)
Production-ready input validation with business rules:

```python
class RFQCreateValidated(BaseModel):
    title: str = Field(..., min_length=10, max_length=200)
    category: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=50, max_length=5000)
    quantity: int = Field(..., ge=1, le=1000000)
    
    @validator('description')
    def validate_description(cls, v):
        # Anti-spam and content filtering
        prohibited_keywords = [
            'illegal', 'weapon', 'drug', 'counterfeit'
        ]
        v_lower = v.lower()
        for keyword in prohibited_keywords:
            if keyword in v_lower:
                raise RFQValidationError(f"Prohibited content: {keyword}")
        return v
```

## Advanced Features

### AI Ranking System (/app/backend/ranker_mongodb.py)
UCB1 (Upper Confidence Bound) algorithm for personalized content ranking:

```python
def calculate_ucb1_score(arm: ArmData, total_pulls: int, exploration_factor: float = 2.0) -> float:
    if arm.pulls == 0:
        return float('inf')
    
    exploitation = arm.total_reward / arm.pulls
    exploration = math.sqrt(exploration_factor * math.log(total_pulls) / arm.pulls)
    return exploitation + exploration
```

### Shoppable Video System
**Frontend Integration:**
- Video overlay product tagging
- In-feed checkout flow
- Real-time product information
- Gesture-based shopping interface

**Backend Support:**
- Product tagging API
- Inventory management
- Order processing
- Analytics tracking

### Affiliate Marketing Platform
**Multi-tier Commission Structure:**
```python
def calculate_commission(amount: float, campaign: AffiliateCampaign, creator_tier: CreatorTier) -> float:
    base_rate_bps = campaign.model.base_rate_bps
    tier_bonus = campaign.model.tier_bonuses.get(creator_tier.value, 0)
    total_rate_bps = base_rate_bps + tier_bonus
    commission = amount * (total_rate_bps / 10000)
    return round(commission, 2)
```

**Performance Tracking:**
- Real-time click tracking
- Conversion analytics
- Creator leaderboards
- Campaign performance metrics

### B2B RFQ System
**Complete Quote Management:**
- Secure quote submission
- Business rule validation
- Multi-currency support
- Supplier verification
- Response time tracking

**Features:**
- Category-based restrictions
- Quantity-based business rules
- Attachment support
- Deadline management
- Quote comparison tools

### Currency Engine
**Multi-Currency Support:**
- Real-time FX rate conversion
- Dual currency display
- FX margin tracking
- Rate freshness indicators
- Fallback currency handling

## Production Deployment

### Docker Configuration

**Backend Production Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["gunicorn", "server:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8001"]
```

**Docker Compose Production:**
```yaml
version: '3.8'
services:
  aislemarts-api:
    build:
      context: ./backend
      dockerfile: Dockerfile.production
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=${MONGO_URL}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
```

### Caddy Server Configuration (/app/Caddyfile.production)
```
aislemarts.com, www.aislemarts.com {
    # Static file hosting for app linking
    handle /.well-known/* {
        root * /var/www/html
        file_server
    }
    
    # API routes
    handle /api/* {
        reverse_proxy localhost:8001
    }
    
    encode gzip
    log {
        output file /var/log/caddy/aislemarts.log
        level INFO
    }
}

api.aislemarts.com {
    reverse_proxy localhost:8001 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    encode gzip
}
```

### App Store Configuration

**EAS Build Configuration** (`eas.json`):
```json
{
  "cli": {
    "version": ">= 8.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "developer@aislemarts.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "path/to/api-key.json",
        "track": "production"
      }
    }
  }
}
```

**Universal Links Configuration:**
```json
// Android App Links (assetlinks.json)
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.aislemarts.app",
    "sha256_cert_fingerprints": ["..."]
  }
}]

// iOS Universal Links (apple-app-site-association)
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAMID.com.aislemarts.app",
      "paths": ["*"]
    }]
  }
}
```

## Load Testing & Performance

### K6 Load Testing Scripts

**RFQ Creation Test** (`/app/k6/rfq-create.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const payload = JSON.stringify({
    title: `Load Test RFQ ${Date.now()}`,
    category: 'electronics',
    description: 'This is a load testing RFQ for performance validation...',
    quantity: 100,
    target_price: 50.00,
    currency: 'USD',
    shipping_destination: 'New York, NY, USA'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_token'
    },
  };

  const response = http.post('http://localhost:8001/api/rfq', payload, params);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

**Affiliate Click Test** (`/app/k6/affiliate-click.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const trackingCodes = ['STYLE2025', 'BEAUTY30', 'TECHWAT', 'LIFE2025'];
  const code = trackingCodes[Math.floor(Math.random() * trackingCodes.length)];
  
  const response = http.get(`http://localhost:8001/api/affiliate/track/${code}`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'has redirect_to': (r) => JSON.parse(r.body).redirect_to !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(Math.random() * 2); // Random delay between 0-2 seconds
}
```

## Testing & Quality Assurance

The application includes comprehensive testing protocols documented in `test_result.md` for both backend and frontend validation.

**Backend Testing Coverage:**
- API endpoint validation
- Authentication and authorization
- Database operations
- Business rule enforcement
- Performance benchmarks

**Frontend Testing Coverage:**  
- Navigation flow validation
- Component rendering
- User interaction testing
- Cross-platform compatibility
- Accessibility compliance

## Complete Technology Stack

**Frontend:**
- **Framework**: Expo SDK 54, React Native 0.79
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand, React Context
- **UI Components**: Native React Native components
- **Networking**: Axios with retry logic
- **Offline Support**: AsyncStorage, background sync

**Backend:**
- **Framework**: FastAPI 0.111 with Uvicorn/Gunicorn
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT with role-based access
- **Validation**: Pydantic models with custom validators
- **Monitoring**: Prometheus metrics, structured logging
- **File Storage**: S3 compatible storage for media

**Infrastructure:**
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for development
- **Proxy/SSL**: Caddy server with automatic HTTPS
- **Mobile Builds**: EAS (Expo Application Services)
- **Deep Linking**: Universal Links (iOS) + App Links (Android)

**Development Tools:**
- **Load Testing**: K6 for performance validation
- **Code Quality**: ESLint, TypeScript strict mode
- **API Documentation**: FastAPI automatic OpenAPI generation
- **Mobile Testing**: Expo Go for development, EAS Build for distribution

This represents the complete, production-ready AisleMarts social commerce platform with all the code, configurations, and deployment assets needed for a successful App Store launch and scaled operation.

## Summary

AisleMarts is a comprehensive social commerce platform that combines:

1. **TikTok-Style Discovery** - Vertical video feed with infinite scroll
2. **Shoppable Content** - In-feed checkout and product tagging
3. **0% Commission Model** - Direct creator-to-consumer sales
4. **B2B Marketplace** - RFQ system for business buyers
5. **Affiliate Program** - Multi-tier creator monetization
6. **Global Commerce** - Multi-currency support with real-time FX
7. **Production Ready** - Full deployment pipeline and monitoring

The platform is built for scale, compliance, and exceptional user experience across all touchpoints.