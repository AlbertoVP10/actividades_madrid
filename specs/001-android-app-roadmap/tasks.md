# Tasks: Android App Roadmap from index.html

**Input**: Design documents from `specs/001-android-app-roadmap/`
**Prerequisites**: `specs/001-android-app-roadmap/plan.md`, `specs/001-android-app-roadmap/spec.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: understand the current profile and contact UI in `www/index.html` before implementing the new settings screen.

- [ ] T001 Review `www/index.html` and locate the current `profileView`, contact block, and email/notification state management
- [ ] T002 Review `www/index.html` and locate the onboarding and preferences panel markup used for post-onboarding preference editing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: prepare the profile layout and view structure so the new settings panel integrates cleanly.

- [ ] T003 [P] Add a settings icon button to the profile header in `www/index.html`
- [ ] T004 [P] Add a hidden `profileSettings` view container to `www/index.html` for the new settings screen
- [ ] T005 [P] Ensure the profile view has enough bottom padding to avoid overlapping the sticky bottom navbar in `www/index.html`

---

## Phase 3: User Story 3 - Improve mobile UI/UX (Priority: P2)

**Goal**: implement the profile settings screen and update the contact section text in `www/index.html`.

**Independent Test**: open the app in mobile view, tap the profile settings icon, and verify the new settings screen appears with editable profile fields, communication toggles, location permission, legal links, and account actions. Validate the contact buttons show the requested secondary text.

- [ ] T006 [US3] Add profile edit fields for email, gender, and phone in `www/index.html` under the new `profileSettings` screen
- [ ] T007 [US3] Add communication preferences toggles for notifications and email in `www/index.html` under `profileSettings`
- [ ] T008 [US3] Add a location permission switch in `www/index.html` under `profileSettings` with explanatory text
- [ ] T009 [US3] Add legal links/buttons for `Términos y condiciones` and `Política de privacidad` in `www/index.html` under `profileSettings`
- [ ] T010 [US3] Add account management actions for `Borrar cuenta` and `Salir` in `www/index.html` under `profileSettings`
- [ ] T011 [US3] Update the contact section in `www/index.html` so:
  - `Sugerencias` shows secondary text `Envíanos tus ideas`
  - `Reportar Error` shows secondary text `Ayúdanos a mejorar`
  - `Colabora con nosotros` shows a call-to-action secondary text to develop the app or send activities
- [ ] T012 [US3] Implement `openProfileSettings()` in `www/index.html` to show the new settings screen and hide the main profile view
- [ ] T013 [US3] Implement `saveProfileSettings()` in `www/index.html` to persist settings to `localStorage` and return to the profile overview
- [ ] T014 [US3] Implement `deleteAccount()` and `logout()` handlers in `www/index.html` that clear relevant local state and/or navigate back to the guest profile state

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: validate the new profile settings flow and update any supporting UI/UX details.

- [ ] T015 [P] Add accessibility labels and descriptive `aria` hints to the new settings screen inputs and action buttons in `www/index.html`
- [ ] T016 [P] Add inline comments in `www/index.html` documenting the new profile settings flow and contact text updates
- [ ] T017 [P] Validate the final profile experience in mobile view and confirm the contact section displays the requested secondary text
- [ ] T018 [P] Confirm the new profile settings screen does not break the existing `homeView`, `listView`, or bottom navigation flow

---

## Dependencies & Execution Order

- Phase 1 tasks must complete before the profile settings implementation begins.
- Phase 2 tasks must complete to ensure the new profile settings panel is integrated cleanly.
- Phase 3 tasks implement the new profile and contact UI.
- Phase 4 tasks polish and validate the final result.

### Parallel opportunities

- `T003`, `T004`, and `T005` can run in parallel as layout preparation tasks.
- `T015`, `T016`, `T017`, and `T018` can run in parallel after the UI implementation is complete.
