# Předregistrace: Košíře

Zapsáno **2026-09-07 17:37 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Košíře

Praha 5 má jediný měřený kontext — Smíchov (72–79 % okresní nabídky,
≈ parita s okresem). Košíře dají P5 druhý kontext mimo smíchovské jádro.
GEO registr má `praha5/kosire` (LTR +3,38 %, n=30), jediný kontext →
`parents: ["praha5"]`. Pořadí dne (rozhodnutí člověka 7. 9.): Dejvice
(hotovo) → Košíře → Vysočany; ≥ 4 pokusy v rezervě, nová geometrie =
STOP po prvním pásmu.

## Výchozí stav (Praha 5 okres, `MARKET_STR`; Smíchov v `MARKET_CTVRT`)

| | P5 ADR / RevPAR / nMean / nMin | Smíchov RevPAR / n | zbytek P5 bez Smíchova n / RevPAR |
|---|---|---|---|
| 1BR | 2 259 / 1 579,7 / 452 / 408 | 1 566,6 / 327 | ≈ 125 / ≈ 1 617 |
| 2BR | 3 378 / 2 363,4 / 183 / 158 | 2 385,4 / 145 | ≈ 39 / ≈ 2 272 |
| 3BR | 5 599 / 3 710,4 / 74 / 65 | 3 562,1 / 58 | ≈ 16 / ≈ 4 238 |

Všechna tři okresní pásma měřená → Košíře blendují vždy do měřeného
okresu (žádný `derived` z blendu, na rozdíl od P9/P10).

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P5 sám 1,496 / 2,349.

## Očekávaný vzorek a VÁHA — S POKOROU

Zbytek P5 bez Smíchova (~125 u 1BR) se dělí mezi Košíře, Hlubočepy,
Radlice, Jinonice, Motol, Stodůlky. Podíl Košíř odhad **25–45 %**
zbytku → bodový odhad **1BR ~40**, nízká důvěra.

| 1BR | 2BR | 3BR |
|---|---|---|
| 25–60 → w 0,5 (0,75 nad 50) | 8–20 → w 0 | 1–5 → w 0 |

Čekej tenkou čtvrť typu Dejvice: 1BR na 0,5, 2BR a 3BR inertní. To je
informace o P5 mimo Smíchov, ne selhání; integruje se, co se naměří.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,75 → prověřit.
2. `3BR/1BR` mimo 1,20–3,20 → při n < 10 jen zaznamenat.
3. `active_listings` 1BR nad ~125 (víc než celý zbytek P5 bez Smíchova) →
   polygon zasahuje do Smíchova → STOP, geometrie.
4. Podíl na P5 (1BR) mimo **5–20 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR nad Smíchovem (1 567) o víc než 10 % → zaznamenat, prověřit
   geometrii (Košíře jsou za Smíchovem, ne před ním; nájemní prémie +3,4 %
   je ale reálná — do +10 % je to konzistentní).

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Košíře, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po znaku.
Label může být „Košíře official boundary" nebo anglická varianta. 2BR
a 3BR v téže session s výslovně pojmenovanou hranicí, label + zdroj
ověřit u každého pásma zvlášť.

## Postup

SOP beze změny (raw před transformací, jen `data[]`, okno
`2025_08..2026_07`, kalendářní pravidlo, `basis: measured`, žádný
poměrový dopočet, `pl-import` bez `--allow-uncommitted` až po commitu
artefaktu). Import `--geo praha5_kosire --level ctvrt --source-geometry
kosire --parents praha5 --ltr-context praha5/kosire`. Integrace do
`MARKET_CTVRT.kosire` s NEZMĚNĚNÝM modelem; regrese: 0 změn dřívějších
kombinací (včetně `praha5|smichov` a `praha5|-`, které už existují),
nový stav jen `praha5|kosire`.

Kvóta: okno 7. 9. 2026 (ukotveno ~17:10 UTC), po Dejvicích 6 pokusů,
zbývá 14; Košíře = pokusy 7–9, začíná se jen s ≥ 5, končí s rezervou ≥ 4.

## Log pokusů

(prázdné — před prvním voláním)
