# Known Problems

---

## [OPEN] GET /characters requires ADMIN — Webstore invisible to regular users

**Severity:** High — the entire webstore item list is broken for non-admin users.

### Summary

The `GET /characters` endpoint (list all characters) is protected by the `ADMIN` middleware.
The webstore fetches this endpoint for every authenticated user, so anyone without the admin role
receives a `401 Unauthorized` response and sees an empty store.

### Technical details

**Backend route definition** — `internal/controllers/characters_controller.go`, line 269:
```go
characters.GET("", middlewares.Authorize(middlewares.ADMIN), cc.ReadAll)
```

Compare with the single-item GET, which correctly allows any authenticated user:
```go
characters.GET("/:id", middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, cc.ReadByID)
```

**Frontend call that fails** — `client/src/pages/webstore/useItems.ts`:
```ts
const { data } = await apiClient.get<ItemReadDTO[]>("/characters");
```

This query runs for every user who loads the webstore page. When the backend returns `401`,
the `apiClient` response interceptor redirects the user to `/app/login` (see
`client/src/lib/apiClient.ts`, line 79), making the failure silent and disorienting.

**Why it was likely overlooked:** the endpoint previously lived at `/items` with different
authorization rules. The migration to `/characters` preserved the admin guard that was
only meant for write operations, accidentally applying it to the read-all route.

### Impact

| User type   | Result                                              |
|-------------|-----------------------------------------------------|
| Admin       | Webstore loads normally                             |
| Regular user | Redirect to `/app/login` when the store page loads |

### Suggested fix (backend)

Change the `GET ""` route to `middlewares.ANY` so any authenticated user can list characters:

```go
// Before
characters.GET("", middlewares.Authorize(middlewares.ADMIN), cc.ReadAll)

// After
characters.GET("", middlewares.Authorize(middlewares.ANY), cc.ReadAll)
```

No client-side change is needed once the backend auth is corrected.

### Notes

- All write operations (`POST`, `PUT`, `DELETE`) correctly keep `ADMIN` guard — only the
  list `GET` needs to be relaxed.
- The `ReadImg` and `UploadImg` routes for individual characters already use `middlewares.ANY`,
  confirming the intent was always to allow regular users to interact with character data.
