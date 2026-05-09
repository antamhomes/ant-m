import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { FileBarChart, ChevronRight, CalendarDays, TrendingUp, Wallet, Receipt, ClipboardList, BedDouble } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

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
    { icon: BedDouble, key: "report_row_occupancy" as const, value: "92%" },
    { icon: TrendingUp, key: "report_row_revenue" as const, value: "84 200 Kč" },
    { icon: Receipt, key: "report_row_costs" as const, value: "18 600 Kč" },
    { icon: Wallet, key: "report_row_net" as const, value: "65 600 Kč", highlight: true },
    { icon: ClipboardList, key: "report_row_notes" as const, value: "—" },
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "report_label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
            {t(lang, "report_title")}
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(lang, "report_desc")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
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
                    className={`font-display text-base font-semibold ${
                      highlight ? "text-gradient-gold" : "text-foreground"
                    }`}
                  >
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-foreground text-lg leading-relaxed mb-8">
              {t(lang, "report_text")}
            </p>
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-body font-medium text-[13px] tracking-[0.15em] uppercase rounded-sm hover:bg-charcoal border border-primary transition-all"
            >
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
