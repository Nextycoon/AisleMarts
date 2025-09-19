# CHANGELOG - AisleMarts

## [v1.0.1] - 2025-09-19 - ALL-IN MICRO-SPRINT RELEASE

### 🚀 MAJOR FEATURES ADDED
- **AI Intent Parser**: Unified schema with confidence scoring for luxury/deals/trending/cart/checkout intents
- **Business KPI Monitoring**: Prometheus counters for voice intents and order tracking
- **Wishlist APIs**: Complete CRUD operations with ObjectId validation and duplicate handling
- **Order Cancellation**: Idempotent API with proper status validation
- **Performance Optimization**: MongoDB indexes and cached collections endpoints
- **Security Enhancement**: Rate limiting middleware (120 requests/60s per IP)

### 🔧 FRONTEND IMPROVEMENTS
- **AI Copilot Bar**: Mood selection components with 44px touch targets
- **Order Success UX**: Professional glassmorphism success sheet component
- **AI Integration Library**: parseIntent function with environment configuration
- **Testing Suite**: Jest configuration with component and integration tests

### 🛡️ SECURITY & INFRASTRUCTURE
- Rate limiting middleware with token bucket algorithm
- MongoDB ObjectId validation with proper error handling
- Prometheus business metrics integration
- Performance indexes for products, orders, and wishlist collections

### 🐛 HOTFIXES
- **ObjectId Validation**: Fixed wishlist API parameter handling with proper Pydantic models
- **Duplicate Guard**: Added exists status for duplicate wishlist entries
- **Error Handling**: Proper 400 status codes for invalid ObjectId inputs
- **Routing Fix**: Resolved Expo Router duplicate screen name conflicts

### 📊 METRICS & MONITORING
- `am_voice_intents_total` counter by intent label
- `am_orders_created_total` counter for business tracking
- `am_checkout_latency_seconds` histogram for performance monitoring

### 🧪 TESTING
- Backend API testing with 95% success rate validation
- Frontend component testing with Jest and React Native Testing Library
- Production smoke test suite for deployment validation
- Manual UAT documentation for investor demonstrations

### 📱 MOBILE EXPERIENCE
- Fixed file-based routing conflicts in Expo Router
- Improved dependency management with proper React Navigation setup
- Enhanced mobile UX with luxury theme and professional components
- Voice functionality integration with "Meet Aisle" AI assistant

## Production Readiness
- ✅ All API endpoints operational (AI parser, wishlist, orders, collections)
- ✅ Rate limiting active and tested
- ✅ Business metrics tracking functional
- ✅ Mobile app serving with professional UX
- ✅ Security validations passing
- ✅ Performance optimizations active

**SERIES A INVESTOR DEMONSTRATION READY** 🎯