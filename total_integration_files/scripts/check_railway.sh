#!/usr/bin/env bash
set -e
URL="$1"
if [ -z "$URL" ]; then
  echo "Usage: $0 https://<your>.up.railway.app"
  exit 1
fi
echo "== Health =="
curl -i "$URL/health" || true
echo
echo "== CORS check (Origin: http://localhost:19006) =="
curl -s -D - -o /dev/null -H "Origin: http://localhost:19006" "$URL/health" | egrep -i "access-control-allow|HTTP/"
