import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

// Per-brand wordmark styling that approximates each company's own typography.
const partners: { name: string; className: string; style?: React.CSSProperties }[] = [
  {
    name: "airbnb",
    className: "text-2xl md:text-[28px] font-semibold tracking-tight lowercase",
    style: { fontFamily: '"Circular", "Nunito", "Inter", system-ui, sans-serif' },
  },
  {
    name: "Booking.com",
    className: "text-xl md:text-2xl font-bold tracking-tight",
    style: { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  },
  {
    name: "Hospitable",
    className: "text-xl md:text-2xl font-semibold tracking-tight",
    style: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' },
  },
  {
    name: "PriceLabs",
    className: "text-xl md:text-2xl font-bold tracking-[-0.01em]",
    style: { fontFamily: '"Montserrat", "Inter", sans-serif' },
  },
  {
    name: "Claude",
    className: "text-xl md:text-2xl tracking-tight",
    style: { fontFamily: '"Copernicus", "Tiempos", "Charter", Georgia, serif' },
  },
  {
    name: "TTLock",
    className: "text-xl md:text-2xl font-bold tracking-wide uppercase",
    style: { fontFamily: '"Helvetica Neue", Arial, sans-serif' },
  },
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

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14 md:gap-y-6">
          {partners.map((p, i) => (
            <motion.span
              key={p.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={p.style}
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