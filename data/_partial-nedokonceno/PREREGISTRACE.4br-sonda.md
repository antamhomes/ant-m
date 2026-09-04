# Předregistrace: sonda pásma 4BR (Praha 1, Praha 2)

Zapsáno **2026-09-04 11:27 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Je to **sběr dat, ne změna modelu.** Během sondy se nesahá
na `BAND_BLEND`, `SIZE_RATIO`, `CALC_MODEL_VERSION` ani nic v produkci.

## Proč

4+kk je zastropené na 3BR přes celý rozsah 70–140 m² (`BAND_BLEND["4kk"]
= { base: "3BR" }`), takže tři kbelíky 85 / 116 / 142 m² vrací totéž
číslo. Pásmo 4BR by mohlo dát každé 4+kk cestě kam blendovat — pokud
existuje jako měřitelná populace. To rozhoduje tahle sonda, nic víc.

## Sémantika poskytovatele (bez kvóty, 11:25 UTC)

Knowledge bot PriceLabs: filtr „3-bedroom" = **přesně 3**, 4BR listingy
v něm nejsou; nad 4 se seskupuje do „4+" (nejasné, jestli „4-bedroom"
= přesně 4, nebo 4+ — bot řekl obojí). Není to dokumentace; bere se
jako předpoklad. **Kontrola ve strukturovaných datech:** n 4BR výrazně
pod n 3BR a RevPAR/ADR nad 3BR. Kdyby n 4BR ≈ n 3BR nebo RevPAR ≈ 3BR,
filtr nejspíš není disjunktní → STOP.

## Výchozí stav (okresní 3BR v `MARKET_STR`)

| | ADR | RevPAR | nMean | nMin |
|---|---|---|---|---|
| Praha 1 3BR | 6 576 | 4 924,8 | 320 | 308 |
| Praha 2 3BR | 5 874 | 4 278,2 | 128 | 120 |

Celopražské poměry sousedních pásem (RevPAR): 2BR/1BR 1,517 · 3BR/2BR
1,481 — přírůstek klesá. Kdyby klesal dál, 4BR/3BR by leželo zhruba
**1,20–1,45**. Žádné pásmo 4BR nikde v repu nikdy měřené nebylo, takže
je to jen tvar očekávání.

## Očekávaný vzorek

4BR jako 20–40 % počtu 3BR: **Praha 1 ~65–130** (nMin ≥ 50 reálné),
**Praha 2 ~25–50** (nMin ≥ 50 nepravděpodobné). Okresní pásmo jde do
`MARKET_STR` jen s nMin ≥ 50 (`RELIABLE_MIN_N`; P3/P8 3BR s n ≈ 46/47
zůstaly venku). Pásmo pod prahem se změří a uloží, do produkce nejde.

## Co sonda MUSÍ odpovědět (hlášení)

1. nMin / nMean obou okresů.
2. Poměr 4BR/3BR RevPAR (a ADR) v každém okresu a jejich shoda.
3. Které pásmo projde stávající logikou spolehlivosti (nMin ≥ 50).
4. Jestli je poměr dost stabilní (mezi okresy i mezi měsíci), aby
   ospravedlnil architekturu pásma 4BR později — tj. `SIZE_RATIO
   ["4BR/3BR"]` + odvozené 4BR jinde, stejně jako dnes odvozené 3BR
   v P3/P8.

## Spouštěče vyšetřování (NE zamítnutí)

1. `4BR/3BR` RevPAR mimo 1,10–1,70 → prověřit filtr a geometrii.
2. n 4BR nad 60 % n 3BR → podezření, že filtr není disjunktní.
3. Rozdíl poměru mezi P1 a P2 nad 15 p. b. → poměr není celopražský.
4. Podíl 4BR měsíčně nestabilní (přes ±5 p. b. proti 3BR) → prověřit.

## Geometrie

Okresní pulls z 30. 8. vznikly PŘED záchytem syrové odpovědi, takže
přesný řetězec `selected_geometry_label` z té doby uložený není
(artefakt má ručně zapsané „Praha 1 official boundary (OSM)"). Dotaz
pojmenuje hranici výslovně („Praha 1, Prague, official OpenStreetMap
boundary, 4-bedroom. …"); vrácený label + source se zapíší a **schvaluje
je člověk ve STOP-hlášení** — před jakýmkoli použitím dat. P1 a P2 jsou
dvě různé geometrie, každá je „první pásmo" své vlastní; obě se hlásí
naráz, protože po sondě nic neintegruje.

Kontrola shodnosti polygonu s 30. 8.: pokud PriceLabs vrátí i 3BR
(nevrátí — dotaz je jen 4BR), nedá se ověřit přímo. Nepřímo: label
musí být okresní hranice, ne kruh ani čtvrť.

## Postup

SOP beze změny: výslovná hranice, `pl-raw.mjs` před transformací,
okno `2025_08..2026_07`, nadmnožina jen kalendářním pravidlem,
chybějící/duplicitní měsíc = STOP, `basis: measured`. Dva dotazy,
pak STOP. Kvóta: před sondou 9 pokusů okna (od 10:38 UTC), zbývá ≤ 11;
po sondě ≤ 9, rezerva ≥ 4 zachovaná.
