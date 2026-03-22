# SMAASH Client — Developer Documentation

> **Stack:** React 19 · TypeScript · Vite · Tailwind CSS · React Query · Axios · react-i18next · Motion (Framer)  
> **Base path:** `client/src/`

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Entry Points & Routing](#2-entry-points--routing)
3. [Provider Stack](#3-provider-stack)
4. [Theming System](#4-theming-system)
5. [Contexts](#5-contexts)
6. [Hooks & API Layer](#6-hooks--api-layer)
7. [Pages](#7-pages)
8. [Navigation](#8-navigation)
9. [Forms](#9-forms)
10. [i18n / Multilingual Support](#10-i18n--multilingual-support)
11. [UI Component Library](#11-ui-component-library)
12. [Types](#12-types)
13. [Utilities](#13-utilities)
14. [Performance & Build](#14-performance--build)
15. [Known TODOs & Backend Dependencies](#15-known-todos--backend-dependencies)

---

## 1. Project Structure

```
client/
├── index.html                  # Entry HTML — preconnect hints for API host
├── vite.config.ts              # Build config, manual chunk splitting
├── tsconfig.app.json           # App TypeScript config
└── src/
    ├── main.tsx                # Router setup, lazy imports, StrictMode
    ├── App.tsx                 # Auth redirect gate
    ├── RootLayout.tsx          # All providers, Suspense boundary
    ├── Wrapper.tsx             # Full-page gradient + CSS custom properties
    ├── context/                # Auth + Navbar contexts
    ├── hooks/                  # React Query hooks (domain-split)
    ├── lib/
    │   ├── I18n.ts             # i18next init (must import before any component)
    │   ├── apiClient.ts        # Axios instance + interceptors
    │   ├── queryKeys.ts        # Centralised query key factory
    │   ├── utils.ts            # Barrel re-export of all util modules
    │   ├── utils/              # dateFormat, themeClasses, liquidGlass, colorMath, classnames
    │   ├── miscAnimations/     # Reusable Motion wrappers
    │   └── pageAnimations/     # Page-level animation components
    ├── components/
    │   ├── forms/              # Auth forms + ProfileSelector + AddNewProfile
    │   ├── nav/                # Navbar, mobile drawer, account menu
    │   ├── pages/
    │   │   ├── mainPages/      # Releases, News, Webstore, About, Gallery
    │   │   └── profileDependents/  # Profile, Settings, Admin
    │   └── ui/                 # Shared UI primitives (shadcn-style)
    ├── locales/
    │   ├── en/                 # English JSON — 9 namespace files
    │   └── hu/                 # Hungarian JSON — same structure
    └── types/                  # Shared TypeScript interfaces + example data
```

---

## 2. Entry Points & Routing

### `src/main.tsx`

The application root. Sets up React Router, imports i18n before any component renders, and applies lazy loading to all heavy pages.

**Auth routes are eager-loaded** (faster login/signup UX). All other pages are lazy:

```tsx
// Eager — loaded with the initial bundle
import { LoginForm } from "./components/forms/LoginForm.tsx";
import { SignupForm } from "./components/forms/SignUpForm.tsx";
import { PasswordResetForm } from "./components/forms/PasswordResetForm.tsx";

// Lazy — code-split into separate chunks
const ReleasesPage = lazy(() =>
  import("./components/pages/mainPages/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

**Route table:**

| Path                    | Component             | Auth Required    |
| ----------------------- | --------------------- | ---------------- |
| `/app`                  | `App` (redirect gate) | No               |
| `/app/login`            | `LoginForm`           | No               |
| `/app/signup`           | `SignupForm`          | No               |
| `/app/reset-password`   | `PasswordResetForm`   | No               |
| `/app/releases`         | `ReleasesPage`        | Yes              |
| `/app/news`             | `NewsPage`            | Yes              |
| `/app/webstore`         | `WebstorePage`        | Yes              |
| `/app/profile`          | `ProfilePage`         | Yes              |
| `/app/profile-selector` | `ProfileSelectorForm` | Yes              |
| `/app/settings`         | `SettingsPage`        | Yes              |
| `/app/admin`            | `AdminPage`           | Yes + Admin role |
| `/app/about`            | `AboutPage`           | No               |
| `/app/gallery`          | `GalleryPage`         | No               |
| `*`                     | `NotFoundPage`        | No               |

### `src/App.tsx`

Reads `AuthContext.isLoggedIn` and `isInitializing`, then redirects to `/app/releases` or `/app/login`. Shows a spinner while auth is initialising.

---

## 3. Provider Stack

`RootLayout.tsx` wraps every route in this provider tree (innermost to outermost):

```
PersistQueryClientProvider   ← React Query + localStorage persistence
  AuthProvider               ← isLoggedIn, userId, isAdmin
    SettingsProvider         ← settings, updateSetting (persisted to localStorage)
      NavbarProvider         ← dropdown hover/open state
        ColorProvider        ← gradient colors (persisted to localStorage)
          ProfileProvider    ← profiles[], selectedProfile, add/remove/select
            Wrapper          ← full-page gradient div + CSS custom properties
              Suspense       ← spinner fallback for lazy routes
                Outlet       ← active route
```

**React Query config (set in `RootLayout.tsx`):**

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
```

Cache is persisted to `localStorage` via `createSyncStoragePersister`, so queries survive page refresh. The `whoami` query explicitly opts out (`gcTime: 0`) to avoid stale auth leaking into the persisted cache.

---

## 4. Theming System

The theme is driven by three gradient colours stored in `ColorContext` and `localStorage`. `Wrapper.tsx` computes derived CSS custom properties from these colours and injects them on the root element.

### CSS Custom Properties (set by `Wrapper.tsx`)

| Variable               | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `--theme-accent`       | Lightened average of the three gradient colours |
| `--theme-accent-hover` | Lighter version for hover states                |
| `--theme-accent-soft`  | Semi-transparent accent for subtle fills        |
| `--theme-nav-border`   | Average colour for nav border                   |
| `--theme-nav-shadow`   | Semi-transparent shadow colour                  |

### Settings Flags

| Flag             | Default | Effect                                            |
| ---------------- | ------- | ------------------------------------------------- |
| `useLiquidGlass` | `true`  | Frosted glass look (backdrop-blur + transparency) |
| `useDarkMode`    | `false` | Dark variants of all themed classes               |
| `useAnimations`  | `true`  | Motion animations enabled/disabled globally       |
| `language`       | `"en"`  | i18next language (`"en"` or `"hu"`)               |

### Theme Helper Functions (`src/lib/utils/themeClasses.ts`)

All components must use these functions — never inline ternary theme logic.

```ts
import {
  getTextColor, // Primary text
  getSubtextColor, // Muted/secondary text
  getTextShadow, // Text shadow for readability on gradient backgrounds
  getBackgroundClasses, // Card/panel backgrounds — variants: "base" | "light" | "strong"
  getButtonClasses, // Button styling — variants: "primary" | "secondary" | "outline"
  getInputClasses, // Input/textarea/select styling
  getDialogClasses, // Modal/dialog surface
  getDialogFooterClasses, // Modal footer separator
} from "@/lib/utils";

// Example usage in a component:
const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
const bgClass = getBackgroundClasses(
  settings.useLiquidGlass,
  settings.useDarkMode,
  "strong",
);
```

### Liquid Glass Helpers (`src/lib/utils/liquidGlass.ts`)

Additional helpers for the liquid glass visual effect:

```ts
getLiquidGlassClasses(useLiquidGlass, useDarkMode, variant?)
// variant: "base" | "input" | "accent"

getLiquidGlassTextShadow(useLiquidGlass, useDarkMode)
getLiquidGlassHighlight(useLiquidGlass, useDarkMode)
getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode)
getLiquidGlassDialogClasses(useLiquidGlass, useDarkMode)
getLiquidGlassDialogFooterClasses(useLiquidGlass, useDarkMode)
getLiquidGlassControlClasses(useLiquidGlass, useDarkMode)
```

### Preset Themes (`src/components/.../settingsLogic/Themes.ts`)

```ts
import { THEMES } from "@/components/pages/profileDependents/settings/settingsLogic/Themes";
// THEMES: Theme[] — each has { name, colorLeft, colorMiddle, colorRight }
// Presets: Azure, Slate, Emerald, Amethyst, Coral, Sunset, Ocean, …
```

---

## 5. Contexts

### `AuthContext` (`src/context/AuthContext.ts`)

```ts
interface AuthContextShape {
  isLoggedIn: boolean;
  isInitializing: boolean; // true while whoami query is in flight
  userId: bigint | null;
  setUserId: (value: bigint | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}
```

Populated by `AuthProvider`, which calls `useWhoAmIQuery()` on mount. Import with `useContext(AuthContext)`.

```tsx
const { isLoggedIn, isAdmin, userId } = useContext(AuthContext);
```

### `SettingsContext` (`src/components/.../settingsLogic/SettingsContext.tsx`)

```ts
// Hook — throws if used outside SettingsProvider
const { settings, updateSetting } = useSettings();

// Update a single key
updateSetting("useDarkMode", true);
updateSetting("language", "hu");
```

Persists to `localStorage` under key `"settings"`. Also syncs i18next on mount and on language change.

### `ProfileContext` (`src/components/forms/addNewProfile/ProfilesContext.tsx`)

```ts
const { profiles, selectedProfile, addProfile, removeProfile, selectProfile } =
  useProfiles();
// useProfiles() = useContext(ProfileContext) — from useProfiles.ts

// Profile shape:
interface Profile {
  id?: number;
  name: string; // display_name
  avatar: string; // /api/profiles/:id/pfp URL
  avatarFile?: File | null;
  coins?: number;
  last_login?: string;
}
```

`selectedProfile` defaults to the first profile if none is explicitly selected. Selecting by name:

```ts
selectProfile("MyCharacter"); // persists selection in component state (session only)
```

### `ColorContext` (`src/components/.../settingsLogic/color/ColorContext.ts`)

```ts
const {
  colorLeft,
  colorMiddle,
  colorRight,
  setColorLeft,
  setColorMiddle,
  setColorRight,
} = useContext(ColorContext);
```

Three hex strings that drive `Wrapper.tsx`'s gradient. Persisted to `localStorage` under key `"color-settings"`.

---

## 6. Hooks & API Layer

### `src/lib/apiClient.ts`

Shared Axios instance. All API calls go through this.

- **Base URL:** `/api`
- **Credentials:** `withCredentials: true` (cookie-based auth)
- **Content-Type:** auto-set to `application/json`; omitted for `FormData` (browser sets multipart boundary)
- **401 interceptor:** Any 401 from a non-auth endpoint hard-redirects to `/app/login`. Auth endpoints (`/auth/*`, `/users/whoami`) are excluded to avoid redirect loops on wrong-password responses.

```ts
import apiClient from "@/lib/apiClient";

// Example direct usage (prefer hooks where possible):
const { data } = await apiClient.get<MyType>("/endpoint");
await apiClient.post("/endpoint", body);
await apiClient.put("/endpoint/1", body);
await apiClient.delete("/endpoint/1");
```

### `src/lib/queryKeys.ts`

Centralised key factory — use these for all `queryKey` and `invalidateQueries` calls to ensure consistent cache management.

```ts
import { queryKeys } from "@/lib/queryKeys";

queryKeys.auth.all; // ["auth"]
queryKeys.profiles.byUserId(userId); // ["profiles", "byUserId", 5]
queryKeys.releases.infinite(os); // ["releases", "infinite", "windows"]
queryKeys.githubReleases.all; // ["githubReleases"] — GitHub releases cache
queryKeys.news.byCategory(categories); // ["news", "byCategory", ["Patch"]]
queryKeys.items.all; // ["items"]
queryKeys.purchases.byProfileId(profileId);
```

### Hook Files

Hooks are split by domain. All are re-exported from `useQueryHooks.ts` for convenience.

#### `src/hooks/useAuthHooks.ts`

| Hook                           | Method | Endpoint        |
| ------------------------------ | ------ | --------------- |
| `useWhoAmIQuery()`             | GET    | `/users/whoami` |
| `useLoginMutation()`           | POST   | `/auth/login`   |
| `useSignupMutation()`          | POST   | `/auth/signup`  |
| `useLogoutMutation()`          | POST   | `/auth/logout`  |
| `useUpdateUserEmailMutation()` | PUT    | `/users/:id`    |

```ts
// Login example
const loginMutation = useLoginMutation();
try {
  const data = await loginMutation.mutateAsync({ email, password });
  // data: { id: number, role: string }
} catch (err) { ... }

// Logout — clears cache and whoami, navigate to login yourself
const logoutMutation = useLogoutMutation();
await logoutMutation.mutateAsync();
setIsLoggedIn(false);
navigate("/app/login");
```

#### `src/hooks/useProfileHooks.ts`

| Hook                                | Description                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `useProfilesQuery(userId)`          | Fetch all profiles for a user. Appends cache-busted `?v=` param to avatar URLs.        |
| `useAddProfileMutation()`           | POST to `/users/:id/profiles`. Accepts optional `profile_picture: File`.               |
| `useUpdateProfileMutation()`        | PUT to `/profiles/:id`. Supports **optimistic updates** via `onMutate`.                |
| `useDeleteProfileMutation()`        | DELETE `/profiles/:id`. **Optimistic removal** with rollback on error.                 |
| `useUploadProfilePictureMutation()` | POST multipart to `/profiles/:id/pfp`. Auto-increments version seed for cache-busting. |

```ts
// Add profile with picture
const addProfileMutation = useAddProfileMutation();
await addProfileMutation.mutateAsync({
  display_name: "HeroSlime",
  user_id: 42,
  profile_picture: fileFromInput,
});

// Optimistic display name update
const updateMutation = useUpdateProfileMutation();
await updateMutation.mutateAsync({
  profileId: 7,
  payload: { id: 7, display_name: "NewName", coins: 500 },
  optimistic: true, // update cache before server confirms
  invalidateAfterSuccess: true,
});
```

**Display name rules:** clamped to 20 characters via `clampDisplayName()`. Duplicate names get a random 4-char suffix appended automatically.

**Avatar cache-busting:** Profile picture versions are persisted in `sessionStorage` under key `"pfp_versions"`. After an upload, the version increments, changing the `?v=` query param and forcing the browser to fetch the new image.

#### `src/hooks/useContentHooks.ts` + `useQueryHooks.ts`

Infinite-query hooks for paginated content. All share the same response envelope:

```ts
interface PaginatedResponse<T> {
  items: T[]; // or releases / posts
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
```

| Hook                                           | Key params                                  | Endpoint                                |
| ---------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| `useReleasesInfiniteQuery(os, pageSize?)`      | `os: string`                                | `GET /releases?os=&page=&pageSize=`     |
| `useItemsInfiniteQuery(filters?, pageSize?)`   | `kind`, `rarity`, `combatType`, `ownership` | `GET /items?...`                        |
| `useNewsInfiniteQuery(categories?, pageSize?)` | `categories: string[]`                      | `GET /news?categories=&page=&pageSize=` |

```ts
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useReleasesInfiniteQuery("windows", 8);

const releases = data?.pages.flatMap((p) => p.releases) ?? [];
```

#### `src/hooks/useAdminHooks.ts`

Admin panel hooks. All require the caller to be an admin (enforced by backend middleware once implemented).

| Hook                          | Endpoint                | Notes                                                |
| ----------------------------- | ----------------------- | ---------------------------------------------------- |
| `useAdminUsersQuery(search?)` | `GET /users`            | Client-side filter until backend supports `?search=` |
| `useAdminUserQuery(userId)`   | `GET /users/:id`        |                                                      |
| `useBanUserMutation()`        | `POST /users/:id/ban`   | Converts `BanPayload` to `{ id, period }` in minutes |
| `useUnbanUserMutation()`      | `POST /users/:id/unban` |                                                      |

```ts
const banMutation = useBanUserMutation();
await banMutation.mutateAsync({
  userId: 99,
  payload: {
    ban_type: "temporary",
    ban_until: "2026-06-15T14:00:00Z",
    reason: "Toxic behaviour",
  },
});
```

**Permanent ban** uses `50 * 365 * 24 * 60` minutes (~50 years) because the backend stores a concrete timestamp.

---

## 7. Pages

### Releases (`/app/releases`)

`src/components/pages/mainPages/ReleasesPage.tsx`

Displays game version releases with OS filtering and infinite scroll. **Releases are sourced directly from the public GitHub repository** — there is no in-app add/remove UI. To publish a new version, create a GitHub release at `https://github.com/SMAASH-project/SMAASH/releases` and attach the build assets.

**Platform detection** is based on file extension of each release asset:

| Extension      | Platform |
| -------------- | -------- |
| `.apk`, `.aab` | Android  |
| `.ipa`         | iOS      |

Recommended asset naming convention: `smaash-v{version}-android.apk` / `smaash-v{version}-ios.ipa`. If the convention changes, update `PLATFORM_MATCHERS` in `useReleases.ts`.

Key sub-components:

- `Releases.tsx` — renders the release list; passes the per-OS `downloadUrl` to the button
- `SelectOs.tsx` — OS filter (iOS / Android)
- `DownloadReleaseButton.tsx` — opens the GitHub asset URL in a new tab; disabled with tooltip when no asset exists for the selected platform
- `SearchRelease.tsx` — client-side version search
- `useReleases.ts` — fetches `GET https://api.github.com/repos/SMAASH-project/SMAASH/releases`, maps assets to `Release` objects, handles infinite scroll

**GitHub API rate limit:** 60 unauthenticated requests/hour per IP. React Query caches results for 10 minutes (`staleTime`) so normal usage stays well within limits. If the repo ever becomes private, move the fetch to a backend proxy so the token never ships in the client bundle.

### News (`/app/news`)

`src/components/pages/mainPages/NewsPage.tsx`

Markdown-rendered news posts with category badges and image support. Responsive: side images stack on mobile.

Key features:

- Posts support `imagePosition: "Top" | "Right"` and `imageSize: number`  
  On desktop, side images honour the configured `imageSize%`. On mobile they stack full-width.
- `react-markdown` + `remark-gfm` renders post content
- Category filter via `FilterSelect` popover
- Admins see `EditButton` and `RemoveButton` per post
- Post entry animations via `LoadPost` (respects `useAnimations` setting)

Sub-components:

- `AddNews.tsx` — admin create dialog
- `EditButton.tsx` — admin edit dialog
- `RemoveButton.tsx` — admin delete confirm
- `Search.tsx` — text search
- `Filter.tsx` / `FilterSelection.tsx` — category filter
- `CategoryBadge.tsx` — colour-coded category pill
- `useNewsPosts.ts` — post CRUD state
- `useNewsCategoryFilter.ts` — filter state
- `useNewsForm.ts` — form state for create/edit

**Category colours** (defined in `types/PageTypes.ts`):

| Category       | Colour             |
| -------------- | ------------------ |
| Major update   | `#3b82f6` (blue)   |
| Minor update   | `#10b981` (green)  |
| Patch          | `#f59e0b` (amber)  |
| Unrelated news | `#8b5cf6` (purple) |

### Webstore (`/app/webstore`)

`src/components/pages/mainPages/WebstorePage.tsx`

Item shop. Coin balance from `ProfileContext.selectedProfile.coins`.

Sub-components:

- `Item.tsx` — individual item card with unlock button
- `CreateItemDialog.tsx` — admin create
- `RemoveItemButton.tsx` — admin delete
- `SearchItem.tsx` — text search
- `ItemFilters.tsx` — filter by kind, rarity, combat type, ownership
- `useItems.ts` — full React Query integration: fetches `GET /api/items`, merges ownership from `GET /profiles/:id/purchases`, handles create/delete/purchase mutations

**Ownership** is derived by fetching the selected profile's purchase history and building a `Set` of owned item names. After a purchase, both the purchases query and the profile coins query are invalidated so the coin balance updates immediately.

**Item → WebstoreItem mapping:** the backend encodes kind and combat type as category strings (`"Character"`, `"Skin"`, `"Melee"`, `"Ranged"`). `itemDTOToWebstoreItem()` decodes these back into the typed fields the UI expects.

### Profile (`/app/profile`)

`src/components/pages/profileDependents/profile/ProfilePage.tsx`

Three-panel layout: avatar/name/edit | stats | match history.

```
[ Avatar / Name / Edit ] | [ Stats ] | [ Match History ]
```

Live data: coins, last seen, profile ID (from `ProfileContext`).  
Placeholder data (dimmed, `opacity-40`): wins, losses, win rate, match count.  
Match history: empty state — waiting on `GET /api/profiles/:id/matches`.

Key files:

- `ProfilePageContent.tsx` — all three panels
- `UpdateSheet.tsx` — slide-out sheet to rename profile and change avatar

### Settings (`/app/settings`)

`src/components/pages/profileDependents/settings/SettingsPage.tsx`

Toggle cards for: Animations, Liquid Glass, Dark Mode, Language.  
Theme picker section with preset colour schemes and a custom 3-stop colour picker.

Key files:

- `SettingsPageContent.tsx` — full page layout
- `SettingToggle.tsx` — reusable toggle row
- `ThemePicker.tsx` — preset grid + custom colour pickers
- `SettingsContext.tsx` — state, persistence, i18n sync

### Admin (`/app/admin`)

`src/components/pages/profileDependents/admin/AdminPage.tsx`

Auth-gated: non-admins see `<NotFoundPage />` (indistinguishable from a real 404).

Three-panel layout:

```
[ User List + Search ] | [ User Detail + Stats ] | [ User's Profiles ]
```

Key files:

- `AdminPageContent.tsx` — three-panel card
- `UserList.tsx` — scrollable list with client-side search
- `UserListItem.tsx` — row with ban indicator
- `UserDetail.tsx` — selected user header, account stats, role badge, ban/unban button
- `ProfilesPanel.tsx` — selected user's profiles
- `ban/BanDialog.tsx` — full ban modal (presets + custom date range + reason)
- `ban/BanPresetCard.tsx` — individual preset option
- `ban/BanCustomRange.tsx` — custom calendar + time spinners
- `adminLogic/useAdminPageLogic.ts` — page state + theming
- `adminLogic/useBanDialogLogic.ts` — ban dialog state

**Role badge mapping:**

| Backend role | Badge colour | Icon       |
| ------------ | ------------ | ---------- |
| `"admin"`    | Purple       | Shield     |
| `"support"`  | Sky blue     | Headphones |
| `"user"`     | Neutral gray | Users      |

**Ban dialog flow:**

1. Select preset (1h / 12h / 24h / 7d / 31d / 365d / Permanent) OR pick custom date range
2. Optionally pick/type a reason
3. Confirm — sends `{ id, period }` (period in minutes) to `POST /users/:id/ban`

---

## 8. Navigation

### `Navbar.tsx`

Fixed top bar. Uses `NavbarContext` for dropdown hover tracking to prevent premature close.

- Desktop: logo left, nav links centre, account menu right. Admin button appears only when `isAdmin === true`.
- Mobile breakpoint: hamburger → `MobileNavMenu` sheet drawer.

### `MobileNavMenu.tsx`

Sheet drawer for mobile. Contains full nav links + account section (Profile, Settings, Admin Panel if admin, Logout).

### `AccountMenu.tsx`

Dropdown menu in the top-right of the navbar. Contains Profile, Settings, Logout.

### `navLogic/navItems.ts`

```ts
// Add new nav items here:
export const navItems = [
  { path: "/app/releases", labelKey: "nav.releases", icon: Download },
  { path: "/app/news", labelKey: "nav.news", icon: Newspaper },
  // ...
];
```

`labelKey` maps directly to a key in `src/locales/*/nav.json`.

---

## 9. Forms

### `LoginForm.tsx`

- Email + password fields
- Calls `useLoginMutation()`, sets `isLoggedIn`/`userId`/`isAdmin` on success, navigates to `/app/profile-selector`
- Language toggle in the top-right corner

### `SignUpForm.tsx`

- Username / email / password / confirm password
- reCAPTCHA v3 — `GoogleReCaptchaProvider` wraps the inner form component. Token is fetched only on submit via `executeRecaptcha("signup")` — **not** continuously polled. This prevents the `reload`/`clr` request flood.
- Site key is hardcoded in the component; move to an env variable for production.

```tsx
// How reCAPTCHA is structured to avoid request spam:
export function SignupForm(props) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="...">
      <SignupFormInner {...props} /> {/* useGoogleReCaptcha() lives here */}
    </GoogleReCaptchaProvider>
  );
}
// Token is fetched once at submit:
const token = await executeRecaptcha("signup");
```

### `PasswordResetForm.tsx`

> ⚠️ **Form submits but fires no mutation.** Blocked on `POST /api/auth/reset-password` backend endpoint. See [§15](#15-known-todos--backend-dependencies).

### `ProfileSelectorForm.tsx`

Displays user's profiles as avatars. Select to enter app; "Manage Profiles" mode enables delete. Logout button calls `useLogoutMutation()` and resets auth state.

Memoised via `React.memo` + `useCallback` to avoid expensive re-renders when profiles list is large.

### `AddNewProfile.tsx`

Dialog form to create a new profile. Accepts display name + optional avatar image upload. Limit: 5 profiles per user.

---

## 10. i18n / Multilingual Support

**Languages:** English (`en`) · Hungarian (`hu`)

### Setup

`src/lib/I18n.ts` must be imported in `main.tsx` **before any component renders:**

```ts
import "@/lib/I18n.ts"; // main.tsx line 4
```

### Usage

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation("auth");
// t("login.title")   → "Login to your account" (en) / "Bejelentkezés" (hu)
// t("signup.submit") → "Create Account" / "Fiók létrehozása"
```

### Namespaces

| File            | Used in                                                   |
| --------------- | --------------------------------------------------------- |
| `auth.json`     | Login, Signup, PasswordReset forms                        |
| `nav.json`      | Navbar, account menu, nav items                           |
| `settings.json` | Settings page                                             |
| `profile.json`  | Profile page, UpdateSheet, ProfileSelector, AddNewProfile |
| `releases.json` | Releases page + sub-components                            |
| `news.json`     | News page + sub-components                                |
| `webstore.json` | Webstore page + sub-components                            |
| `admin.json`    | Admin panel, ban dialog, all ban strings                  |
| `common.json`   | 404 page, shared labels                                   |

### Language Switching

Language is stored in `SettingsContext` (`settings.language`). Changing it via `updateSetting("language", "hu")` automatically calls `i18n.changeLanguage()` via a `useEffect` in `SettingsContext`.

Language picker is available on the Settings page and as a `<LanguageToggle />` on all three auth pages.

### Adding a New Language

1. Create `src/locales/<code>/` with the same 9 JSON files
2. Import all files in `src/lib/I18n.ts` and add to `resources`
3. Add a button in `SettingsPageContent.tsx` and `LanguageToggle.tsx`
4. Add the code to the `Language` type in `SettingsContext.tsx`

### Hungarian Notes

Hungarian is agglutinative — translations are complete context-aware strings, not assembled from fragments. Ban duration labels (`"1 óra"`, `"7 nap"`) are full strings in the JSON. Interpolated strings use i18next syntax: `"Tiltva {{date}}-ig"`.

---

## 11. UI Component Library

Components live in `src/components/ui/` and follow shadcn patterns (Radix UI primitives + Tailwind).

| Component        | File                 | Notes                                            |
| ---------------- | -------------------- | ------------------------------------------------ |
| `Button`         | `button.tsx`         | Variants via `button-variants.ts`                |
| `ButtonGroup`    | `button-group.tsx`   | Horizontal/vertical grouped buttons              |
| `Input`          | `input.tsx`          | Standard text input                              |
| `Card`           | `card.tsx`           | Container card                                   |
| `Avatar`         | `avatar.tsx`         | User/profile avatar with fallback initials       |
| `Badge`          | `badge.tsx`          | Status/category labels                           |
| `Label`          | `label.tsx`          | Form field label                                 |
| `Field`          | `field.tsx`          | Field + FieldLabel + FieldDescription layout     |
| `Dialog`         | `dialog.tsx`         | Modal dialog                                     |
| `Sheet`          | `sheet.tsx`          | Slide-out side panel                             |
| `DropdownMenu`   | `dropdown-menu.tsx`  | Radix dropdown                                   |
| `Popover`        | `popover.tsx`        | Radix popover                                    |
| `Switch`         | `switch.tsx`         | Toggle switch                                    |
| `Checkbox`       | `checkbox.tsx`       | Checkbox                                         |
| `RadioGroup`     | `radio-group.tsx`    | Radio button group                               |
| `Accordion`      | `accordion.tsx`      | Collapsible sections                             |
| `Separator`      | `separator.tsx`      | Horizontal/vertical rule                         |
| `Calendar`       | `calendar.tsx`       | Custom date range calendar (no react-day-picker) |
| `ColorPicker`    | `color-picker.tsx`   | Hex colour input                                 |
| `Resizable`      | `resizable.tsx`      | Drag-to-resize panels                            |
| `LanguageToggle` | `LanguageToggle.tsx` | EN/HU flag buttons for auth pages                |

### Custom Calendar (`calendar.tsx`)

Self-contained, no external date-picker dependency. Supports `single` and `range` modes.

Range highlight renders as a connected pill bar — `rounded-l-full` on the start date, `rounded-r-full` on end, flat sides on interior days.

```tsx
<Calendar
  mode="range"
  selected={{ from: startDate, to: endDate }}
  onSelect={handleSelect}
  fromDate={new Date()} // block past dates
/>
```

---

## 12. Types

### `src/types/PageTypes.ts`

Core domain interfaces used across pages and hooks.

```ts
interface NewsPost {
  id: string;
  title: string;
  category: "Major update" | "Minor update" | "Patch" | "Unrelated news";
  image?: string;
  imageAlt?: string;
  imagePosition?: "Top" | "Right";
  imageSize?: number; // vh for Top; % width for Right
  content: string; // Markdown
  createdAt: DateTime; // Luxon DateTime
}

interface WebstoreItem {
  id: string;
  name: string;
  kind: "Skin" | "Character";
  combatType?: "Melee" | "Ranged";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  description: string;
  price: number;
  owned: boolean;
  createdAt: DateTime;
}

interface Release {
  id: string;
  version: string;
  supports: string[]; // OS identifiers e.g. ["iOS", "Android"]
  downloadUrls: Partial<Record<string, string>>; // per-OS GitHub asset URLs
  createdAt: DateTime;
}
```

### `src/types/OsTypes.ts`

OS identifier constants for release filtering.

### `src/types/ExampleItems.ts` / `ExampleReleases.ts`

Placeholder data. `ExampleItems` is currently used by `useItems.ts` — see [§15](#15-known-todos--backend-dependencies).

---

## 13. Utilities

### `src/lib/utils.ts`

Barrel re-export. Import everything from `@/lib/utils`:

```ts
import {
  cn, // classnames merge (clsx + tailwind-merge)
  formatDate, // Luxon DateTime | Date | string → "Mar 21, 2026"
  formatDateTime, // → "Mar 21, 2026, 5:30 PM"
  // Theme helpers:
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getBackgroundClasses,
  getButtonClasses,
  getInputClasses,
  getDialogClasses,
  getDialogFooterClasses,
  // Liquid glass helpers:
  getLiquidGlassClasses,
  getLiquidGlassTextShadow,
  getLiquidGlassHighlight,
  getLiquidGlassNavHighlight,
  getLiquidGlassDialogClasses,
  getLiquidGlassControlClasses,
  // Color math:
  getAverageHexColor,
  lightenHexColor,
  toRgbaColor,
  getTextColor,
} from "@/lib/utils";
```

### `src/lib/utils/colorMath.ts`

Pure colour arithmetic used by `Wrapper.tsx`:

```ts
getAverageHexColor(colors: string[]): string   // average of N hex colours
lightenHexColor(hex: string, amount: number): string  // 0.0–1.0
toRgbaColor(hex: string, alpha: number): string
```

### `src/lib/utils/dateFormat.ts`

Wraps Luxon for consistent date display. Accepts Luxon `DateTime`, JS `Date`, ISO strings, or `undefined`.

```ts
formatDate("2026-03-21T17:30:00Z"); // "Mar 21, 2026"
formatDateTime("2026-03-21T17:30:00Z"); // "Mar 21, 2026, 5:30 PM"
```

### `src/lib/GenerateRandomUsername.ts`

Generates random username suggestions for the signup placeholder.

```ts
const { prefix, suffix } = generateRandomUsername();
// prefix: "ClassicFog", suffix: ""  → "ClassicFog"
```

### Animations

#### `src/lib/miscAnimations/`

| Component                   | Description                      |
| --------------------------- | -------------------------------- |
| `OnloadAnimationCard.tsx`   | Fade-in + slide-up on mount      |
| `OnloadAnimationNavbar.tsx` | Navbar entrance animation        |
| `AnimatedAccordion.tsx`     | Accordion with height transition |
| `ColorInterpolation.tsx`    | Smooth colour transition wrapper |

#### `src/lib/pageAnimations/newsPageAnimations/LoadPost.tsx`

Wraps individual news post cards with staggered entrance animation:

```tsx
<LoadPost key={post.id} index={index}>
  <Card>...</Card>
</LoadPost>
```

Only renders the motion wrapper if `settings.useAnimations` is `true`.

---

## 14. Performance & Build

### Bundle Strategy

Manual chunks defined in `vite.config.ts`:

| Chunk          | Contents                              | Gzipped   |
| -------------- | ------------------------------------- | --------- |
| `react-vendor` | react, react-dom, react-router-dom    | ~33 KB    |
| `query-vendor` | @tanstack/react-query, persist-client | ~12 KB    |
| `ui-vendor`    | framer-motion, motion, lucide-react   | ~45 KB    |
| Route chunks   | Lazy-loaded per page                  | On demand |

Initial bundle: **~94 KB gzipped** (down from 349 KB before optimisation).

### Lazy Loading

All non-auth pages are lazy loaded in `main.tsx`:

```ts
const ReleasesPage = lazy(() =>
  import("./components/pages/mainPages/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

The `Suspense` boundary in `RootLayout.tsx` shows a spinner while chunks load.

### Bundle Visualiser

```bash
npm run build
# Opens build/stats.html — interactive treemap of all chunks
```

### Resource Hints

`index.html` has `preconnect` and `dns-prefetch` for the API host so the first API call doesn't incur a full DNS + TLS handshake delay.

### Render Optimisation

`ProfileSelectorForm.tsx` memoises the `ProfileAvatar` component and the `handleProfileClick` callback:

```tsx
const ProfileAvatar = memo(function ProfileAvatar({ ... }) { ... });
const handleProfileClick = useCallback(async (name: string) => { ... }, [deps]);
```

---

## 15. Known TODOs & Backend Dependencies

### ⚠️ Frontend Bugs (fixable now, no backend needed)

#### 1. 401 / Session Expiry ✅ Fixed

Global Axios interceptor in `apiClient.ts` catches any non-auth 401 and hard-redirects to `/app/login`. Already implemented.

#### 2. Download Button ✅ Fixed

`DownloadReleaseButton` now opens the GitHub asset `browser_download_url` for the selected OS. Disabled with a tooltip when the release has no asset for the active platform.

#### 3. Password Reset Does Nothing

`PasswordResetForm.tsx` renders but submits nothing. No mutation, no feedback.

**Partial frontend fix:** Disable the submit button and display a "not yet available" message.  
**Full fix:** Requires `POST /api/auth/reset-password` backend endpoint first.

---

### 🔧 Backend Endpoints Needed

See `summeries/BACKEND_NOTES.md` for full spec. Summary:

| #   | Endpoint                                          | Status                                   |
| --- | ------------------------------------------------- | ---------------------------------------- |
| 1   | Role preload on `GET /users` and `GET /users/:id` | Missing — badges show blank              |
| 2   | `username` + `ban_until` fields on `UserReadDTO`  | Missing — shows `"—"`                    |
| 3   | `POST /admin/users/:id/ban`                       | Not implemented                          |
| 4   | `POST /admin/users/:id/unban`                     | Not implemented                          |
| 5   | Admin-only middleware on `/admin/*` routes        | Not implemented                          |
| 6   | `?search=` param on `GET /users`                  | Client-side workaround active            |
| 7   | `POST /api/profiles/:id/purchases`                | Not implemented — unlock is local-only   |
| 8   | `GET /api/profiles/:id/matches`                   | Not implemented — stats are placeholders |
| 9   | `POST /api/auth/reset-password`                   | Not implemented                          |

### 🗂️ Remaining Webstore Backend Dependency

The purchase flow is fully implemented on the frontend. The one remaining gap is that the backend does not yet deduct coins from the profile when a purchase is made — the `POST /purchases` endpoint creates the purchase record but coin deduction logic is missing server-side. The coin balance displayed in the header will not decrease after a purchase until this is fixed on the backend.

---

## Appendix: Adding a New Page

1. Create the component in `src/components/pages/mainPages/MyPage.tsx`
2. Add a lazy import in `src/main.tsx`
3. Add the route in the `createBrowserRouter` config
4. Add a nav item in `src/components/nav/navLogic/navItems.ts` (use a `labelKey`)
5. Add translations for the label in `src/locales/en/nav.json` and `src/locales/hu/nav.json`
6. Use `useSettings()` + theme helpers for all styling

```tsx
// Minimal page template
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { getBackgroundClasses, getTextColor } from "@/lib/utils";
import Navbar from "../../nav/Navbar";

export function MyPage() {
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <div className="p-4 h-screen overflow-y-auto">
      <Navbar />
      <div className={`mt-20 ${bgClass} ${textColor} rounded-xl p-6`}>
        {/* content */}
      </div>
    </div>
  );
}
```
