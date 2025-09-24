#!/usr/bin/env bash
set -euo pipefail

echo "== AisleMarts • GO LIVE PLUS (Deep Links + Preload Coordinator + Router) =="

[ -f package.json ] || { echo "Run from your app root (package.json missing)."; exit 1; }

# Create dirs
mkdir -p src/navigation src/infinity e2e patches .well-known

# -----------------------------
# 1) Preload Coordinator (zero jank)
# -----------------------------
cat > src/infinity/preloadCoordinator.ts <<'TS'
import { Image } from 'react-native';

type Story = {
  id: string;
  type: 'image' | 'video' | 'mixed';
  mediaUrl: string;
  thumbUrl?: string;
};

const inflight = new Set<string>();
const done = new Set<string>();

async function prefetchImage(url: string) {
  if (!url || done.has(url) || inflight.has(url)) return;
  inflight.add(url);
  try { await Image.prefetch(url); } finally {
    inflight.delete(url);
    done.add(url);
  }
}

// Lazy import for video so no hard dep if you don't use it
async function prefetchVideo(url: string) {
  try {
    const { Video } = await import('expo-av');
    // @ts-ignore - loadAsync returns promise; we immediately unload to warm cache
    const video = new Video({});
    await video.loadAsync({ uri: url }, { shouldPlay: false }, false);
    await video.unloadAsync();
  } catch { /* ignore */ }
}

export async function preloadStories(stories: Story[], currentIndex: number, window = 3) {
  const targets = stories.slice(currentIndex + 1, currentIndex + 1 + window);
  for (const s of targets) {
    if (s.thumbUrl) prefetchImage(s.thumbUrl);
    if (s.type === 'image' || s.type === 'mixed') prefetchImage(s.mediaUrl);
    if (s.type === 'video' || s.type === 'mixed') prefetchVideo(s.mediaUrl);
  }
}

// Helper to use with FlatList onViewableItemsChanged
export function makeViewabilityPreloader(getStories: ()=>Story[], window = 3) {
  return ({ viewableItems }: { viewableItems: Array<{index?: number}> }) => {
    const idx = viewableItems?.[0]?.index ?? 0;
    const stories = getStories();
    preloadStories(stories, idx, window);
  };
}
TS

# -----------------------------
# 2) Deep Link parser & handler
# -----------------------------
cat > src/navigation/deeplinks.ts <<'TS'
import * as Linking from 'expo-linking';

export type DeepLink =
  | { type: 'story'; id: string }
  | { type: 'product'; id: string }
  | { type: 'unknown' };

export function parseDeepLink(url: string): DeepLink {
  try {
    const { hostname, path, queryParams } = Linking.parse(url);
    // Support both app scheme and web
    // aislemarts://story/s-123  or  https://yourdomain.com/app/story/s-123
    const parts = (path || '').split('/').filter(Boolean); // e.g., ['story','s-123']
    if (parts[0] === 'story' && parts[1]) return { type: 'story', id: parts[1] };
    if (parts[0] === 'product' && parts[1]) return { type: 'product', id: parts[1] };
    // web paths under /app/*
    if (hostname && parts[0] === 'app' && parts[1] === 'story' && parts[2]) {
      return { type: 'story', id: parts[2] };
    }
    if (hostname && parts[0] === 'app' && parts[1] === 'product' && parts[2]) {
      return { type: 'product', id: parts[2] };
    }
  } catch {}
  return { type: 'unknown' };
}
TS

# -----------------------------
# 3) Wire into App (import + useEffect handlers)
# -----------------------------
APP=""
for f in App.tsx app/_layout.tsx; do [ -f "$f" ] && APP="$f" && break; done

if [ -n "$APP" ]; then
  cp "$APP" "$APP.bak2"
  
  # Add imports at top if missing
  if ! grep -q "parseDeepLink" "$APP"; then
    sed -i.tmp '1i\
import { Linking } from '\''react-native'\'';\
import { parseDeepLink } from '\''../src/navigation/deeplinks'\'';
' "$APP" && rm -f "$APP.tmp"
  fi

  # Insert deep link effect after component declaration
  if ! grep -q "deeplink handling" "$APP"; then
    awk 'BEGIN{inj=0}
      /export default function|function.*Layout|const.*Layout/ && inj==0 {
        print;
        print "";
        print "  // Deep link handling";
        print "  const initialHandledRef = useRef(false);";
        print "  useEffect(() => {";
        print "    (async () => {";
        print "      try {";
        print "        const initUrl = await Linking.getInitialURL();";
        print "        if (initUrl && !initialHandledRef.current) {";
        print "          initialHandledRef.current = true;";
        print "          const dl = parseDeepLink(initUrl);";
        print "          console.log('[deeplink:init]', initUrl, dl);";
        print "          // TODO: navigate to story/product route based on dl";
        print "        }";
        print "      } catch(e) { console.log('[deeplink:init:error]', e); }";
        print "    })();";
        print "    const sub = Linking.addEventListener('url', (e) => {";
        print "      try {";
        print "        const dl = parseDeepLink(e.url);";
        print "        console.log('[deeplink:event]', e.url, dl);";
        print "        // TODO: navigate accordingly";
        print "      } catch(err) { console.log('[deeplink:event:error]', err); }";
        print "    });";
        print "    return () => sub.remove && sub.remove();";
        print "  }, []);";
        inj=1; next
      } {print}' "$APP" > "$APP.tmp" && mv "$APP.tmp" "$APP"
    echo "✓ Deep link handler wired into $APP (backup: $APP.bak2)"
  fi
else
  echo "↺ Could not locate App.tsx/app/_layout.tsx; please import parseDeepLink and add Linking effects manually."
fi

# -----------------------------
# 7) Deep link Detox test
# -----------------------------
cat > e2e/deeplink.e2e.js <<'JS'
const { device, element, by } = require('detox');

describe('Deep link launch', () => {
  it('opens app with story deep link', async () => {
    const url = 'aislemarts://story/test-story';
    await device.launchApp({ newInstance: true, url });
    await expect(element(by.id('stories-tray'))).toExist();
  });
});
JS

# -----------------------------
# 8) AASA & AssetLinks templates
# -----------------------------
cat > .well-known/apple-app-site-association <<'JSON'
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.company.aislemarts",
        "paths": [ "/app/*" ]
      }
    ]
  }
}
JSON

cat > .well-known/assetlinks.json <<'JSON'
[
  {
    "relation": [ "delegate_permission/common.handle_all_urls" ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.company.aislemarts",
      "sha256_cert_fingerprints": [ "AA:BB:CC:DD:EE:FF:..." ]
    }
  }
]
JSON

echo "✔ GO LIVE PLUS complete."
echo ""
echo "Next steps:"
echo "1) Serve .well-known/apple-app-site-association (no extension, JSON, content-type: application/json) at https://yourdomain.com/.well-known/apple-app-site-association"
echo "   And serve .well-known/assetlinks.json at https://yourdomain.com/.well-known/assetlinks.json"
echo "2) If using managed Expo, add scheme/intentFilters/associatedDomains to app.json (snippet printed above)."
echo "3) Try deep links locally:"
echo "   iOS sim:   xcrun simctl openurl booted 'aislemarts://story/s-123'"
echo "   Android:   adb shell 'am start -a android.intent.action.VIEW -d \"aislemarts://story/s-123\"'"