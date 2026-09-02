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
const items = [
  { title: "svc3_title", desc: "svc3_desc" }, // ceny a obsazenost — nejsilnější, jde první
  { title: "svc2_title", desc: "svc2_desc" }, // fotky a prezentace
  { title: "svc4_title", desc: "svc4_desc" }, // hosté
  { title: "svc5_title", desc: "svc5_desc" }, // úklid a provoz
  { title: "svc1_title", desc: "svc1_desc" }, // příprava bytu
  { title: "svc6_title", desc: "svc6_desc" }, // vyúčtování
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
    <section id="sluzby" className="section bg-gradient-dark scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center eyebrow-on-dark">{t(lang, "services_label")}</p>
          <h2 className="h-section-sm text-primary-foreground">{t(lang, "services_title")}</h2>
          <p className="lead lead-on-dark">{t(lang, "services_desc")}</p>
        </Reveal>

        {INTRO_KEY[lang] && (
          <Reveal delay={0.03} className="max-w-prose mx-auto text-center -mt-2 mb-10 md:mb-12">
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
              <h3 className="font-display text-[1.15rem] md:text-[1.2rem] font-semibold text-primary-foreground mb-2 leading-snug">
                {t(lang, it.title)}
              </h3>
              <p className="font-body text-[15px] md:text-[15.5px] text-primary-foreground/70 leading-relaxed text-pretty">
                {t(lang, it.desc)}
              </p>
            </Reveal>
          ))}
        </div>

        {t(lang, "about_p3") && (
          <Reveal delay={0.18} className="max-w-prose mx-auto text-center mt-10 md:mt-12">
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
