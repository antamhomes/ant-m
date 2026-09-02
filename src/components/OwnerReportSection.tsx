import Reveal from "@/components/Reveal";
import { ChevronRight, Wallet, Receipt, BedDouble, FileBarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Wordmark from "@/components/Wordmark";
import { t } from "@/i18n/translations";

const OwnerReportSection = () => {
  const { lang } = useLanguage();

  /* Skutečný byt místo vzoru (29. 8. 2026: řádek Rezervace odstraněn na Vuongovo přání): byt 402 (Praha 1), průměr 12 uzavřených měsíců
     do 7/2026 z Hospitable, přepočteno na odměnu 30 %. Metoda: payout
     platforem minus úklid, zrušené rezervace vyloučené, EUR × 25,00;
     91 324 × 0,30 = 27 397; majiteli 63 927 (na kartě zaokrouhleno 64 000). */
  // CZ has no side text and no CTA: the card sits centred and the multi-flat line
  // goes under it. VI keeps its side column (report_text + report_cta).
  const hasSide = !!(t(lang, "report_text") || t(lang, "report_cta"));
  const rows = [
    { icon: BedDouble, key: "report_row_occupancy" as const, value: lang === "cs" ? "96\u00a0%" : "96%" },
    { icon: FileBarChart, key: "report_row_base" as const, value: "91\u00a0324\u00a0Kč" },
    { icon: Receipt, key: "report_row_costs" as const, value: "27\u00a0397\u00a0Kč" },
    { icon: Wallet, key: "report_row_net" as const, value: "63\u00a0927\u00a0Kč", highlight: true },
  ];

  return (
    <section id="vyuctovani" className="section bg-background scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "report_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "report_title")}</h2>
          <p className="lead">{t(lang, "report_desc")}</p>
        </Reveal>

        <div className={hasSide ? "grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 md:gap-16 items-start" : "max-w-xl space-y-5"}>
          {/* AD 2. 9. 2026: bez karty. Tohle je doklad, ne widget: stín,
              zaoblení a ikonka u každého řádku z něj dělaly UI prvek, zatímco
              má číst jako výpis, který si majitel přepočítá. */}
          <Reveal>
            <div className="flex items-baseline justify-between gap-4 pb-3.5 border-b border-foreground/25">
              <span className="font-body text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
                {t(lang, "report_period")}
              </span>
              <Wordmark on="light" size="sm" className="opacity-70" />
            </div>

            <ul className="m-0 p-0 list-none">
              {rows.map(({ key, value, highlight }) => (
                <li
                  key={key}
                  className={`flex items-baseline justify-between gap-6 py-3.5 ${
                    highlight ? "border-y border-foreground/25 mt-0.5" : "border-b border-border"
                  }`}
                >
                  <span className={`font-body text-[14.5px] ${highlight ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {t(lang, key)}
                  </span>
                  <span
                    className={`whitespace-nowrap font-display tnum ${
                      highlight ? "text-[26px] sm:text-[30px] font-semibold text-gold-deep" : "text-[19px] sm:text-[21px] text-foreground/85"
                    }`}
                  >
                    {value}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-body text-[12px] text-muted-foreground leading-relaxed text-pretty max-w-[70ch]">
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
            <p className={`font-body text-[15px] text-muted-foreground leading-relaxed text-pretty ${t(lang, "report_cta") ? "mb-8" : ""} ${hasSide ? "" : ""}`}>
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
