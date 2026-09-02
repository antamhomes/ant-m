# Art direction: co je zmrazené a proč

Stav k 1. 9. 2026. Referenční vykreslení je `docs/art-direction.html`, otevři ho
přímo v prohlížeči z repa. Není to produkční kód, je to vzorník kompozice.
Kanonický obsah a pořadí sekcí řeší `docs/calculator-model.md` a translations,
tenhle soubor řeší jen vizuální rozhodnutí.

## Pravidlo, které rozhoduje spory

Velikost si zaslouží jen číslo, pod kterým je fakt. `64 000 Kč`, `30 %`,
`31 500 Kč` projdou. Dekorativní „luxusní" styling bez faktu pod tím se maže.

Dvě selhání vypadají podobně a řeší se opačně:

- **Falešně prémiové** je velikost bez obsahu: velký prvek, který je jen
  stylistická volba, prázdné místo, které nic neodděluje.
- **Poddimenzované** je velikost odebraná něčemu skutečnému, například když se
  zmenší reálná částka majitele, protože stránka působila nabubřele.

Poměr reálný byznys / art je zhruba 75:25. Ne každá sekce má být stejně
„tasteful". Antam nemá být tišší, má být míň falešný.

## Zmrazené

- Rozdělený hero, fotografie vpravo, tmavě zelená vlevo.
- Sekce Výsledky je vizuální vrchol po heru: **jeden byt**, ne katalog.
  Velká fotografie, která vystupuje z gridu k levému okraji, velká částka,
  minimum metadat. Víc bytů působí jako galerie, jeden jako důkaz.
- Pod tím řádek s rozpětím dalších bytů (57 000 … 30 000) a „Další výsledky".
  Ten řádek je tam schválně: sám ukazuje, že rozpětí jde dolů k 30 000, takže
  hlavní číslo nevypadá jako vybraná třešnička.
- Velké `30 %` v ceníku, pod ním ledger, který si čtenář může přepočítat.
- Garance bez plovoucí karty, jen čísla na lince.
- Tmavě zelená sekce Co za vás řešíme jako druhý vizuální náraz.
- Playfair Display + DM Sans. Mono jen na provozní metadata, ne na běžný text.
- Žádné karty, pilulky ani gradienty navíc.

## Rytmus stránky

WOW → PROOF → MONEY → RISK → OPERATIONS → TRANSPARENCY → HUMAN → KALKULAČKA

Chytrost patří do hera, Výsledků, `30 %`, Garance a tmavé sekce. Kalkulačka,
kontakt a FAQ mají hlavně fungovat, být sevřené a tiché.

## Mobil

Čistá reinterpretace, ne reprodukce desktopové asymetrie. Fotka nad daty,
částka pod fotkou, metadata pod ní. Nic se neschovává za swipe.

## Dva rozdíly mezi vzorníkem a repem

1. **Playfair 400 normal repo nemá.** Vzorník původně sázel displejové řezy
   v 400; `public/fonts` má jen 500/600/700 normal a 400 italic. Reference
   proto používá 500 a je o něco těžší než návrh. Pokud chceš lehčí dojem,
   doplň `playfair-display-{latin,latin-ext}-400-normal.woff2`. Pro `/vn` chybí
   i vietnamská podmnožina v 400, takže tam by zatím zůstalo 500.
2. **Žádný mono font se nepřidává.** Reference bere systémový mono
   (SF Mono / Menlo). Kdyby se někdy sázel vlastní, je to dalších ~38 kB.

## Otevřené

- Copy pass na pět míst, kde web říká „byt nejdřív posoudíme" (`g_step1`,
  `faq13`, `PortfolioSection.soonDesc`, `calc_unsupported_text` a dvě CTA).
  Nechat jednu silnou formulaci, zbytek změkčit, ať se majitel z doporučení
  necítí nekvalifikovaný.
- Mobilní reinterpretace Ceníku a Garance nad rámec prostého stohování.
- Portrét zakladatele jen tehdy, když existuje dobrá přirozená fotka.
  „Fotka zakladatele = autenticita" je taky klišé, nedělat na sílu.
