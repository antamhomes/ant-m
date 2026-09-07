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

(prázdné — před prvním voláním)
