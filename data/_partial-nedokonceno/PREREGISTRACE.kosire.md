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

### Pokus 1 (2026-09-07 17:39 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Košíře, Prague, official OpenStreetMap boundary,
1-bedroom. For each month from August 2025 through July 2026 give: …`
**7. pokus okna** (ukotveno ~17:10 UTC 7. 9.), zbývá 13.

- `selected_geometry_label`: **`Košíře official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Košíře, Prague, Czech Republic` · session `lg_sess_SuELlnKZSwP_JIb-7HsnsBWvMqnf5yxp`
- 12/12 měsíců, bez nadmnožiny, identity sedí; tabulka v próze proti
  `data[]` bez rozdílu; raw `37889846…`

| | P5 okres | Smíchov | zbytek P5 bez Smíchova | Košíře | poměr |
|---|---|---|---|---|---|
| n (průměr) | 451,6 | 327 | 124,6 | 68,7 → 69 | podíl na P5 **0,152** (0,14–0,17); na zbytku 0,55 |
| n (min) | 408 | | | 63 | |
| RevPAR | 1 579,7 | 1 566,6 | ≈ 1 617 | 1 427,5 | k P5 **0,904** (0,68–0,98); ke Smíchovu 0,911 |
| ADR | 2 259 | | | 1 924 | 0,852 |
| occ | | | | 73,3 % | leden 33 % (P5 45 %) |

Spouštěče: #3 ne (69 < 125) · #4 ne (15,2 % v pásmu 5–20 %) · #5 ne
(rozptyl 3 p. b.; červenec 84 nabídek je skok, podíl přesto v pásmu) ·
#6 ne — Košíře jsou **10 % POD okresem i Smíchovem**, ADR o 15 % níž.
Nájemní prémie +3,4 % se u STR nepotvrzuje; Košíře jsou levnější STR
trh za Smíchovem. Bodový odhad n ~40 byl pesimistický (69) → váha
**0,75**, nMin 63 ≥ 50 → `reliable`.

Dopad na integraci (pravidla beze změny): P5|kosire 1BR ≈ 0,75·1 427,5 +
0,25·1 579,7 = 1 465,6 (−7 % pod okresem), `derived: false`.

Schválení geometrie: **SCHVÁLENO člověkem 7. 9. 2026** znak po znaku
(`Košíře official boundary` + `openstreetmap`).

### Pokusy 2 a 3 (2026-09-07 17:44 / 17:47 UTC): 2BR a 3BR ÚSPĚCH

Táž session, hranice pojmenovaná v každém dotazu, label + zdroj ověřeny
u obou pásem zvlášť. Oba 12/12, bez nadmnožiny, identity sedí, tabulky
v próze proti `data[]` bez rozdílu. Pokusy okna: 9, zbývá 11.

| pásmo | ADR | RevPAR | occ | nMean | nMin | podíl na P5 | RevPAR/P5 | váha | raw |
|---|---|---|---|---|---|---|---|---|---|
| 1BR | 1 924 | 1 427,5 | 73,3 % | 69 | 63 | 0,152 (0,14–0,17) | **0,904** | **0,75** | 37889846… |
| 2BR | 3 148 | 1 735,4 | **51,0 %** | 9 | 6 | 0,048 | 0,734 | **0** | 48de07ef… |
| 3BR | 5 739 | 4 246,5 | 73,0 % | 3 | 2 | 0,04 | 1,144 | **0** | 7825d4a5… |

Spouštěče: #1 `2BR/1BR = 1,216` **těsně v pásmu** 1,20–1,75 (model 1,567,
P5 1,496) — nízko, ale n 6–11 a occ 51 % (únor 15 %, leden 22 %): 2BR
Košíře je 6 bytů se zimním výpadkem, ne trh; #2 `3BR/1BR = 2,975`
v pásmu, n = 3 → jen záznam. #3–#6 ne.

Dopad na integraci (pravidla beze změny, `parents: ["praha5"]`, všechna
okresní pásma měřená → žádný `derived` z blendu):
- 1BR w 0,75 → P5|kosire 1BR = 0,75·1 427,5 + 0,25·1 579,7 = **1 465,6**
  (−7 % pod okresem).
- 2BR nMean 9 → w 0 → okres (2 363,4). 3BR nMean 3 → w 0 → okres
  (3 710,4, měřené; přímé 4 247 při n 3 o 14 % výš — záznam, P5 je
  jediný okres, kde je i okresní 3BR měřené, takže srovnání je
  měřené-vs-měřené, ne vs odvozené).
- Nový stav regrese: jen `praha5|kosire`. `praha5|smichov` a `praha5|-`
  (Ostatní) už existují a nesmí se hnout.
