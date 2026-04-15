# SMAASH Client — Developer Documentation

**Last updated:** 2026-04-13 (rev 8)

> This guide covers the architecture, conventions, and practical workflows for the SMAASH web client. It's meant to be helpful—not just a checklist.

---

## Getting Started: The Big Picture

The client is a **React 19 + TypeScript** app that serves authenticated game players and admins. It's built for responsiveness (mobile-first mindset with Tailwind), real-time API state (React Query), and a polished visual experience (custom animations and theme system).

**Tech stack at a glance:**

- **UI Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + custom theme utilities
- **Animation:** `motion/react` (Framer Motion)
- **State & API:** React Query + Axios
- **i18n:** i18next (English / Hungarian)
- **Icons:** Lucide React

**Where code lives:**

- `src/main.tsx` — routes, lazy loading, error boundaries
- `src/RootLayout.tsx` — global providers, React Query setup, persistence
- `src/Wrapper.tsx` — theme generation, CSS variables, animated backgrounds
- `src/pages/*` — feature modules (auth, game, admin, debug)
- `src/hooks/*` — data fetching logic (React Query hooks)
- `src/lib/utils/*` — shared theme, color, and type helpers

---

## Authentication & Authorization

### Public vs. Protected

Three public routes handle onboarding:

- `/login` — form, JWT capture
- `/signup` — new account creation
- `/reset-password` — password recovery flow

Everything under `/app/*` requires authentication via `RequireAuth` guard.

### Role-Gated Features

Some pages are only available to specific roles:

- `/app/admin` — admin moderation tools (user ban, profile management)
- `/app/debug` — admin-only diagnostics and operations dashboard

Role checks happen at the route level, but also re-verified at component entry points as a safety measure.

### How Auth Works

1. User logs in via `/auth/login`
2. Session is maintained by HTTP-only cookies (`withCredentials: true`)
3. `AuthProvider` resolves identity via `GET /users/whoami`
4. `AuthContext` exposes `userId`, `isAdmin`, `isSupport`, and `isLoggedIn`
5. For non-auth endpoints, 401 responses trigger redirect to `/app/login`

---

## Provider Architecture

Providers wrap the app in this order (see `RootLayout.tsx`):

```
React Query (persisted)
  ↓
AuthProvider
  ↓
SettingsProvider
  ↓
NavbarProvider
  ↓
ColorProvider
  ↓
ProfileProvider
  ↓
App
```

**Why this order matters:**

- Auth must be available before feature providers
- Settings must load before theme generation
- ColorProvider needs to emit CSS variables before child renders

### Persisted State

These values survive page reload (stored in localStorage):

| Key                         | Provider         | Purpose                                |
| --------------------------- | ---------------- | -------------------------------------- |
| `settings`                  | SettingsProvider | UI prefs (theme, animations, language) |
| `color-settings`            | ColorProvider    | gradient colors + animation override   |
| `selected_profile_<userId>` | ProfileProvider  | which character is active              |

---

## Theme & Visual System

### The Unified Approach

Instead of scattered inline styles, use shared helpers in `src/lib/utils/themeClasses.ts`:

```typescript
// ✅ Do this
const bgClass = getBackgroundClasses(useLiquidGlass, useDarkMode);
const textColor = getTextColor(useLiquidGlass, useDarkMode);
const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

// ❌ Avoid this
const bgClass = useDarkMode ? "bg-gray-900" : "bg-white";
```

This keeps theme changes **centralized**. If you need to adjust dark mode colors, you update _one function_, not 50 component files.

### Key Theme Flags

These control the entire visual presentation:

| Setting             | Effect                                         |
| ------------------- | ---------------------------------------------- |
| `useLiquidGlass`    | Glassmorphism with blur + transparency         |
| `useDarkMode`       | Dark / light color scheme                      |
| `useAnimations`     | Enable / disable motion                        |
| `animationOverride` | Force a specific background effect (see below) |

### CSS Variables from Gradient

When a user sets custom theme colors, `ColorProvider` generates CSS variables:

```css
--theme-accent: #fff700;
--theme-accent-hover: #ffed4e;
--theme-accent-soft: rgba(255, 247, 0, 0.15);
--theme-nav-border: rgba(255, 247, 0, 0.2);
--theme-nav-shadow: 0 2px 8px rgba(255, 247, 0, 0.1);
```

These are used in components like Navbar borders and shadows for a cohesive look.

---

## Animation & Background System

### How Backgrounds Work

Backgrounds are layered visual effects tied to the theme. Each background has a unique animation style:

- `aurora` — slow, organic light movements
- `matrix` — tech-style falling columns
- `particles` — floating geometric shapes
- And more, defined in `AnimatedBackground.tsx`

### Selecting Animations

Users can pick animations in Settings. Three modes:

1. **Default mode** (`animationOverride: null`)  
   Follow the theme's natural animation choice.

2. **Disabled mode** (`animationOverride: "none"`)  
   Static, no motion. Good for users with reduced-motion preference or performance constraints.

3. **Single effect** (`animationOverride: "aurora"`)  
   Force one background effect regardless of theme.

4. **Custom mix** (`animationOverride: "custom"`)  
   Layer multiple sub-effects together using EffectMixDialog.

### Performance Notes

- Backgrounds are deferred (fade in after ~500ms) on heavy card pages to avoid jank
- Switching backgrounds crossfades smoothly
- Motion pauses when animations are disabled (no flicker, just holds current frame)

---

## API & Data Fetching

### The API Client

Located in `src/lib/apiClient.ts`:

```typescript
const response = await apiClient.get("/api/players");
// Or with Axios directly
const response = await axios.get("/api/users/me");
```

**Default behavior:**

- Base URL: `/api`
- Credentials: included (for auth cookies if needed)
- 401 errors: auto-redirect to login

### React Query Conventions

All data fetching uses React Query for consistency. Define hooks like this:

```typescript
// src/hooks/useGetStats.ts
export function useGetStats(userId: string) {
  return useQuery({
    queryKey: ["stats", userId],
    queryFn: () => apiClient.get(`/stats/${userId}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

Benefits:

- Automatic caching & deduplication
- Refetch on focus, with backoff
- DevTools support for debugging cache state
- Invalidate on mutations for consistency

### Key Factory Pattern

Instead of hardcoding query keys everywhere, use a factory (see `src/lib/queryKeys.ts`):

```typescript
// Define once
const queryKeys = {
  stats: (userId: string) => ["stats", userId],
  leaderboard: () => ["leaderboard"],
};

// Use everywhere
useQuery({ queryKey: queryKeys.stats(userId), ... })
```

This makes refactoring cache invalidation much easier later.

---

## Page Deep-Dives

### Admin Panel (`/app/admin`)

Admins manage users, apply bans, and monitor platform health.

**Key components:**

- `UserList` — paginated, searchable user table
- `UserDetail` — full profile edit, ban history
- `BanDialog` — role-based ban UI (temporary/permanent, presets, custom reason)

**Current limitations:**

- User search is client-side (backend pagination coming)
- Ban reasons are preset chips; custom free-text also supported

### Debug Panel (`/app/debug`)

Admin-only diagnostics and operations dashboard.

**Core tabs:**

1. **System** — runtime/system-level diagnostics
2. **Endpoints** — manual endpoint testing
3. **Cache** — React Query cache inspection/invalidation
4. **Game Data** — interactive CRUD + moderation workflows
5. **Visual** — UI debugging
6. **Emulation** — responsive testing & network simulation
7. **Diagnostics** — performance & accessibility insights
8. **Database** — generic REST-backed data browser + schema/reference view

Detailed highlights:

- **Database** — new generic admin data browser
  - Resource selectors: Users, Profiles, Items, Characters, Levels, Categories, Rarities, Purchases, Roles, Posts, Stats
  - Row-level CRUD via create/edit dialogs and delete confirmations (where backend endpoints exist)
  - Hardcoded schema/reference view derived from Go/GORM models (client-side documentation layer)
  - Inline user moderation actions: Ban (duration picker), Unban, Promote, Demote
  - Session-only action history (in-memory ring, max 20 actions)
  - Danger Zone area with cascade warnings (notably Users/Profiles)
  - Current constraints: no seed/reset endpoints, posts delete unavailable, image upload flows intentionally excluded

- **Visual** — UI debugging
  - Animation speed control
  - Navbar override (useful for testing mobile behavior)
  - Backdrop blur toggle
  - Layout borders (highlight elements)
  - Element inspector (hover-highlight DOM nodes)
  - Overlay controls: FPS counter, scroll position, breakpoint badge
  - Toast test (fire sample notifications)
  - CSS variable explorer with color swatches

- **Emulation** — Responsive testing & network simulation
  - Reduced motion toggle (respects OS preference, can override)
  - Compact density (smaller fonts/spacing)
  - Safe-area outlines (highlights safe-inset areas on notch devices)
  - **Force JS Viewport** — emulate device sizes for responsive testing
    - Presets: Desktop 1280, Desktop 1920, Tablet 768, Mobile 390, Mobile 360
    - Custom width/height input
    - **Note:** Tailwind CSS classes are compile-time; only JS-driven media queries respond to viewport forcing
  - Network simulation (delay + jitter in milliseconds)

- **Diagnostics** — Performance & accessibility insights
  - A11y contrast checker (CSS variables vs. white/black backgrounds)
  - Focus ring preview
  - Render diagnostics (component render count, React Query fetch/mutate operations)
  - Click target size inspector
  - z-index stack viewer

- **Game Data** — expanded interaction scope
  - Full CRUD flows for characters, levels, and items
  - Item form selectors wired to rarity/category datasets
  - User management table with moderation actions (ban/promote/demote)

- **Hook surface (`useDebug.ts`)**
  - Added multiple debug query hooks and broad mutation coverage for CRUD-capable endpoints
  - New JSDoc coverage on added hooks to keep IntelliSense and usage guidance consistent

**Viewport Override Technical Details:**

- Patches `window.innerWidth`, `window.innerHeight`, `window.outerWidth`, `window.outerHeight`
- Replaces `window.matchMedia` with a custom function that evaluates CSS queries against forced dimensions
- Dispatches `CustomEvent("viewport-override")` so hooks like `useMediaQuery` re-evaluate immediately
- Cleanup effect restores original values on unmount or disable

### Profile (`/app/profile`)

Players manage their account settings.

**Current features:**

- Display name edit
- Email edit
- Selected profile stats (if match history endpoint available)

**Not yet wired:**

- Password change (awaiting backend endpoint)
- Match history / detailed stats

### Webstore (`/app/webstore`)

Browse and purchase in-game items.

**How it works:**

1. Fetch all items from backend
2. Query user's purchases
3. Compute "owned" items by checking purchase history
4. Show purchase button for unowned items
5. On purchase → deduct coins, add to purchase list, update UI

**State:**

- Coins balance comes from selected profile's context
- Purchases are fetched and merged per user

### Gallery (`/app/gallery`)

Two-tab page: **Characters** grid and **OST** music player.

**Tab picker:** Uses the shared pill-container pattern — `panelBg` container with `relative` positioning, a sliding highlight div (LG mode only), and `data-tab` attributes on each button for selector-based position tracking. Active state: `bg-gray-700 shadow-md` (non-LG dark) / `bg-gray-200 shadow-md` (non-LG light). Inactive hover: `hover:bg-gray-700` / `hover:bg-gray-100`. In LG mode the buttons are transparent and the sliding highlight provides the active visual. Mouse-enter on each button updates `highlightPos`; mouse-leave on the container resets it to the selected tab.

The `TabButton` component is local to `GalleryPage`. It receives `dataTab`, `onMouseEnter`, and `isHovering` props to participate in the container-level highlight tracking.

**Characters tab:** Fetches via `useDebugCharactersQuery` (requires ADMIN — see `GET /characters` auth issue in `docs/problems.md`). Each character is rendered by `CharacterCard`, which loads `GET /api/characters/:id/img` and falls back to a `Swords` placeholder icon on error. Animated via `LoadPost` when `useAnimations` is on.

**OST tab:** Static `OstTrack[]` list defined at the top of the file. Add tracks by editing `OST_TRACKS`. Fully functional audio player with scrubber, volume, and a track list.

### Leaderboard (`/app/leaderboard`)

Tab-based leaderboard with a podium view per category and a global "All" overview.

**Tab picker:** Same pill-container pattern as Gallery and `ItemFilters` — `tabContainerRef`, `highlightPos`, `isHovering` state at the page level; sliding highlight div in LG mode; `data-tab` on each button. Active state: `bg-gray-700 shadow-md` / `bg-gray-200 shadow-md`. Inactive hover: `hover:bg-gray-700` / `hover:bg-gray-100`.

**Tab structure (`TabId`):**

| Tab | Data source | Key stat |
|---|---|---|
| `all` | All four queries | Stat bar + top-5 panels |
| `wins` | `useLeaderboardQuery` | `count_of_wins` |
| `active` | `useTopPlayersQuery` | `count_of_matches` |
| `levels` | `useTopLevelsQuery` | `count_of_plays` |
| `items` | `useTopItemsQuery` | `count_of_purchases` |

**"All" view:**

- Stat bar: 4 chips showing the #1 performer in each category
- 2×2 grid with top 5 rows per panel (reduced from 10 to reduce dead space)
- Each panel has its own skeleton while its query loads

**Category view (any tab except "all"):**

- `PodiumSlot` components for ranks 1–3, rendered in order `[2nd | 1st | 3rd]` to match a physical podium; animated with `motion.div` (0.4s ease-out, staggered 0 / 0.15 / 0.30 s)
- Runners-up row for ranks 4–5 if they exist
- `CategoryView` component holds local `search` state; data is normalised to `RankedEntry[]` before passing in
- Scrollable list (`max-h-72 overflow-y-auto`) of all entries with their original rank numbers preserved through filtering

**Data normalisation:**

All four datasets are mapped to `RankedEntry { id, name, stat, statLabel, sub? }` in the page component before being passed down. This keeps `PodiumSlot` and `CategoryView` fully generic.

**Performance:**

- `CardAnimation` (1.5 s spring) and `LoadPost` row stagger are no longer used on this page — content is visible immediately
- Tab switching uses `AnimatePresence mode="wait"` with a 0.18 s opacity/y fade
- Each `CategoryView` mount resets search state (desirable; enforced by `key={activeTab}` on the wrapper)
- All four queries still fire in parallel; skeleton per panel covers the individual loading states

**Locale keys added** (both `en` and `hu`): `tabs.*`, `podium.runnersUp`, `podium.fullRankings`, `statBar.*`, `search`.

---

## Navbar & Page Layout

### Fixed Navbar Contract

The navbar is `position: fixed`, so it **doesn't take up document flow**. This means **your content starts at y=0 behind the navbar** unless you add padding.

### The Fix

Every page with a navbar must add spacing to its first content container:

```tsx
// ✅ Good
<div className="mt-20">  {/* or pt-20 for padding-top */}
  <h1>Page title</h1>
  ...
</div>

// ❌ Bad — content hides behind navbar
<div>
  <h1>Page title</h1>
</div>
```

### Special Case: Centered Content

If you're using flexbox to center (like Settings or Profile):

```tsx
// ✅ Good
<div className="w-full flex flex-col items-center justify-center pt-20">
  <FormCard>...</FormCard>
</div>

// ❌ Bad — centering alone doesn't fix navbar overlap
<div className="w-full flex flex-col items-center justify-center">
  <FormCard>...</FormCard>
</div>
```

**Confirmed covered pages:** Gallery, Leaderboard, Webstore, News, Releases (all have mt-20 or pt-20).

---

## Mobile Responsiveness

### Design Principles

- **Mobile-first:** Start with small-screen styles, use Tailwind breakpoints to enhance for larger screens
- **No fixed widths:** Use `max-w-*` with `mx-auto` instead of hardcoded widths
- **Flexible padding:** `px-4 sm:px-6 lg:px-10` for responsive horizontal spacing
- **Hidden on mobile:** Use `hidden sm:block` to collapse sidebars or secondary content

### Debug Panel on Mobile

The debug panel's sidebar collapses on screens below `md` breakpoint:

- Mobile: Hamburger menu → drawer with tab pills
- Desktop: Fixed left sidebar

The drawer auto-closes after selecting a tab so content gets full width.

### Dialogs on Mobile

All dialogs now have:

- `max-h-[90svh]` with `overflow-y-auto` (scrollable, fits viewport)
- Responsive max-width using `max-w-[calc(100%-2rem)]` on mobile with a `sm:max-w-*` cap on larger screens — this preserves the base dialog's side gutter. **Do not** override with `max-w-full` on mobile, as it eliminates the side margins entirely
- No fixed widths that break on phones

**News dialogs (Add & Edit) specifically:**

- Image settings section stacks vertically on mobile: `flex flex-col gap-4 sm:flex-row sm:items-start`. The radio cards, file input, and resizable size panel each take full width on small screens and go side-by-side on `sm+`
- `RadioGroupChoiceCard` uses `w-full sm:max-w-sm` — full-width on mobile, capped on larger screens
- **Do not add `overflow-visible` to `DialogContent`** — it overrides the base `overflow-y-auto` and breaks scrollability, causing content to spill outside the dialog instead of scrolling

---

## Shared UI Components

### StyledSelect

Use this instead of native `<select>` for styled, theme-aware dropdowns.

```tsx
import { StyledSelect } from "@/components/ui/styled-select";

<StyledSelect
  value={selectedValue}
  onChange={setSelectedValue}
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]}
  inputClass={inputClass}
  textColor={textColor}
  bgClass={bgClass}
/>;
```

Used throughout the app: HTTP method selector in Endpoints tab, viewport preset picker in Debug Emulation, item rarity/kind in Webstore.

### Skeleton

Loading state component with pulse animation:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="grid gap-2">
  {[1, 2, 3].map((i) => (
    <Skeleton key={i} className="h-12 w-full" />
  ))}
</div>;
```

---

## Best Practices & Conventions

### ✅ Do

- **Reuse theme helpers.** If you're building a button or card, use `getBackgroundClasses()` + `getTextColor()`. Don't inline theme ternaries.
- **Use StyledSelect** for all dropdowns. It matches the design system.
- **Type-check React Query hooks.** Ensure `queryFn` and response types align.
- **Keep role checks explicit.** Don't bury permission logic in nested components—check at the page boundary.
- **Translate UI strings.** Use the i18n namespace for all user-facing text.
- **Test on mobile.** Use the debug panel's force viewport feature or browser DevTools.
- **Follow the pill-container tab picker pattern** for any new tab selectors. See Gallery and Leaderboard for the reference implementation: `panelBg` wrapper with `relative`, a conditionally rendered sliding highlight div (LG only), `data-tab` attributes on buttons, `containerRef` + `highlightPos` + `isHovering` state at the container level, and `onMouseEnter`/`onMouseLeave` handlers to drive the highlight. Active non-LG style: `bg-gray-700 shadow-md` (dark) / `bg-gray-200 shadow-md` (light). Inactive hover: `hover:bg-gray-700` / `hover:bg-gray-100`. This matches `ItemFilters` and `SelectOs`.

### ❌ Avoid

- Inline ternary chains like `useDarkMode ? useLiquidGlass ? "..." : "..." : "..."`
- Native HTML `<select>` elements (use `StyledSelect`)
- Hardcoded theme colors (use CSS variables or theme helpers)
- Skipping navbar padding (always add mt-20 or pt-20)
- Mixing camelCase and snake_case in localStorage keys
- Tab picker active states that ignore `useLiquidGlass` (the old leaderboard pattern of `bg-white/15`/`bg-white` without LG handling)

---

## Future Improvements & Known Blockers

### Backend Dependencies

- **Profile match history endpoint** — needed to populate stats & detailed match records
- **Password change endpoint** — allows in-profile password updates (currently blocked)
- **Admin search/pagination** — user list needs server-side query support
- **Role consistency** — some endpoints should pre-populate role data for perf

### Optimizations

- **Image formats:** WebP/AVIF with fallbacks
- **Virtualization:** Large data grids (admin user list) could use react-window
- **Prefetching:** Route hover → prefetch leaderboard queries
- **PWA:** If offline support becomes a requirement

---

## Getting Help

If something is unclear or broken:

1. **Check the debug panel** (`/app/debug`) for system state and error logs
2. **Review existing page implementations** — there's usually a similar pattern elsewhere
3. **Update this doc** if you learn something new
