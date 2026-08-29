import Reveal from "@/components/Reveal";
import { FileBarChart, ChevronRight, Wallet, Receipt, BedDouble } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Wordmark from "@/components/Wordmark";
import { t } from "@/i18n/translations";

const OwnerReportSection = () => {
  const { lang } = useLanguage();

  /* Skutečný byt místo vzoru (29. 8. 2026: řádek Rezervace odstraněn na Vuongovo přání): byt 402 (Praha 1), průměr 12 uzavřených měsíců
     do 7/2026 z Hospitable, přepočteno na odměnu 30 %. Metoda: payout
     platforem minus úklid, zrušené rezervace vyloučené, EUR × 25,00;
     91 324 × 0,30 = 27 397; majiteli 63 927 (na kartě zaokrouhleno 64 000). */
  const rows = [
    { icon: BedDouble, key: "report_row_occupancy" as const, value: "96\u00a0%" },
    { icon: FileBarChart, key: "report_row_base" as const, value: "91\u00a0324\u00a0Kč" },
    { icon: Receipt, key: "report_row_costs" as const, value: "27\u00a0397\u00a0Kč" },
    { icon: Wallet, key: "report_row_net" as const, value: "63\u00a0927\u00a0Kč", highlight: true },
  ];

  return (
    <section className="section bg-background">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "report_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "report_title")}</h2>
          <p className="lead">{t(lang, "report_desc")}</p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-7 sm:gap-10 md:gap-16 items-center max-w-5xl mx-auto">
          <Reveal
            className="reveal-card bg-card border border-border rounded-md p-6 md:p-8 shadow-[0_30px_60px_-30px_hsl(var(--charcoal)/0.35)] will-change-transform"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-gold" />
                <span className="font-display text-base font-semibold text-foreground">
                  {t(lang, "report_period")}
                </span>
              </div>
              <Wordmark on="light" size="sm" className="opacity-80" />
            </div>

            <ul className="divide-y divide-border">
              {rows.map(({ icon: Icon, key, value, highlight }) => (
                <li key={key} className="flex items-center justify-between py-3.5">
                  <span className="flex items-center gap-3 font-body text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 text-gold/70" />
                    {t(lang, key)}
                  </span>
                  <span
                    className={`font-display text-base font-semibold tnum ${
                      highlight ? "text-gold-deep" : "text-foreground"
                    }`}
                  >
                    {value}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-body text-[12px] text-muted-foreground leading-relaxed text-pretty">
              {t(lang, "report_note")}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            {t(lang, "report_text") && (
              <p className="font-body text-foreground text-[17px] md:text-lg leading-relaxed mb-5 text-pretty">
                {t(lang, "report_text")}
              </p>
            )}
            {/* Multi-property signal: one line, no "enterprise" theatre. */}
            <p className={`font-body text-[15px] text-muted-foreground leading-relaxed text-pretty ${t(lang, "report_cta") ? "mb-8" : ""}`}>
              {t(lang, "report_multi")}
            </p>
            {/* Přehled je důkaz transparentnosti, ne konverzní sekce. Prázdný
                klíč tlačítko skryje; VI si svoje CTA drží. */}
            {t(lang, "report_cta") && (
              <a href="#kontakt" className="btn btn-primary">
                {t(lang, "report_cta")}
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default OwnerReportSection;
