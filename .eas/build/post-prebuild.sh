#!/usr/bin/env bash

# EAS Build Hook: Add AndroidX exclusions to build.gradle
# This script runs after expo prebuild and before the Android build

set -e

echo "🔧 Adding AndroidX exclusions to build.gradle..."

BUILD_GRADLE_PATH="android/app/build.gradle"

if [ ! -f "$BUILD_GRADLE_PATH" ]; then
    echo "❌ build.gradle not found at $BUILD_GRADLE_PATH"
    exit 1
fi

# Check if exclusions already exist
if grep -q "configurations.all" "$BUILD_GRADLE_PATH"; then
    echo "✅ AndroidX exclusions already present"
    exit 0
fi

# Create the exclusions block
EXCLUSIONS='
configurations.all {
    exclude group: '\''com.android.support'\'', module: '\''support-compat'\''
    exclude group: '\''com.android.support'\'', module: '\''support-v4'\''
    exclude group: '\''com.android.support'\'', module: '\''versionedparcelable'\''
    exclude group: '\''com.android.support'\'', module: '\''support-core-utils'\''
    exclude group: '\''com.android.support'\'', module: '\''support-core-ui'\''
    exclude group: '\''com.android.support'\'', module: '\''support-fragment'\''
}

'

# Find the dependencies block and insert before it
# Use awk to insert the exclusions before the first dependencies block
awk -v exclusions="$EXCLUSIONS" '
/^dependencies \{/ && !inserted {
    print exclusions
    inserted = 1
}
{ print }
' "$BUILD_GRADLE_PATH" > "$BUILD_GRADLE_PATH.tmp"

mv "$BUILD_GRADLE_PATH.tmp" "$BUILD_GRADLE_PATH"

echo "✅ AndroidX exclusions added successfully!"
echo ""
echo "Verifying..."
grep -A 7 "configurations.all" "$BUILD_GRADLE_PATH" || echo "⚠️  Could not verify exclusions"
