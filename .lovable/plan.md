
# Finální polish — antam homes

Cíl: dotáhnout existující web do hotového premium stavu. Žádné nové sekce, žádné nové animace, žádné stock fotky. Pouze úpravy kontrastu, spacingu, mobile, čitelnosti a konverze.

## Poznámka k typografii
V zadání zmiňuješ Manrope + Inter, ale projekt (a tvoje uložená brand pravidla) používá **Playfair Display (nadpisy) + DM Sans (body)**. Držím tedy Playfair + DM Sans — pokud chceš opravdu přepnout na Manrope/Inter, řekni a udělám zvlášť.

---

## 1. Hero (`HeroSection.tsx`)
- Mírně zesílit gradient overlay zespodu, aby měl text větší prioritu, ale obraz nebyl celkově tmavší (zesílit jen spodní 60 % gradientu, horní část ponechat světlejší).
- Primární CTA „Nezávazně probrat byt" — přidat jemný gold glow / outline ring, aby vystupovala nad sekundárním CTA. Zvětšit padding o ~2 px na mobilu.
- Sekundární CTA „Spočítat výnos" — ponechat outline, sjednotit šířku na mobilu (`w-full` ve stacku).
- Floating dekorativní karty (pokud jsou v hero) — ověřit `pointer-events-none` a `aria-hidden`.
- Subtitle text zesvětlit z `/60` na `/75` pro lepší čitelnost.

## 2. Stats (`StatsSection.tsx`)
- Disclaimer už existuje (`stats_disclaimer`) — zkontrolovat / upravit text v `i18n/translations.ts` na: „Výsledky se liší podle lokality, stavu bytu, sezóny a nastavení ceny." (CZ + VI).
- Ověřit, že hodnoty stat1/stat2 obsahují slovo „až" (např. „až 95 %", „až 2,8×"). Pokud ne, upravit překlady.
- Zmenšit horizontální gap na mobilu, aby se 2x2 grid lépe vešel.

## 3. Portfolio (`GallerySection.tsx`)
- Aspect ratio karet upravit na `aspect-[3/4]` (dominantnější fotka, méně textu pod ní).
- Hover zoom zjemnit z `scale-[1.05]` na `scale-[1.025]`, prodloužit duration.
- Padding textové části zmenšit (`p-5 md:p-6`), zkrátit popisky max 2 řádky (`line-clamp-2`).
- Tagy zredukovat na max 2 — přebytek skrýt.
- **Mobile**: přepnout grid na horizontální swipe carousel pomocí existujícího `ui/carousel.tsx` (Embla). Na `md:` zpět grid.
- Lokační badge nechat, ale přesunout do horního rohu s polo-průhledným pozadím.

## 4. Kalkulačka (`CalculatorSection.tsx`)
- Disclaimer už existuje pod kalkulačkou (`calc_disclaimer`) — upravit text na: „Výpočet je orientační. Přesnější odhad uděláme po zhlédnutí bytu a lokality." (CZ + VI).
- Pod existující CTA „Mám zájem o spolupráci" přidat **sekundární textový odkaz** „Chci přesnější odhad →" který scrolluje na `#kontakt` s předvyplněnou message (jen scroll, bez form prefill — držíme jednoduché).
- Disclaimer vizuálně oddělit jemnou tenkou linkou nahoře (`border-t border-border/50 pt-6`).
- Ověřit kontrast labelů (`text-primary-foreground/50` → `/65`) v dark výsledkové kartě.

## 5. Karty & spacing (globální průchod)
Projít: `BenefitsSection`, `ServicesSection`, `WhyBetterSection`, `ProcessSection`, `OwnerReportSection`, `AboutSection`, `FAQSection`.
- Sjednotit vertikální padding sekcí: `py-16 md:py-24` (teď je mix `py-16 md:py-16 md:py-20` — duplicitní třídy, opravit).
- Karty: pokud má karta velkou prázdnou plochu pod krátkým textem, zmenšit padding místo přidávání textu.
- Zarovnat všechny gridy na `gap-6 md:gap-8`.
- Zkontrolovat, že žádná karta nemá `min-h` který tvoří díry.

## 6. Typography (čitelnost)
- Body text: zvýšit kontrast tam, kde je `text-muted-foreground` na světlém pozadí pod 14 px — minimální velikost body 15 px.
- Gold barva (`text-gold`, `text-gradient-gold`) — audit: použít **pouze** na malé eyebrow labely, čísla a 1-3slovné akcenty. Nahradit gold u jakéhokoliv odstavce delšího než ~6 slov za `text-foreground` nebo `text-muted-foreground`.
- VI line-height v `index.css` už nastaven (`:lang(vi) { line-height: 1.7 }`) — přidat `lang="vi"` atribut na `<html>` přes `LanguageContext` (teď chybí), aby pravidla zabrala.
- Upravit `LanguageProvider` aby setoval `document.documentElement.lang` při změně jazyka.

## 7. Mobile audit (priorita)
- Hero CTA: `flex-col` stack, oba buttony `w-full` s `max-w-xs mx-auto`.
- Sticky CTA `StickyMobileCTA` — ověřit že se neskrývá pod systémovým UI (safe-area už je řešena, OK).
- Portfolio carousel (viz #3).
- Kalkulačka: location grid `grid-cols-2` (teď `grid-cols-2 sm:grid-cols-3` — OK), ověřit že tlačítka nepřetékají s VI textem.
- Form (`ContactSection`): inputy na mobilu `text-base` (16 px) aby iOS nezoomoval.
- Jazykový přepínač CZ/VI — zvětšit tap target na min 44×44 px.
- Projít všechny sekce při 375 px viewportu a opravit horizontální overflow.

## 8. Animace
Ponechat beze změny (hero parallax, portfolio reveal, timeline fill, report float, fade-up sekcí). Pouze:
- Zkontrolovat, že všechny `whileInView` mají `viewport={{ once: true, margin: "-50px" }}` aby nezáblo na mobilu.
- Žádné nové animace.

## 9. Footer (`Footer.tsx`)
Stávající má: brand, IČO, telefon, e-mail, Praha, copyright, jazyk. Doplnit:
- Přidat řádek odkazů: **„Zásady ochrany osobních údajů" / „Cookies"** v bottom row vedle IČO. Zatím odkazy `href="#"` (placeholder) — pokud chceš reálné stránky, řeknu.
- Zarovnání kontaktů zkontrolovat na mobilu (telefon clickable `tel:` — už je).
- Přidat `rel="noopener"` kde chybí.

---

## Soubory k editaci
- `src/components/HeroSection.tsx`
- `src/components/StatsSection.tsx`
- `src/components/GallerySection.tsx` (carousel na mobilu)
- `src/components/CalculatorSection.tsx`
- `src/components/ContactSection.tsx` (font-size mobile)
- `src/components/Footer.tsx` (GDPR/Cookies)
- `src/contexts/LanguageContext.tsx` (set `<html lang>`)
- `src/i18n/translations.ts` (texty disclaimers, CTA, GDPR)
- Lehké úpravy v: `BenefitsSection`, `ServicesSection`, `WhyBetterSection`, `ProcessSection`, `AboutSection`, `FAQSection`, `OwnerReportSection` (jen spacing/padding sjednocení a gold audit).

## Co NEBUDU dělat
- Nepřidávám nové sekce.
- Nepřidávám nové animace.
- Neměním fonty na Manrope/Inter (držím Playfair + DM Sans dle brandu).
- Nepřidávám stock fotky.
- Neměním strukturu Index.tsx.

Schvaluješ? Po schválení projdu vše v jednom průchodu.
