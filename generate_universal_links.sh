#!/usr/bin/env bash
set -euo pipefail
: "${DOMAIN:?}"; : "${TEAMID:?}"; : "${IOS_BUNDLE:?}"; : "${PLAY_PACKAGE:?}"; : "${PLAY_SHA256:?}"

mkdir -p .well-known

cat > .well-known/apple-app-site-association <<EOF
{ "applinks": { "apps": [], "details": [ { "appID": "${TEAMID}.${IOS_BUNDLE}", "paths": [ "/app/*", "/story/*", "/product/*" ] } ] } }
EOF

cat > .well-known/assetlinks.json <<EOF
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "${PLAY_PACKAGE}",
      "sha256_cert_fingerprints": ["${PLAY_SHA256}"]
    }
  }
]
EOF

echo "Generated .well-known/ files. Host them at https://${DOMAIN}/.well-known/"