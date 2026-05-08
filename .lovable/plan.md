## Cíl
Upravit rozpad nákladů: odečítat **provizi platforem 15,5 %** (Airbnb/Booking) místo naší provize. Naše fee zmizí z výpočtu a místo něj bude pod rozpadem poznámka, že naše provize a energie do kalkulace nevstupují.

## Změny

### `src/components/CalculatorSection.tsx`
- Přejmenovat konstantu `OUR_FEE = 0.155` → `PLATFORM_FEE = 0.155`.
- Ve výpočtu: `const platformFee = Math.round(gross * PLATFORM_FEE);`
- `net = gross − platformFee − cleaning − supplies` (naše fee pryč).
- V `result` vracet `platformFee` místo `ourFee`.
- V breakdown (rozpad nákladů) vykreslit:
  1. Provize platforem (15,5 %) − …
  2. Úklid (10× měs.) − …
  3. Internet + drogerie − …
- Pod seznamem nechat poznámku `calc_excluded_note` (už existuje, jen aktualizujeme text).

### `src/i18n/translations.ts`
- Upravit `calc_excluded_note`:
  - CS: „Naše provize a energie nejsou v kalkulaci zahrnuty."
  - VI: „Phí dịch vụ của chúng tôi và tiền điện/nước không được tính trong dự toán."
- (`calc_platforms` už existuje — „Provize platforem".)

## Bez dalších úprav
- ADR, lokace, sezóny, LTR tabulka, layout, ikonky — beze změny.
- Disclaimer pod kalkulačkou — beze změny.

## Sanity check (Praha 2, 2+kk, celoročně)
- gross ≈ 77 800 Kč
- − platforma 15,5 % (12 060) − úklid 7 000 − drogerie+internet 1 400
- ≈ **57 300 Kč/měs čistého** (před naší provizí, kterou si bereme zvlášť)
