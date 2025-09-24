#!/usr/bin/env bash
set -euo pipefail
: "${DOMAIN:?}"; : "${TEAMID:?}"; : "${IOS_BUNDLE:?}"; : "${PLAY_PACKAGE:?}"

TS=$(date +%Y%m%d_%H%M%S)
OUT="evidence_${TS}"
mkdir -p "$OUT"

echo "# External Config Verification" > "$OUT/report.md"

echo "## AASA headers" >> "$OUT/report.md"
curl -s -D "$OUT/aasa.headers" -o "$OUT/aasa.body" "https://${DOMAIN}/.well-known/apple-app-site-association" >/dev/null || true
printf '```\n%s\n```\n' "$(cat "$OUT/aasa.headers")" >> "$OUT/report.md"
printf '```\n%s\n```\n' "$(head -c 1200 "$OUT/aasa.body")" >> "$OUT/report.md"

echo "## AssetLinks headers" >> "$OUT/report.md"
curl -s -D "$OUT/assetlinks.headers" -o "$OUT/assetlinks.body" "https://${DOMAIN}/.well-known/assetlinks.json" >/dev/null || true
printf '```\n%s\n```\n' "$(cat "$OUT/assetlinks.headers")" >> "$OUT/report.md"
printf '```\n%s\n```\n' "$(head -c 1200 "$OUT/assetlinks.body")" >> "$OUT/report.md"

echo "## Quick JSON checks" >> "$OUT/report.md"
{ jq -r '.applinks.details[0].appID' "$OUT/aasa.body" 2>/dev/null || echo ""; } > "$OUT/aasa.appid"
{ jq -r '.[0].target.package_name' "$OUT/assetlinks.body" 2>/dev/null || echo ""; } > "$OUT/assetlinks.pkg"
{ jq -r '.[0].target.sha256_cert_fingerprints[0]' "$OUT/assetlinks.body" 2>/dev/null || echo ""; } > "$OUT/assetlinks.sha"
printf 'AASA appID: %s\n' "$(cat "$OUT/aasa.appid")" >> "$OUT/report.md"
printf 'AssetLinks pkg: %s\n' "$(cat "$OUT/assetlinks.pkg")" >> "$OUT/report.md"
printf 'AssetLinks sha: %s\n' "$(cat "$OUT/assetlinks.sha")" >> "$OUT/report.md"

echo "## Local files presence" >> "$OUT/report.md"
for f in android/app/google-services.json android/app/agconnect-services.json; do
  if [ -s "$f" ]; then echo "✅ $f present" >> "$OUT/report.md"; cp "$f" "$OUT/$(basename "$f")"; else echo "❌ $f missing" >> "$OUT/report.md"; fi
done

echo "Done. Evidence folder: $OUT"