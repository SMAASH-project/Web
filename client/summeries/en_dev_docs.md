# SMAASH Client — Developer Documentation (Consolidated)

Last updated: 2026-04-02

## 1) Stack and architecture

- React 19 + TypeScript + Vite
- Tailwind CSS 4 + shared theme helpers (`src/lib/utils/*`)
- Motion (`motion/react`) for transitions and UI animation
- React Query + Axios for API state and transport
- i18next (`en` / `hu`) for localization

Main structure:

- `src/main.tsx`: routes, lazy loading, route error boundaries
- `src/RootLayout.tsx`: providers, query client, persistence, toaster
- `src/Wrapper.tsx`: theme gradient + CSS variables + animated backgrounds
- `src/hooks/*`: domain query/mutation hooks
- `src/pages/*`: feature pages

## 2) Routing and auth model

- Public routes: login, signup, reset-password
- Protected routes: all app pages under `/app/*` via `RequireAuth`
- Role-gated pages:
  - `/app/admin`: admin only
  - `/app/debug`: admin + support

Notes:

- Core auth pages are eager-loaded.
- Feature pages are lazy-loaded with `Suspense` fallback.

## 3) Provider and state layering

Provider order:

1. React Query persist provider
2. `AuthProvider`
3. `SettingsProvider`
4. `NavbarProvider`
5. `ColorProvider`
6. `ProfileProvider`

Key persisted states:

- UI settings (`settings`)
- color + animation settings (`color-settings`)
- selected profile per user (`selected_profile_<userId>`)

## 4) Theme and visual system

- Unified helpers in `src/lib/utils/themeClasses.ts` and related modules.
- CSS variables generated from gradient colors:
  - `--theme-accent`
  - `--theme-accent-hover`
  - `--theme-accent-soft`
  - `--theme-nav-border`
  - `--theme-nav-shadow`

Primary flags:

- `useLiquidGlass`
- `useDarkMode`
- `useAnimations`
- `animationOverride`

## 5) Animation/background system

- Backgrounds are keyed by `AnimationKey` and selected in `AnimatedBackground`.
- `animationOverride` modes:
  - `null`: follow theme default
  - `none`: disable
  - specific key: force one effect
  - `custom`: render layered effect mix (`CompositeBackground`)

Performance notes:

- Deferred background fade-in on heavy card pages
- Crossfade when switching background effect
- Static-frame behavior when animations are paused

## 6) API and query conventions

`apiClient`:

- base URL `/api`
- `withCredentials: true`
- centralized 401 handling and redirect behavior

React Query:

- shared key factories (`queryKeys.ts`, feature key maps)
- stale/cache windows tuned per feature
- invalidate on write operations for consistency

## 7) Page-level implementation highlights

### Admin panel

- User list, detail, profile panel, ban dialog
- Role-aware UI and moderation actions
- Search currently client-side fallback until backend query support is complete

### Debug panel

- Tabs: system, cache, endpoints, game data, sight
- Internal endpoint testing and cache inspection tools

### Profile

- Update sheet fully wired for display name + email edits
- Password change remains backend-blocked in this flow
- Stats/match history section scaffolded; match API dependency remains

### Webstore

- Item querying, purchase mutation, ownership merge from purchases
- Coin balance wired from selected profile context

## 8) i18n design

- Namespace-based locale files in:
  - `src/locales/en/*`
  - `src/locales/hu/*`
- Language kept in settings and synced to i18next.

## 9) Performance and optimization status

Implemented:

- route-based lazy loading
- suspense fallback for chunked routes
- manual vendor chunking in Vite
- build stats generation
- query behavior tuning

Backlog:

- image format optimization (WebP/AVIF)
- virtualization for large data grids/lists where needed
- optional PWA/offline strategy if product scope requires

## 10) Known backend dependencies / blockers

- Profile match history endpoint needed for real stats and history rows
- Password change endpoint needed for in-profile password update
- Admin user search/pagination parity improvements
- Role preload consistency on user list/detail endpoints (server-side)

## 11) Conventions for contributors

- Reuse shared theme helpers; avoid inline theme ternary duplication.
- Use typed React Query hooks for all API calls.
- Keep role checks explicit at route/page entry points.
- Keep docs and translation keys in sync with UI changes.
