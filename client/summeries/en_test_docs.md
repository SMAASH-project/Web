# SMAASH Web Client — Testing Documentation

## Running the Tests

```bash
cd client
npm run test        # run all tests once and exit
npm run test:run    # same, alias
```

The test runner is Vitest, configured in `vite.config.ts` under the `test` key:

```typescript
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test-setup.ts"],
}
```

`globals: true` makes `describe`, `it`, `expect`, and `vi` available in every test file without imports. The `jsdom` environment provides a full DOM implementation so React components can be rendered and queried in the test runner.

Test files are co-located with the code they test. Any file ending in `.test.tsx` or `.test.ts` anywhere under `src/` is automatically picked up.

---

## Existing Automated Tests

### `src/components/ErrorBoundary.test.tsx`

Tests `ErrorBoundary`, the class-based React error boundary in `src/components/ErrorBoundary.tsx`.

The test file defines a `Crash` component that unconditionally throws an `Error("Boom")` during rendering. This is used as the failing child.

#### Test: renders fallback UI when child throws

```typescript
render(
  <ErrorBoundary>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Something went wrong on this page.")).toBeInTheDocument();
expect(screen.getByText("Boom")).toBeInTheDocument();
```

When a child throws, `getDerivedStateFromError` flips `hasError` to true and stores the `Error` object. The boundary renders its default fallback: a centered card with the static message "Something went wrong on this page." and the `error.message` value ("Boom") beneath it. Both must be in the document.

`console.error` is spied on and mocked with `vi.spyOn(console, "error").mockImplementation(() => {})` to suppress the React internal error logging that happens during caught boundary renders. The spy is restored with `mockRestore()` after the assertion to avoid leaking into other tests.

#### Test: renders custom fallback when provided

```typescript
render(
  <ErrorBoundary fallback={<div>Custom Error</div>}>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Custom Error")).toBeInTheDocument();
```

When the `fallback` prop is provided, the boundary renders that element instead of the default message. The test verifies that "Custom Error" appears and not the default text.

The same `console.error` mock pattern is used.

---

### `src/components/RequireAuth.test.tsx`

Tests `RequireAuth`, the route guard component in `src/components/RequireAuth.tsx`.

The test uses a helper `renderProtectedRoute(isLoggedIn, isInitializing?)` that wraps `RequireAuth` in a full routing context using `MemoryRouter`. Two routes are set up: a public login page and the protected releases page. `AuthContext.Provider` is used directly to inject controlled auth state without a real `AuthProvider`:

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

#### Test: renders protected route when authenticated

```typescript
renderProtectedRoute(true);
expect(screen.getByText("Releases Page")).toBeInTheDocument();
```

When `isLoggedIn` is `true`, `RequireAuth` renders the `<Outlet />` and the releases page content becomes visible.

#### Test: redirects to login when unauthenticated

```typescript
renderProtectedRoute(false);
expect(screen.getByText("Login Page")).toBeInTheDocument();
```

When `isLoggedIn` is `false` and `isInitializing` is `false`, `RequireAuth` renders `<Navigate to="/app/login">`. The router follows the redirect and the login page renders.

#### Test: shows loading state during auth initialization

```typescript
renderProtectedRoute(false, true);
expect(document.querySelector(".animate-spin")).toBeInTheDocument();
```

When `isInitializing` is `true`, `RequireAuth` renders a spinner div with the `animate-spin` CSS class instead of either the protected content or the redirect. The test checks for this element directly in the document. This case represents the window between the initial render and the moment `useWhoAmIQuery` resolves — without this guard, the router would redirect every page load to login before the session check completes.

---

### `src/pages/webstore/components/ItemFilters.test.tsx`

Tests `ItemFilters`, the filter chip row component used in the webstore.

The `useSettings` context is mocked at the top of the file because `ItemFilters` reads from it internally for theming. The mock returns a fixed settings object with `useAnimations: true`, `useLiquidGlass: false`, `useDarkMode: false`, `language: "en"`, and `animationOverride: null`:

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

#### Test: calls onSelect with the clicked option

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

Clicking the "Rare" chip fires the `onSelect` callback with the string `"Rare"`. The test verifies the callback receives the correct argument. The test does not care about visual state — it only checks the callback contract.

---

## Testing Patterns in This Codebase

### Injecting Context Without a Real Provider

When a component depends on a React context, inject the context value directly using `<ContextName.Provider value={...}>` in the test tree. This avoids the need for a real provider that might make network requests or load from storage.

Pattern used in: `RequireAuth.test.tsx` (injects `AuthContext`).

### Mocking Module-Level Dependencies

When a component calls a custom hook that interacts with storage or other state, mock the entire module using `vi.mock("path/to/module", factory)`. The factory runs synchronously and must return all exports the component uses.

Pattern used in: `ItemFilters.test.tsx` (mocks `useSettings`).

### Suppressing Expected Console Output

React logs errors caught by error boundaries to the console. This pollutes test output. Spy on `console.error` with `vi.spyOn` and mock the implementation with a no-op. Always call `mockRestore()` in the same test to avoid leaking the mock into other tests.

```typescript
const spy = vi.spyOn(console, "error").mockImplementation(() => {});
// ... render and assert ...
spy.mockRestore();
```

Pattern used in: both tests in `ErrorBoundary.test.tsx`.

### Routing in Tests

Use `MemoryRouter` from `react-router-dom` instead of `BrowserRouter` for tests. Pass `initialEntries` to control the starting URL. Define the routes inside the test with `Routes` and `Route` components. This gives full control over the routing state without relying on `window.location`.

Pattern used in: `RequireAuth.test.tsx`.

### Event Simulation

Use `fireEvent.click(element)` from `@testing-library/react` to simulate user clicks. `screen.getByText("...")` locates elements by their visible text content. Prefer text queries over role queries when testing callback behavior rather than accessibility semantics.

---

## Manual Testing Scenarios

### Login Page

**Wrong credentials**: enter a valid email format with an incorrect password. The form shows "Invalid credentials." After four failures the form disables and the submit button shows a 30-second countdown. After the countdown, the form re-enables.

**Banned account**: log in with credentials for a banned user. The error message indicates whether the ban is temporary (with expiry) or permanent.

**Redirect preservation**: navigate directly to `/app/releases` without a session. The login redirect stores the original path in `location.state.from`. After logging in, the app navigates back to `/app/releases` instead of the default.

### Signup Page

**Security key display**: after a successful signup, the security key is shown exactly once. Navigate away and back — it is gone. There is no way to retrieve it again from the UI.

**Password validation**: the form validates that both password fields match and that the password meets the minimum length requirement before submitting. The server is not called if client-side validation fails.

### Profile Picture Upload

**Over 5 MB file**: upload an image larger than 5 MB. The client rejects it before making any HTTP request and shows an error. The `useProfile.ts` hook enforces `MAX_PFP_SIZE_BYTES = 5 * 1024 * 1024` in the `uploadProfilePicture` function.

**Unsupported format**: upload a `.bmp` or `.tiff` file. The client checks `file.type` against `ALLOWED_IMAGE_TYPES` and rejects it.

**Successful upload**: after a successful upload, the new image appears immediately without a page refresh. The `?v=<timestamp>` cache-busting parameter on the URL is the mechanism — verify it appears in the `src` attribute of the `<img>` tag after the upload.

### Route Protection

**Unauthenticated access**: navigate to `/app/releases` without being logged in. Expect a redirect to `/app/login`. The original URL should be preserved in `location.state.from`.

**Non-admin access to admin page**: log in as a regular user and navigate to `/app/admin`. Expect the page to not render — the `DebugPage` and `AdminPage` components check `isAdmin` from `AuthContext` and return `<NotFoundPage />` if false.

**Session expiry mid-session**: let a session cookie expire while the app is open. Make any navigation that triggers an API request. The 401 interceptor in `apiClient.ts` should redirect to `/app/login` immediately.

### Settings Persistence

Change the language to Hungarian, the dark mode on, and the theme to Midnight, then close and reopen the browser tab. All three settings should persist because `SettingsContext` serializes to `localStorage["settings"]`.

Open the same account in a second browser tab and change a setting there. The first tab does not update in real time — settings are only read from storage on mount.

### React Query Cache

Open the React Query DevTools (bottom-left button in development mode). After loading the profile list, confirm the cache entry `["profiles", "byUserId", <id>]` exists and is not marked stale. Trigger a profile update — the entry should be invalidated and refetched. After logout, confirm the cache is empty (`queryClient.clear()` is called on logout success).

### Toast Notifications

Trigger a successful operation (save profile name, for example) and verify a green "success" toast appears and auto-dismisses after approximately 4 seconds. Trigger an error (submit an invalid form to the server) and verify a red "error" toast appears.

---

## Adding New Tests

1. Create a file ending in `.test.tsx` next to the component you are testing, or in a `__tests__/` directory alongside it.
2. Import from `@testing-library/react` (`render`, `screen`, `fireEvent`) and from your component's module.
3. Mock any module-level dependencies with `vi.mock("path", factory)` at the top of the file.
4. Inject context providers around the rendered component when the component depends on them.
5. Assert with `expect(...).toBeInTheDocument()` and other `@testing-library/jest-dom` matchers. These are set up globally via the setup file.
