import { Camera, MessageSquare, ReceiptText, TrendingUp, Wrench } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import ReviewsBlock from "@/components/ReviewsBlock";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

/**
 * CO ZA VÁS ŘEŠÍME (obnoveno 2B).
 *
 * services_* a svc1–svc6 v repu byly napsané, ale nerenderovaly se nikde.
 * Přitom je to jediná sekce, která odpovídá na otázku „za co platím 30 %".
 *
 * ZÁMĚRNĚ TO NENÍ MŘÍŽKA ŠESTI KARET S IKONAMI. Šest podstatných jmen
 * (ceny, inzeráty, hosté, úklid, údržba, reporting) sděluje rozsah, ale ne
 * práci — a právě práce je ten argument. Každá položka proto nese celou větu
 * o chování, ne štítek. Sekce se drží jednoho tvrzení nahoře (services_desc)
 * a šesti důkazů pod ním.
 *
 * 2. 9. 2026: blok „Proč to nedělat sám přes Airbnb?" odsud pryč. Otázka
 * v display řezu uprostřed stránky nečte jako otázka návštěvníka, ale jako
 * obhajoba proti alternativě; šest položek nad ní tu práci ukazuje samo.
 * Klíč faq14 v translations.ts zůstává pro schůzku a MCP.
 *
 * Sekci uzavírají recenze hostů: 520+ hodnocení tady nejsou popularita,
 * ale doklad, že hostitelská část provozu opravdu funguje.
 */
/* AD 7. 9. 2026: emoji pryč, značku provozu nesou line-ikony ve firemní zlaté.
   Emoji tady od 2. 9. dělaly rychlé skenování, ale nesly barvy, které ke
   značce nepatří (modrá, žlutá, zelená), a vedle Playfairu působily levně.
   Zlaté ikony se zkoušely už 2. 9. a tehdy propadly, protože seděly ve
   vlastních rámečcích a udělaly ze sekce „premium šablonu". Tady rámečky
   nejsou: ikona je malý znak na účaří nadpisu, přesně tam, kde stálo emoji,
   ve stejné velikosti a ve zlaté z wordmarku. Pravidlo zůstává: značka = co
   se v bytě dělá, nikdy ne peníze, garance, nadpis ani CTA. Pro odečítačky
   jsou aria-hidden, význam nesou nadpisy. */
/* Smeták: lucide koště nemá, tohle je dokreslené ve stejném stylu (24×24,
   currentColor, kulaté konce, žádná výplň), aby mezi ostatními ikonami
   nešlo poznat, že je odjinud. Nasada, rozsirena hlava, paska a dve stetiny: sikmy smetak se v 19 px slil do fajfky.
   9. 9. 2026 rozsireno na x 4-20: kresba byla jen 10 z 24 jednotek siroka, takze
   mezi lucide ikonami (16-20) vypadala v radku odsazena doprava. */
const Broom = ({ strokeWidth = 2, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v7" />
    <path d="M7.2 9h9.6l3.2 12H4Z" />
    <path d="M5.4 15.5h13.2" />
    <path d="M9.8 15.5 9.1 21" />
    <path d="M14.2 15.5 14.9 21" />
  </svg>
);

const items = [
  { Icon: TrendingUp,   title: "svc3_title", desc: "svc3_desc" }, // ceny a obsazenost — nejsilnější, jde první
  { Icon: Camera,       title: "svc2_title", desc: "svc2_desc" }, // fotky a prezentace
  { Icon: MessageSquare, title: "svc4_title", desc: "svc4_desc" }, // hosté
  { Icon: Broom,        title: "svc5_title", desc: "svc5_desc" }, // úklid a provoz
  { Icon: Wrench,       title: "svc1_title", desc: "svc1_desc" }, // příprava bytu
  { Icon: ReceiptText,  title: "svc6_title", desc: "svc6_desc" }, // vyúčtování
] as const;

/**
 * QA-08: v češtině sekce říkala jednu myšlenku třikrát za sebou — nadpis
 * („Už to dávno není jen ‚pronajmout byt'."), lead (services_desc) a pak
 * about_p2. Navíc about_p2 předem vyjmenoval to, co je hned pod ním jako
 * šest konkrétních položek, takže mřížka přicházela už utracená. V CZ se
 * proto nerenderuje; klíč v translations.ts zůstává a VI se nemění.
 */
const INTRO_KEY: Record<"cs" | "vi", TranslationKey | null> = {
  cs: null,
  vi: "about_p2",
};

const ServicesSection = () => {
  const { lang } = useLanguage();

  // 2D: TMAVÁ SEKCE. Až sem stránka jede na krému a teplé šedi; tady se
  // podklad zlomí do firemní zelené. Není to dekorace: tohle je místo, kde se
  // z „model dává smysl" stává „aha, TOHLE za tím stojí". Barva je existující
  // bg-gradient-dark (stejná jako závěrečný pruh), žádná nová. Původní design
  // tuhle sekci tmavou měl, proto na ni ReviewsBlock celou dobu nesl tokeny
  // pro tmavé pozadí.
  return (
    <section id="sluzby" className="section bg-gradient-dark scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center eyebrow-on-dark">{t(lang, "services_label")}</p>
          <h2 className="h-section-sm text-primary-foreground">{t(lang, "services_title")}</h2>
          <p className="lead lead-on-dark">{t(lang, "services_desc")}</p>
        </Reveal>

        {INTRO_KEY[lang] && (
          <Reveal delay={0.03} className="max-w-prose -mt-2 mb-10 md:mb-12">
            <p className="font-body text-[15px] md:text-base text-primary-foreground/70 leading-relaxed text-pretty">
              {t(lang, INTRO_KEY[lang]!)}
            </p>
          </Reveal>
        )}

        {/* Hairline mřížka bez rámečků: karty by z šesti důkazů udělaly šest
            produktů. Zlatý vlas odděluje, nic neohraničuje. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-14">
          {items.map((it, i) => (
            <Reveal
              key={it.title}
              delay={stagger(i, 0.05)}
              className="py-5 sm:py-6 border-t border-gold/25"
            >
              <h3 className="flex items-start gap-2.5 font-display text-[1.15rem] md:text-[1.2rem] font-semibold text-primary-foreground mb-2 leading-snug">
                <it.Icon aria-hidden="true" strokeWidth={1.5} className="shrink-0 w-[19px] h-[19px] mt-[3px] text-gold-on-dark" />
                {t(lang, it.title)}
              </h3>
              <p className="font-body text-[15px] md:text-[15.5px] text-primary-foreground/70 leading-relaxed text-pretty">
                {t(lang, it.desc)}
              </p>
            </Reveal>
          ))}
        </div>

        {t(lang, "about_p3") && (
          <Reveal delay={0.18} className="max-w-prose mt-10 md:mt-12">
            <p className="font-body text-[15px] md:text-base text-primary-foreground/90 leading-relaxed text-pretty">
              {t(lang, "about_p3")}
            </p>
          </Reveal>
        )}


        <ReviewsBlock />
      </div>
    </section>
  );
};

export default ServicesSection;
