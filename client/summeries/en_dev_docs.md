# SMAASH Web Client — Developer Documentation

## Stack at a Glance

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9, strict mode |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Animation | motion/react (Framer Motion v11) |
| Server state | TanStack Query v5 (React Query) |
| HTTP client | Axios |
| Schema validation | Zod |
| Routing | React Router DOM v7 |
| Internationalization | i18next (English and Hungarian) |
| Testing | Vitest + @testing-library/react |

The application is a single-page app served under the `/app/` base path. It communicates with a Go backend over a REST API at `/api/`. Session auth is cookie-based — no tokens ever touch JavaScript memory.

---

## Project Layout

```
client/
  src/
    main.tsx                router definition, lazy-loaded routes
    RootLayout.tsx          global providers, React Query client
    App.tsx                 root redirect (login vs releases)
    Wrapper.tsx             background animation, CSS variable emission
    index.css               global styles, @keyframes for CSS animations
    App.css                 App-specific styles
    test-setup.ts           Vitest global setup (extends expect with jest-dom matchers)
    context/                Auth, SecurityKey, Navbar contexts and providers
    hooks/                  React Query hooks (data fetching)
    lib/                    shared utilities, constants, schemas, config
    components/             shared UI components, guards, debug overlays
    backgrounds/            animated background components
    animations/             motion wrappers and animation primitives
    pages/                  feature pages (one directory per page)
    locales/                i18n JSON files (en/, hu/)
    assets/                 static files (flags, OS logos, audio tracks)
  summeries/                documentation files (this directory)
  vite.config.ts
  tsconfig.app.json
  package.json
```

**`context/`** holds only `AuthProvider`, `AuthContext`, `SecurityKeyProvider`, `SecurityKeyContext`, `NavbarContext`, and `NavbarContextUtils`. Feature-local providers (`SettingsProvider`, `ColorProvider`, `ProfileProvider`) live in their respective page directories.

---

## Route Table

| Path | Component | Bundle |
|---|---|---|
| `/app` | `App` | eager |
| `/app/login` | `LoginPage` | eager |
| `/app/signup` | `SignUpPage` | eager |
| `/app/reset-password` | `PasswordResetPage` | eager |
| `/app/releases` | `ReleasesPage` | lazy, ErrorBoundary |
| `/app/leaderboard` | `LeaderboardPage` | lazy, ErrorBoundary |
| `/app/gallery` | `GalleryPage` | lazy, ErrorBoundary |
| `/app/webstore` | `WebstorePage` | lazy, ErrorBoundary |
| `/app/news` | `NewsPage` | lazy, ErrorBoundary |
| `/app/profile` | `ProfilePage` | lazy, ErrorBoundary |
| `/app/settings` | `SettingsPage` | lazy, ErrorBoundary |
| `/app/profile-selector` | `ProfileSelectorPage` | lazy, ErrorBoundary |
| `/app/admin` | `AdminPage` | lazy, ErrorBoundary |
| `/app/debug` | `DebugPage` | lazy, ErrorBoundary |
| `*` | `NotFoundPage` | lazy, no ErrorBoundary |

Auth pages (`/app/login`, `/app/signup`, `/app/reset-password`) are eagerly imported so they land in the initial bundle. All protected routes are children of a `RequireAuth` outlet. The `NotFoundPage` catchall is intentionally not wrapped in an `ErrorBoundary` — it renders outside the `RequireAuth` outlet so unauthenticated users also see 404 pages correctly.

---

## Entry Points

### `src/main.tsx`

Creates the React Router with `createBrowserRouter`. The `withBoundary` helper wraps a route element in `<ErrorBoundary>`:

```typescript
function withBoundary(element: React.ReactNode) {
  return <ErrorBoundary>{element}</ErrorBoundary>;
}
```

Lazy pages use the named-export pattern:

```typescript
const ReleasesPage = lazy(() =>
  import("./pages/releases/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

The router is created in module scope and passed to `<RouterProvider>` inside a `<StrictMode>` wrapper.

### `src/RootLayout.tsx`

Rendered by React Router as the parent of all routes. Holds the React Query client, all context providers, and the Suspense fallback.

**React Query client configuration:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,    // 2 minutes before background refetch
      gcTime: 10 * 60 * 1000,       // 10 minutes before cache eviction
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: "online",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});
```

The client uses `PersistQueryClientProvider` backed by `createSyncStoragePersister` with `localStorage`. The query cache survives a hard browser refresh. Auth queries (`whoami`) are excluded from persistence (`gcTime: 0`, `staleTime: 0`) so stale sessions are never served from cache.

**`MotionWrapper` (defined in `RootLayout.tsx`)** reads two sources to determine animation behaviour:

```typescript
function MotionWrapper({ children }: { children: React.ReactNode }) {
  const { settings: dbg } = useDebugSettings();
  const { settings } = useSettings();
  const duration = SPEED_TO_MOTION[dbg.animationSpeed] ?? 0.3;
  const noMotion = !settings.useAnimations || dbg.forceReducedMotion;
  return (
    <MotionConfig transition={{ duration }} reducedMotion={noMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
```

`SPEED_TO_MOTION` maps the debug speed slider to a transition duration in seconds:

```typescript
const SPEED_TO_MOTION: Record<number, number> = {
  0.25: 2,    // very slow
  0.5:  0.8,
  1:    0.3,  // default
  2:    0.1,
  4:    0.05, // very fast
};
```

When `noMotion` is `true` (either `useAnimations` is off or `forceReducedMotion` is on), `reducedMotion="always"` is passed to `MotionConfig`, which instructs `motion/react` to apply the reduced-motion preset to all child transitions. When `noMotion` is `false`, `reducedMotion="never"` overrides the OS-level `prefers-reduced-motion` media query so that the app's animation toggle has sole authority over motion behaviour.

**Debug overlays and Toaster placement** inside `RootLayout`:

- `<Toaster />` is inside `MotionWrapper` but outside `<Wrapper>`, rendering as a sibling to the page content.
- In development (`import.meta.env.DEV`), `<DebugEffects />`, `<DebugOverlay />`, `<BreakpointOverlay />`, and `<ElementInspectorOverlay />` are also inside `MotionWrapper` but outside `<Wrapper>`.
- `<ReactQueryDevtools />` is inside `PersistQueryClientProvider` but outside `AuthProvider` and the rest of the provider stack.

**reCAPTCHA scope:** `GoogleReCaptchaProvider` is NOT in `RootLayout`. It lives only inside `SignUpPage.tsx`, scoped only around the signup form. This prevents the reCAPTCHA badge and script from loading on every page.

### `src/App.tsx`

Handles the `/app` root redirect. Reads `isLoggedIn` and `isInitializing` from `AuthContext`. While initializing, renders a centered spinner. After initialization, redirects to `/app/releases` (logged in) or `/app/login` (not logged in).

### `src/Wrapper.tsx`

Wraps all page content. Reads `ColorContext` (three gradient hex strings and the resolved `animationKey`) and `SettingsContext`.

**CSS variable computation and gradient:** computed with `useMemo` keyed to the three gradient colors and `useDarkMode`:

```typescript
const themeAverage = getAverageHexColor([colorLeft, colorMiddle, colorRight]);
const themeAccent       = lightenHexColor(themeAverage, useDarkMode ? 0.08 : 0.02);
const themeAccentHover  = lightenHexColor(themeAverage, useDarkMode ? 0.22 : 0.14);
const themeAccentSoft   = toRgbaColor(themeAverage, useDarkMode ? 0.32 : 0.25);
const themeNavBorder    = themeAverage;
const themeNavShadow    = toRgbaColor(
  lightenHexColor(themeAverage, useDarkMode ? 0.25 : 0.16),
  useDarkMode ? 0.42 : 0.34,
);
```

Five CSS custom properties are set as inline `style` props on the root wrapper `<div>` (not on `document.documentElement`):

| Variable | Source |
|---|---|
| `--theme-accent` | `lightenHexColor(themeAverage, ...)` |
| `--theme-accent-hover` | `lightenHexColor(themeAverage, ...)` with larger amount |
| `--theme-accent-soft` | `toRgbaColor(themeAverage, ...)` |
| `--theme-nav-border` | `themeAverage` directly |
| `--theme-nav-shadow` | `toRgbaColor(lightenHexColor(themeAverage, ...), ...)` |

`themeAverage` is the arithmetic mean of all three gradient stop colors. All five variables cascade to every element inside the wrapper.

**Text color:** `getTextColor(useLiquidGlass, useDarkMode)` from `themeClasses.ts` is applied as a Tailwind class on the wrapper div. Liquid glass mode always yields `text-white`; non-glass dark mode yields `text-white`; non-glass light mode yields `text-gray-900`.

**Animation resolution:**

```
animationOverride === null   → use theme's animationKey from ColorContext
animationOverride === "none" → no background rendered
animationOverride === "custom" && effectMix has enabled effects → CompositeBackground
animationOverride === <AnimationKey> → pin to that specific AnimatedBackground
```

When `useAnimations` is false the background still renders but receives `paused={true}`, freezing all canvas/CSS animations without unmounting them.

---

## Provider Architecture

Providers are stacked in `RootLayout.tsx` in this exact order:

```
PersistQueryClientProvider   ← React Query cache and localStorage persistence
  AuthProvider               ← resolves identity from /users/whoami
    SecurityKeyProvider      ← security key state for password reset flow
      SettingsProvider       ← loads user preferences before anything visual renders
        NavbarProvider       ← dropdown open/hover state
          ColorProvider      ← manages gradient colors and animation key
            ProfileProvider  ← needs userId (from auth) to load selected profile
              MotionWrapper  ← MotionConfig: global transition duration and reduced-motion
                Wrapper      ← gradient background, CSS variables, animated background
                  Suspense   ← centered spinner fallback for lazy routes
                    Outlet   ← actual page content
                Toaster      ← toast notification overlay (sibling of Wrapper)
                [DEV] DebugEffects, DebugOverlay, BreakpointOverlay, ElementInspectorOverlay
  [DEV] ReactQueryDevtools   ← outside all providers, inside PersistQueryClientProvider
```

`ColorProvider` must run after `SettingsProvider` because it reads `useLiquidGlass` and `useDarkMode` when computing which CSS values to emit. `ProfileProvider` must run after `AuthProvider` because it needs `userId` to key the profile query.

---

## Authentication

### Session Model

The session is managed server-side via an HTTP-only cookie. The client has no access to the token value — this eliminates XSS token-theft attacks. The only way the client knows it is authenticated is by successfully calling `/api/users/whoami`.

### AuthProvider (`src/context/AuthProvider.tsx`)

On mount, fires `GET /users/whoami` via `useWhoAmIQuery`. Uses a two-phase initialization guard:

```typescript
const [isAuthSettled, setIsAuthSettled] = useState(false);

useEffect(() => {
  if (isLoading) return;

  if (data?.id) {
    setUserId(BigInt(data.id));
    setIsAdmin(data.role === "admin");
    setIsSupport(data.role === "support");
    setIsLoggedIn(true);
  } else {
    setIsLoggedIn(false);
    setUserId(null);
    setIsAdmin(false);
    setIsSupport(false);
  }

  setIsAuthSettled(true);
}, [data, isLoading]);
```

`isInitializing` is `true` while either the query is still loading or the effect has not yet run. This prevents a race where the router redirects to `/app/login` before the session check completes.

### AuthContext (`src/context/AuthContext.ts`)

```typescript
interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  isInitializing: boolean;
  userId: bigint | null;
  setUserId: (v: bigint | null) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  isSupport: boolean;
  setIsSupport: (v: boolean) => void;
}
```

`userId` is stored as `bigint` because Go's `uint64` exceeds the JavaScript `number` safe integer range.

### RequireAuth (`src/components/RequireAuth.tsx`)

Route guard component used as a layout route in the router:

- `isInitializing` is `true` → render a spinner
- `isLoggedIn` is `false` → `<Navigate to="/app/login" state={{ from: location }}>`
- `isLoggedIn` is `true` → render `<Outlet />`

The `state.from` location is preserved so the login page can redirect back to the originally requested URL after a successful login.

Admin and debug pages perform a secondary role check inside the component after the route guard passes:

```typescript
if (!isAdmin) return <NotFoundPage />;
```

### 401 Handling in the API Client

`apiClient.ts` has a response interceptor that catches 401 errors. Auth endpoints are excluded to avoid redirect loops when the user enters a wrong password:

```typescript
const isAuthEndpoint =
  requestUrl.includes("/auth/") || requestUrl.includes("/users/whoami");

if (error.response.status === 401 && !isAuthEndpoint) {
  window.location.href = "/app/login";
  return new Promise(() => {});
}
```

The never-resolving promise prevents in-flight UI from trying to render an error state on a page that is about to be navigated away.

---

## API Client (`src/lib/apiClient.ts`)

Creates a shared Axios instance:

```typescript
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
```

**Request interceptor** handles two things:

1. **Debug network delay**: reads `networkDelayMs` and `networkJitterMs` from `localStorage["debug-settings"]` and sleeps for a computed duration before the request proceeds.

2. **Content-Type header**: sets `application/json` automatically unless the body is a `FormData` object, in which case the header is deleted so the browser can set the correct `multipart/form-data; boundary=...` automatically:

```typescript
const isFormData = config.data instanceof FormData;
if (isFormData) {
  delete config.headers["Content-Type"];
  return config;
}
config.headers["Content-Type"] = "application/json";
```

**Response interceptor** handles 401 errors as described in the Authentication section.

---

## API Schema Validation (`src/lib/apiSchemas.ts`)

Uses Zod to define runtime schemas for known API responses. `validateKnownApiResponse` matches an HTTP method and URL path against a rule list:

```typescript
const KNOWN_RESPONSE_SCHEMAS: KnownSchemaRule[] = [
  { method: "post", path: /^\/auth\/login$/,             schema: loginResponseSchema },
  { method: "get",  path: /^\/users\/whoami$/,           schema: whoAmIResponseSchema },
  { method: "get",  path: /^\/users\/\d+\/profiles$/,    schema: profileListSchema },
  { method: "get",  path: /^\/items$/,                   schema: itemListSchema },
  { method: "get",  path: /^\/profiles\/\d+\/purchases$/, schema: purchaseListSchema },
];
```

If the response data does not match the schema, the function throws with a message listing every failing field. Unmatched routes return `{ matched: false, data }` and pass through unchanged. This surfaces backend contract violations immediately in development rather than silently producing downstream runtime errors.

Hooks in `useDebug.ts` intentionally bypass `validateKnownApiResponse` because debug endpoints return ad-hoc shapes that are not included in the schema registry.

---

## React Query Keys

### Main query keys (`src/lib/queryKeys.ts`)

```typescript
export const queryKeys = {
  profiles: {
    all: ["profiles"],
    byUserId: (userId: number) => ["profiles", "byUserId", userId],
  },
  githubReleases: { all: ["githubReleases"] },
  characters: {
    all: ["characters"],
    ownedByProfileId: (profileId: number) => ["characters", "owned", profileId],
  },
  purchases: {
    byProfileId: (profileId: number) => ["purchases", "byProfileId", profileId],
  },
};
```

### Admin query keys (`src/hooks/useAdmin.ts`)

```typescript
export const adminQueryKeys = {
  users: {
    all: ["admin", "users"] as const,
    search: (q: string) => ["admin", "users", "search", q] as const,
  },
};
```

### Debug query keys (`src/hooks/useDebug.ts`)

```typescript
export const debugQueryKeys = {
  topItems:   ["debug", "stats", "topItems"] as const,
  topPlayers: ["debug", "stats", "topPlayers"] as const,
  topLevels:  ["debug", "stats", "topLevels"] as const,
  leaderboard:["debug", "stats", "leaderboard"] as const,
  characters: ["debug", "game", "characters"] as const,
  levels:     ["debug", "game", "levels"] as const,
  profiles:   ["debug", "db", "profiles"] as const,
  purchases:  ["debug", "db", "purchases"] as const,
  roles:      ["debug", "db", "roles"] as const,
  categories: ["debug", "db", "categories"] as const,
  rarities:   ["debug", "db", "rarities"] as const,
  posts:      ["debug", "db", "posts"] as const,
};
```

Always use the key factories rather than inline arrays. Invalidating all profile queries looks like:

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.profiles.byUserId(userId) });
```

---

## Auth Hooks (`src/hooks/useAuth.ts`)

**`useWhoAmIQuery()`** — `GET /users/whoami`. `staleTime: 0` and `gcTime: 0` ensure this query never serves data from the persisted cache. `retry: false` so a 401 fails immediately.

The response shape:

```typescript
interface WhoAmIResponse {
  id: number;
  email: string;
  role: string;         // "admin" | "support" | "user"
  is_banned: boolean;
  last_login: string;
}
```

**`useLoginMutation()`** — `POST /auth/login` with `{ email, password }`. Returns `{ id, role }`.

**`useSignupMutation()`** — `POST /auth/signup` with `{ email, password, role_id: 1 }`. Returns `{ id, email, security_key }`.

**`useLogoutMutation()`** — `POST /auth/logout`. On success calls `queryClient.clear()` rather than `invalidateQueries`. `clear()` wipes the cache without scheduling refetches; `invalidateQueries` would trigger refetches against the now-invalid session, racing with the redirect.

**`useChangePasswordMutation()`** — `PUT /auth/change-password` with `{ email, security_key, new_password }`. Returns `{ new_key }`. The caller must display the new security key to the user — it is not stored anywhere.

**`useUpdateUserEmailMutation()`** — `PUT /users/:id` with `{ id, email, role_id: 0 }`. The `role_id: 0` is intentional — GORM's `Updates()` skips zero-value fields, so the role is left unchanged. On success, invalidates `["auth", "whoami"]` so the navbar reflects the updated email.

---

## Profile Hooks (`src/hooks/useProfile.ts`)

**`useProfilesQuery(userId)`** — `GET /users/:id/profiles`. Returns a list of profiles. `staleTime: 0` ensures mutations always trigger a fresh fetch. `avatar_url` on each profile is rewritten by `getProfilePictureUrl` to inject the `?v=` cache-busting parameter.

**`useAddProfileMutation()`** — `POST /users/:id/profiles`. If a picture is provided, `uploadProfilePicture` is called after the profile is created. Profile creation succeeds even if the upload fails. Invalidates and refetches the profile list on success.

**`useUploadProfilePictureMutation()`** — `POST /profiles/:id/pfp` with `FormData`. On success, stamps a version counter in `sessionStorage` and updates the cached `avatar_url` via `queryClient.setQueriesData` without a network request:

```typescript
queryClient.setQueriesData<ProfileResponse[]>(
  { queryKey: queryKeys.profiles.all },
  (cached) =>
    cached?.map((p) =>
      p.id === profileId
        ? { ...p, avatar_url: getProfilePictureUrl(profileId) }
        : p,
    ),
);
```

**`useUpdateProfileMutation()`** — `PUT /profiles/:id`. Supports optimistic UI: the display name is updated in the cache immediately before the request resolves. The `invalidateAfterSuccess` flag controls whether a server refetch follows.

**`useDeleteProfileMutation()`** — `DELETE /profiles/:id`. Full optimistic removal: cancels in-flight queries, snapshots the current list, removes the profile from the cache immediately, and restores the snapshot on error.

---

## Admin Hooks (`src/hooks/useAdmin.ts`)

### Types

**`AdminUserDTO`** — matches the backend `UserReadDTO`:

```typescript
interface AdminUserDTO {
  id: number;
  email: string;
  username?: string;   // not yet returned by backend; UI falls back to email
  role: string;
  is_banned: boolean;
  banned_until: string; // formatted datetime; empty string = not banned
  last_login: string;
}
```

**`BanPayload`** — frontend representation of a ban request:

```typescript
interface BanPayload {
  ban_type: "permanent" | "temporary";
  ban_until?: string;  // ISO 8601; required when ban_type is "temporary"
  reason?: string;
}
```

A "permanent" ban is approximated as `PERMANENT_BAN_MINUTES = 1_000 × 365 × 24 × 60` (≈ 50 years) because the backend stores a concrete `BannedUntil` timestamp rather than an indefinite flag.

### Queries

**`useAdminUsersQuery(searchQuery?)`** — `GET /api/users`. `staleTime: 30s`. The backend does not currently support `?search=` filtering; all filtering is done client-side.

### Mutations

**`useBanUserMutation()`** — `POST /api/users/:id/ban` with `{ id, period }` where `period` is in minutes. Converts `BanPayload` to minutes via `banPayloadToMinutes`. Invalidates `adminQueryKeys.users.all` on success.

**`useUnbanUserMutation()`** — `POST /api/users/:id/unban`. No body. Invalidates user list on success.

**`usePromoteUserMutation()`** — `POST /api/users/:id/promote` with `{ id, target_role: "admin" | "support" }`. Invalidates user list on success.

**`useDemoteUserMutation()`** — `POST /api/users/:id/demote`. No body. Returns the user to the base `"user"` role. Invalidates user list on success.

---

## Debug Hooks (`src/hooks/useDebug.ts`)

All hooks in this file use `apiClient` directly and bypass `validateKnownApiResponse`. None of their response types are in the Zod schema registry.

### DTOs

| Type | Fields |
|---|---|
| `TopItemDTO` | id, name, description, price, rarity, categories[], count_of_purchases |
| `TopPlayerDTO` | id, display_name, coins, count_of_matches |
| `TopLevelDTO` | id, name, img_uri, count_of_plays |
| `BestPlayerDTO` | id, display_name, coins, count_of_wins |
| `DebugCharacterDTO` | id, name, img_uri |
| `DebugLevelDTO` | id, name, img_uri |
| `AdminProfileDTO` | id, display_name, user_id, coins, pfp_uri |
| `PurchaseDTO` | id, player_profile_id, character_id, count |
| `RoleDTO` | id, name |
| `CategoryDTO` | id, name |
| `RarityDTO` | id, name |
| `PostDTO` | id, created_at, updated_at |

### Stats queries (also consumed by LeaderboardPage)

- **`useTopItemsQuery()`** — `GET /stats/top/items`. `staleTime: 60s`.
- **`useTopPlayersQuery()`** — `GET /stats/top/players`. `staleTime: 60s`.
- **`useTopLevelsQuery()`** — `GET /stats/top/levels`. `staleTime: 60s`.
- **`useLeaderboardQuery()`** — `GET /stats/leaderboard`. `staleTime: 60s`.

### Game data queries and mutations

- **`useDebugCharactersQuery()`** — `GET /characters`. `staleTime: 2m`.
- **`useDebugLevelsQuery()`** — `GET /levels`. `staleTime: 2m`.
- **`useCreateCharacterMutation()`** — `POST /characters` with `{ name }`. Invalidates characters.
- **`useUpdateCharacterMutation()`** — `PUT /characters/:id` with `{ name }`. Invalidates characters.
- **`useDeleteCharacterMutation()`** — `DELETE /characters/:id`. Invalidates characters.
- **`useCreateLevelMutation()`** — `POST /levels` with `{ name }`. Invalidates levels.
- **`useUpdateLevelMutation()`** — `PUT /levels/:id` with `{ name }`. Invalidates levels.
- **`useDeleteLevelMutation()`** — `DELETE /levels/:id`. Invalidates levels.

### DB panel queries

- **`useAdminProfilesQuery()`** — `GET /profiles?page=1&page_size=200`. `staleTime: 30s`.
- **`useAdminPurchasesQuery()`** — `GET /purchases`. `staleTime: 30s`.
- **`useRolesQuery()`** — `GET /roles`. `staleTime: 5m`.
- **`useCategoriesQuery()`** — `GET /categories`. `staleTime: 5m`.
- **`useRaritiesQuery()`** — `GET /rarities`. `staleTime: 5m`.
- **`usePostsQuery()`** — `GET /posts?page=1&page_size=100`. `staleTime: 30s`.

### DB panel mutations

- **`useUpdateProfileMutation()`** — `PUT /profiles/:id` with `{ display_name, coins }`. Invalidates DB profiles.
- **`useDeleteProfileMutation()`** — `DELETE /profiles/:id`. Cascades to purchases. Invalidates DB profiles.
- **`useCreatePurchaseMutation()`** — `POST /purchases` with `{ player_profile_id, character_id }`. Deducts coins automatically on the backend. Invalidates purchases.
- **`useUpdatePurchaseMutation()`** — `PUT /purchases/:id`. Invalidates purchases.
- **`useDeletePurchaseMutation()`** — `DELETE /purchases/:id`. Invalidates purchases.
- **`useCreateRoleMutation()`** — `POST /roles` with `{ name }`. Invalidates roles.
- **`useUpdateRoleMutation()`** — `PUT /roles/:id` with `{ name }`. Invalidates roles.
- **`useDeleteRoleMutation()`** — `DELETE /roles/:id`. Invalidates roles.
- **`useCreateCategoryMutation()`** — `POST /categories` with `{ name }`. Invalidates categories.
- **`useUpdateCategoryMutation()`** — `PUT /categories/:id` with `{ name }`. Invalidates categories.
- **`useDeleteCategoryMutation()`** — `DELETE /categories/:id`. Invalidates categories.
- **`useCreateRarityMutation()`** — `POST /rarities` with `{ name }`. Invalidates rarities.
- **`useUpdateRarityMutation()`** — `PUT /rarities/:id` with `{ name }`. Invalidates rarities.
- **`useDeleteRarityMutation()`** — `DELETE /rarities/:id`. Invalidates rarities.
- **`useCreatePostMutation()`** — `POST /posts`. Invalidates posts.
- **`useUpdatePostMutation()`** — `PUT /posts/:id`. Invalidates posts.
- **`useUpdateUserMutation()`** — `PUT /users/:id` with `{ email, role_id? }`. Cannot change passwords via this endpoint. Invalidates admin user list.
- **`useDeleteUserMutation()`** — `DELETE /users/:id`. Cascades to profiles, purchases, and match records. Invalidates admin user list.

---

## Debug Settings Hook (`src/hooks/useDebugSettings.ts`)

Provides `useDebugSettings()` (React hook) and `getDebugSettings()` (plain function callable outside components). Both read from `localStorage["debug-settings"]`.

The full settings shape:

```typescript
{
  animationSpeed: number;        // maps to SPEED_TO_MOTION in MotionWrapper
  forceReducedMotion: boolean;   // disables all motion/react transitions
  compactDensity: boolean;
  safeAreaOutlines: boolean;
  forceViewportEnabled: boolean;
  forceViewportPreset: string;
  forceViewportWidth: number;
  forceViewportHeight: number;
  noBackdropBlur: boolean;
  layoutBorders: boolean;
  navbarOverride: string;
  networkDelayMs: number;        // used by apiClient request interceptor
  networkJitterMs: number;       // used by apiClient request interceptor
  showFps: boolean;
  showScrollPos: boolean;
  showBreakpointBadge: boolean;
  clickTargetChecker: boolean;
  zIndexInspector: boolean;
  elementInspector: boolean;
}
```

Changes are broadcast via a custom DOM event so multiple hook instances in different parts of the tree stay in sync without a React context:

```typescript
window.dispatchEvent(new CustomEvent("debug-settings", { detail: next }));
```

---

## Scroll Direction Hook (`src/hooks/useScrollDirection.ts`)

```typescript
export function useScrollDirection(threshold = 8): boolean
```

Returns a `hidden` boolean. Attaches a passive `scroll` listener to `window`. The value flips to `true` only when the user scrolls down **and** `scrollY > 80` — this prevents the navbar from hiding before the user has scrolled past the top fold. The value returns to `false` when the user scrolls up. The `threshold` parameter (default 8 px) requires a minimum scroll delta before the direction is committed, preventing jitter on elastic/momentum scrolling.

Used by the navbar to hide on scroll-down and reveal on scroll-up.

---

## Hook Barrel (`src/hooks/useQueryHooks.ts`)

Re-exports everything from `useAuth.ts` and `useProfile.ts`. Page components that need multiple hooks from both files can import from this single barrel instead of two separate paths.

---

## Profile Picture Caching

Profile pictures are served at `/api/profiles/:id/pfp`. Because the URL path never changes after upload, a browser cache hit would show the old image forever. The client tracks a version counter per profile in `sessionStorage` under the key `pfp_versions`:

```typescript
function getProfilePictureUrl(profileId: number): string {
  const version = pfpVersions.get(profileId);
  return `/api/profiles/${profileId}/pfp${version ? `?v=${version}` : ""}`;
}
```

After a successful upload, `Date.now()` is written as the new version. Because the version is in `sessionStorage`, it survives component remounts within the same browser tab but resets when the tab is closed.

Client-side validation in `useProfile.ts` enforces `MAX_PFP_SIZE_BYTES = 5 * 1024 * 1024` (5 MB) and checks `file.type` against `ACCEPTED_IMAGE_TYPES` before making any HTTP request.

---

## Profiles Context (`src/pages/profile-selector/ProfilesContext.tsx`)

**`ProfileProvider`** manages the active profile selection. It stores the selected profile ID in `localStorage` keyed by `userId`, so each user account remembers its own last-selected profile independently.

On mount it calls `useProfilesQuery(userId)`. When profiles load, it restores the previously selected profile from storage, falling back to the first profile in the list if none is stored or the stored ID no longer exists.

Exposes through context:
- `profiles`: list of `Profile` objects with a computed `avatar_url`
- `selectedProfile`: the currently active `Profile | null`
- `setSelectedProfile(profile)`: persists the selection to storage
- `addProfile(params)` / `deleteProfile(id)`: mutations with cache invalidation
- `isLoading` / `isError`

**`useProfiles()`** — thin hook that reads `ProfilesContext`. Used by the navbar and profile-selector page.

---

## Settings System (`src/pages/settings/SettingsContext.tsx`)

**`SettingsProvider`** persists settings to `localStorage["settings"]`. The full state shape:

```typescript
interface SettingsState {
  useAnimations: boolean;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  language: "en" | "hu";
  animationOverride: AnimationKey | "none" | "custom" | null;
}
```

- `animationOverride: null` — use the active theme's default animation.
- `animationOverride: "none"` — disable the background entirely.
- `animationOverride: "custom"` — activate the composite layer system.
- Any `AnimationKey` string — force that specific animation regardless of theme.

Settings are initialized from storage synchronously in the `useState` initializer, so there is no flash-of-default-settings on load. A `useEffect` persists changes back to storage after every update. A separate `useEffect` calls `i18n.changeLanguage` whenever `language` changes.

**`useSettings()`** — hook that reads `SettingsContext`. Returns `{ settings, updateSetting }`. `updateSetting(key, value)` applies a partial update.

---

## Color System (`src/pages/settings/ColorProvider.tsx`)

**`ColorProvider`** manages the three gradient stop colors (`colorLeft`, `colorMiddle`, `colorRight`), the active `animationKey`, and the `effectMix` (composite layer configuration). All values are persisted to `localStorage`.

**`ColorContext`** (`src/pages/settings/ColorContext.ts`) defines the context type:

```typescript
interface ColorContextType {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  setColorLeft: (v: string) => void;
  setColorMiddle: (v: string) => void;
  setColorRight: (v: string) => void;
  animationKey: AnimationKey | null;
  setAnimationKey: (v: AnimationKey | null) => void;
  effectMix: EffectLayerConfig | null;
  setEffectMix: (v: EffectLayerConfig | null) => void;
}
```

`effectMix` is a partial map of `AnimationKey → SubEffects`. It defines which layers are active in composite mode.

---

## Theme System (`src/pages/settings/Themes.ts`)

Defines 18 preset themes. Each theme has three gradient color stops and an optional default animation:

```typescript
interface Theme {
  name: string;
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  animationKey?: AnimationKey;
}
```

| Theme | Animation |
|---|---|
| Azure | — |
| Slate | Storm |
| Emerald | Sakura |
| Amethyst | Lava Lamp |
| Coral | — |
| Sunset | Sakura |
| Ocean | Fishtank |
| Lavender | Aurora |
| Midnight | Deep Space |
| Fire | Lava Lamp |
| Aurora | Aurora |
| Neon Noir | Synthwave |
| Rose Gold | Sakura |
| Monsoon | Puddle Ripples |
| Nebula | Particle Web |
| Abyss | Bioluminescence |
| Starmap | Constellation |
| Void | Void |

`applyTheme(theme, context)` writes the three colors and the animation key into `ColorContext` in a single call:

```typescript
export const applyTheme = (theme: Theme, context: ColorContextType) => {
  context.setColorLeft(theme.colorLeft);
  context.setColorMiddle(theme.colorMiddle);
  context.setColorRight(theme.colorRight);
  context.setAnimationKey(theme.animationKey ?? null);
};
```

---

## Animation System

### AnimationKey (`src/lib/animationTypes.ts`)

```typescript
type AnimationKey =
  | "fishtank" | "deepspace" | "aurora" | "lavalamp" | "synthwave"
  | "sakura" | "storm" | "particleweb" | "puddleripples" | "bioluminescence"
  | "constellation" | "void";
```

Each animation has its own `SubEffects` interface defining toggleable layers. Examples:

```typescript
interface FishtankSubEffects {
  showFish: boolean;
  showBubbles: boolean;
  showSeaweed: boolean;
  showCaustics: boolean;
  showLightShafts: boolean;
}

interface StormSubEffects {
  showRain: boolean;
  showLightning: boolean;
  showClouds: boolean;
  showGroundShimmer: boolean;
}
```

`DEFAULT_SUB_EFFECTS` defines the initial state for every animation with all layers enabled.

`hasEnabledEffects(effectMix)` returns `true` if at least one animation in the `EffectLayerConfig` has at least one sub-effect enabled. `Wrapper` uses this to decide whether to mount `CompositeBackground`.

---

## Background Components (`src/backgrounds/`)

| File | Purpose |
|---|---|
| `AnimatedBackground.tsx` | Dispatcher: receives an `AnimationKey` and renders the matching background |
| `AuroraBackground.tsx` | Flowing aurora borealis effect |
| `BioluminescenceBackground.tsx` | Deep ocean bioluminescence particles |
| `CompositeBackground.tsx` | Renders multiple backgrounds as stacked `position: absolute` layers |
| `ConstellationBackground.tsx` | Star constellation with connecting lines |
| `DeepSpaceBackground.tsx` | Stars and nebula in deep space |
| `FishtankBackground.tsx` | Animated fish tank with fish, bubbles, seaweed, caustics, light shafts |
| `LavaLampBackground.tsx` | Rising lava lamp blobs |
| `ParticleWebBackground.tsx` | Connected particle web |
| `PuddleRipplesBackground.tsx` | Animated puddle ripples |
| `SakuraBackground.tsx` | Falling cherry blossom petals |
| `StormBackground.tsx` | Rain, lightning, clouds, and ground shimmer |
| `SynthwaveBackground.tsx` | Retrowave grid and sun |
| `VoidBackground.tsx` | Dark void with subtle particle movement |

All background components accept `colorLeft`, `colorMiddle`, `colorRight`, and `paused` props. When `paused` is `true`, all canvas rendering and CSS animations freeze in place without unmounting.

`CompositeBackground` receives an `effectMix` (`EffectLayerConfig`) and renders each enabled animation as an independent layer, stacking them via `position: absolute`. Layers with no enabled sub-effects do not mount.

---

## Animation Primitives (`src/animations/`)

| File | Purpose |
|---|---|
| `AnimatedAccordion.tsx` | Height-animating accordion expand/collapse |
| `AnimatedPress.tsx` | Scale-down press feedback wrapper |
| `CardAnimation.tsx` | Spring-based card entry animation |
| `ColorInterpolation.tsx` | Smoothly interpolates between two colors over time |
| `LoadPost.tsx` | Staggered list-entry animation for news posts |
| `NavbarAnimation.tsx` | Navbar slide-in/out wrapper |

These components wrap `motion/react` primitives and apply project-standard transition presets. Page components use these rather than raw `motion.div` elements to stay consistent with the global `MotionConfig` duration and reduced-motion settings.

---

## Toast System (`src/lib/toast.ts`)

A zero-dependency pub/sub notification system. Maintains a module-level array of `ToastItem` objects and a set of listener callbacks. The `Toaster` component in `RootLayout` subscribes to this store.

```typescript
toast.success("Profile saved.");
toast.error("Upload failed.");
toast.info("Loading...");
```

Toasts auto-dismiss after 4000 ms. No external library involved.

---

## Internationalization (`src/lib/i18n.ts`)

Configures i18next with 12 namespaces per language: `auth`, `nav`, `settings`, `profile`, `releases`, `news`, `webstore`, `admin`, `common`, `debug`, `gallery`, `leaderboard`. Both `en` and `hu` locales are bundled at build time — there are no runtime network fetches for translation files.

```typescript
i18n.use(initReactI18next).init({
  resources: { en: { auth: enAuth, nav: enNav, /* ... */ }, hu: { /* ... */ } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
```

The initial `lng: "en"` is overridden at startup when `SettingsProvider` calls `i18n.changeLanguage(settings.language)`. Components consume translations with:

```typescript
const { t } = useTranslation("webstore");
return <p>{t("item.purchase")}</p>;
```

---

## Username Generator (`src/lib/generateUsername.ts`)

Generates display name suggestions from two static arrays — **110 adjective prefixes** (Fluffy, Cosmic, Majestic, etc.) and **109 suffixes** drawn from animal sounds and nature words (Paws, Thunder, Ember, etc.). Used in the signup and profile creation flows:

```typescript
const { prefix, suffix } = generateRandomUsername();
// Example: { prefix: "Cosmic", suffix: "Thunder" }
```

---

## Item Constants (`src/lib/constants/itemConstants.ts`)

```typescript
export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
export const COMBAT_TYPES = ["Melee", "Ranged"] as const;

export const RARITY_COLORS: Record<string, string> = {
  Common:    "#9ca3af",
  Uncommon:  "#10b981",
  Rare:      "#3b82f6",
  Epic:      "#8b5cf6",
  Legendary: "#f59e0b",
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
```

`ACCEPTED_IMAGE_TYPES` is also referenced in `useProfile.ts` to validate picture uploads before the HTTP request is made. `RARITY_COLORS` drives the colored rarity labels in the webstore.

---

## Components (`src/components/`)

### `ErrorBoundary.tsx`

Class component implementing `getDerivedStateFromError` and `componentDidCatch`. Accepts an optional `fallback` prop. Default fallback is a centered card with "Something went wrong on this page." and the `error.message`. A "Try again" button resets `hasError` to `false`.

Every lazy-loaded route is wrapped with `withBoundary` in `main.tsx`. A crash on one page renders the error card inside the layout rather than breaking the entire application.

### `RequireAuth.tsx`

Functional component using React Router's `<Outlet>` pattern. Reads `isLoggedIn` and `isInitializing` from `AuthContext`. Described in the Authentication section.

### `ImageCropDialog.tsx`

Dialog component for cropping images before upload. Used in profile picture upload flows. Renders a crop interface and emits the cropped `File` or `Blob` result when the user confirms.

---

## Navbar Context (`src/context/NavbarContext.tsx` / `NavbarContextUtils.ts`)

**`NavbarProvider`** holds two booleans:
- `isDropdownHovering` — whether the pointer is over the account dropdown trigger
- `isDropdownOpen` — whether the dropdown menu is open

**`useNavbarContext()`** — hook exported from `NavbarContextUtils.ts`. Returns both booleans and their setters. Consumed by `Navbar.tsx` and `AccountMenu.tsx` to coordinate hover and open state across sibling components.

---

## Security Key Context (`src/context/SecurityKeyProvider.tsx` / `SecurityKeyContext.ts`)

**`SecurityKeyProvider`** holds:
- `securityKey: string | null` — the key issued at signup or password reset
- `isFirstSession: boolean` — controls whether the "save your key" banner renders on the profile page
- `setSecurityKey(key)` — stores the key after signup
- `clearSecurityKey()` — clears after the user dismisses the banner
- `markKeySeen()` — hides the banner and persists the dismissal to `localStorage` so it does not reappear on refresh

**`useSecurityKey()`** — hook that reads `SecurityKeyContext`. Used by the signup flow and the profile page.

---

## Utility Functions

### `src/lib/utils.ts` — barrel

Re-exports all functions from the five utility modules:

```typescript
export * from "./utils/classnames";
export * from "./utils/dateFormat";
export * from "./utils/liquidGlass";
export * from "./utils/themeClasses";
export * from "./utils/colorMath";
export * from "./utils/sectionStyle";
```

Import from this barrel (`@/lib/utils`) rather than from the individual files.

### `cn(...inputs)` (`src/lib/utils/classnames.ts`)

Combines `clsx` and `tailwind-merge` into a single function. Resolves Tailwind conflicts correctly (e.g., `cn("p-2", "p-4")` → `"p-4"`) and handles conditional class objects and arrays from `clsx`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `extractErrorMessage(error, fallback)` (`src/lib/utils/extractErrorMessage.ts`)

Extracts a human-readable string from an Axios error. Handles the three shapes the Go backend returns:

| Response shape | Extraction |
|---|---|
| `{ error: "message" }` | `data.error` |
| `{ message: "message" }` | `data.message` |
| `"plain string"` | `data` directly |

Falls back to the Axios built-in `error.message` (e.g. `"Network Error"`), then to the `fallback` argument.

### `formatDate(value)` / `formatDateTime(value)` (`src/lib/utils/dateFormat.ts`)

Both accept `DateTime | Date | string | undefined | null`. Use Luxon internally. `formatDate` outputs `DATE_MED` (e.g. "Apr 22, 2026"). `formatDateTime` outputs `DATETIME_MED` (e.g. "Apr 22, 2026, 3:45 PM"). Returns `""` for falsy input. Falls back through `DateTime.fromISO` then `DateTime.fromJSDate(new Date(...))`, returning the raw string if neither parses.

### Liquid glass utilities (`src/lib/utils/liquidGlass.ts`)

All functions return `""` when `useLiquidGlass` is `false` — callers can safely concatenate the return value with other class strings without checking.

| Function | Purpose |
|---|---|
| `getLiquidGlassClasses(useLiquidGlass, useDarkMode, variant?)` | Panel/card background. `variant`: `"base"` (default) \| `"input"` \| `"accent"` |
| `getLiquidGlassTextShadow(useLiquidGlass, useDarkMode)` | Text shadow for legibility over glass |
| `getLiquidGlassHighlight(useLiquidGlass, useDarkMode)` | Highlight strip inside a glass element |
| `getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode)` | Highlight variant for navbar elements |
| `getLiquidGlassDialogClasses(useLiquidGlass, useDarkMode)` | Dialog/modal surface |
| `getLiquidGlassDialogFooterClasses(useLiquidGlass, useDarkMode)` | Dialog footer border and padding |
| `getLiquidGlassControlClasses(useLiquidGlass, useDarkMode)` | Input/textarea/select inside a dialog |

### Theme class utilities (`src/lib/utils/themeClasses.ts`)

All functions accept `(useLiquidGlass, useDarkMode)` and return Tailwind class strings.

| Function | Purpose |
|---|---|
| `getTextColor(useLiquidGlass, useDarkMode)` | Primary text color (`text-white` or `text-gray-900`) |
| `getSubtextColor(useLiquidGlass, useDarkMode)` | Muted/secondary text color |
| `getTextShadow(useLiquidGlass, useDarkMode)` | Text shadow for contrast |
| `getBackgroundClasses(useLiquidGlass, useDarkMode, variant?)` | Card/container background. `variant`: `"base"` \| `"light"` \| `"strong"` |
| `getButtonClasses(useLiquidGlass, useDarkMode, variant?)` | Button styles. `variant`: `"primary"` \| `"secondary"` \| `"outline"` |
| `getInputClasses(useLiquidGlass, useDarkMode)` | Form input styling |
| `getDialogClasses(useLiquidGlass, useDarkMode)` | Modal/dialog surface |
| `getDialogFooterClasses(useLiquidGlass, useDarkMode)` | Dialog footer border |

### `sectionStyle(animReady, delayMs)` (`src/lib/utils/sectionStyle.ts`)

Returns `CSSProperties` for a fade + slide-in animation:

```typescript
export function sectionStyle(animReady: boolean, delayMs: number): CSSProperties {
  return {
    opacity: animReady ? 1 : 0,
    transform: animReady ? "translateY(0px)" : "translateY(10px)",
    transition: animReady
      ? `opacity 200ms ease-out ${delayMs}ms, transform 200ms ease-out ${delayMs}ms`
      : "none",
    willChange: "opacity, transform",
  };
}
```

`animReady` flips from `false` to `true` after a card entry spring animation completes. While `false`, the section is invisible and not composited, which is the main performance benefit.

### Color math (`src/lib/utils/colorMath.ts`)

| Function | Signature | Purpose |
|---|---|---|
| `getAverageHexColor` | `(colors: string[]) => string` | Arithmetic mean of multiple hex colors |
| `lightenHexColor` | `(hex: string, amount?: number) => string` | Mix with white; `amount` 0–1 |
| `toRgbaColor` | `(hex: string, alpha?: number) => string` | Converts to `rgba(r, g, b, a)` |
| `hexToRgbTuple` | `(hex: string) => [number, number, number]` | Returns `[r, g, b]` for canvas operations |
| `lerp` | `(a: number, b: number, t: number) => number` | Linear interpolation |

Both 3-character shorthand (`#abc`) and 6-character (`#aabbcc`) hex inputs are accepted and normalized. Invalid inputs fall back to `"#808080"`.

### `useForwardedRef(ref)` (`src/lib/useForwardedRef.tsx`)

```typescript
export function useForwardedRef<T>(ref: React.ForwardedRef<T>): React.RefObject<T>
```

Normalizes a `React.ForwardedRef<T>` (which may be either a callback ref or a `RefObject`) into a stable `RefObject`. Handles both cases:

- **Callback ref**: calls `ref(innerRef.current)` in a `useEffect` and clears it on unmount.
- **Object ref**: uses `Object.assign` to write `innerRef.current` into `ref.current`.

Returns the inner `RefObject` so the consumer can always use `.current` directly.

---

## Page-specific Features

### News (`src/pages/news/`)

**`useNewsPosts`** — fetches, creates, updates, and deletes news posts. Implements server-side search and infinite scroll (cursor-based pagination). Categories filter is applied server-side. Each post has a category, title, body (Markdown), and optional image.

**`useNewsForm`** — form state for creating and editing posts. Handles image file selection, preview, and submission flow.

**`useNewsCategoryFilter`** — manages the active category filter. Categories are: Major update, Minor update, Patch, Unrelated news. Toggling a category updates the query parameter for `useNewsPosts`.

Admin and support accounts see create/edit/delete controls. Regular users see the feed in read-only mode.

### Admin (`src/pages/admin/`)

**`useAdminPageLogic`** — orchestrates the admin panel: user list, client-side search filtering over the data from `useAdminUsersQuery`, pagination, and selection state. Also provides styling helpers (passing `useLiquidGlass` and `useDarkMode` flags to produce correct class strings for admin-specific UI).

**`useBanDialogLogic`** — manages the ban dialog state. Preset durations: 1 day, 1 week, 1 month, permanent. Provides a custom date-range picker state for arbitrary end dates. Converts the selected duration into a `BanPayload` which is passed to `useBanUserMutation`.

### Releases (`src/pages/releases/`)

**`useReleases`** — fetches game client download releases from the GitHub Releases API. Implements OS-based filtering (Windows, macOS, Linux) and infinite scroll. The `staleTime` is configured to avoid excessive GitHub API calls.

### Webstore (`src/pages/webstore/`)

**`useItems`** — fetches the item catalog. Supports purchasing (deducts coins from the active profile), and for admin accounts, creating, updating, and deleting items. Filters are applied client-side by rarity, combat type, and ownership status.

**`ItemFilters`** — component that renders the filter chip row. Accepts `label`, `options`, `selected`, and `onSelect` props. Reads `useSettings` for theme-aware styling.

### Gallery (`src/pages/gallery/`)

**`ostTracks.ts`** — static array of two audio tracks (title and `src` path into `src/assets/`). Consumed by the OST tab audio player.

### Leaderboard (`src/pages/leaderboard/`)

Uses `useTopPlayersQuery` and `useLeaderboardQuery` from `useDebug.ts`. The page is split into category tabs, each backed by a different stats query. The top three entries render a podium layout; the full list below is filterable by player name.

### Debug (`src/pages/debug/`)

Uses the full suite of hooks from `useDebug.ts` — stats queries, game data queries and mutations, and DB panel queries and mutations. Organized into tabs: Stats, Characters, Levels, Profiles, Purchases, Roles, Categories, Rarities, Posts, Users.

---

## Build Configuration (`vite.config.ts`)

Manual chunk splitting prevents a single large bundle:

```typescript
manualChunks(id) {
  if (id.includes("@tanstack/react-query"))  return "query-vendor";
  if (id.includes("motion") || id.includes("lucide-react")) return "ui-vendor";
  if (id.includes("react-markdown") || id.includes("remark-gfm")) return "markdown-vendor";
  if (id.includes("luxon"))   return "date-vendor";
  if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) return "react-vendor";
  if (id.includes("/src/backgrounds/"))  return "backgrounds";
  if (id.includes("/src/pages/debug/") || id.includes("/src/pages/admin/")) return "ops-pages";
}
```

The `backgrounds` chunk is separated because background components contain large canvas rendering code loaded only when `Wrapper` renders them. The `ops-pages` chunk keeps admin and debug code out of the main bundle since most users never visit those pages.

Output goes to `../build/client`. A bundle size report is generated at `./build/stats.html` by `rollup-plugin-visualizer`.

The development server proxies `/api/*` to `http://localhost:8080` so the frontend can be developed against a locally running backend without CORS configuration.

Test environment: `jsdom`. Setup file: `./src/test-setup.ts`. Globals (`describe`, `it`, `expect`, `vi`) are available in every test file without imports.

---

## Conventions

### Theme and glass helpers

All components that render themed UI must use the shared helpers from `src/lib/utils/themeClasses.ts` and `src/lib/utils/liquidGlass.ts`. Writing inline ternary chains like `useDarkMode ? "text-white" : "text-black"` bypasses the theme system and makes future changes harder to apply globally.

### Query key usage

Always use `queryKeys.*`, `adminQueryKeys.*`, or `debugQueryKeys.*` rather than inline string arrays. This prevents cache key typos and makes it easy to find all consumers of a particular query.

### Locale files

Every user-facing string must exist in both `src/locales/en/*.json` and `src/locales/hu/*.json`. Add to both simultaneously.

### No style tags in components

All `@keyframes` definitions belong in `src/index.css`. Components must not inject `<style>` elements. Use Tailwind's arbitrary `animate-[...]` syntax or inline `style` attributes referencing keyframe names from the global stylesheet.

### FormData uploads

When uploading files via `apiClient`, pass `FormData` and do not set `Content-Type` manually. The request interceptor detects `FormData` and removes the header so the browser sets the correct `multipart/form-data; boundary=...` automatically.

### Utility barrel import

Import utilities from `@/lib/utils` (the barrel) rather than from individual files under `src/lib/utils/`. The barrel re-exports everything and is the canonical import path.
