
# Úprava kalkulačky — reálné parametry

## Změny v modelu

### 1. Naše provize: 20 % → **15.5 %**
Konstanta `OUR_FEE = 0.155`. Aktualizovat zobrazení v rozpadu nákladů ("Naše provize (15,5 %)").

### 2. Úklid: počítá se jako náklad (ne přefakturace)
- **Cena za úklid (dle dispozice):** 1+kk 600 / 2+kk 700 / 3+kk 900 / 4+kk 1 100 Kč
- **Četnost:** fixně **10 úklidů / měsíc** (na základě tvojí praxe)
- Měsíční náklad = cena × 10
- V rozpadu nahradit řádek "úklid hradí host" za skutečný řádek **„Úklid (10× měs.)" − X Kč**
- Odstranit `calc_cleaning_note`

### 3. Provoz: jen internet + drogerie (energie ne)
Energii platí majitel ve scénáři Airbnb i dlouhodobého pronájmu — neutrální, vyhodit z kalkulačky.

Nové hodnoty (jen internet + drogerie + drobná spotřeba pro hosty):
- 1+kk: 1 200 Kč/měs (internet 600 + drogerie/spotřebky 600)
- 2+kk: 1 400 Kč
- 3+kk: 1 700 Kč
- 4+kk: 2 000 Kč

Přejmenovat label v rozpadu: „Provoz (energie, internet)" → **„Internet + drogerie"** (CZ) / „Internet + đồ tiêu hao" (VI).

### 4. Vzorec čistého výnosu
```
net = gross − platformFee(8%) − cleaning(10× × cena) − supplies(internet+drogerie) − ourFee(15.5%)
```

## Soubory

- `src/components/CalculatorSection.tsx`
  - `OUR_FEE = 0.155`
  - `sizes`: nahradit `opex` za `supplies` s novými čísly + přidat `cleaningPrice`
  - `CLEANINGS_PER_MONTH = 10`
  - `useMemo` rozšířit o `cleaning` a `supplies`, započítat do `net`
  - V rozpadu zobrazit 4 řádky: Provize platforem, Úklid (10×), Internet + drogerie, Naše provize (15,5 %); odstranit cleaning note
- `src/i18n/translations.ts`
  - Přejmenovat `calc_operations` → "Internet + drogerie" / "Internet + đồ tiêu hao"
  - Přidat `calc_cleaning: "Úklid (10× měs.)"` / "Dọn dẹp (10×/tháng)"
  - Odstranit `calc_cleaning_note` (nebo nechat nepoužitý — bezpečnější ponechat)

## Co se NEMĚNÍ
- ADR, multipliery lokality, obsazenost, sezónní logika
- LTR tabulka
- Layout / vizuál karty
