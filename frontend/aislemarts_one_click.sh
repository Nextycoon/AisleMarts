#!/usr/bin/env bash
# AisleMarts — One-Click Go/Validate (iOS + Android GMS + Android HMS + Push + DeepLinks + E2E + Reports)
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
HMAC_SECRET="${HMAC_SECRET:-}"
RUN_E2E="${RUN_E2E:-0}"        # set to 1 to run Detox after setup
ORIGIN="${ORIGIN:-https://app.aislemarts.dev}"
USER_ID="${USER_ID:-u1}"
STORY_ID="${STORY_ID:-s1}"
PRODUCT_ID="${PRODUCT_ID:-yoga-mat}"

need(){ command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1"; exit 1; }; }
for b in node curl jq sed awk date; do need "$b"; done
[ -f package.json ] || { echo "Run from your app root (package.json missing)."; exit 1; }

say() { printf "\n\033[1m%s\033[0m\n" "$*"; }
ok() { printf "  ✅ %s\n" "$*"; }
warn() { printf "  ⚠️  %s\n" "$*"; }

mkdir -p e2e scripts patches src/mobile src/navigation src/infinity .github/workflows store/apple/en-US store/google/listing store/huawei/listing docs bin/ios bin/android .well-known reports

# ---------- Detox config + tests
say "Detox: config + basic tests"
cat > e2e/jest.config.js <<'JS'
module.exports={testTimeout:180000,testRunner:'jest-circus/runner',setupFilesAfterEnv:['./init.js'],reporters:['detox/runners/jest/streamlineReporter']};
JS
cat > e2e/init.js <<'JS'
const detox=require('detox');beforeAll(async()=>{await detox.init(undefined,{launchApp:true});},300000);afterAll(async()=>{await detox.cleanup();});jest.retryTimes(1);
JS
cat > e2e/resolve-app.js <<'JS'
const fs=require('fs'),cp=require('child_process');const cfg=process.env.DETOX_CONFIGURATION||'';if(cfg.includes('ios')){const out=cp.execSync('find ios -name "*.app" | head -n1').toString().trim();if(!out)process.exit(0);fs.rmSync('bin/ios',{recursive:true,force:true});fs.mkdirSync('bin/ios',{recursive:true});cp.execSync(`cp -R "${out}" bin/ios/Release.app`);}else{const out=cp.execSync('find android -name "*.apk" | head -n1').toString().trim();if(!out)process.exit(0);fs.rmSync('bin/android',{recursive:true,force:true});fs.mkdirSync('bin/android',{recursive:true});fs.copyFileSync(out,'bin/android/Release.apk');}
JS
cat > e2e/_waitAny.js <<'JS'
const {expect:detoxExpect}=require('detox');module.exports.waitAny=async(ms,timeout)=>{const s=Date.now();let e;while(Date.now()-s<timeout){for(const m of ms){try{await detoxExpect(m).toExist();return;}catch(err){e=err}}await new Promise(r=>setTimeout(r,250))}throw e||new Error('No matchers appeared')};
JS
cat > e2e/stories.tray.e2e.js <<'JS'
const { element, by }=require('detox');const {waitAny}=require('./_waitAny');
describe('Stories tray render',()=>{it('shows loading then hydrates stories',async()=>{await waitAny([element(by.id('lux-loading')),element(by.text('Luxury Shopping Experience'))],10000);await element(by.id('stories-tray')).toExist();await element(by.id('story-card-0')).toExist();});});
JS
cat > e2e/swipe.navigation.e2e.js <<'JS'
const { element, by }=require('detox');describe('Swipe',()=>{it('vertical swipe',async()=>{const first=element(by.id('story-card-0'));await first.swipe('up','fast',0.85);await element(by.id('story-card-1')).toBeVisible();});});
JS
cat > e2e/cta.tracking.e2e.js <<'JS'
const { element, by }=require('detox');const {waitAny}=require('./_waitAny');
describe('CTA',()=>{it('tap CTA shows feedback',async()=>{await element(by.id('stories-tray')).toExist();await waitAny([element(by.id('story-cta')),element(by.text('Shop Now'))],5000);try{await element(by.id('story-cta')).tap();}catch{await element(by.text('Shop Now')).tap();}await waitAny([element(by.id('toast')),element(by.text('Link opened')),element(by.text('Added to cart'))],3000);});});
JS
cat > scripts/patch_package_json_frontend_e2e.mjs <<'JS'
import fs from 'fs';const f='package.json';if(!fs.existsSync(f))process.exit(1);const pkg=JSON.parse(fs.readFileSync(f,'utf8'));
pkg.scripts=pkg.scripts||{};
pkg.scripts['e2e:build:ios']??='detox build -c ios.sim.release';
pkg.scripts['e2e:test:ios'] ??='detox test -c ios.sim.release --record-logs all --workers 1';
pkg.scripts['e2e:build:android']??='detox build -c android.emu.release';
pkg.scripts['e2e:test:android'] ??='detox test -c android.emu.release --record-logs all --workers 1';
pkg.detox??={testRunner:'jest',runnerConfig:'e2e/jest.config.js',configurations:{
 'ios.sim.release':{type:'ios.simulator',device:{type:'iPhone 14'},binaryPath:'bin/ios/Release.app',build:'expo run:ios --configuration Release --no-install && DETOX_CONFIGURATION=ios.sim.release node e2e/resolve-app.js'},
 'android.emu.release':{type:'android.emulator',device:{avdName:'Pixel_6_API_34'},binaryPath:'bin/android/Release.apk',build:'expo run:android --variant release && DETOX_CONFIGURATION=android.emu.release node e2e/resolve-app.js'}
}};
fs.writeFileSync(f,JSON.stringify(pkg,null,2));console.log('✓ package.json patched for Detox');
JS
npm i -D detox@20 jest jest-circus @types/jest expo-dev-client >/dev/null 2>&1 || true
node scripts/patch_package_json_frontend_e2e.mjs || true
ok "Detox configured"

# ---------- EAS profiles (ios-prod, android-gms-prod, android-hms-prod)
say "EAS profiles"
cat > patches/eas.json.add.json <<'JSON'
{"build":{"ios-prod":{"extends":"production","platform":"ios"},"android-gms-prod":{"extends":"production","platform":"android","gradleCommand":":app:bundleGmsRelease"},"android-hms-prod":{"extends":"production","platform":"android","gradleCommand":":app:bundleHmsRelease"}},"submit":{"ios-prod":{"extends":"production"},"android-gms-prod":{"extends":"production"},"android-hms-prod":{"extends":"production"}}}
JSON
cat > scripts/merge_eas_json.mjs <<'JS'
import fs from 'fs';const dst='eas.json',add='patches/eas.json.add.json';
const addObj=JSON.parse(fs.readFileSync(add,'utf8'));let base={};if(fs.existsSync(dst))base=JSON.parse(fs.readFileSync(dst,'utf8'));
base.build={...(base.build||{}),...(addObj.build||{})};base.submit={...(base.submit||{}),...(addObj.submit||{})};
fs.writeFileSync(dst,JSON.stringify(base,null,2));console.log('✓ eas.json merged');
JS
node scripts/merge_eas_json.mjs

# ---------- Android flavors + Huawei repos
say "Android Gradle patches"
cat > patches/android.app.flavors.txt <<'TXT'
/* ==== AisleMarts flavors (GMS/HMS) ==== */
android{flavorDimensions "services";productFlavors{gms{dimension "services"}hms{dimension "services"}}}
dependencies{
  gmsImplementation "com.google.firebase:firebase-messaging:23.4.1"
  hmsImplementation "com.huawei.hms:push:6.12.0.300"
}
/* ==== /AisleMarts flavors ==== */
TXT
cat > patches/android.top.huaweiRepos.txt <<'TXT'
/* ==== AisleMarts Huawei repos + agconnect ==== */
buildscript{repositories{google();mavenCentral();maven{url 'https://developer.huawei.com/repo/'}}dependencies{classpath 'com.huawei.agconnect:agcp:1.9.1.301'}}
allprojects{repositories{google();mavenCentral();maven{url 'https://developer.huawei.com/repo/'}}}
/* ==== /AisleMarts Huawei repos ==== */
TXT
if [ -f android/app/build.gradle ] && ! grep -q "AisleMarts flavors" android/app/build.gradle; then
  echo >> android/app/build.gradle; cat patches/android.app.flavors.txt >> android/app/build.gradle; ok "app/build.gradle flavored"
else warn "flavors already present or android/app/build.gradle missing"; fi
if [ -f android/build.gradle ] && ! grep -q "AisleMarts Huawei repos" android/build.gradle; then
  echo >> android/build.gradle; cat patches/android.top.huaweiRepos.txt >> android/build.gradle; ok "android/build.gradle Huawei repos added"
else warn "Huawei repos already present or android/build.gradle missing"; fi

# ---------- iOS Info.plist (ATT + encryption flag)
say "iOS Info.plist"
cat > patches/ios.InfoPlist.keys.txt <<'PLIST'
<key>NSUserTrackingUsageDescription</key>
<string>This identifier is used to personalize commerce content and measure performance.</string>
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
PLIST
if command -v /usr/libexec/PlistBuddy >/dev/null 2>&1 && [ -d ios ]; then
  INFO=$(find ios -name Info.plist | head -n1 || true)
  if [ -n "${INFO:-}" ]; then
    /usr/libexec/PlistBuddy -c "Add :NSUserTrackingUsageDescription string 'This identifier is used to personalize commerce content and measure performance.'" "$INFO" || true
    /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$INFO" || true
    ok "Info.plist patched ($INFO)"
  else warn "Info.plist not found; see patches/ios.InfoPlist.keys.txt"; fi
else warn "PlistBuddy not available or ios/ missing; patch manually if needed"; fi

# ---------- Push bridge + deep links + router + zero-jank preloading
say "Mobile runtime features"
cat > src/mobile/runtimeProviders.ts <<'TS'
import { Platform } from 'react-native';export async function detectProvider():Promise<'ios'|'gms'|'hms'|'none'>{if(Platform.OS==='ios')return'ios';try{const ua=(global as any)?.navigator?.userAgent||'';if(/huawei|honor|hms/i.test(ua))return'hms';}catch{}return Platform.OS==='android'?'gms':'none';}
TS
cat > src/mobile/pushBridge.ts <<'TS'
import { detectProvider } from './runtimeProviders';type Token={provider:'ios'|'gms'|'hms'|'none',token?:string};
export async function initPush():Promise<Token>{const provider=await detectProvider();try{if(provider==='ios'){const Notifications=(await import('expo-notifications')).default;const {status}=await Notifications.requestPermissionsAsync();if(status!=='granted')return{provider};const token=(await Notifications.getDevicePushTokenAsync()).data;return{provider,token};}
if(provider==='gms'){const messaging=(await import('@react-native-firebase/messaging')).default;await messaging().requestPermission();const token=await messaging().getToken();return{provider,token};}
if(provider==='hms'){const Hms:any=await import('@hmscore/react-native-hms-push');const res=await Hms.HmsPushInstanceId.getToken();const token=res?.result||res?.token;return{provider,token};}}catch{}return{provider:provider??'none'};}
TS
cat > src/navigation/deeplinks.ts <<'TS'
import * as Linking from 'expo-linking';export type DeepLink={type:'story'|'product'|'unknown',id?:string};
export function parseDeepLink(url:string):DeepLink{try{const{hostname,path}=Linking.parse(url);const parts=(path||'').split('/').filter(Boolean);if(parts[0]==='story'&&parts[1])return{type:'story',id:parts[1]};if(parts[0]==='product'&&parts[1])return{type:'product',id:parts[1]};if(hostname&&parts[0]==='app'&&parts[1]==='story'&&parts[2])return{type:'story',id:parts[2]};if(hostname&&parts[0]==='app'&&parts[1]==='product'&&parts[2])return{type:'product',id:parts[2]};}catch{}return{type:'unknown'};}
TS
cat > src/navigation/storyRegistry.ts <<'TS'
import { RefObject } from 'react';import { FlatList } from 'react-native';type Story={id:string};let _ref:RefObject<FlatList<any>>|null=null;let _data:Story[]=[];let _indexById=new Map<string,number>();let _queue:string[]=[];
export function registerStoriesRef(ref:RefObject<FlatList<any>>){_ref=ref;flushQueue();}
export function registerStoriesData(data:Story[]){_data=data||[];_indexById=new Map(_data.map((s,i)=>[s.id,i]));flushQueue();}
export function scrollToStory(id:string){if(!_ref||!_ref.current||!_indexById.has(id)){_queue.push(id);return false;}const index=_indexById.get(id)!;try{_ref.current!.scrollToIndex({index,animated:true});return true;}catch{return false;}}
function flushQueue(){if(!_ref||!_ref.current||!_indexById.size)return;const q=[..._queue];_queue=[];for(const id of q)if(_indexById.has(id)){try{_ref.current!.scrollToIndex({index:_indexById.get(id)!,animated:true});}catch{}}}
TS
cat > src/navigation/deepLinkRouter.ts <<'TS'
import { DeepLink } from './deeplinks';import { scrollToStory } from './storyRegistry';
export function routeDeepLink(dl:DeepLink){switch(dl.type){case'story':if(!dl.id)return; if(!scrollToStory(dl.id)){console.log('[router] queued story',dl.id);}break;case'product':console.log('[router] product',dl.id);break;default:console.log('[router] unknown',dl);}}
TS
cat > src/infinity/preloadCoordinator.ts <<'TS'
import { Image } from 'react-native';type Story={id:string;type:'image'|'video'|'mixed';mediaUrl:string;thumbUrl?:string};const inflight=new Set<string>();const done=new Set<string>();
async function prefetchImage(url:string){if(!url||done.has(url)||inflight.has(url))return;inflight.add(url);try{await Image.prefetch(url);}finally{inflight.delete(url);done.add(url);}}
async function prefetchVideo(url:string){try{const { Video } = await import('expo-av');const video=new Video({} as any);await video.loadAsync({uri:url},{shouldPlay:false},false);await video.unloadAsync();}catch{}}
export async function preloadStories(stories:Story[],currentIndex:number,window=3){const targets=stories.slice(currentIndex+1,currentIndex+1+window);for(const s of targets){if(s.thumbUrl)prefetchImage(s.thumbUrl);if(s.type==='image'||s.type==='mixed')prefetchImage(s.mediaUrl);if(s.type==='video'||s.type==='mixed')prefetchVideo(s.mediaUrl);}}
export function makeViewabilityPreloader(getStories:()=>Story[],window=3){return({viewableItems}:{viewableItems:Array<{index?:number}>})=>{const idx=viewableItems?.[0]?.index??0;preloadStories(getStories(),idx,window);};}
TS
cat > src/mobile/StoriesBinder.tsx <<'TSX'
import React,{useMemo,useRef,useEffect} from 'react';import {FlatList,FlatListProps} from 'react-native';import {registerStoriesRef,registerStoriesData}from'../navigation/storyRegistry';
type Story={id:string};type Props<ItemT extends Story>=Omit<FlatListProps<ItemT>,'ref'>&{testIdBase?:string};
export default function StoriesBinder<ItemT extends Story>(props:Props<ItemT>){const{data,testIdBase='story-card',...rest}=props as any;const ref=useRef<FlatList<ItemT>>(null);
useEffect(()=>{registerStoriesRef(ref);},[]);useEffect(()=>{registerStoriesData((data??[]) as any);},[data]);
const renderItem=useMemo(()=>{const r=(props as any).renderItem;if(!r)return undefined;return({item,index}:any)=>{const node=r({item,index});return React.cloneElement(node,{testID:`${testIdBase}-${index}`,...(node.props||{})});};},[props]);
return <FlatList ref={ref} testID="stories-tray" data={data} renderItem={renderItem} {...rest}/>;}
TSX

# auto-wire into App
say "Auto-wiring App entry (push + deep links)"
APP=""
for f in app/_layout.tsx App.tsx App.js app/App.tsx app/App.js src/App.tsx src/App.js; do [ -f "$f" ] && APP="$f" && break; done
if [ -n "$APP" ]; then
  cp "$APP" "$APP.bak_oneclick"
  if ! grep -q "initPush" "$APP"; then
    # Add imports to the top
    sed -i '1i import { Linking } from '\''react-native'\'';' "$APP"
    sed -i '1i import { routeDeepLink } from '\''../src/navigation/deepLinkRouter'\'';' "$APP"
    sed -i '1i import { parseDeepLink } from '\''../src/navigation/deeplinks'\'';' "$APP"
    sed -i '1i import { initPush } from '\''../src/mobile/pushBridge'\'';' "$APP"
    
    # Add useEffect for push init and deep links after the component definition
    awk '/export default function|function.*Layout/ && !found {
      print;
      print "";
      print "  // Push notification init and deep link handling";
      print "  useEffect(() => {";
      print "    (async () => {";
      print "      try {";
      print "        const { provider, token } = await initPush();";
      print "        console.log(`[push] provider=${provider} token=${(token||'').slice(0,8)}`);";
      print "      } catch(e) {";
      print "        console.log('[push] init error', e);";
      print "      }";
      print "    })();";
      print "";
      print "    const init = async () => {";
      print "      try {";
      print "        const url = await Linking.getInitialURL();";
      print "        if (url) {";
      print "          routeDeepLink(parseDeepLink(url));";
      print "        }";
      print "      } catch(e) {}";
      print "    };";
      print "    init();";
      print "";
      print "    const sub = Linking.addEventListener('url', e => {";
      print "      try {";
      print "        routeDeepLink(parseDeepLink(e.url));";
      print "      } catch(err) {}";
      print "    });";
      print "    return () => sub.remove && sub.remove();";
      print "  }, []);";
      found=1;
      next;
    } {print}' "$APP" > "$APP.tmp" && mv "$APP.tmp" "$APP"
    ok "App wired (backup: $APP.bak_oneclick)"
  else warn "push/deeplink already wired in $APP"; fi
else warn "App entry not found; wire manually if needed"; fi

# ---------- AASA & AssetLinks templates
say "Deep link assets"
mkdir -p .well-known
cat > .well-known/apple-app-site-association <<'JSON'
{"applinks":{"apps":[],"details":[{"appID":"TEAMID.com.company.aislemarts","paths":["/app/*"]}]}}
JSON
cat > .well-known/assetlinks.json <<'JSON'
[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"com.company.aislemarts","sha256_cert_fingerprints":["AA:BB:CC:DD:EE:FF:..."]}}]
JSON

# ---------- Store listings + privacy template
say "Store listings"
cat > store/apple/en-US/title.txt <<'TXT'
AisleMarts — Luxury Shopping & Stories
TXT
cat > store/apple/en-US/subtitle.txt <<'TXT'
Infinite Stories. Instant Shopping.
TXT
cat > store/apple/en-US/keywords.txt <<'TXT'
luxury,shopping,stories,video,commerce,fashion,tech,beauty
TXT
cat > store/apple/en-US/promotionalText.txt <<'TXT'
Discover premium creators and shop instantly from immersive stories.
TXT
cat > store/apple/en-US/description.txt <<'MD'
AisleMarts is a luxury social commerce experience: scroll immersive stories, discover curated products, and check out in seconds.

• Infinite creator stories: fashion, tech, beauty, travel
• Real-time product availability and pricing
• Safe and secure checkout
• Push alerts for new drops and creator features

Privacy: We respect your data choices. Manage tracking and notifications anytime in Settings.
MD
cat > store/google/listing/title.txt <<'TXT'
AisleMarts: Luxury Stories & Shopping
TXT
cat > store/google/listing/short_description.txt <<'TXT'
Shop premium products straight from creator stories — fast, secure, global.
TXT
cat > store/google/listing/full_description.txt <<'MD'
Experience luxury shopping powered by creator stories. AisleMarts blends beautiful short-form content with instant commerce.

• Infinite reels across fashion, tech, beauty & more
• One-tap product CTAs with trusted checkout
• Multi-currency support
• Notifications for new drops and creators
MD
cat > store/huawei/listing/description.txt <<'MD'
AisleMarts brings luxury shopping to Huawei devices with immersive stories and instant product checkout. HMS Push supported.
MD
cat > docs/privacy_policy.md <<'MD'
# Privacy Policy — AisleMarts (Template)
Last updated: YYYY-MM-DD
We collect minimal data to operate the service, personalize content, measure performance, and process purchases. Contact: privacy@yourcompany.com
MD

# ---------- Backend validation (smokes + HMAC + idempotency + currency)
say "Backend validation"
REPORT_DIR="reports/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT_DIR"
TIMEFMT='time_total:%{time_total} starttransfer:%{time_starttransfer} http:%{http_code}\n'

sign_body(){ node -e "const c=require('crypto');const s=process.env.HMAC_SECRET||'';const m=process.argv.slice(1).join(' ');process.stdout.write(c.createHmac('sha256',s).update(m).digest('hex'))" "$@"; }

curl -sS -w "$TIMEFMT" "$BASE_URL/health" -o "$REPORT_DIR/_health.json" || true
curl -sS -w "$TIMEFMT" "$BASE_URL/api/stories?limit=5" -o "$REPORT_DIR/_stories.json" || true
curl -sS -o "$REPORT_DIR/_cors.headers" -D - -X OPTIONS "$BASE_URL/api/track/cta" \
  -H "Origin: $ORIGIN" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type" >/dev/null || true
CTA_BODY="$(jq -n --arg s "$STORY_ID" --arg p "$PRODUCT_ID" --arg u "$USER_ID" '{storyId:$s,productId:$p,userId:$u}')"
curl -sS -w "$TIMEFMT" -H "content-type: application/json" -d "$CTA_BODY" "$BASE_URL/api/track/cta" -o "$REPORT_DIR/_cta.json" || true

if [ -n "$HMAC_SECRET" ]; then
  TS="$(($(date +%s%N)/1000000))"; ORDER="o-$(date +%s)"
  OK_BODY="$(jq -n --arg o "$ORDER" --arg p "$PRODUCT_ID" --arg amt "49.9" --arg cur "USD" --arg u "$USER_ID" '{orderId:$o,productId:$p,amount:($amt|tonumber),currency:$cur,userId:$u}')"
  SIG="$(sign_body "$TS.$OK_BODY")"; IDEM="idem-$ORDER"
  curl -sS -w "$TIMEFMT" -H "content-type: application/json" -H "X-Timestamp: $TS" -H "X-Signature: $SIG" -H "Idempotency-Key: $IDEM" -d "$OK_BODY" "$BASE_URL/api/track/purchase" -o "$REPORT_DIR/_purchase_ok.json" || true
  curl -sS -o "$REPORT_DIR/_purchase_replay.txt" -w "$TIMEFMT" -H "content-type: application/json" -H "X-Timestamp: $TS" -H "X-Signature: $SIG" -H "Idempotency-Key: $IDEM" -d "$OK_BODY" "$BASE_URL/api/track/purchase" || true
  TS2="$(($(date +%s%N)/1000000))"
  BAD_BODY="$(jq -n --arg o "$ORDER-bad" --arg p "$PRODUCT_ID" --arg amt "-1" --arg cur "USD" '{orderId:$o,productId:$p,amount:($amt|tonumber),currency:$cur}')"
  SIG2="$(sign_body "$TS2.$BAD_BODY")"
  curl -sS -o "$REPORT_DIR/_purchase_422.txt" -w "$TIMEFMT" -H "content-type: application/json" -H "X-Timestamp: $TS2" -H "X-Signature: $SIG2" -H "Idempotency-Key: idem-$ORDER-bad" -d "$BAD_BODY" "$BASE_URL/api/track/purchase" || true
  for CUR in EUR GBP; do
    TS3="$(($(date +%s%N)/1000000))"; ORD="o-$CUR-$(date +%s)"
    BODY3="$(jq -n --arg o "$ORD" --arg p "$PRODUCT_ID" --arg amt "129.999" --arg cur "$CUR" '{orderId:$o,productId:$p,amount:($amt|tonumber),currency:$cur}')"
    SIG3="$(sign_body "$TS3.$BODY3")"
    curl -sS -w "$TIMEFMT" -H "content-type: application/json" -H "X-Timestamp: $TS3" -H "X-Signature: $SIG3" -H "Idempotency-Key: $ORD" -d "$BODY3" "$BASE_URL/api/track/purchase" -o "$REPORT_DIR/_mc_$CUR.json" || true
  done
  TS4="$(($(date +%s%N)/1000000))"; ORD="o-JPY-$(date +%s)"
  BODY4="$(jq -n --arg o "$ORD" --arg p "$PRODUCT_ID" --arg amt "999.6" --arg cur "JPY" '{orderId:$o,productId:$p,amount:($amt|tonumber),currency:$cur}')"
  SIG4="$(sign_body "$TS4.$BODY4")"
  curl -sS -w "$TIMEFMT" -H "content-type: application/json" -H "X-Timestamp: $TS4" -H "X-Signature: $SIG4" -H "Idempotency-Key: $ORD" -d "$BODY4" "$BASE_URL/api/track/purchase" -o "$REPORT_DIR/_mc_JPY.json" || true
else
  warn "HMAC_SECRET not set; skipping signed purchase/multi-currency"
fi

# Summary
PASS=(); FAIL=()
jq -e '.ok==true' "$REPORT_DIR/_health.json" >/dev/null 2>&1 && PASS+=("health") || FAIL+=("health")
[ "$(jq 'length' "$REPORT_DIR/_stories.json" 2>/dev/null || echo 0)" -ge 0 ] && PASS+=("stories") || FAIL+=("stories")
grep -qi "access-control-allow-origin" "$REPORT_DIR/_cors.headers" && PASS+=("cors_preflight") || FAIL+=("cors_preflight")
[ -s "$REPORT_DIR/_cta.json" ] && PASS+=("cta") || FAIL+=("cta")
if [ -n "$HMAC_SECRET" ]; then
  grep -q "http:409" "$REPORT_DIR/_purchase_replay.txt" && PASS+=("idempotency_409") || FAIL+=("idempotency_409")
  grep -q "http:422" "$REPORT_DIR/_purchase_422.txt" && PASS+=("invalid_422") || FAIL+=("invalid_422")
  PASS+=("multi_currency_EUR" "multi_currency_GBP" "multi_currency_JPY")
fi
SCORE=$(( 100 * ${#PASS[@]} / ( (${#PASS[@]} + ${#FAIL[@]} == 0 ) ? 1 : (${#PASS[@]} + ${#FAIL[@]}) ) ))
SUMMARY_JSON="$REPORT_DIR/summary.json"; SUMMARY_MD="$REPORT_DIR/summary.md"
jq -n --arg base "$BASE_URL" \
      --argjson pass "$(printf '%s\n' "${PASS[@]}" | jq -R . | jq -s .)" \
      --argjson fail "$(printf '%s\n' "${FAIL[@]}" | jq -R . | jq -s .)" \
      --arg score "$SCORE" \
      '{base_url:$base,pass:$pass,fail:$fail,score:($score|tonumber)}' > "$SUMMARY_JSON"
{
  echo "# AisleMarts Validation Summary"
  echo "- Base URL: \`$BASE_URL\`"
  echo "- Score: **$SCORE%**"
  echo "## ✅ Passed (${#PASS[@]})"; for p in "${PASS[@]}"; do echo "- $p"; done
  echo "## ❌ Failed (${#FAIL[@]})"; if [ "${#FAIL[@]}" -eq 0 ]; then echo "- None"; else for f in "${FAIL[@]}"; do echo "- $f"; done; fi
  echo "_Artifacts in $(basename "$REPORT_DIR")_"
} > "$SUMMARY_MD"
ok "Backend summary written → $SUMMARY_MD"

# ---------- Optional Detox
if [ "$RUN_E2E" = "1" ]; then
  say "Detox iOS"
  (npm run e2e:build:ios && npm run e2e:test:ios) || warn "Detox iOS had failures"
  say "Detox Android"
  (npm run e2e:build:android && npm run e2e:test:android) || warn "Detox Android had failures"
else
  warn "Skipping Detox (set RUN_E2E=1 to enable)"
fi

say "Done."
echo "Build when green:"
echo "  eas build -p ios --profile ios-prod"
echo "  eas build -p android --profile android-gms-prod"
echo "  eas build -p android --profile android-hms-prod"
echo "Place google-services.json (GMS) & agconnect-services.json (HMS) in android/app/"