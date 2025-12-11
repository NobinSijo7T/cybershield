#!/bin/bash
# BERT Model Android Build Verification Script

echo "============================================================"
echo "BERT Android Build Pre-Check"
echo "============================================================"

echo ""
echo "[1] Checking if running in Expo Go..."
if [ -n "$EXPO_PUBLIC_USE_PRODUCTION" ]; then
    echo "✓ Production build detected"
else
    echo "⚠ WARNING: BERT will NOT work in Expo Go"
    echo "  You must build an APK: npx expo run:android"
fi

echo ""
echo "[2] Model files verified:"
ls -lh assets/models/*.tflite assets/models/vocab.txt 2>/dev/null || echo "✗ Model files not found!"

echo ""
echo "[3] Building Android APK with BERT support..."
echo ""
echo "Choose build option:"
echo "  1) Clean + Debug Build (Recommended)"
echo "  2) Debug Build Only"
echo "  3) Release Build"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Running clean build..."
        cd android
        ./gradlew clean
        cd ..
        echo ""
        echo "Building debug APK..."
        npx expo run:android --variant debug
        ;;
    2)
        echo ""
        echo "Building debug APK..."
        npx expo run:android --variant debug
        ;;
    3)
        echo ""
        echo "Building release APK..."
        npx expo run:android --variant release
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "============================================================"
echo "Build complete!"
echo "============================================================"
echo ""
echo "To verify BERT model loaded:"
echo "  adb logcat | grep 'BERT Detector'"
echo ""
echo "Look for these success messages:"
echo "  ✓ [BERT Detector] TFLite module is available"
echo "  ✓ [BERT Detector] Vocabulary loaded successfully"
echo "  ✓ [BERT Detector] Model loaded successfully"
echo "  ✓ [BERT Detector] ✓ Initialized successfully"
