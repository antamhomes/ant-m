## Cíl
Ve VN hero nadpisu nechat zlatě **pouze** "nhẹ đầu hơn". Fráze "doanh thu tốt hơn" bude bílá jako zbytek.

Výsledek:
> Khai thác đúng cách:
> doanh thu tốt hơn, chủ nhà **nhẹ đầu hơn**.

## Změna

### `src/components/HeroSection.tsx`
V VN větvi nadpisu odstranit `<span className="text-gradient-gold">` kolem "doanh thu tốt hơn" – nechat jen jako prostý text. Zlatý gradient zůstane jen na "nhẹ đầu hơn".

CZ verze beze změny.
