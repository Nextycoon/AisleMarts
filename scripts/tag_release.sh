#!/usr/bin/env bash
set -euo pipefail

ver="${1:-}"
[ -n "$ver" ] || { echo "Usage: $0 1.0.0"; exit 1; }

git diff --quiet || { echo "Uncommitted changes present"; exit 1; }

git tag -a "v$ver" -m "AisleMarts $ver"
git push --follow-tags

echo "Tagged v$ver"