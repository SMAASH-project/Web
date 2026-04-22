# Developer Documentation — Improvements & Corrections

Audit of `client/summeries/en_dev_docs.md` against the actual codebase (April 2026). All items below refer to things that should be fixed or added in the documentation itself.

---

## 1. Factual Corrections

### Project Layout — `context/` description
The layout table describes `context/` as "React contexts and their providers." This is misleading. `src/context/` only holds `AuthProvider`, `AuthContext`, `SecurityKeyProvider`, `SecurityKeyContext`, `NavbarProvider`, and `NavbarContextUtils`. The providers for `Settings`, `Color`, and `Profiles` live in their respective page directories:

- `src/pages/settings/SettingsContext.tsx`
- `src/pages/settings/ColorProvider.tsx`
- `src/pages/settings/ColorContext.ts`
- `src/pages/profile-selector/ProfilesContext.tsx`

The layout section should either split the description into two bullet points or add a note clarifying that feature-local providers live alongside their pages.

### Routes — Missing pages
The routing section shows only `ReleasesPage` as an example. `AdminPage`, `DebugPage`, and `LeaderboardPage` are never named anywhere in the docs, despite being full lazy-loaded routes in `main.tsx`. The complete route table should list all destinations under `/app/`.

### Username Generator — Wrong counts
Line ~499: the docs state **116 adjective prefixes** and **113 animal-sound or nature suffixes**. Actual counts in `generateUsername.ts` are **110 prefixes** and **109 suffixes**.

### `MotionWrapper` — Incomplete input description
The docs describe `MotionWrapper` as reading `animationSpeed` from debug settings to scale `motion/react` transition durations. It also reads `forceReducedMotion` (from debug settings) and `useAnimations` (from `SettingsContext`) to decide whether to fall back to instant transitions entirely. The docs should mention these two additional inputs and describe the fallback behaviour: when either flag disables animations, `MotionWrapper` passes `duration: 0` to all child transitions regardless of the speed slider.

---

## 2. Missing Coverage

### Hooks
The `src/hooks/` directory contains three files not mentioned anywhere in the docs:

| File | Purpose |
|---|---|
| `useAdmin.ts` | Admin-related queries and mutations (ban, unban, user management) |
| `useDebug.ts` | Hits debug-specific API routes; notably does **not** pass responses through `validateKnownApiResponse`, making it the only hook that bypasses the schema validation layer |
| `useScrollDirection.ts` | Returns `"up"` / `"down"` based on scroll position; used by the navbar to hide/show on scroll |

These should each get at least a short section under the Hooks chapter, consistent with how `useAuth.ts` and `useProfile.ts` are covered.

### Utility Files
The following files under `src/lib/utils/` are absent from the docs:

| File | Purpose |
|---|---|
| `classnames.ts` | Conditional class name joining (thin wrapper, but referenced widely) |
| `extractErrorMessage.ts` | Pulls a human-readable string from Axios errors or unknown throws; used in mutation `onError` handlers |
| `dateFormat.ts` | Locale-aware date formatting helpers used across news and releases pages |
| `liquidGlass.ts` | Computes CSS values for the liquid-glass visual effect; consumed by `ColorProvider` |
| `sectionStyle.ts` | Returns a consistent style object for page section containers; used by most feature pages |

`themeClasses.ts` and `colorMath.ts` are already documented. The five above are not. At minimum the docs should list them in the Utilities section with a one-line description each so developers know they exist before writing their own versions.

### Page-specific hooks and logic
The docs describe each page at the route level only. Pages contain substantial internal hooks that are undocumented:

- **News:** `useNewsPosts`, `useNewsForm`, `useNewsCategoryFilter`
- **Admin:** `useAdminPageLogic`, `useBanDialogLogic`
- **Releases:** `useReleases`
- **Webstore:** `useItems`, `ItemFilters` and related filter utilities
- **Profile selector:** `useProfiles`
- **Debug:** tab system, per-tab debug utility modules
- **Gallery:** `ostTracks.ts` — defines the music track list used by the gallery audio player

Adding a subsection per page that describes its primary internal hooks would make the docs usable as a reference for developers working inside a specific feature.

### `GoogleReCaptchaProvider` scope
The docs describe `RootLayout` without noting that `GoogleReCaptchaProvider` is intentionally scoped only around `SignUpPageInner` inside `SignUpPage.tsx` — not at the layout level. This is a deliberate architectural decision (avoids loading the reCAPTCHA script on every page) and should be documented in the Authentication or Entry Points section so future developers don't accidentally promote it to the root level.

---

## 3. Items to Remove

### Entire "Suggested Codebase Improvements" section (previous version)
The previous version of this file contained a "Suggested Codebase Improvements" section covering: renaming the `summeries` directory, consolidating providers into `src/context/`, centralising API schema validation, unifying the password reset flow, cleaning up animation z-indexing, and extracting the reCAPTCHA site key into `.env`. These are project-level code changes, not documentation issues. They should be tracked in issues or a separate internal document, not here.
