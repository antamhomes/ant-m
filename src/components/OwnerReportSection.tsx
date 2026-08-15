import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { FileBarChart, ChevronRight, CalendarDays, TrendingUp, Wallet, Receipt, ClipboardList, BedDouble } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { reveal, revealDelayed } from "@/lib/motion";

const OwnerReportSection = () => {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });
  const cardY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, 0]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-1.5, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.96, 1]);

  const rows = [
    { icon: CalendarDays, key: "report_row_reservations" as const, value: "12" },
    { icon: BedDouble, key: "report_row_occupancy" as const, value: "80 %" },
    { icon: TrendingUp, key: "report_row_revenue" as const, value: "76 000 Kč" },
    { icon: Receipt, key: "report_row_costs" as const, value: "19 000 Kč" },
    { icon: Wallet, key: "report_row_net" as const, value: "57 000 Kč", highlight: true },
    { icon: ClipboardList, key: "report_row_notes" as const, value: "—" },
  ];

  return (
    <section ref={ref} className="section bg-background">
      <div className="container-wide">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "report_label")}</p>
          <h2 className="h-section text-foreground">{t(lang, "report_title")}</h2>
          <p className="lead">{t(lang, "report_desc")}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
          <motion.div
            style={{ y: cardY, rotate: cardRotate, scale: cardScale }}
            className="bg-card border border-border rounded-md p-6 md:p-8 shadow-[0_30px_60px_-30px_hsl(var(--charcoal)/0.35)] will-change-transform"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-gold" />
                <span className="font-display text-base font-semibold text-foreground">
                  {t(lang, "report_period")}
                </span>
              </div>
              <span className="font-body text-xs text-muted-foreground tracking-wider lowercase">
                antam homes
              </span>
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
          </motion.div>

          <motion.div {...revealDelayed(0.1)}>
            <p className="font-body text-foreground text-lg md:text-xl leading-relaxed mb-8 text-pretty">
              {t(lang, "report_text")}
            </p>
            <a href="#kontakt" className="btn btn-primary">
              {t(lang, "report_cta")}
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OwnerReportSection;
