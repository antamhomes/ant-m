## Cíl
Překalibrovat čísla v kalkulačce na realistický střed pražského trhu podle veřejných benchmarků (AirDNA, Airbtics 2025), aby výpočet odpovídal tomu, co uživatel reálně dostane. UI a struktura zůstávají; mění se jen čísla a disclaimer. Lokace zůstávají Praha 1–10.

## Reference (zaokrouhleno)
- AirDNA / Airbtics Praha 2025: trh ~13–14 tis. listingů, **occupancy ~78–81 %**, **ADR ~$107 ≈ 2 400 Kč**, roční revenue ~$32K = ~750K Kč/rok na byt.
- Sezónnost: léto +20 %, leden–únor −25 %, vrchol Vánoce/Silvestr ADR ~×1.5–2.
- LTR: zůstávají inzerované ceny (sreality benchmark, již nastaveno).

## 1. `src/components/CalculatorSection.tsx` — překalibrovat čísla

### Base ADR (Kč/noc) — baseline pro Praha 5/6 (multiplier 1.00)
Mírně dolů, aby odpovídalo trhu:
```
1+kk: 1 850   (z 1 950)
2+kk: 2 500   (z 2 600)
3+kk: 3 400   (z 3 600)
4+kk: 4 600   (z 4 900)
```

### Lokační multiplikátor a obsazenost (celoroční průměr)
Realističtější křivka centrum→okraj. Spodní hranici occupancy hlídá clamp 0.40, horní 0.98.
```
                multiplier  occupancy
Praha 1         1.45        0.85
Praha 2         1.25        0.83
Praha 3         1.05        0.80
Praha 4         0.80        0.72
Praha 5         1.00        0.78
Praha 6         0.95        0.76
Praha 7         1.15        0.83
Praha 8         0.85        0.74
Praha 9         0.70        0.68
Praha 10        0.80        0.73
```
(Vážený průměr ≈ 79 % occ a ~2 500 Kč ADR — odpovídá trhu.)

### Sezónnost (`seasonAdjust`)
```
year:   ADR ×1.00, occ +0
summer: ADR ×1.20, occ +0.05   (z ×1.25/+0.08)
winter: ADR ×0.75, occ −0.18   (z ×0.80/−0.12 — leden/únor jsou opravdu hluché)
xmas:   ADR ×1.55, occ +0.10   (z ×1.60 — drobně dolů, realističtěji)
```

### Náklady — beze změny (potvrzeno: Úklid + drogerie + internet)
- Platforma: 8 %
- Naše fee: 15.5 %
- Úklid: 10× měsíčně × cena dle dispozice (600/700/900/1100)
- Drogerie + internet: 1200/1400/1700/2000 Kč/měs
- Energie se NEZAPOČÍTÁVÁ (platí host, resp. dosud neplatíš)

### Extras — beze změny

## 2. `src/i18n/translations.ts` — disclaimer
Aktualizovat poslední větu, aby odkazovala na konkrétní zdroje a rok:
- CS: „Odhad vychází z veřejných benchmarků pro Prahu (AirDNA, Airbtics, sreality, 2025) a typického nastavení správy Antám. Skutečný výnos záleží na stavu bytu, focení, recenzích a dynamickém pricingu — přesnější odhad uděláme po prohlídce."
- VI: ekvivalentní úprava.

## 3. Bez dalších úprav
- Layout, tlačítka, ikony, breakdown panel — vše stejné.
- LTR tabulka beze změny (uživatel chce inzerované nájmy).
- Formulace „Hrubý/Čistý" beze změny.

## Sanity check (Praha 2, 2+kk, celoročně, bez extras)
- ADR = 2 500 × 1.25 = 3 125 Kč
- occ 83 %, 30 nocí → gross ≈ 77 800 Kč
- − platforma 8 % (6 200) − úklid 7 000 − drogerie+internet 1 400 − naše fee 15.5 % (12 060)
- ≈ **51 100 Kč/měsíc čistého** vs LTR 28 000 Kč → ~1.8×, sedí na realistický střed.
