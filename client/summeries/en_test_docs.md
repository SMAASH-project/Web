# SMAASH — Testing Documentation

> This document covers the automated test suite and manual test scenarios for every feature area of the SMAASH client. It focuses on edge cases, improper inputs, and boundary conditions — situations where the system must behave correctly even when the user does not.

---

## Running Automated Tests

```bash
cd client
npm run test          # Run all tests once
npm run test:watch    # Watch mode — re-runs on file change
npm run test:coverage # Coverage report
```

Tests use **Vitest** + **@testing-library/react**. The test runner is configured in `vite.config.ts` under the `test` key.

---

## Automated Test Coverage

### `ErrorBoundary.test.tsx`

Tests the React error boundary component (`src/components/ErrorBoundary.tsx`).

| Test | What it verifies |
|---|---|
| Renders fallback UI when child throws | When a child component throws, the boundary catches it and renders "Something went wrong on this page." along with the error message |
| Renders custom fallback when provided | When a `fallback` prop is provided, the boundary renders that custom element instead of the default message |

Both tests suppress `console.error` during the render to keep test output clean, since React logs caught errors to the console by default.

### `RequireAuth.test.tsx`

Tests the route guard component (`src/components/RequireAuth.tsx`) that protects all `/app/*` routes.

| Test | What it verifies |
|---|---|
| Renders protected route when authenticated | When `AuthContext.isLoggedIn` is `true`, the protected route renders normally |
| Redirects to login when unauthenticated | When `isLoggedIn` is `false` and `isInitializing` is `false`, navigating to a protected route redirects to `/app/login` |
| Shows loading state during auth initialization | When `isInitializing` is `true`, a spinner is shown instead of a redirect — this prevents a redirect flash before the auth check completes |

### `ItemFilters.test.tsx`

Tests the filter chip component used in the Webstore (`src/pages/webstore/components/ItemFilters.tsx`).

| Test | What it verifies |
|---|---|
| Calls onSelect with the clicked option | When a filter option is clicked, the `onSelect` callback is called with the exact string value of that option |

The `useSettings` context is mocked with a fixed settings object since the test is only verifying callback behavior, not theming.

---

## Manual Test Scenarios

### Sign Up (`/app/signup`)

| Scenario | Input | Expected behavior |
|---|---|---|
| Empty email | Submit with empty email field | HTML5 form validation prevents submission; browser shows "fill in this field" prompt on the email input |
| Invalid email format | `"notanemail"` or `"user@"` | HTML5 `type="email"` validation prevents submission; browser shows format error |
| Empty password | Submit with empty password | HTML5 `required` prevents submission |
| Password too short | Password with 1–7 characters | Client-side error shown before API call: "Password is too short" (or equivalent translated message); form does not submit |
| Passwords do not match | Password: `"password123"`, Confirm: `"different"` | Client-side error shown: "Passwords do not match"; form does not submit |
| Correct passwords, mismatch corrected | Fix confirm password to match | Error clears immediately on input; form submits normally |
| Duplicate email address | Email already registered in the system | Server returns error; message extracted and shown in the form error alert |
| Valid registration | All fields correct, unique email, password ≥ 8 chars | Success: redirected to `/app/login` |

### Login (`/app/login`)

| Scenario | Input | Expected behavior |
|---|---|---|
| Empty fields | Submit with empty email or password | HTML5 `required` prevents submission |
| Invalid email format | `"notanemail"` | HTML5 `type="email"` validation prevents submission |
| Wrong credentials (1st–4th attempt) | Valid email format, wrong password | Vague error: "Invalid credentials" (never reveals which field is wrong); remaining attempt counter shown: "X attempts remaining before a temporary lockout" |
| Wrong credentials (5th attempt) | Any wrong password after 4 failures | 30-second client-side lockout activates; form inputs and submit button disabled; button label shows `Locked (30s)` counting down |
| During lockout | Any input | Submitting is blocked entirely; countdown continues in the button label |
| Lockout expires | Wait 30 seconds | Counter reaches 0, form re-enables, attempt counter resets to 0 |
| Banned account (temporary ban) | Correct credentials for a banned user | Error: "Your account is banned until [date]." — ban expiry date shown |
| Banned account (permanent ban) | Correct credentials for a permanently banned user | Error: "Your account has been permanently banned." |
| Valid credentials | Correct email and password | Redirected to `/app/profile-selector`; if arriving from a protected page, redirected back to the original destination |

### Password Reset (`/app/reset-password`)

| Scenario | Input | Expected behavior |
|---|---|---|
| Invalid email format | `"notanemail"` | HTML5 `type="email"` validation prevents submission |
| Empty email | Submit without entering email | HTML5 `required` prevents submission |
| Any valid email submitted | Any properly formatted email | Form submits successfully; info message shown: feature is not available (password reset is not wired to a backend endpoint); form input and button become disabled |

> **Note:** The password reset flow is a UI placeholder. Submitting does not send any email or trigger any backend request. The button is permanently disabled after the first submission to prevent repeated attempts.

### Profile Update — Edit Sheet (`/app/profile`)

The profile edit sheet is opened by clicking "Edit Profile" on the Profile page.

| Scenario | Input | Expected behavior |
|---|---|---|
| No changes made | Open sheet, do not modify anything | Save button is disabled; clicking it does nothing |
| Display name at limit | Enter exactly 20 characters | Input accepts the 20th character; the 21st is rejected by `maxLength` without any error |
| Display name over limit | Attempt to type more than 20 characters | Input silently stops accepting characters at 20; no error shown |
| Email over limit | Attempt to type more than 30 characters | Input silently stops accepting characters at 30; no error shown |
| Invalid email format in email field | `"notanemail"` | The input uses `type="email"` — the browser may or may not enforce format here; server will reject on save if format is wrong |
| Duplicate email address | Change email to one already used by another account | Server returns error; error message displayed in the sheet's error panel with a red alert icon |
| Valid changes | Modify display name or email to new valid values | Save button becomes enabled; clicking saves both changed fields in parallel; brief success indicator shown; sheet auto-closes after ~900ms |
| Password field | Attempt to type in the password field | Field is disabled and read-only; a link beneath it navigates to `/app/reset-password` |

### Webstore (`/app/webstore`)

| Scenario | Input | Expected behavior |
|---|---|---|
| Item costs more than user's coins | Browse items where `item.price > userCoins` | Purchase button shows "Can't afford" text and is disabled (`disabled={!canAfford}`); price displayed in red; coin icon turns red |
| Item is already owned | View an owned item | Purchase button is replaced with an "Owned" indicator (green checkmark + "Owned" text); no purchase action possible |
| Purchasing in progress | Click purchase on an affordable, unowned item | Button shows a spinner icon and "Unlocking..." text; button disabled while the mutation is pending |
| Filter by rarity | Select "Rare" from the rarity filter | Only Rare items displayed; other items hidden |
| Filter by combat type | Select "Melee" | Only Melee items displayed |
| Filter returns no results | Apply filters that match no items | Empty state shown |
| Search by name | Type a name in the search bar | Items filtered in real time as characters are typed |
| Admin item management without admin role | Log in as non-admin user | Edit and delete buttons not rendered on item cards (controlled by `isAdmin` from `AuthContext`) |

### Admin Panel (`/app/admin`)

Access requires admin role; non-admin users are redirected away at the route level.

| Scenario | Input | Expected behavior |
|---|---|---|
| Search for non-existent user | Type a name that no user has | Empty user list; no "no results" error — list simply shows nothing |
| Ban with no reason | Apply ban without entering a reason | Ban is allowed; reason is optional |
| Ban already banned user | Attempt to ban a user who is already banned | UI shows the current ban expiry in the UserDetail panel; a new ban can be applied, replacing the old one |
| Unban a non-banned user | Attempt to unban a user with no active ban | Unban button should be disabled or absent for users who are not currently banned |
| Promote user to admin | Click Promote on a non-admin user | User's role updated to admin; role badge in UserDetail updates |
| Demote admin to user | Click Demote on an admin user | Role updated; admin access removed for that user on their next session |

### Gallery — OST Player (`/app/gallery` → OST tab)

| Scenario | Input | Expected behavior |
|---|---|---|
| Drag scrubber to start | Drag progress scrubber fully to the left | Playback position snaps to 0:00 |
| Drag scrubber to end | Drag progress scrubber fully to the right | Playback position snaps to the track's full duration |
| Drag scrubber while pointer leaves the element | Start drag, move pointer outside the scrubber bar | `setPointerCapture` keeps the drag active; position continues to update until pointer is released |
| Volume at zero | Drag volume slider fully to the left | Volume reaches 0; mute icon displayed |
| Volume at maximum | Drag volume slider fully to the right | Volume reaches 1.0 (full volume) |
| Mute toggle | Click the speaker/mute icon | Audio muted or unmuted; icon toggles between speaker variants |
| Click a track in the track list | Click any track name | Track changes immediately; playback starts from the beginning of the new track |
| Play/pause toggle | Click the play button, then pause | Audio starts and stops correctly; icon toggles between play and pause |

### Route Protection

| Scenario | Condition | Expected behavior |
|---|---|---|
| Access protected route without session | Navigate to any `/app/*` route while not logged in | Redirected to `/app/login`; the original URL is stored in `location.state.from` so the user is returned after login |
| Access admin-only route as regular user | Navigate to `/app/admin` or `/app/debug` while logged in as a non-admin | Redirected away; page content never renders |
| Auth check in progress | Page loads while `AuthContext.isInitializing` is `true` | Spinner shown instead of redirect; prevents premature redirect before session is confirmed |
| Session expires mid-session | Make any API request after session cookie expires | `apiClient` 401 interceptor fires; user redirected to `/app/login` automatically |

### Settings Persistence

| Scenario | Action | Expected behavior |
|---|---|---|
| Refresh after changing theme | Change to dark mode, refresh the page | Dark mode persists (stored in `localStorage` under `settings`) |
| Refresh after changing colors | Set custom gradient colors, refresh | Colors persist (stored under `color-settings`) |
| Switch device / clear storage | Log in from a different browser or clear localStorage | Settings reset to defaults; theme and colors must be reconfigured |
| Multiple tabs | Open app in two tabs, change settings in one | Settings change is isolated to that tab's localStorage write; the other tab does not update in real time |

---

## Vitest Configuration

Tests run with `jsdom` as the test environment (configured in `vite.config.ts`). Global test utilities (`describe`, `it`, `expect`, `vi`) are available without imports. `@testing-library/jest-dom` matchers (e.g., `toBeInTheDocument`) are set up in the Vitest setup file.

To add a new test file, create a `.test.tsx` (or `.test.ts`) file anywhere under `src/`. Vitest automatically picks it up.
