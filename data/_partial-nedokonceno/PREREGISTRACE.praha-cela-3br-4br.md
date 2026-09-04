# Předregistrace: Praha-celá 3BR + 4BR

Zapsáno **2026-09-04 11:42 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Sběr dat pro kalibraci poměru 4BR/3BR, **ne změna modelu.**

## Proč

Sonda 4BR (P1 nMin 94, poměr 1,343; P2 n ≈ 30, poměr 1,420) dala jeden
spolehlivý zdroj poměru. `SIZE_RATIO` dnes stojí na víc okresech se
solidním vzorkem obou pásem; než se navrhne `SIZE_RATIO["4BR/3BR"]`,
je potřeba druhý zdroj s velkým n. Praha jako celek ho dá dvěma dotazy.
`praha-cela.json` z 30. 8. je „all sizes" (n ≈ 10 500), obě pásma se
tedy musí změřit.

**Výhrada předem:** celopražský poměr NENÍ nezávislý na P1 — Praha 1 je
odhadem ~40 % pražských 3BR (320 z ~800) a ~40 % 4BR (95 z ~250).
Nezávislá je zbylá ~60% část; poměr celku se bude číst s tímhle vědomím.

## Očekávání

| | n (odhad) | nMin ≥ 50 | RevPAR (odhad) |
|---|---|---|---|
| Praha 3BR | ~700–900 | ano | ~4 000–4 600 |
| Praha 4BR | ~200–280 | ano | ~5 400–6 300 |

Poměr 4BR/3BR RevPAR **1,30–1,42** (P1 1,343, P2 1,420); n4/n3 ~0,22–0,32.
Kdyby celopražský poměr vyšel POD P1 (P1 je nejdražší okres a 4BR tam
mohou být prémiovější), je to informace o rozptylu mezi okresy, ne chyba.

## Spouštěče vyšetřování (NE zamítnutí)

1. `4BR/3BR` RevPAR mimo 1,15–1,60 → prověřit filtr a geometrii.
2. `n4/n3` mimo 0,15–0,45 → totéž.
3. Praha 3BR n pod 500 nebo nad 1 500 → geometrie není celá Praha.
4. Poměr po měsících mimo ±15 % kolem průměru → zaznamenat.
5. Rozdíl proti P1 nad 15 p. b. → poměr není celopražsky stabilní;
   návrh `SIZE_RATIO["4BR/3BR"]` by pak potřeboval další okresy.

## Geometrie

Očekává se `Prague official boundary` / `Praha official boundary`
+ `openstreetmap` (srpnový artefakt má ručně „Prague official boundary
(OSM)"). Cokoli s „circle" nebo s jiným místem = zamítnout. Po 3BR
STOP na schválení znak po znaku; 4BR s pojmenovanou hranicí v téže
session. Obě pásma sdílí jednu geometrii — jeden polygon, dva filtry.

## Co se s daty smí a nesmí

Smí: syrový záchyt, artefakt `data/pricelabs-2026-09/praha.3BR-4BR.json`
(samostatný; `praha-cela.json` se nepřepisuje), import do DB jako
`geo_id = 'praha'`, level `praha`, pásma 3BR a 4BR (vyžaduje migraci
`20260904120000_str_market_band_4br.sql`).
Nesmí: `SIZE_RATIO`, `BAND_BLEND`, `MARKET_STR`, `CALC_MODEL_VERSION`.
Návrh pásma 4BR je samostatná změna s vlastní předregistrací.

Kvóta: před voláním 11 pokusů okna, zbývá ≤ 9; po dvou dotazech ≤ 7.

---

## Výsledek (2026-09-04 11:45 / 11:50 UTC) — pokusy 12 a 13 okna

Geometrie schválena člověkem znak po znaku: `Prague official boundary`
+ `openstreetmap` (shodné s ručním labelem srpnového `praha-cela.json`).
Obě pásma 12/12 měsíců, bez nadmnožiny, identity sedí.

| | ADR | RevPAR | occ | nMean | nMin | raw |
|---|---|---|---|---|---|---|
| Praha 3BR | 6 082 | 4 337,9 | 70,5 % | 715 | 676 | 45ccec91… |
| Praha 4BR | 8 632 | 6 262,5 | 71,7 % | 187 | 184 | aabf426f… |

**4BR/3BR RevPAR = 1,444** (ADR 1,419), po měsících 1,32–1,55, n4/n3 0,262.
Proti očekávání 1,30–1,42 o kousek výš; spouštěč #1 (1,15–1,60) nesepnul,
#2 (0,15–0,45) ne, #3 ne (n 3BR 715), #4 ne (±8 % kolem průměru),
#5 ne (rozdíl proti P1 10 p. b. < 15).

Rozklad podle P1 (45 % pražských 3BR, 51 % 4BR): zbytek Prahy bez P1 má
3BR 3 862 / 4BR 5 901 → poměr **1,528**. Tedy P1 (1,343) je DOLNÍ okraj,
P2 1,420, město 1,444, mimo-P1 1,528. Prémie 4BR je mimo centrum
relativně větší. Klesající přírůstek mezi pásmy drží:
2BR/1BR 1,517 → 3BR/2BR 1,481 → 4BR/3BR 1,444 (město).

Co to znamená pro návrh (zapsáno, NEROZHODNUTO): kandidát
`SIZE_RATIO["4BR/3BR"]` by byl městský 1,444 (RevPAR) / 1,419 (ADR),
konzistentní s tím, jak jsou postavené ostatní poměry (velký vzorek obou
pásem). Rozptyl mezi okresy (1,34–1,53) je větší než u 3BR/2BR (3,4 %),
takže odvozené 4BR mimo P1 by neslo ±7 % nejistotu — přiznat v návrhu.

Artefakt `data/pricelabs-2026-09/praha.3BR-4BR.json`, import `geo_id
= 'praha'`, level `praha`. Žádná změna modelu.
