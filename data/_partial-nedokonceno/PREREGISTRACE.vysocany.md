# Předregistrace: Vysočany

Zapsáno **2026-09-07 17:46 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Vysočany — a co od nich čekat POCTIVĚ

Praha 9 má jediný čtvrťový kontext, Libeň (sdílená s P8), a okresní 2BR
i 3BR jsou odvozené (2BR n ≈ 24, 3BR n ≈ 7). GEO registr má
`praha9/vysocany` (LTR +0,82 %, n=37), jediný kontext →
`parents: ["praha9"]`. Poslední z dnešního pořadí (Dejvice → Košíře →
Vysočany, rozhodnutí člověka 7. 9.).

**Nečekej, že Vysočany P9 vyléčí.** Libeň sama má 1BR n ≈ 83, tedy VÍC
než celý okres P9 (76) — většina libeňské nabídky leží v P8. Zbytek P9
mimo libeňský díl (Vysočany, Prosek, Hloubětín, Černý Most, Střížkov…)
je pár desítek 1BR. Odvozené okresní 2BR/3BR P9 zůstanou odvozené
i po Vysočanech: čtvrťové 2BR s n < 25 má váhu 0 a okresní pásmo se
čtvrtí nemění. Vysočany dají P9 druhý lokální kontext pro 1BR, nic víc.

## Výchozí stav (Praha 9 okres, `MARKET_STR`; Libeň v `MARKET_CTVRT`)

| | P9 ADR / RevPAR / nMean / nMin | v modelu | Libeň RevPAR / n |
|---|---|---|---|
| 1BR | 2 065 / 1 363,9 / 76 / 64 | měřené | 1 400,4 / 83 |
| 2BR | (2 920 / 1 903,5 / 24 / 22) | **odvozené** 1BR × 1,517 = 2 069 | 2 060,6 / 28 |
| 3BR | (2 945 / 1 894,9 / 7 / 6) | **odvozené** 1BR × 2,304 = 3 142 | 1 752,2 / 2 |

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P9 raw 1,396 / 1,389 (tenké).

## Očekávaný vzorek a VÁHA — S POKOROU

Vysočany (O2 arena, Harfa, Balabenka) — pravděpodobně největší
ne-libeňský kus P9. Bodový odhad **1BR ~30**, rozsah 15–50, nízká důvěra.

| 1BR | 2BR | 3BR |
|---|---|---|
| 15–50 → w 0 nebo 0,5 | 4–15 → w 0 | 0–4 → w 0, možná `data:null` |

Reálná možnost: **1BR pod 25 → váha 0 ve všech pásmech → čtvrť je
v modelu inertní** (existuje v selektoru, vrací okres). Podle SOP se
i tak integruje, co se naměří (měřené, uložené, inertní) — je to
informace „P9 mimo Libeň je tenké", ne selhání. Chybějící pásmo
(`data:null`) = čtvrť do produkce nejde (pravidlo 2/3 = incomplete),
pokus se počítá.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,75 → prověřit (při n < 10 jen zaznamenat).
2. `3BR/1BR` mimo 1,20–3,20 → při n < 10 jen zaznamenat.
3. `active_listings` 1BR nad ~76 (víc než celý okres P9) → polygon
   zasahuje mimo P9 (Libeň? Praha 3 — k.ú. Vysočany má dílek v P3) →
   STOP, geometrie.
4. Podíl na P9 (1BR) mimo **15–65 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR nad Libní (1 400) o víc než 10 % → zaznamenat, prověřit
   (O2 arena může táhnout eventové ADR — není to chyba, ale ověřit label).

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Vysočany, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po znaku.
Label může být „Vysočany official boundary" nebo anglická varianta. 2BR
a 3BR v téže session s výslovně pojmenovanou hranicí, label + zdroj
ověřit u každého pásma zvlášť.

## Postup

SOP beze změny. Import `--geo praha9_vysocany --level ctvrt
--source-geometry vysocany --parents praha9 --ltr-context
praha9/vysocany`. Integrace do `MARKET_CTVRT.vysocany` s NEZMĚNĚNÝM
modelem; regrese: 0 změn dřívějších kombinací (včetně `praha9|liben`
a `praha9|-`), nový stav jen `praha9|vysocany`. Blend 2BR/3BR (pokud by
kdy měl váhu) jde do ODVOZENÉHO okresu → `derived: true`.

Kvóta: okno 7. 9. 2026 (ukotveno ~17:10 UTC), po Košířích 9 pokusů,
zbývá 11; Vysočany = pokusy 10–12, začíná se s ≥ 5, končí s rezervou
≥ 8. Po Vysočanech STOP — další volání jen na pokyn.

## Log pokusů

(prázdné — před prvním voláním)
