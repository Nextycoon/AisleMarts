#!/usr/bin/env bash
set -euo pipefail

echo "== AisleMarts Triple Store Setup =="
echo "This will add EAS profiles, Android flavor snippets, iOS Info.plist keys, and helper scripts."

# Dev deps (optional; uncomment if you want to install now)
# npm i -D @react-native-firebase/app @react-native-firebase/messaging
# npm i -D @hmscore/react-native-hms-push
# npm i -D expo-notifications

# Create dirs if missing
mkdir -p patches scripts src/mobile .github/workflows

echo "• Patches ready under patches/"
echo "• Push bridge: src/mobile/pushBridge.ts"
echo "• Runtime provider: src/mobile/runtimeProviders.ts"

cat <<'NEXT'

MANUAL STEPS:
1) EAS profiles: merge patches/eas.json.add.json into your eas.json.
2) Android Gradle:
   - android/app/build.gradle:
       • Add flavors/dependencies from patches/android/app.build.gradle.flavors.txt
       • Apply plugin(s) from patches/android/app.build.gradle.plugins.snippet.txt
   - android/build.gradle:
       • Add Huawei repo & classpath from patches/android/top.build.gradle.huawei.repos.txt
   - Place google-services.json (GMS) and/or agconnect-services.json (HMS) in android/app/
3) iOS Info.plist: add keys from patches/ios/Info.plist.keys.txt.
4) Push setup (optional):
   - iOS: Expo Notifications or native APNS config.
   - Android GMS: Firebase project + google-services.json.
   - Android HMS: AppGallery Connect + agconnect-services.json.
5) Builds:
   eas build -p ios --profile ios-prod
   eas build -p android --profile android-gms-prod
   eas build -p android --profile android-hms-prod
NEXT
