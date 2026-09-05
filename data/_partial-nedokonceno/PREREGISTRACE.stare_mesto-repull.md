# Předregistrace: Staré Město re-pull s měsíční řadou (1BR / 2BR / 3BR)

Zapsáno **2026-09-04 11:42 UTC, PŘED voláním** — plánováno na DALŠÍ okno
kvóty (od ~10:38 UTC 5. 9. 2026). Zmrazeno teď, aby se očekávání
nedopisovala po prvním výsledku.

## Proč

Staré Město je jediná produkční čtvrť bez syrové provenience
(`RECONSTRUCTED_CELLS`): pull 30. 8. přes market_research, měsíční řada
neuložená, `nMin: null`, ADR neověřitelné. Re-pull s řadou to zavře:
nMin poprvé známé, `reliable` odvozené, řádek z `RECONSTRUCTED_CELLS`
zmizí.

## Co říká produkce DNES (dvě úložiště se NESHODUJÍ)

| pásmo | `MARKET_CTVRT` adr / revpar / nMean | DB `praha1_stare_mesto` adr / revpar / n_min |
|---|---|---|
| 1BR | 3 206 / 2 467,4 / 533 | 3 207 / 2 467 / 533 |
| 2BR | 4 886 / 3 733,7 / 297 | **4 700 / 3 479** / 297 |
| 3BR | 6 353 / 4 809,4 / 110 | **6 350 / 4 560** / 110 |

2BR a 3BR se mezi kódem a DB liší o 5–7 % RevPAR. Re-pull rozhodne,
KTERÉ číslo bylo správně (nebo žádné) — to je hlavní diagnostická
hodnota. Předem se netipuje.

## Očekávání

n ≈ 533 / 297 / 110 (podle rekonstrukce; nMin poprvé). RevPAR v okolí
dnešních hodnot; odchylka do ±5 % = normální drift mezi 30. 8. a datem
re-pullu (P2 3BR 2. 9. sedlo 60/60, takže drift by měl být malý).

## Spouštěče vyšetřování (NE zamítnutí)

1. Kterékoli pásmo mimo ±8 % proti OBĚMA dnešním hodnotám → prověřit
   geometrii (rekonstrukce mohla mít jiný polygon).
2. n mimo ±15 % rekonstrukce → totéž.
3. `nMin` pod 50 u 3BR → váha podle `ctvrtWeight` z nMean, jako všude.

## Integrace (až po přejímce, vlastní commit)

Naměřené hodnoty NAHRADÍ rekonstruované bez ohledu na shodu — měřené
vítězí, to je pravidlo od 31. 8. V regresi se smějí měnit JEN řádky
`praha1|stare_mesto|…`; všechny ostatní 0. DB řádky se aktualizují přes
trigger `str_market_no_history_rewrite` — pokud `annual_rev` sedí,
projde; pokud ne, STOP a rozhodnout (historie se tiše nepřepisuje).

## Geometrie

Nová v zachycené podobě. Očekává se `Staré Město official boundary`
+ `openstreetmap`; po 1BR STOP na schválení. Josefov je samostatné
k.ú. — nesmí být uvnitř; kdyby n 1BR vyšlo výrazně nad 533, podezření.

---

## Pokus 1 (2026-09-05 16:37 UTC, nové okno kvóty): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Staré Město, Prague, official OpenStreetMap boundary,
1-bedroom. For each month from August 2025 through July 2026 give: …`

- `selected_geometry_label`: **`Old Town official boundary`** — ANGLICKY,
  ne „Staré Město official boundary", jak předregistrace čekala (stejný
  vzor jako Nové Město → „New Town official boundary")
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Staré Město, Prague` · session `lg_sess_Z0dgM9e7nUTiuZewx0azpyqkRvgo96Ow`
- 12/12 měsíců, bez nadmnožiny, identity sedí; raw `eea7bb1c…`

| | rekonstrukce 30. 8. (`MARKET_CTVRT`) | re-pull | rozdíl |
|---|---|---|---|
| ADR | 3 206 | 3 210,6 | +0,14 % |
| RevPAR | 2 467,4 | 2 469,2 | +0,07 % |
| „nMean" | 533 | **nMean 566,8 / nMin 533** | — |

**Zjištění:** rekonstruované „533" bylo ve skutečnosti MINIMUM řady
(září 2025 = 533), ne průměr — přesně chyba, kterou 31. 8. popsal
komentář k `MarketRow` (staré pole `listings` drželo minimum). Skutečný
nMean 1BR je 567. RevPAR a ADR sedí na 0,1 %, tedy tentýž polygon a
prakticky tatáž data — nepřímý důkaz, že „Old Town official boundary" je
geometrie, ze které rekonstrukce vznikla. Spouštěče #1 a #2 nesepnuly.
Podíl na P1 1BR 0,338 (0,33–0,34 stabilní), RevPAR 1,119 okresu.

Schválení geometrie: **OTEVŘENÉ**, čeká na člověka (řetězec je jiný, než
se čekalo, proto se nesmí předpokládat).

## Pokusy 2 a 3 (2026-09-05 16:40 / 16:42 UTC): 2BR a 3BR ÚSPĚCH

Geometrie schválena člověkem znak po znaku (`Old Town official boundary`
+ `openstreetmap`). 2BR i 3BR v téže session; u obou stejný label + zdroj,
ověřeno zvlášť. 12/12 měsíců, bez nadmnožiny, identity sedí.

| pásmo | re-pull ADR / RevPAR / occ | nMean / nMin | vs KÓD (`MARKET_CTVRT`) | vs DB | podíl na P1 | RevPAR/P1 | raw |
|---|---|---|---|---|---|---|---|
| 1BR | 3 211 / 2 469,2 / 75,9 % | 567 / 533 | +0,14 % / **+0,07 %** | +0,11 % / +0,09 % | 0,338 | 1,119 | eea7bb1c… |
| 2BR | 4 867 / 3 774,2 / 76,4 % | 321 / 296 | −0,39 % / **+1,08 %** | +3,55 % / **+8,48 %** | 0,355 | 1,110 | 351bdae0… |
| 3BR | 6 588 / 4 987,8 / 74,7 % | 114 / 111 | +3,71 % / **+3,71 %** | +3,75 % / **+9,38 %** | 0,358 | 1,013 | e3b0eba6… |

**Rozhodnuto daty:** ve sporu kód vs DB měl u 2BR a 3BR pravdu KÓD
(`MARKET_CTVRT`: 1,1 % a 3,7 % od měření); DB řádky `praha1_stare_mesto`
2BR/3BR byly o 8,5–9,4 % pod skutečností. 3BR odchylka +3,7 % je shodná
u ADR i RevPAR při stejné obsazenosti → rekonstrukce měla o ~3,6 % nižší
cenovou úroveň (jiná sada měsíců nebo kurz), ne jiný polygon. Spouštěč #1
(±8 % proti OBĚMA) nesepnul, #2 (n ±15 %) ne.

**„n" v rekonstrukci = MINIMUM, ne průměr:** 533 / 297 / 110 vs dnešní
nMin 533 / 296 / 111. Skutečné nMean 567 / 321 / 114. Všechna tři pásma
w 1,0 (nMean ≥ 100), poprvé s doloženým nMin.

Poměry: `2BR/1BR = 1,529`, `3BR/1BR = 2,020` (model 1,567 / 2,427 →
−2,4 % / −16,8 %; 3BR ve Starém Městě je proti 1BR relativně slabší —
RevPAR jen 1,013 okresu P1, kdežto 1BR/2BR 1,11–1,12).

Artefakt `data/pricelabs-2026-09/stare_mesto.json` (sha256 `2867127e…`),
tři pásma measured, raw_provenance kompletní. Kvóta: 3 pokusy okna.

### K rozhodnutí před integrací
1. Kód: `MARKET_CTVRT.stare_mesto` ← měřené buňky (adr 3211 / 4867 / 6588,
   revpar 2469,2 / 3774,2 / 4987,8, nMean 567 / 321 / 114, nMin 533 / 296
   / 111), řádek `stare_mesto` z `RECONSTRUCTED_CELLS` pryč. Regrese:
   měnit se smějí JEN řádky `praha1|stare_mesto|…`.
2. DB: existující řádky `praha1_stare_mesto` mají `annual_rev` z rekonstrukce
   → trigger `str_market_no_history_rewrite` upsert ZASTAVÍ (správně).
   Trigger má výslovný ventil pro záměrný přepis: `set local
   antam.allow_history_rewrite = 'on'` v téže transakci. Tady je přepis
   záměr (rekonstrukce → měření), ale rozhoduje člověk.
