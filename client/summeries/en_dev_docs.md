# SMAASH Client — Developer Documentation

**Last updated:** 2026-04-02 (rev 3)

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
- `/app/debug` — system diagnostics (admin + support staff)

Role checks happen at the route level, but also re-verified at component entry points as a safety measure.

### How Auth Works

1. User logs in → server returns JWT
2. JWT stored in localStorage via `AuthProvider`
3. Every request includes JWT via Axios interceptor
4. If 401 returned → auto-redirect to login, clear localStorage
5. `AuthContext` provides current `userId`, `userRole`, etc. to components

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

Instead of hardcoding query keys everywhere, use a factory (see `src/hooks/queryKeys.ts`):

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

Available to admins and support staff for system diagnostics.

**Three tabs:**

1. **Visual** — UI debugging
   - Animation speed control
   - Navbar override (useful for testing mobile behavior)
   - Backdrop blur toggle
   - Layout borders (highlight elements)
   - Element inspector (hover-highlight DOM nodes)
   - Overlay controls: FPS counter, scroll position, breakpoint badge
   - Toast test (fire sample notifications)
   - CSS variable explorer with color swatches

2. **Emulation** — Responsive testing & network simulation
   - Reduced motion toggle (respects OS preference, can override)
   - Compact density (smaller fonts/spacing)
   - Safe-area outlines (highlights safe-inset areas on notch devices)
   - **Force JS Viewport** — emulate device sizes for responsive testing
     - Presets: Desktop 1280, Desktop 1920, Tablet 768, Mobile 390, Mobile 360
     - Custom width/height input
     - **Note:** Tailwind CSS classes are compile-time; only JS-driven media queries respond to viewport forcing
   - Network simulation (delay + jitter in milliseconds)

3. **Diagnostics** — Performance & accessibility insights
   - A11y contrast checker (CSS variables vs. white/black backgrounds)
   - Focus ring preview
   - Render diagnostics (component render count, React Query fetch/mutate operations)
   - Click target size inspector
   - z-index stack viewer

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

### Leaderboard (`/app/leaderboard`)

Display top players/levels/items globally.

**Performance story:**

- 4 separate stats queries fire in parallel (React Query deduplicates if the same request runs twice)
- Slowest endpoint gates all four panels (they wait for all data before rendering)
- **Skeleton loading:** 5 skeleton rows per panel appear immediately while data loads, instead of a spinner
- **Panel stagger:** panels reveal in sequence (40ms, 80ms, 120ms, 160ms) for perceived progress

**Known latency:** Most of the delay is server-side DB aggregation. Client can't do much except prefetch on route hover (future optimization).

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
- Responsive max-width (e.g., `sm:max-w-2xl max-w-full`)
- No fixed widths that break on phones

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

### ❌ Avoid

- Inline ternary chains like `useDarkMode ? useLiquidGlass ? "..." : "..." : "..."`
- Native HTML `<select>` elements (use `StyledSelect`)
- Hardcoded theme colors (use CSS variables or theme helpers)
- Skipping navbar padding (always add mt-20 or pt-20)
- Mixing camelCase and snake_case in localStorage keys

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
3. **Ask in code comments** — we appreciate clear questions
4. **Update this doc** if you learn something new

---

_Happy coding! This is a living document—update it as you learn more about the codebase._
