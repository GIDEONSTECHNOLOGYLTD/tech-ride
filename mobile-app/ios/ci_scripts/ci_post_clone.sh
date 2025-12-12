#!/bin/sh

# Xcode Cloud post-clone script
# This script runs after Xcode Cloud clones the repository

set -e

echo "🔧 Running Xcode Cloud post-clone script..."
echo "📍 Current directory: $(pwd)"

# On Xcode Cloud, we're already in the ios folder
# The script is at: /Volumes/workspace/repository/mobile-app/ios/ci_scripts/ci_post_clone.sh
# So we're already at the right location

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
pod install

echo "✅ Post-clone script completed successfully"
