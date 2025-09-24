#!/usr/bin/env bash
set -euo pipefail

# --- fill these in (or pass as env) ---
DOMAIN="${DOMAIN:-yourdomain.com}"                 # for AASA/AssetLinks
TEAMID="${TEAMID:-YOURTEAMID}"                     # Apple team ID (App Store Connect)
IOS_BUNDLE="${IOS_BUNDLE:-com.aislemarts.beta}"    # iOS bundle id used in AASA
PLAY_PACKAGE="${PLAY_PACKAGE:-com.aislemarts.beta}"# Android package id used in AssetLinks
PLAY_SHA256="${PLAY_SHA256:-AA:BB:CC:...:ZZ}"      # Play App Signing SHA-256 (fingerprint)

fail(){ echo "❌ $*"; exit 1; }
pass(){ echo "✅ $*"; }

# --- 1) google-services.json ---
FILE_GMS="android/app/google-services.json"
[ -f "$FILE_GMS" ] || fail "$FILE_GMS missing"
PKG=$(jq -r '.client[0].client_info.android_client_info.package_name' "$FILE_GMS" 2>/dev/null || echo "")
[ -n "$PKG" ] || fail "google-services.json missing package_name"
[ "$PKG" = "$PLAY_PACKAGE" ] || fail "google-services.json package ($PKG) != PLAY_PACKAGE ($PLAY_PACKAGE)"
pass "google-services.json present and package matches ($PKG)"

# --- 2) agconnect-services.json ---
FILE_HMS="android/app/agconnect-services.json"
[ -f "$FILE_HMS" ] || fail "$FILE_HMS missing"
APP_ID=$(jq -r '.app_id // .client.app_id // empty' "$FILE_HMS" 2>/dev/null || echo "")
[ -n "$APP_ID" ] || fail "agconnect-services.json missing app_id"
pass "agconnect-services.json present (app_id: $APP_ID)"

# --- 3) AASA / AssetLinks over HTTPS (no redirects, correct types) ---
AASA_URL="https://${DOMAIN}/.well-known/apple-app-site-association"
ALNK_URL="https://${DOMAIN}/.well-known/assetlinks.json"

echo "→ Checking AASA headers: $AASA_URL"
AASA_HDRS=$(curl -sS -I "$AASA_URL")
echo "$AASA_HDRS" | grep -qiE "^HTTP/.* 200" || fail "AASA not 200 OK"
echo "$AASA_HDRS" | grep -qiE "content-type: (application/json|application/pkcs7-mime)" || fail "AASA wrong content-type"
AASA_APPID=$(curl -sS "$AASA_URL" | jq -r '.applinks.details[0].appID // empty')
[ "$AASA_APPID" = "${TEAMID}.${IOS_BUNDLE}" ] || fail "AASA appID mismatch (got: $AASA_APPID, want: ${TEAMID}.${IOS_BUNDLE})"
pass "AASA OK (appID ${AASA_APPID})"

echo "→ Checking AssetLinks headers: $ALNK_URL"
ALNK_HDRS=$(curl -sS -I "$ALNK_URL")
echo "$ALNK_HDRS" | grep -qiE "^HTTP/.* 200" || fail "AssetLinks not 200 OK"
echo "$ALNK_HDRS" | grep -qi "content-type: application/json" || fail "AssetLinks wrong content-type"
ALNK_PKG=$(curl -sS "$ALNK_URL" | jq -r '.[0].target.package_name // empty')
ALNK_FP=$(curl -sS "$ALNK_URL" | jq -r '.[0].target.sha256_cert_fingerprints[0] // empty')
[ "$ALNK_PKG" = "$PLAY_PACKAGE" ] || fail "AssetLinks package mismatch (got: $ALNK_PKG, want: $PLAY_PACKAGE)"
[ "$ALNK_FP" = "$PLAY_SHA256" ] || fail "AssetLinks SHA-256 mismatch (got: $ALNK_FP, want: $PLAY_SHA256)"
pass "AssetLinks OK (pkg ${ALNK_PKG}, sha ${ALNK_FP})"

echo "🎉 All external config checks passed."