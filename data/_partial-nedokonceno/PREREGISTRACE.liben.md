# Předregistrace: Libeň

Zapsáno **2026-09-05 17:12 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Libeň

Jedna geometrie, **dva registrované kontexty**: `praha8/liben` (LTR
−2,35 %, n=29) a `praha9/liben` (−0,63 %, n=13). Oba mají vlastní efekt →
`parents: ["praha8", "praha9"]`, jeden pull obslouží oba (jako Vinohrady).
Po Karlínu je Libeň druhá čtvrť Prahy 8 a **první pro Prahu 9**.

Hlavní otázka: **Karlín je +7–9 % nad P8; dopočtený zbytek P8 bez
Karlína má 1BR RevPAR ≈ 1 356 (−29 % pod okresem). Libeň je většina toho
zbytku — potvrdí přímé měření, že „Praha 8 bez Karlína" je pod okresem
o tolik?** Pro Prahu 9 (1BR 1 364, jen 1BR měřené) je Libeň nejspíš
parita.

## Výchozí stav

| | P8 ADR / RevPAR / nMean / nMin | P9 ADR / RevPAR / nMean / nMin |
|---|---|---|
| 1BR | 2 532 / 1 902,3 / 350 / 336 | 2 065 / 1 363,9 / 76 / 64 |
| 2BR | 3 654 / 2 508,0 / 92 / 86 | **není** (odvozeno 1BR × 1,517 = 2 069) |
| 3BR | **není** (odvozeno 2BR × 1,481 = 3 714) | **není** (odvozeno 1BR × 2,304 = 3 142) |

Dopočtený zbytek P8 bez Karlína: 1BR n ≈ 81 / RevPAR ≈ 1 356; 2BR n ≈ 28
/ ≈ 2 035; 3BR n ≈ 4.

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P8 sám 1,335 (nízko), Karlín 1,313.

## Očekávaný vzorek a VÁHA — S POKOROU

Libeň (P8 část: Palmovka, Libeňský ostrov, Kobylisy ne) + P9 část
(Vysočany hranice). Zbytek P8 bez Karlína je ~81 u 1BR; P9 část Libně
přidá odhadem 20–40. Bodový odhad **1BR ~90**, nízká důvěra.

| 1BR | 2BR | 3BR |
|---|---|---|
| 60–120 → w 0,75 (nebo 1,0 nad 100) | 15–35 → w 0 nebo 0,5 | 0–6 → w 0, možná prázdná odpověď |

**3BR může přijít prázdný / `data:null`** — počítá se jako pokus, zapíše
se, co přišlo, žádný dopočet; podle SOP se pak čtvrť integruje jen s tím,
co je měřené (chybějící pásmo → čtvrť do produkce nejde — pravidlo „2/3
= incomplete" platí, pokud pásmo NEPŘIŠLO; pásmo s n ≈ 3 přišlo a je
měřené, byť inertní).

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,75 → prověřit.
2. `3BR/1BR` mimo 1,20–3,20 → při n < 10 jen zaznamenat.
3. `active_listings` 1BR nad ~150 → polygon širší než k.ú. Libeň
   (Kobylisy/Vysočany uvnitř?).
4. Podíl na P8 (1BR) mimo **15–40 %** → prověřit (Karlín má 77 %).
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR NAD okresem P8 → v rozporu s karlínským rozkladem;
   zaznamenat, prověřit geometrii.

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Libeň, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po znaku.
Label může být „Libeň official boundary" nebo anglická varianta.

## Postup

SOP §15 (sdílená geometrie, jeden pull, dva kontexty) beze změny. Kvóta:
před voláním 9 pokusů okna, zbývá 11; po Libni ≥ 8 → STOP a hlášení,
další čtvrť jen na pokyn.

## Pokus 1 (2026-09-05 17:22 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Libeň, Prague, official OpenStreetMap boundary, 1-bedroom.
For each month from August 2025 through July 2026 give: …`
(`question_sha256 6dbf63bc…`)

- `selected_geometry_label`: **`Libeň official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Libeň, Prague — 1BR` · session `lg_sess_ROZB4dPNLRQzu2b89Bx6fw7kIcIOyTOD`
- 12/12 měsíců (`2025_08..2026_07`), bez nadmnožiny, identity sedí; raw `1732025a…`
- kvóta: 10. pokus okna (zbývá 10)

| | P8 okres | P9 okres | zbytek P8 bez Karlína | Libeň | Libeň/P8 | Libeň/P9 | Libeň/zbytek P8 |
|---|---|---|---|---|---|---|---|
| n (průměr) | 350,0 | 76,2 | 81,0 | 82,7 → 83 | **0,236** | 1,08 | 1,02 |
| n (min) | 336 | 64 | | 79 | | | |
| RevPAR | 1 902,3 | 1 363,9 | 1 357,1 | 1 400,4 | **0,736** (0,66–0,84 po měsících) | **1,027** (0,92–1,16) | **1,032** |
| ADR | 2 532 | 2 065 | | 2 024 | 0,799 | 0,980 | |
| occ | 74,4 % | 65,6 % | | 68,5 % | | | |

Spouštěče: #3 ne (83 < 150) · #4 ne (23,6 % v pásmu 15–40 %) · #5 ne
(0,22–0,25; rozptyl 2,6 p. b.) · #6 ne — Libeň je **26 % POD okresem P8**,
přesně ve směru karlínského rozkladu: Karlín (n 269, RevPAR 2 067) táhne
P8 nahoru, zbytek P8 bez Karlína má RevPAR ≈ 1 357 a Libeň sedí +3 % nad
ním i +3 % nad celým P9. Bodový odhad n ~90 potvrzen (83); nMean 83 →
váha **0,75**; nMin 79 ≥ 50 → `reliable`.

Poznámka pro integraci (bez změny pravidel): v P8 se Libeň bude blendovat
do okresu, který je o 26 % nad ní (váha 0,75 → výsledek P8|liben 1BR ≈
0,75·1 400 + 0,25·1 902 ≈ 1 526); v P9 do okresu prakticky na stejné
úrovni. To je očekávané chování `localCell`, ne spouštěč.

Schválení geometrie: **OTEVŘENÉ**, čeká na člověka.
