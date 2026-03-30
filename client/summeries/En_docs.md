# SMAASH Client — Developer Documentation

> **Stack:** React 19 · TypeScript · Vite · Tailwind CSS · React Query · Axios · react-i18next · Motion (Framer)
> **Base path:** `client/src/`

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Entry Points & Routing](#2-entry-points--routing)
3. [Provider Stack](#3-provider-stack)
4. [Theming System](#4-theming-system)
5. [Animated Backgrounds](#5-animated-backgrounds)
6. [Contexts](#6-contexts)
7. [Hooks & API Layer](#7-hooks--api-layer)
8. [Pages](#8-pages)
9. [Admin & Debug Panels](#9-admin--debug-panels)
10. [Navigation](#10-navigation)
11. [Forms](#11-forms)
12. [i18n / Multilingual Support](#12-i18n--multilingual-support)
13. [UI Component Library](#13-ui-component-library)
14. [Types](#14-types)
15. [Utilities & Animations](#15-utilities--animations)
16. [Performance & Build](#16-performance--build)
17. [Known Bugs](#17-known-bugs)
18. [Backend Dependencies](#18-backend-dependencies)

---

## 1. Project Structure

```
client/
├── index.html
├── vite.config.ts
├── tsconfig.app.json
└── src/
    ├── main.tsx                # Router, lazy imports, withBoundary(), StrictMode
    ├── App.tsx                 # Auth redirect gate
    ├── RootLayout.tsx          # All providers + Suspense boundary + Toaster
    ├── Wrapper.tsx             # Full-page gradient + CSS custom properties
    ├── animations/             # Reusable Motion wrappers + page-level stagger components
    │   ├── CardAnimation.tsx   # Spring scale-in entry for all main pages
    │   ├── LoadPost.tsx        # List row stagger (opacity + y)
    │   ├── NavbarAnimation.tsx
    │   ├── ColorInterpolation.tsx
    │   └── accordion/
    ├── assets/
    ├── backgrounds/            # Animated background canvas components
    ├── components/
    │   ├── ErrorBoundary.tsx   # Class-based error boundary + withBoundary() used in main.tsx
    │   ├── RequireAuth.tsx     # Layout route guard — redirects unauthenticated users to /app/login
    │   ├── nav/                # Navbar, mobile drawer, account menu
    │   └── ui/                 # Shared UI primitives (shadcn-style)
    ├── context/                # Auth + Navbar contexts
    ├── hooks/                  # React Query hooks (domain-split)
    │   ├── useAuth.ts
    │   ├── useAdmin.ts
    │   ├── useDebug.ts
    │   ├── useProfile.ts
    │   └── useQueryHooks.ts    # Re-exports + misc hooks
    ├── lib/
    │   ├── apiClient.ts        # Axios instance + interceptors
    │   ├── animationTypes.ts   # AnimationKey union + ANIMATION_LABELS
    │   ├── i18n.ts             # i18next config
    │   ├── queryKeys.ts        # Centralised query key factory
    │   ├── toast.ts            # Pub/sub toast store (no external deps)
    │   ├── utils.ts            # Barrel re-export of all util modules
    │   └── utils/              # dateFormat, themeClasses, liquidGlass,
    │                           #   colorMath, classnames, extractErrorMessage,
    │                           #   sectionStyle
    ├── locales/
    │   ├── en/                 # English — 9 namespace files
    │   └── hu/                 # Hungarian — same structure
    ├── pages/
    │   ├── admin/
    │   │   ├── AdminPage.tsx
    │   │   ├── AdminPageContent.tsx
    │   │   ├── useAdminPageLogic.ts
    │   │   ├── useBanDialogLogic.ts
    │   │   └── components/     # UserList, UserDetail, ProfilesPanel,
    │   │                       #   BanDialog, BanPresetCard, BanCustomRange, UserListItem
    │   ├── auth/               # LoginPage, SignUpPage, PasswordResetPage
    │   ├── debug/
    │   │   ├── DebugPage.tsx
    │   │   ├── DebugPageContent.tsx
    │   │   └── tabs/           # SystemTab, CacheTab, EndpointsTab, GameDataTab, shared
    │   ├── gallery/
    │   ├── leaderboard/
    │   ├── news/
    │   │   ├── NewsPage.tsx
    │   │   ├── useNewsPosts.ts
    │   │   ├── useNewsForm.ts
    │   │   ├── useNewsCategoryFilter.ts
    │   │   └── components/     # AddNews, EditButton, RemoveButton, Filter,
    │   │                       #   CategoryBadge, CategorySelector, RadioGroupChoiceCard, …
    │   ├── profile/
    │   ├── profile-selector/
    │   │   ├── ProfileSelectorPage.tsx
    │   │   ├── AddNewProfileDialog.tsx
    │   │   ├── ProfilesContext.tsx
    │   │   ├── ProfilesTypes.ts
    │   │   └── useProfiles.ts
    │   ├── releases/
    │   ├── settings/
    │   │   ├── SettingsContext.tsx
    │   │   ├── ColorContext.ts
    │   │   ├── ColorProvider.tsx
    │   │   ├── Themes.ts
    │   │   ├── SettingsPage.tsx
    │   │   └── components/
    │   ├── webstore/
    │   │   ├── WebstorePage.tsx
    │   │   ├── useItems.ts
    │   │   └── components/     # Item, CreateItemDialog, SearchItem, ItemFilters, RemoveItemButton
    │   └── NotFoundPage.tsx
    └── types/                  # Shared TypeScript interfaces
```

---

## 2. Entry Points & Routing

Auth-critical pages (`login`, `signup`, `reset-password`) are **eager-loaded**. All others are **lazy-loaded** via `React.lazy`. Every lazy route is wrapped with `withBoundary()` from `components/ErrorBoundary.tsx`, which catches render errors per-route without crashing the whole app.

All routes except login, signup, reset-password, and the catch-all are protected by `RequireAuth` (`components/RequireAuth.tsx`) — a pathless layout route that redirects unauthenticated users to `/app/login`. Admin and debug routes have their own additional internal role checks (non-admins see `<NotFoundPage />`).

### Route table

| Path                    | Component              | Access          |
| ----------------------- | ---------------------- | --------------- |
| `/app`                  | `App` (redirect gate)  | —               |
| `/app/login`            | `LoginPage`            | Public          |
| `/app/signup`           | `SignUpPage`           | Public          |
| `/app/reset-password`   | `PasswordResetPage`    | Public          |
| `/app/leaderboard`      | `LeaderboardPage`      | Logged in       |
| `/app/gallery`          | `GalleryPage`          | Logged in       |
| `/app/releases`         | `ReleasesPage`         | Logged in       |
| `/app/news`             | `NewsPage`             | Logged in       |
| `/app/webstore`         | `WebstorePage`         | Logged in       |
| `/app/profile`          | `ProfilePage`          | Logged in       |
| `/app/profile-selector` | `ProfileSelectorPage`  | Logged in       |
| `/app/settings`         | `SettingsPage`         | Logged in       |
| `/app/admin`            | `AdminPage`            | Admin only      |
| `/app/debug`            | `DebugPage`            | Admin + Support |
| `*`                     | `NotFoundPage`         | —               |

`App.tsx` reads `AuthContext.isLoggedIn` + `isInitializing`, then redirects to `/app/releases` or `/app/login`. Shows a spinner while auth initialises.

---

## 3. Provider Stack

```
PersistQueryClientProvider   ← React Query + localStorage persistence
  AuthProvider               ← isLoggedIn, userId, isAdmin, isSupport
    SettingsProvider         ← settings, updateSetting (persisted)
      NavbarProvider         ← dropdown hover/open state
        ColorProvider        ← gradient colours + animationKey (persisted)
          ProfileProvider    ← profiles[], selectedProfile (persisted per userId)
            Wrapper          ← gradient div + CSS custom properties
              Suspense       ← spinner fallback for lazy routes
                Outlet       ← active route
```

`<Toaster />` is rendered outside the provider tree (sibling of `PersistQueryClientProvider`) so toast notifications are always visible regardless of route errors.

**React Query defaults** (set in `RootLayout.tsx`):

```ts
staleTime: 2 * 60 * 1000; // 2 minutes
gcTime: 10 * 60 * 1000; // 10 minutes
retry: 1;
refetchOnWindowFocus: true;
refetchOnReconnect: true;
```

Cache is persisted to `localStorage` via `createSyncStoragePersister`. The `whoami` query opts out (`gcTime: 0`) to prevent stale auth leaking into the persisted cache.

**Profile selection persistence:** stored in `localStorage` under key `selected_profile_<userId>`. On mount, once both `userId` and fetched profiles are available, the stored ID is validated — if the profile was deleted, the first profile is used instead.

---

## 4. Theming System

The theme is driven by three gradient colours in `ColorContext` + `localStorage`. `Wrapper.tsx` computes derived CSS custom properties from them and injects them on the root element.

### CSS Custom Properties

| Variable               | Description                              |
| ---------------------- | ---------------------------------------- |
| `--theme-accent`       | Lightened average of the three colours   |
| `--theme-accent-hover` | Lighter version for hover states         |
| `--theme-accent-soft`  | Semi-transparent accent for subtle fills |
| `--theme-nav-border`   | Average colour for nav border            |
| `--theme-nav-shadow`   | Semi-transparent shadow colour           |

### Settings Flags

| Flag                | Default | Effect                                                    |
| ------------------- | ------- | --------------------------------------------------------- |
| `useLiquidGlass`    | `true`  | Frosted glass look (backdrop-blur + transparency)         |
| `useDarkMode`       | `false` | Dark variants of all themed classes                       |
| `useAnimations`     | `true`  | `false` freezes backgrounds to a static frame             |
| `language`          | `"en"`  | i18next language (`"en"` or `"hu"`)                       |
| `animationOverride` | `null`  | `null` = theme default · `"none"` = force off · key = pin |

### Theme Helper Functions

Always import from `@/lib/utils` — never write inline ternary theme logic:

```ts
getTextColor(useLiquidGlass, useDarkMode)
getSubtextColor(useLiquidGlass, useDarkMode)
getTextShadow(useLiquidGlass, useDarkMode)
getBackgroundClasses(useLiquidGlass, useDarkMode, variant?)
// variant: "base" | "light" | "strong"
getButtonClasses(useLiquidGlass, useDarkMode, variant?)
// variant: "primary" | "secondary" | "outline"
getInputClasses(useLiquidGlass, useDarkMode)
getDialogClasses(useLiquidGlass, useDarkMode)
getDialogFooterClasses(useLiquidGlass, useDarkMode)
sectionStyle(animReady, delayMs)
// returns { opacity, transform, transition, willChange }
// used for staggered fade+slide section animations
```

### Preset Themes (`Themes.ts`)

| Theme     | Default Animation |
| --------- | ----------------- |
| Ocean     | fishtank          |
| Midnight  | deepspace         |
| Lavender  | aurora            |
| Aurora    | aurora            |
| Amethyst  | lavalamp          |
| Fire      | lavalamp          |
| Neon Noir | synthwave         |
| Sunset    | sakura            |
| Emerald   | sakura            |
| Rose Gold | sakura            |
| Slate     | storm             |
| Monsoon   | puddleripples     |
| Abyss     | bioluminescence   |
| Starmap   | constellation     |
| Nebula    | particleweb       |
| Void      | void              |

---

## 5. Animated Backgrounds

Each background is a canvas component that renders as `fixed inset-0 z-0 pointer-events-none`. Dispatched by `AnimatedBackground.tsx` based on the active `AnimationKey`.

### Available Backgrounds

| Key           | Component               | Description                                                                                                                                                                                                                                                                                      |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fishtank`    | `FishtankBackground`    | 8 solo fish with sinusoidal swim paths + 2 schools of 10–18 small fish. Bubbles, seaweed silhouettes at bottom edges, branching coral, caustic light pools on upper half, light shafts from surface, surface shimmer, deep dark vignette at bottom (no sand floor).                              |
| `deepspace`   | `DeepSpaceBackground`   | 300 coloured stars, milky way band, vivid nebulae, frequent glowing shooting stars (up to 5 concurrent).                                                                                                                                                                                         |
| `aurora`      | `AuroraBackground`      | Vertical curtain fibres, drifting colour bands, star twinkle. CSS + motion/react.                                                                                                                                                                                                                |
| `lavalamp`    | `LavaLampBackground`    | Morphing blobs with outer glow and inner shimmer highlight. CSS keyframes.                                                                                                                                                                                                                       |
| `synthwave`   | `SynthwaveBackground`   | Perspective grid, retro sun, scanline overlay. Canvas.                                                                                                                                                                                                                                           |
| `sakura`      | `SakuraBackground`      | Falling petals with per-petal drift/rotation CSS custom properties.                                                                                                                                                                                                                              |
| `storm`            | `StormBackground`            | Canvas rain streaks + lightning bolt, drifting CSS cloud layers.                                                                                                                                                                                           |
| `puddleripples`    | `PuddleRipplesBackground`    | Top-down rain hitting dark water. Concentric expanding rings (3 per drop) spawn at random positions every ~280ms, expanding to 55–100px radius over 2.8s with tapering stroke width and fading opacity. Canvas.                                            |
| `bioluminescence`  | `BioluminescenceBackground`  | 38 glowing orbs in teal/blue/green palette drift slowly across a deep black background. Each orb has a radial halo gradient + bright white core, pulsing opacity on an independent sinusoidal cycle (0.06–0.52 alpha). Canvas.                             |
| `constellation`    | `ConstellationBackground`    | 110 twinkling stars with slow parallax drift. Nearby stars (80–190px apart) connected by gradient lines that fade in/out on independent slow cycles. Larger stars emit a soft glow. Canvas.                                                                |
| `void`             | `VoidBackground`             | Deep-sea bioluminescent scene. 3 large background depth blobs (pure radial glow haze), 12 ambient orbs, 70-particle marine snow drifting downward, and 4 foreground jellyfish (squashed dome bell + bezier tentacles, upward drift, wrap at top). Each jellyfish emits a subtle expanding ring pulse every ~10–22 s. Heavy edge vignette. Canvas. |
| `particleweb`      | `ParticleWebBackground`      | 80 drifting particles. Lines drawn between particles within 160px. Mouse cursor acts as an additional node (draws lines within 200px, repels within 60px). Particles pulse in size with a soft glow. Colours interpolated across the full theme gradient.  |

### Animation Resolution (`Wrapper.tsx`)

```
useAnimations = false           → background renders a single static frame (frozen)
useAnimations = true
  animationOverride = null      → use Theme.animationKey (theme default)
  animationOverride = "none"    → force no animation
  animationOverride = <key>     → pin to that animation regardless of theme
```

> **Static mode:** All canvas backgrounds call `renderFrame(0)` once on mount before starting the rAF loop, so they display a frozen snapshot even when `useAnimations = false`. The rAF loop continues running but skips rendering while `paused = true`, meaning the scene unfreezes instantly when animations are re-enabled.

### Adding a New Background

1. Create `src/backgrounds/MyBackground.tsx` — accepts `{ colorLeft, colorMiddle, colorRight, paused? }`, renders `<canvas className="fixed inset-0 z-0 opacity-XX pointer-events-none" />`
2. Add `"mykey"` to `AnimationKey` in `src/lib/animationTypes.ts`
3. Add `mykey: "My Label"` to `ANIMATION_LABELS`
4. Add `case "mykey": return <MyBackground {...shared} />;` in `AnimatedBackground.tsx`
5. Optionally add a theme preset in `Themes.ts`

### Performance Details

**Deferred fade-in:** On routes with heavy backdrop-blur cards (`/app/settings`, `/app/profile`, `/app/admin`, `/app/debug`), `AnimatedBackground` starts at `opacity: 0` to eliminate compositing cost during the card entry spring. After `FADE_IN_DELAY_MS` (1600ms) it transitions to `opacity: 1` over 400ms.

**Crossfade:** When `animationKey` changes, the outgoing layer fades to `opacity: 0` and the incoming fades to `opacity: 1` simultaneously over `CROSSFADE_MS` (600ms). Old layer is unmounted after the crossfade.

**`paused` prop:** Canvas backgrounds draw one frame then stop the `rAF` loop. CSS backgrounds set `animationPlayState: "paused"`. Aurora additionally sets `animate={}` on motion elements.

---

## 6. Contexts

### `AuthContext`

```ts
{
  isLoggedIn: boolean;
  isInitializing: boolean; // true while whoami is in-flight
  userId: bigint | null;
  isAdmin: boolean;
  isSupport: boolean;
  (setUserId, setIsLoggedIn, setIsAdmin, setIsSupport);
}
```

`isSupport` is set when `whoami` returns `role === "support"`. Both `isAdmin` and `isSupport` must be cleared on logout — done in `Navbar`, `AccountMenu`, and `ProfileSelectorPage`.

### `SettingsContext`

```ts
const { settings, updateSetting } = useSettings();
updateSetting("useDarkMode", true);
updateSetting("language", "hu");
// Persisted under localStorage key "settings"
// Also syncs i18next on mount and on language change
```

### `ProfileContext`

```ts
const { profiles, selectedProfile, addProfile, removeProfile, selectProfile } =
  useProfiles();

interface Profile {
  id?: number;
  name: string; // display_name
  avatar: string; // /api/profiles/:id/pfp URL
  avatarFile?: File | null;
  coins?: number;
  last_login?: string;
}
```

Selected profile is persisted to `localStorage` under `selected_profile_<userId>`. Validated on restore.

### `ColorContext`

```ts
const {
  colorLeft,
  colorMiddle,
  colorRight,
  animationKey,
  setColorLeft,
  setColorMiddle,
  setColorRight,
  setAnimationKey,
} = useContext(ColorContext);
// Persisted under localStorage key "color-settings"
// animationKey: AnimationKey | null — set by applyTheme()
```

---

## 7. Hooks & API Layer

### `src/lib/apiClient.ts`

- Base URL: `/api`, `withCredentials: true`
- `Content-Type`: auto `application/json`; omitted for `FormData`
- **401 interceptor:** non-auth 401s hard-redirect to `/app/login`. Auth endpoints (`/auth/*`, `/users/whoami`) are excluded to avoid redirect loops.

### `src/lib/queryKeys.ts`

```ts
queryKeys.profiles.all; // ["profiles"]
queryKeys.profiles.byUserId(id); // ["profiles", "byUserId", id]
queryKeys.githubReleases.all; // ["githubReleases"]
queryKeys.items.all; // ["items"]
queryKeys.purchases.byProfileId(id); // ["purchases", "byProfileId", id]
```

Debug panel uses its own `debugQueryKeys` exported from `useDebug.ts`.

### `src/hooks/useAuth.ts`

| Hook                           | Method | Endpoint        |
| ------------------------------ | ------ | --------------- |
| `useWhoAmIQuery()`             | GET    | `/users/whoami` |
| `useLoginMutation()`           | POST   | `/auth/login`   |
| `useSignupMutation()`          | POST   | `/auth/signup`  |
| `useLogoutMutation()`          | POST   | `/auth/logout`  |
| `useUpdateUserEmailMutation()` | PUT    | `/users/:id`    |

### `src/hooks/useProfile.ts`

| Hook                                | Description                                                                                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useProfilesQuery(userId)`          | Fetch all profiles; appends `?v=` cache-bust param to avatar URLs                                                                                                                                                               |
| `useAddProfileMutation()`           | `POST /users/:id/profiles` with optional `profile_picture: File`                                                                                                                                                                |
| `useUpdateProfileMutation()`        | `PUT /profiles/:id`. Supports `optimistic: boolean` and `invalidateAfterSuccess: boolean`                                                                                                                                       |
| `useDeleteProfileMutation()`        | `DELETE /profiles/:id`. Optimistic removal with rollback on error                                                                                                                                                               |
| `useUploadProfilePictureMutation()` | `POST /profiles/:id/pfp` multipart. On success: stamps new version in `sessionStorage["pfp_versions"]`, then calls `setQueriesData` to patch only `avatar_url` in all profiles cache entries — **no network refetch triggered** |

**Display name rules:** clamped to 20 chars via `clampDisplayName()`. Duplicate names get a random 4-char suffix.

### `src/hooks/useAdmin.ts`

| Hook                       | Endpoint                  | Notes                                                             |
| -------------------------- | ------------------------- | ----------------------------------------------------------------- |
| `useAdminUsersQuery()`     | `GET /users`              | Client-side search until backend supports `?search=`              |
| `useBanUserMutation()`     | `POST /users/:id/ban`     | Body: `{ id, period }` (minutes). Permanent = 50 years in minutes |
| `useUnbanUserMutation()`   | `POST /users/:id/unban`   | No body                                                           |
| `usePromoteUserMutation()` | `POST /users/:id/promote` | Body: `{ id, target_role: "admin"\|"support" }`                   |
| `useDemoteUserMutation()`  | `POST /users/:id/demote`  | No body — always demotes to `"user"`                              |

### `src/hooks/useDebug.ts`

Stats queries (also used by `LeaderboardPage`):

- `useTopItemsQuery()` — `GET /stats/top/items`
- `useTopPlayersQuery()` — `GET /stats/top/players`
- `useTopLevelsQuery()` — `GET /stats/top/levels`
- `useLeaderboardQuery()` — `GET /stats/leaderboard`

Game data queries (admin-only endpoints):

- `useDebugCharactersQuery()` — `GET /characters`
- `useDebugLevelsQuery()` — `GET /levels`
- `useDebugItemsQuery()` — `GET /items?page=1&page_size=100`

### Content hooks (`useQueryHooks.ts`)

Infinite-query hooks for paginated content:

```ts
useReleasesInfiniteQuery(os, pageSize?)     // GET /releases?os=&page=&pageSize=
useItemsInfiniteQuery(filters?, pageSize?)  // GET /items?...
useNewsInfiniteQuery(categories?, pageSize?) // GET /news?categories=&page=&pageSize=
```

### `src/lib/toast.ts`

Minimal pub/sub store — no external dependencies.

```ts
import { toast } from "@/lib/toast";
toast.success("Saved!");
toast.error("Something went wrong.");
toast.info("Loading…");
// subscribe(fn): returns unsubscribe function — used internally by <Toaster />
```

`toast.error/success/info` calls are made inside all mutation handlers (admin actions, news CRUD, webstore purchases/create/delete) to give immediate feedback.

---

## 8. Pages

### Leaderboard (`/app/leaderboard`)

Public. Replaced "About Us" in the nav. Four stat panels: Win Leaderboard, Most Active Players, Most Played Levels, Most Purchased Items. Top 10 per panel, medal colours for top 3 (gold/silver/bronze). Animations: `CardAnimation` entry → `sectionStyle` staggered panel fade (0/80/160/240ms delay) → `LoadPost` row stagger inside each panel.

### Releases (`/app/releases`)

Fetches from `GET https://api.github.com/repos/SMAASH-project/SMAASH/releases`. Platform detection by asset extension: `.apk`/`.aab` → Android, `.ipa` → iOS. `staleTime: 0`, `refetchOnMount: true`, `refetchInterval: 5 * 60 * 1000`. `DownloadReleaseButton` opens the GitHub asset URL in a new tab; disabled with tooltip when no asset for the selected platform.

### News (`/app/news`)

Markdown-rendered posts (`react-markdown` + `remark-gfm`) with category filter, image support (`imagePosition: "Top"|"Right"`, `imageSize`), admin edit/delete. `LoadPost` stagger on entries. Shows 3 skeleton cards while loading.

**Category colours:**

| Category       | Colour             |
| -------------- | ------------------ |
| Major update   | `#3b82f6` (blue)   |
| Minor update   | `#10b981` (green)  |
| Patch          | `#f59e0b` (amber)  |
| Unrelated news | `#8b5cf6` (purple) |

### Webstore (`/app/webstore`)

Item shop. Coin balance from `selectedProfile.coins`. Filters: kind, rarity, combat type, ownership. Infinite scroll (12/page). Shows 8 skeleton item cards while initial load is in progress.

**Data flow:**

1. `GET /api/items?page=1&page_size=100` — all items
2. `GET /profiles/:id/purchases` — ownership (⚠️ see Known Bugs §17)
3. `ownedNames` Set from `p.item` field
4. Purchase: `POST /purchases` with `{ player_profile_id, item_id, count: 1, date: "YYYY-MM-DD" }`
5. On success: invalidate purchases + profiles queries (coins update)

**Item → WebstoreItem mapping:** backend encodes kind/combat type as category strings (`"Character"`, `"Skin"`, `"Melee"`, `"Ranged"`). `itemDTOToWebstoreItem()` decodes these back to typed fields.

**Admin features:** Create (`POST /api/items`) and delete (`DELETE /api/items/:id`) with optimistic removal + rollback.

### Profile (`/app/profile`)

Three-panel layout:

```
[ Avatar / Name / Edit ] | [ Stats ] | [ Match History ]
```

Live data: coins, last seen, profile ID. Placeholder (dimmed): wins, losses, win rate, match count. Match history: empty — waiting on `GET /api/profiles/:id/matches`.

### Settings (`/app/settings`)

Toggles (Animations, Liquid Glass, Dark Mode, Language), theme preset picker, custom 3-stop colour picker, animation override row. `sectionStyle` staggered sections (0/80/160/240ms). `animReady` prop: while `false`, `backdrop-blur-*` stripped from card + sections stay invisible; flips to `true` after `CardAnimation` spring completes.

---

## 9. Admin & Debug Panels

### Admin Panel (`/app/admin`)

Auth-gated: non-admins see `<NotFoundPage />` (indistinguishable from a real 404).

**Layout:**

```
[ User List + Search ] | [ User Detail + Actions ] | [ User Profiles + Coin Editor ]
```

Columns animate in sequentially with `motion.div` after `CardAnimation` completes (delays: 50ms, 180ms, 310ms). User list rows use `LoadPost` stagger. User detail cards use `AnimatePresence mode="wait"` keyed on `selectedUser.id` — cross-fades when user changes with staggered card fade (0ms header, 80ms stats).

**Pagination:** User list is paginated client-side with `PAGE_SIZE = 15`. Prev/Next controls appear below the list. Page resets automatically when the search query changes.

**Toast feedback:** All admin actions (ban, unban, promote, demote, coin save) emit `toast.success` or `toast.error` via `src/lib/toast`.

**Loading state:** While users are fetching, the list shows 6 `<Skeleton>` rows instead of a spinner.

**Role badges:**

| Backend value | Colour       | Icon       |
| ------------- | ------------ | ---------- |
| `"admin"`     | Purple       | Shield     |
| `"support"`   | Sky blue     | Headphones |
| `"user"`      | Neutral gray | Users      |

**Role actions:**

- `user` → Promote to Support (sky), Promote to Admin (purple)
- `support` → Promote to Admin (purple), Demote to Support (sky), Demote to User (amber)
- `admin` → Demote to Support (sky), Demote to User (amber)

**Coin editor** (in Profiles Panel, shown when a profile is selected):

- Number input + ±100 buttons + quick presets (1k, 5k, 10k)
- Save: grey (no change) → amber (dirty) → green + checkmark (saved)
- Calls `PUT /profiles/:id` with `{ id, display_name, coins }`
- Draft auto-syncs when selected profile changes

**Ban dialog:**

- Presets: 1h / 12h / 24h (timeouts), 7d / 31d / 365d (bans), Permanent
- Custom: calendar + time spinners (HH:MM, wrap-around)
- Reason: 8 preset chips + free-text textarea (optional)
- Confirm: `POST /users/:id/ban` with `{ id, period }` (minutes)

### Debug Panel (`/app/debug`)

Admin + support. Fixed-height card (`flex-1`, fills viewport). Left sidebar (144px) with tab buttons + Refresh pinned to bottom. Right: `AnimatePresence mode="wait"` tab content slides left/right on switch (200ms). Sidebar and content area each animate in via `motion.div` (`opacity: 0, y: 18` → `opacity: 1, y: 0`) with staggered delays (50ms sidebar, 180ms content), matching the admin panel's entry animation.

Tab content is split into separate files under `src/pages/debug/tabs/`:

**Tabs:**

| Tab       | File             | Access          | Content                                                                                                                                                                                                                                                      |
| --------- | ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| System    | `SystemTab.tsx`  | admin + support | Browser (user agent, language, online, connection, device memory, CPU threads), Display (viewport, screen, pixel ratio, color depth), Session (role, user ID, query cache count, timezone, local time), Environment (base URL, path, build mode, dev server) |
| Cache     | `CacheTab.tsx`   | admin + support | Live React Query cache explorer. Filter by query key. Expandable entries: status icon, last updated, raw data (truncated at 1500 chars), per-entry Invalidate + Remove buttons. Invalidate All + Refresh buttons.                                            |
| Endpoints | `EndpointsTab.tsx` | admin + support | API tester. Method selector (GET/POST/PUT/DELETE/PATCH, colour-coded), path input, JSON body textarea, Send button. Quick route presets. Response panel: status code (coloured), latency, raw JSON output.                                                   |
| Game Data | `GameDataTab.tsx` | admin only     | Characters grid (avatar + name + ID), Levels grid (image + name + ID), Store Items list (ID + name + rarity badge + price). All load from admin-only endpoints.                                                                                              |
| Sight     | `SightTab.tsx`   | admin + support | Animation speed picker (0.25×–4×), navbar override (auto/show/hide), force-reload. Visual toggles: Disable Backdrop Blur, Layout Borders, Element Inspector (floating hovercard on hover showing tag / id / classes + 11 computed CSS props; auto-flips at viewport edges). Overlays: FPS counter, scroll position. Toast test buttons. CSS variable viewer (5 theme vars). `ElementInspectorOverlay` lives in `RootLayout.tsx` and is activated by `settings.elementInspector`. |

---

## 10. Navigation

**Desktop navbar:** Admin Panel button (shield icon, admin only) + Debug Panel button (bug icon, admin + support) in top-left. Centre: nav items. Right: username + account menu dropdown.

**Mobile drawer (`MobileNavMenu`):** Full nav links + Account section (Profile, Settings, Admin Panel if admin, Debug Panel if admin/support, Logout).

**Nav items** (`navItems.ts`): Leaderboard, Gallery, Releases, Webstore, News. Labels via `labelKey` mapping to `src/locales/*/nav.json`.

---

## 11. Forms

All use `<FormAlert>` for error display and `extractErrorMessage()` for Axios error normalisation. Auth forms live in `src/pages/auth/`.

### `LoginPage.tsx`

Email + password. On success: sets `isLoggedIn`/`userId`/`isAdmin`/`isSupport`, navigates to `/app/profile-selector`. 401 → specific "Incorrect email or password" message.

### `SignUpPage.tsx`

Username / email / password / confirm. Client-side validation errors take priority. reCAPTCHA v3 — token fetched only on submit via `executeRecaptcha("signup")`, not continuously polled.

### `PasswordResetPage.tsx`

⚠️ Renders but fires no mutation. Blocked on `POST /api/auth/reset-password`.

### `ProfileSelectorPage.tsx`

Profiles as avatars. "Manage Profiles" enables delete. Logout clears `isAdmin` + `isSupport`. `React.memo` + `useCallback` for performance.

### `AddNewProfileDialog.tsx`

Dialog: display name + optional avatar. Limit: 5 profiles per user. Fully translated (EN/HU).

---

## 12. i18n / Multilingual Support

**Languages:** English (`en`) · Hungarian (`hu`)

`src/lib/i18n.ts` must be imported in `main.tsx` before any component renders.

### Namespaces

| File            | Used in                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| `auth.json`     | Login, Signup, PasswordReset                                                 |
| `nav.json`      | Navbar, mobile drawer, nav items (includes `leaderboard`, `debugPanel` keys) |
| `settings.json` | Settings page                                                                |
| `profile.json`  | Profile page, UpdateSheet, ProfileSelector, AddNewProfileDialog              |
| `releases.json` | Releases page                                                                |
| `news.json`     | News page                                                                    |
| `webstore.json` | Webstore page                                                                |
| `admin.json`    | Admin panel, ban dialog                                                      |
| `common.json`   | 404 page, shared labels                                                      |

Language stored in `SettingsContext`. `updateSetting("language", "hu")` automatically calls `i18n.changeLanguage()`.

### Adding a New Language

1. Create `src/locales/<code>/` with the same 9 JSON files
2. Import in `src/lib/i18n.ts` and add to `resources`
3. Add button in `SettingsPageContent.tsx` and `LanguageToggle.tsx`
4. Add the code to the `Language` type in `SettingsContext.tsx`

---

## 13. UI Component Library

Components in `src/components/ui/`, shadcn patterns (Radix UI + Tailwind).

| Component        | Notes                                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`         | Variants via `button-variants.ts`                                                                                                                                                   |
| `ButtonGroup`    | Horizontal/vertical grouped buttons                                                                                                                                                 |
| `Input`          | Standard text input                                                                                                                                                                 |
| `Card`           | Container card                                                                                                                                                                      |
| `Avatar`         | With fallback initials; `size` prop                                                                                                                                                 |
| `Badge`          | Status/category labels                                                                                                                                                              |
| `Dialog`         | Modal — uses `getDialogClasses`                                                                                                                                                     |
| `Sheet`          | Slide-out side panel                                                                                                                                                                |
| `DropdownMenu`   | Radix dropdown                                                                                                                                                                      |
| `Popover`        | Radix popover                                                                                                                                                                       |
| `Switch`         | Toggle                                                                                                                                                                              |
| `Calendar`       | Custom range calendar — no `react-day-picker`. Range highlight is a connected pill bar (`rounded-l-full` start, `rounded-r-full` end, flat interior). `fromDate` blocks past dates. |
| `ColorPicker`    | Hex colour input                                                                                                                                                                    |
| `LanguageToggle` | EN/HU flag buttons for auth pages                                                                                                                                                   |
| `FormAlert`      | Inline alert — `variant: "error"\|"success"\|"info"`. Fixes the `[object Object]` error display bug.                                                                                |
| `Separator`      | Horizontal/vertical rule                                                                                                                                                            |
| `Resizable`      | Drag-to-resize panels                                                                                                                                                               |
| `Skeleton`       | Pulse placeholder — `animate-pulse bg-white/10`. Use `className` prop to size it.                                                                                                  |
| `Toaster`        | Fixed bottom-right toast container. Subscribes to `src/lib/toast`. Renders success/error/info toasts with icons, dismiss button, `slide-in-from-right` animation.                  |

---

## 14. Types

### `src/types/PageTypes.ts`

```ts
interface NewsPost {
  id: string;
  title: string;
  category: "Major update" | "Minor update" | "Patch" | "Unrelated news";
  image?: string;
  imageAlt?: string;
  imagePosition?: "Top" | "Right";
  imageSize?: number;
  content: string; // Markdown
  createdAt: DateTime;
}

interface WebstoreItem {
  id: string;
  name: string;
  kind: "Skin" | "Character";
  combatType?: "Melee" | "Ranged";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  description: string;
  price: number;
  owned: boolean; // derived client-side from purchases
  createdAt: DateTime;
}

interface Release {
  id: string;
  version: string;
  supports: string[];
  downloadUrls: Partial<Record<string, string>>;
  createdAt: DateTime;
}
```

---

## 15. Utilities & Animations

### `src/lib/utils/sectionStyle.ts`

```ts
sectionStyle(animReady: boolean, delayMs: number): CSSProperties
```

Returns `{ opacity, transform, transition, willChange }`. While `animReady` is false: `opacity: 0`, `translateY(10px)`, no transition. Once `true`: fades in with `delayMs` CSS delay. Used by Settings, Admin, Leaderboard, Debug pages for staggered section entry.

### `src/lib/utils/extractErrorMessage.ts`

Converts Axios errors to readable strings. Priority: `data` as string → `data.error` → `data.message` → `error.message` → provided fallback.

### `src/lib/utils/colorMath.ts`

```ts
getAverageHexColor(colors: string[]): string
lightenHexColor(hex: string, amount: number): string  // 0.0–1.0
toRgbaColor(hex: string, alpha: number): string
```

### `src/lib/utils/dateFormat.ts`

```ts
formatDate("2026-03-21T17:30:00Z"); // "Mar 21, 2026"
formatDateTime("2026-03-21T17:30:00Z"); // "Mar 21, 2026, 5:30 PM"
// Accepts Luxon DateTime, JS Date, ISO string, or undefined
```

### Animation Utilities

**`CardAnimation`** (`src/animations/CardAnimation.tsx`) — spring scale-in entry (`scale: 0→1`, spring `visualDuration: 1.5, bounce: 0.2`). Used by all main pages.

**`LoadPost`** (`src/animations/LoadPost.tsx`) — `opacity: 0→1, y: 20→0`, `delay: index * 0.1s`. Used for list row stagger.

**`sectionStyle`** — CSS-in-JS approach for staggered section animations within already-mounted cards.

### `src/components/ErrorBoundary.tsx`

Class-based React error boundary. Catches render errors in any child and shows a graceful fallback.

```tsx
// Wrap a subtree manually:
<ErrorBoundary fallback={<MyFallback />}>
  <SomeComponent />
</ErrorBoundary>

// Or use the helper (used in main.tsx for all lazy routes):
const WrappedPage = withBoundary(lazy(() => import("./pages/MyPage")));
```

---

## 16. Performance & Build

### Bundle Strategy

| Chunk          | Contents                              | Gzipped   |
| -------------- | ------------------------------------- | --------- |
| `react-vendor` | react, react-dom, react-router-dom    | ~33 KB    |
| `query-vendor` | @tanstack/react-query, persist-client | ~12 KB    |
| `ui-vendor`    | framer-motion, motion, lucide-react   | ~45 KB    |
| Route chunks   | Lazy-loaded per page                  | On demand |

**Initial bundle: ~94 KB gzipped** (down from 349 KB before optimisation).

### Key Optimisations

- Profile picture upload: surgical `setQueriesData` patch on avatar URL only — no refetch
- `ProfileSelectorPage`: `React.memo` + `useCallback` on avatar + click handler
- Settings, Admin, Debug: `animReady` prop strips `backdrop-blur-*` from card during entry spring so browser skips compositing
- Animated backgrounds: deferred 1600ms fade-in on heavy-card routes
- reCAPTCHA: token fetched only on submit, not polling
- All lazy routes wrapped in per-route `ErrorBoundary` — a crash in one page doesn't take down the whole app

---

## 17. Known Bugs

### ⚠️ Purchase → Item Not Marked as Owned (Active Bug)

**Root cause:** `GET /profiles/:id/purchases` backend preloads `Purchases` without `Purchases.Item`, so `p.Item.Name` returns empty string. `ownedNames.has(item.name)` never matches — all items appear unowned even after purchasing.

**Backend fix:** add `"Purchases.Item"` to the preload in `ReadPurchases` in `player_profiles_controller.go`:

```go
// Before
profile, err := pc.profilesRepo.ReadByID(ctx, id.(uint), "Purchases")
// After
profile, err := pc.profilesRepo.ReadByID(ctx, id.(uint), "Purchases", "Purchases.Item")
```

**Frontend fix (independent of backend):** on purchase success, optimistically call `setQueryData` on the items cache to flip `owned: true` by item ID — no name matching needed. File: `src/pages/webstore/useItems.ts`.

---

## 18. Backend Dependencies

### Already Implemented

- `POST /users/:id/ban` — body: `{ id, period }` (minutes)
- `POST /users/:id/unban`
- `POST /users/:id/promote` — body: `{ id, target_role: "admin"|"support" }`
- `POST /users/:id/demote`
- `GET /users` with Role preload
- `GET /users/:id` with Role preload
- `GET /profiles/:id/purchases` (exists but missing `Item` preload — see §17)
- `PUT /profiles/:id` — coin editor uses this

### Still Needed

| #   | Endpoint                                                     | Impact                                          |
| --- | ------------------------------------------------------------ | ----------------------------------------------- |
| 1   | `GET /profiles/:id/purchases` — add `Purchases.Item` preload | **Critical** — ownership tracking broken        |
| 2   | `GET /api/profiles/:id/matches`                              | Match history + win/loss stats are placeholders |
| 3   | `POST /api/auth/reset-password`                              | Password reset form does nothing                |
| 4   | `?search=` on `GET /api/users`                               | Admin does client-side workaround               |
| 5   | `username` field on `UserReadDTO`                            | Shows `"—"` in admin panel                      |

---

## Appendix: Adding a New Page

1. Create `src/pages/MyPage.tsx`
2. Add lazy import in `src/main.tsx` and wrap with `withBoundary()`
3. Add route in `createBrowserRouter`
4. Add nav item in `navItems.ts` with a `labelKey`
5. Add translations in `src/locales/en/nav.json` + `src/locales/hu/nav.json`
6. Use `useSettings()` + theme helpers for all styling

```tsx
export function MyPage() {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const bgClass = getBackgroundClasses(useLiquidGlass, useDarkMode);

  return (
    <div className="p-4 min-h-screen w-full flex flex-col">
      <Navbar />
      <div className={`mt-20 ${bgClass} ${textColor} rounded-xl p-6`}>
        {/* content */}
      </div>
    </div>
  );
}
```
