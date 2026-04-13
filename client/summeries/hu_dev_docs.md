# SMAASH kliens — fejlesztői dokumentáció

**Frissítve:** 2026-04-13 (rev 8)

> Ez az összefoglaló a kliens architektúráját, a közös mintákat és a legfontosabb fejlesztési szabályokat foglalja össze. Nem csak azt mondja meg, _mit_ használunk, hanem azt is, _miért_ így.

---

## Stack és alaparchitektúra

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** + közös téma- és stílussegédfüggvények (`src/lib/utils/*`)
- **motion/react** animációkhoz és átmenetekhez
- **React Query** + **Axios** az API állapot és a hálózati réteg kezelésére
- **i18next** az angol / magyar lokalizációhoz

### Fő belépési pontok

- `src/main.tsx` — routing, lazy loading, error boundary-k
- `src/RootLayout.tsx` — provider-ek, query kliens, perzisztencia, toaster, globális debug effektusok
- `src/Wrapper.tsx` — téma-gradiens, CSS változók, háttéranimációk és layout keret

---

## Routing és jogosultságmodell

- **Nyilvános oldalak:** login, signup, reset-password
- **Védett oldalak:** minden `/app/*` route a `RequireAuth` alatt fut
- **Szerepkör-alapú oldalak:**
  - `/app/admin` — csak admin
  - `/app/debug` — csak admin (diagnosztika + műveleti dashboard)

### Fontos megjegyzés

A feature oldalak jellemzően **lazy-loaded** formában érkeznek. Ez csökkenti az első betöltés súlyát, de az első navigációkor külön chunk letöltési költséggel jár.

---

## Provider-réteg és állapotkezelés

### Provider sorrend

1. React Query persist provider
2. `AuthProvider`
3. `SettingsProvider`
4. `NavbarProvider`
5. `ColorProvider`
6. `ProfileProvider`

### Perzisztált állapotok

- `settings`
- `color-settings`
- `selected_profile_<userId>`

### Miért fontos ez a sorrend?

A felsőbb provider-ek biztosítják, hogy az alatta lévő UI elemek már kész állapotot kapjanak. Például a téma- és profil-információk hamar elérhetők, így a renderelt felület nem villog át feleslegesen alapállapotba.

---

## Téma- és vizuális rendszer

- A közös stíluslogika a `src/lib/utils/themeClasses.ts` és rokon fájlok alatt él.
- A CSS változók a téma színeiből épülnek fel:
  - `--theme-accent`
  - `--theme-accent-hover`
  - `--theme-accent-soft`
  - `--theme-nav-border`
  - `--theme-nav-shadow`

### Fő vizuális kapcsolók

- `useLiquidGlass`
- `useDarkMode`
- `useAnimations`
- `animationOverride`

### Irányelv

Ha valami „téma-szerűen” néz ki, először a közös helper-eket keresd, és csak utána nyúlj inline ternary-khez.

---

## Animációs és háttérrendszer

- A háttér-effektet `AnimationKey` választja ki.
- Az `animationOverride` módok:
  - `null` — követi a témát
  - `none` — kikapcsolja az animált hátteret
  - konkrét kulcs — egy fix effektet kényszerít
  - `custom` — rétegezett összetett háttér (`CompositeBackground`)

### Teljesítmény és vizuális viselkedés

- késleltetett háttér fade-in a nehezebb oldalakon
- crossfade effektváltáskor
- statikus fallback, ha az animációk le vannak tiltva

---

## API és React Query konvenciók

### `apiClient`

- base URL: `/api`
- `withCredentials: true`
- központi 401 kezelés

### Auth folyamat röviden

- belépés: `/auth/login`
- session: HTTP-only cookie alapú
- felhasználó-feloldás: `GET /users/whoami` (`AuthProvider`)
- `AuthContext` mezők: `userId`, `isAdmin`, `isSupport`, `isLoggedIn`

### React Query minták

- központi query key stratégia
- célzott invalidálás mutációk után
- feature-szintű stale/cache finomhangolás

### Debug / network megjegyzés

A debug emulációs mód hálózati késleltetést is tud szimulálni. Ez fejlesztés közben hasznos, ha azt akarod látni, hogyan viselkedik a felület lassabb API mellett.

---

## Fő funkciók röviden

### Admin panel

- felhasználólista, részletek, profil panel, tiltás dialógus
- kliensoldali keresési fallback, amíg a backend keresés nem teljes

### Debug panel

- tabok: system, cache, endpoints, game data, visual, emulation, diagnostics, database
- Sight részek: vizuális kapcsolók, viewport/network emuláció, diagnosztika
- `useDebugSettings` lokálisan perzisztál, és `CustomEvent("debug-settings")` eseménnyel jelzi a változásokat
- globális debug effektusok a `RootLayout.tsx`-ben futnak
- JS viewport emuláció: `window.innerWidth/Height` és `window.matchMedia` patch-elésével segíti a JS-alapú responsive logikát
- Tailwind breakpoints nem változnak ettől, mert azok build-time CSS médiaquery-k
- **Database tab (új):** általános REST-alapú adatböngésző 11 erőforrással (Users, Profiles, Items, Characters, Levels, Categories, Rarities, Purchases, Roles, Posts, Stats)
- sor-szintű CRUD (ahol van backend endpoint), létrehozás/szerkesztés dialógusokkal és törlési megerősítéssel
- kliensoldali (hardcoded) sémanézet a Go/GORM modellek alapján
- inline user moderáció: tiltás (időtartam-választóval), feloldás, előléptetés, lefokozás
- session-only akciónapló (memóriában, max 20)
- Danger Zone blokk kaszkád figyelmeztetésekkel (különösen Users/Profiles)
- jelenlegi korlátok: seed/reset endpoint nincs; post törlés nincs; képfeltöltés CRUD űrlapokban nincs bekötve
- **Game Data tab bővítés:** karakter/level/item CRUD + user management táblában moderációs műveletek

### Profil oldal

- név- és e-mail szerkesztés működik
- jelszócsere backend függő
- match history és statok endpoint-függők

### Webstore

- itemlista + vásárlás + tulajdonállapot merge
- coin érték a kiválasztott profilból

### Gallery (`/app/gallery`)

Két tabos oldal: **Karakterek** rács és **OST** zenelejátszó.

**Tab választó:** A közös pill-container mintát alkalmazza — `panelBg` wrapper `relative` pozícionálással, csúszó kiemelés div (csak LG módban), `data-tab` attribútumok a gombokhoz. Aktív állapot: `bg-gray-700 shadow-md` (nem-LG sötét) / `bg-gray-200 shadow-md` (nem-LG világos). Inaktív hover: `hover:bg-gray-700` / `hover:bg-gray-100`. LG módban a gombok átlátszók, a csúszó kiemelés adja az aktív vizuált. Az egér gombra lépésekor frissül a `highlightPos`, a containert elhagyva visszaáll a kiválasztott tabra.

A `TabButton` komponens a `GalleryPage`-hez lokális. `dataTab`, `onMouseEnter` és `isHovering` propokat kap a container szintű kiemelés követéséhez.

**Karakterek tab:** `useDebugCharactersQuery`-n keresztül tölt (ADMIN szükséges — lásd `docs/problems.md`). Minden karaktert `CharacterCard` jelenít meg, ami `GET /api/characters/:id/img`-et tölt be, és hibánál `Swords` ikonra esik vissza. `LoadPost`-tal animálva, ha `useAnimations` be van kapcsolva.

**OST tab:** Statikus `OstTrack[]` lista a fájl tetején. Trackeket hozzáadni az `OST_TRACKS` szerkesztésével lehet. Teljesen működő audiojátszó seekerrel, hangerővel és tracklista nézettel.

### Leaderboard (`/app/leaderboard`)

Tab alapú ranglétra: kategóriánként podium nézet, globális "Összes" áttekintővel.

**Tab választó:** Ugyanaz a pill-container minta, mint a Gallery-nél és az `ItemFilters`-nél — `tabContainerRef`, `highlightPos`, `isHovering` állapot page szinten; csúszó kiemelés div LG módban; `data-tab` a gombokon. Aktív állapot: `bg-gray-700 shadow-md` / `bg-gray-200 shadow-md`. Inaktív hover: `hover:bg-gray-700` / `hover:bg-gray-100`.

**Tab struktúra (`TabId`):**

| Tab | Adatforrás | Fő stat |
|---|---|---|
| `all` | Mind a négy lekérdezés | Stat sáv + top-5 panelek |
| `wins` | `useLeaderboardQuery` | `count_of_wins` |
| `active` | `useTopPlayersQuery` | `count_of_matches` |
| `levels` | `useTopLevelsQuery` | `count_of_plays` |
| `items` | `useTopItemsQuery` | `count_of_purchases` |

**„Összes" nézet:**

- Stat sáv: 4 chip, kategóriánként az #1 szereplőt mutatja
- 2×2-es rács, panelenként top 5 sorral (korábban 10 volt)
- Minden panel saját skeletonnel tölt

**Kategória nézet (minden tab az "all"-on kívül):**

- `PodiumSlot` komponensek az 1–3. helyeknek, sorrendben `[2. | 1. | 3.]` (igazi dobogó vizuál); `motion.div` animáció 0,4 s ease-out, 0 / 0,15 / 0,30 s késleltetéssel rangsoronként
- Runners-up sor a 4–5. helyeknek, ha léteznek
- A `CategoryView` komponens saját `search` állapotot tart; az adatok `RankedEntry[]` formátumra normalizálódnak a page szinten, mielőtt belekerülnek
- Görgethető lista (`max-h-72 overflow-y-auto`) az összes bejegyzéssel, az eredeti sorrend szerinti rangszámokkal

**Adatnormalizálás:**

Mind a négy dataset `RankedEntry { id, name, stat, statLabel, sub? }` formára képeződik le a page komponensben, hogy a `PodiumSlot` és a `CategoryView` teljesen generikus maradjon.

**Teljesítmény:**

- A `CardAnimation` (1,5 s spring) és a `LoadPost` sor-stagger ebben az oldalban már nem szerepelnek — a tartalom azonnal látható
- Tab váltáshoz `AnimatePresence mode="wait"` van használva, 0,18 s opacity/y fade-del
- Minden `CategoryView` mount reseteli a search állapotot (szándékos; a `key={activeTab}` prop biztosítja)
- Mind a négy lekérdezés párhuzamosan indul; az egyedi skeleton állapotokat panelenként kezeli

**Új locale kulcsok** (mindkét nyelvhez): `tabs.*`, `podium.runnersUp`, `podium.fullRankings`, `statBar.*`, `search`.

---

## i18n

- Locale fájlok:
  - `src/locales/en/*`
  - `src/locales/hu/*`
- A nyelv a settingsben tárolódik, és i18next szinkronizálja.

---

## Optimalizációs állapot

### Már kész

- route lazy loading
- suspense fallback
- manuális vendor chunkolás
- build stat vizualizáció
- leaderboard skeleton loading a spinner helyett
- kisebb panel stagger az olvashatóbb betöltéshez

### Még szóba jöhet

- képformátum-optimalizáció
- nagy listák virtualizációja
- opcionális PWA / offline réteg

### Leaderboard megjegyzés

A leaderboardon több statisztikai lekérdezés fut párhuzamosan. A React Query ezt nem sorban végzi, de a teljes látható betöltés mindig a leglassabb endpointon múlik. Emiatt a skeleton UI sokkal jobb élményt ad, mint egy egyszerű spinner.

---

## Ismert backend függőségek

- profil meccs-előzmény endpoint hiányzik
- jelszócsere endpoint hiányzik
- admin keresés/pagináció backend oldalon bővítendő

---

## Közös UI komponensek

- `src/components/ui/styled-select.tsx` — theme-aware dropdown a `DropdownMenu` alapjain. Ezt használd natív `<select>` helyett, ha a kinézetet illeszteni kell a felülethez.
- `src/components/ui/skeleton.tsx` — egyszerű pulse skeleton betöltési állapotokhoz
- `src/components/ui/dialog.tsx` — közös dialog shell, `max-h-[90svh]` és görgethető tartalom támogatással. Mobilon a helyes szélesség `max-w-[calc(100%-2rem)]`; **ne írj felül** `max-w-full`-lal, mert az eltünteti az oldalsó margókat. A `overflow-visible` hozzáadása szintén tiltott, mert felülírja az `overflow-y-auto`-t és a tartalom kilóg a dialogból ahelyett, hogy görgethetővé válna.

**News dialógusok (Hozzáadás és Szerkesztés) specifikusan:**

- A képbeállítások szekció mobilon függőlegesen stacked: `flex flex-col gap-4 sm:flex-row sm:items-start`. A rádiógombok, fájl input és a méretező panel mobilon teljes szélességű, `sm+` breakpointon egymás mellé kerülnek
- `RadioGroupChoiceCard`: `w-full sm:max-w-sm` — mobilon teljes széles, nagyobb képernyőn korlátozott

---

## Navbar és layout szerződés

- A Navbar `position: fixed` és `z-50`, tehát **nincs** dokumentumfolyambeli magassága.
- Minden oldalnak, amely Navbar alatt jelenik meg, legalább `mt-20` vagy `pt-20` offsetet kell adnia az első tartalmi blokknak.
- A `flex items-center justify-center` layout önmagában nem elég; rövid viewporton is kell a felső padding.
- Mobilon a debug oldal már hamburger + sheet mintát használ, hogy a tartalom ne szűküljön össze túlzottan.

### Ellenőrzött oldalak

- gallery
- leaderboard
- webstore
- news
- releases
- admin / debug
- settings / profile

---

## Konvenciók hozzájárulóknak

- Mindig a közös téma helper-eket használd, ne duplikáld az inline színlogikát.
- API hívásokhoz typed React Query hook-okat használj.
- Route/page szinten legyen explicit jogosultságellenőrzés.
- UI változtatásnál a lokalizációt és a dokumentációt is frissíteni kell.
- Reszponzív viselkedésnél előbb a meglévő shadcn komponenseket nézd meg, és csak utána vezess be új UI elemet.
- **Tab választóknál** kövesd a pill-container mintát (lásd Gallery, Leaderboard, `ItemFilters`, `SelectOs`): `panelBg` wrapper `relative` pozícionálással, csúszó kiemelés div (csak LG), `data-tab` attribútumok, container szintű `highlightPos` + `isHovering` állapot. Aktív nem-LG: `bg-gray-700 shadow-md` / `bg-gray-200 shadow-md`. Inaktív hover: `hover:bg-gray-700` / `hover:bg-gray-100`. **Ne** használj `bg-white/15` / `bg-white` hardkódolt értékeket LG kezelés nélkül.
