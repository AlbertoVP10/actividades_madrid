# Implementation Plan: Android App Roadmap from index.html

**Branch**: `main` | **Date**: 2026-05-10 | **Spec**: `specs/001-android-app-roadmap/spec.md`
**Input**: Feature specification from `specs/001-android-app-roadmap/spec.md`

This plan describes the transition of the current static `index.html` web app into a Capacitor-backed Android application ready for Google Play.

## Summary

The current project is a single-page HTML/CSS/JS app built around `index.html` with Tailwind CDN styling, Material Symbols, and Leaflet map integration. The goal is to audit mobile responsiveness and performance, upgrade the UI to a modern native-like experience, wrap the app with Capacitor for Android, configure the Android package and permissions, and produce developer-ready documentation.

Key deliverables:
- mobile audit of the current HTML/CSS/JS implementation
- UI/UX modernization recommendations and targeted frontend improvements
- Capacitor Android setup with package name `com.myapp.id`
- AndroidManifest configuration, app icons, and splash screen guidance
- README and deployment guide for Google Play
- quality checklist for Android WebView compatibility

## Technical Context

**Language/Version**: HTML5, CSS, vanilla JavaScript, latest browser-compatible ES6
**Primary Dependencies**: Tailwind CSS CDN, Leaflet 1.9.4, Google Fonts, Material Symbols, localStorage, browser geolocation
**Storage**: `localStorage` for favorites and user state; no native database planned for initial wrapper
**Testing**: Chrome DevTools mobile emulation, Android emulator, Capacitor run android, manual WebView validation
**Target Platform**: Android WebView via Capacitor; modern Android devices and Google Play distribution
**Project Type**: hybrid mobile app / static web app wrapper
**Performance Goals**: 60fps UI interactions on mid-range Android, first meaningful paint under 3 seconds, responsive touch targets and map gestures
**Constraints**: remote CDN asset reliance, Leaflet map compatibility inside WebView, fixed-position overlay layout, external API network availability
**Scale/Scope**: single-screen hybrid Android app sourced from one main HTML entry and supporting assets

## Constitution Check

- The current `constitution.md` file is a placeholder and does not define explicit implementation gates.
- No architecture violations are detected for a hybrid wrapper approach.
- Gate: Confirm that the hybrid Android wrapper preserves the app's existing browser-based features and that no native-only platform restrictions are introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-android-app-roadmap/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── android-webview.md
└── tasks.md  # Phase 2 output /speckit.tasks
```

### Source Code (repository root)

```text
.
├── index.html
├── app.py
├── app_html.py
├── README.md
├── requirements.txt
├── logo.jpg
├── constitution.md
├── .github/
└── .specify/
```

**Structure Decision**: Use the existing static HTML app as the web asset source and create a Capacitor Android wrapper. The root web project remains unchanged as a static frontend, while Capacitor introduces a new `android/` platform directory and a `www/` bundle for the wrapped assets.

## Complexity Tracking

No constitution violations identified. The chosen hybrid wrapper is the simplest viable path given the existing static HTML app and Google Play distribution requirement.
