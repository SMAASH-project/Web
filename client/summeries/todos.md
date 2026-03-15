# Critical Missing Items

Three things identified as genuinely critical — not polish, actual broken or misleading behaviour.

---

## 1. No 401 / Session Expiry Handling ⚠️ FRONTEND FIX AVAILABLE

**Problem:** When the auth cookie expires mid-session, all API calls silently
fail with 401 responses. The user sees broken UI with no explanation — queries
just stop returning data and mutations fail silently. There is no redirect to
login, no error message, nothing.

**Fix:** A global axios response interceptor in `src/lib/apiClient.ts` that
catches any 401, clears auth state, and redirects to `/app/login`.

```ts
// src/lib/apiClient.ts — add after creating the axios instance
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear persisted auth state and redirect to login
      queryClient.clear();
      window.location.href = "/app/login";
    }
    return Promise.reject(error);
  },
);
```

**Status:** Frontend-only fix, no backend work needed. ~15 lines.

---

## 2. Webstore Shows Fake Data ⚠️ FRONTEND FIX AVAILABLE

**Problem:** `useItems.ts` uses `exampleItems` from `src/types/ExampleItems.ts`.
The real `GET /api/items` endpoint exists, is registered in the router, and
works — it was just never wired up. Every user who visits the webstore sees
placeholder data.

**Fix:** Replace the `useState(exampleItems)` in `useItems.ts` with a React
Query hook that fetches from `/api/items` and maps the response to
`WebstoreItem`. The items controller already returns rarity and category
associations.

**Status:** Frontend work required, no new backend endpoints needed. The
endpoint exists.

**Related TODOs also in `WebstorePage.tsx`:**

- `handleCreateItem` is a `console.log` stub — `POST /api/items` exists
- `handleDeleteItem` is a `console.log` stub — `DELETE /api/items/:id` exists
- `unlockItem` only mutates local state — needs `POST /api/profiles/:id/purchases`
  (backend endpoint does not exist yet)

---

## 3. Password Reset Form Does Nothing ⚠️ BLOCKED ON BACKEND

**Problem:** `PasswordResetForm.tsx` renders and submits but fires no mutation
and calls no API. The form silently does nothing on submit. The user has no way
to know it failed.

**Fix (frontend-only, partial):** At minimum, disable the submit button and
show a clear message explaining that this feature is not yet available, rather
than letting the user submit and get no feedback. The full fix requires a
backend endpoint first.

**Backend needed:** `POST /api/auth/reset-password` (or similar). Once that
exists, add `useResetPasswordMutation` to `useAuthHooks.ts` and wire it to
the form.

**Status:** Blocked on backend. Frontend can add a disabled state + message
immediately without waiting.

---

## Priority Order

| #   | Item                     | Backend needed?      | Effort                         |
| --- | ------------------------ | -------------------- | ------------------------------ |
| 1   | 401 interceptor          | No                   | ~15 lines                      |
| 2   | Wire real webstore items | No (endpoint exists) | Medium                         |
| 3   | Password reset feedback  | Yes (new endpoint)   | Small frontend, medium backend |
