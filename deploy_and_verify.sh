#!/usr/bin/env bash
set -euo pipefail

# ---------- CONFIG (export or pass inline) ----------
: "${DOMAIN:?Set DOMAIN, e.g. export DOMAIN='yourdomain.com'}"
: "${TEAMID:?Set TEAMID, e.g. export TEAMID='ABCDE12345'}"
: "${IOS_BUNDLE:?Set IOS_BUNDLE, e.g. export IOS_BUNDLE='com.aislemarts.beta'}"
: "${PLAY_PACKAGE:?Set PLAY_PACKAGE, e.g. export PLAY_PACKAGE='com.aislemarts.beta'}"
: "${PLAY_SHA256:?Set PLAY_SHA256 (Play App Signing SHA-256)}"

# Build toggles (0=skip, 1=run)
DO_BUILD_IOS="${DO_BUILD_IOS:-1}"
DO_BUILD_GMS="${DO_BUILD_GMS:-1}"
DO_BUILD_HMS="${DO_BUILD_HMS:-1}"

# ---------- 0) Preflight ----------
command -v jq >/dev/null || { echo "Please install jq"; exit 1; }
[ -x ./generate_universal_links.sh ] || { echo "generate_universal_links.sh not found/executable"; exit 1; }
[ -x ./external_config_verifier.sh ] || { echo "external_config_verifier.sh not found/executable"; exit 1; }

echo "==> Using:"
echo "DOMAIN=$DOMAIN"
echo "TEAMID=$TEAMID"
echo "IOS_BUNDLE=$IOS_BUNDLE"
echo "PLAY_PACKAGE=$PLAY_PACKAGE"
echo "PLAY_SHA256=$PLAY_SHA256"
echo

# ---------- 1) Generate Universal Links files ----------
./generate_universal_links.sh
echo "✓ Generated .well-known/ files — ensure they are hosted at https://$DOMAIN/.well-known/"
echo

# ---------- 2) Verify external configs ----------
DOMAIN="$DOMAIN" TEAMID="$TEAMID" IOS_BUNDLE="$IOS_BUNDLE" \
PLAY_PACKAGE="$PLAY_PACKAGE" PLAY_SHA256="$PLAY_SHA256" \
./external_config_verifier.sh
echo "✓ External config verification passed"
echo

# ---------- 3) Build & Submit ----------
if [ "$DO_BUILD_IOS" = "1" ]; then
  echo "→ iOS: TestFlight build + submit"
  eas build -p ios --profile ios-prod
  eas submit -p ios --latest
  echo "✓ iOS submitted to TestFlight"
else
  echo "⏭ Skipping iOS build (DO_BUILD_IOS=0)"
fi
echo

if [ "$DO_BUILD_GMS" = "1" ]; then
  echo "→ Android (GMS): Play Internal build + submit"
  eas build -p android --profile android-gms-prod
  eas submit -p android --latest --track internal
  echo "✓ Android (GMS) submitted to Play Internal"
else
  echo "⏭ Skipping Android GMS build (DO_BUILD_GMS=0)"
fi
echo

if [ "$DO_BUILD_HMS" = "1" ]; then
  echo "→ Android (HMS): AppGallery build (manual upload next)"
  eas build -p android --profile android-hms-prod
  echo "✓ Android (HMS) AAB ready — upload in AppGallery Connect → Testing"
else
  echo "⏭ Skipping Android HMS build (DO_BUILD_HMS=0)"
fi
echo

# ---------- 4) Smoke test prompts ----------
cat <<'SMOKE'

==== Smoke Test (run on devices/emulators) ====

# iOS deep link (sim)
xcrun simctl openurl booted 'aislemarts://story/s-demo'

# Android deep link (emu/device)
adb shell 'am start -a android.intent.action.VIEW -d "aislemarts://story/s-demo"'

# Expect: app opens & scrolls to target story, no crash.
# Push: iOS permission prompt once; Android/Huawei tokens on real devices.

SMOKE

echo "All done. 🎉"