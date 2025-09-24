# 🚀 AisleMarts Preview/UAT Build & Test Guide

## Current Status: READY FOR PREVIEW BUILDS
- Backend validation: 92.9%+ success rate ✅
- All hardening patches applied ✅  
- EAS build profiles configured ✅
- Frontend "Luxury Shopping Experience" loading ✅

---

## 1. PREVIEW BUILD COMMANDS (Run when ready)

### Prerequisites Checklist:
- [ ] `android/app/google-services.json` (from Firebase Console)
- [ ] `android/app/agconnect-services.json` (from Huawei AppGallery Connect)
- [ ] EAS CLI authenticated (`eas login`)
- [ ] App Store Connect/Play Console connected to EAS

### Build & Submit Commands:

```bash
# iOS TestFlight (internal testing)
cd /app/frontend
eas build -p ios --profile ios-prod
eas submit -p ios --latest --verbose

# Android Google Play Internal track  
eas build -p android --profile android-gms-prod
eas submit -p android --latest --track internal --verbose

# Android Huawei AppGallery Beta (manual upload)
eas build -p android --profile android-hms-prod
# Upload the generated AAB to AppGallery Connect → Testing → Internal/Beta
```

---

## 2. 45-MINUTE UAT TESTING SCRIPT

### A. Core Stories Flow
1. Launch app → confirm "Luxury Shopping Experience" loads
2. Verify stories tray renders (should show ≥1 story)
3. Swipe up 10x quickly → check for jank/memory issues
4. Tap CTA ("Shop Now") → verify toast/deep link response

### B. Deep Link Testing

**iOS (Simulator/Device):**
```bash
xcrun simctl openurl booted 'aislemarts://story/s-123'
```

**Android (Emulator/Device):**
```bash
adb shell 'am start -a android.intent.action.VIEW -d "aislemarts://story/s-123"'
```
Expected: Tray scrolls to target story, no crashes

### C. Backend Validation
```bash
# Run from repo root with your production API
BASE_URL="https://your-api-domain" HMAC_SECRET="your-secret" ./final_validation.sh
```

Expected results:
- First purchase: 200
- Replay: 409  
- Invalid payload: 422
- CORS headers present
- EUR/GBP (2 decimal places), JPY (0 decimal places)

### D. Push Notification Smoke Test
- iOS: Permission prompt appears once, logs show `[push] provider=ios token=...`
- Android GMS/HMS: Token logs for correct provider

### E. Resilience Testing  
- Toggle airplane mode → graceful empty/loading state
- Force backend errors → friendly error UI (not blank screen)

---

## 3. GO/NO-GO CRITERIA

✅ **CURRENT STATUS:**
- CI readiness score ≥95% (GitHub Actions gate active)
- Backend health endpoints: 100% operational
- Stories system: Working
- Multi-currency: Verified (EUR/GBP/JPY)
- HMAC security: Active
- Frontend: Loading properly

🔍 **TO VERIFY IN UAT:**
- [ ] 0 Sev-1 issues, ≤2 Sev-2
- [ ] CTR/attribution: impressions ≥ CTAs ≥ purchases  
- [ ] Performance: first paint <1.5s, smooth swiping
- [ ] Deep links work on all platforms
- [ ] Push notifications don't crash

---

## 4. ISSUE REPORTING TEMPLATE

```
Title: [Area] Short description
Platforms: iOS / Android GMS / Android HMS  
Build: (TestFlight/Play/AppGallery version + timestamp)
Steps:
1) Launch app
2) Navigate to stories
3) ...
Expected: Tray should scroll smoothly
Actual: Visible lag/jank during swipe
Logs/Screens: (attach)
Backend ref: (endpoint + timestamp if applicable)
Severity: S1/S2/S3
```

---

## 5. DEPLOYMENT TIMELINE

**Phase 1: Preview Builds (Now Ready)**
- TestFlight internal testing
- Google Play Internal track
- Huawei AppGallery Beta

**Phase 2: Public Beta** 
- TestFlight external testing
- Google Play Open Testing
- Huawei AppGallery Open Beta

**Phase 3: Production**
- App Store release
- Google Play production
- Huawei AppGallery release

---

## Current Validation Report Location:
`/app/reports/summary_20250924_210426.md`

**Next Steps:** Run the preview builds and share any issues using the template above for immediate fixes.