# Admin Panel — Frontend Implementation Summary

## Overview

A full admin user-management panel was built from scratch and integrated into the
existing React + TypeScript client. All new code follows the project's established
patterns: theming via `themeClasses.ts` helpers, React Query for data fetching,
and the Settings context for dark/light/liquid-glass mode.

---

## Route & Auth Guard

- Route: `/app/admin`
- `AdminPage.tsx` checks `AuthContext.isAdmin` before rendering. Non-admins see
  `<NotFoundPage />` — the route is indistinguishable from a real 404.
- While auth is still initialising a spinner is shown (same as `App.tsx`).

---

## Navbar Integration

### Desktop (`Navbar.tsx`)
An **Admin** button (shield icon + label) appears in the top-left slot of the
navbar, but only when `isAdmin === true`. Hidden entirely from regular users.

### Mobile (`MobileNavMenu.tsx`)
An **Admin Panel** entry (same icon) is added to the Account section of the
mobile drawer sheet, also gated on `isAdmin`.

---

## Page Layout

The page mirrors the Settings/Profile page structure exactly:
`min-h-screen` wrapper → absolute Navbar → `flex-1` content div with
`items-center justify-center`. On small screens `pt-20` clears the navbar;
on `xl+` true centering takes over.

The outer card uses `getBackgroundClasses` and has `rounded-xl`.

### Three-panel layout (responsive)
| Column | Width | Content |
|--------|-------|---------|
| Left | `xl:w-72` | User list + search bar |
| Centre | `flex-1` | Selected user detail + account stats |
| Right | `xl:w-60` | User's profiles, selectable |

Stacks vertically on smaller screens.

---

## Components & Files

```
src/
  hooks/
    useAdminHooks.ts          — React Query hooks for users, ban, unban
  components/
    nav/
      Navbar.tsx              — Admin button added (desktop)
      MobileNavMenu.tsx       — Admin Panel link added (mobile drawer)
    pages/profileDependents/admin/
      AdminPage.tsx           — Auth guard + page wrapper
      adminComponents/
        AdminPageContent.tsx  — Three-panel card layout
        UserList.tsx          — Scrollable user list + search input
        UserListItem.tsx      — Single user row with ban indicator
        UserDetail.tsx        — Selected user header + account stats
        ProfilesPanel.tsx     — User's profiles, clickable
        ban/
          BanDialog.tsx       — Full ban modal
          BanPresetCard.tsx   — Individual preset option card
          BanCustomRange.tsx  — Calendar + time spinners + date inputs
      adminLogic/
        useAdminPageLogic.ts  — All state and theming for the main page
        useBanDialogLogic.ts  — All state for the ban dialog
  components/ui/
    calendar.tsx              — Custom shadcn-compatible range calendar
```

---

## User List

- Fetches all users via `GET /api/users` (see `useAdminHooks.ts`).
- Client-side search filters by `username` and `email` until the backend
  supports `?search=` (see `BACKEND_NOTES.md §1`).
- Banned users show a small red ban icon in their row.
- Clicking a user loads their detail in the centre panel and their profiles
  in the right panel. Selecting a profile updates the avatar and stats shown
  in the centre.

---

## Role Badges

`UserDetail.tsx` maps the backend's three role strings to semantic badges:

| Role string | Colour | Icon |
|-------------|--------|------|
| `"admin"` | Purple | Shield |
| `"support"` | Sky blue | Headphones |
| `"user"` (default) | Neutral gray | Users |

The same badge appears in both the header card and the Role stat card.
Colours are intentionally fixed (not theme-dependent) because they are
identity labels, not UI chrome.

> **Note:** Badges currently show blank/wrong because the backend does not
> preload the Role association in `ReadAll` / `ReadByID`. See `notestobackend.md`.

---

## Ban Dialog

Opened by clicking **Ban User** on the selected user's header card.
Closes and shows **Unban** button if the user is already banned.

### Left column
- **Permanent ban** card — red-tinted, full-width
- **Timeouts** grid (1h / 12h / 24h)
- **Timed bans** grid (7d / 31d / 365d)
- **Reason** section — preset chips (8 common reasons) + free-text textarea.
  Chips and textarea share the same state; clicking a chip fills the textarea.
  Reason is optional — omitting it sends no reason field.

### Right column
- **Calendar** (custom `<Calendar mode="range" />`) — click once to set start,
  click again to set end. Clicking before the start moves the start; clicking
  after moves the end. Past dates are blocked (`fromDate={new Date()}`).
- **Starts / Ends panels** side by side — readable date label + `dd/mm/yyyy`
  text input (validates on blur/Enter) + HH:MM time spinners with `+`/`−`
  buttons and wrap-around clamping.
- **Summary pill** — shows the final ban-until datetime once both dates are set.

Preset clicks update the calendar range automatically as a preview.
Time values are preserved when the calendar date changes.

### Confirm button
Red and active only when a preset is selected (or both custom dates are set).
Passes `ban_type`, optional `ban_until` (ISO 8601), and optional `reason` to
the mutation.

---

## Calendar (`src/components/ui/calendar.tsx`)

Self-contained, no `react-day-picker` dependency. Supports `single` and `range`
modes. Themed via `getBackgroundClasses`, `getButtonClasses`, `getTextColor`,
`getSubtextColor`. Range highlight is a connected pill bar — `rounded-l-full`
on start, `rounded-r-full` on end, flat sides on interior cells so the bar
connects flush. Syncs view month/year when `selected.from` changes externally
(e.g. a preset click).

---

## Theming

Every component uses only the functions exported from
`src/lib/utils/themeClasses.ts`:

- `getBackgroundClasses` — card/panel backgrounds
- `getButtonClasses` — buttons, preset cards, avatar fallbacks, time spinners
- `getInputClasses` — search bar, date text inputs, time spinner inputs, textarea
- `getTextColor` / `getSubtextColor` / `getTextShadow` — all text
- `getDialogClasses` / `getDialogFooterClasses` — ban modal

No raw inline `useLiquidGlass ? useDarkMode ? "..." : "..." : ...` ternaries.

---

## What Still Needs Backend Work

See `BACKEND_NOTES.md` for the full spec. Summary:
- Role preload missing from `ReadAll` and `ReadByID` (see `notestobackend.md`)
- `username` and `ban_until` fields missing from `UserReadDTO`
- Ban / unban endpoints do not exist yet
- `?search=` query param not supported on `GET /api/users`
- Ban reason field not stored anywhere
