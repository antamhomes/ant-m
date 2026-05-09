## Cíl
V `BenefitsSection.tsx` zkompaktnit benefit boxy na mobilu — zmenšit padding, písmo a mezery, popis ponechat. Desktop zůstane beze změny.

## Změny v `src/components/BenefitsSection.tsx`

### Karta (každý box)
- Padding: `p-5 md:p-8` → `p-4 md:p-8`
- Mezera mezi ikonou a textem (mobile flex layout): `gap-4` → `gap-3`

### Ikona
- Velikost wrapperu: `w-10 h-10 md:w-12 md:h-12` → `w-9 h-9 md:w-12 md:h-12`
- Ikona uvnitř: `w-5 h-5 md:w-6 md:h-6` → `w-4 h-4 md:w-6 md:h-6`

### Title
- `text-lg md:text-xl` → `text-base md:text-xl`
- `mb-1.5 md:mb-2.5` → `mb-1 md:mb-2.5`

### Description
- `text-[15px] md:text-[15.5px]` → `text-[13.5px] md:text-[15.5px]`
- `leading-[1.65]` → `leading-[1.55] md:leading-[1.65]`

### Mezery v gridu
- `gap-5 md:gap-6 lg:gap-7` → `gap-3 md:gap-6 lg:gap-7`

### Section padding
- `py-20 md:py-32` → `py-14 md:py-32` (víc dechu pro celou sekci na mobilu)

## Soubor
- `src/components/BenefitsSection.tsx` (jediný)