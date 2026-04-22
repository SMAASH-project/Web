# SMAASH Web Kliens — Tesztdokumentáció

## A tesztek futtatása

```bash
cd client
npm run test        # az összes teszt egyszeri futtatása és kilépés
npm run test:run    # ugyanaz, alias
```

A test runner a Vitest, a `vite.config.ts` `test` kulcsa alatt konfigurálva:

```typescript
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test-setup.ts"],
}
```

A `globals: true` beállítás a `describe`, `it`, `expect` és `vi` globálisokat import nélkül elérhetővé teszi minden tesztfájlban. A `jsdom` környezet teljes DOM implementációt biztosít, így React komponensek renderelhetők és lekérdezhetők a test runnerben.

A `src/test-setup.ts` kiterjeszti a Vitest `expect`-jét az `@testing-library/jest-dom` matchereivel, elérhetővé téve az olyan állításokat, mint a `toBeInTheDocument()`, `toBeDisabled()` és `toHaveTextContent()` globálisan.

A tesztfájlok az általuk tesztelt kód mellé vannak elhelyezve. Az `src/` alatti bármilyen `.test.tsx` vagy `.test.ts` végű fájlt automatikusan felismeri a Vitest.

---

## Meglévő automatizált tesztek

### `src/components/ErrorBoundary.test.tsx`

Az `src/components/ErrorBoundary.tsx`-ben lévő `ErrorBoundary`-t teszteli.

A tesztfájl tetején egy `Crash` segédkomponens van definiálva. Ez az összetevő renderelés közben feltétel nélkül dob egy `new Error("Boom")` hibát. Ez megbízhatóan meghibásodó gyermeket biztosít anélkül, hogy a tesztet bármilyen valódi oldal logikához kellene csatolni.

#### Teszt: az alapértelmezett fallback UI megjelenítése gyermek hibánál

```typescript
render(
  <ErrorBoundary>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Something went wrong on this page.")).toBeInTheDocument();
expect(screen.getByText("Boom")).toBeInTheDocument();
```

Amikor a `Crash` hibát dob, a `getDerivedStateFromError` `true`-ra állítja a `hasError`-t és eltárolja az `Error` objektumot. A boundary rendereli az alapértelmezett fallbacket: egy középre igazított kártyát, amely tartalmazza a statikus "Something went wrong on this page." szöveget és az `error.message` értékét. A teszt mindkét string jelenlétét ellenőrzi a dokumentumban.

A `console.error` kémlelője a `vi.spyOn(console, "error").mockImplementation(() => {})` segítségével egy no-op-ra van cserélve, hogy elnyomja a React belső hibanaplózását az elkapott boundary renderelések során. A kémlelőt az állítás után `spy.mockRestore()`-ral vissza kell állítani, hogy ne szivárogjon át más tesztekbe.

#### Teszt: egyéni fallback megjelenítése, ha meg van adva a `fallback` prop

```typescript
render(
  <ErrorBoundary fallback={<div>Custom Error</div>}>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Custom Error")).toBeInTheDocument();
```

Ha meg van adva egy `fallback` prop, a boundary azt az elemet rendereli az alapértelmezett üzenet helyett. A teszt ellenőrzi az egyéni szöveg jelenlétét. Ugyanaz a `console.error` kémlelő minta kerül alkalmazásra.

---

### `src/components/RequireAuth.test.tsx`

Az `src/components/RequireAuth.tsx`-ben lévő `RequireAuth`-t teszteli.

Egy `renderProtectedRoute(isLoggedIn, isInitializing?)` segédfüggvény teljes routing kontextust állít fel `MemoryRouter` segítségével. Két route van konfigurálva: egy nyilvános bejelentkezési oldal és a védett kiadások oldal. Az `AuthContext.Provider` közvetlenül kerül felhasználásra a kontrollált auth állapot injektálásához, megkerülve a valódi `AuthProvider`-t (amely hálózati kéréseket küldene):

```typescript
function renderProtectedRoute(isLoggedIn: boolean, isInitializing = false) {
  return render(
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing,
        userId: null,
        setUserId: () => {},
        setIsLoggedIn: () => {},
        isAdmin: false,
        setIsAdmin: () => {},
        isSupport: false,
        setIsSupport: () => {},
      }}
    >
      <MemoryRouter initialEntries={["/app/releases"]}>
        <Routes>
          <Route path="/app/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/app/releases" element={<div>Releases Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
```

#### Teszt: a védett route renderelése hitelesített állapotban

```typescript
renderProtectedRoute(true);
expect(screen.getByText("Releases Page")).toBeInTheDocument();
```

Ha az `isLoggedIn` értéke `true`, a `RequireAuth` rendereli az `<Outlet />`-ot és a kiadások oldal tartalma láthatóvá válik.

#### Teszt: átirányítás a bejelentkezési oldalra hitelesítetlen állapotban

```typescript
renderProtectedRoute(false);
expect(screen.getByText("Login Page")).toBeInTheDocument();
```

Ha az `isLoggedIn` értéke `false` és az `isInitializing` értéke `false`, a `RequireAuth` rendereli a `<Navigate to="/app/login">`-t. A router követi az átirányítást és a bejelentkezési oldal stub megjelenik.

#### Teszt: spinner megjelenítése auth inicializálás közben

```typescript
renderProtectedRoute(false, true);
expect(document.querySelector(".animate-spin")).toBeInTheDocument();
```

Ha az `isInitializing` értéke `true`, a `RequireAuth` a védett tartalom vagy az átirányítás helyett egy `animate-spin` CSS osztályú spinnert renderel. Ez lefedi azt az időablakot, amely a kezdeti render és a `useWhoAmIQuery` feloldása között telik el. E guard nélkül a router minden oldalbetöltést a session ellenőrzés befejezése előtt átirányítana a bejelentkezési oldalra.

---

### `src/pages/webstore/components/ItemFilters.test.tsx`

Az `ItemFilters` webáruházban lévő szűrő chip sort teszteli.

Az `useSettings` modul szintjén van mock-olva, mert az `ItemFilters` a `SettingsContext`-ből olvas a témázáshoz. A factory egy rögzített settings objektumot ad vissza:

```typescript
vi.mock("@/pages/settings/SettingsContext", () => ({
  useSettings: () => ({
    settings: {
      useAnimations: true,
      useLiquidGlass: false,
      useDarkMode: false,
      language: "en",
      animationOverride: null,
    },
    updateSetting: vi.fn(),
  }),
}));
```

#### Teszt: az `onSelect` meghívása a kattintott opcióval

```typescript
const onSelect = vi.fn();

render(
  <ItemFilters
    label="Rarity"
    options={["All", "Rare", "Epic"]}
    selected="All"
    onSelect={onSelect}
  />
);

fireEvent.click(screen.getByText("Rare"));
expect(onSelect).toHaveBeenCalledWith("Rare");
```

Egy chip kattintásakor az `onSelect` a chip string értékével hívódik meg. A teszt ellenőrzi, hogy a callback a helyes argumentummal lett meghívva. Vizuális állapotot nem ellenőriz — csak a callback szerződést teszteli.

---

## Tesztelési minták ebben a kódbázisban

### Context injektálása valódi provider nélkül

Ha egy komponens függ egy React context-től, injektálj egy kontrollált értéket közvetlenül a `<ContextName.Provider value={...}>` segítségével a teszt fában. Ez elkerüli a valódi provider-eket, amelyek hálózati kéréseket küldhetnek, `localStorage`-ból olvashatnak, vagy más mellékhatásokkal járhatnak.

```typescript
<AuthContext.Provider value={{ isLoggedIn: true, isInitializing: false, ... }}>
  <ComponentUnderTest />
</AuthContext.Provider>
```

Az injektált értéknek ki kell elégítenie a teljes context típust. Biztosíts no-op függvényeket azokhoz a setterekhez, amelyeket a tesztelt komponens nem használ.

Alkalmazva: `RequireAuth.test.tsx`.

### Modul szintű függőségek mock-olása

Ha egy komponens olyan custom hook-ot hív meg, amely tárolóból olvas, hálózati kéréseket küld, vagy más mellékhatásokkal jár, mock-old az egész modult a `vi.mock("elérési/út/a/modulhoz", factory)` segítségével. A factory függvénynek szinkronnak kell lennie, és vissza kell adnia az összes nevesített exportot, amelyet a komponens importál:

```typescript
vi.mock("@/pages/settings/SettingsContext", () => ({
  useSettings: () => ({
    settings: { useLiquidGlass: false, useDarkMode: false, ... },
    updateSetting: vi.fn(),
  }),
}));
```

A `vi.mock` a Vitest által a modul tetejére van hoistolva, így a deklaráció sorrendje az importokhoz képest nem számít.

Alkalmazva: `ItemFilters.test.tsx`.

### Várt konzol kimenet elnyomása

A React bejelenti az error boundary-k által elkapott hibákat a konzolra. Ez rontja a teszt kimenetet. Kémlelj a `console.error`-ra és cseréld le no-op-ra, majd állítsd vissza az állítás után:

```typescript
const spy = vi.spyOn(console, "error").mockImplementation(() => {});
render(<ErrorBoundary><Crash /></ErrorBoundary>);
expect(screen.getByText("Something went wrong on this page.")).toBeInTheDocument();
spy.mockRestore();
```

Mindig a `mockRestore()`-t hívd — ne a `mockReset()`-et — ugyanabban a tesztben. A `mockRestore()` teljesen eltávolítja a kémlelőt; a `mockReset()` csak a hívási előzményt törli, de a mock-ot helyén hagyja, ami átszivárogathatja az elnyomást más tesztekbe.

Alkalmazva: az `ErrorBoundary.test.tsx` mindkét tesztjében.

### Routing a tesztekben

Használj `MemoryRouter`-t a `react-router-dom`-ból `BrowserRouter` helyett. Adj át `initialEntries`-t a kezdő URL kontrollálásához. Definiáld a route fát a teszten belül `Routes` és `Route` komponensekkel a teljes kontroll érdekében:

```typescript
<MemoryRouter initialEntries={["/app/releases"]}>
  <Routes>
    <Route path="/app/login" element={<div>Login Page</div>} />
    <Route element={<RequireAuth />}>
      <Route path="/app/releases" element={<div>Releases Page</div>} />
    </Route>
  </Routes>
</MemoryRouter>
```

A `BrowserRouter` a `window.location`-t használja és érzékeny a böngésző környezetre. A `MemoryRouter` memóriában tartja fenn a routing állapotot és teljesen determinisztikus.

Alkalmazva: `RequireAuth.test.tsx`.

### Esemény szimulálás

Használd a `fireEvent.click(elem)` függvényt az `@testing-library/react`-ből felhasználói kattintások szimulálásához. A `screen.getByText("...")` látható szöveg alapján lokalizálja az elemeket. Részesítsd előnyben a szöveg alapú lekérdezéseket a role alapúakkal szemben, ha a teszt célja egy callback szerződés ellenőrzése és nem az akadálymentesítési szemantika.

Olyan interakcióknál, amelyek DOM-ban látható állapot-átmeneteket váltanak ki, az eredő DOM állapotra állíts (`screen.getByText(...)`, `expect(elem).toBeInTheDocument()`), ne közvetlenül a komponens belső állapotára.

Alkalmazva: `ItemFilters.test.tsx`.

### CSS osztály jelenlétének ellenőrzése

Ha egy komponens CSS osztályon keresztül kommunikál állapotot (például egy betöltési spinner), a `document.querySelector` segítségével kérdezd le az osztályt:

```typescript
expect(document.querySelector(".animate-spin")).toBeInTheDocument();
```

Ezt a megközelítést csak akkor használd, ha nincs elérhető akadálymentesítési role vagy látható szöveg. Ha szöveg- vagy role-alapú lekérdezés lehetséges, azt részesítsd előnyben.

Alkalmazva: `RequireAuth.test.tsx` (spinner inicializálás közben).

---

## Manuális tesztelési forgatókönyvek

### Bejelentkezési oldal

**Helytelen hitelesítő adatok:** adj meg érvényes e-mail formátumot helytelen jelszóval. Az űrlap egy általános "Invalid credentials." hibát jelenít meg. Négy sikertelen kísérlet után az űrlap letiltódik és a beküldés gomb 30 másodperces visszaszámlálást mutat. A visszaszámlálás lejárta után az űrlap automatikusan újra engedélyeződik.

**Tiltott fiók:** jelentkezz be egy tiltott felhasználó hitelesítő adataival. A hibaüzenetnek jeleznie kell, hogy a tiltás ideiglenes-e (a lejárati datetime megjelenítésével) vagy végleges.

**Átirányítás megőrzése:** navigálj közvetlenül a `/app/releases` oldalra munkamenet nélkül. A bejelentkezési átirányítás az eredeti elérési utat a `location.state.from`-ba menti. Bejelentkezés után az alkalmazásnak az alapértelmezett bejelentkezés utáni cél helyett a `/app/releases`-re kell navigálnia.

### Regisztrációs oldal

**Biztonsági kulcs megjelenítése:** fejezz be egy regisztrációt. A biztonsági kulcsnak egyszer kell megjelennie, közvetlenül a regisztráció után. Navigálj el, majd vissza — a kulcsnak el kell tűnnie. Az UI-on nincs mód a visszaszerzésére.

**reCAPTCHA betöltési scope:** nyisd meg a böngésző hálózati eszközeit és navigálj oldalak között. A reCAPTCHA scriptnek és jelvénynek csak a `/app/signup` oldalon szabad megjelennie — a `/app/login`-on és a `/app/reset-password`-ön nem.

**Jelszó validáció:** ellenőrizd, hogy az űrlap validálja, hogy mindkét jelszómező egyezik-e, és hogy a jelszó megfelel-e a minimális hossz követelménynek, mielőtt beküldi. A hálózati lapon nem szabad megjelennie kérésnek a `/auth/signup` felé, ha a kliens-oldali validáció nem teljesül.

### Profilkép feltöltés

**5 MB feletti fájl:** próbálj meg 5 MB-nál nagyobb képet feltölteni. A kliensnek el kell utasítania bármilyen HTTP kérés küldése előtt és hiba toast-ot kell megjelenítenie. Ellenőrizd a hálózati lapon, hogy nem küldött-e kérést a `/api/profiles/:id/pfp` felé.

**Nem támogatott formátum:** tölts fel egy `.bmp` vagy `.tiff` fájlt. A kliens ellenőrzi a `file.type`-ot az `ACCEPTED_IMAGE_TYPES` listával szemben és visszautasítja kérés küldése előtt.

**Sikeres feltöltés:** sikeres feltöltés után az új képnek azonnal meg kell jelennie, oldalfrissítés nélkül. Ellenőrizd a profilkép `<img>` elem `src` attribútumát — tartalmaznia kell egy `?v=<timestamp>` query paramétert. Ugyanazon a fülön belüli profil-választó újratöltésekor az frissített képnek kell megjelennie ugyanazzal a verzió paraméterrel.

### Útvonal védelem

**Hitelesítetlen hozzáférés:** navigálj a `/app/releases`-re bejelentkezés nélkül. Átirányításnak kell történnie a `/app/login`-ra. Az eredeti URL-nek meg kell maradnia a `location.state.from`-ban, hogy a bejelentkezés utáni átirányítás visszatérjen a `/app/releases`-re.

**Nem admin hozzáférés az admin oldalhoz:** jelentkezz be sima felhasználóként és navigálj a `/app/admin`-ra. Az admin oldal komponens ellenőrzi az `isAdmin` értéket az `AuthContext`-ből, és `<NotFoundPage />`-t ad vissza, ha az értéke `false`. A 404 oldalnak kell megjelennie az admin panel tartalom helyett.

**Nem admin hozzáférés a debug oldalhoz:** ugyanez az ellenőrzés vonatkozik a `/app/debug`-ra. Sima felhasználóként bejelentkezve a 404 oldalnak kell megjelennie.

**Munkamenet lejárat működés közben:** várd meg, amíg egy session cookie lejár, miközben az alkalmazás nyitva van. Indíts bármilyen műveletet, amely nem auth API végpontot hív. A 401 response interceptornak az `apiClient.ts`-ben azonnal a `/app/login`-ra kell átirányítania. Ellenőrizd a hálózati lapon, hogy az átirányítás megtörténik-e és hogy a 401 után nem küldődnek-e további API kérések.

### Beállítások perzisztálása

Váltsd a nyelvet magyarra, kapcsold be a sötét módot és válaszd a Midnight témát. Zárd be a böngészőfület és nyisd meg újra ugyanazon az URL-en. Mindhárom beállításnak meg kell maradnia, mivel a `SettingsContext` a `localStorage["settings"]`-be szerializálja őket.

Nyisd meg ugyanazt a fiókot egy második böngészőfülön. Módosíts egy beállítást a második fülön. Az első fülnek nem szabad valós időben frissülnie — a beállítások csak mount-oláskor olvasódnak a tárolóból. Az első fül frissítése után a frissített beállítást kell mutatnia.

### Profil kiválasztás perzisztálása

Válassz ki egy profilt, navigálj el, jelentkezz ki, majd jelentkezz vissza. Ugyanannak a profilnak kell előre kiválasztva lennie a profil-választó képernyőn. Ennek oka, hogy a kiválasztott profil ID a `localStorage`-ban van tárolva, `userId`-val kulcsolva.

### React Query cache

Nyisd meg a React Query DevTools-t (a bal alsó sarokban lévő lebegő gomb, csak fejlesztői buildben látható). A profil lista betöltése után erősítsd meg, hogy a `["profiles", "byUserId", <id>]` cache bejegyzés létezik és nincs elavultként jelölve. Indíts egy profil frissítést — a bejegyzésnek invalidálódnia kell és újra le kell kérdezni. Kijelentkezés után erősítsd meg, hogy a cache teljesen üres (`queryClient.clear()` hívódik meg a sikeres kijelentkezéskor).

### Toast értesítések

Indíts egy sikeres műveletet (például mentsd el a profil nevet) és ellenőrizd, hogy egy zöld "success" toast jelenik meg és körülbelül 4 másodperc után automatikusan eltűnik. Indíts egy szerver-oldali hibát (küldj érvénytelen kérést a szervernek) és ellenőrizd, hogy egy piros "error" toast jelenik meg és szintén eltűnik. Ellenőrizd, hogy a toast értesítések nem maradnak halmozva véglegesen — mindegyik 4 másodperc után törlődik, a következő műveletektől függetlenül.

### Animáció és mozgás

**Animáció kapcsoló:** kapcsold ki az animáció kapcsolót a Beállításokban. Navigálj oldalak között — az átmeneteknek azonnaliaknak kell lenniük. A háttéranimációnak a helyén kell lefagynia. Kapcsold vissza — az átmeneteknek folytatódniuk kell.

**Debug sebességcsúszka:** a debug irányítópulton (csak admin fiókok számára) használd az animáció sebességcsúszkát. Állítsd a leglassabb beállításra (0,25×) és navigálj oldalak között — az összes `motion/react` átmenetnek láthatóan lassabbnak kell lennie. Állítsd a leggyorsabb beállításra (4×) — az átmeneteknek szinte azonnaliknak kell lenniük.

**Kompozit háttér:** a Beállításokban állítsd az animáció felülírást "Egyedi"-re és nyisd meg az Effekt Mix dialógust. Engedélyezz két vagy több animációt egyszerre. Mindkét háttérnek egymásra rétegezve kell renderelődnie. Tilts le egyes al-effekteket és ellenőrizd, hogy eltűnnek-e anélkül, hogy a másik animációt érintenék.

### Admin Panel

**Felhasználó keresés:** adj meg egy részleges e-mail címet a keresőmezőben. A felhasználói listának kliens-oldalon kell szűrnie, csak az egyező felhasználókat mutatva.

**Tiltási folyamat:** válassz ki egy felhasználót, válassz előre beállított tiltási időtartamot (pl. 1 hét), majd erősítsd meg. A felhasználó állapotának azonnal "Tiltott"-ra kell frissülnie a listában a lejárattal együtt. Ellenőrizd a felhasználó újbóli kiválasztásával — a tiltás részleteinek láthatónak kell lenniük.

**Tiltás feloldási folyamat:** válassz ki egy tiltott felhasználót és old fel a tiltást. Az állapotnak aktívra kell visszaállnia és a tiltás lejáratának el kell tűnnie.

**Szerepkör előléptetés:** léptesd elő egy felhasználót support-ra. A listában lévő szerepkör oszlopnak frissülnie kell. Jelentkezz be azzal a felhasználóval egy külön munkamenetben — a felhasználónak látnia kell az admin-fenntartott navigációs linkeket, ha admin-ra lett előléptetve.
