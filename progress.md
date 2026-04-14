# Bug Fix Progress

## Starting Prompt
Starting prompt: {Firstly there are alot of buttons on debug which appear to work but either do not or work incorrectly, examples being in queries the clear and refresh buttons. Second Captcha doesnt seem to always work and sometimes locks you out on mobile. Thirdly as registering sometimes fails. Fourthly the game tab in debug has crashed once and I am unable to reproduce the error. And Finally on Navbar on certain veiwports admin and debug panel buttons can overlay eachother and other nav buttons (mainly debug). You may decide the order in which you wish to do these tasks. After every major completed task (ones i numbered off) do just test-client and just build-client. If build and tests pass make a commit with a commit message and description describing your changes. Since i listed off 5 tasks that should total 5 commits. Work precisly and accurately and every so often write down your progress in progress.md which you should create at the very start in summeries. Make sure to write this prompt in progress.md like so: "Starting prompt: {This Prompt}". Progress.md should be structured in way where if my vscode crashes and you lose your progress and memory, you should be able to continue from roughly where you left off. After all tasks are complete in summeries update en_user and en_dev docs and translate them to hungarian in hu_dev and hu_user respectively. Good work.}

---

## Task Order (chosen)
1. **Task 5 — Navbar overlap** ← starting here
2. **Task 1 — Debug buttons (Cache clear/refresh)**
3. **Task 2 — Captcha (mobile lockout)**
4. **Task 3 — Registration failures**
5. **Task 4 — Game tab crash defense**

---

## Root-Cause Analysis

### Task 5 — Navbar Overlap
- **File:** `client/src/components/nav/Navbar.tsx`
- **Problem:** Desktop nav uses `flex justify-between` with `flex-1 min-w-0` on both the left (admin/debug buttons) and right (username/account) sections. At md–lg viewport widths (~768–900px), the left section can be squeezed so that its buttons overflow their container and visually collide with the center NavMenu or each other.
- **Fix:** Replace the flex justify-between layout with a CSS grid (`grid-cols-[1fr_auto_1fr]`) so the center NavMenu always stays centered and the left section never squeezes.

### Task 1 — Debug Buttons
- **File:** `client/src/pages/debug/tabs/CacheTab.tsx`, `client/src/pages/debug/DebugPageContent.tsx`
- **Problems:**
  - CacheTab "Clear" calls `queryClient.invalidateQueries()` — marks queries stale but does NOT remove them from the cache. Visually nothing changes.
  - CacheTab "Refresh" calls `forceUpdate` — only re-renders the snapshot, does NOT trigger any network re-fetches.
  - Sidebar "Refresh" calls `queryClient.invalidateQueries({ queryKey: ["debug"] })` — only marks debug-prefixed queries stale, doesn't actually refetch them.
- **Fix:**
  - Clear → `queryClient.clear()` then `forceUpdate`
  - CacheTab Refresh → `queryClient.refetchQueries()` + `forceUpdate`
  - Sidebar Refresh → add `queryClient.refetchQueries({ queryKey: ["debug"] })` after invalidateQueries

### Task 2 — Captcha
- **File:** `client/src/pages/auth/SignUpPage.tsx`
- **Problem:** reCAPTCHA v3 token is obtained but NEVER sent to the backend (not in mutation payload). Yet if `executeRecaptcha` is undefined or throws (common on mobile due to network issues, browser restrictions), the signup is hard-blocked. This "locks users out" on mobile.
- **Fix:** Make captcha best-effort. Attempt to obtain token but don't return early on failure — the backend doesn't check it anyway.

### Task 3 — Registration Failures
- **File:** `client/src/pages/auth/SignUpPage.tsx`
- **Problem:** After a failed signup attempt, `signupMutation.isError` remains true. When user retries, old error briefly persists until new attempt settles. Also: if reCAPTCHA provider hasn't loaded yet when user submits, `executeRecaptcha` is undefined → captcha error → blocked (fixed in Task 2). A missing `return` in the backend's `authn_controller.go:48` can cause panics when non-RecordNotFound errors occur in `CreateDTOToUser` — cannot fix backend from client side.
- **Fix:** Call `signupMutation.reset()` at start of `handleSubmit` to clear previous error state before each submission attempt.

### Task 4 — Game Tab Crash
- **File:** `client/src/pages/debug/tabs/GameDataTab.tsx`
- **Problem:** Crash is intermittent and not reproducible. Likely causes:
  1. `filteredUsers` filter calls `u.email.toLowerCase()` and `u.role.toLowerCase()` — if backend returns null for either field, this throws TypeError.
  2. `useDebugItemsQuery` fetches from `/characters` endpoint (wrong!) — items data lacks `rarity`, `description`, `price`, `categories`. When `openEdit("item", id)` is called, missing fields are safely handled via `??` operators but the wrong endpoint means item operations hit characters API.
  3. No error state handling for queries — if a query fails, the tab just shows empty state with no indication of what went wrong.
- **Fix:** Add null guards to the `filteredUsers` filter and other data accesses; add `isError` state handling; document the wrong endpoint bug.

---

## Progress

### [ ] Task 5 — Navbar overlap
- Status: **In progress**

### [ ] Task 1 — Debug buttons
- Status: Pending

### [ ] Task 2 — Captcha
- Status: Pending

### [ ] Task 3 — Registration
- Status: Pending

### [ ] Task 4 — Game tab crash
- Status: Pending

### [ ] Final — Docs
- Status: Pending (en_user.md, en_dev.md, hu_user.md, hu_dev.md)
