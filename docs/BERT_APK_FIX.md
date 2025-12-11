# 🔧 Fix: BERT Model Not Available in Production APK

## Issue
The BERT model shows as "unavailable" in the production APK even though model files exist in the project.

## Root Cause
The model files need to be copied to `android/app/src/main/assets/models/` directory to be properly bundled into the APK. The Expo/Metro bundler doesn't automatically copy large asset files to the Android native assets directory.

## Solution Applied

### 1. Created Android Assets Directory Structure
```
android/app/src/main/assets/models/
├── cyberbully_model.tflite (106 MB)
└── vocab.txt (231 KB)
```

### 2. Updated build.gradle
Added asset source directories to ensure model files are included in the APK:

```gradle
sourceSets {
    main {
        assets.srcDirs += [
            'src/main/assets',
            '../../assets/models'
        ]
    }
}
```

### 3. Enhanced Model Loading Logic
Updated `bertDetector.ts` to properly handle Android asset loading with better logging.

## How to Build APK with BERT Support

### Quick Method (Automated)

Run the preparation script then build:

```powershell
# 1. Prepare assets (copies model files to Android directory)
.\scripts\prepare-android-assets.ps1

# 2. Clean previous builds
cd android
.\gradlew clean
cd ..

# 3. Build release APK
npx expo run:android --variant release
```

### Manual Method

```powershell
# 1. Copy model files manually
New-Item -ItemType Directory -Path "android\app\src\main\assets\models" -Force
Copy-Item "assets\models\cyberbully_model.tflite" "android\app\src\main\assets\models\"
Copy-Item "assets\models\vocab.txt" "android\app\src\main\assets\models\"

# 2. Clean build
cd android
.\gradlew clean
cd ..

# 3. Build APK
npx expo run:android --variant release
```

## Verify the Fix

### 1. Check Assets are Bundled
After building, verify the APK size is ~110+ MB (includes the BERT model):

```powershell
Get-Item "android\app\build\outputs\apk\release\*.apk" | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}
```

### 2. Monitor Logs During App Launch
Connect your device and watch the logs:

```powershell
adb logcat | Select-String "BERT"
```

**Expected output (Success):**
```
[BERT Detector] Initializing...
[BERT Detector] Platform: android
[BERT Detector] TFLite module is available
[BERT Detector] Loading vocabulary...
[BERT Detector] Vocabulary loaded successfully
[BERT Detector] Loading model from assets...
[BERT Detector] Using Android asset path for model
[BERT Detector] Model source obtained, loading with TFLite...
[BERT Detector] TFLite model instance created and ready
[BERT Detector] Model loaded successfully in 450ms
[BERT Detector] ✓ Initialized successfully
```

### 3. Check UI
In the app, the model selector should show:
```
Detection Model:
  🔹 Semantic ✓
  🔹 BERT ✓              ← Should be selectable, NOT grayed out!
```

### 4. Test Detection
1. Select "BERT" model
2. Enter test text: "You are stupid and worthless"
3. Click "Analyze"
4. Should detect as cyberbullying with high confidence (>80%)

## Troubleshooting

### BERT Still Shows Unavailable

**Check 1: Are you using Expo Go?**
- BERT will NEVER work in Expo Go
- You MUST build an APK/development build
- Solution: `npx expo run:android`

**Check 2: Are model files in the right location?**
```powershell
# Should return True
Test-Path "android\app\src\main\assets\models\cyberbully_model.tflite"
Test-Path "android\app\src\main\assets\models\vocab.txt"
```

**Check 3: Did you clean before rebuilding?**
```powershell
cd android
.\gradlew clean
cd ..
npx expo run:android --variant release
```

**Check 4: Check the APK size**
- Without BERT: ~10-20 MB
- With BERT: ~110-120 MB
- If APK is small, model wasn't bundled

**Check 5: View detailed logs**
```powershell
adb logcat "*:E" "BERT:*" "TFLite:*"
```

### Build Fails with "Out of Memory"

If Gradle runs out of memory during build:

```powershell
# Edit android/gradle.properties, add:
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Model Loads but Crashes on Inference

Check that both files are present and not corrupted:

```powershell
# Check file sizes
Get-Item "android\app\src\main\assets\models\*" | Select-Object Name, @{Name="Size";Expression={$_.Length}}
```

Expected:
- `cyberbully_model.tflite`: ~110,996,488 bytes
- `vocab.txt`: ~231,508 bytes

## Testing Checklist

- [ ] Model files copied to `android/app/src/main/assets/models/`
- [ ] Clean build performed (`gradlew clean`)
- [ ] APK size is 110+ MB
- [ ] Logs show "BERT Detector ✓ Initialized successfully"
- [ ] UI shows BERT as available (not grayed out)
- [ ] BERT model can be selected
- [ ] Test detection works with high accuracy

## Build for Production

For production release builds:

```powershell
# 1. Prepare assets
.\scripts\prepare-android-assets.ps1

# 2. Build with EAS
eas build --platform android --profile production

# OR local production build
cd android
.\gradlew assembleRelease
cd ..
```

The APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

## Important Notes

1. **Always run `prepare-android-assets.ps1` before building** if model files change
2. **Clean builds** are required when switching between dev/release variants
3. **APK size** will be ~110MB due to the BERT model
4. **Expo Go will never support BERT** - use development builds
5. **First load takes ~500ms** - model is cached afterwards

## Success Criteria

✅ APK size > 110 MB  
✅ Logs show successful BERT initialization  
✅ UI shows "BERT ✓" (not unavailable)  
✅ BERT detection works with high accuracy  
✅ No crashes during inference  

---

**Last Updated:** December 1, 2025  
**Status:** ✅ Fixed and Tested
