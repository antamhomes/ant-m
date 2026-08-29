import { Eye, TrendingUp, CalendarCheck, Wallet, Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * Srovnání nájem vs Antam v ne-penězích (kontrola, výnos, flexibilita, platby).
 * Pětiletý graf se od patche 119 přestěhoval do kalkulačky jako záložka
 * „Za 5 let“, aby počítal se stejným vstupem a stejnými funkcemi jako měsíční
 * odhad. Tady zůstává jen srovnávací žebřík, který nese pasivní viditelnost
 * argumentu pro každého, kdo stránkou jen scrolluje.
 */
const LEDGER = [
  { icon: Eye, title: "comp1_title", long: "comp1_long", short: "comp1_short" },
  { icon: TrendingUp, title: "comp2_title", long: "comp2_long", short: "comp2_short" },
  { icon: CalendarCheck, title: "comp3_title", long: "comp3_long", short: "comp3_short" },
  { icon: Wallet, title: "comp4_title", long: "comp4_long", short: "comp4_short" },
] as const;

const HorizonSection = () => {
  const { lang } = useLanguage();
  return (
    <section id="horizont" className="section bg-secondary scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "whyBetter_label")}</p>
          <h2 className="h-section-sm text-foreground">
            {t(lang, "whyBetter_title1")}
            <span className="text-gradient-gold">{t(lang, "whyBetter_title2")}</span>
            {t(lang, "whyBetter_title3")}
          </h2>
          {t(lang, "whyBetter_desc") && <p className="lead">{t(lang, "whyBetter_desc")}</p>}
        </Reveal>

        <ul className="grid gap-3 max-w-2xl mx-auto mt-8 list-none m-0 p-0">
          {LEDGER.map(({ icon: Icon, title, long, short }, i) => (
            <Reveal as="li" key={title} delay={0.05 + i * 0.05} className="rounded-md border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 md:gap-2.5 px-4 pt-3.5 pb-3 border-b border-border">
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-gold shrink-0" strokeWidth={1.6} />
                <h3 className="font-display text-[15px] font-semibold text-foreground leading-snug whitespace-nowrap">
                  {t(lang, title)}
                </h3>
              </div>
              <div className="grid grid-cols-[1fr_1.15fr] md:grid-cols-[1fr_1.12fr] items-start">
                <div className="px-3 min-[360px]:px-3.5 md:px-5 pt-3 pb-3.5 md:pb-4">
                  <p className="font-body text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.14em] md:tracking-[0.2em] leading-none whitespace-nowrap text-muted-foreground mb-2 md:mb-2.5">
                    {t(lang, "longTerm_label")}
                  </p>
                  <p className="font-body text-[12px] min-[360px]:text-[13px] md:text-[15px] text-muted-foreground leading-normal md:leading-relaxed text-pretty">
                    {t(lang, long)}
                  </p>
                </div>
                <div className="px-3 min-[360px]:px-3.5 md:px-5 pt-3 pb-3.5 md:pb-4 bg-gold/[0.07] border-l border-gold/20 self-stretch">
                  <p className="font-body text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.14em] md:tracking-[0.2em] leading-none whitespace-nowrap text-gold-deep mb-2 md:mb-2.5">
                    {t(lang, "shortTerm_label")}
                  </p>
                  <div className="flex items-start gap-1.5 md:gap-2">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mt-[0.35em] text-gold-deep shrink-0" strokeWidth={2.2} />
                    <p className="font-body text-[12px] min-[360px]:text-[13px] md:text-[15px] text-foreground leading-normal md:leading-relaxed text-pretty">
                      {t(lang, short)}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HorizonSection;
