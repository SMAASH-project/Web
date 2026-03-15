# Backend Requirements for Admin Page

## Overview

The admin page frontend is fully wired up. The following backend endpoints need to be created or extended to support it.

---

## 1. List All Users (with search/pagination)

**Current state:** `GET /api/users` exists and returns all users (array of `UserReadDTO`).

**Needed changes:**

- Add query parameter support: `?search=<string>` to filter by username/email
- Add pagination: `?page=<int>&limit=<int>`
- Return **username** (display name / first profile name) in the DTO — right now `UserReadDTO` only has `email`, `role`, `is_banned`, `last_login`. We need a `username` field so the search-by-name feature works.
- Return `ban_until` (nullable datetime string) so the frontend can show current ban status.

**Suggested extended DTO:**

```go
type UserReadDTO struct {
  ID        uint    `json:"id"`
  Email     string  `json:"email"`
  Username  string  `json:"username"`   // NEW: pulled from first profile display_name or signup username
  Role      string  `json:"role"`
  IsBanned  bool    `json:"is_banned"`
  BanUntil  *string `json:"ban_until"`  // NEW: ISO datetime string, null if not banned
  LastLogin string  `json:"last_login"`
}
```

---

## 2. Ban a User

**Current state:** No ban endpoint exists. `IsBanned` is a field on the User model but there is no mechanism to set it with an expiry.

**Needed:**

### 2a. Add `BanUntil` to the User model

```go
// In models/User.go (or wherever User struct is)
BanUntil *time.Time `gorm:"column:ban_until"`
```

### 2b. Add a ban endpoint

```
POST /api/admin/users/:id/ban
```

**Request body:**

```json
{
  "ban_type": "permanent" | "temporary",
  "ban_until": "2025-12-31T23:59:59Z"  // only required when ban_type is "temporary"
}
```

**Response:** `204 No Content` on success.

**Logic:**

- If `ban_type == "permanent"`: set `is_banned = true`, `ban_until = null`
- If `ban_type == "temporary"`: set `is_banned = true`, `ban_until = <provided datetime>`
- This route must be protected by an **admin-only** middleware

### 2c. Add an unban endpoint

```
POST /api/admin/users/:id/unban
```

**Response:** `204 No Content`. Sets `is_banned = false`, `ban_until = null`.

### 2d. Add a background job / middleware check for expired bans

- On user login (or `whoami`), check if `ban_until` is in the past — if so, automatically lift the ban.

---

## 3. Get User Profiles (already exists, minor addition)

**Current:** `GET /api/users/:id/profiles` returns `[]PlayerProfileReadDTO`.

**Needed:** Ensure avatar URLs are returned (they seem to already be handled via `/api/profiles/:id/pfp`). No changes required if the existing implementation covers this.

---

## 4. Admin-Only Middleware

Create a middleware that checks `caller_id`'s role equals `"admin"` (similar to `Authorize` but also checks role).

```go
func AdminOnly(c *gin.Context) {
    callerID, _ := c.Get("caller_id")
    user, err := userRepo.ReadByID(ctx, callerID.(uint), "Role")
    if err != nil || user.Role.Name != "admin" {
        c.AbortWithStatusJSON(http.StatusForbidden, dtos.NewErrResp("forbidden", c.Request.URL.Path))
        return
    }
    c.Next()
}
```

Apply this to all `/api/admin/...` routes.

---

## 5. Route Group Summary

```
GET    /api/users                    (extend with ?search=&page=&limit=)
GET    /api/users/:id                (extend DTO with username + ban_until)
POST   /api/admin/users/:id/ban      (NEW — admin only)
POST   /api/admin/users/:id/unban    (NEW — admin only)
```

---

## Frontend Hook Locations

All frontend hooks that need backend implementation are in:
`src/hooks/useAdminHooks.ts`

Look for comments marked `// TODO: BACKEND` in that file.
