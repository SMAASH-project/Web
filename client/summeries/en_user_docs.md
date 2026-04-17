# SMAASH — User Guide

> Welcome! This guide walks you through everything the SMAASH platform has to offer: from setting up your profile to customizing your experience, buying items, climbing the leaderboard, and more. Read it all or jump to whatever you need.

---

## Getting Started

### Creating an Account

1. Open the app and click **Sign Up**
2. Enter your email address and choose a password
3. Log in with those credentials
4. You will land on the News or Releases page — explore from there

### Returning Player

Just log in. Your selected profile, theme preferences, and most settings are saved automatically in your browser, so everything will look exactly how you left it.

---

## Navigation

The top navigation bar is your main hub. Here is what each section contains and why you would visit it:

| Section | What is inside | Why you would go there |
|---|---|---|
| **Releases** | Game version history and release notes | Downloading the latest version or checking what changed |
| **News** | Community posts and announcements | Staying up to date with game updates and events |
| **Webstore** | Items, cosmetics, and the battle pass | Spending coins on things for your profile |
| **Leaderboard** | Global rankings by category | Seeing where you and other players stand |
| **Gallery** | Character showcase and the official OST | Browsing game art and listening to the soundtrack |
| **Profile** | Your account details and stats | Changing your name, email, or checking your progress |
| **Settings** | Theme, language, and animation options | Making the app feel comfortable and personal |

**Admins** also see shortcuts to the **Admin Panel** and the **Debug Dashboard** in the navigation bar.

---

## Your Profile

### Selecting a Game Character

When you first log in, you will be asked to pick an active game profile from the **Profile Selector**. This is the character that represents you in-game. Your coin balance, purchases, and stats are all tied to this active profile.

**To switch profiles:**
1. Open the **Profile** section from the navigation bar
2. Click on a different character
3. The app saves your choice immediately

### Editing Your Account

From the **Profile** page you can:

- **Change your display name** — this is how other players see you in rankings and matches
- **Update your email address** — used for account recovery
- **View your stats** — wins, matches played, and more

---

## The Webstore

### Browsing Items

Items are organized by multiple criteria, and you can filter and search to narrow things down:

- **Type** — Character or Skin
- **Combat style** — Melee or Ranged (applies to characters)
- **Rarity** — from Common to Legendary
- **Search bar** — find anything by name instantly

### Buying an Item

1. Browse to the item you want
2. Click **Purchase**
3. Coins are deducted from your active profile's balance
4. The item appears in your inventory right away

**Your coin balance is tied to your active profile.** If you switch profiles, your available coins will be different. Make sure you have the right profile selected before purchasing.

---

## News & Announcements

The **News** section is where the team posts:

- Game balance changes and patch notes
- Upcoming event announcements
- Community spotlights
- General platform updates

You can search posts by keyword or browse the full feed chronologically. If you are an admin, you can also create and edit news articles directly from this page.

---

## Releases

**Releases** lists every available version of the game client.

**What you can do here:**

- Browse the full version history
- Filter downloads by your platform
- Read the release notes for each version before downloading

**The download button is greyed out when** the version is not yet available for your platform, or when no download link has been configured for it yet.

---

## Leaderboard

The leaderboard has a tab selector at the top. Each tab focuses on a different category of achievement.

### All Tab

A quick overview of every category at once:

- **Stat bar** — four highlighted chips showing the current #1 in each category: top winner, most active player, hottest level, best-selling item
- **Four panels** — top 5 entries per category, displayed side by side

### Category Tabs (Wins / Active / Levels / Items)

Selecting a category tab gives you the full deep-dive view:

1. **Podium** — the top 3 displayed on a classic gold, silver, and bronze podium. First place stands tallest in the center; second place is to the left, third to the right
2. **Runners-up** — fourth and fifth place listed just below the podium, if they exist
3. **Full rankings** — a scrollable list of every entry with their original rank number preserved. Use the **search bar** to find a specific player, level, or item by name without scrolling

Leaderboard data updates periodically as the server processes match results. If numbers look stale, wait a moment and refresh.

---

## Gallery

The Gallery page has two sections accessible via the tab buttons at the top:

- **Characters** — A grid of all game characters. Each card shows the character's portrait and name
- **OST** — The full official soundtrack. Pick a track, adjust the volume, and use the scrubber to navigate within a track. The track list on the right lets you jump directly to any song

---

## Customizing Your Experience

### Settings Overview

Everything in **Settings** is saved to your current browser. If you switch devices, you will need to set your preferences again.

#### Language

Switch between **English** and **Hungarian**. The change takes effect immediately across the whole app.

#### Visual Style

- **Dark Mode** — darker backgrounds with light text; easier on the eyes in low-light environments
- **Light Mode** — bright backgrounds with high contrast; better for well-lit rooms
- **Liquid Glass** — a glassmorphism style with frosted-glass blur effects on panels and cards; requires a modern browser to render well

#### Animations

- **Enable animations** — smooth entrances, transitions, and background effects
- **Disable animations** — static, instant interface; useful if motion effects cause discomfort, or if you are on a slower device and want better performance

#### Custom Theme

- **Gradient colors** — pick three colors to build the app's primary color palette; these affect accent colors, nav borders, button highlights, and chip backgrounds everywhere
- **Background effect** — choose one of many animated backgrounds (aurora, matrix, particles, and more)
- **Layer effects** — combine multiple background animations for a unique layered look

---

## Tips for Getting the Most out of SMAASH

1. **Spend a few minutes in Settings** — picking a color theme and background effect that you like makes every page feel better
2. **Turn off animations if they bother you** — the app works perfectly without them; some people prefer the cleaner, faster feel
3. **Check News regularly** — important announcements about events and game updates are posted there first
4. **Use the Profile Selector freely** — if you have multiple characters, switching between them is fast and your progress on each is kept separately
5. **Bookmark your favorite pages** — the leaderboard, webstore, and news pages are quick to navigate to directly

---

## For Admins

### Admin Panel (`/app/admin`)

The admin panel gives you full user management capability:

- Browse and search all registered users
- View any user's full profile details, account status, and game profiles
- **Ban** a user — choose a duration (preset or custom date range) and an optional reason
- **Unban** a user at any time
- **Promote** a user to Support or Admin role
- **Demote** a user back to a lower role

### Debug Dashboard (`/app/debug`)

A comprehensive internal toolbox for diagnosing issues and managing platform data:

- **System** — runtime state and diagnostics
- **Endpoints** — manually fire any API request and inspect the response
- **Cache** — inspect and invalidate the React Query cache in real time
- **Game Data** — create, edit, and delete characters, levels, and items; manage users with moderation actions
- **Visual** — toggle layout overlays, FPS counter, element inspector, CSS variable viewer, and more
- **Emulation** — simulate different devices and network conditions for testing
- **Diagnostics** — accessibility contrast checker, render counts, z-index inspector
- **Database** — browse and edit all platform resources (users, profiles, items, characters, levels, categories, rarities, purchases, roles, posts, stats) from a single data browser interface

