# AisleMarts — Triple Store Launch Kit
Generated: 2025-09-24 19:22

Everything you need to ship to **Apple App Store**, **Google Play**, and **Huawei AppGallery** from one codebase.

## Quickstart
```bash
# 1) Unzip at your app root
unzip aislemarts_triple_store_launch_kit.zip -d .

# 2) Run the setup (creates patches, scripts, templates)
bash scripts/setup_triple_store.sh

# 3) Apply Gradle & EAS patches per README prints
# 4) Build
eas build -p ios --profile ios-prod
eas build -p android --profile android-gms-prod
eas build -p android --profile android-hms-prod
```
See `release-checklist.md` for final gate checks.
