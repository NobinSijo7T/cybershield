# BERT Model Loading in Android APK - Troubleshooting Guide

## Problem
The BERT model shows as "unavailable" in Android APK builds even though the model files (`cyberbully_model.tflite` and `vocab.txt`) are correctly included in the `assets/models/` directory.

## Root Cause Analysis

### 1. **Native Module Requirements**
   - `react-native-fast-tflite` is a **native module** that requires compilation into the APK
   - It does NOT work in Expo Go (development environment)
   - Requires a **development build** or **production build** to function

### 2. **Asset Loading in Production**
   - The model loading mechanism needs to properly handle both:
     - Development environment (Expo Go) - graceful fallback
     - Production environment (APK/AAB) - actual model loading

### 3. **Module Initialization Timing**
   - The TFLite module must be properly initialized before attempting to load models
   - Error handling must distinguish between "module unavailable" vs "model loading failed"

## Solutions Implemented

### 1. Enhanced Model Loading (`services/bertDetector.ts`)

```typescript
// Improved error handling with Asset fallback
try {
    const modelAsset = Asset.fromModule(require('../assets/models/cyberbully_model.tflite'));
    await modelAsset.downloadAsync();
    
    if (modelAsset.localUri) {
        console.log('[BERT Detector] Model asset URI:', modelAsset.localUri);
        modelSource = require('../assets/models/cyberbully_model.tflite');
    } else {
        throw new Error('Model asset URI not available');
    }
} catch (assetError) {
    console.log('[BERT Detector] Asset download attempt:', assetError);
    // Fallback to direct require (works in production builds)
    modelSource = require('../assets/models/cyberbully_model.tflite');
}
```

### 2. Better Diagnostics

Added comprehensive logging at each step:
- Platform detection
- Module availability check
- Vocabulary loading status
- Model loading progress
- Inference execution

### 3. Graceful Fallback

The app now properly falls back to the semantic detector when BERT is unavailable:
```typescript
if (!bertDetector.isLoaded()) {
    console.log('[App] BERT unavailable, using semantic detector');
    setSelectedModel('semantic');
}
```

### 4. Fixed Plugin Configuration

Updated `app.json` to use the correct path format:
```json
{
  "plugins": [
    [
      "react-native-fast-tflite",
      {
        "models": [
          "./assets/models/cyberbully_model.tflite"
        ]
      }
    ]
  ]
}
```

## Verification Steps

### Run the Diagnostic Test

1. **Import the test in your app:**
   ```typescript
   import { runBERTTest } from '@/tests/bert_apk_verification';
   ```

2. **Add a button to trigger it:**
   ```typescript
   <Button onPress={runBERTTest} title="Test BERT" />
   ```

3. **Check the logs** using:
   ```bash
   # For Android
   npx expo run:android
   # Then check logs
   adb logcat | grep "BERT"
   ```

### Expected Log Output (Success)

```
==========================================================
BERT MODEL APK VERIFICATION TEST
==========================================================

[Step 1] Platform Information:
- Platform: android
- Version: 34
- Is Testing: false

[Step 2] Checking TFLite Module:
✓ TFLite module imported successfully
- Module keys: loadTensorflowModel, useTensorflowModel
✓ loadTensorflowModel function exists

[Step 3] Checking Model Assets:
✓ Model asset reference created
- Name: cyberbully_model
- Type: tflite
✓ Model asset downloaded
- Local URI: file:///data/user/0/com.nobin360t.cybershield/...

[Step 4] BERT Detector Initialization:
- Initial state: NOT LOADED
  Attempting to initialize...
✓ TFLite module is available
✓ Vocabulary loaded successfully
✓ Model loaded successfully
- After init: LOADED ✓

✓✓✓ SUCCESS! BERT model loaded successfully

[Step 5] Testing Model Inference:
  Test text: "You are stupid and worthless"
✓ Inference completed successfully
- Is Cyberbullying: true
- Confidence: 90.31%
- Risk Level: 90/100
- Processing Time: 45ms
==========================================================
```

### Common Issues and Fixes

#### Issue 1: "TFLite module not available"
**Cause:** Running in Expo Go
**Solution:** Build a development or production APK
```bash
npx expo run:android --variant debug
```

#### Issue 2: "Model asset URI not available"
**Cause:** Assets not properly bundled
**Solution:** 
1. Clean the build: `cd android && ./gradlew clean && cd ..`
2. Rebuild: `npx expo run:android`

#### Issue 3: "loadTensorflowModel function not found"
**Cause:** Module not properly linked
**Solution:**
1. Rebuild native code: `npx expo prebuild --clean`
2. Run: `npx expo run:android`

#### Issue 4: Model loads but inference fails
**Cause:** Vocabulary file missing or corrupted
**Solution:** Verify both files exist:
- `assets/models/cyberbully_model.tflite` (105 MB)
- `assets/models/vocab.txt` (~230 KB)

## Build Commands

### Development Build (Recommended for Testing)
```bash
npx expo run:android --variant debug
```

### Production Build
```bash
# Using EAS Build
eas build --platform android --profile production

# Or local build
npx expo run:android --variant release
```

## Checklist Before Building

- [ ] Model files exist in `assets/models/`
  - [ ] `cyberbully_model.tflite` (105.85 MB)
  - [ ] `vocab.txt` (~230 KB)
- [ ] `app.json` has correct plugin configuration
- [ ] `metro.config.js` includes `.tflite` in `assetExts`
- [ ] `react-native-fast-tflite` is in `package.json` dependencies
- [ ] Clean build performed (`./gradlew clean`)

## Testing After Build

1. Install the APK on a device
2. Open the app and check the model selector
3. BERT should NOT show "(Unavailable)"
4. Select BERT model and test with: "You are stupid"
5. Should detect as cyberbullying with high confidence

## Debug Logs to Monitor

Watch these log tags:
```bash
adb logcat | grep -E "BERT Detector|TFLite|cyberbully"
```

Key success indicators:
- `[BERT Detector] TFLite module is available`
- `[BERT Detector] Vocabulary loaded successfully`
- `[BERT Detector] Model loaded successfully in XXms`
- `[BERT Detector] ✓ Initialized successfully`

## Additional Resources

- **TFLite Plugin Docs:** https://github.com/mrousavy/react-native-fast-tflite
- **Expo Development Builds:** https://docs.expo.dev/develop/development-builds/introduction/
- **Asset Loading:** https://docs.expo.dev/versions/latest/sdk/asset/

## Support

If BERT still shows as unavailable after following this guide:

1. Run the verification test (`bert_apk_verification.ts`)
2. Capture the full log output
3. Check that you're using a development/production build (NOT Expo Go)
4. Verify the APK size (should be ~110+ MB with the BERT model)
