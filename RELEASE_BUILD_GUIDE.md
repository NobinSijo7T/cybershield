# How to Build a Working APK

Since the Debug APK requires a server connection and the standard Release build failed, follow these steps to build a standalone APK using EAS.

## 1. Re-enable BERT & Fix CSV (Done)
- I have re-enabled the BERT detector in the code.
- I have added detailed logging to the CSV loader to debug any delays.

## 2. Build the APK (Recommended Method)
Run this command to build a release APK locally on your machine. This handles the signing keys automatically.

```powershell
npx eas-cli build --profile local --platform android --local
```

**Note:**
- You may be asked to log in to your Expo account.
- You may be asked to generate a new Keystore. Say **YES**.
- This process will take 10-20 minutes.

## 3. Install the APK
- Once finished, the command will output the path to the `.apk` file (usually in the root folder or `build/`).
- Transfer this file to your phone and install it.

## 4. Verify Fixes
- Open the app.
- Check if it opens without crashing.
- Test the detection ("You're dumb").
- If it feels slow on startup, let me know, and we can check the logs (if you can connect a debugger) or I can optimize the CSV loader further.
