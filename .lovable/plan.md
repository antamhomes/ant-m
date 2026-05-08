## Realističtější obsazenost a ceny pro slabší sezónu

### Co je teď špatně
V kalkulačce jsou pro „Slabší sezóna (zima)" tato čísla:
- ADR koeficient: **×0,72** (sleva 28 %) — moc pesimistické
- Obsazenost: location occupancy − 3 pp, pak clampnuto na min 0,78

Reálně i v lednu/únoru/březnu má dobře vedený byt v Praze 85–92 % occupancy a ceny jsou max −15 % vs. roční průměr (víkendy a delší pobyty si drží svou hodnotu).

### Návrh úprav

V `seasonAdjust` v `src/components/CalculatorSection.tsx`:
- **winter**: ADR z `0.72` → **`0.88`** (jen −12 % vs base, místo −28 %)
- **winter**: occDelta z `-0.03` → **`+0.05`** (lehký posun nahoru, ne dolů — slabší cena přitahuje delší pobyty)

V clamp logice:
- Spodní hranici occupancy z `0.78` → **`0.88`** (minimum 88 % pro všechny scénáře, jak chceš)
- Horní hranici nechat na `0.98`

### Dopad na hlavní lokace (2+kk)
Pro Praha 2 (base occ 0,83):
- Dnes zima: occ = max(0.78, 0.83−0.03) = 0,80 → **80 %**
- Po změně: occ = max(0.88, 0.83+0.05) = **88 %**

Pro Praha 1 (base occ 0,85):
- Dnes zima: 0,82 → **82 %**
- Po změně: max(0.88, 0.90) = **90 %**

Jiné sezóny taky benefitují z vyššího floor (pokud někde occ vychází pod 88, posune se tam).

### Co se NEmění
- Logika výpočtu, struktura, ostatní sezóny (year/summer/xmas zůstávají), překlady, popisky.
- Ratio vs LTR se přepočítá automaticky.
