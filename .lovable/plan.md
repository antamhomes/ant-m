## Cíl
V hero sekci na vietnamské verzi (`/vn`) je momentálně celý druhý řádek nadpisu obarvený zlatým gradientem. Chceme zlatě zvýraznit pouze dvě klíčové fráze: **"doanh thu tốt hơn"** a **"nhẹ đầu hơn"**. Zbytek textu zůstane bílý.

Výsledný hero nadpis ve VN:
> Khai thác đúng cách:
> **doanh thu tốt hơn**, chủ nhà **nhẹ đầu hơn**.

Česká verze zůstává beze změny ("Váš byt. Naše péče." + zlatě "Váš zisk.").

## Změny

### 1. `src/i18n/translations.ts`
Rozdělit VN hero titulek na více částí, aby šly obarvit zvlášť. Nahradit dosavadní `hero_title2` (celý druhý řádek zlatě) za sekvenci textových kousků s vyznačením, co je zlaté.

Konkrétně přidat nové klíče pro VN:
- `hero_title1` = `"Khai thác đúng cách:"` (bílé)
- `hero_v_gold1` = `"doanh thu tốt hơn"` (zlaté)
- `hero_v_mid` = `", chủ nhà "` (bílé)
- `hero_v_gold2` = `"nhẹ đầu hơn"` (zlaté)
- `hero_v_end` = `"."` (bílé)

Pro CZ verzi přidat tytéž klíče tak, aby se chovala jako dnes (jen `hero_v_gold1` ponese stávající `hero_title2` "Váš zisk." a ostatní VN-specifické budou prázdné), takže layout zůstane funkční.

### 2. `src/components/HeroSection.tsx`
Upravit JSX nadpisu (řádky 44–46), aby skládal text z více kousků se správnou barvou:

```tsx
{t(lang, "hero_title1")}
<br />
<span className="text-gradient-gold">{t(lang, "hero_v_gold1")}</span>
{t(lang, "hero_v_mid")}
<span className="text-gradient-gold">{t(lang, "hero_v_gold2")}</span>
{t(lang, "hero_v_end")}
```

V CZ to bude renderovat: "Váš byt. Naše péče." + nový řádek + zlatě "Váš zisk." (prázdné CZ klíče se neobjeví). Ve VN to bude renderovat požadovaný stav s dvěma zlatými frázemi.

## Co se nemění
- Velikost, font ani spacing nadpisu
- Gradient styl `text-gradient-gold`
- Česká verze nadpisu vizuálně beze změny
- Hero podtitulek, CTA tlačítka a zbytek sekce
