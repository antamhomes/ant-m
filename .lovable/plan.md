## Cíl
Doplnit do kalkulačky 4. sezónní tlačítko **Advent & Nový rok** (cca 22.12.–2.1.), které reflektuje silnou poptávku konce roku. Zima zůstane "hluché" období (leden–únor).

## Změny

### 1. `src/components/CalculatorSection.tsx`
- Rozšířit `Season` na `"year" | "summer" | "winter" | "xmas"`.
- `seasonAdjust`:
  - `year`: ADR ×1.00, occ +0
  - `summer`: ADR ×1.25, occ +0.08
  - `winter`: ADR ×0.80, occ −0.12 (beze změny)
  - `xmas`: **ADR ×1.60, occ +0.10**
- Sezónní tlačítka přepnout z `grid-cols-3` na `grid-cols-2 sm:grid-cols-4`, aby se 4 možnosti vešly čitelně i na mobilu.

### 2. `src/i18n/translations.ts`
Přidat klíč `calc_season_xmas`:
- CS: `"Advent & Nový rok"`
- VI: `"Giáng sinh & Năm mới"`

### 3. Bez dalších úprav
ADR multiplikátory, LTR tabulka, náklady, formula net — beze změny.

## Co tím získáme
- Reálnější UX: zima ≠ celá zima; konec roku je samostatná špička.
- Vánoční/silvestrovské ADR typicky ~2× nad celoročním průměrem (PriceLabs / AirDNA Praha 2024).
