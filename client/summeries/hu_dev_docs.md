# SMAASH Kliens — Fejlesztői Dokumentáció (Egyesített)

Frissítve: 2026-04-02

## 1) Stack és architektúra

- React 19 + TypeScript + Vite
- Tailwind CSS 4 + közös téma segédfüggvények (`src/lib/utils/*`)
- Motion (`motion/react`) animációkhoz
- React Query + Axios API állapothoz
- i18next (`en` / `hu`) lokalizációhoz

Fő belépési pontok:

- `src/main.tsx`: routing, lazy loading, error boundary wrapping
- `src/RootLayout.tsx`: provider-ek, query kliens, perzisztencia, toaster
- `src/Wrapper.tsx`: gradient + CSS változók + háttér animációk

## 2) Routing és jogosultság

- Nyilvános: login, signup, reset-password
- Védett: minden `/app/*` route (`RequireAuth`)
- Szerepkör-alapú oldalak:
  - `/app/admin`: csak admin
  - `/app/debug`: admin + support

## 3) Provider-réteg

Sorrend:

1. React Query persist provider
2. `AuthProvider`
3. `SettingsProvider`
4. `NavbarProvider`
5. `ColorProvider`
6. `ProfileProvider`

Perzisztált állapotok:

- `settings`
- `color-settings`
- `selected_profile_<userId>`

## 4) Téma és vizuális rendszer

- Központosított helper-ek a `themeClasses` és kapcsolódó util fájlokban.
- Fontos CSS változók:
  - `--theme-accent`
  - `--theme-accent-hover`
  - `--theme-accent-soft`
  - `--theme-nav-border`
  - `--theme-nav-shadow`

Fő kapcsolók:

- `useLiquidGlass`
- `useDarkMode`
- `useAnimations`
- `animationOverride`

## 5) Animációs/háttér rendszer

- A háttér effektet `AnimationKey` választja.
- `animationOverride` módok:
  - `null`: témát követi
  - `none`: kikapcsol
  - konkrét kulcs: fix effekt
  - `custom`: több réteg egyben (`CompositeBackground`)

Teljesítmény:

- késleltetett háttér fade-in a nehéz oldalakon
- crossfade effektváltáskor
- statikus képkocka, ha az animációk le vannak tiltva

## 6) API és React Query konvenciók

`apiClient`:

- base URL: `/api`
- `withCredentials: true`
- központi 401 kezelés

React Query:

- központi query key stratégia
- célzott invalidálás mutációk után
- feature-szintű stale/cache finomhangolás

## 7) Fő funkciók röviden

### Admin panel

- Felhasználó lista + részletek + profil panel + tiltás dialógus
- Kliensoldali keresés fallback, amíg a backend oldali keresés teljes

### Debug panel

- Tabok: system, cache, endpoints, game data, sight
- Endpont tesztelés + cache introspekció

### Profil oldal

- Név/email szerkesztés működik
- Jelszócsere backend függő
- Match history és game stat endpoint-függő

### Webstore

- Item lista + vásárlás + tulajdon státusz merge
- Coin érték kiválasztott profilból

## 8) i18n

- Locale fájlok:
  - `src/locales/en/*`
  - `src/locales/hu/*`
- Nyelv a settingsben tárolva, i18next szinkronizációval.

## 9) Optimalizációs állapot

Kész:

- route lazy loading
- suspense fallback
- manuális vendor chunkolás
- build stat vizualizáció

Hátralévő:

- képformátum optimalizáció
- nagy listák virtualizációja
- opcionális PWA/offline réteg

## 10) Ismert backend függőségek

- profil meccs előzmény endpoint hiányzik
- jelszócsere endpoint hiányzik
- admin keresés/pagináció backend oldalon bővítendő

## 11) Fejlesztői irányelvek

- Mindig közös téma helper-eket használj.
- API hívásokhoz typed query/mutation hook-okat használj.
- Route/page szinten legyen explicit jogosultságellenőrzés.
- UI változtatásnál lokalizáció és dokumentáció is frissítendő.
