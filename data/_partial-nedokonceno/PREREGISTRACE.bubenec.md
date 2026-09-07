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

### Pokus 1 (2026-09-07 18:15 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Bubeneč, Prague, official OpenStreetMap boundary,
1-bedroom. For each month from August 2025 through July 2026 give: …`
**11. pokus okna** (ukotveno ~17:10 UTC 7. 9.), zbývá 9.

- `selected_geometry_label`: **`Bubeneč official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Bubeneč, Prague` · session `lg_sess_1K2jfO77rAbCp952HeUoOdWB9iWG798C`
- 12/12 měsíců, bez nadmnožiny, identity sedí, tabulka v próze proti
  `data[]` bez rozdílu; raw `fc9a1aa2…`

| | P6 okres | Dejvice | Bubeneč | poměr |
|---|---|---|---|---|
| n (průměr) | 154,5 | 33,6 | 60,2 → 60 (53 → 67) | podíl na P6 **0,390** (0,37–0,43); Bubeneč + Dejvice = 61 % P6 |
| n (min) | 144 | 32 | 53 | |
| RevPAR | 1 286,6 | 1 468,5 | 1 517,6 | k P6 **1,180** (1,09–1,38); k Dejvicím 1,033 |
| ADR | 1 873 | 2 029 | 1 979 | 1,056 k P6 |
| occ | 68,2 % | 71,8 % | **76,0 %** | |

Spouštěče: #3 ne (60 ≪ 160) · #4 ne (39 % v pásmu 20–50 %) · #5 hraničně
ne (0,37–0,43 = ±3 p. b.; nabídka roste 53 → 67 přes rok, okres stojí —
růst nabídky, ne překryv) · #6 ne (+3,3 % nad Dejvicemi < 10 %) · #7
záznam: Dejvice + Bubeneč = 61 % P6, zbytek (≈ 61 nabídek) by dopočtem
seděl na RevPAR ≈ 958 — podezřele nízko; část bubenečské nabídky leží
v dílu P7 (zbytek P7 bez Holešovic = 42 nabídek na 1 694), takže podíl
i zdvih jsou nadsazené o letenský díl, přesně jak předregistrace čekala.
Rozdělit to nejde (jeden polygon), zapisuje se, neopravuje.

Bodový odhad n ~50 sedí (60) → nMean 60 → váha **0,75**, nMin 53 ≥ 50 →
`reliable`. Bubeneč je **+18 % nad okresem P6** (Dejvice +14 %): P6 je
dvojí trh — centrální Dejvice/Bubeneč nad 1 450 a zbytek (Břevnov,
Ruzyně, Veleslavín…) hluboko pod okresním průměrem.

Dopad na integraci (pravidla beze změny): P6|bubenec 1BR = 0,75·1 517,6
+ 0,25·1 286,6 = **1 459,9** (+13 % nad okresem), `derived: false`.

Schválení geometrie: **SCHVÁLENO člověkem 7. 9. 2026** znak po znaku
(`Bubeneč official boundary` + `openstreetmap`); pokyn: překryv s P7
zůstává zdokumentovanou výhradou geometrie, mapování rodiče se během
běhu neotvírá.

### Pokusy 2 a 3 (2026-09-07 18:19 / 18:22 UTC): 2BR a 3BR ÚSPĚCH

Táž session, hranice pojmenovaná v každém dotazu, label + zdroj ověřeny
u obou pásem zvlášť (`market_label` u 2BR je próza „Bubenec, Prague 2BR
Monthly Overview" — není autorita, label/zdroj sedí). Oba 12/12, bez
nadmnožiny, identity sedí, tabulky v próze proti `data[]` bez rozdílu.
Pokusy okna: 13, zbývá 7.

| pásmo | ADR | RevPAR | occ | nMean | nMin | podíl na P6 | RevPAR/P6 | vs Dejvice | váha | raw |
|---|---|---|---|---|---|---|---|---|---|---|
| 1BR | 1 979 | 1 517,6 | 76,0 % | 60 | 53 | 0,390 (0,37–0,43) | **1,180** | 1,033 | **0,75** | fc9a1aa2… |
| 2BR | 3 029 | 2 216,5 | 72,2 % | 34 | 31 | 0,409 (0,38–0,44) | **1,180** (0,95–1,32) | 0,987 | **0,5** | 6aaf0e0e… |
| 3BR | 4 596 | 2 857,1 | 64,4 % | 6 | 5 | — | 1,027 k odvozenému 2 782,7 | — | **0** | b1d18a6b… |

Spouštěče: #1 `2BR/1BR = 1,461` v pásmu (model 1,567; P6 sám 1,460 —
Bubeneč kopíruje okresní poměr přesně). #2 `3BR/1BR = 1,883` v pásmu,
n = 6 → jen záznam; pozoruhodné: první čtvrť, kde tenké přímé 3BR sedí
na odvozeném okresním 3BR (+2,7 %) místo desítek procent nad ním —
záznam k otevřené položce §4, nic se nemění. #3–#7 viz Pokus 1.

Dopad na integraci (pravidla beze změny, `parents: ["praha6"]`):
- 1BR w 0,75 → P6|bubenec 1BR = 0,75·1 517,6 + 0,25·1 286,6 = **1 459,9**
  (+13 %), `derived: false`.
- 2BR w 0,5 → 0,5·2 216,5 + 0,5·1 878,9 = **2 047,7** (+9 %), `derived:
  false` (okresní 2BR měřené). První čtvrť P6 s váhou i u 2BR.
- 3BR w 0 → odvozený P6 3BR (2 782,7, derived); 4BR pro P6 dál žádné
  (okresní 3BR odvozené → žádné řetězení) → 4+kk v Bubenči ploché jako
  v celém P6. Nový stav regrese: jen `praha6|bubenec`; `praha6|dejvice`
  a `praha6|-` musí zůstat byte-shodné.

Výhrada geometrie (bez akce): polygon k.ú. Bubeneč zahrnuje díl v P7;
kontext je jen praha6 (GEO). Podíl na P6 i zdvih jsou tím nadsazené
o letenský díl (≤ 42 nabídek u 1BR). Neopravuje se, nerozšiřuje se.
