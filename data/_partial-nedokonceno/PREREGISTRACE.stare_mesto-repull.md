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
