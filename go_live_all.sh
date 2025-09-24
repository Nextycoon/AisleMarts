#!/usr/bin/env bash
set -euo pipefail

echo "== AisleMarts • GO LIVE ALL =="
[ -f package.json ] || { echo "Run from your app root (package.json missing)."; exit 1; }
mkdir -p e2e scripts patches src/mobile .github/workflows store/apple/en-US store/google/listing store/huawei/listing docs bin/ios bin/android

# -------------------------
# Detox E2E config + tests
# -------------------------
cat > e2e/jest.config.js <<'JS'
module.exports = { testTimeout: 180000, testRunner: 'jest-circus/runner', setupFilesAfterEnv: ['./init.js'], reporters: ['detox/runners/jest/streamlineReporter'] };
JS
cat > e2e/init.js <<'JS'
const detox = require('detox'); beforeAll(async()=>{await detox.init(undefined,{launchApp:true});},300000); afterAll(async()=>{await detox.cleanup();}); jest.retryTimes(1);
JS
cat > e2e/resolve-app.js <<'JS'
const fs=require('fs'),cp=require('child_process');const cfg=process.env.DETOX_CONFIGURATION||'';if(cfg.includes('ios')){const out=cp.execSync('find ios -name "*.app" | head -n1').toString().trim();if(!out)process.exit(0);fs.rmSync('bin/ios',{recursive:true,force:true});fs.mkdirSync('bin/ios',{recursive:true});cp.execSync(`cp -R "${out}" bin/ios/Release.app`);}else{const out=cp.execSync('find android -name "*.apk" | head -n1').toString().trim();if(!out)process.exit(0);fs.rmSync('bin/android',{recursive:true,force:true});fs.mkdirSync('bin/android',{recursive:true});fs.copyFileSync(out,'bin/android/Release.apk');}
JS
cat > e2e/_waitAny.js <<'JS'
const { expect: detoxExpected }=require('detox'); module.exports.waitAny=async(m,t)=>{const s=Date.now();let e;while(Date.now()-s<t){for(const x of m){try{await detoxExpected(x).toExist();return;}catch(err){e=err}}await new Promise(r=>setTimeout(r,250))}throw e||new Error('No matchers appeared')};
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

# -------------------------
# Detox scripts in package.json
# -------------------------
cat > scripts/patch_package_json_frontend_e2e.mjs <<'JS'
import fs from 'fs'; const f='frontend/package.json'; if(!fs.existsSync(f))process.exit(1);
const pkg=JSON.parse(fs.readFileSync(f,'utf8')); pkg.scripts=pkg.scripts||{};
pkg.scripts['e2e:build:ios']??='detox build -c ios.sim.release';
pkg.scripts['e2e:test:ios'] ??='detox test -c ios.sim.release --record-logs all --workers 1';
pkg.scripts['e2e:build:android']??='detox build -c android.emu.release';
pkg.scripts['e2e:test:android'] ??='detox test -c android.emu.release --record-logs all --workers 1';
pkg.detox??={testRunner:'jest',runnerConfig:'e2e/jest.config.js',configurations:{
 'ios.sim.release':{type:'ios.simulator',device:{type:'iPhone 14'},binaryPath:'bin/ios/Release.app',build:'expo run:ios --configuration Release --no-install && DETOX_CONFIGURATION=ios.sim.release node e2e/resolve-app.js'},
 'android.emu.release':{type:'android.emulator',device:{avdName:'Pixel_6_API_34'},binaryPath:'bin/android/Release.apk',build:'expo run:android --variant release && DETOX_CONFIGURATION=android.emu.release node e2e/resolve-app.js'}
}};
fs.writeFileSync(f,JSON.stringify(pkg,null,2)); console.log('✓ frontend/package.json patched for Detox');
JS

# -------------------------
# Triple store build profiles (EAS)
# -------------------------
cat > patches/eas.json.add.json <<'JSON'
{"build":{"ios-prod":{"extends":"production","platform":"ios"},"android-gms-prod":{"extends":"production","platform":"android","gradleCommand":":app:bundleGmsRelease"},"android-hms-prod":{"extends":"production","platform":"android","gradleCommand":":app:bundleHmsRelease"}},"submit":{"ios-prod":{"extends":"production"},"android-gms-prod":{"extends":"production"},"android-hms-prod":{"extends":"production"}}}
JSON
cat > scripts/merge_eas_json.mjs <<'JS'
import fs from 'fs'; const dst='frontend/eas.json', add='patches/eas.json.add.json';
const addObj=JSON.parse(fs.readFileSync(add,'utf8')); let base={}; if(fs.existsSync(dst)) base=JSON.parse(fs.readFileSync(dst,'utf8'));
base.build={...(base.build||{}),...(addObj.build||{})}; base.submit={...(base.submit||{}),...(addObj.submit||{})};
fs.writeFileSync(dst,JSON.stringify(base,null,2)); console.log('✓ frontend/eas.json merged (ios-prod, android-gms-prod, android-hms-prod)');
JS
node scripts/merge_eas_json.mjs

# -------------------------
# Push bridge + provider detection
# -------------------------
cat > src/mobile/runtimeProviders.ts <<'TS'
import { Platform } from 'react-native';
export async function detectProvider(): Promise<'ios'|'gms'|'hms'|'none'> {
  if (Platform.OS === 'ios') return 'ios';
  try { const ua=(global as any)?.navigator?.userAgent||''; if(/huawei|honor|hms/i.test(ua)) return 'hms'; } catch {}
  return Platform.OS === 'android' ? 'gms' : 'none';
}
TS
cat > src/mobile/pushBridge.ts <<'TS'
import { detectProvider } from './runtimeProviders';
type Token={provider:'ios'|'gms'|'hms'|'none',token?:string};
export async function initPush(): Promise<Token> {
  const provider=await detectProvider();
  try {
    if(provider==='ios'){ const Notifications=(await import('expo-notifications')).default;
      const { status }=await Notifications.requestPermissionsAsync(); if(status!=='granted') return {provider};
      const token=(await Notifications.getDevicePushTokenAsync()).data; return {provider,token}; }
    if(provider==='gms'){ const messaging=(await import('@react-native-firebase/messaging')).default;
      await messaging().requestPermission(); const token=await messaging().getToken(); return {provider,token}; }
    if(provider==='hms'){ const Hms=await import('@hmscore/react-native-hms-push');
      // @ts-ignore
      const res=await Hms.HmsPushInstanceId.getToken(); const token=res?.result||res?.token; return {provider,token}; }
  } catch {}
  return {provider:provider??'none'};
}
TS

# -------------------------
# Store listing & policy
# -------------------------
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
We collect minimal data to operate the service, personalize content, measure performance, and process purchases. See sections for data categories, purposes, and controls. Contact: privacy@yourcompany.com
MD

cat <<'DONE'

✔ GO LIVE ALL complete.

Next commands:
# Store builds
eas build -p ios --profile ios-prod
eas build -p android --profile android-gms-prod
eas build -p android --profile android-hms-prod

Remember to place:
- android/app/google-services.json  (GMS)
- android/app/agconnect-services.json (HMS)

DONE