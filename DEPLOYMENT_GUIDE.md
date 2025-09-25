# AisleMarts - Deployment & Testing Guide

## 🚀 Quick Start Guide

### Immediate Testing Access
- **Web App**: https://tiktok-commerce-1.preview.emergentagent.com
- **Mobile (Expo Go)**: Open Expo Go app → Enter URL: `exp://aislefeed.ngrok.io:80`

### Expected User Experience
1. **Loading**: "AisleMarts - Connecting Global Commerce" with progress bar
2. **Auto-Navigation**: Automatically opens For You feed after loading
3. **Stories Access**: Tap navigation to access TikTok-style vertical stories
4. **Performance**: Smooth 60fps scrolling with AI-powered content ranking

## 📱 Mobile Testing Instructions

### Expo Go Setup
1. **Install Expo Go** from App Store (iOS) or Google Play (Android)
2. **Open Expo Go** on your device
3. **Enter URL**: Tap "Enter URL manually" and enter `exp://aislefeed.ngrok.io:80`
4. **Wait for Load**: App will download and install automatically

### Testing Checklist - Mobile
- [ ] Loading screen displays brand message correctly
- [ ] Auto-navigation to For You feed works  
- [ ] Stories tab accessible and functional
- [ ] Vertical scrolling smooth (55-60fps target)
- [ ] Video auto-play/pause working
- [ ] Performance HUD showing metrics (if enabled)

## 💻 Web Testing Instructions

### Browser Access
1. **Open Browser** (Chrome, Safari, Firefox recommended)
2. **Navigate**: Go to `https://tiktok-commerce-1.preview.emergentagent.com`
3. **Mobile View**: Use developer tools to simulate mobile viewport (390x844)

### Testing Checklist - Web
- [ ] Responsive design on mobile viewport
- [ ] Loading progression works smoothly
- [ ] Navigation buttons functional
- [ ] Stories screen renders correctly
- [ ] Performance metrics visible in console

## 🔧 Developer Testing

### Backend Health Check
```bash
# Test currency API (should return 185+ currencies)
curl -s "http://localhost:8001/api/currency/rates?base=USD" | head -3

# Test For You feed
curl -s "http://localhost:8001/api/social/feed/for-you?user_id=test_user_001&limit=10"

# Check service status
sudo supervisorctl status
```

### Frontend Development
```bash
# Navigate to frontend
cd /app/frontend

# Start development server
yarn start

# Clear cache if needed
npx expo start --clear

# Check tunnel status
grep "Tunnel" /var/log/supervisor/expo.out.log
```

### Performance Testing
```bash
# Monitor real-time performance
tail -f /var/log/supervisor/backend.err.log | grep "For You feed"

# Check bundle size
ls -la /app/frontend/dist/

# Monitor resource usage
top -p $(pgrep -f "expo\|backend\|mongo")
```

## 🎯 Feature Testing Guide

### P0 - Security & Hardening
**Test HMAC Authentication**:
```bash
# Valid request with HMAC (should succeed)
curl -X POST "http://localhost:8001/api/track/impression" \
  -H "Content-Type: application/json" \
  -H "X-Signature: [valid_signature]" \
  -d '{"story_id": "test", "user_id": "test_user"}'

# Invalid signature (should return 401)
curl -X POST "http://localhost:8001/api/track/impression" \
  -H "Content-Type: application/json" \
  -H "X-Signature: invalid" \
  -d '{"story_id": "test", "user_id": "test_user"}'
```

**Test Idempotency**:
- Send same request twice
- First should succeed (200/201)
- Second should return 409 Conflict

**Test Multi-Currency**:
- Switch between USD, EUR, GBP, JPY in app
- Verify proper decimal handling (JPY = 0dp, USD/EUR = 2dp)

### P1 - Performance Features  
**Test Offline Resilience**:
1. Turn off internet connection
2. Interact with app (scroll, tap buttons)
3. Turn internet back on  
4. Verify events are queued and sent

**Test Video Preloading**:
1. Navigate to Stories
2. Monitor network tab for video requests
3. Verify 3 videos ahead are being preloaded

**Test FPS Performance**:
1. Enable Performance HUD (if not visible)
2. Scroll rapidly through stories
3. Verify FPS stays above 55fps

### P2 - AI Features
**Test Story Ranking**:
1. Refresh For You feed multiple times
2. Verify story order changes (AI ranking active)
3. Check console for ranking source (server/client)

**Test A/B Bucketing**:
- With different user IDs, verify some users get different experiences
- Check canary rollout percentage (5% default)

## 📊 Performance Benchmarks

### Expected Performance Targets
- **Loading Time**: <1.5s on warm start
- **FPS**: 55-60fps sustained scrolling  
- **Cache Hit Rate**: >85% on media requests
- **API Response**: <500ms for most endpoints
- **Event Success Rate**: >95% for tracking events

### Performance HUD Metrics
If enabled (`EXPO_PUBLIC_SHOW_PERF_HUD=1`):
- **FPS**: Real-time frame rate
- **Cache**: Hit/miss ratio and usage
- **Stories**: Count and load status
- **Network**: Queue size and success rate

## 🚨 Troubleshooting Common Issues

### Issue: App stuck on loading screen
**Solutions**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear Expo cache: `npx expo start --clear`
3. Restart services: `sudo supervisorctl restart all`

### Issue: Tunnel connection failed  
**Solutions**:
1. Check tunnel status: `grep "Tunnel" /var/log/supervisor/expo.out.log`
2. Restart Expo: `sudo supervisorctl restart expo`
3. Verify ngrok not blocked by firewall

### Issue: Stories not loading
**Solutions**:
1. Check backend health: `curl localhost:8001/api/social/feed/for-you?user_id=test`
2. Verify environment variables set correctly
3. Check browser console for JavaScript errors

### Issue: Performance HUD not visible
**Solutions**:
1. Verify `EXPO_PUBLIC_SHOW_PERF_HUD=1` in .env
2. Restart frontend after env change
3. Check if overlaid by other UI elements

## 🔄 Deployment Commands

### Full System Restart
```bash
# Stop all services
sudo supervisorctl stop all

# Start all services  
sudo supervisorctl start all

# Check status
sudo supervisorctl status
```

### Individual Service Management
```bash
# Backend only
sudo supervisorctl restart backend

# Frontend only
sudo supervisorctl restart expo

# MongoDB only
sudo supervisorctl restart mongodb
```

### Health Check After Deployment
```bash
# Verify all services running
sudo supervisorctl status | grep RUNNING

# Test backend endpoints
curl -s localhost:8001/api/currency/rates?base=USD | jq .

# Check frontend build
curl -s https://tiktok-commerce-1.preview.emergentagent.com | grep AisleMarts

# Verify tunnel
curl -s https://aislefeed.ngrok.io | head -5
```

## 📈 Monitoring & Logs

### Key Log Locations
```bash
# Frontend logs
tail -f /var/log/supervisor/expo.out.log
tail -f /var/log/supervisor/expo.err.log

# Backend logs  
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log

# System logs
sudo supervisorctl maintail
```

### Important Log Patterns
```bash
# Success indicators
grep "✅" /var/log/supervisor/backend.err.log
grep "Tunnel connected" /var/log/supervisor/expo.out.log

# Error patterns
grep "ERROR\|FAILED" /var/log/supervisor/*.log
grep "422\|500" /var/log/supervisor/backend.out.log
```

## 🎯 Production Readiness Checklist

### Pre-Launch Verification
- [ ] All services status RUNNING
- [ ] Backend API health check passes
- [ ] Frontend loads within 1.5s
- [ ] Mobile tunnel accessible
- [ ] Performance metrics within targets
- [ ] Security features operational (HMAC, idempotency)
- [ ] AI ranking system active
- [ ] Event tracking functioning
- [ ] Multi-currency support working

### Series A Demo Checklist  
- [ ] Brand loading experience polished
- [ ] TikTok-style stories demonstrate smoothly
- [ ] Performance HUD shows impressive metrics
- [ ] Backend scales demonstrated (185 currencies, AI ranking)
- [ ] 0% commission model clearly presented
- [ ] Technical excellence evident (P0/P1/P2 features)

## 📞 Support & Maintenance

### System Monitoring Active
- Performance alerts configured
- Resource usage tracking
- Error rate monitoring  
- Tunnel stability checks

### Maintenance Tasks Automated
- ETL pipeline for AI ranking data
- Nightly stats decay for freshness
- Cache cleanup and optimization
- Log rotation and archival

**Deployment Status**: PRODUCTION READY ✅  
**Monitoring**: ACTIVE ✅  
**Support**: CONFIGURED ✅