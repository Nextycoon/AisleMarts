#!/bin/bash

# AisleMarts Production Build Script
# This script builds the mobile app for production deployment

set -e

echo "🚀 Starting AisleMarts Production Build..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if logged into Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged into Expo. Please login:"
    eas login
fi

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

echo "📱 Building iOS app for production..."
eas build -p ios --profile production --non-interactive

echo "🤖 Building Android app for production..."
eas build -p android --profile production --non-interactive

echo "✅ Production builds completed!"
echo ""
echo "📋 Next steps:"
echo "1. Download the builds from Expo dashboard"
echo "2. Test the builds on physical devices"
echo "3. Submit to app stores using:"
echo "   - eas submit -p ios --latest --profile production"
echo "   - eas submit -p android --latest --profile production"