# Client-Side Bug & Glitch Report

> Scope: `client/src/` only — server code is excluded.
> All issues below are fixable by modifying client code alone.
> Files are linked as relative paths from the repo root.

---

## Bug #1 — App-breaking crash if `localStorage` settings are corrupted

**File:** [client/src/pages/settings/SettingsContext.tsx](client/src/pages/settings/SettingsContext.tsx#L40)
**Severity:** HIGH

### What it is
`SettingsContext` reads the saved settings on startup like this:

```ts
const parsed = saved ? JSON.parse(saved) : null;
```

There is no `try/catch` around `JSON.parse`. If the value stored under the `"settings"` key in `localStorage` is invalid JSON — corrupted storage, a browser extension writing to it, or someone manually editing it in DevTools — this line throws a `SyntaxError`. Because `SettingsProvider` is at the very root of the component tree (inside `RootLayout`), the entire app fails to mount and the user sees a blank crash screen.

Compare this to `useDebugSettings.ts`, which *does* have the protection:
```ts
try {
  return { ...DEFAULTS, ...JSON.parse(...) };
} catch {
  return { ...DEFAULTS };
}
```
`SettingsContext` is missing that same safety net.

### When it could happen
- Rarely, but once it does the user is completely stuck with no way to recover without opening DevTools and clearing storage.
- A browser extension that writes to `localStorage`, a corrupted browser profile, or power-loss during a write could all trigger it.

### Fix prompt
```
In client/src/pages/settings/SettingsContext.tsx, the useState initializer at line ~38
calls JSON.parse without a try/catch. If localStorage contains invalid JSON the entire
app crashes. Wrap the JSON.parse in a try/catch so that on failure it falls back to the
default values. Model the fix after the already-correct pattern in
client/src/hooks/useDebugSettings.ts (its getDebugSettings function).
Do not change any other logic.
```

---

## Bug #2 — GitHub API rate-limit risk on the Releases page

**File:** [client/src/pages/releases/useReleases.ts](client/src/pages/releases/useReleases.ts#L14-L19)
**Severity:** MEDIUM

### What it is
There is a contradictory comment and constant at the top of the file:

```ts
/**
 * staleTime of 10 minutes means React Query only refetches when data is older
 * than 10 minutes, keeping well within the rate limit in normal usage.
 */
const GITHUB_STALE_TIME = 0; // always treat as stale so refetches go through
```

The comment says "10 minutes of staleTime." The actual value is `0`. Because `staleTime: 0` means the cache is always considered stale, React Query will fire a new GitHub API request every single time the user navigates to the Releases page (even from the cache, it re-fetches in the background). There is also a `refetchInterval: 5 * 60 * 1000` (every 5 minutes) and `refetchOnMount: true`.

The unauthenticated GitHub API allows only 60 requests per hour per IP. If multiple users share a NAT IP (an office, school, shared hosting), or if one user navigates back and forth several times, the limit gets burned quickly. Once it hits, GitHub returns a 403/429 and the Releases page shows an error banner.

### When it could happen
- Every time the Releases page mounts, one request fires immediately (mount + stale cache).
- Every 5 minutes while the page stays open, another fires.
- More than one user behind the same IP compounds this.

### Fix prompt
```
In client/src/pages/releases/useReleases.ts, the constant GITHUB_STALE_TIME is set to 0
but the comment above it says "10 minutes." This causes React Query to refetch GitHub
releases on every single page mount, which burns through the 60-requests/hour
unauthenticated GitHub API rate limit quickly.

Change the constant to: const GITHUB_STALE_TIME = 10 * 60 * 1000;

Also update the comment to accurately reflect the value. Do not change anything else.
```

---

## Bug #3 — `AdminUserDTO.username` is typed as a required `string` but the backend never sends it

**File:** [client/src/hooks/useAdmin.ts](client/src/hooks/useAdmin.ts#L20-L30)
**Severity:** LOW-MEDIUM (type safety / future crash risk)

### What it is
The type definition says:

```ts
export interface AdminUserDTO {
  username: string; // ← typed as always present
  ...
}
```

But the comment directly above it reads:
> "NOTE: `username` is not returned by the backend yet — components fall back to `email` when it is absent."

At runtime `username` is `undefined`. Every component that renders it already has a `|| fallback` guard (`user.username || user.email`), and the search filter uses optional chaining (`u.username?.toLowerCase()`), so nothing crashes today. But the TypeScript type says it is a non-optional `string`, so TypeScript will never warn if someone adds new code that accesses `.username` directly without a fallback — and that code would silently receive `undefined` at runtime.

### When it could happen
- A developer adds a new feature in the admin panel that reads `user.username` directly, trusting the type. TypeScript will not flag it. The feature ships and crashes at runtime in production.

### Fix prompt
```
In client/src/hooks/useAdmin.ts, the AdminUserDTO interface declares `username: string`
as a required field, but the backend does not return it (acknowledged in the comment on
line ~23). This is a type lie — at runtime the field is always undefined.

Change the declaration to: `username?: string;`

This makes the type honest and ensures TypeScript will warn whenever username is
accessed without a fallback. Do not change any other code.
```

---

## Bug #4 — News page goes silently blank when all category filters are deselected

**File:** [client/src/pages/news/NewsPage.tsx](client/src/pages/news/NewsPage.tsx) + [client/src/pages/news/useNewsPosts.ts](client/src/pages/news/useNewsPosts.ts#L158-L160)
**Severity:** LOW (UX glitch)

### What it is
In `useNewsPosts.ts`, when the list of selected categories is empty the hook immediately returns an empty array:

```ts
const filteredPosts = useMemo(() => {
  if (selectedCategories.length === 0) return [];
  ...
```

This is technically correct — showing no posts when no categories are selected makes sense. However `NewsPage.tsx` has no empty-state UI for this scenario. When a user clicks through and deselects all four category filters:

- The skeleton loader is hidden (it only shows when `postsLoading` is true, which is false once the initial fetch finishes).
- The virtualised list renders nothing.
- The post count badge reads "0 posts."
- The content area is just blank.

There is no message like "Select at least one category" or "No posts to show." The user sees an unexplained empty void and may think something broke.

### Fix prompt
```
In client/src/pages/news/NewsPage.tsx, when all category filters are deselected the
post list is empty but there is no empty-state message shown — just a blank area.

After the virtualised <ul> element (around line 117), add a conditional block that
renders when `!postsLoading && visiblePosts.length === 0`. It should show a small, 
centered explanatory message (e.g. "No posts match your current filters.").
Style it consistently with the rest of the page using `subtextColor`.
Do not change any other logic or layout.
```

---

## Bug #5 — `BigInt` user IDs silently lose precision when converted to `Number`

**Files (all affected):**
- [client/src/components/nav/Navbar.tsx](client/src/components/nav/Navbar.tsx#L49)
- [client/src/components/nav/AccountMenu.tsx](client/src/components/nav/AccountMenu.tsx#L40)
- [client/src/pages/profile-selector/ProfileSelectorPage.tsx](client/src/pages/profile-selector/ProfileSelectorPage.tsx#L100)
- [client/src/pages/profile-selector/ProfilesContext.tsx](client/src/pages/profile-selector/ProfilesContext.tsx#L31)
- [client/src/pages/webstore/useItems.ts](client/src/pages/webstore/useItems.ts#L134)

**Severity:** LOW (latent / future-proof risk)

### What it is
`userId` in `AuthContext` is stored as `bigint`. In several places it is converted to `Number` before being used as a `localStorage` key or a query parameter:

```ts
localStorage.removeItem(`selected_profile_${Number(userId)}`);
```

JavaScript's `Number` type can only represent integers up to `2^53 - 1` (about 9 quadrillion) without losing precision. If a user ID ever exceeds that — unlikely with sequential database IDs today, but possible if the ID strategy changes — the conversion silently produces the wrong number. This means:

- `selected_profile_${Number(userId)}` could produce the same key for two different users.
- On logout, the wrong localStorage entry is cleared.
- The webstore query key `queryKeys.profiles.byUserId(Number(userId))` could return a cached result from a different user.

All five occurrences share the same pattern, so fixing one requires fixing all.

### Fix prompt
```
In the client, `userId` from AuthContext is typed as `bigint` but is cast to Number
in five places before being used as a localStorage key or query key. Number(bigint)
silently loses precision for values above 2^53-1.

For the localStorage key uses:
  - client/src/components/nav/Navbar.tsx:49
  - client/src/components/nav/AccountMenu.tsx:40
  - client/src/pages/profile-selector/ProfileSelectorPage.tsx:100 and 106
  - client/src/pages/profile-selector/ProfilesContext.tsx:31

Replace Number(userId) with String(userId) everywhere it's used as a localStorage key.

For the query key use in client/src/pages/webstore/useItems.ts:134, check how
queryKeys.profiles.byUserId is typed and whether it can accept number | string;
if it already accepts a number, converting via Number is fine to keep for now but
add a comment explaining the precision risk.

Do not change anything else.
```

---

## Summary Table

| # | File | Issue | Severity | Fixable? |
|---|------|-------|----------|---------|
| 1 | `SettingsContext.tsx:40` | Unguarded `JSON.parse` crashes entire app | **HIGH** | Yes |
| 2 | `useReleases.ts:19` | `staleTime: 0` burns GitHub rate limit; comment says 10 min | **MEDIUM** | Yes |
| 3 | `useAdmin.ts:24` | `username` typed as `string`, backend sends `undefined` | **LOW-MED** | Yes |
| 4 | `NewsPage.tsx` | No empty-state UI when all category filters deselected | **LOW** | Yes |
| 5 | Multiple files | `Number(bigint userId)` precision loss for large IDs | **LOW** | Yes |
