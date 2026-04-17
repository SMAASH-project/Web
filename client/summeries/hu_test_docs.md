# SMAASH — Tesztdokumentáció

> Ez a dokumentum a SMAASH kliens automatizált tesztjeit és kézi tesztelési forgatókönyveit mutatja be minden funkcionális területen. Az élszetes esetekre, helytelen bemenetekre és határértékekre összpontosít — azokra a helyzetekre, ahol a rendszernek akkor is helyesen kell viselkednie, ha a felhasználó nem a várt módon jár el.

---

## Automatizált tesztek futtatása

```bash
cd client
npm run test          # Minden teszt egyszeri futtatása
npm run test:watch    # Figyelő mód — fájlváltozásnál újrafut
npm run test:coverage # Lefedettségi riport
```

A tesztek **Vitest** + **@testing-library/react** alapon futnak. A konfigurációt a `vite.config.ts` fájl `test` kulcsa tartalmazza.

---

## Automatizált teszt lefedettség

### `ErrorBoundary.test.tsx`

A React error boundary komponenst teszteli (`src/components/ErrorBoundary.tsx`).

| Teszt | Mit ellenőriz |
|---|---|
| Fallback UI renderelése, ha a gyerek throw-ol | Ha egy gyerek komponens hibát dob, a boundary elkapja, és megjeleníti a "Something went wrong on this page." szöveget a hibaüzenettel együtt |
| Egyéni fallback renderelése, ha meg van adva | Ha `fallback` prop van megadva, a boundary azt rendereli az alapértelmezett üzenet helyett |

Mindkét teszt elnémítja a `console.error`-t a renderelés alatt, mivel a React alapértelmezés szerint naplózza az elkapott hibákat.

### `RequireAuth.test.tsx`

Az `/app/*` route-okat védő route guard komponenst teszteli (`src/components/RequireAuth.tsx`).

| Teszt | Mit ellenőriz |
|---|---|
| Védett route renderelése hitelesítéskor | Ha `AuthContext.isLoggedIn` értéke `true`, a védett route normálisan renderelődik |
| Átirányítás loginra hitelesítés nélkül | Ha `isLoggedIn` értéke `false` és `isInitializing` értéke `false`, a védett route-ra navigálás `/app/login`-ra irányít |
| Betöltési állapot auth inicializálás közben | Ha `isInitializing` értéke `true`, betöltési animáció jelenik meg átirányítás helyett — ez megakadályozza a villanást, mielőtt az auth ellenőrzés befejeződik |

### `ItemFilters.test.tsx`

A Webstore szűrőchip komponensét teszteli (`src/pages/webstore/components/ItemFilters.tsx`).

| Teszt | Mit ellenőriz |
|---|---|
| onSelect meghívása a kattintott opcióval | Szűrő opció kattintásakor az `onSelect` callback az opció pontos string értékével hívódik meg |

Az `useSettings` kontextust rögzített beállítás objektummal mockolják, mivel a teszt csak a callback viselkedést ellenőrzi, nem a témázást.

---

## Kézi tesztelési forgatókönyvek

### Regisztráció (`/app/signup`)

| Forgatókönyv | Bemenet | Várt viselkedés |
|---|---|---|
| Üres email mező | Küldés üres email mezővel | HTML5 form validáció megakadályozza a küldést; a böngésző "töltsd ki ezt a mezőt" üzenetet jelenít meg |
| Érvénytelen email formátum | `"nemememail"` vagy `"felhasznalo@"` | HTML5 `type="email"` validáció megakadályozza a küldést; a böngésző formátum hibát jelez |
| Üres jelszó | Küldés jelszó nélkül | HTML5 `required` megakadályozza a küldést |
| Jelszó túl rövid | 1–7 karakter hosszú jelszó | Kliens oldali hiba jelenik meg API hívás előtt: "A jelszó túl rövid" (vagy a megfelelő fordítás); az form nem küldi el |
| Jelszavak nem egyeznek | Jelszó: `"jelszo123"`, Megerősítés: `"mas"` | Kliens oldali hiba: "A jelszavak nem egyeznek"; a form nem küldi el |
| Javított jelszó egyezés | A megerősítő jelszó javítása az egyezőre | A hiba azonnal eltűnik a gépeléskor; a form normálisan küldi el |
| Már foglalt email cím | Már regisztrált email a rendszerben | A szerver hibát ad vissza; az üzenet kinyerve és megjelenítve a form hibajelzőjében |
| Érvényes regisztráció | Minden mező helyes, egyedi email, jelszó ≥ 8 karakter | Sikeres: átirányítás `/app/login`-ra |

### Bejelentkezés (`/app/login`)

| Forgatókönyv | Bemenet | Várt viselkedés |
|---|---|---|
| Üres mezők | Küldés üres email vagy jelszó mezővel | HTML5 `required` megakadályozza a küldést |
| Érvénytelen email formátum | `"nemememail"` | HTML5 `type="email"` validáció megakadályozza a küldést |
| Rossz hitelesítő adatok (1–4. kísérlet) | Érvényes email formátum, rossz jelszó | Homályos hiba: "Érvénytelen hitelesítő adatok" (soha nem árulja el, melyik mező rossz); fennmaradó kísérletek száma jelenik meg: "X kísérlet maradt a zárolás előtt" |
| Rossz hitelesítő adatok (5. kísérlet) | Bármi rossz jelszó 4 kudarcot követően | 30 másodperces kliens oldali zárolás aktiválódik; form mezők és küldés gomb letiltva; a gomb felirata `Locked (30s)` visszaszámlálással |
| Zárolás alatt | Bármilyen bevitel | A küldés teljesen blokkolva; a visszaszámlálás a gomb feliratán folytatódik |
| Zárolás lejár | 30 másodperc várakozás | A számláló nullára ér, a form újra engedélyezetté válik, a kísérletszámláló nullázódik |
| Tiltott fiók (ideiglenes tiltás) | Helyes hitelesítő adatok tiltott felhasználóhoz | Hiba: "Your account is banned until [dátum]." — a tiltás lejárati dátuma megjelenik |
| Tiltott fiók (végleges tiltás) | Helyes hitelesítő adatok véglegesen tiltott felhasználóhoz | Hiba: "Your account has been permanently banned." |
| Érvényes hitelesítő adatok | Helyes email és jelszó | Átirányítás `/app/profile-selector`-ra; ha védett oldalról érkeztek, visszairányítás az eredeti céloldalra |

### Jelszó-visszaállítás (`/app/reset-password`)

| Forgatókönyv | Bemenet | Várt viselkedés |
|---|---|---|
| Érvénytelen email formátum | `"nemememail"` | HTML5 `type="email"` validáció megakadályozza a küldést |
| Üres email | Küldés email megadása nélkül | HTML5 `required` megakadályozza a küldést |
| Bármilyen érvényes email elküldve | Bármilyen helyesen formázott email | A form sikeresen elküld; tájékoztató üzenet jelenik meg: a funkció nem elérhető (a jelszó-visszaállítás nincs bekötve backend végponthoz); a form mező és a gomb letiltódnak |

> **Megjegyzés:** A jelszó-visszaállítási folyamat csak UI placeholder. A küldés nem indít el semmilyen emailt vagy backend kérést. A gomb az első küldést követően véglegesen letiltódik, hogy megakadályozza az ismételt kísérleteket.

### Profil szerkesztése — Edit Sheet (`/app/profile`)

A profil szerkesztő panel a Profile oldalon a "Profil szerkesztése" gombra kattintva nyílik meg.

| Forgatókönyv | Bemenet | Várt viselkedés |
|---|---|---|
| Nincs változtatás | Panel megnyitása, semmi sem módosítva | A Mentés gomb letiltott; kattintás nem tesz semmit |
| Megjelenési név a határon | Pontosan 20 karakter bevitele | Az input elfogadja a 20. karaktert; a 21. karaktert a `maxLength` visszautasítja hiba nélkül |
| Megjelenési név a határon túl | Több mint 20 karakter gépelésének kísérlete | Az input csendesen leáll 20 karakternél; nincs hibaüzenet |
| Email a határon túl | Több mint 30 karakter gépelésének kísérlete | Az input csendesen leáll 30 karakternél; nincs hibaüzenet |
| Érvénytelen email formátum | `"nemememail"` az email mezőbe | A mező `type="email"` attribútummal rendelkezik — a böngésző érvényesíthet formátumot; a szerver mentéskor visszautasítja, ha a formátum helytelen |
| Már foglalt email cím | Email módosítása másik fiók által használt email-re | A szerver hibát ad vissza; hibaüzenet jelenik meg a panel piros figyelmeztető területén |
| Érvényes változtatások | Megjelenési név vagy email módosítása új érvényes értékekre | Mentés gomb engedélyezetté válik; kattintásra mindkét módosított mező párhuzamosan mentődik; rövid sikerindikátor jelenik meg; a panel automatikusan bezárul ~900ms után |
| Jelszó mező | Gépelési kísérlet a jelszó mezőbe | A mező letiltott és csak olvasható; az alatta lévő link a `/app/reset-password` oldalra navigál |

### Webstore (`/app/webstore`)

| Forgatókönyv | Bemenet | Várt viselkedés |
|---|---|---|
| A tárgy többe kerül, mint a felhasználó egyenlege | Tárgyak böngészése ahol `item.price > userCoins` | A Vásárlás gomb "Nem engedheted meg" feliratot mutat és le van tiltva; az ár pirosban jelenik meg; az érmék ikon pirosra vált |
| A tárgy már a tulajdonban van | Saját tárgy megtekintése | A Vásárlás gomb helyén "Tulajdonolt" jelzés jelenik meg (zöld pipa + "Tulajdonolt" szöveg); vásárlási művelet nem lehetséges |
| Vásárlás folyamatban | Kattintás vásárlásra megfizethető, nem saját tárgyra | A gomb forgó betöltési animációt és "Feloldás..." szöveget mutat; letiltva amíg a mutáció függőben van |
| Szűrés ritkaság szerint | "Rare" kiválasztása a ritkaság szűrőből | Csak Rare tárgyak jelennek meg; a többi elrejtve |
| Szűrés harcstílus szerint | "Melee" kiválasztása | Csak Melee tárgyak jelennek meg |
| Szűrés nem ad eredményt | Olyan szűrők alkalmazása, amelyek nem illeszkednek semmire | Üres állapot jelenik meg |
| Keresés név szerint | Szöveg gépelése a keresőmezőbe | A tárgyak valós időben szűrődnek gépelés közben |
| Admin tárgykezelés admin szerepkör nélkül | Bejelentkezés nem-admin felhasználóként | A szerkesztés és törlés gombok nem renderelődnek a tárgy kártyákon (az `AuthContext` `isAdmin` értéke szabályozza) |

### Admin Panel (`/app/admin`)

Hozzáféréshez admin szerepkör szükséges; nem-admin felhasználók a route szinten irányítódnak el.

| Forgatókönyv | Bemenet | Várt viselkedés |
|---|---|---|
| Nem létező felhasználó keresése | Olyan nevet gépelni, amellyel nincs felhasználó | Üres felhasználólista; nincs "nincs találat" hibaüzenet — a lista egyszerűen üres |
| Tiltás ok megadása nélkül | Tiltás alkalmazása indoklás megadása nélkül | A tiltás engedélyezett; az ok opcionális |
| Már tiltott felhasználó tiltása | Tiltás alkalmazásának kísérlete már tiltott felhasználóra | A UI az aktuális tiltás lejáratát mutatja a UserDetail panelen; új tiltás alkalmazható, amely felülírja a régit |
| Felhasználó előléptetése adminná | Kattintás az Előléptetés gombra nem-admin felhasználónál | A felhasználó szerepköre adminra frissül; a szerepkör jelvény frissül a UserDetail panelen |
| Admin visszasorolása | Kattintás a Visszasorolás gombra admin felhasználónál | A szerepkör frissül; az admin hozzáférés eltávolítódik a következő bejelentkezéstől |

### Gallery — OST lejátszó (`/app/gallery` → OST tab)

| Forgatókönyv | Bemenet | Várt viselkedés |
|---|---|---|
| Seekbar húzása az elejére | A lejátszási seekbar teljes mértékű húzása balra | A lejátszási pozíció 0:00-ra ugrik |
| Seekbar húzása a végére | A lejátszási seekbar teljes mértékű húzása jobbra | A lejátszási pozíció a szám teljes időtartamára ugrik |
| Seekbar húzása az elemen kívülre | Húzás indítása, majd az egér mozgatása a seekbar sávon kívülre | A `setPointerCapture` fenntartja a húzást; a pozíció frissül az egér elengedéséig |
| Hangerő nullán | A hangerő csúszka teljes húzása balra | A hangerő 0-ra ér; néma ikon jelenik meg |
| Hangerő maximumon | A hangerő csúszka teljes húzása jobbra | A hangerő 1.0-ra ér (teljes hangerő) |
| Némítás kapcsoló | A hangszóró/néma ikonra kattintás | A hang némítódik vagy visszakapcsolódik; az ikon a hangszóró variánsok között vált |
| Számra kattintás a listában | Bármely szám nevére kattintás | A szám azonnal megváltozik; a lejátszás az új szám elejéről indul |
| Lejátszás/szünet kapcsoló | Lejátszás gombra kattintás, majd szünet | A hang elindul és megáll helyesen; az ikon vált lejátszás és szünet között |

### Route-védelem

| Forgatókönyv | Feltétel | Várt viselkedés |
|---|---|---|
| Védett route elérése session nélkül | Navigálás bármely `/app/*` route-ra bejelentkezés nélkül | Átirányítás `/app/login`-ra; az eredeti URL `location.state.from`-ban tárolódik, hogy bejelentkezés után visszanavigáljanak |
| Admin route elérése normál felhasználóként | Navigálás `/app/admin`-ra vagy `/app/debug`-ra nem-admin felhasználóként | Elirányítás; az oldal tartalma soha nem renderelődik |
| Auth ellenőrzés folyamatban | Az oldal betölt, miközben `AuthContext.isInitializing` értéke `true` | Betöltési animáció jelenik meg átirányítás helyett; megakadályozza az idő előtti átirányítást a session megerősítése előtt |
| Session lejár munkamenet közben | Bármilyen API kérés a session cookie lejárta után | Az `apiClient` 401 interceptora elsül; automatikus átirányítás `/app/login`-ra |

### Beállítások megőrzése

| Forgatókönyv | Művelet | Várt viselkedés |
|---|---|---|
| Frissítés témaváltás után | Váltás sötét módba, oldal frissítése | A sötét mód megmarad (`localStorage`-ban tárolva a `settings` kulcs alatt) |
| Frissítés szín módosítása után | Egyéni gradiens színek beállítása, frissítés | A színek megmaradnak (`color-settings` alatt tárolva) |
| Eszközváltás / localStorage törlése | Bejelentkezés más böngészőből vagy localStorage törlése | A beállítások visszaállnak az alapértelmezettekre; a témát és a színeket újra be kell állítani |
| Több lap | Az alkalmazás megnyitása két lapon, beállítások megváltoztatása az egyiken | A beállítás változás az adott lap localStorage írására korlátozódik; a másik lap nem frissül valós időben |

---

## Vitest konfiguráció

A tesztek `jsdom`-ot használnak teszt környezetként (a `vite.config.ts`-ben konfigurálva). A globális teszt segédprogramok (`describe`, `it`, `expect`, `vi`) importok nélkül elérhetők. Az `@testing-library/jest-dom` matcherek (pl. `toBeInTheDocument`) a Vitest setup fájljában vannak beállítva.

Új tesztfájl hozzáadásához hozz létre egy `.test.tsx` (vagy `.test.ts`) fájlt az `src/` bármely pontján. A Vitest automatikusan felismeri.
