#!/usr/bin/env bash
set -euo pipefail
miss=0
check(){ [ -s "$1" ] || { echo "✗ Missing: $1"; miss=$((miss+1)); }; }

# Apple
check store/apple/en-US/title.txt
check store/apple/en-US/subtitle.txt
check store/apple/en-US/description.txt

# Play
check store/google/listing/title.txt
check store/google/listing/short_description.txt
check store/google/listing/full_description.txt

# Huawei
check store/huawei/listing/description.txt

if [ "$miss" -gt 0 ]; then 
  echo "❌ Store asset lint failed ($miss missing)"
  exit 1
fi

echo "✅ Store assets present"