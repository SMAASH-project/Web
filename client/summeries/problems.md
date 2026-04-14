# Known Problems

---

## [OPEN] DELETE /posts/{id} route not mounted — News post delete always fails

**Severity:** Medium — admins cannot delete news posts from the UI.

### Summary

The `Delete` controller function exists in `posts_controller.go` and has full Swagger
documentation (via `@router /posts/{id} [delete]`), but the route is **never registered**
in `MountRoutes`. Every `DELETE /api/posts/{id}` request returns 404.

### Technical details

**Missing route registration** — `internal/controllers/posts_controller.go`, `MountRoutes`:

```go
func (pc PostsController) MountRoutes(apiGroup *gin.RouterGroup) {
    posts := apiGroup.Group("/posts")
    posts.POST("",      middlewares.Authorize(middlewares.ADMIN), pc.Create)
    posts.GET("",       middlewares.Authorize(middlewares.ANY), pagination.New(), pc.ReadAll)
    posts.GET("/:id",   middlewares.Authorize(middlewares.ANY), middlewares.ValidateUrl, pc.ReadByID)
    posts.PUT("/:id",   middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, pc.Update)
    // DELETE is never registered
}
```

**Why Swagger shows it anyway:** Swagger generates documentation from the `@router` annotation
comment on the `Delete` function, not from actually registered Gin routes. The endpoint
appears functional in Swagger UI but returns 404 in the real server.

**Client-side effect** — `client/src/pages/news/useNewsPosts.ts`:
The optimistic update removes the post from the UI immediately. The 404 response triggers
`onError`, which rolls back the cache and restores the post. Net visible result: post
disappears briefly then reappears, with a "delete failed" toast.

### Suggested fix (backend)

Add the missing `DELETE` registration to `MountRoutes`:

```go
posts.DELETE("/:id", middlewares.Authorize(middlewares.ADMIN), middlewares.ValidateUrl, pc.Delete)
```

No client-side change is needed — the mutation in `useNewsPosts.ts` is correctly implemented
and will work immediately once the route is mounted.

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

| User type    | Result                                             |
| ------------ | -------------------------------------------------- |
| Admin        | Webstore loads normally                            |
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
