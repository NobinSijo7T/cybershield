# ✅ BERT Model - Android Build Guide

## Current Status

### ❌ Expo Go (What you're seeing now)
**BERT shows as "(Unavailable)"** - This is **CORRECT and EXPECTED**

- Expo Go is a development sandbox that **cannot** load native modules
- `react-native-fast-tflite` requires native compilation
- **BERT will NEVER work in Expo Go**

### ✅ Android APK Build (What you need)
**BERT will be AVAILABLE** after building an actual APK

---

## Why BERT is Unavailable in Expo Go

```
Expo Go Environment:
├── JavaScript runtime ✓
├── Native modules ✗ (not compiled)
└── react-native-fast-tflite ✗ (requires native code)

Android APK Build:
├── JavaScript runtime ✓
├── Native modules ✓ (compiled into APK)
└── react-native-fast-tflite ✓ (works!)
```

---

## Build Android APK (3 Easy Steps)

### Option A: Using PowerShell Script (Easiest)

```powershell
# Run the automated build script
.\scripts\build-bert-android.ps1
```

The script will:
1. ✓ Verify model files exist
2. ✓ Clean previous builds (optional)
3. ✓ Build APK with BERT support
4. ✓ Show monitoring commands

### Option B: Manual Build

```bash
# 1. Clean previous build (recommended first time)
cd android
./gradlew clean
cd ..

# 2. Build debug APK
npx expo run:android --variant debug

# 3. Monitor logs to verify BERT loads
adb logcat | grep "BERT"
```

---

## Verify BERT Loaded Successfully

### During App Startup

Watch for these log messages:

```
✓ [BERT Detector] Initializing...
✓ [BERT Detector] Platform: android
✓ [BERT Detector] TFLite module is available
✓ [BERT Detector] Loading vocabulary...
✓ [BERT Detector] Vocabulary loaded successfully
✓ [BERT Detector] Loading model...
✓ [BERT Detector] Model source obtained, initializing...
✓ [BERT Detector] Model instance created successfully
✓ [BERT Detector] Model loaded successfully in XXXms
✓ [BERT Detector] ✓ Initialized successfully
```

### In the App UI

After building the APK, you should see:

**Before (Expo Go):**
```
Detection Model:
  🔹 Semantic ✓
  🔹 BERT (Unavailable)  ← Grayed out
```

**After (APK Build):**
```
Detection Model:
  🔹 Semantic ✓
  🔹 BERT ✓              ← Available!
```

---

## Build Time Estimate

| Task | Time |
|------|------|
| First build (with clean) | ~10-15 min |
| Subsequent builds | ~3-5 min |
| Installing on device | ~30 sec |

---

## Troubleshooting

### Issue: Build fails with "SDK not found"

```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Android/Sdk  # Linux/Mac
# or
$env:ANDROID_HOME="C:\Users\YourName\AppData\Local\Android\Sdk"  # Windows
```

### Issue: "gradle not found"

```bash
# Make gradlew executable (Linux/Mac)
chmod +x android/gradlew
```

### Issue: APK builds but BERT still unavailable

Check logs:
```bash
adb logcat | grep -E "BERT|TFLite|ERROR"
```

Look for specific errors and see `docs/BERT_APK_TROUBLESHOOTING.md`

---

## Quick Test After Build

1. **Install APK** on your device
2. **Open app** - watch logs:
   ```bash
   adb logcat | Select-String "BERT Detector"
   ```
3. **Check UI** - BERT should NOT show "(Unavailable)"
4. **Select BERT model** and test with: `"You are stupid"`
5. **Verify detection** - should show cyberbullying detected

---

## File Verification (Already Done ✓)

Our pre-check confirmed:
- ✅ Model: `cyberbully_model.tflite` (105.85 MB)
- ✅ Vocab: `vocab.txt` (30,522 tokens)
- ✅ Plugin configured in `app.json`
- ✅ Dependencies installed
- ✅ Metro config includes `.tflite`

**Everything is ready for Android build!**

---

## Next Steps

### 1️⃣ Build the APK

```powershell
# Run this command:
npx expo run:android --variant debug
```

### 2️⃣ Monitor Logs

```powershell
# In a separate terminal:
adb logcat | Select-String "BERT"
```

### 3️⃣ Test in App

- Select BERT model (should be enabled)
- Enter test text: "You are an idiot"
- Should detect as cyberbullying with high confidence

---

## Summary

| Environment | BERT Status | Reason |
|-------------|-------------|--------|
| **Expo Go** | ❌ Unavailable | Native modules not compiled |
| **Debug APK** | ✅ Available | Native modules compiled |
| **Release APK** | ✅ Available | Native modules compiled |

**Bottom line:** Build an APK to use BERT. The "(Unavailable)" in Expo Go is normal!

---

## Ready to Build?

Run one of these commands:

```bash
# Automated (Recommended)
.\scripts\build-bert-android.ps1

# Manual
npx expo run:android --variant debug
```

The first build takes ~10 minutes. Grab a coffee! ☕
