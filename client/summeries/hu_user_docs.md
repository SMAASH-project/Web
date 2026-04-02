# SMAASH Kliens — Felhasználói Dokumentáció

Frissítve: 2026-04-02

## 1) Kezdés

1. Nyisd meg az alkalmazást és jelentkezz be a `/app/login` oldalon.
2. Ha nincs fiókod, használd a `/app/signup` oldalt.
3. Bejelentkezés után az app fő felületére kerülsz.

## 2) Fő navigáció

Felül elérhető menük:

- Releases
- News
- Webstore
- Leaderboard
- Gallery
- Profile
- Profile Selector
- Settings

Admin felhasználók látnak **Admin** menüt is.
Support/admin felhasználók látnak **Debug** menüt is.

## 3) Profilválasztó

- Aktív játékprofilt lehet kiválasztani.
- Új profil a hozzáadás párbeszédablakkal hozható létre.
- A kiválasztás fiókonként mentődik.

## 4) Profil oldal

- Avatar, megjelenített név, coin mennyiség és alap statisztikák láthatók.
- Szerkesztő panelben módosítható:
  - megjelenített név
  - e-mail cím
- Jelszó módosítás itt backend támogatástól függően letiltott lehet.

## 5) Webstore

- Itemek böngészése típus/ritkaság/keresés alapján.
- Vásárlás elérhető megfelelő jogosultság és profil esetén.
- A coin érték az aktív profilból érkezik.

## 6) News

- Hírek olvasása.
- Szűrés és keresés támogatott.
- Admin jogosultsággal hír létrehozás/szerkesztés/törlés is elérhető.

## 7) Releases

- Release kártyák böngészése.
- Platform szerinti szűrés és keresés.
- Letöltés csak akkor aktív, ha az adott platformhoz van URL.

## 8) Leaderboard

Fő statisztika blokkok:

- győzelmi ranglista
- legaktívabb játékosok
- legtöbbet játszott pályák
- legtöbbet vásárolt itemek

Lassú betöltés esetén jellemzően a statisztikai backend lekérdezések futási ideje a szűk keresztmetszet.

## 9) Gallery

- Képi/hang/média tartalom böngészése.
- Előre/hátra vezérlők elérhetők ahol támogatott.

## 10) Settings

Itt módosítható:

- nyelv (angol/magyar)
- megjelenítés (dark/light, liquid glass)
- animációs működés
- téma színek és effektusok

## 11) Debug oldal (support/admin)

Tabok:

- System: futásidejű diagnosztika
- Cache: query cache megtekintés és invalidálás
- Endpoints: kézi API hívások
- Game Data: domain adatok áttekintése
- Sight: vizuális debug kapcsolók

## 12) Hibaelhárítás

- Hosszabb inaktivitás után hibáknál jelentkezz be újra.
- Elavult adatoknál frissíts oldalt vagy invalidáld a cache-t.
- Profilhoz kötött eltérésnél válaszd ki újra az aktív profilt.
