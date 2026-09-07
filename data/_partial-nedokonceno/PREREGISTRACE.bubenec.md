# Předregistrace: Bubeneč

Zapsáno **2026-09-07 18:13 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Bubeneč (#1 v RANKING-ctvrti-2026-09-07.md)

Praha 6 má jedinou čtvrť, Dejvice — 22 % okresní nabídky, +14 % nad
okresem na váze 0,5. Zbytek P6 (1BR ≈ 121, 2BR ≈ 63) je nezměřený a
Bubeneč je jeho největší centrální kus (Stromovka, ambasády, Letná ze
západu). GEO registr: `praha6/bubenec` (LTR +1,44 %, n=16), jediný
kontext → `parents: ["praha6"]`.

**Geometrie vs. okres:** k.ú. Bubeneč leží v Praze 6 i v Praze 7 (díl
u Výstaviště / Stromovky). GEO kontext `praha7/bubenec` neexistuje, takže
se čtvrť připojí jen k P6 (precedens Nusle: katastrální dílek v jiném
okresu kontext nezakládá — rozšíření by bylo samostatné rozhodnutí).
Polygon PriceLabs díl P7 zahrne. Důsledky: (a) podíl na P6 bude nadsazený
o listingy z P7 (zbytek P7 bez Holešovic ≈ 42 u 1BR — horní mez dílu),
(b) RevPAR Bubenče bude nést i letenský efekt. Zapsat, neopravovat.

## Výchozí stav (Praha 6 okres, `MARKET_STR`; Dejvice v `MARKET_CTVRT`)

| | P6 ADR / RevPAR / nMean / nMin | Dejvice RevPAR / n (váha) | zbytek P6 bez Dejvic n / RevPAR |
|---|---|---|---|
| 1BR | 1 873 / 1 286,6 / 155 / 144 | 1 468,5 / 34 (0,5) | ≈ 121 / ≈ 1 237 |
| 2BR | 2 913 / 1 878,9 / 83 / 79 | 2 246,6 / 19 (0) | ≈ 63 / ≈ 1 770 |
| 3BR | **odvozené** 2BR × 1,481 = 2 782,7 | 3 232,4 / 2 (0) | ≈ 9 |

4BR pro P6 neexistuje (3BR odvozené → žádné řetězení) → 4+kk v P6 zůstává
ploché i s Bubenčí; tenhle pull na tom nic nemění.

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P6 sám 1,460 (nízko).

## Očekávaný vzorek a VÁHA — S POKOROU

Bodový odhad **1BR ~50** (rozsah 35–70 včetně dílu P7), nízká důvěra.

| 1BR | 2BR | 3BR |
|---|---|---|
| 35–70 → w 0,5 nebo 0,75 | 15–35 → w 0 nebo 0,5 | 2–6 → w 0 |

Podle Dejvic čekej lokální efekt kladný (centrálnější než letištní část
P6), ale ne nutně: Bubeneč má víc velkých bytů a rezidenční charakter.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,75 → prověřit.
2. `3BR/1BR` mimo 1,20–3,20 → při n < 10 jen zaznamenat.
3. `active_listings` 1BR nad ~160 (zbytek P6 ≈ 121 + horní mez dílu P7
   ≈ 42) → polygon širší než k.ú. Bubeneč → STOP, geometrie.
4. Podíl na P6 (1BR) mimo **20–50 %** (nadsazený o díl P7) → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR nad Dejvicemi (1 468,5) o víc než 10 % → zaznamenat, prověřit
   label (Letná/Stromovka může táhnout; není to chyba).
7. Bubeneč + Dejvice dohromady nad 100 % zbytku P6 bez Střešovic/Břevnova
   nejde ověřit — jen záznam součtu podílů.

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Bubeneč, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po znaku.
Label může být „Bubeneč official boundary" nebo anglická varianta. 2BR
a 3BR v téže session s výslovně pojmenovanou hranicí, label + zdroj
ověřit u každého pásma zvlášť.

## Postup

SOP beze změny. Import `--geo praha6_bubenec --level ctvrt
--source-geometry bubenec --parents praha6 --ltr-context praha6/bubenec`.
Integrace do `MARKET_CTVRT.bubenec` s NEZMĚNĚNÝM modelem; regrese: 0 změn
dřívějších kombinací (včetně `praha6|dejvice` a `praha6|-`), nový stav
jen `praha6|bubenec`. Blend 3BR (pokud by měl váhu) jde do ODVOZENÉHO
okresu → `derived: true`. 4+kk beze změny (viz výš). Žádná změna pravidel.

Kvóta: okno 7. 9. 2026 (ukotveno ~17:10 UTC), použito 10, zbývá 10;
Bubeneč = pokusy 11–13. Po Bubenči Strašnice (#2) jen když po nich
zůstanou ≥ 4 (14–16 → 4). Rezerva 4 se neutrácí.

## Log pokusů

(prázdné — před prvním voláním)
