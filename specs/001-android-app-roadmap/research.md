# Research: Android App Roadmap from index.html

## Decision

Use Capacitor to wrap the existing `index.html` static web app into a production-ready Android package.

## Rationale

- The current app is a single-page HTML/CSS/JS project with no dedicated native layer.
- Capacitor provides a modern Android WebView wrapper, easy native configuration, and a better plugin ecosystem than Cordova.
- The current code already targets mobile layout patterns and can be ported without a native rewrite.

## Alternatives Considered

- Cordova: viable for WebView packaging, but older and less maintained than Capacitor.
- Progressive Web App (PWA): easier to deploy but insufficient for guaranteed Google Play submission without a wrapper.
- Full native Android rewrite: much higher cost and scope; not justified for this existing static app.

## Key Compatibility Findings

- The app uses Tailwind CDN, Google Fonts, Material Symbols, and Leaflet from external CDNs.
  - These remote assets create runtime dependency risk inside Android if network access is poor.
  - Best practice is to bundle critical CSS/JS assets locally or add offline-safe fallback.

- The app depends on browser features typical of modern WebViews:
  - `localStorage` for favorites
  - `navigator.geolocation` for location capture
  - fixed-position overlays and dynamic DOM updates

- Leaflet and the map container are compatible with Android WebView but should be tested for gestures and scrolling.

## Mobile Responsiveness Issues

- Hard-coded fixed heights: `.map-container` uses `top: 16rem` and `bottom: 80px`, which assumes a specific header height and may not adapt to different screen sizes or orientations.
- Body min-height set to `max(884px, 100dvh)`, which enforces a minimum height that may cause layout issues on smaller screens.
- Map container is fixed position, potentially causing overlap or incorrect positioning on mobile devices with varying aspect ratios.
- No use of responsive units for map positioning; relies on rem units that may not scale well across devices.

## Mobile Emulation Test Results

- After fixes: Removed hard-coded min-height, adjusted map container top position to 10rem for better mobile fit.
- Bundled Leaflet assets locally to reduce CDN dependency.
- Layout now uses 100dvh for full viewport height, improving mobile display.
- Fixed positioning adjusted to prevent overlap on smaller screens.

## Android Emulator Validation

- Capacitor sync successful, assets copied to android/app/src/main/assets/public
- AndroidManifest configured with required permissions
- WebView entry point set to www/index.html
- No compatibility issues detected in initial setup

## Performance Considerations

- The current implementation loads external CSS and JS from CDNs, which adds network latency.
- A single large HTML file with inline scripts may delay first meaningful paint.
- The fixed `map-container` and multiple DOM updates mean the app should be tuned for 60fps interactions on mid-range devices.

## Conclusions

- Capacitor is the best wrapper choice.
- The Android app should include local bundling of core assets, an optimized `index.html`, and a minimal native manifest.
- Core risks to mitigate: remote CDN availability, WebView compatibility for Leaflet, and Android WebView permission handling.
