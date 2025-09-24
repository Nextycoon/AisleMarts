# Release Checklist — AisleMarts (App Store • Play • AppGallery)

## Preflight
- [ ] Bump version + build numbers
- [ ] Production API base + disable debug logs
- [ ] Privacy policy URL in Settings screen
- [ ] Store assets ready (icons, screenshots, feature graphics)

## iOS App Store
- [ ] Info.plist includes required keys (ATT if applicable)
- [ ] Push/Deep links tested on TestFlight
- [ ] App Privacy form completed
- [ ] Encryption/export question answered
- [ ] Submit for Review

## Google Play (GMS)
- [ ] Data safety form complete
- [ ] Target API meets latest requirement
- [ ] Play App Signing enabled
- [ ] Internal → Closed → Production rollout

## Huawei AppGallery (HMS)
- [ ] AppGallery listing complete (privacy statements for HMS kits)
- [ ] HMS build uploaded (hms flavor)
- [ ] Regional distribution configured
- [ ] Release after review

## Tech gates
- [ ] Funnel integrity (impressions ≥ ctas ≥ purchases)
- [ ] 4xx on invalid + 409 on idem conflicts
- [ ] Multi-currency rounding correct (USD/EUR/GBP 2dp, JPY 0dp)
- [ ] Push OK: iOS/APNS, Android/FCM, Huawei/HMS
