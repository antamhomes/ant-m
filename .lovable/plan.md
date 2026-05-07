
# Realistická kalkulačka výnosu

## Co se mění

Současný model `(base + extras) × multiplier × 0.45` je příliš plochý. Nahradíme ho transparentním výpočtem v krocích, který odpovídá tomu, jak Airbnb výnos reálně vzniká.

## Nový vzorec

```
ADR (cena/noc)        = base_ADR[dispozice] × multiplier_lokality × bonus_extras
hrubý měsíční výnos   = ADR × obsazenost × 30
─ úklid (přefakturace hostům, neutrální, jen zobrazit)
─ provize platforem (Airbnb 3 %, Booking 15 % → mix ~8 %)
─ provoz (energie + internet + drobné: paušál podle dispozice)
─ naše provize (% z hrubého)
= čistý výnos do kapsy majitele

dlouhodobý nájem      = LTR_table[lokalita][dispozice]   (vlastní tabulka, nezávislá)
```

## Datové tabulky (Praha 2024–2025, AirDNA / PriceLabs / sreality benchmark)

### Base ADR podle dispozice (Praha průměr, Kč/noc)
- 1+kk: 1 950
- 2+kk: 2 600
- 3+kk: 3 600
- 4+kk: 4 900

### Multiplier lokality (na ADR)
Reálnější rozpětí než dnešních 0.9–1.4:
- Praha 1: 1.55
- Praha 2: 1.30
- Praha 7: 1.15
- Praha 3: 1.05
- Praha 5: 1.00
- Praha 6: 1.00
- Praha 8: 0.85
- Praha 4: 0.85
- Praha 10: 0.80
- Praha 9: 0.75

### Obsazenost (default podle lokality)
- P1, P2, P7: 88 %
- P3, P5, P6: 82 %
- P4, P8, P10: 75 %
- P9: 70 %

### Extras (jako % bonus na ADR, ne fixní Kč)
- Balkon/terasa: +4 %
- Parking: +5 %
- Klima: +3 %
- Výhled (hrad/řeka): +8 %
- Prémiové vybavení / design: +6 %
- Wellness (vana, sauna): +5 %

### Náklady
- Provize platforem: 8 % z hrubého
- Provoz (energie+internet+spotřeba): 1+kk 2 800 / 2+kk 3 400 / 3+kk 4 200 / 4+kk 5 000 Kč/měs
- Úklid: zobrazit jako "přefakturováno hostům" → neutrální, neodečítá se
- Naše provize: 20 % z hrubého (nastavíme jako konstantu, zobrazí se transparentně)

### Tabulka dlouhodobých nájmů (Kč/měsíc, sreality 2025)
Samostatná matice lokalita × dispozice, např.:
- Praha 1: 1+kk 22 000 / 2+kk 32 000 / 3+kk 45 000 / 4+kk 62 000
- Praha 2: 1+kk 19 000 / 2+kk 28 000 / 3+kk 38 000 / 4+kk 52 000
- Praha 4: 1+kk 15 000 / 2+kk 21 000 / 3+kk 28 000 / 4+kk 38 000
- Praha 9: 1+kk 13 000 / 2+kk 18 000 / 3+kk 24 000 / 4+kk 32 000
- (atd. pro P3, P5, P6, P7, P8, P10 — vyplním všechny)

## UI změny v `CalculatorSection.tsx`

**Inputy (zachované):** lokalita, dispozice, extras — beze změn vizuálně.

**Nový input:** segmented control "Sezóna":
- "Celoroční průměr" (default, použije base obsazenost)
- "Letní špička" (obsazenost +8 pp, ADR ×1.25)
- "Zimní mimosezóna" (obsazenost −12 pp, ADR ×0.80)

**Výsledková karta (přepracovaná):**

```
PRŮMĚRNÁ CENA / NOC
2 850 Kč

─────────────────
HRUBÝ MĚSÍČNÍ VÝNOS
75 240 Kč   (88 % obsazenost × 30 nocí)

ROZPAD NÁKLADŮ ▾  (rozbalovací)
  Provize platforem (8 %)        − 6 020
  Provoz (energie, internet)     − 3 400
  Naše provize (20 %)            − 15 050
  (úklid hradí host, neodečítá se)

─────────────────
ČISTÝ VÝNOS DO KAPSY
50 770 Kč / měsíc
609 240 Kč / rok

─────────────────
DLOUHODOBÝ NÁJEM (P2, 2+kk)
28 000 Kč / měsíc

→ 1.81× více čistého oproti klasickému pronájmu
```

Hrubý zobrazit menším písmem, **čistý výnos je hlavní hero číslo** (gold gradient). Rozpad nákladů default zabalený, na klik se otevře — buduje důvěru bez zahlcení.

## Texty / disclaimer

Aktualizovat `calc_disclaimer` (CZ + VI):
> "Odhad vychází z veřejných benchmarků pro Prahu (AirDNA, PriceLabs, sreality, 2024–2025) a typického nastavení správy. Skutečný výnos závisí na stavu bytu, focení, recenzích a dynamickém pricingu — přesnější odhad uděláme po prohlídce."

## Soubory k úpravě

- `src/components/CalculatorSection.tsx` — kompletní přepis logiky `useMemo`, nová výsledková karta s rozpadem nákladů, segmented control sezóny
- `src/i18n/translations.ts` — nové klíče: `calc_season`, `calc_season_year`, `calc_season_summer`, `calc_season_winter`, `calc_adr`, `calc_gross`, `calc_breakdown`, `calc_platforms`, `calc_operations`, `calc_our_fee`, `calc_cleaning_note`, `calc_net`, `calc_ltr`, `calc_vs_ltr`, aktualizace `calc_disclaimer`

## Co se NEMĚNÍ

- Vizuální styl (gold akcenty, gradient dark karta, layout 2 sloupců)
- Sekce kolem (žádné nové sekce)
- Inputy lokalita/dispozice/extras zůstávají stejné UX
- CTA tlačítka pod výsledkem
