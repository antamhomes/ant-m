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

### Pokus 1 (2026-09-07 17:48 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Vysočany, Prague, official OpenStreetMap boundary,
1-bedroom. For each month from August 2025 through July 2026 give: …`
**10. pokus okna** (ukotveno ~17:10 UTC 7. 9.), zbývá 10.

- `selected_geometry_label`: **`Vysočany official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Vysočany, Prague` · session `lg_sess_AMIy4uAWNMtyzWjAd4_07QN_8DpJl-y7`
- 12/12 měsíců, bez nadmnožiny, identity sedí; próza proti `data[]` bez
  rozdílu; raw `97dfe5de…`

| | P9 okres | Libeň | Vysočany | poměr k P9 |
|---|---|---|---|---|
| n (průměr) | 76,2 | 82,7 | 20,9 → 21 (17 → 25, roste) | podíl **0,274** (0,25–0,29) |
| n (min) | 64 | 79 | 17 | |
| RevPAR | 1 363,9 | 1 400,4 | 1 235,8 | **0,906** (0,69–1,09); k Libni 0,882 |
| ADR | 2 065 | | 1 738 | 0,842 |
| occ | 65,6 % | | 70,2 % | leden/únor 47 % / 46 % |

Spouštěče: #3 ne (21 ≪ 76) · #4 ne (27,4 % v pásmu 15–65 %) · #5 ne
(rozptyl 4 p. b., ale s trendem: nabídka roste 17 → 25 přes rok — nová
výstavba u Harfy/Kolbenky, ne překryv) · #6 ne — Vysočany jsou **12 % POD
Libní a 9 % pod P9**, ADR o 16 % níž. Nájemní efekt +0,8 % ≈ nula, STR
zřetelně slabší. Bodový odhad n ~30 byl optimistický (21) → **nMean 21 <
25 → váha 0 ve všech pásmech**. Přesně scénář „čtvrť v modelu inertní"
z předregistrace: existuje v selektoru, veřejný výsledek = okres P9.

Co to znamená: 2BR a 3BR se změří a uloží (pravidlo 2/3, měřené,
inertní), model se nezmění nikde kromě přidání stavu `praha9|vysocany`,
který je byte-shodný s `praha9|?` u všech STR čísel (liší se jen LTR
efekt +0,8 %). Hodnota dnešních zbývajících dvou dotazů je tedy
archivní/diagnostická (P9 mimo Libeň je opravdu tenké a levnější), ne
produkční. Pokud by člověk chtěl 2 dotazy ušetřit, je to legitimní
rozhodnutí — SOP „2/3 = incomplete" by pak čtvrť nechal mimo
`MARKET_CTVRT`, jen v raw + DB jako `partial`.

Schválení geometrie: člověk 7. 9. 2026 zvolil **(b) — STOP, čtvrť
zůstává `partial`**: „nMean 21 < 25 means it's inert under the current
model. Spending two more calls only to archive 2BR/3BR that won't affect
public output is low-value." Žádná další volání na Vysočany. 1BR raw
zůstává v repu, DB dostane řádek `praha9_vysocany` 1BR s `pull_state =
partial`, `MARKET_CTVRT.vysocany` NEVZNIKÁ (pravidlo 2/3 = incomplete).
Kdyby se někdy dokončovaly, začíná se schválením geometrie
`Vysočany official boundary` + `openstreetmap` (zatím NEschválené, jen
změřené) a pokusy 2–3 v nové session s výslovně pojmenovanou hranicí.
