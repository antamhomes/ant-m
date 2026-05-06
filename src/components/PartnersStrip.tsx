import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

// Decentní wordmark loga partnerských platforem.
// Až budou k dispozici oficiální PNG/SVG, lze je sem dosadit.
const partners = [
  { name: "Airbnb", className: "font-display italic text-2xl md:text-[28px] tracking-tight" },
  { name: "Booking.com", className: "font-body font-semibold text-xl md:text-2xl tracking-tight" },
  { name: "Hospitable", className: "font-display text-xl md:text-2xl tracking-wide" },
  { name: "PriceLabs", className: "font-body font-medium text-xl md:text-2xl tracking-[-0.02em]" },
  { name: "Claude AI", className: "font-body font-semibold text-xl md:text-2xl tracking-tight" },
  { name: "TTLock", className: "font-body font-semibold text-xl md:text-2xl tracking-tight" },
];

const PartnersStrip = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-8 md:py-10 px-6 bg-background border-y border-border/60">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center font-body text-[11px] md:text-xs text-muted-foreground tracking-[0.25em] uppercase mb-6 md:mb-7"
        >
          {t(lang, "partners_label")}
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-12 md:gap-y-6">
          {partners.map((p, i) => (
            <motion.span
              key={p.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`text-foreground/55 hover:text-foreground transition-colors duration-300 select-none ${p.className}`}
            >
              {p.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;