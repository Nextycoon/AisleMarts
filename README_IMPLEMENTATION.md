# AisleMarts — Expo Phase 2 Implementation (Infinity Stories)
Generated: 2025-09-24 13:54

This pack contains **drop-in code** for Expo React Native to implement:
- Virtualized rings (windowed, recycled)
- Story viewer with tap/hold/swipe
- Preload coordinator (next frame + next creator @ 70%)
- Cursor pagination hook
- LRU media cache (~75MB cap)
- Smart base URL (Railway/local)
- Creator badges (gold/blue/grey/unverified)
- Test IDs matching the Detox suite

## Install
```bash
pnpm add expo-av expo-asset
pnpm add react-native-gesture-handler react-native-reanimated
pnpm add @shopify/flash-list
# If using npm/yarn, adjust commands accordingly.
```

Ensure Reanimated is configured (Expo SDK already supports it). If bare workflow, add the Babel plugin.

## Integrate
- Copy the `src/` folder into your app.
- Use `<InfinityStoriesScreen />` anywhere in your navigation.
- Ensure your API exposes `/api/stories?cursor=...&limit=...` and `/health`.

## Test IDs
- story-tray, creator-ring-<index>, story-viewer, story-tap-right,
  story-surface, playback-state-paused, creator-handle, preload-ready,
  progress

## Acceptance
- 0 dropped frames on creator switch
- Heap steady after 50 creator switches
- Time-to-first-story ≤ 350ms after ring tap
