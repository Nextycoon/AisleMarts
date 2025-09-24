import fs from 'fs'; const f='package.json'; if(!fs.existsSync(f))process.exit(1);
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
