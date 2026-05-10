# Tasks: Android App Roadmap from index.html

**Input**: Design documents from `specs/001-android-app-roadmap/`
**Prerequisites**: `specs/001-android-app-roadmap/plan.md`, `specs/001-android-app-roadmap/spec.md`, `specs/001-android-app-roadmap/research.md`, `specs/001-android-app-roadmap/data-model.md`, `specs/001-android-app-roadmap/quickstart.md`, `specs/001-android-app-roadmap/contracts/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: initialize the Capacitor Android wrapper and prepare the web asset delivery path

- [X] T001 [P] Create `www/` and copy the main web app entry from `index.html` to `www/index.html`
- [X] T002 [P] Install Capacitor CLI and core packages in the repository root (`package.json` / `package-lock.json`)
- [X] T003 [P] Initialize Capacitor with app id `com.myapp.id` and app name `Madrid Explore` in `capacitor.config.json`
- [X] T004 [P] Add the Android platform using `npx cap add android` so `android/` exists
- [X] T005 [P] Create local asset folders under `www/` for CSS, JS, fonts, and icons to reduce CDN dependency
- [X] T006 [P] Copy or bundle remote dependencies into `www/` where possible: Tailwind, Leaflet, Material Symbols, and Google Fonts fallbacks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: configure the Android app manifest, permissions, and local web wrapper stability

- [X] T007 Configure `android/app/src/main/AndroidManifest.xml` with `android.permission.INTERNET`
- [X] T008 Configure `android/app/src/main/AndroidManifest.xml` with `android.permission.ACCESS_FINE_LOCATION` and `android.permission.ACCESS_COARSE_LOCATION`
- [X] T009 Update `capacitor.config.json` to use `webDir: "www"` and confirm `appId: "com.myapp.id"`
- [X] T010 Create a native Android splash screen and icon assets in `android/app/src/main/res/mipmap-*/` and `android/app/src/main/res/drawable/`
- [X] T011 Add WebView-friendly configuration in `android/app/src/main/AndroidManifest.xml` and `android/app/src/main/res/xml/network_security_config.xml` if needed
- [X] T012 [P] Create `specs/001-android-app-roadmap/contracts/android-webview.md` to document WebView compatibility requirements and permissions
- [X] T013 [P] Validate that `www/index.html` loads locally in a browser and that `npx cap copy android` successfully syncs assets

---

## Phase 3: User Story 1 - Review current app quality (Priority: P1) 🎯 MVP

**Goal**: audit `index.html` for mobile compatibility, performance, and WebView readiness

**Independent Test**: confirm the audit findings and fixes by executing the app locally in mobile emulation and verifying the documented issues are addressed

- [X] T014 [US1] Review `index.html` and document mobile responsiveness issues in `specs/001-android-app-roadmap/research.md`
- [X] T015 [US1] Fix viewport and mobile scaling issues in `www/index.html` and remove hard-coded fixed heights from `#map` / `.map-container`
- [X] T016 [US1] Improve `www/index.html` performance by bundling remote CSS/JS dependencies locally or providing graceful fallback messaging for network failure
- [X] T017 [US1] Ensure `localStorage` usage for `madridFavorites` is stable in `www/index.html` and compatible with Android WebView
- [X] T018 [US1] Test `www/index.html` in Chrome mobile emulation and document results in `specs/001-android-app-roadmap/research.md`

---

## Phase 4: User Story 2 - Define a transition roadmap (Priority: P1)

**Goal**: create a concrete Android packaging plan and developer guidance for Google Play

**Independent Test**: verify the roadmap content by checking that all required Android packaging steps and Google Play requirements are listed and actionable

- [X] T019 [US2] Finalize `specs/001-android-app-roadmap/quickstart.md` with step-by-step Capacitor install, build, and Android emulator guidance
- [X] T020 [US2] Document `com.myapp.id` package configuration, manifest requirements, and permission rationale in `specs/001-android-app-roadmap/quickstart.md`
- [X] T021 [US2] Create a Google Play deployment section in `specs/001-android-app-roadmap/quickstart.md` describing app signing, bundletool, and store listing checks
- [X] T022 [US2] Update root `README.md` with a new Android transition summary and link to `specs/001-android-app-roadmap/quickstart.md`
- [X] T023 [US2] Create `specs/001-android-app-roadmap/contracts/android-webview.md` with fallback behavior and testing expectations for the Android WebView

---

## Phase 5: User Story 3 - Improve mobile UI/UX (Priority: P2)

**Goal**: modernize the UI so the app feels like a polished Android experience

**Independent Test**: verify the UI changes by running the app in an Android emulator and confirming improved navigation, spacing, and touch behavior

- [X] T024 [US3] Refactor the top app bar and bottom navigation in `www/index.html` to use mobile-native spacing, larger touch targets, and improved icon clarity
- [X] T025 [US3] Add safe area padding and status bar-friendly spacing in `www/index.html` for Android display
- [X] T026 [US3] Improve filter modal and detail modal usability in `www/index.html` by increasing tap areas and adding clear close actions
- [X] T027 [US3] Enhance the loading spinner experience in `www/index.html` and ensure it renders smoothly on Android WebView
- [X] T028 [US3] Update map interactions in `www/index.html` so gestures and scrolling do not conflict with the fixed `.map-container`

---

## Phase 6: User Story 4 - Produce documentation and developer guidance (Priority: P3)

**Goal**: deliver clear developer docs, inline comments, and deployment instructions

**Independent Test**: validate docs by asking a new developer to follow `README.md` and `specs/001-android-app-roadmap/quickstart.md` to run and build the Android app

- [X] T029 [US4] Add Android wrapper setup notes to root `README.md` describing Capacitor, package name, and where the app entry lives
- [X] T030 [US4] Document the Android WebView contract in `specs/001-android-app-roadmap/contracts/android-webview.md`
- [X] T031 [US4] Add inline comments to `www/index.html` explaining mobile-specific code, offline fallbacks, and permission behavior
- [X] T032 [US4] Add troubleshooting guidance to `specs/001-android-app-roadmap/quickstart.md` for emulator issues, permission prompts, and remote asset failures
- [X] T033 [US4] Create `specs/001-android-app-roadmap/README-android.md` summary for future Android contributors

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: finalize app quality, ensure documentation completeness, and validate Android WebView behavior

- [X] T034 [P] Validate `www/index.html` inside the Android emulator and record compatibility issues in `specs/001-android-app-roadmap/research.md`
- [X] T035 [P] Verify all bottom navigation buttons in `www/index.html` work inside the Android WebView
- [X] T036 [P] Verify `Leaflet` map rendering, gestures, and marker interactions inside `www/index.html` on Android
- [X] T037 [P] Confirm that `localStorage` favorites persist across app restarts in the Android wrapper
- [X] T038 [P] Review and finalize `specs/001-android-app-roadmap/quickstart.md` and `README.md` for publication readiness

---

## Dependencies & Execution Order

- Setup Phase 1 tasks can start immediately.
- Foundational Phase 2 tasks must complete before user story implementation begins.
- User stories can progress in parallel after Phase 2 is complete.
- Polish tasks depend on completing the user stories and the Android WebView validation.

### Parallel opportunities

- `T002`, `T003`, `T005`, `T006`, `T012`, and `T013` are parallelizable.
- Documentation tasks `T019`, `T020`, `T021`, `T022`, `T029`, `T030`, `T032`, and `T033` can be executed in parallel.
- Android validation tasks `T034` through `T038` can run in parallel once the wrapper is installed.

### MVP scope

- MVP: Complete Phase 1, Phase 2, and User Story 1.
- Production-ready app: complete User Stories 2, 3, 4, and Phase 7.
