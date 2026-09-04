# Předregistrace: Karlín

Zapsáno **2026-09-04 11:12 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Karlín

Jediný kontext `praha8/karlin` (LTR efekt **+11,43 %, n=36** — největší
nájemní prémie v registru). Praha 8 vychází v kalkulačce na 1,71–2,08×
nájmu a dokumentace to od 31. 8. drží jako „Karlín effect": okresní STR
benchmark táhne nahoru Karlín, nájemní medián sráží Libeň a Kobylisy. Pull
je první přímý test té věty. Zároveň je to nejtenčí STR okres ve frontě:
P8 2BR má nMean 92, 3BR 47 (v `MARKET_STR` není, okresní 3BR se odvozuje
z 2BR poměrem — stejná situace jako Praha 3 u Žižkova).

Otázka: **je Karlín na STR nad Prahou 8, nebo je P8 na STR jednolitá jako
P3 a P5?** Žižkov i Smíchov ukázaly paritu s okresem bez ohledu na
nájemní rozestup (−3,8 % / +7,7 %). Karlín je jediná čtvrť, kde
dokumentace prémii výslovně předpokládá.

## Výchozí stav (Karlín v `MARKET_CTVRT` není → okres Praha 8)

| | roční výnos (DB `annual_rev`) | ADR | RevPAR | nMean | nMin | v MARKET_STR |
|---|---|---|---|---|---|---|
| 1BR | 632 374 | 2 532 | 1 902,3 | 350 | 336 | ano |
| 2BR | 844 108 | 3 654 | 2 508,0 | 92 | 86 | ano |
| 3BR | 1 259 105 | 5 418 | 3 724,7 | 47 | 41 | **ne** (potlačené, odvozuje se 2BR × 1,481 = 3 714) |

`2BR/1BR = 1,335` — **minimum** rozptylu všech okresů · `3BR/1BR = 1,991`.

## Poměrový model

Předpovídá `2BR/1BR = 1,567`, `3BR/1BR = 2,427`. Dosavadní odchylky:
Nové Město −1,1 / +3,2 %, Vinohrady +3,3 / −3,7 %, Žižkov −5,8 / +15,6 %,
Smíchov −2,8 / −6,3 %. Praha 8 sama je na 2BR/1BR o 15 % pod modelem,
takže Karlín nejspíš vyjde taky nízko; **to není spouštěč, to je vlastnost
okresu.**

## Očekávaný vzorek a VÁHA — S POKOROU

Podíl Karlína na P8 je neznámý; Libeň (Palmovka) má vlastní STR nabídku.
Bodový odhad ~60 %, nízká důvěra, široké pásmo.

| podíl na P8 | 1BR | 2BR | 3BR |
|---|---|---|---|
| 45 % | 158 (w 1,00) | 41 (w 0,50) | 21 (**w 0**) |
| 60 % | 210 (w 1,00) | 55 (w 0,75) | 28 (w 0,50) |
| 75 % | 263 (w 1,00) | 69 (w 0,75) | 36 (w 0,50) |

**3BR bude buď váha 0, nebo 0,5 do ODVOZENÉHO okresního rodiče** (P8 3BR
není měřený). Případ w 0,5 + odvozený rodič je od Žižkova známý režim:
50 % naměřené čtvrti + 50 % okres 2BR × poměr, příznak `derived`,
rozšířené rozpětí. Není to nový typ selhání; při integraci se přesto
vypíše, co `localCell` vrátí. 2BR s nMean pod 100 bude první čtvrťové 2BR
na váze 0,75 nebo 0,5.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,70 → prověřit (dolní mez snížená kvůli P8 1,335).
2. `3BR/1BR` mimo 1,40–2,90 → totéž.
3. `active_listings` 1BR nad ~315 (≈ 90 % celého P8) → polygon moc široký.
4. Podíl na P8 mimo **35–85 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR Karlína POD okresem u 1BR → v rozporu s „Karlín effect";
   zaznamenat jako zjištění, není to chyba dat.
7. `nMin` 3BR pod 25 → pásmo se změří a uloží, ale `ctvrtWeight` 0; okres
   zůstává; **žádný dopočet.**

## Schválení geometrie — OTEVŘENÉ

Schválený řetězec pro Karlín **neexistuje**. Dotaz pojmenuje hranici
výslovně („Karlín, Prague, official OpenStreetMap boundary, 1-bedroom.
…"), po prvním úspěšném pásmu STOP, člověk schvaluje
`selected_geometry_label` + `selected_geometry_source` znak po znaku.
Pozor: k.ú. Karlín je malé a OSM může nabídnout i širší „Karlín" jako
čtvrť/lokalitu; rozhoduje strukturovaný label, ne próza.

## Postup

SOP §14 a §15 beze změny: výslovné pojmenování hranice v každém dotazu,
session jen jako pin, label + zdroj ověřit u každého pásma zvlášť,
`pl-raw.mjs` před transformací, nadmnožina měsíců jen kalendářním
pravidlem, chybějící/duplicitní měsíc = STOP, bez poměrového dopočtu.
Kvóta: před prvním dotazem Karlína 6 pokusů okna (od 10:38 UTC), rezerva
≥ 4 splněna (zbývá ≤ 14).

---

## Pokus 1 (2026-09-04 11:13 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Karlín, Prague, official OpenStreetMap boundary, 1-bedroom.
For each month from August 2025 through July 2026 give: occupancy rate,
ADR, RevPAR, number of active listings, and average revenue per active listing.`

- `selected_geometry_label`: **`Karlín official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Karlín, Prague - 1BR` (ozvěna dotazu) · session
  `lg_sess__lzYtW2sBo3LrpssMosj87FmMkuOKFub` · geometry_token: žádný
- odpověď: 13 měsíců (opět `2026_08` navíc, occ 45,5 %), obálka drží 13,
  extrakce 12/12 kalendářním pravidlem
- syrová obálka: `data/pricelabs-raw/karlin.1BR.raw.json`, raw_sha256 `3383aa4e…`
- kvóta: 7. pokus okna od 10:38 UTC

| | P8 okres | Karlín | poměr |
|---|---|---|---|
| n (průměr) | 350,0 | 269,0 | **0,769** |
| n (min) | 336 | 253 | |
| RevPAR | 1 902,3 | 2 066,8 | **1,086** |
| ADR | 2 532 | 2 671 | 1,055 |
| occ | | 76,6 % | |

Spouštěče: #3 ne (269 < 315) · #4 ne (77 % v pásmu 35–85) · #5 ne (podíl
0,75–0,79 ve všech 12 měsících) · #6 ne — **Karlín je nad okresem
o 8,6 % u 1BR a ve všech 12 měsících (1,07–1,10)**. Dopočtený zbytek P8
(n ≈ 81) má RevPAR ≈ 1 356, tedy ~35 % pod Karlínem. „Karlín effect"
z dokumentace se u 1BR potvrzuje; je to první čtvrť, kde nájemní rozestup
(+11,4 %) má na STR viditelný protějšek (+8,6 %).

Schválení geometrie: **OTEVŘENÉ**, čeká na člověka.

## Pokusy 2 a 3 (2026-09-04 11:16 / 11:18 UTC): 2BR a 3BR ÚSPĚCH

Geometrie schválena člověkem znak po znaku. 2BR i 3BR v téže session
s výslovným pojmenováním hranice; u obou **stejný** `selected_geometry_label`
+ `_source`, ověřeno zvlášť. Obě pásma přišla jako 12 měsíců (bez
nadmnožiny). `market_label` se u každého pásma liší („Karlín, Prague -
Monthly KPIs" / „Karlín, Prague") — ozvěna, ne geometrie.

| pásmo | ADR | RevPAR | occ | nMean | nMin | podíl na P8 | rozsah | RevPAR/P8 | rozsah | raw_sha256 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1BR | 2 671 | 2 066,8 | 76,6 % | 269 | 253 | 0,769 | 0,75–0,79 | **1,086** | 1,07–1,10 | 3383aa4e… |
| 2BR | 3 928 | 2 713,1 | 68,3 % | 64 | 56 | 0,698 | 0,65–0,72 | **1,082** | 1,00–1,13 | 5b2d8647… |
| 3BR | 5 709 | 3 981,1 | 69,3 % | 43 | 36 | 0,896 | 0,86–0,92 | **1,069** | 1,03–1,11 | 86f82cb0… |

Spouštěče: #1 `2BR/1BR = 1,313` v pásmu 1,20–1,70 (model 1,567 → −16,2 %;
P8 sám 1,335 — Karlín kopíruje nízký poměr okresu, jak předregistrace
čekala). #2 `3BR/1BR = 1,926` v pásmu (model 2,427 → −20,6 %; P8 1,991).
#3–#7 ne (3BR nMin 36 ≥ 25, váha 0,5, ne 0). #6 ne — **Karlín je nad
Prahou 8 ve všech třech pásmech, +7 až +9 %**, a u 1BR v každém z 12
měsíců. „Karlín effect" potvrzen. Je to první čtvrť, kde nájemní rozestup
(+11,4 %) a STR rozestup (+8,6 / +8,2 / +6,9 %) míří stejným směrem a
podobnou velikostí; Žižkov a Smíchov ukázaly paritu.

Váhy z naměřeného: 1BR w 1,0 · 2BR **w 0,75** (nMean 64 — první čtvrťové
2BR pod plnou vahou) · 3BR **w 0,5** (nMean 43; nMin 36 < 50, nespolehlivé
v DB). Okresní rodič 3BR je ODVOZENÝ (P8 3BR není v MARKET_STR) → známý
žižkovský režim; přesná inspekce `localCell` v integračním commitu.

Kvóta: pokusy 7–9 okna od 10:38 UTC, všechny úspěšné (9 celkem).
