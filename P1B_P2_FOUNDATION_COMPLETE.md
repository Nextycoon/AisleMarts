# P1b + P2 Foundation Complete - Ready for Device Testing & AI Recommendations

## 🚀 P1b Video Preloading & Auto-Pause

**Enhanced PrefetchCoordinator:**
- Video preloading with `expo-asset` file system caching ✅
- Image prefetching with React Native `Image.prefetch()` ✅  
- Intelligent cache size estimation (1.5MB default for videos) ✅
- Error handling for prefetch failures (silent, non-blocking) ✅
- Performance stats tracking for monitoring ✅

**StoryCard with Video Support:**
- `expo-av` Video component with auto-play/pause ✅
- Visibility-based video control (`shouldPlay` prop) ✅
- Proper React Native styling (no HTML elements) ✅
- Visual indicators for video vs image content ✅
- Muted/unmuted audio control ready ✅

**Optimized FlatList Integration:**
- Visibility tracking with `onViewableItemsChanged` ✅
- Auto-pause off-screen videos for performance ✅
- Proper `getItemLayout` for smooth horizontal paging ✅
- `overScrollMode="never"` for Android jank prevention ✅

## 🤖 P2 AI Recommendations Foundation

**Ranker Hook System:**
- Clean interface: `Ranker = (stories, context) => rankedStories` ✅
- P1: Identity function (preserves existing order) ✅
- P2: UCB1 bandit algorithm ready for activation ✅
- Feature flags for gradual rollout ✅

**UCB1 Algorithm Implementation:**
- Multi-Armed Bandit with exploration/exploitation balance ✅
- Business constraints: commission rates, freshness, repetition ✅
- Creator tier weighting (gold > blue > grey > unverified) ✅
- Sponsored content boost and manual priority support ✅
- Debug mode for algorithm tuning ✅

**Context & Feedback Loop:**
- User session tracking and preferences ✅
- Previous story history for repetition penalty ✅
- Engagement feedback (impression, CTA, purchase, share) ✅
- Business constraint configuration ✅

## 📱 Device Testing Checklist

### P1 Core Performance (5-7 minutes)
- [ ] **Enable HUD**: `EXPO_PUBLIC_SHOW_PERF_HUD=1` in `.env`
- [ ] **FPS Test**: Swipe 10 stories fast → HUD shows 55-60fps, no jank
- [ ] **Memory Test**: Cache ≤75MB, evicts when exceeded, no growth
- [ ] **Prefetch Test**: Next 2-3 stories load instantly (no spinner)
- [ ] **Pagination Test**: OnEndReached triggers once per window

### P1b Video Enhancement (3-5 minutes)  
- [ ] **Video Playback**: Videos auto-play when visible, auto-pause when not
- [ ] **Video Prefetch**: Swipe to video stories shows instant playback
- [ ] **Performance**: No additional frame drops with video stories
- [ ] **Audio**: Video audio works (unmuted by default)

### Offline Resilience (5 minutes)
- [ ] **Queue Test**: Airplane mode → CTA/purchase → online → flush
- [ ] **Backend Response**: Server shows 200 (success) or 409 (replay)
- [ ] **App Resilience**: Kill during flush → relaunch → queue resumes
- [ ] **No Duplicates**: Multiple offline events don't create duplicates

### P0 Regression Guard (3 minutes)
- [ ] **HMAC Test**: P0 curl suite returns 400→401→422→200→409
- [ ] **Currency Test**: JPY 0dp, EUR/GBP 2dp, commission 28.68 USD
- [ ] **CORS Test**: Allow-headers include all auth headers
- [ ] **Deep Links**: `aislemarts://story/s-demo` routes correctly

## 🎛️ Feature Flag Configuration

```bash
# P1 Performance
EXPO_PUBLIC_SHOW_PERF_HUD=1

# P1b Video Features  
EXPO_PUBLIC_LOOKAHEAD=3
EXPO_PUBLIC_VIDEO_PREFETCH=1

# P2 AI Recommendations (disabled for P1)
EXPO_PUBLIC_RANKER_ENABLED=0
EXPO_PUBLIC_RANKER_ALGORITHM=identity  # Options: identity, ucb1, server
EXPO_PUBLIC_RANKER_DEBUG=0
```

## 🔄 P2 Activation Path (Future)

**When ready for AI recommendations:**
1. Set `EXPO_PUBLIC_RANKER_ENABLED=1` 
2. Choose algorithm: `ucb1` for client-side or `server` for backend ranking
3. Backend provides story engagement stats and business metadata
4. Enable debug mode to tune UCB1 parameters
5. A/B test against identity ranker for CTR lift validation

**UCB1 Score Formula:**
```
score = UCB(click_rate, views) + λ*commission_rate + β*freshness - γ*repetition + business_boost
```

## 🚨 Edge Cases & Solutions

**Performance Issues:**
- Frame drops with videos → Reduce lookahead to 2 for video-heavy feeds
- Memory growth → Verify LRU eviction working, check for circular references
- Cache misses → Increase prefetch lookahead or improve prediction

**Video Playback Issues:**
- Auto-pause not working → Check visibility tracking in `onViewableItemsChanged`
- Audio conflicts → Add audio session management for multiple videos
- Codec issues → Test with different video formats (MP4 H.264 recommended)

**Network Resilience Issues:**
- Queue not flushing → Verify NetInfo integration and connectivity detection
- Duplicate events → Ensure idempotency keys are consistent across retries
- HMAC failures → Check timestamp synchronization and secret consistency

## ✅ Success Metrics

**P1 Performance:**
- p95 swipe frame time ≤18ms (55+ fps)
- Cache usage ≤75MB with stable eviction
- Offline queue 100% eventual delivery (200/409)

**P1b Video:**
- Video stories play instantly after prefetch
- Auto-pause prevents background video drain
- No performance regression vs image-only feeds

**P2 Readiness:**
- Ranker interface cleanly swappable
- UCB1 algorithm mathematically validated  
- Feature flags enable gradual rollout

---

**Status: ✅ P1b + P2 Foundation Complete**  
**Next: Device testing → P2 AI recommendations activation**