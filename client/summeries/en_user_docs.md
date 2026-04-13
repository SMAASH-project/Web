# SMAASH Client — User Guide

**Last updated:** 2026-04-13 (rev 7)

> Welcome! This guide walks you through SMAASH's features, settings, and common tasks. Think of it as a companion while you explore.

---

## Getting Started

### First Time?

1. Head to the app and tap **Sign Up** if you don't have an account yet
2. Enter your email and create a password
3. Log in with your credentials
4. You'll be dropped into the app (usually at News or Releases)

### Returning Player?

Just log in—your profile selection and game settings are saved automatically.

---

## Navigation Basics

The top navigation bar is your home base. Here's what each section does:

| Section             | What's Inside                     | Why You'd Go There                        |
| ------------------- | --------------------------------- | ----------------------------------------- |
| **Home / Releases** | New game releases & version notes | Checking what's new, downloading updates  |
| **News**            | Community posts, announcements    | Staying in the loop                       |
| **Webstore**        | Buy items, cosmetics, battle pass | Customizing your gear                     |
| **Leaderboard**     | Global rankings & stats           | See where you stand against other players |
| **Gallery**         | Media, art, player showcases      | Browse cool game content                  |
| **Profile**         | Your account, stats, settings     | Managing your character info              |
| **Settings**        | Theme, language, animations       | Making the app feel right for you         |

**For Admins:** You'll also see **Admin Panel** and an expanded **Debug Dashboard**.

### Admin Debug Dashboard (New in April 2026)

Admins now have an expanded debug workspace at `/app/debug` with interactive tools across system state, endpoints, cache, game data, diagnostics, and a new **Database** tab.

Key capabilities:

- Interactive data operations (create/edit/delete where API supports it)
- User moderation actions (ban with duration, unban, promote, demote)
- Session action history in the panel
- Danger Zone controls for sensitive operations with warnings

Database tab scope:

- Resources: Users, Profiles, Items, Characters, Levels, Categories, Rarities, Purchases, Roles, Posts, Stats
- Inline record browsing and editing workflows
- Built-in schema/reference view for quick operator guidance
- Some actions may be unavailable if no backend endpoint exists yet (for example seed/reset flows)

---

## Your Profile

### Selecting Your Game Character

When you first play, you'll choose a game character from the **Profile Selector**. This character is "active" for all your gameplay actions.

**To switch characters:**

1. Tap the **Profile** icon in the top-right corner
2. Select a different character
3. The app remembers your choice

### Editing Your Account

From the **Profile** page, you can:

- **Change your display name** — how other players see you
- **Update email** — for account recovery and notifications
- **View your stats** — wins, matches played, progress (coming soon: full match history)

---

## The Webstore

### Browsing Items

Items are organized by **type** (character, skin), **combat style** (melee/ranged for characters), and **rarity** (common to legendary). Use filters and search to find what you need.

### Buying Items

1. Select an item
2. Tap **Purchase**
3. Coins are deducted from your selected profile's balance
4. The item appears in your inventory immediately

**Your coin balance is tied to your active profile.** If you switch profiles, your coins change too.

---

## News & Announcements

The **News** section is where the team posts:

- Game balance changes
- Event announcements
- Community spotlights
- Patch notes

You can search posts by keyword or browse the full feed. Admins can create and edit news articles.

---

## Releases

**Releases** shows all available versions of the game.

**Features:**

- **Version history** — see all past releases
- **Platform filters** — download for your device
- **Release notes** — what changed in each version

**Download button is greyed out if:**

- That version isn't available for your platform
- The download link isn't configured yet

---

## Leaderboards

The leaderboard has a **tab selector** at the top. Pick a category to explore it in depth, or stay on **All** for a quick overview.

### "All" tab

- **Stat bar** — four highlight chips showing the current #1 in each category (top winner, most active player, hottest level, best-selling item)
- **Four panels** — top 5 entries per category, side by side

### Category tabs (Wins / Active / Levels / Items)

Each category tab shows:

1. **Podium** — the top 3 displayed on a gold/silver/bronze podium. 1st place stands tallest in the centre; 2nd is to the left, 3rd to the right
2. **Runners-up** — 4th and 5th place listed just below the podium, if they exist
3. **Full rankings** — a scrollable list of all entries with their rank number. Use the **search bar** to jump straight to a player, level, or item by name

The leaderboards update periodically as the server processes stats. If numbers look stale, give it a moment and refresh.

---

## Gallery

Explore **game media**, **player art**, and **community showcases** in the Gallery. Use the navigation controls to browse through entries.

---

## Customizing Your Experience

### Settings Overview

**Settings** is where you make the app feel _yours_:

#### Language

Switch between **English** and **Hungarian**.

#### Visual Style

- **Dark Mode** — easier on the eyes in low light
- **Light Mode** — brighter, sharper contrast
- **Liquid Glass** — glassmorphism effect (requires modern browser)

#### Animations

- **Enable animations** — smooth transitions and motion effects
- **Disable animations** — static, snappier interface (useful if motion causes discomfort)

#### Custom Theme

- **Pick gradient colors** — 3-point color picker for a personalized look
- **Choose an effect** — animated backgrounds (aurora, matrix, particles, etc.)
- **Layer effects** — combine multiple animations for a unique vibe

Your settings are saved in your current browser (local device storage).

---

## Keyboard Shortcuts & Tips

| Action            | Tip                                                     |
| ----------------- | ------------------------------------------------------- |
| Dark mode         | Available in Settings → Visual Style                    |
| Back to home      | Tap the logo in the top-left                            |
| Responsive design | Works great on phone, tablet, and desktop—try resizing! |

---

## Troubleshooting

### "I got logged out"

This usually happens after being inactive for a while. Just log back in—your data is safe.

### "Numbers look old"

Stats on leaderboards update periodically. If data seems stale, try:

1. Refreshing the page (`Ctrl + R` or `Cmd + R`)
2. Waiting a moment for the server to finish computing stats
3. If it persists, contact support

### "I'm looking at the wrong profile's coins"

Make sure you've selected the right character in the **Profile** section. Each character has their own coin balance.

### "An action failed and I don't know why"

Try:

1. Refresh the page
2. Check your internet connection
3. Log out and back in
4. Contact support with a description of what you were doing

---

## Quick Tips for a Better Experience

1. **Personalize your theme** — spend a minute in Settings picking colors you like; you'll see them everywhere
2. **Turn off animations if they bother you** — they're nice, but not for everyone
3. **Check News regularly** — that's where announcements happen
4. **Use the Profile Selector frequently** — experiment with different characters
5. **Bookmarks are your friend** — favorite pages for quick access

---

## Recent Improvements (April 2026)

We've made the app faster and smoother:

- **Leaderboard redesign:** The leaderboard now has a tab selector. Pick a category to see a full podium (top 3), runners-up, a search bar, and a scrollable ranked list. The "All" tab shows a stat bar and all four panels at once
- **Leaderboard loads instantly:** The previous animation delay (up to 2 seconds before content appeared) has been removed — data shows up as soon as it arrives
- **Smaller download size:** Optimized assets; app loads quicker on slower connections
- **Smoother theme switching:** Background animations now respond instantly to your settings changes
- **Better performance:** Less CPU usage when animations are playing, especially on mobile devices
- **More stable profile creation feedback:** clearer errors when a name is already taken or profile limits are reached
- **Improved News dialogs on mobile:** The post creation and editing dialogs now display with proper side padding on phones, scroll correctly when content is tall, and the image settings section stacks neatly instead of overflowing

You might not notice all these changes directly, but the app should feel snappier and more polished overall.

---

## Need Help?

- **Something isn't working?** Try refreshing the page first. Most issues clear up this way. If you still have trouble, contact support.
- **Have feedback or found a bug?** Reach out to support or your admin team with steps to reproduce.
- **Performance issues on your device?** Try turning off animations in Settings — it can help on older phones or slower connections.
