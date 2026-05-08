## Kalkulačka — realističtější data + poctivější popisky

Soubor: `src/components/CalculatorSection.tsx` (+ drobně `src/i18n/translations.ts`).

### 1. Slabší sezóna: nepropadat obsazeností, propadat cenou

Logika: dobrý operátor drží obsazenost vysoko i v listopadu–březnu, ale **cena za noc** klesá. Proto upravit `seasonAdjust`:

| Sezóna | ADR (dnes → nově) | occDelta (dnes → nově) |
|---|---|---|
| Celý rok | 1.08 → **1.05** | +0.03 → **+0.02** |
| Hlavní sezóna | 1.45 → **1.40** | +0.10 → **+0.08** |
| Slabší sezóna | 0.60 → **0.72** | −0.15 → **−0.03** |
| Vánoce & NY | 1.75 (beze změny) | +0.12 (beze změny) |

Navíc zvednout dolní clamp obsazenosti z `0.40` na `0.78` — odráží realitu majitele s dobře vedeným bytem (min ~80–85 %).

### 2. Počet úklidů podle obsazenosti

Dnes pevně `CLEANINGS_PER_MONTH = 10` → ve slabší sezóně nesmyslně drahé.

Změna: úklidy = počet pobytů ≈ `obsazené noci / průměrná délka pobytu`.

```text
avgStayNights = 3            // přidat do sizes (1+kk a 2+kk = 3, 3+kk = 3.5, 4+kk = 4)
cleanings = round(occupancy × 30 / avgStayNights)
cleaningCost = cleanings × cleaningPrice
```

V breakdownu zobrazit dynamický počet: „Úklid (Nx měs.)".

### 3. Poctivější label čistého výnosu

Dnes „Čistý výnos do kapsy" — ale není, majitel ještě platí naši provizi a energie. Marketingově silné a zároveň pravdivé řešení:

- Hlavní velký řádek přejmenovat z **„Čistý výnos do kapsy"** na **„Výnos pro majitele"** s podtitulkem *„po platformě, úklidu a drobné drogerii"*.
- Pod číslo přidat tenkou poznámku: *„Bez naší provize a energií, které hradí majitel zvlášť."*
- V breakdownu nahradit větu `calc_excluded_note` jasnějším: *„V kalkulaci nejsou: naše provize za správu a energie bytu — ty hradí majitel."*

### 4. Texty (CS + VI)

- `calc_net` CS: „Výnos pro majitele" / VI: „Doanh thu cho chủ nhà"
- nový klíč `calc_net_sub` CS: „po platformě, úklidu a drogerii" / VI: „sau phí nền tảng, dọn dẹp, vật tư"
- aktualizace `calc_excluded_note` podle bodu 3
- `calc_cleaning` zůstává klíč, ale label se renderuje dynamicky s počtem (`Úklid (${n}× měs.)`)

### Co se NEMĚNÍ

- ADR podle dispozice / lokality, extras, LTR tabulka, provize platforem 15,5 %, supplies, ratio vs. dlouhodobý pronájem.

### Dopad

Pro Prahu 2, 2+kk, slabší sezónu: obsazenost ~80 % místo 68 %, ADR mírně níž, úklidů ~8 místo 10. Výsledný „Výnos pro majitele" ve slabé sezóně **vyšší a věrohodnější**, popisek nelže o tom, co majitel reálně dostane.