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
