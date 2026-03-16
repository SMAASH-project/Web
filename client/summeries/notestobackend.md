# Role Not Displaying Correctly in Admin Panel

## Problem

The admin panel shows every user's role as blank, causing the frontend to fall back
to displaying "User" for all users — including admins and support accounts.

## Root Cause

In `controllers/users_controller.go`, both `ReadAll` and `ReadByID` call the
repository without passing the `"Role"` preload string. GORM therefore returns
users with an unloaded `Role` association — `user.Role.Name` is `""` — and
`UserToDTO` serialises `role: ""` into every JSON response.

Compare with `WhoAmI` (same file, the caller's own record) which correctly passes
`"Role"` and works. That is why the logged-in user's own role shows correctly
everywhere, but every user listed in the admin panel shows the wrong role.

## Fix — Two one-word changes in `users_controller.go`

### `ReadAll` (line ~37)
```go
// Before
users, err := uc.userRepo.ReadAll(c.Request.Context())

// After
users, err := uc.userRepo.ReadAll(c.Request.Context(), "Role")
```

### `ReadByID` (line ~57)
```go
// Before
user, err := uc.userRepo.ReadByID(c.Request.Context(), id.(uint))

// After
user, err := uc.userRepo.ReadByID(c.Request.Context(), id.(uint), "Role")
```

## Why this works

`BaseRepository.ReadAll` and `BaseRepository.ReadByID` both accept variadic
`...string` preload arguments. The `"Role"` string tells GORM to eager-load the
`Role` association, so `user.Role.Name` is populated before `UserToDTO` maps it
to the `role` JSON field.

## Frontend status

No frontend changes are needed. The `getRoleConfig()` function in `UserDetail.tsx`
already handles all three role names (`"admin"`, `"support"`, `"user"`) with
distinct badges and icons. It is just receiving `""` from the API right now.
