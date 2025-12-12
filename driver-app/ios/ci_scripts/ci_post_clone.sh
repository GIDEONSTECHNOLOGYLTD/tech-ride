#!/bin/sh

# Xcode Cloud post-clone script
# This script runs after Xcode Cloud clones the repository

set -e

echo "🔧 Running Xcode Cloud post-clone script..."

# Navigate to iOS directory
cd driver-app/ios

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
pod install

echo "✅ Post-clone script completed successfully"
