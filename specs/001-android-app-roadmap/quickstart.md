# Quickstart: Build the Android App from index.html

## Prerequisites

- Node.js 18+ and npm installed
- Java JDK 17+ installed
- Android Studio installed with Android SDK and emulator support
- Android device or emulator for testing

## Step 1: Prepare the Web App

1. Confirm the main app entry is `index.html` in the repository root.
2. Copy or serve the current `index.html` and any required local assets into the Capacitor web app folder once created.
3. Replace CDN dependencies with local files where possible for better offline reliability.

## Step 2: Install Capacitor

```bash
npm install --save-dev @capacitor/cli @capacitor/core @capacitor/android
npx cap init "Madrid Explore" com.myapp.id
```

When prompted:
- App name: `Madrid Explore`
- App package id: `com.myapp.id`
- Web directory: `www`

## Step 3: Build the Web Assets

1. Create or update `www/` with the current `index.html` and supporting assets.
2. If the app relies on external CDNs, verify that network access is available.

```bash
mkdir -p www
cp index.html www/index.html
```

## Step 4: Add Android Platform

```bash
npx cap add android
```

## Step 5: Configure Android App

- Open the Android project:

```bash
npx cap open android
```

- In Android Studio, verify `AndroidManifest.xml` includes:
  - `android.permission.INTERNET` (required for loading remote CDN assets and API calls)
  - `android.permission.ACCESS_FINE_LOCATION` (for precise user location in map features)
  - `android.permission.ACCESS_COARSE_LOCATION` (fallback location access)

- Package ID `com.myapp.id` is configured in `capacitor.config.json` and used for app identification in Google Play.

- Configure app icons and splash screen in `android/app/src/main/res/mipmap-*` and `android/app/src/main/res/drawable`.

## Step 6: Run and Test

```bash
npx cap copy android
npx cap open android
```

Then run the app on an emulator or connected device.

## Step 7: Validate WebView Behavior

- Confirm all navigation buttons work inside the Android WebView.
- Verify the map loads and gestures work.
- Check favorites persistence with `localStorage`.
- Confirm permission prompts appear for location access.

## Step 8: Build for Google Play

1. Generate a signed Android App Bundle (AAB):

```bash
npx cap build android --prod
```

2. In Android Studio, go to Build > Generate Signed Bundle / APK
   - Select Android App Bundle
   - Create or select a keystore
   - Choose release build variant

3. Use `bundletool` to test the bundle locally:

```bash
bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab --output=app.apks --ks=your-keystore.jks --ks-pass=pass:your-password --ks-key-alias=your-alias --key-pass=pass:your-key-password
bundletool install-apks --apks=app.apks
```

4. For Google Play Store listing:
   - App name: Madrid Explore
   - Package name: com.myapp.id
   - Minimum Android version: API 21 (Android 5.0)
   - Target Android version: Latest
   - Required permissions: INTERNET, LOCATION (with rationale)
   - Screenshots: Capture from emulator showing map, list, and filters
   - Description: Highlight offline-capable features and local asset bundling

## Troubleshooting

### Emulator Issues
- If the emulator fails to start, ensure Android SDK is properly installed and `ANDROID_HOME` is set.
- For slow performance, increase emulator RAM and CPU in AVD Manager.
- If WebView doesn't load, check that `www/index.html` exists and `npx cap sync` was run.

### Permission Prompts
- Location permissions may not prompt on emulator; test on physical device.
- If permissions are denied, the app falls back to search without location features.
- Check `AndroidManifest.xml` for correct permission declarations.

### Remote Asset Failures
- Bundled Leaflet assets reduce dependency on unpkg.com.
- If Tailwind CDN fails, the app may have styling issues; consider bundling locally.
- Test with network throttling in Chrome DevTools to simulate poor connections.
