# Předregistrace: Strašnice

Zapsáno **2026-09-07 18:22 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Strašnice (#2 v RANKING-ctvrti-2026-09-07.md)

Praha 10 má jedinou čtvrť, Vršovice (70 % okresní nabídky, +2,4 % nad
okresem). Zbytek P10 (1BR ≈ 59, 2BR ≈ 29) sedí u 1BR na ≈ 1 252 (−8 %
pod Vršovicemi, −6 % pod okresem) a Strašnice jsou jeho největší
rezidenční kus. GEO registr: `praha10/strasnice` (LTR −0,37 %, n=37),
jediný kontext → `parents: ["praha10"]`. Celé k.ú. leží v Praze 10.

Co Strašnice řeknou: jestli je vršovická prémie reálná (zbytek okresu
pod okresem) a jestli P10 mimo Vršovice vůbec má váhově použitelný STR
trh. P10 3BR je odvozené a NEOVĚŘENÉ (rozhodnutí 7. 9.); tenhle pull na
tom nic nemění — Strašnice 3BR bude n ≈ 1–3, w 0.

## Výchozí stav (Praha 10 okres, `MARKET_STR`; Vršovice v `MARKET_CTVRT`)

| | P10 ADR / RevPAR / nMean / nMin | Vršovice RevPAR / n (váha) | zbytek P10 n / RevPAR |
|---|---|---|---|
| 1BR | 1 871 / 1 329,5 / 199 / 193 | 1 361,7 / 140 (1,0) | ≈ 59 / ≈ 1 252 |
| 2BR | 3 012 / 2 041,4 / 65 / 58 | 2 114,5 / 36 (0,5) | ≈ 29 / ≈ 1 949 |
| 3BR | **odvozené** 2BR × 1,481 = 3 023 (neověřené) | 2 387,4 / 8 (0) | ≈ 5 / ≈ 445 |

4BR pro P10 neexistuje (3BR odvozené → žádné řetězení) → 4+kk ploché.

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P10 sám 1,536; Vršovice 1,553.

## Očekávaný vzorek a VÁHA — S POKOROU

Zbytek P10 (≈ 59 u 1BR) se dělí mezi Strašnice, Záběhlice, Hostivař,
Malešice, vinohradský díl. Podíl Strašnic odhad **40–65 %** zbytku →
bodový odhad **1BR ~30**, rozsah 20–40, nízká důvěra.

| 1BR | 2BR | 3BR |
|---|---|---|
| 20–40 → w 0 nebo 0,5 | 8–18 → w 0 | 1–3 → w 0 |

Reálná možnost 1BR pod 25 → čtvrť inertní (jako Vysočany). Podle SOP se
integruje, co se naměří; kdyby po 1BR bylo jasné, že n < 25, člověk může
zvolit STOP jako u Vysočan — zapsat, nepředjímat.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,75 → prověřit (při n < 10 jen zaznamenat).
2. `3BR/1BR` mimo 1,20–3,20 → při n < 10 jen zaznamenat.
3. `active_listings` 1BR nad ~59 (víc než celý zbytek P10) → polygon
   zasahuje do Vršovic → STOP, geometrie.
4. Podíl na P10 (1BR) mimo **8–25 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR NAD Vršovicemi (1 361,7) → v rozporu s dopočtem zbytku
   (1 252); zaznamenat, prověřit geometrii.

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Strašnice, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po znaku.
Label může být „Strašnice official boundary" nebo anglická varianta. 2BR
a 3BR v téže session s výslovně pojmenovanou hranicí, label + zdroj
ověřit u každého pásma zvlášť.

## Postup

SOP beze změny. Import `--geo praha10_strasnice --level ctvrt
--source-geometry strasnice --parents praha10 --ltr-context
praha10/strasnice`. Integrace do `MARKET_CTVRT.strasnice` s NEZMĚNĚNÝM
modelem; regrese: 0 změn dřívějších kombinací (včetně `praha10|vrsovice`
a `praha10|-`), nový stav jen `praha10|strasnice`. Blend 3BR (pokud by
měl váhu) jde do ODVOZENÉHO okresu → `derived: true`. Žádná změna pravidel.

Kvóta: okno 7. 9. 2026 (ukotveno ~17:10 UTC), použito 13, zbývá 7;
Strašnice = pokusy 14–16 → po nich zbývá přesně **4 = rezerva, která se
neutrácí**. Po Strašnicích dnes žádné další volání.

## Log pokusů

(prázdné — před prvním voláním)
