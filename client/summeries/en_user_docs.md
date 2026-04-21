# SMAASH Web Client — User Guide

## What This Application Is

SMAASH is a web companion platform for a game. It gives you access to game downloads, a gallery of playable characters, a global leaderboard, a news feed, and an in-game item store. All of this lives under the `/app/` path in your browser. The application supports both English and Hungarian and remembers your display preferences across sessions.

---

## Signing Up

Go to `/app/signup`. Enter an email address and choose a password. You also need to complete a reCAPTCHA challenge before the form can be submitted — this protects the registration endpoint from automated bots.

When your account is created, the server responds with a security key. This key is shown exactly once, right after signup. Write it down and keep it somewhere safe. It is the only way to reset your password if you forget it. There is no email-based recovery — without the key, the password cannot be changed.

Your display name is not set at signup. That happens when you create your first game profile.

---

## Logging In

Go to `/app/login`. Enter your email and password. After a successful login the app redirects you to `/app/releases` automatically.

If you enter the wrong credentials, the server returns a generic "invalid credentials" message without specifying whether the email or the password was wrong. After repeated failures, the login form locks itself for 30 seconds. During the lockout the form inputs and the submit button are disabled. A countdown in the button label shows how many seconds remain.

---

## Resetting Your Password

Go to `/app/reset-password`. You need your registered email address and the security key you received at signup. After a successful reset, the server issues a brand new security key. Save it — the old one is immediately invalidated. Your existing session is also ended and you need to log back in.

---

## Profiles

A SMAASH account holds multiple game profiles. Think of them as separate save slots — each one has its own display name, coin balance, and profile picture. After logging in, you land on the profile selector at `/app/profile-selector`, where you choose which profile to play as for the session.

### Creating a Profile

Click the add button on the profile selector screen. Type a display name. Names longer than 20 characters are automatically trimmed to 20. You can optionally upload a profile picture at this step.

Accepted image formats are JPEG, PNG, WebP, and GIF. The file must be smaller than 5 MB. If the picture upload fails, the profile is still created without a picture — you can try uploading it again later from the profile page.

### Switching Profiles

Click any profile card on the profile selector screen. The app saves your selection and uses that profile for all coin balances, purchases, and leaderboard standing for the rest of the session.

### Editing a Profile

From `/app/profile`, click the edit button. A side panel opens where you can change the display name and upload a new profile picture. The name field enforces the same 20-character maximum. The picture upload enforces the same format and size limits.

### Deleting a Profile

On the profile page, selecting delete removes the profile from the list immediately — the UI updates before the server confirms. If the server rejects the deletion, the profile reappears automatically.

---

## Releases

The releases page at `/app/releases` lists the available downloads for the game client. You can filter by operating system — Windows, macOS, or Linux — using the platform selector at the top. A search bar lets you find a specific version by name or tag. Each release entry shows the version title, description, and a download button.

---

## Gallery

The gallery at `/app/gallery` has two sections you switch between with the tab buttons at the top.

The Characters tab shows every playable character in the game. Each card displays the character's artwork and name. No progression or unlocking is required to view them here.

The OST tab is a full audio player for the game's original soundtrack. It shows a track list on one side and playback controls on the other. You can play, pause, skip to any track by clicking it, drag the progress scrubber to a specific point in the track, and adjust the volume. The speaker icon doubles as a mute toggle.

---

## Leaderboard

The leaderboard at `/app/leaderboard` shows how players rank against each other globally. Use the tab buttons at the top to switch between categories. The top three in each category are shown on a podium — first place in the center, second to the left, third to the right. Below the podium, the full ranked list is searchable by player name.

---

## News

The news page at `/app/news` contains announcements, patch notes, and community updates. Posts are organized by category. The category filter on one side of the page lets you narrow the feed. The search bar finds posts by keyword.

If you have admin or support permissions, buttons for creating, editing, and deleting posts appear next to each entry. Regular users see the feed in read-only mode.

---

## Webstore

The webstore at `/app/webstore` shows items purchasable with the coins belonging to your active profile. Each item card shows the name, description, price, and a colored rarity label. Rarity levels are: Common, Uncommon, Rare, Epic, and Legendary — each has a distinct color so you can recognize them at a glance.

Use the filter bar to narrow items by rarity or category. Use the search box to find an item by name.

Items you already own show an "Owned" indicator instead of a purchase button. Items that cost more coins than your active profile holds show a disabled button. The coin balance displayed in the store is tied to your currently active profile, not your account overall. Switching profiles changes the available balance.

---

## Settings

The settings page at `/app/settings` controls how the application looks and behaves.

### Themes

There are 18 preset themes. Each sets a three-point color gradient for the application background and optionally activates a matching animated background. The pairings are:

| Theme | Animation |
|---|---|
| Azure | none |
| Slate | Storm |
| Emerald | Sakura |
| Amethyst | Lava Lamp |
| Coral | none |
| Sunset | Sakura |
| Ocean | Fishtank |
| Lavender | Aurora |
| Midnight | Deep Space |
| Fire | Lava Lamp |
| Aurora | Aurora |
| Neon Noir | Synthwave |
| Rose Gold | Sakura |
| Monsoon | Puddle Ripples |
| Nebula | Particle Web |
| Abyss | Bioluminescence |
| Starmap | Constellation |
| Void | Void |

Selecting a theme changes the gradient colors and switches the animated background to match, unless you have set an animation override.

### Custom Colors

Below the theme presets, you can set three custom gradient colors using individual color pickers. The left, middle, and right colors blend together across the background. Changes take effect immediately.

### Animation Override

The animation override lets you change the background animation independently of the theme. Options are:

- Leave it at the theme default.
- Set it to a specific animation regardless of which theme is active.
- Set it to "none" to disable the background animation while keeping the theme colors.
- Set it to "custom" to run a composite mix of multiple effects at once.

### Effect Mix

The Effect Mix dialog lets you layer multiple background animations simultaneously. Each of the 12 animations can be enabled or disabled individually, and each has its own set of sub-effects. For example, the Fishtank animation lets you toggle fish, bubbles, seaweed, caustics, and light shafts on or off independently. The Storm animation lets you toggle rain, lightning, clouds, and ground shimmer separately.

### Animations Toggle

Turns all motion on or off globally. When disabled, background animations stop, page transition effects stop, and everything renders instantly. This helps on low-powered devices or for users who prefer reduced motion.

### Liquid Glass

Switches the visual style of panels and cards between a frosted-glass look (blurred, semi-transparent backgrounds) and a solid background style. The frosted glass requires a modern browser to render correctly.

### Dark Mode

Switches the text and surface colors to a dark palette. This works independently of the theme gradient — you can use any theme in either light or dark mode.

### Language

Switches between English and Hungarian. The change takes effect immediately across the entire application, including all labels, buttons, error messages, and navigation items. The language is saved in your browser so you only need to set it once.

---

## Your Account

The profile page at `/app/profile` is where you manage your account credentials.

You can change your email address. You can change your password, but doing this requires your current security key — the one issued to you at signup (or the most recent one issued after a password reset). After a password change, you receive a new security key.

A banner appears the first time you log in after signing up to remind you to save your security key. Once you confirm you have seen it, the banner does not appear again.

---

## Navigation

The navigation bar at the top of every page links to all sections of the application. On small screens it collapses into a compact menu that you open by tapping a button.

Your active profile's picture appears in the top-right corner. Clicking it opens a dropdown menu with links to your profile page, your settings, and a logout button.

Admin accounts also see links to the Admin Panel and Debug Dashboard in the navigation bar.

---

## Admin Panel

The admin panel at `/app/admin` is only accessible to accounts with the admin role.

It shows a searchable list of all registered users. Selecting a user opens their full details: email, role, account status, and all their game profiles. From there you can ban the user for a preset duration or a custom date range, unban them, promote them to the support or admin role, or demote them back to a regular user.

---

## Debug Dashboard

The debug dashboard at `/app/debug` is only accessible to admin accounts.

It provides tools for diagnosing and managing the platform: inspecting the live React Query cache, firing API requests manually, browsing and editing all database records (users, profiles, items, characters, categories, rarities, purchases, roles, posts, stats), and toggling various UI debug overlays such as layout borders, breakpoint badges, FPS counter, element inspector, and network delay simulation.

---

## Logging Out

Click your profile picture in the top-right corner, then select "Log out." Your session ends immediately and you are returned to the login page. All application state is cleared from memory.
