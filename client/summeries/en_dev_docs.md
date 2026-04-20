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
    main.tsx               router definition, lazy-loaded routes
    RootLayout.tsx         global providers, React Query client
    App.tsx                root redirect (login vs releases)
    Wrapper.tsx            background animation, CSS variable emission
    index.css              global styles, @keyframes for CSS animations
    context/               React contexts and their providers
    hooks/                 React Query hooks (data fetching)
    lib/                   shared utilities, constants, schemas, config
    components/            shared UI components and guards
    backgrounds/           animated background components
    animations/            motion wrappers and animation primitives
    pages/                 feature pages (one directory per page)
    locales/               i18n JSON files (en/, hu/)
    assets/                static files (flags, OS logos, audio tracks)
  summeries/               documentation files (this directory)
  vite.config.ts
  tsconfig.app.json
```

---

## Entry Points

### `src/main.tsx`

Creates the React Router with `createBrowserRouter`. Auth pages (login, signup, password reset) are eagerly imported so they are in the initial bundle — users hit them first and should never wait. All other pages are lazy-loaded via `React.lazy`:

```typescript
const ReleasesPage = lazy(() =>
  import("./pages/releases/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

Protected routes are wrapped in a `RequireAuth` outlet. Each lazy-loaded route is additionally wrapped in `withBoundary`, which places an `ErrorBoundary` around it so a crash on one page cannot take down the entire application.

```typescript
{ path: "/app/releases", element: withBoundary(<ReleasesPage />) }
```

### `src/RootLayout.tsx`

Rendered by React Router as the parent of all routes. Holds the React Query client, all context providers, and the Suspense fallback. The fallback is a centered CSS spinner so users see activity during lazy-load.

The React Query client is configured with:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,   // 2 minutes before background refetch
      gcTime: 10 * 60 * 1000,      // 10 minutes before cache eviction
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
```

The client uses `PersistQueryClientProvider` backed by `createSyncStoragePersister` with `localStorage`. This means the query cache survives a hard browser refresh. Auth queries (`whoami`) are intentionally excluded from persistence (`gcTime: 0`) so a stale session is never served from cache.

In development mode, `ReactQueryDevtools` and four debug overlay components are mounted at the end of the tree.

The `MotionWrapper` component inside `RootLayout` reads `animationSpeed` from debug settings and translates it to a `motion/react` transition duration:

```typescript
const SPEED_TO_MOTION: Record<number, number> = {
  0.25: 2,    // very slow
  0.5:  0.8,
  1:    0.3,  // default
  2:    0.1,
  4:    0.05, // very fast
};
```

This makes all `motion/react` transitions in the app respond to the debug speed slider.

---

## Provider Architecture

Providers are stacked in a deliberate order in `RootLayout.tsx`. Each one depends on those above it:

```
PersistQueryClientProvider  ← React Query cache; must be outermost
  AuthProvider              ← resolves identity from /users/whoami
    SecurityKeyProvider     ← security key state for password reset flow
      SettingsProvider      ← loads theme flags before anything visual renders
        NavbarProvider      ← dropdown open/hover state
          ColorProvider     ← emits CSS variables from gradient colors
            ProfileProvider ← needs userId (from auth) to load selected profile
              MotionWrapper ← applies global animation speed
                Wrapper     ← background animation and layout shell
                  Outlet    ← actual page content
```

Reversing this order silently breaks things. `ColorProvider` must run after `SettingsProvider` because it reads `useLiquidGlass` and `useDarkMode` flags when computing which variables to emit.

---

## Authentication

### How It Works

The session is managed server-side via an HTTP-only cookie. The client has no access to the token value — this eliminates an entire class of XSS token-theft attacks.

On mount, `AuthProvider` fires `GET /api/users/whoami` through the React Query `useWhoAmIQuery` hook. The response shape is:

```typescript
interface WhoAmIResponse {
  id: number;
  email: string;
  role: string;        // "admin" | "support" | "user"
  is_banned: boolean;
  last_login: string;
}
```

The provider uses a two-phase initialization guard. After the `whoami` query resolves, a `useEffect` runs and calls multiple state setters in the same React 18 batched render. A separate `isAuthSettled` boolean flips to `true` only after that effect completes:

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

`isInitializing` is `true` while either the query is loading or the effect has not yet run. `RequireAuth` shows a spinner during this window to prevent a premature redirect to `/app/login`.

### Route Protection

`RequireAuth` reads `isLoggedIn` and `isInitializing` from `AuthContext`:

- If `isInitializing` is true: render a spinner.
- If `isLoggedIn` is false: `<Navigate to="/app/login">` with `state.from` set to the attempted path so the user can be redirected back after login.
- If `isLoggedIn` is true: render `<Outlet />`.

The debug and admin pages perform a secondary role check at the component level after the route guard passes:

```typescript
if (!isAdmin) return <NotFoundPage />;
```

### 401 Handling in the API Client

`src/lib/apiClient.ts` has a response interceptor that catches 401 errors. Auth endpoints (`/auth/` and `/users/whoami`) are excluded from the redirect to avoid a redirect loop when the user enters a wrong password (which also returns 401):

```typescript
const isAuthEndpoint =
  requestUrl.includes("/auth/") || requestUrl.includes("/users/whoami");

if (error.response.status === 401 && !isAuthEndpoint) {
  window.location.href = "/app/login";
  return new Promise(() => {});  // never resolves — stops downstream error handlers
}
```

The never-resolving promise prevents any in-flight UI from trying to render an error state on a page that is about to be navigated away.

---

## API Client

`src/lib/apiClient.ts` creates a shared Axios instance:

```typescript
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
```

The request interceptor handles two things:

1. **Debug network delay**: reads `networkDelayMs` and `networkJitterMs` from `localStorage["debug-settings"]` and sleeps for a computed duration before the request proceeds. This simulates slow networks during development.

2. **Content-Type header**: sets `application/json` automatically unless the body is a `FormData` object, in which case the `Content-Type` header is deleted so the browser can set the correct `multipart/form-data` boundary automatically.

```typescript
const isFormData = config.data instanceof FormData;
if (isFormData) {
  delete config.headers["Content-Type"];  // let the browser set multipart boundaries
  return config;
}
config.headers["Content-Type"] = "application/json";
```

---

## API Schema Validation

`src/lib/apiSchemas.ts` uses Zod to define runtime schemas for known API endpoints. `validateKnownApiResponse` matches an HTTP method and URL path against a list of rules and validates the response data:

```typescript
const KNOWN_RESPONSE_SCHEMAS: KnownSchemaRule[] = [
  { method: "post", path: /^\/auth\/login$/,         schema: loginResponseSchema },
  { method: "get",  path: /^\/users\/whoami$/,        schema: whoAmIResponseSchema },
  { method: "get",  path: /^\/users\/\d+\/profiles$/, schema: profileListSchema },
  { method: "get",  path: /^\/items$/,                schema: itemListSchema },
  { method: "get",  path: /^\/profiles\/\d+\/purchases$/, schema: purchaseListSchema },
];

export function validateKnownApiResponse(method, url, data) {
  const path = normalizePath(url);  // strips query string, ensures leading slash
  for (const rule of KNOWN_RESPONSE_SCHEMAS) {
    if (rule.method !== method || !rule.path.test(path)) continue;
    const parsed = rule.schema.safeParse(data);
    if (!parsed.success) throw new Error(`[API schema validation failed] ...`);
    return { matched: true, data: parsed.data };
  }
  return { matched: false, data };  // no matching rule — pass through unchanged
}
```

If the backend returns a shape that does not match the schema, the function throws with a message listing every field that failed validation. This surfaces backend breaking changes immediately in development rather than producing silent runtime errors downstream.

---

## React Query Hooks

All data fetching lives in `src/hooks/`. The query key structure is centralized in `src/lib/queryKeys.ts`:

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

Using the factory for all `queryKey` arguments means cache invalidation targets are never mistyped. Invalidating all profile queries for a user looks like:

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.profiles.byUserId(userId) });
```

### Auth Hooks (`src/hooks/useAuth.ts`)

`useWhoAmIQuery`: `GET /users/whoami`. `staleTime: 0` and `gcTime: 0` ensure this query never serves stale data from the persisted cache. `retry: false` so a 401 fails immediately rather than retrying.

`useLoginMutation`: `POST /auth/login` with `{ email, password }`. Returns `{ id, role }`.

`useSignupMutation`: `POST /auth/signup` with `{ email, password, role_id: 1 }`. Returns `{ id, email, security_key }`.

`useLogoutMutation`: `POST /auth/logout`. On success calls `queryClient.clear()` rather than `invalidateQueries`. The difference matters: `invalidateQueries` triggers refetches on all active queries, which hit the now-dead session and return 401, which triggers the redirect interceptor, which races with the React Router soft navigation. `clear()` wipes the cache without scheduling any refetches.

`useChangePasswordMutation`: `PUT /auth/change-password` with `{ email, security_key, new_password }`. Returns `{ new_key }` — the caller is responsible for displaying the new security key to the user.

`useUpdateUserEmailMutation`: `PUT /users/:id` with `{ id, email, role_id: 0 }`. The `role_id: 0` is intentional — GORM's `Updates()` call skips zero-value fields, so the role is left unchanged. On success, invalidates `["auth", "whoami"]` so the navbar reflects the new email immediately.

### Profile Hooks (`src/hooks/useProfile.ts`)

`useProfilesQuery(userId)`: `GET /users/:id/profiles`. Returns a list of profiles with `avatar_url` injected by `getProfilePictureUrl`. `staleTime: 0` so mutations always trigger a fresh fetch.

`useAddProfileMutation`: `POST /users/:id/profiles`. After creating the profile it calls `uploadProfilePicture` if a picture was provided. Profile creation succeeds even if the upload fails. On success, invalidates and immediately refetches the profile list.

`useUploadProfilePictureMutation`: `POST /profiles/:id/pfp` with a `FormData` body. On success, stamps a version number in `sessionStorage` and updates the cached `avatar_url` via `queryClient.setQueriesData` without a network request:

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

The `?v=timestamp` query parameter on the URL is what forces the browser to re-request the image even when the path stays the same.

`useUpdateProfileMutation`: `PUT /profiles/:id`. Supports optimistic UI — when `optimistic` is not explicitly `false`, the display name is updated in the cache immediately before the request resolves. The `invalidateAfterSuccess` flag controls whether a refetch is triggered afterward.

`useDeleteProfileMutation`: `DELETE /profiles/:id`. Implements full optimistic removal: cancels in-flight queries, snapshots the previous list, removes the profile from the cache immediately, and rolls back on error by restoring the snapshot.

---

## Profile Picture Caching

Profile pictures are served from `/api/profiles/:id/pfp`. Because the URL path never changes after upload, a browser cache hit would show the old image forever after an upload. The client tracks a version counter per profile in `sessionStorage` under the key `pfp_versions`:

```typescript
function getProfilePictureUrl(profileId: number): string {
  const version = pfpVersions.get(profileId);
  return `/api/profiles/${profileId}/pfp${version ? `?v=${version}` : ""}`;
}
```

After a successful upload, `Date.now()` is written as the new version. Because the version is persisted to `sessionStorage`, it survives component remounts within the same browser tab.

---

## Settings System

`src/pages/settings/SettingsContext.tsx` persists settings to `localStorage["settings"]`. The full state shape is:

```typescript
interface SettingsState {
  useAnimations: boolean;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  language: "en" | "hu";
  animationOverride: AnimationKey | "none" | "custom" | null;
}
```

`animationOverride: null` means use the active theme's default animation. `"none"` disables the background. `"custom"` activates the composite layer system. Any `AnimationKey` string forces that specific animation.

Settings are initialized from storage synchronously in the `useState` initializer function, meaning there is no flash-of-default-settings on load. A `useEffect` persists changes back to storage after every update. A separate `useEffect` calls `i18n.changeLanguage` whenever the language setting changes.

---

## Animation System

### The 12 Animations

Defined in `src/lib/animationTypes.ts`:

```typescript
type AnimationKey =
  | "fishtank" | "deepspace" | "aurora" | "lavalamp" | "synthwave"
  | "sakura" | "storm" | "particleweb" | "puddleripples" | "bioluminescence"
  | "constellation" | "void";
```

Each animation has a `SubEffects` interface defining which layers it supports. For example:

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

The `DEFAULT_SUB_EFFECTS` constant defines the initial state for each animation with all layers enabled.

### Theme-to-Animation Mapping

`src/pages/settings/Themes.ts` defines 18 themes. Each theme optionally carries an `animationKey`. When the user picks a theme and `animationOverride` is `null`, the animation from the theme is used. When `animationOverride` is any non-null value, the theme's animation is ignored.

```typescript
export const THEMES: Theme[] = [
  { name: "Midnight", colorLeft: "#232526", colorMiddle: "#414345", colorRight: "#000000", animationKey: "deepspace" },
  { name: "Ocean",    colorLeft: "#2e3192", colorMiddle: "#1bffff",  colorRight: "#1e9600", animationKey: "fishtank" },
  // ...
];
```

Applying a theme:

```typescript
export const applyTheme = (theme: Theme, context: ColorContextType) => {
  context.setColorLeft(theme.colorLeft);
  context.setColorMiddle(theme.colorMiddle);
  context.setColorRight(theme.colorRight);
  context.setAnimationKey(theme.animationKey ?? null);
};
```

### Composite Background

When `animationOverride === "custom"`, `CompositeBackground` mounts. It reads the `EffectLayerConfig` (a partial map of `AnimationKey` to `SubEffects`) from color settings and renders each enabled animation as an independent layer stacked via `position: absolute`. Layers with no enabled sub-effects unmount cleanly.

### CSS-Based Animations

All `@keyframes` blocks live in `src/index.css`. Background components reference them via Tailwind's arbitrary animation syntax or inline style strings. No `<style>` tags are injected in component render output.

---

## Theme Color Variables

`ColorProvider` converts three user-selected hex colors into CSS custom properties on `document.documentElement`. This means every element using `var(--theme-accent)` in CSS updates automatically without any component re-render.

The key variable is derived from `colorMiddle`. The provider uses `hexToRgba` from `src/lib/utils/colorMath.ts` to produce alpha variants used for borders, shadows, and soft backgrounds:

```typescript
document.documentElement.style.setProperty("--theme-accent", colorMiddle);
document.documentElement.style.setProperty("--theme-nav-border", hexToRgba(colorMiddle, 0.2));
document.documentElement.style.setProperty("--theme-accent-soft", hexToRgba(colorMiddle, 0.15));
```

---

## Toast System

`src/lib/toast.ts` is a zero-dependency pub/sub notification system. It maintains a module-level array of `ToastItem` objects and a set of listener callbacks. The `Toaster` component in `RootLayout` subscribes to this store and renders the toast list.

```typescript
toast.success("Profile saved.");
toast.error("Upload failed.");
toast.info("Loading...");
```

Toasts auto-dismiss after 4000ms by default. There is no external library involved.

---

## Debug Settings

`src/hooks/useDebugSettings.ts` provides a hook and a companion `getDebugSettings()` function for reading debug configuration from `localStorage["debug-settings"]`.

The full settings shape includes: `animationSpeed`, `forceReducedMotion`, `compactDensity`, `safeAreaOutlines`, `forceViewportEnabled`, `forceViewportPreset`, `forceViewportWidth`, `forceViewportHeight`, `noBackdropBlur`, `layoutBorders`, `navbarOverride`, `networkDelayMs`, `networkJitterMs`, `showFps`, `showScrollPos`, `showBreakpointBadge`, `clickTargetChecker`, `zIndexInspector`, `elementInspector`.

Settings changes are broadcast via a custom DOM event `"debug-settings"` so multiple hook instances in different parts of the component tree stay in sync without a React context:

```typescript
window.dispatchEvent(new CustomEvent("debug-settings", { detail: next }));
```

---

## Internationalization

`src/lib/i18n.ts` configures i18next with 12 namespaces per language: `auth`, `nav`, `settings`, `profile`, `releases`, `news`, `webstore`, `admin`, `common`, `debug`, `gallery`, `leaderboard`. All locale files are bundled at build time — there are no runtime network fetches for translation files.

```typescript
i18n.use(initReactI18next).init({
  resources: { en: { auth: enAuth, nav: enNav, /* ... */ }, hu: { /* ... */ } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
```

The initial `lng: "en"` is overridden at startup when `SettingsProvider` runs `i18n.changeLanguage(settings.language)`. Components consume translations with:

```typescript
const { t } = useTranslation("webstore");
return <p>{t("item.purchase")}</p>;
```

---

## Username Generator

`src/lib/generateUsername.ts` generates random display name suggestions from two static arrays — 116 adjective prefixes (Fluffy, Cosmic, Majestic, etc.) and 113 animal-sound or nature suffixes (Paws, Thunder, Ember, etc.). Used in the signup or profile creation flow as a suggested name:

```typescript
const { prefix, suffix } = generateRandomUsername();
// Example result: { prefix: "Cosmic", suffix: "Thunder" }
```

---

## Item Constants

`src/lib/constants/itemConstants.ts` centralizes all domain constants for webstore items:

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

`ACCEPTED_IMAGE_TYPES` is also referenced in `useProfile.ts` where picture uploads are validated before the HTTP request is made.

---

## Error Boundary

`src/components/ErrorBoundary.tsx` is a class component that catches render errors from any child subtree. It implements `getDerivedStateFromError` to flip into error state and `componentDidCatch` to log the error. The default fallback renders an error card with the error message and a "Try again" button that resets the error state:

```typescript
static getDerivedStateFromError(error: Error): State {
  return { hasError: true, error };
}
```

Every lazy-loaded route is wrapped with `withBoundary` in `main.tsx`. This ensures a page-level crash renders the error card within the layout rather than breaking the entire application.

---

## Build Configuration

`vite.config.ts` configures manual chunk splitting to avoid a single large bundle:

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

The `backgrounds` chunk is separated because background components are large (canvas rendering code) and are only loaded when the `Wrapper` renders them. The `ops-pages` chunk keeps admin and debug code out of the main bundle since most users never visit those pages.

Output goes to `../build/client`. A bundle size report is generated at `./build/stats.html` by `rollup-plugin-visualizer`.

The development server proxies `/api/*` to `http://localhost:8080` so the frontend can be developed against a locally running backend without CORS configuration.

Test environment: `jsdom`. Setup file: `./src/test-setup.ts`. Global test utilities (`describe`, `it`, `expect`, `vi`) are available without imports.

---

## Navbar Context

`src/context/NavbarContext.tsx` holds two booleans: `isDropdownHovering` and `isDropdownOpen`. These control the account menu dropdown state. The context is consumed by `Navbar.tsx` and `AccountMenu.tsx`.

---

## Security Key Context

`src/context/SecurityKeyProvider.tsx` holds the security key value and a first-session flag. When a new account is created, the signup flow stores the security key here. The `isFirstSession` flag controls whether the "save your key" banner is visible on the profile page. `markKeySeen` hides the banner and persists the dismissal so it does not reappear after a page refresh.

---

## Conventions

### Using Theme Helpers

All components that render themed UI must use the shared helpers from `src/lib/utils/themeClasses.ts`. The functions accept `useLiquidGlass` and `useDarkMode` booleans and return appropriate Tailwind class strings. Writing inline ternary chains like `useDarkMode ? "text-white" : "text-black"` bypasses the theme system and makes future theme changes harder to apply globally.

### Query Key Usage

Always use `queryKeys.*` from `src/lib/queryKeys.ts` rather than inline string arrays. This prevents cache key typos and makes it easy to find all places that depend on a particular query.

### Locale Files

Every user-facing string must be in both `src/locales/en/*.json` and `src/locales/hu/*.json`. Add to both files simultaneously. Strings only in one file fall back to English, which is acceptable for a degraded experience but should not be left permanently.

### No Style Tags in Components

All `@keyframes` and animation keyframe definitions belong in `src/index.css`. Components must not inject `<style>` elements. Using Tailwind's arbitrary `animate-[...]` syntax or inline `style` attributes referencing keyframe names defined in the global stylesheet is the correct approach.

### FormData Uploads

When using `apiClient` to upload files, pass a `FormData` object as the request body and do not set `Content-Type` manually. The request interceptor detects `FormData` and removes the header so the browser can set the correct `multipart/form-data; boundary=...` value automatically.
