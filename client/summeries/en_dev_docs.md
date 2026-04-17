# SMAASH Client — Developer Documentation

> This guide covers the architecture, conventions, algorithms, and practical workflows for the SMAASH web client. It explains not just *what* to use, but *why* it works the way it does.

---

## The Big Picture

The client is a **React 19 + TypeScript** single-page application serving authenticated game players and admins. It is built mobile-first, with a strong emphasis on visual polish (custom animation system, adaptive theming), real-time API state (React Query), and a consistent developer experience.

**Tech stack:**

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 4 + shared theme helpers |
| Animation | `motion/react` (Framer Motion v11) |
| Data fetching | React Query v5 + Axios |
| Internationalization | i18next (English / Hungarian) |
| Icons | Lucide React |

**Key entry points:**

- `src/main.tsx` — routes, lazy loading, error boundaries
- `src/RootLayout.tsx` — global providers, React Query setup, persistence, global debug effects
- `src/Wrapper.tsx` — theme gradient generation, CSS variable emission, animated background selection and layout frame
- `src/pages/*` — feature modules (auth, game, admin, debug, etc.)
- `src/hooks/*` — data fetching logic via React Query hooks
- `src/lib/utils/*` — shared theme, color math, date, and string helpers
- `src/lib/constants/*` — shared domain constants (item rarities, combat types, accepted image types)
- `src/backgrounds/*` — canvas and CSS-based animated background components

---

## Authentication & Authorization

### Route Structure

Three routes are public and require no session:

- `/login` — credential entry, JWT capture via HTTP-only cookie
- `/signup` — account creation
- `/reset-password` — password recovery flow

Every route under `/app/*` is gated by the `RequireAuth` wrapper component, which checks `AuthContext.isLoggedIn` and redirects to `/app/login` if the session is absent.

### Role-Gated Pages

| Route | Required role |
|---|---|
| `/app/admin` | `admin` |
| `/app/debug` | `admin` |

Role checks happen at the route level, and are re-checked at the component entry point as a defensive measure. Never bury a permission check inside a nested child — keep it at the page boundary so it is impossible to accidentally render privileged UI.

### Auth Flow

```
1. User POSTs to /auth/login
2. Server sets an HTTP-only session cookie
3. AuthProvider fires GET /users/whoami on mount
4. Response populates AuthContext: { userId, isAdmin, isSupport, isLoggedIn }
5. Any 401 from apiClient auto-redirects to /app/login
```

This design means the client never stores a token in JS memory or localStorage — the cookie is invisible to scripts, which eliminates a whole class of XSS token-theft vectors.

---

## Provider Architecture

Providers are stacked in `RootLayout.tsx` in a deliberate order. Each provider depends on those above it:

```
React Query (persisted cache)
  ↓
AuthProvider          ← resolves identity; everything else depends on this
  ↓
SettingsProvider      ← loads theme prefs before any visual component renders
  ↓
NavbarProvider        ← needs settings for theme-aware scroll behavior
  ↓
ColorProvider         ← emits CSS variables from gradient colors; must run before painted UI
  ↓
ProfileProvider       ← needs auth (userId) to load the correct profile from localStorage
  ↓
App (routes, pages)
```

Changing this order silently breaks things. For example, placing `ColorProvider` above `SettingsProvider` would emit CSS variables before `useLiquidGlass` / `useDarkMode` are known, causing a visible color flash on first render.

### Persisted State

These values survive hard refreshes via localStorage:

| Key | Provider | What it stores |
|---|---|---|
| `settings` | SettingsProvider | Theme flags, animation prefs, language |
| `color-settings` | ColorProvider | Gradient colors + animation override |
| `selected_profile_<userId>` | ProfileProvider | Which character is currently active |

---

## Theme & Visual System

### The Golden Rule

Every component that renders themed UI must use the shared helpers in `src/lib/utils/themeClasses.ts`. Never write inline ternary theme chains:

```typescript
// ✅ Do this — centralised, one place to change
const bg = getBackgroundClasses(useLiquidGlass, useDarkMode);
const text = getTextColor(useLiquidGlass, useDarkMode);
const input = getInputClasses(useLiquidGlass, useDarkMode);

// ❌ Never this — fragile, duplicated everywhere
const bg = useDarkMode
  ? useLiquidGlass ? "bg-white/10 backdrop-blur-md" : "bg-gray-900"
  : "bg-white";
```

If the dark-mode color for a card needs to change, you update one function and every card in the app updates automatically.

### Key Theme Flags

| Setting | Effect |
|---|---|
| `useLiquidGlass` | Glassmorphism: `backdrop-blur` + semi-transparent backgrounds |
| `useDarkMode` | Dark vs. light color scheme |
| `useAnimations` | Enable / disable all motion |
| `animationOverride` | Force a specific background effect (see below) |

### CSS Variable Generation Algorithm

`ColorProvider` takes the user's 3-point gradient selection and derives a full set of CSS custom properties. The algorithm is:

```typescript
// Given: accent = "#fff700" (user-picked primary color)

// 1. Lighten the accent slightly for hover states
const accentHover = lightenHex(accent, 0.15); // → "#ffed4e"

// 2. Make a transparent soft version for backgrounds/chips
const accentSoft = hexToRgba(accent, 0.15); // → "rgba(255, 247, 0, 0.15)"

// 3. Make very-low-opacity versions for nav border and shadow
const navBorder = hexToRgba(accent, 0.2);
const navShadow = hexToRgba(accent, 0.1);

// 4. Inject all of them into :root
document.documentElement.style.setProperty("--theme-accent", accent);
document.documentElement.style.setProperty("--theme-accent-hover", accentHover);
document.documentElement.style.setProperty("--theme-accent-soft", accentSoft);
document.documentElement.style.setProperty("--theme-nav-border", navBorder);
document.documentElement.style.setProperty("--theme-nav-shadow", navShadow);
```

The result is that every component using `var(--theme-accent)` in CSS automatically reflects the user's color choice — including Navbar borders, button glows, and badge backgrounds — without any React re-render of those components.

---

## Animation & Background System

### Background Selection Algorithm

The animated background system supports four modes, controlled by `animationOverride` in settings:

```
animationOverride === null       → use the theme's default animation key
animationOverride === "none"     → render nothing (static page)
animationOverride === "aurora"   → force a single named effect, ignore theme
animationOverride === "custom"   → render CompositeBackground (layered effects)
```

The selection logic in `Wrapper.tsx` resolves the correct background component before any render:

```typescript
function resolveBackground(override: string | null, themeDefault: AnimationKey) {
  if (override === null) return themeDefault;
  if (override === "none") return null;
  if (override === "custom") return "composite";
  return override as AnimationKey; // validated key
}
```

### Crossfade on Switch

When the animation changes, the new background fades in while the old one fades out. This avoids a harsh cut. The crossfade is driven by `AnimatePresence` with `mode="wait"` wrapping the background component, keyed by the resolved animation name:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={resolvedAnimation}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
  >
    <BackgroundComponent />
  </motion.div>
</AnimatePresence>
```

### Background Architecture

All CSS `@keyframes` for background animations (lava blobs, sakura petals, cloud drift) live in `src/index.css`. Background component files reference these keyframes via Tailwind arbitrary animation classes like `animate-[lava-blob-1_11s_ease-in-out_infinite]` or inline `style={{ animation: "sakura-fall ..." }}` — they do not inject `<style>` tags.

Canvas-based backgrounds (`DeepSpace`, `Fishtank`, `ParticleWeb`, `Storm`, etc.) import shared utilities from `src/lib/utils`:

- `hexToRgbTuple(hex)` → `[r, g, b]` — converts hex color to an RGB tuple for canvas operations
- `lerp(a, b, t)` → number — linear interpolation used for smooth transitions in canvas animations

### Performance Notes

- Backgrounds are **deferred** on heavy card pages: they fade in after ~500ms so the page's primary content renders and paints first, avoiding jank
- When `useAnimations` is false, motion holds its last rendered frame — there is no flash or re-layout, it simply stops
- `CompositeBackground` lazily mounts each sub-effect as a canvas layer; layers that are toggled off unmount cleanly

---

## Shared Constants

### Item Constants (`src/lib/constants/itemConstants.ts`)

Webstore item configuration is defined once and imported wherever needed:

```typescript
export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
export const COMBAT_TYPES = ["Melee", "Ranged"] as const;

export const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
```

Used by: `CreateItemDialog`, `EditItemDialog`, and any component rendering rarity badges or combat type selectors.

---

## API & Data Fetching

### The API Client

`src/lib/apiClient.ts` is a pre-configured Axios instance:

```typescript
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // sends the HTTP-only session cookie
});

// Global 401 interceptor — any unauthorized response redirects to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/app/login";
    }
    return Promise.reject(err);
  }
);
```

### React Query Hook Pattern

All data fetching lives in hooks under `src/hooks/`. The standard pattern:

```typescript
// src/hooks/useGetStats.ts
export function useGetStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.stats(userId),
    queryFn: () => apiClient.get<StatsResponse>(`/stats/${userId}`).then(r => r.data),
    staleTime: 1000 * 60 * 5, // 5 minutes before background refetch
    enabled: !!userId,         // don't fire if userId is empty
  });
}
```

Benefits over raw `useEffect` + `useState`:
- Automatic deduplication: multiple components using the same query share one request
- Background refetch on window focus
- Built-in loading / error state
- Cache invalidation after mutations keeps UI consistent

### Query Key Factory

Hardcoding query key arrays everywhere makes cache invalidation a maintenance nightmare. Use the factory in `src/lib/queryKeys.ts`:

```typescript
// Define once, centrally
export const queryKeys = {
  stats: (userId: string) => ["stats", userId] as const,
  leaderboard: () => ["leaderboard"] as const,
  user: (id: number) => ["user", id] as const,
};

// Invalidate precisely after a mutation
queryClient.invalidateQueries({ queryKey: queryKeys.stats(userId) });
```

This means renaming a cache key only requires changing one line.

---

## Page Layout Contract

### Fixed Navbar Clearance

The Navbar is `position: fixed`, meaning it is **outside the document flow**. Content starting at `y=0` renders behind it. The correct pattern is used in `AdminPage` and should be followed on all full-page layouts:

```tsx
<div className="flex h-dvh w-full flex-col">

  {/* Fixed navbar — renders above everything, not in flow */}
  <Navbar />

  {/* Physical spacer matching the navbar height. This pushes the
      scroll container below the navbar in the layout flow. */}
  <div className="h-24 shrink-0" aria-hidden="true" />

  {/* Scroll container: fills the remaining viewport height.
      overflow-y-auto means the page scrolls here, not on <body>. */}
  <div className="flex flex-1 overflow-y-auto">

    {/* Content wrapper: min-h-full + flex-1 ensures it fills the
        scroll container, so py-4/py-5 creates equal top and bottom
        breathing room even when the card content is short. */}
    <div className="flex min-h-full w-full flex-1 flex-col items-center px-3 py-4 sm:px-6 sm:py-5 lg:px-10">
      <PageContent />
    </div>

  </div>
</div>
```

The key insight: `min-h-full flex-1` on the content wrapper makes it always stretch to fill the scroll container, which means the `py-4/py-5` padding is always the only space between the viewport edge and the card — giving perfectly equal top and bottom margins regardless of how much content is on the page.

---

## The Pill-Container Tab Picker

This is the standard tab selector used across Gallery, Leaderboard, Webstore (ItemFilters), and Releases (SelectOs). It features a sliding highlight that follows the mouse in Liquid Glass mode.

### Algorithm

```tsx
// 1. State at the container level
const containerRef = useRef<HTMLDivElement>(null);
const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
const [isHovering, setIsHovering] = useState(false);

// 2. On mouse-enter for any tab button:
function handleTabMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
  if (!useLiquidGlass) return;
  setIsHovering(true);
  const rect = e.currentTarget.getBoundingClientRect();
  if (containerRef.current) {
    const parentRect = containerRef.current.getBoundingClientRect();
    setHighlightPos({ left: rect.left - parentRect.left, width: rect.width });
  }
}

// 3. On mouse-leave from the container:
function handleContainerMouseLeave() {
  if (!useLiquidGlass) return;
  setIsHovering(false);
  // Snap highlight back to the currently selected tab
  const btn = containerRef.current?.querySelector(`[data-tab="${activeTab}"]`);
  if (btn && containerRef.current) {
    const cRect = containerRef.current.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setHighlightPos({ left: bRect.left - cRect.left, width: bRect.width });
  }
}

// 4. Render
<div
  ref={containerRef}
  className={`relative flex gap-1 rounded-2xl p-1 ${panelBg}`}
  onMouseLeave={handleContainerMouseLeave}
>
  {/* Sliding highlight — only in LG (Liquid Glass) mode */}
  {useLiquidGlass && (
    <div
      className="pointer-events-none absolute rounded-lg transition-all duration-300 ease-out bg-black/25"
      style={{ left: highlightPos.left, width: highlightPos.width, top: 4, bottom: 4 }}
    />
  )}

  {tabs.map((tab) => (
    <button
      key={tab.id}
      data-tab={tab.id}
      onMouseEnter={handleTabMouseEnter}
      onClick={() => setActiveTab(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>
```

The `data-tab` attribute is what ties the button DOM element to the highlight position calculation — it avoids index-based lookups and is resilient to conditional tab rendering.

**Active state classes must handle both LG and non-LG modes.** In LG mode, buttons are transparent and the sliding highlight provides the active visual. In non-LG mode, the active button uses `bg-gray-700 shadow-md` (dark) / `bg-gray-200 shadow-md` (light).

---

## The Viewport Override (Debug Emulation)

The debug emulation tab can force the browser to behave as if it has specific dimensions, allowing JS-driven responsive logic to be tested without resizing the physical window.

### How It Works

Standard `window.innerWidth` is a read-only property, so you cannot just assign to it. The override uses `Object.defineProperty` to replace the getter:

```typescript
Object.defineProperty(window, "innerWidth",  { get: () => forcedWidth,  configurable: true });
Object.defineProperty(window, "innerHeight", { get: () => forcedHeight, configurable: true });

window.matchMedia = (query: string): MediaQueryList => {
  const match = evaluateCSSMediaQuery(query, forcedWidth, forcedHeight);
  return { matches: match, media: query, /* stubs */ };
};

window.dispatchEvent(new CustomEvent("viewport-override", {
  detail: { width: forcedWidth, height: forcedHeight }
}));
```

The `useMediaQuery` hook listens for the `"viewport-override"` custom event and forces a re-render when it fires, making responsive layout changes take effect immediately in JS-driven code.

Tailwind CSS breakpoints are compiled to CSS `@media` queries at build time and are evaluated by the browser's CSS engine against the physical viewport — the patched `window.matchMedia` does not affect them.

---

## Leaderboard Data Normalisation

All four leaderboard datasets (wins, active players, top levels, top items) have different shapes from the backend. Before being passed to `PodiumSlot` or `CategoryView`, they are normalised to a single `RankedEntry` type:

```typescript
interface RankedEntry {
  id: number;
  name: string;
  stat: number;
  statLabel: string; // e.g. "Wins", "Matches Played"
  sub?: string;      // optional subtitle (e.g. player name for a level entry)
}

const winsEntries: RankedEntry[] = leaderboardData.map((entry) => ({
  id: entry.player_id,
  name: entry.username,
  stat: entry.count_of_wins,
  statLabel: t("tabs.wins"),
}));
```

This pattern keeps `PodiumSlot` and `CategoryView` entirely generic — they never import or know about backend response types. Adding a new leaderboard category only requires a new query hook, a normalisation mapping to `RankedEntry[]`, and a new `TabId` entry.

The search filter in `CategoryView` runs on the normalised data and preserves original rank numbers through filtering by tracking rank as a separate field alongside array index.

---

## Page Deep-Dives

### Admin Panel (`/app/admin`)

The admin panel is split across three columns at `xl` breakpoint (`xl:flex-row`), each handled by its own component:

- `UserList` — searchable user list with client-side filtering
- `UserDetail` — selected user's full profile, action buttons (ban/unban, promote/demote)
- `ProfilesPanel` — the selected user's game profiles and stats
- `BanDialog` — duration-picker dialog for applying bans (preset chips + custom range + free-text reason)

The selected user flows through `useAdminPageLogic`, a single hook that owns all state and mutations for the panel. Components only receive the `logic` object — they never own their own mutation state.

### Debug Panel (`/app/debug`)

Admin-only diagnostics and operations dashboard. Eight tabs:

| Tab | Purpose |
|---|---|
| System | Runtime diagnostics and system-level state |
| Endpoints | Manual HTTP request tester |
| Cache | React Query cache inspection and invalidation |
| Game Data | CRUD workflows for characters, levels, items, and user management |
| Visual | UI debugging tools |
| Emulation | Responsive testing and network simulation |
| Diagnostics | A11y, render counts, z-index, click targets |
| Database | Generic REST-backed data browser for all resources |

### Gallery (`/app/gallery`)

Split across four files:

- `GalleryPage.tsx` — page shell, tab navigation logic, and the pill-container tab picker
- `OstPlayer.tsx` — full audio player component (play/pause, scrubber, volume, track list)
- `CharacterCard.tsx` — single character card with image loading and fallback
- `ostTracks.ts` — static `OstTrack[]` array with audio file URL imports

**Adding a new OST track:** import the audio file with `?url` in `ostTracks.ts` and add an entry to `OST_TRACKS`. The `?url` suffix is required so Vite resolves the correct base-prefixed URL for both dev and production serving.

**Characters tab:** fetches via `useDebugCharactersQuery`. Each character rendered by `CharacterCard`, which loads `GET /api/characters/:id/img` and falls back to a `Swords` placeholder on error. Animated via `LoadPost` when `useAnimations` is enabled.

### Leaderboard (`/app/leaderboard`)

Tab-based leaderboard. Tabs: `all`, `wins`, `active`, `levels`, `items`.

- **All tab:** Stat bar (four chips showing the #1 in each category) + 2×2 grid of top-5 panels
- **Category tabs:** `PodiumSlot` components for ranks 1–3 in physical podium order `[2nd | 1st | 3rd]`, animated with staggered `motion.div` delays. Runners-up (4th–5th) shown below. Full scrollable ranked list with search
- All four queries fire in parallel. `key={activeTab}` on the `CategoryView` wrapper resets search state on every tab change

### Webstore (`/app/webstore`)

1. Fetch all items from backend
2. Fetch user's purchase history
3. Compute "owned" status by intersecting item IDs with purchase records
4. Render purchase button only for unowned items
5. On purchase: deduct coins from active profile context, add to purchase list, invalidate relevant queries

Coin balance is derived from the selected profile's context, not a global wallet. Switching profiles changes the available balance.

---

## Mobile Responsiveness

### Principles

- **Mobile-first:** default styles target small screens; breakpoints (`sm:`, `md:`, `lg:`) progressively enhance
- **No fixed widths:** use `max-w-*` with `w-full` and `mx-auto`
- **Responsive horizontal padding:** `px-3 sm:px-6 lg:px-10`
- **Hide secondary content on mobile:** `hidden sm:block` for sidebars, etc.

### Dialogs on Mobile

All dialogs must use:

```tsx
<DialogContent className="max-h-[90svh] overflow-y-auto max-w-[calc(100%-2rem)] sm:max-w-lg">
```

- `max-h-[90svh]` + `overflow-y-auto`: dialog scrolls internally, never clips the viewport
- `max-w-[calc(100%-2rem)]`: preserves a 1rem side gutter on mobile
- Never use `overflow-visible` on `DialogContent` — it overrides `overflow-y-auto` and causes content to spill outside the dialog frame

---

## Shared UI Components

### StyledSelect

Use instead of native `<select>` for any dropdown that needs to match the design system:

```tsx
import { StyledSelect } from "@/components/ui/styled-select";

<StyledSelect
  value={selectedValue}
  onChange={setSelectedValue}
  options={["Option A", "Option B"]}
  inputClass={inputClass}
  textColor={textColor}
  bgClass={bgClass}
  renderOption={(o) => o}
/>
```

### Skeleton

Pulse-animated loading placeholder. Always prefer skeleton over a spinner for content areas:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="flex flex-col gap-3">
  <Skeleton className="h-10 w-full rounded-lg" />
  <Skeleton className="h-10 w-3/4 rounded-lg" />
</div>
```

### AnimatePresence / LoadPost

For staggered list entrance animations, use `LoadPost`:

```tsx
{items.map((item, i) => (
  <LoadPost key={item.id} index={i}>
    <ItemCard item={item} />
  </LoadPost>
))}
```

`LoadPost` applies a staggered `opacity` + `y` entrance, scaled by `index`. Only renders the animation when `useAnimations` is enabled.

---

## i18n Conventions

Locale files live in:
- `src/locales/en/` — English strings
- `src/locales/hu/` — Hungarian strings

Namespaces match the page or feature (e.g. `admin`, `nav`, `leaderboard`). Always add keys to **both** locale files simultaneously. Use `useTranslation("namespace")` inside components:

```tsx
const { t } = useTranslation("admin");
return <p>{t("detail.bannedPermanent")}</p>;
```

---

## Best Practices

### Do

- **Use theme helpers.** `getBackgroundClasses()`, `getTextColor()`, `getInputClasses()` — these are the contract. Inline ternaries fragment the theme system.
- **Use `StyledSelect`** for all dropdowns. Native `<select>` cannot be themed consistently.
- **Use `hexToRgbTuple` from `@/lib/utils`** in canvas backgrounds instead of a local implementation.
- **Import audio/asset files with `?url`** so Vite resolves the correct base-prefixed, hashed URL.
- **Put shared domain constants in `src/lib/constants/`** rather than duplicating them across components.
- **Keep `@keyframes` in `index.css`**, not injected via `<style>` tags in components.
- **Type React Query responses.** Ensure `queryFn` return type and response interface match.
- **Keep role checks at page boundaries.** Never bury permission logic in a deeply nested component.
- **Translate all user-facing strings.** Add to both `en` and `hu` locale files at the same time.
- **Follow the pill-container tab picker pattern** for any new tab selectors.

### Avoid

- Inline ternary theme chains like `useDarkMode ? useLiquidGlass ? "..." : "..." : "..."`
- Native `<select>` elements
- Local `hexToRgb` / `lerp` implementations in background files — import from `@/lib/utils`
- Injecting `<style>` tags in component render output
- Hardcoded hex colors or Tailwind color classes that bypass the theme helpers
- Skipping navbar clearance on new full-page layouts
- `overflow-visible` on `DialogContent`
- Exporting non-component values from component files (breaks React Fast Refresh)

---

## Optimization Status

- Route-level lazy loading with `React.lazy` + `Suspense` fallback
- Manual vendor chunk splitting (Vite config)
- Leaderboard skeleton loading (replaces spinner, shows content shape)
- Staggered panel entrance for readable loading
- Build bundle visualization support (`rollup-plugin-visualizer`)
