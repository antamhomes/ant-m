# Předregistrace: Dejvice

Zapsáno **2026-09-07 17:27 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Dejvice

Praha 6 je jediný měřený okres bez jediné čtvrti (fixture „okres bez
čtvrti" v `calc-ctvrt-optional.test.tsx` na ní sedí — po integraci se
posune dál, viz Postup). GEO registr má `praha6/dejvice` (LTR +2,34 %,
n=15 — malý vzorek, ale nad prahem shrinkage), jediný kontext →
`parents: ["praha6"]`. Bubeneč (P6/P7) a Břevnov jsou další kandidáti,
Dejvice jsou nejcentrálnější a s nejvyšší nájemní prémií.

Pořadí dnes (rozhodnutí člověka 7. 9.): Dejvice → Košíře → Vysočany,
vždy s ≥ 4 pokusy v rezervě, nová geometrie = STOP po prvním pásmu.

## Výchozí stav (Praha 6 okres, `MARKET_STR`)

| | ADR | RevPAR | occ | nMean | nMin | v modelu |
|---|---|---|---|---|---|---|
| 1BR | 1 873 | 1 286,6 | 68,2 % | 155 | 144 | měřené |
| 2BR | 2 913 | 1 878,9 | 63,8 % | 83 | 79 | měřené |
| 3BR | (5 773) | (3 834,7) | | 10 | 9 | **není** (odvozeno 2BR × 1,481 = 2 782,7) |

Okresní `2BR/1BR = 1,460` (nízko proti modelu 1,567). Sezóny P6 jsou
nejplošší z měřených (Vánoce 1,322) — letiště, ne centrum.

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P6 sám 1,460.

## Očekávaný vzorek a VÁHA — S POKOROU

P6 STR je rozptýlené (Dejvice, Bubeneč, Střešovice, Břevnov, Ruzyně
u letiště). Podíl Dejvic odhad **30–55 %** u 1BR → bodový odhad
**1BR ~65**, nízká důvěra.

| 1BR | 2BR | 3BR |
|---|---|---|
| 45–90 → w 0,5 nebo 0,75 | 20–40 → w 0 nebo 0,5 | 2–6 → w 0 |

Pravděpodobně první čtvrť, kde 1BR nedosáhne na 0,75 — to je informace,
ne selhání. Integruje se, co se naměří, s váhou podle pravidla.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,75 → prověřit.
2. `3BR/1BR` mimo 1,20–3,20 → při n < 10 jen zaznamenat.
3. `active_listings` 1BR nad ~155 (víc než okres) → polygon širší než
   k.ú. Dejvice → STOP, geometrie.
4. Podíl na P6 (1BR) mimo **20–65 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR POD okresem P6 → v rozporu s nájemní prémií +2,3 % a
   centrální polohou (letištní Ruzyně by měla táhnout okres dolů, ne
   nahoru); zaznamenat, prověřit geometrii.

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Dejvice, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po znaku.
Label může být „Dejvice official boundary" nebo anglická varianta. 2BR
a 3BR v téže session s výslovně pojmenovanou hranicí, label + zdroj
ověřit u každého pásma zvlášť.

## Postup

SOP beze změny (raw před transformací, jen `data[]`, okno
`2025_08..2026_07`, kalendářní pravidlo, `basis: measured`, žádný
poměrový dopočet, `pl-import` bez `--allow-uncommitted` až po commitu
artefaktu). Import `--geo praha6_dejvice --level ctvrt --source-geometry
dejvice --parents praha6 --ltr-context praha6/dejvice`. Integrace do
`MARKET_CTVRT.dejvice` s NEZMĚNĚNÝM modelem; regrese: 0 změn dřívějších
kombinací, nové stavy jen `praha6|dejvice` a `praha6|-` (Ostatní =
okres praha6). Fixture „okres bez čtvrti" se posune z praha6 na
praha10 (dokud P10 není integrovaná) — záměr testu beze změny.

Kvóta: okno 7. 9. 2026 (ukotveno ~17:10 UTC), po Vršovicích 3 pokusy,
zbývá 17; Dejvice = pokusy 4–6, začíná se jen s ≥ 5, končí s rezervou ≥ 4.

## Log pokusů

### Pokus 1 (2026-09-07 17:29 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Dejvice, Prague, official OpenStreetMap boundary,
1-bedroom. For each month from August 2025 through July 2026 give: …`
**4. pokus okna** (ukotveno ~17:10 UTC 7. 9.), zbývá 16.

- `selected_geometry_label`: **`Dejvice official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Dejvice, Prague` · session `lg_sess_amstkVnxh3ldMM7wodwhIfb1Fy8AW6Nx`
- přišlo **13 měsíců** (`2026_08` navíc) → vyřazen kalendářním pravidlem,
  obálka drží všech 13, `excluded_rows` = 1; v okně 12/12, identity sedí;
  raw `99af425e…`

| | P6 okres | zbytek P6 bez Dejvic | Dejvice | poměr k P6 |
|---|---|---|---|---|
| n (průměr) | 154,5 | 120,9 | 33,6 → 34 | **0,218** (0,20–0,23) |
| n (min) | 144 | | 32 | |
| RevPAR | 1 286,6 | 1 236,5 | 1 468,5 | **1,141** (1,06–1,42); k zbytku 1,188 |
| ADR | 1 873 | | 2 029 | 1,083 |
| occ | 68,2 % | | 71,8 % | |

Spouštěče: #3 ne (34 ≪ 155) · #4 ne, ale **těsně** (21,8 % při dolní mezi
20 %) · #5 ne (rozptyl 3 p. b.) · #6 ne — Dejvice **+14 % nad okresem**,
ve směru nájemní prémie. Bodový odhad n ~65 byl dvojnásobně optimistický:
Dejvice mají jen 34 nabídek 1BR → váha **0,5** (nMin 32 < 50 →
`reliable: false`). P6 STR je rozptýlenější, než předregistrace čekala
— zbytek okresu (n ≈ 121) sedí na 1 237.

Poznámka bez akce: k.ú. Dejvice je velké a 34 nabídek 1BR je málo na
„nejcentrálnější čtvrť P6"; buď je P6 opravdu STR periferie, nebo část
dejvické nabídky sedí v Bubenči (P6/P7, sdílená geometrie). Nic
z toho není spouštěč pro geometrii (label sedí, podíl stabilní).

Schválení geometrie: **SCHVÁLENO člověkem 7. 9. 2026** znak po znaku
(`Dejvice official boundary` + `openstreetmap`); pokyn: „let the frozen
weighting handle the thin samples".

### Pokusy 2 a 3 (2026-09-07 17:37 / 17:40 UTC): 2BR a 3BR ÚSPĚCH

Táž session, hranice pojmenovaná v každém dotazu, label + zdroj ověřeny
u obou pásem zvlášť. 2BR 12/12; 3BR přišel jako 13 měsíců (`2026_08`
navíc, vyřazen kalendářním pravidlem — próza odpovědi průměruje 13
měsíců, `data[]` v okně 12; próza není autorita). Identity sedí, tabulky
v próze proti `data[]` bez rozdílu. Pokusy okna: 6, zbývá 14.

| pásmo | ADR | RevPAR | occ | nMean | nMin | podíl na P6 | RevPAR/P6 | váha | raw |
|---|---|---|---|---|---|---|---|---|---|
| 1BR | 2 029 | 1 468,5 | 71,8 % | 34 | 32 | 0,218 (0,20–0,23) | **1,141** | **0,5** | 99af425e… |
| 2BR | 2 955 | 2 246,6 | 75,1 % | 19 | 18 | 0,232 (0,21–0,25) | **1,196** (1,12–1,36) | **0** | 38be2c38… |
| 3BR | 4 033 | 3 232,4 | 80,0 % | 2 | 1 | — | 1,162 k odvozenému 2 782,7 | **0** | a7f4b862… |

Spouštěče: #1 `2BR/1BR = 1,530` v pásmu (model 1,567; okres P6 1,460).
#2 `3BR/1BR = 2,201` v pásmu, n = 2 → jen záznam. #3–#6 ne.

Dopad na integraci (pravidla beze změny, `parents: ["praha6"]`):
- 1BR w 0,5 → `praha6|dejvice` 1BR = 0,5·1 468,5 + 0,5·1 286,6 =
  **1 377,6** (+7 % nad okresem ve výsledku), `derived: false`.
- 2BR nMean 19 < 25 → w 0 → okres beze změny (1 878,9), přestože přímé
  měření je +20 % nad ním. Přesně to má pravidlo dělat: 19 nabídek.
- 3BR w 0 → odvozený P6 3BR (2 782,7); přímé měření 3 232 při n = 2 je
  o 16 % výš — pátý okres se vzorcem „tenké 3BR nad odvozeným" (P3, P8,
  P7, P4, P6), záznam do otevřené položky, pravidlo beze změny.
- Nové stavy regrese: `praha6|dejvice`, `praha6|-` (Ostatní = okres).
  Fixture „okres bez čtvrti" → praha10.

Poznámka bez akce: Dejvice jsou první čtvrť, kde je lokální efekt
(+14 % / +20 %) větší než to, co váha pustí do výsledku (+7 % / 0 %).
Je to důsledek pravidla o vzorku, ne chyba dat; kdyby se někdy měnilo,
je tohle referenční případ.
