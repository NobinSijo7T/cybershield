# Speech Recognition - Important Information

## ⚠️ Current Status

Speech recognition is **temporarily disabled** in Expo Go due to native module limitations.

## Why It's Not Working

`expo-speech-recognition` is a **native module** that requires:
- Native code compilation
- Development build or production build
- Cannot run in Expo Go

## Solutions

### Option 1: Use Text Input Only (Current - ✅ Working)
- Users can type their text manually
- Microphone button will show a helpful error message
- **No build required** - works in Expo Go immediately

### Option 2: Build Development Build (For Full Features)
To enable speech recognition, you need to create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --profile development --platform android

# Build for iOS  
eas build --profile development --platform ios
```

After installing the development build on your device, speech recognition will work.

### Option 3: Production APK/IPA
When you build the production app, speech recognition will work automatically:

```bash
# For Android APK
eas build --profile preview --platform android

# For iOS
eas build --profile preview --platform ios
```

## What Changed

### Before:
- ❌ App crashed with "Cannot find native module 'ExpoSpeechRecognition'"
- ❌ Couldn't run in Expo Go

### After:
- ✅ App runs smoothly in Expo Go
- ✅ Shows helpful error message when microphone is clicked
- ✅ Users can type text instead
- ✅ Will work automatically in development/production builds

## Files Modified

1. **`hooks/useSpeechRecognition.ts`**
   - Removed native module imports
   - Added graceful error handling
   - Shows user-friendly message

2. **`app.config.js`**
   - Removed `expo-speech-recognition` plugin
   - Prevents native module errors

## For Production

When you're ready to release your app:

1. **Re-add the plugin** to `app.config.js`:
   ```javascript
   plugins: [
       'expo-router',
       'expo-asset',
       'expo-speech-recognition', // Add this back
       './plugins/withGradleProperties.js',
   ],
   ```

2. **Update the hook** to use native modules:
   ```typescript
   import {
       ExpoSpeechRecognitionModule,
       useSpeechRecognitionEvent,
   } from 'expo-speech-recognition';
   ```

3. **Build the app**:
   ```bash
   eas build --platform android
   ```

## Testing Speech Recognition

### In Expo Go:
- ❌ Will not work (shows error message)
- ✅ Users can type instead

### In Development Build:
- ✅ Full speech recognition
- ✅ All features work

### In Production APK/IPA:
- ✅ Full speech recognition
- ✅ All features work

## User Experience

When users click the microphone button:
- They see: "Speech recognition requires a development build. Please type your text instead."
- They can still use all other features
- The app doesn't crash

## Next Steps

Choose one:

1. **Keep as is** - Users type text (works now in Expo Go)
2. **Build development build** - Enable speech recognition for testing
3. **Build production** - Full features for release

---

**Current Recommendation**: Keep the current setup for development in Expo Go. When ready to release, build a production APK with speech recognition enabled.
