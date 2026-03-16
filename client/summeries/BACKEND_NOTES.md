# Backend Requirements for Admin Panel

All frontend hooks are wired and waiting. Every item below is marked with a
`// TODO: BACKEND` comment in `src/hooks/useAdminHooks.ts`. Once implemented
the frontend will work without any further client changes.

---

## 1. Fix Role Not Loading (CRITICAL — breaks role display right now)

**File:** `controllers/users_controller.go`

Both `ReadAll` and `ReadByID` call the repository without passing `"Role"` as a
preload, so `user.Role.Name` is always `""` and the frontend receives `role: ""`
for every user. See `notestobackend.md` for full details.

```go
// ReadAll — add "Role" preload
users, err := uc.userRepo.ReadAll(c.Request.Context(), "Role")

// ReadByID — add "Role" preload
user, err := uc.userRepo.ReadByID(c.Request.Context(), id.(uint), "Role")
```

---

## 2. Extend `UserReadDTO`

The frontend `AdminUserDTO` expects two fields that the current DTO does not
return. Until these are added, username shows as `"—"` and ban expiry cannot
be displayed.

```go
type UserReadDTO struct {
    ID        uint    `json:"id"`
    Email     string  `json:"email"`
    Username  string  `json:"username"`   // NEW: first profile display_name, or signup username
    Role      string  `json:"role"`
    IsBanned  bool    `json:"is_banned"`
    BanUntil  *string `json:"ban_until"`  // NEW: ISO 8601 datetime or null
    LastLogin string  `json:"last_login"`
}
```

`Username` should be populated from the user's first `PlayerProfile.DisplayName`,
or fall back to the username supplied at signup if no profiles exist.

---

## 3. Add `BanUntil` to the User Model

```go
// models/User.go
BanUntil *time.Time `gorm:"column:ban_until"`
```

Run a migration after adding this field.

---

## 4. Ban Endpoint

```
POST /api/admin/users/:id/ban
```

**Auth:** Admin-only middleware (see §6).

**Request body:**
```json
{
  "ban_type": "permanent",
  "ban_until": null,
  "reason": "Cheating / Hacking"
}
```
```json
{
  "ban_type": "temporary",
  "ban_until": "2026-06-15T14:00:00Z",
  "reason": "Toxic Behaviour"
}
```

**Logic:**
- `permanent` → `is_banned = true`, `ban_until = NULL`
- `temporary` → `is_banned = true`, `ban_until = <provided datetime>`
- `reason` is optional — store it if you want an audit log, ignore if not.

**Response:** `204 No Content`

---

## 5. Unban Endpoint

```
POST /api/admin/users/:id/unban
```

**Auth:** Admin-only middleware (see §6).

**Logic:** `is_banned = false`, `ban_until = NULL`

**Response:** `204 No Content`

---

## 6. Admin-Only Middleware

Create a middleware that sits between `Authorize` and the handler, verifying the
caller is an admin. Apply it to all `/api/admin/...` routes.

```go
func AdminOnly(c *gin.Context) {
    callerID, _ := c.Get("caller_id")
    user, err := userRepo.ReadByID(c.Request.Context(), callerID.(uint), "Role")
    if err != nil || user.Role.Name != "admin" {
        c.AbortWithStatusJSON(
            http.StatusForbidden,
            dtos.NewErrResp("forbidden", c.Request.URL.Path),
        )
        return
    }
    c.Next()
}
```

---

## 7. Auto-Lift Expired Bans

On `WhoAmI` (and optionally on login), check whether `ban_until` is in the past.
If so, automatically set `is_banned = false` and `ban_until = NULL`.

```go
if user.BanUntil != nil && user.BanUntil.Before(time.Now()) {
    uc.userRepo.UpdateOne(ctx, user.ID, "is_banned", false)
    uc.userRepo.UpdateOne(ctx, user.ID, "ban_until", nil)
}
```

---

## 8. Search & Pagination on `GET /api/users`

The frontend currently does client-side filtering because the endpoint returns
all users with no filter support. Add these query parameters:

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by username or email (case-insensitive LIKE) |
| `page` | int | 1-based page number (default 1) |
| `limit` | int | Results per page (default 50, max 200) |

Once added, update `useAdminHooks.ts` `useAdminUsersQuery` — the `// TODO: BACKEND`
comment there shows exactly where to pass the `search` param.

---

## 9. Route Group Summary

```
GET    /api/users                       — add "Role" preload, ?search=, pagination
GET    /api/users/:id                   — add "Role" preload, return extended DTO
POST   /api/admin/users/:id/ban         — NEW, admin only
POST   /api/admin/users/:id/unban       — NEW, admin only
```

---

## Frontend Hook Reference

`src/hooks/useAdminHooks.ts` — all hooks, every unimplemented endpoint has a
`// TODO: BACKEND` comment with the expected route and body shape.
