#!/bin/bash

# AndroidX Duplicate Classes - Diagnostic Script
# This script helps verify that the fix has been applied correctly

echo "========================================="
echo "AndroidX Fix Diagnostic Script"
echo "========================================="
echo ""

# Check if android folder exists
if [ ! -d "android" ]; then
    echo "❌ Android folder not found!"
    echo "   Run: npx expo prebuild --clean"
    exit 1
fi

echo "✅ Android folder exists"
echo ""

# Check if build.gradle has the fix
echo "Checking android/app/build.gradle for configurations.all block..."
if grep -q "configurations.all" android/app/build.gradle; then
    echo "✅ configurations.all block found!"
    echo ""
    echo "Content:"
    grep -A 10 "configurations.all" android/app/build.gradle
else
    echo "❌ configurations.all block NOT found!"
    echo "   The fix may not have been applied."
    echo "   Run: npx expo prebuild --clean"
fi

echo ""
echo "========================================="
echo "Checking for com.android.support dependencies..."
echo "========================================="

cd android

# Generate dependency tree
./gradlew :app:dependencies --configuration releaseRuntimeClasspath > /tmp/dependencies.txt 2>&1

# Search for support libraries
if grep -q "com.android.support" /tmp/dependencies.txt; then
    echo "⚠️  Found com.android.support dependencies:"
    echo ""
    grep "com.android.support" /tmp/dependencies.txt | head -20
    echo ""
    echo "These should be excluded by the configurations.all block."
else
    echo "✅ No com.android.support dependencies found!"
    echo "   The fix is working correctly."
fi

cd ..

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. If configurations.all is missing, run: npx expo prebuild --clean"
echo "2. If com.android.support is still present, check the plugin is loaded"
echo "3. Trigger EAS build: eas build --platform android"
echo ""
