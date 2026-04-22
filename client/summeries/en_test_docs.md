# SMAASH Web Client — Testing Documentation

## Running the Tests

```bash
cd client
npm run test        # run all tests once and exit
npm run test:run    # alias for the above
```

The test runner is Vitest, configured in `vite.config.ts` under the `test` key:

```typescript
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test-setup.ts"],
}
```

`globals: true` makes `describe`, `it`, `expect`, and `vi` available in every test file without imports. The `jsdom` environment provides a full DOM implementation so React components can be rendered and queried.

`src/test-setup.ts` extends Vitest's `expect` with `@testing-library/jest-dom` matchers, making assertions like `toBeInTheDocument()`, `toBeDisabled()`, and `toHaveTextContent()` available globally.

Test files are co-located with the code they test. Any file ending in `.test.tsx` or `.test.ts` anywhere under `src/` is automatically picked up by Vitest.

---

## Existing Automated Tests

### `src/components/ErrorBoundary.test.tsx`

Tests `ErrorBoundary` in `src/components/ErrorBoundary.tsx`.

A helper `Crash` component is defined at the top of the test file. It unconditionally throws `new Error("Boom")` during rendering. This gives the tests a reliably failing child without coupling the test to any real page logic.

#### Test: renders default fallback UI when a child throws

```typescript
render(
  <ErrorBoundary>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Something went wrong on this page.")).toBeInTheDocument();
expect(screen.getByText("Boom")).toBeInTheDocument();
```

When `Crash` throws, `getDerivedStateFromError` flips `hasError` to `true` and stores the `Error` object. The boundary renders its default fallback: a centered card containing the static string "Something went wrong on this page." and the `error.message` value. The test asserts both strings are in the document.

`console.error` is spied on and replaced with a no-op using `vi.spyOn(console, "error").mockImplementation(() => {})` to suppress React's internal error logging during caught boundary renders. The spy is restored with `spy.mockRestore()` after the assertion so it does not leak into other tests.

#### Test: renders a custom fallback when the `fallback` prop is provided

```typescript
render(
  <ErrorBoundary fallback={<div>Custom Error</div>}>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Custom Error")).toBeInTheDocument();
```

When a `fallback` prop is supplied, the boundary renders that element instead of the default message. The test asserts the custom text is present. The same `console.error` spy pattern is applied.

---

### `src/components/RequireAuth.test.tsx`

Tests `RequireAuth` in `src/components/RequireAuth.tsx`.

A helper `renderProtectedRoute(isLoggedIn, isInitializing?)` sets up a complete routing context using `MemoryRouter`. Two routes are configured: a public login page and the protected releases page. `AuthContext.Provider` is used directly to inject controlled auth state, bypassing the real `AuthProvider` (which would fire network requests):

```typescript
function renderProtectedRoute(isLoggedIn: boolean, isInitializing = false) {
  return render(
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing,
        userId: null,
        setUserId: () => {},
        setIsLoggedIn: () => {},
        isAdmin: false,
        setIsAdmin: () => {},
        isSupport: false,
        setIsSupport: () => {},
      }}
    >
      <MemoryRouter initialEntries={["/app/releases"]}>
        <Routes>
          <Route path="/app/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/app/releases" element={<div>Releases Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
```

#### Test: renders the protected route when authenticated

```typescript
renderProtectedRoute(true);
expect(screen.getByText("Releases Page")).toBeInTheDocument();
```

When `isLoggedIn` is `true`, `RequireAuth` renders `<Outlet />` and the releases page content is visible.

#### Test: redirects to login when unauthenticated

```typescript
renderProtectedRoute(false);
expect(screen.getByText("Login Page")).toBeInTheDocument();
```

When `isLoggedIn` is `false` and `isInitializing` is `false`, `RequireAuth` renders `<Navigate to="/app/login">`. The router follows the redirect and the login page stub renders.

#### Test: renders a spinner during auth initialization

```typescript
renderProtectedRoute(false, true);
expect(document.querySelector(".animate-spin")).toBeInTheDocument();
```

When `isInitializing` is `true`, `RequireAuth` renders a spinner with the `animate-spin` CSS class instead of either the protected content or the redirect. This covers the window between the initial render and the resolution of `useWhoAmIQuery`. Without this guard, the router would redirect every page load to login before the session check completes.

---

### `src/pages/webstore/components/ItemFilters.test.tsx`

Tests `ItemFilters`, the filter chip row component in the webstore.

`useSettings` is mocked at the module level because `ItemFilters` reads from `SettingsContext` for theming. The factory returns a fixed settings object:

```typescript
vi.mock("@/pages/settings/SettingsContext", () => ({
  useSettings: () => ({
    settings: {
      useAnimations: true,
      useLiquidGlass: false,
      useDarkMode: false,
      language: "en",
      animationOverride: null,
    },
    updateSetting: vi.fn(),
  }),
}));
```

#### Test: calls `onSelect` with the clicked option

```typescript
const onSelect = vi.fn();

render(
  <ItemFilters
    label="Rarity"
    options={["All", "Rare", "Epic"]}
    selected="All"
    onSelect={onSelect}
  />
);

fireEvent.click(screen.getByText("Rare"));
expect(onSelect).toHaveBeenCalledWith("Rare");
```

Clicking a chip calls `onSelect` with the chip's string value. The test verifies the callback receives the correct argument. It does not assert on visual state — it tests the callback contract only.

---

## Testing Patterns in This Codebase

### Injecting Context Without a Real Provider

When a component depends on a React context, inject a controlled value directly using `<ContextName.Provider value={...}>` in the test tree. This avoids real providers that make network requests, read from `localStorage`, or carry side effects.

```typescript
<AuthContext.Provider value={{ isLoggedIn: true, isInitializing: false, ... }}>
  <ComponentUnderTest />
</AuthContext.Provider>
```

The injected value must satisfy the full context type. Provide no-op functions for setters the component does not exercise in the test.

Pattern used in: `RequireAuth.test.tsx`.

### Mocking Module-Level Dependencies

When a component calls a custom hook that reads from storage, fires network requests, or otherwise has side effects, mock the entire module using `vi.mock("path/to/module", factory)`. The factory function must be synchronous and must return all named exports the component imports:

```typescript
vi.mock("@/pages/settings/SettingsContext", () => ({
  useSettings: () => ({
    settings: { useLiquidGlass: false, useDarkMode: false, ... },
    updateSetting: vi.fn(),
  }),
}));
```

`vi.mock` is hoisted to the top of the module by Vitest, so declaration order relative to imports does not matter.

Pattern used in: `ItemFilters.test.tsx`.

### Suppressing Expected Console Output

React logs errors caught by error boundaries to the console. This pollutes the test output. Spy on `console.error` and replace it with a no-op, then restore it after the assertion:

```typescript
const spy = vi.spyOn(console, "error").mockImplementation(() => {});
render(<ErrorBoundary><Crash /></ErrorBoundary>);
expect(screen.getByText("Something went wrong on this page.")).toBeInTheDocument();
spy.mockRestore();
```

Always call `mockRestore()` — not `mockReset()` — in the same test. `mockRestore()` removes the spy entirely; `mockReset()` only clears call history but keeps the mock in place, which can leak the suppression into other tests.

Pattern used in: both tests in `ErrorBoundary.test.tsx`.

### Routing in Tests

Use `MemoryRouter` from `react-router-dom` instead of `BrowserRouter`. Pass `initialEntries` to control the starting URL. Define the route tree inside the test with `Routes` and `Route` to have full control over what renders at each path:

```typescript
<MemoryRouter initialEntries={["/app/releases"]}>
  <Routes>
    <Route path="/app/login" element={<div>Login Page</div>} />
    <Route element={<RequireAuth />}>
      <Route path="/app/releases" element={<div>Releases Page</div>} />
    </Route>
  </Routes>
</MemoryRouter>
```

`BrowserRouter` uses `window.location` and is sensitive to the browser environment. `MemoryRouter` maintains routing state in memory and is fully deterministic.

Pattern used in: `RequireAuth.test.tsx`.

### Event Simulation

Use `fireEvent.click(element)` from `@testing-library/react` to simulate user clicks. Use `screen.getByText("...")` to locate elements by their visible text. Prefer text queries over role queries when the test goal is verifying a callback contract rather than accessibility semantics.

For interactions that trigger state transitions visible in the DOM, assert on the resulting DOM state (`screen.getByText(...)`, `expect(element).toBeInTheDocument()`) rather than on component state directly.

Pattern used in: `ItemFilters.test.tsx`.

### Asserting CSS Class Presence

When a component communicates state through a CSS class (such as a loading spinner), query for the class with `document.querySelector`:

```typescript
expect(document.querySelector(".animate-spin")).toBeInTheDocument();
```

Use this approach only when no accessible role or visible text is available. If a text or role query is possible, prefer it.

Pattern used in: `RequireAuth.test.tsx` (spinner during initialization).

---

## Manual Testing Scenarios

### Login Page

**Wrong credentials:** enter a valid email format with an incorrect password. The form shows a generic "Invalid credentials." error. After four failures, the form disables and the submit button shows a 30-second countdown. After the countdown expires, the form re-enables and accepts new input.

**Banned account:** log in with credentials for a banned user. The error message indicates whether the ban is temporary (with the expiry datetime) or permanent.

**Redirect preservation:** navigate directly to `/app/releases` without a session. The login redirect stores the original path in `location.state.from`. After logging in, the application navigates back to `/app/releases` rather than to the default post-login destination.

### Signup Page

**Security key display:** complete a signup. The security key is shown once immediately after registration. Navigate away and back — it is gone. There is no way to retrieve it again from the UI. Verify this matches the expected one-time display behavior.

**reCAPTCHA loading scope:** open browser network tools and navigate between pages. The reCAPTCHA script and badge should appear only on `/app/signup` and not on any other page (including `/app/login` and `/app/reset-password`).

**Password validation:** verify the form validates that both password fields match and that the password meets the minimum length requirement before submitting. The network tab should show no request to `/auth/signup` when client-side validation fails.

### Profile Picture Upload

**Over 5 MB file:** attempt to upload an image larger than 5 MB. The client should reject it before making any HTTP request and show an error toast. Verify in the network tab that no request was sent to `/api/profiles/:id/pfp`.

**Unsupported format:** upload a `.bmp` or `.tiff` file. The client checks `file.type` against `ACCEPTED_IMAGE_TYPES` and rejects it before sending a request.

**Successful upload:** after a successful upload, the new image should appear immediately without a page refresh. Inspect the `src` attribute of the profile picture `<img>` element — it should contain a `?v=<timestamp>` query parameter. Reloading the profile selector in the same tab should show the updated picture with the same version parameter.

### Route Protection

**Unauthenticated access:** navigate to `/app/releases` without being logged in. A redirect to `/app/login` should occur. The original URL should be preserved in `location.state.from` so the post-login redirect returns to `/app/releases`.

**Non-admin access to admin page:** log in as a regular user and navigate to `/app/admin`. The admin page component checks `isAdmin` from `AuthContext` and returns `<NotFoundPage />` if `false`. The 404 page should render rather than the admin panel content.

**Non-admin access to debug page:** the same check applies to `/app/debug`. Log in as a regular user — the 404 page should render.

**Session expiry mid-session:** allow a session cookie to expire while the app is open. Trigger any action that calls a non-auth API endpoint. The 401 response interceptor in `apiClient.ts` should redirect to `/app/login` immediately. Verify in the network tab that the redirect happens and that no further API requests fire after the 401.

### Settings Persistence

Change the language to Hungarian, enable dark mode, and select the Midnight theme. Close the browser tab and reopen it at the same URL. All three settings should persist because `SettingsContext` serializes to `localStorage["settings"]`.

Open the same account in a second browser tab. Change a setting in the second tab. The first tab should not reflect the change in real time — settings are read from storage only on mount. Refreshing the first tab should show the updated setting.

### Profile Selection Persistence

Select a profile, navigate away, log out, and log back in. The same profile should be pre-selected on the profile selector screen. This is because the selected profile ID is persisted in `localStorage` keyed by `userId`.

### React Query Cache

Open React Query DevTools (the floating button in the bottom-left corner, visible only in development builds). After loading the profile list, confirm the cache entry `["profiles", "byUserId", <id>]` exists and is not marked stale. Trigger a profile update — the entry should be invalidated and re-fetched. After logging out, confirm the cache is completely empty (`queryClient.clear()` is called on logout success).

### Toast Notifications

Trigger a successful operation (save a profile name, for example) and verify a green "success" toast appears and auto-dismisses after approximately 4 seconds. Trigger a server-side error (submit an invalid request) and verify a red "error" toast appears and also auto-dismisses. Verify that toast notifications do not stack permanently — each one clears after 4 seconds regardless of subsequent actions.

### Animation and Motion

**Animation toggle:** disable the animations toggle in Settings. Navigate between pages — transitions should be instant. Background animation should freeze in place. Re-enable the toggle — transitions should resume.

**Debug speed slider:** in the debug dashboard (admin accounts only), use the animation speed slider. Adjust to the slowest setting (0.25×) and navigate between pages — all `motion/react` transitions should be visibly slower. Adjust to the fastest setting (4×) — transitions should be nearly instantaneous.

**Composite background:** in Settings, set the animation override to "Custom" and open the Effect Mix dialog. Enable two or more animations simultaneously. Both backgrounds should render layered on top of each other. Disable individual sub-effects and verify they disappear without affecting the other animation.

### Admin Panel

**User search:** enter a partial email in the search field. The user list should filter client-side to show only matching users.

**Ban flow:** select a user, choose a preset ban duration (e.g. 1 week), and confirm. The user's status in the list should immediately update to show "Banned" with the expiry. Verify by selecting the user again — the ban details should be visible.

**Unban flow:** select a banned user and unban them. The status should return to active and the ban expiry should clear.

**Role promotion:** promote a user to support. The role column in the list should update. Log in as that user in a separate session — the user should see the admin-reserved navigation links if promoted to admin.
