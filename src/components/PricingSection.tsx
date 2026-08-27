import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * Ceník: všechno, co může majitel zaplatit, na jednom místě a s cenou.
 * Existuje proto, že "žádné vstupní poplatky" přestalo platit ve chvíli,
 * kdy má Uvedení do provozu svou cenu. Radši to říct dřív než na schůzce.
 */
const ROWS: { k: "pr1" | "pr6" | "pr2" | "pr3" | "pr4" | "pr5"; accent?: boolean }[] = [
  { k: "pr1", accent: true },
  // Garance hned pod odměnou: jediné místo v ceníku, kde je vidět, co je v těch 30 % navíc.
  { k: "pr6" },
  { k: "pr2" },
  { k: "pr3" },
  { k: "pr4" },
  { k: "pr5" },
];

const PricingSection = () => {
  const { lang } = useLanguage();
  return (
    <section id="cenik" className="section bg-muted/30 scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "pricing_title")}</h2>
          <p className="lead">{t(lang, "pricing_desc")}</p>
        </Reveal>

        <Reveal as="dl" delay={0.1} className="border border-border rounded-md overflow-hidden bg-card">
          {ROWS.map(({ k, accent }, i) => (
            <div
              key={k}
              className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 px-5 py-4 ${
                i ? "border-t border-border" : ""
              }`}
            >
              <dt className="sm:w-[38%] shrink-0">
                <span className={`font-display text-[17px] ${accent ? "text-gold-deep font-semibold" : "text-foreground"}`}>
                  {t(lang, `${k}_name` as const)}
                </span>
                <span className="block font-body text-[15px] text-foreground mt-0.5 tnum">
                  {t(lang, `${k}_price` as const)}
                </span>
              </dt>
              <dd className="font-body text-[14.5px] text-muted-foreground leading-relaxed m-0">
                {t(lang, `${k}_note` as const)}
                {/* The 75/25 split, shown where the fee is defined (former PriceStrip). */}
                {k === "pr1" && (
                  <span className="block mt-3" aria-label={t(lang, "calc_split_aria") as string}>
                    <span className="flex h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted">
                      <span className="block h-full w-[75%] bg-gold" />
                      <span className="block h-full w-[25%] bg-charcoal/25" />
                    </span>
                    <span className="mt-1.5 flex max-w-sm items-baseline justify-between font-body text-[13px] tnum">
                      <strong className="font-semibold text-gold-deep">{t(lang, "pr1_split_owner")}</strong>
                      <span className="text-muted-foreground">{t(lang, "pr1_split_fee")}</span>
                    </span>
                  </span>
                )}
              </dd>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.15}>
          <p className="font-body text-[13px] text-muted-foreground leading-relaxed mt-4 text-pretty">
            {t(lang, "pricing_foot")}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default PricingSection;
