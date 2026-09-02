# Autorun čtvrťového pipeline

Platí od 2. 9. 2026. **Automatizuje se mechanika, ne úsudek.**

Čte se spolu s `docs/pricelabs-pull.md` (SOP, §14 pin geometrie,
§15 sdílená geometrie, §16 kvóta, §17 dávkování) a
`docs/pricelabs-acceptance.md` (přejímka 1–21).

## Co je ZMRAZENÉ

Ekonomika, prahy, `ctvrtWeight` a shrinkage, geografická sémantika,
vzorce, UI, pravidla přejímky. **Nesahat**, dokud skutečně nový režim
selhání neznemožní bezpečně pokračovat. Cíl je rozšířit MĚŘENÉ pokrytí
čtvrtí, ne vylepšovat nebo překalibrovat kalkulačku.

## Fronta

1. **Žižkov** (praha3) — předregistrace `data/_partial-nedokonceno/PREREGISTRACE.zizkov.md` ZMRAZENÁ
2. **Smíchov** (praha5)
3. **Karlín** (praha8) — jen pokud zbývá rozpočet

Každá další čtvrť potřebuje **vlastní předregistraci PŘED prvním
voláním** — modelem implikované poměry, okresní kontext, očekávaný
vzorek a váha, spouštěče. Zapisuje se do
`data/_partial-nedokonceno/PREREGISTRACE.<slug>.md`.

## Postup na jednu čtvrť

1. Předregistrace existuje a je zmrazená.
2. První úspěšné pásmo dá **kandidátní geometrii**.
3. **Není-li ten přesný řetězec už schválený člověkem → STOP a zeptat se.**
   Žádné odvozování ze vzoru pojmenování. Nové Město se 2. 9. tiše
   vyřešilo na `Prague Main Station circle (15 km)`, zatímco próza
   trh dál nazývala Novým Městem.
4. Po schválení: táž session, kde to jde, a **v každém dotazu výslovně
   pojmenovat schválenou hranici** (referenční „same geography already
   selected in this session" u Vinohrad vrátilo `data:null`).
5. U **každého** pásma zvlášť ověřit `selected_geometry_label`
   i `selected_geometry_source`.
6. Jen strukturovaná `data[]`. Próza nikdy — zmýlila se 4× za jediný den.
7. Syrová odpověď se zachytí `pl-raw.mjs` PŘED transformací.
8. Okno z `pullWindow()`. Nadmnožina se ořízne kalendářním pravidlem,
   vyřazené řádky zůstávají v syrové provenienci a v `excluded_rows`.
9. `basis: measured`. **Nikdy** nenahrazovat pásmo poměrovým rozpadem.
10. Plná přejímka `pl-import.mjs`.
11. Import **bez `--allow-uncommitted`** teprve po commitu artefaktu.
12. Integrace do `MARKET_CTVRT` s NEZMĚNĚNÝM modelem.
13. Diferenciální regrese: **0 změněných dřívějších kombinací.**
14. Testy a build.
15. Čistý commit; cizí změny ve worktree se nepřimíchávají.

## Kvóta

Rozpočet **20 pokusů**, okno ukotvené k prvnímu volání. **Každý pokus
se počítá**, i prázdná obálka, `data:null` a 429. Eviduje se `pokusů`,
ne stažených pásem. **Novou čtvrť nezačínat pod 4 zbývajícími dotazy.**
Radši nechat kvótu nevyužitou než vyrobit další rozdělanou čtvrť.

## Automatické STOPy — kolem těchto se neimprovizuje

- neschválená nebo nová geometrie
- neshoda geometrie
- chybějící požadovaný měsíc nebo duplicita uvnitř okna
- selhání syrové provenience nebo rekonciliace
- přímo měřené pásmo nedostupné i po povoleném retry
- neúspěch přejímky
- konflikt v databázi / ochrana proti přepisu historie
- ZMĚNA jakékoli dřívější kombinace kalkulačky
- selhání testů nebo buildu způsobené kódem
- jakýkoli skutečně nový režim selhání mimo SOP

Známá přechodná selhání (prázdná obálka, `data:null`) **nejsou** nový
režim. Jeden identický retry tam, kde ho SOP povoluje; počítá se do
kvóty. **Žádné cyklení přes různé formulace.**

## Zákaz

**Nesahat na listingy ani portfolio majitele.** Žádné
`get_listings`, `get_listing_data`, comp sety, Market Dashboard
postavený na vlastních listingech. Jen `market_research` na úrovni trhu.

## Hlášení

Po každé dokončené čtvrti. K pokračování na další čtvrť **není potřeba
souhlas**, pokud jsou všechny brány zelené a geometrie už schválená.
**Schválení každé nové geometrie člověkem zůstává povinné** — to je
jediná věc, která brání plně bezobslužnému běhu, a ruší se nesmí.
