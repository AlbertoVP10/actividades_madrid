# Tasks: Android App Roadmap - Enhanced Features

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

## Phase 7: User Story 5 - Multi-selection Filters (Priority: P1) 🎯 MVP

**Goal**: implement multi-selection in district, audience, category, and time filters with proper state management

**Independent Test**: verify that multi-selection works correctly by selecting multiple filter options, confirming results are filtered appropriately, and validating that "all" state shows when all or none are selected

- [ ] T034 [P] [US5] Create filter state management for multi-selection in `www/index.html` by updating `currentFilters` to store arrays instead of single values for district, audience, category, and time
- [ ] T035 [P] [US5] Refactor filter UI in `www/index.html` to change dropdown selects to multi-select checkboxes for district, audience, category, and time filters
- [ ] T036 [US5] Update `applyFilters()` function in `www/index.html` to handle multi-selection logic: if no filters selected or all selected, apply no filter for that dimension
- [ ] T037 [US5] Implement visual indication in filter checkboxes showing "all selected" or "none selected" state in `www/index.html`
- [ ] T038 [US5] Test multi-selection filters in `www/index.html` by selecting various combinations and verifying results match expectations
- [ ] T039 [US5] Update filter UI labels and hints in `www/index.html` to guide users on multi-selection behavior (hide "Todos" option but show it when all/none selected)

---

## Phase 8: User Story 6 - KPI Button Filtering (Priority: P1) 🎯 MVP

**Goal**: make KPI cards (Today, This week, Near me) clickable to filter results with active state indication

**Independent Test**: verify that clicking KPI cards filters the results correctly, active state changes appearance, and clicking again clears the filter

- [ ] T040 [P] [US6] Add KPI click handlers and active state tracking in `www/index.html` for "Today", "This week", and "Near me" KPI cards
- [ ] T041 [P] [US6] Implement filter logic in `www/index.html` for "Today" KPI: filter activities with date equal to current date
- [ ] T042 [P] [US6] Implement filter logic in `www/index.html` for "This week" KPI: filter activities within the current 7-day or natural week period
- [ ] T043 [P] [US6] Implement filter logic in `www/index.html` for "Near me" KPI: sort activities by distance when user location is available, with permission handling
- [ ] T044 [US6] Update KPI card styling in `www/index.html` to show active state (border, background change) when filter is applied
- [ ] T045 [US6] Implement toggle behavior in `www/index.html`: clicking active KPI clears the filter and shows all results
- [ ] T046 [US6] Add loading feedback animation in `www/index.html` for KPI filtering operations
- [ ] T047 [US6] Ensure KPI count numbers match filtered results in `www/index.html` after applying KPI filters
- [ ] T048 [US6] Test KPI button filtering in `www/index.html` with various combinations and verify accessibility (aria-labels for screen readers)

---

## Phase 9: User Story 7 - Expired Favorites Cleanup (Priority: P2)

**Goal**: automatically remove expired activities from favorites and keep counter accurate

**Independent Test**: verify that expired activities are removed from favorites, counter updates correctly, and expired items don't appear in favorites section

- [ ] T049 [P] [US7] Add expiration check logic in `www/index.html` to determine if an activity is expired based on date
- [ ] T050 [P] [US7] Implement `cleanupExpiredFavorites()` function in `www/index.html` to filter out expired favorites from localStorage
- [ ] T051 [US7] Call `cleanupExpiredFavorites()` on app initialization and when switching to favorites tab in `www/index.html`
- [ ] T052 [US7] Update favorite count display in `www/index.html` after cleanup to reflect only valid favorites
- [ ] T053 [US7] Display "Finalized" badge or message for expired activities in `www/index.html` if they appear in history
- [ ] T054 [US7] Test favorites cleanup in `www/index.html` by simulating expired activities and verifying they're removed from counter

---

## Phase 10: User Story 8 - Information Section (Priority: P2)

**Goal**: create a dedicated information section with donation, social media, and feedback options

**Independent Test**: verify that info section is accessible, all links are functional, and suggestion form works correctly

- [ ] T055 [P] [US8] Create new "Info" tab in bottom navigation in `www/index.html` alongside Map, List, Favorites, and Profile
- [ ] T056 [P] [US8] Design info section layout in `www/index.html` with donation button, social media links, and feedback form
- [ ] T057 [US8] Add info modal or section content in `www/index.html` with:
  - Donate button linking to donation platform
  - Instagram icon linking to social media
  - Google Play Store link
  - Suggestion/feedback text input or form
- [ ] T058 [US8] Implement suggestion form submission in `www/index.html` (localStorage or API endpoint)
- [ ] T059 [US8] Style info section with Material Design principles and branding consistency in `www/index.html`
- [ ] T060 [US8] Test info section navigation and all links in `www/index.html`

---

## Phase 11: User Story 9 - Consent Banner (Priority: P2)

**Goal**: implement a cookie/privacy consent banner that appears on first load and allows users to configure preferences

**Independent Test**: verify banner appears on first load, user selections are persisted, and configured settings are applied

- [ ] T061 [P] [US9] Create consent banner HTML structure in `www/index.html` with "Accept All", "Reject All", and "Configure" buttons
- [ ] T062 [P] [US9] Implement consent state management in `www/index.html` using localStorage to track user consent preferences
- [ ] T063 [US9] Add consent banner display logic in `www/index.html` to show on first load only (check localStorage)
- [ ] T064 [US9] Implement "Configure" modal in `www/index.html` with toggles for:
  - Technical cookies (required)
  - Analytics cookies
  - Marketing cookies
- [ ] T065 [US9] Add link to privacy policy in consent banner and configure modal in `www/index.html`
- [ ] T066 [US9] Implement blocking behavior: disable app interaction until user makes consent decision in `www/index.html`
- [ ] T067 [US9] Style consent banner and modal with Material Design in `www/index.html` and ensure accessibility
- [ ] T068 [US9] Test consent flow in `www/index.html` by clearing localStorage and verifying banner appears, choices persist on reload

---

## Phase 12: User Story 10 - Highlight Add Button (Priority: P3)

**Goal**: make the "Add" (location) button visually distinct with white background and contrasting border

**Independent Test**: verify the button styling is distinct from other KPI buttons and is easily identifiable as primary action

- [ ] T069 [P] [US10] Update KPI "Add" button styling in `www/index.html` with white background and contrasting border color
- [ ] T070 [US10] Maintain location icon in "Add" button in `www/index.html`
- [ ] T071 [US10] Ensure "Add" button maintains hover and active state visual feedback in `www/index.html`
- [ ] T072 [US10] Test "Add" button visibility and contrast in `www/index.html` against current color palette

---

## Phase 13: User Story 11 - Vibrant Favorites Button (Priority: P3)

**Goal**: enhance favorites button visibility with dynamic styling based on empty/active states

**Independent Test**: verify favorites button changes appearance when favorites are present, and styling is consistent across different states

- [ ] T073 [P] [US11] Add dynamic styling logic in `www/index.html` for favorites button based on favorite count
- [ ] T074 [P] [US11] Style empty state (0 favorites) in `www/index.html`: gray icon with thicker stroke (2px) to maintain visibility
- [ ] T075 [P] [US11] Style active state (1+ favorites) in `www/index.html`: vibrant background color (red/pink), filled heart icon, bold counter
- [ ] T076 [US11] Update `updateFavCount()` function in `www/index.html` to trigger styling updates based on favorite count
- [ ] T077 [US11] Ensure favorites button styling is consistent with overall design system in `www/index.html`
- [ ] T078 [US11] Test favorites button state transitions in `www/index.html` by adding/removing favorites and verifying visual changes

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: finalize feature quality, validate all interactions, and ensure documentation is complete

- [ ] T079 [P] Test all filter combinations in `www/index.html` (multi-select + KPI buttons + existing filters)
- [ ] T080 [P] Verify KPI buttons and filter accuracy in `www/index.html` with various date/location scenarios
- [ ] T081 [P] Test favorites cleanup workflow in `www/index.html` with realistic expiration scenarios
- [ ] T082 [P] Validate consent banner blocking behavior and persistence in `www/index.html`
- [ ] T083 Validate all new features inside the Android emulator with `npx cap run android`
- [ ] T084 Update `specs/001-android-app-roadmap/research.md` with testing results and any WebView compatibility issues
- [ ] T085 Update root `README.md` with new feature descriptions and links to updated documentation
- [ ] T086 Create comprehensive user guide in `specs/001-android-app-roadmap/` documenting all new filter and consent features
- [ ] T087 Add accessibility review: ensure all new interactive elements have proper aria-labels and keyboard support
- [ ] T088 Performance audit: verify no performance degradation from new filter logic and cleanup operations

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1-2**: Must complete before any feature implementation
2. **Phase 3-4**: Original MVP user stories (already completed)
3. **Phase 7-8**: New P1 features (Multi-select filters, KPI filtering) - can run in parallel after Phase 2
4. **Phase 9-11**: P2 features (Expired favorites, Info section, Consent) - can start after Phase 8
5. **Phase 12-13**: P3 features (UI enhancements) - can run in parallel with other phases
6. **Phase 14**: Polish tasks - must complete all feature phases first

### Parallel Opportunities

**Phase 7 (Multi-select filters)**:
- T034, T035, T040-T042 can run in parallel (different filter dimensions)

**Phase 8 (KPI filtering)**:
- T040-T043 are parallelizable (different KPI implementations)

**Phase 9 (Expired favorites)**:
- T049-T050 can run in parallel (independent functions)

**Phase 10 (Info section)**:
- T055-T056 can run in parallel (design and structure)

**Phase 11 (Consent banner)**:
- T061-T062 can run in parallel (structure and state management)

**Phase 12-13 (UI enhancements)**:
- All button styling tasks are parallelizable

**Cross-phase parallelization** (after Phase 8 completes):
- Phase 9, 10, 11, 12, 13 can proceed in parallel as they are independent features

### MVP Scope (Recommended)

**Minimal Viable Product**: Complete Phase 1, 2, 7, 8
- Provides core filter improvements and interactive KPI buttons
- Maximum user value with minimum implementation time

**Production-Ready**: Complete Phase 1-2, 7-11, 14
- Includes all major features with proper compliance and information sections
- Ready for release

**Full Feature Set**: All phases complete

---

## Task Statistics

- **Total Tasks**: 88 (including completed phases)
- **New Tasks (Phase 7-14)**: 55
- **Parallelizable Tasks**: 28
- **Critical Path Tasks**: 24
- **Estimated Effort**:
  - MVP (Phases 7-8): ~40 hours
  - Production (Phases 7-11, 14): ~80 hours
  - Full (All phases): ~100 hours

