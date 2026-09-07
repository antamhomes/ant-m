# Předregistrace: 4+kk blend 3BR → 4BR (návrh, FÁZE 1 — jen ke schválení)

Zapsáno **2026-09-07 18:05 UTC.** Model se NEMĚNÍ: tohle je návrh pravidla
s čísly z prototypu (git worktree mimo repo, patch
`pl-tmp/4br-proto-opt1.patch`, do repa se nedostal). Implementace až po
schválení PŘESNÉHO pravidla člověkem (fáze 2, vlastní commit, regrese
jen řádky `4kk`). `CALC_MODEL_VERSION` se v této fázi nemění.

## Co se řeší

`BAND_BLEND["4kk"] = { base: "3BR" }` bez `next` → plocha 4+kk nemůže
zvednout STR, kbelíky s/m/l vracejí totéž (docs/calculator-model.md,
„Plochá zóna"). 3+kk ten problém nemá (2BR → 3BR, lo 65 / hi 95).

## Důkazní základ (sebraný, žádná další kvóta)

| zdroj | 3BR RevPAR / n | 4BR RevPAR / n | 4BR/3BR RevPAR | ADR | po měsících | spolehlivost |
|---|---|---|---|---|---|---|
| Praha celá (`praha.3BR-4BR.json`) | 4 337,9 / 715 (nMin 676) | 6 262,5 / 187 (nMin 184) | **1,444** | 1,419 | 1,32–1,55 | obě pásma měřená, nMin ≥ 50 |
| Praha 1 (`praha1.4BR.json`) | 4 924,8 / 320 | 6 612,8 / 95 (nMin 94) | **1,343** | 1,358 | 1,24–1,44 | měřené, nMin ≥ 50 |
| Praha 2 (`praha2.4BR.json`) | 4 278,2 / 128 | 6 074,3 / 31 (nMin 27) | 1,420 | 1,372 | 0,98–1,94 | tenké, jen směr |
| Praha bez P1 (dopočet) | ≈ 395 | ≈ 92 | 1,526 | — | — | odvozené z rozdílu |

Sestupný přírůstek mezi pásmy drží: 2BR/1BR 1,517 → 3BR/2BR 1,481 →
4BR/3BR 1,444. Rozptyl mezi zdroji ±7 % (1,343–1,526). Kontrola: P2
odvozené 4 278,2 × 1,444 = 6 178 proti přímo měřeným 6 074 (+1,7 %) —
poměr sedí i na tenkém okresu; P1 odvozené by bylo 7 111 proti měřeným
6 613 (+7,5 %) — proto P1 dostane VLASTNÍ měřenou buňku.

## Návrh pravidla (k rozhodnutí bod po bodu)

1. **`Band` += `"4BR"`**, `BAND_LABEL["4BR"]` = „4+ ložnice" / „4+ phòng
   ngủ" (a `"3BR"` se přejmenuje z „3+ ložnice" na „3 ložnice").
   `BAND_ORDER` += `"4BR"`.
2. **`MARKET_STR.praha1["4BR"]`** = `{ adr: 8930, revpar: 6612.8, nMean: 95,
   nMin: 94 }` — jediný okres, kde 4BR projde bránou nMin ≥ 50. P2 (nMin
   27) do `MARKET_STR` NEJDE, odvozuje se.
3. **`SIZE_RATIO["4BR/3BR"] = { adr: 1.419, revpar: 1.444 }`** z celopražské
   řady (jediný zdroj s oběma pásmy nad prahem a velkým n). Alternativy
   k rozhodnutí: 1,343 (= vážený průměr přes okresy s oběma pásmy ≥ 50,
   tj. dnešní recept `SIZE_RATIO` — jenže to je JEN P1, nejdražší okres
   s nejnižším poměrem) nebo 1,526 (Praha bez P1 — relevantnější pro
   „ostatní", ale dopočet, ne měření). **Doporučení: 1,444**, s ±7 %
   výhradou zapsanou v doc-commentu.
4. **`RATIO_OF["3BR>4BR"]`** → `marketCell(loc, "4BR")` odvodí 4BR JEDNÍM
   krokem z měřeného 3BR (P2, P5). **Žádné řetězení**: okresy bez
   měřeného 3BR (P3, P4, P6, P7, P8, P9, P10) 4BR buňku NEDOSTANOU →
   `nextCell = null` → 4+kk tam zůstává ploché jako dnes. Přímý poměr
   „4BR/2BR" by dnes vyšel jen z P1 (1,945) — nejnižší okres v Praze,
   jediný zdroj → **nedoporučuje se**; doplní se, až bude 4BR změřené
   v dalším okresu s měřeným 2BR (nebo 3BR).
5. **`BAND_BLEND["4kk"] = { base: "3BR", next: "4BR", lo: 93, hi: 132 }`**
   — `lo`/`hi` = dnešní hrany kbelíků s/m a m/l (p25/p75 stocku), stejně
   jako u 3+kk jsou lo/hi = hrany 65/95. Váhy: s (85 m²) w 0 · m (116 m²)
   w 0,59 · l (142 m²) w 1,0 (3+kk pro srovnání: 0 / 0,43 / 1,0). Hranice
   kbelíků se tím NEMĚNÍ (pravidlo „kde dispozice překlápí pásmo, dělí se
   na lo a hi" je splněné dnešními hranami) → `SIZE_BUCKETS` beze změny.
6. **Čtvrťové kontexty (rozhodnout A/B):**
   - **A (prototyp):** `localCell(loc, "4BR", ctvrt)` → čtvrť pásmo 4BR
     nemá → vrací OKRESNÍ 4BR. Lokální efekt se u 4BR ztrácí: Vinohrady
     v P2 (3BR 7,8 % pod okresem) dostanou l +40,0 %, okres +33,3 %;
     Smíchov +36,6 % vs P5 +33,3 %; Nové Město v P1 +27,2 % vs +25,7 %.
   - **B (doporučení):** když čtvrť 4BR nemá, `4BR = localCell(loc, "3BR",
     ctvrt) × SIZE_RATIO["4BR/3BR"]` (jeden krok z lokálního 3BR, `derived:
     true`). Relativní zdvih je pak všude stejný — l +33,3 %, m +19,6 % —
     a lokální efekt 3BR se přenáší do 4BR. V P1 (měřené okresní 4BR) by
     B dala Starému Městu 3BR 4 988 × 1,444 = 7 202 místo měřených okresních
     6 613 → **v P1 platí A** (měřené okresní 4BR má přednost před
     poměrem), B jen tam, kde je okresní 4BR samo odvozené. Tohle je nový
     mechanismus v `localCell`, ne jen datový řádek.
7. **Popisek pásma:** `bandForSize` dnes vrací `next`, jakmile w ≥ 0,5,
   bez ohledu na to, jestli `nextCell` existuje → v P3–P10 by web psal
   „4+ ložnice" a počítal na 3BR (prototyp: 192 řádků se změněným
   popiskem a nezměněnými čísly). Fáze 2 musí popisek odvodit z reálného
   blendu (`shownCell`), ne z `BAND_BLEND`.
8. **Rozpětí kbelíku s (w = 0):** dnes `SPREAD` ±8 % (dispozice bez
   překlopení), po změně `minWidth` ±4 % (jako s-kbelík 2+kk/3+kk). Střed
   se nemění (±1 Kč zaokrouhlení). Je to důsledek stávajícího vzorce, ne
   záměr — zapsat jako známý vedlejší efekt, nebo výslovně rozhodnout.
9. **`CALC_MODEL_VERSION`:** hranice kbelíků se nemění, ale ekonomika 4+kk
   ano a leady ukládají `calc_model_version`. Doporučení pro fázi 2: nová
   verze (`2026-09-xx.1`) se STEJNÝMI kbelíky, aby šlo zpětně říct, které
   4+kk odhady byly ploché. Rozhodne člověk.
10. **Testy k úpravě ve fázi 2** (prototyp spadl přesně tady, nikde jinde):
    `facts.test` „drží tržní data" (čte 4BR z 2026-08 artefaktu → P1 4BR
    je v `praha1.4BR.json`), „derivedWiden" (předpokládá 4kk bez
    překlopení), „efekt Antam" (mapa 4BR → 4kk / 105 m² a vzorec pro
    dispozici bez překlopení); `size-monotonicity` PAIRS += `["3BR","4BR"]`
    a regex výjimek `[1234]BR`.

## Přesné výstupy prototypu (varianta 3 = 1,444, bod 5, čtvrti = A), rok

`mid` = střed veřejného odhadu (Kč/měsíc majiteli). Sezóny se mění o
totéž procento (P1 l: léto/zima/Vánoce shodně +25,7 %).

| kontext | s před → po | m před → po | l před → po |
|---|---|---|---|
| praha1 okres (+ Ostatní) | 82 695 → 82 695 (0 %) | 82 695 → 95 231 (**+15,2 %**) | 82 695 → 103 953 (**+25,7 %**) |
| praha1 / Staré Město | 83 753 → 83 752 | → 95 822 (+14,4 %) | → 104 217 (+24,4 %) |
| praha1 / Nové Město | 81 461 → 81 460 | → 94 543 (+16,1 %) | → 103 644 (+27,2 %) |
| praha2 okres (+ Ostatní) | 76 571 → 76 571 | → 91 608 (**+19,6 %**) | → 102 069 (**+33,3 %**) |
| praha2 / Nové Město | 86 828 → 86 828 | → 97 329 (+12,1 %) | → 104 633 (+20,5 %) |
| praha2 / Vinohrady | 72 113 → 72 113 | → 89 122 (+23,6 %) | → 100 954 (+40,0 %) |
| praha5 okres (+ Ostatní, + Košíře) | 65 203 → 65 203 | → 78 007 (+19,6 %) | → 86 915 (+33,3 %) |
| praha5 / Smíchov | 63 247 → 63 247 | → 76 917 (+21,6 %) | → 86 426 (+36,6 %) |
| P3, P4, P6, P7, P8, P9, P10, jinde — všechny kontexty | beze změny | beze změny (jen popisek, bod 7) | beze změny (jen popisek) |

Rozpětí: P1 l ±6,8 % (měřené 4BR), P2/P5 l ±13,3 % (odvozené 4BR →
`derivedWiden`), s-kbelík ±4 % místo ±8 % (bod 8). ADR ukázané u m/l =
4BR (P1 8 930; P2 8 335 = 5 874 × 1,419; P5 7 945). Obsazenost m/l =
4BR RevPAR/ADR (P1 74,1 %).

Citlivost na poměr (bod 3), okresy s odvozeným 4BR: 1,343 → l +25,7 % /
m +15,2 %; **1,444 → +33,3 % / +19,6 %**; 1,526 → +39,5 % / +23,3 %.
Mechanika: `mid = gBase + 0,75·w·(gNext − gBase)` (LOW_BLEND 0,5 na
spodku, celé překlopení nahoře — beze změny proti 3+kk).

## Důkaz „hýbou se jen řádky 4+kk"

Diff baseline (2 304 kombinací, `b62708f`) × prototyp: 0 přidaných,
0 odebraných, **336 změněných, všech 336 je `4kk`**, 0 mimo 4+kk. Z toho
144 s číselnou změnou (P1/P2/P5 × 4 kontexty × s/m/l × 4 sezóny; u s jen
rozpětí a ±1 Kč) a 192 jen popisek pásma (bod 7 — po opravě popisku 0).
Monotonie podle velikosti: test prošel (s ≤ m ≤ l všude; 4BR RevPAR >
3BR v každém dosažitelném kontextu). Ostatní testy, které spadly, jsou
přesně ty v bodu 10 — všechny kódují dnešní plochou zónu.

## Co se NEnavrhuje

- žádná přirážka za m² uvnitř pásma, žádná kapacitní heuristika;
- žádné řetězení poměrů (3BR odvozené × 4BR/3BR) — P3–P10 zůstávají
  ploché, dokud nemají měřené 3BR nebo přímý 4BR poměr s důkazem;
- žádná změna `lo`/`hi` u 2+kk/3+kk, `SPREAD`, `LOW_BLEND`, `ctvrtWeight`;
- 1+kk se neřeší (druhý konec ploché zóny čeká na kapacitní důkazy,
  viz předregistrace z 2. 9. 2026).

## Stav

**ČEKÁ NA SCHVÁLENÍ člověkem** — body 3 (poměr), 5 (lo/hi), 6 (A/B),
8, 9. Fáze 2 = implementace + testy z bodu 10 + regrese s očekáváním:
mimo `4kk` 0 změn, `4kk` s: střed beze změny, m/l: jen P1/P2/P5 kontexty
(a jejich čtvrti/Ostatní), P3–P10 beze změny včetně popisku.
