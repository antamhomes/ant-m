## Pr\u00e9miov\u00e9 hero CTA tla\u010d\u00edtko, kter\u00e9 sed\u00ed k Ant\u00e1m brandu

### Pro\u010d sou\u010dasn\u00e9 vypad\u00e1 levn\u011b
Te\u010f je hero CTA `bg-primary` (zelen\u00e1) s gold border + p\u0159\u00edd\u00e1n\u00fd shimmer/pulse glow. Probl\u00e9m: zelen\u00e1 v\u00fdpl\u0148 + zlat\u00fd r\u00e1me\u010dek + leskl\u00e1 animace = p\u0159\u00edli\u0161 \u201eshouty\u201c, vzd\u00e1len\u00e9 luxusn\u00edmu redak\u010dn\u00edmu stylu zbytku webu.

### Co bude pasovat k brandu
Ant\u00e1m je: **luxury editorial, b\u00edl\u00e1 + zele\u0148 + brown-gold, Playfair Display**. Hotely jako Aman, butikov\u00e9 reality s.r.o., editorial magaz\u00edny. Tomu odpov\u00edd\u00e1:

- **Tvar:** ostr\u00fd, pravo\u00fahl\u00fd (`rounded-none` nebo m\u011brn\u011b `rounded-sm`), \u017e\u00e1dn\u00e9 zaoblen\u00ed, \u017e\u00e1dn\u00e9 stuhy.
- **Vzhled:** plocha v `charcoal` (skoro \u010dern\u00e1, lad\u00ed se zelen\u00fdmi tony), text v `cream/off-white`, tenk\u00e1 zlat\u00e1 \u010d\u00e1ra **pod** textem (jako podtr\u017een\u00fd link v editorial designu) \u2014 nikoli kolem, jen pod.
- **Typografie:** men\u0161\u00ed, \u0161ir\u0161\u00ed letter-spacing (`tracking-[0.25em]`), uppercase, **DM Sans medium 12-13 px** \u2014 vzd\u00e1len\u011b krat\u0161\u00ed text, p\u016fsob\u00ed sebejist\u011b.
- **\u0160ipka:** decentn\u00ed `\u2192` (slim arrow) za textem, kter\u00e1 se p\u0159i hoveru posune doprava (+4 px). Drobn\u00e1, prov\u00e1za moment.
- **Hover:** podtr\u017een\u00ed se prota\u017ene p\u0159es celou \u0161\u00ed\u0159ku tla\u010d\u00edtka + p\u0159e\u010derven\u00e1n\u00ed pozad\u00ed o pou h\u00e9 procento. \u017d\u00e1dn\u00fd pulse, \u017e\u00e1dn\u00fd shimmer, \u017e\u00e1dn\u00fd glow. Klid je luxus.

### Vizu\u00e1ln\u011b (popis)

```
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  N E Z \u00c1 V A Z N \u011a   P R O B R A T   B Y T  \u2192     \u2502
\u2502  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 (zlat\u00e1 linka)            \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
   pozad\u00ed: charcoal #1a1a1a (HSL token)
   text: cream / off-white
   border: \u017e\u00e1dn\u00fd
   underline: gold 1px, animuje se p\u0159i hoveru
```

### Co zm\u011bnit v k\u00f3du
- `src/index.css` \u2014 p\u0159edefinovat utilitu `.btn-hero-primary` (m\u00e1 ji jen Hero):
  - charcoal pozad\u00ed, cream text
  - bez ringu/borderu
  - gold underline jako pseudo-element `::after` se scale-x 0 \u2192 1 hover
  - jemn\u00fd hover lift (`translateY(-1px)`)
- `src/components/HeroSection.tsx` \u2014 odebrat `cta-shine` t\u0159\u00eddu (vypne shimmer + gold pulse), p\u0159idat `\u2192` \u0161ipku do `<span>`.
- Sekund\u00e1rn\u00ed CTA `btn-hero-secondary` (\u201eJak to funguje\u201c) sladit \u2014 transparent + cream border, aby tvo\u0159ily hierarchii.
- **Globaln\u00ed `.cta-shine` na ostatn\u00edch CTA p\u0159es web nech\u00e1m beze zm\u011bny** \u2014 odli\u0161 od hero, ostatn\u00ed maj\u00ed jin\u00fd kontext (sekce, kalkula\u010dka). Pokud po t\u00e9to zm\u011bn\u011b chce\u0161 sjednotit, dod\u011bl\u00e1m.

### Co se NEm\u011bn\u00ed
- Text \u201eNez\u00e1vazn\u011b probrat byt\u201c (text se ti nel\u00edbil pouze tvar/barva).
- Layout hero, fonty, ostatn\u00ed sekce.
