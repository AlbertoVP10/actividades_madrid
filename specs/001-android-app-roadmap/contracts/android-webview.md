# Android WebView Contract for Madrid Explore

## Purpose

Define the interface between the bundled `index.html` web app and the Android Capacitor wrapper.

## Entry Point

- The Android application must load `www/index.html` as the WebView entry point.
- The HTML page must be self-contained and include all required local assets or reliably reachable external resources.

## Supported Native Capabilities

- `Internet` access for remote CDN asset loading and API calls.
- `Geolocation` to support user location capture and nearby event calculations.
- `localStorage` persistence for favorites and user state.

## Asset Contract

- `www/index.html` may reference local CSS/JS assets under `www/`.
- Core external dependencies should be bundled locally when possible:
  - Tailwind CSS
  - Leaflet CSS/JS
  - Material Symbols fonts
  - Google Fonts or equivalent fallback

## Permissions

The Android wrapper must request and include:
- `android.permission.INTERNET`
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.ACCESS_COARSE_LOCATION`

## Quality Requirements

- The WebView should display the same primary navigation elements as the web app.
- All buttons and tabs must function inside the WebView.
- The map must render and accept touch gestures.
- `localStorage` must persist favorites across app restarts.

## Fallback Behavior

- If an external resource fails to load, the app should still show core content and provide a helpful error message.
- If geolocation is denied, the app must continue with search and list functionality.
- Local assets (Leaflet CSS/JS) are bundled to ensure map functionality works offline.
- Tailwind CSS is loaded from CDN with potential fallback to local if implemented.

## Testing Expectations

- WebView must render all bottom navigation tabs without distortion.
- Map container should accept touch gestures and zoom controls.
- localStorage persistence should survive app restarts and orientation changes.
- Permission dialogs should appear when location features are accessed.
- App should handle network failures gracefully, showing cached or local content.
