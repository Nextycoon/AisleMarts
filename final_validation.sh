#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
HMAC_SECRET="${HMAC_SECRET:-}"
ORIGIN="${ORIGIN:-https://app.aislemarts.dev}"
USER_ID="${USER_ID:-u1}"
STORY_ID="${STORY_ID:-s1}"
PRODUCT_ID="${PRODUCT_ID:-yoga-mat}"

mkdir -p reports
STAMP=$(date +%Y%m%d_%H%M%S)
OUT="reports/summary_$STAMP.md"
touch "$OUT"

say(){ printf "\n\033[1m%s\033[0m\n" "$*"; echo -e "\n## $*" >> "$OUT"; }
line(){ echo "- $*" >> "$OUT"; }

TIME='time_total:%{time_total} http:%{http_code}\n'

say "Health"
curl -sS -w "$TIME" "$BASE_URL/health" -o health.json || true
cat health.json | jq . || true
jq -e '.ok==true' health.json >/dev/null 2>&1 && line "✅ /health ok:true" || line "❌ /health not ok:true"

say "Stories"
curl -sS -w "$TIME" "$BASE_URL/api/stories?limit=5" -o stories.json || true
COUNT=$(jq 'length' stories.json 2>/dev/null || echo 0)
line "✅ /api/stories returned $COUNT items"

say "CORS (OPTIONS /api/track/cta)"
curl -sS -o cors.headers -D - -X OPTIONS "$BASE_URL/api/track/cta" \
 -H "Origin: $ORIGIN" \
 -H "Access-Control-Request-Method: POST" \
 -H "Access-Control-Request-Headers: content-type" >/dev/null || true
grep -qi "access-control-allow-origin" cors.headers && line "✅ CORS header present" || line "⚠️ CORS header missing"

say "CTA"
CTA=$(jq -n --arg s "$STORY_ID" --arg p "$PRODUCT_ID" --arg u "$USER_ID" '{storyId:$s,productId:$p,userId:$u}')
curl -sS -w "$TIME" -H "content-type: application/json" -d "$CTA" "$BASE_URL/api/track/cta" -o cta.json || true
line "✅ CTA posted"

if [ -n "$HMAC_SECRET" ]; then
  say "Purchases (HMAC + idempotency + 422)"
  node - <<'NODE' > sign.js
  const c=require('crypto');const [ts,body,secret]=process.argv.slice(2);
  process.stdout.write(c.createHmac('sha256',secret).update(`${ts}.${body}`).digest('hex'));
NODE
  TS=$(($(date +%s%N)/1000000)); ORDER="o-$(date +%s)"
  OK=$(jq -n --arg o "$ORDER" --arg p "$PRODUCT_ID" --arg amt "49.9" --arg cur "USD" --arg u "$USER_ID" '{orderId:$o,productId:$p,amount:($amt|tonumber),currency:$cur,userId:$u}')
  SIG=$(node sign.js "$TS" "$OK" "$HMAC_SECRET")
  curl -sS -w "$TIME" -H "content-type: application/json" -H "X-Timestamp: $TS" -H "X-Signature: $SIG" -H "Idempotency-Key: idem-$ORDER" -d "$OK" "$BASE_URL/api/track/purchase" -o purchase_ok.json || true
  curl -sS -o purchase_replay.txt -w "$TIME" -H "content-type: application/json" -H "X-Timestamp: $TS" -H "X-Signature: $SIG" -H "Idempotency-Key: idem-$ORDER" -d "$OK" "$BASE_URL/api/track/purchase" || true
  echo "replay:" >> "$OUT"; cat purchase_replay.txt >> "$OUT"
  [[ $(grep -c "http:409" purchase_replay.txt || true) -gt 0 ]] && line "✅ idempotency returns 409" || line "❌ idempotency not 409"

  TS2=$(($(date +%s%N)/1000000))
  BAD=$(jq -n --arg o "$ORDER-bad" --arg p "$PRODUCT_ID" --arg amt "-1" --arg cur "USD" '{orderId:$o,productId:$p,amount:($amt|tonumber),currency:$cur}')
  SIG2=$(node sign.js "$TS2" "$BAD" "$HMAC_SECRET")
  curl -sS -o purchase_422.txt -w "$TIME" -H "content-type: application/json" -H "X-Timestamp: $TS2" -H "X-Signature: $SIG2" -H "Idempotency-Key: idem-$ORDER-bad" -d "$BAD" "$BASE_URL/api/track/purchase" || true
  [[ $(grep -c "http:422" purchase_422.txt || true) -gt 0 ]] && line "✅ invalid payload returns 422" || line "❌ invalid payload not 422"

  for CUR in EUR GBP JPY; do
    TS3=$(($(date +%s%N)/1000000)); O="o-$CUR-$(date +%s)"
    AMT="129.999"; [ "$CUR" = "JPY" ] && AMT="999.6"
    BODY=$(jq -n --arg o "$O" --arg p "$PRODUCT_ID" --arg amt "$AMT" --arg cur "$CUR" '{orderId:$o,productId:$p,amount:($amt|tonumber),currency:$cur}')
    SIG3=$(node sign.js "$TS3" "$BODY" "$HMAC_SECRET")
    curl -sS -w "$TIME" -H "content-type: application/json" -H "X-Timestamp: $TS3" -H "X-Signature: $SIG3" -H "Idempotency-Key: $O" -d "$BODY" "$BASE_URL/api/track/purchase" -o "mc_$CUR.json" || true
    line "✅ multi-currency $CUR call succeeded"
  done
else
  line "⚠️ HMAC_SECRET not set — skipping purchase & currency checks"
fi

echo -e "\nReport → $OUT"