import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import airbnbLogo from "@/assets/partners/airbnb.svg";
import bookingLogo from "@/assets/partners/booking.svg";
import claudeLogo from "@/assets/partners/claude.svg";

type Partner =
  | { name: string; logo: string; logoClass?: string }
  | { name: string; className: string };

const partners: Partner[] = [
  { name: "Airbnb", logo: airbnbLogo, logoClass: "h-7 md:h-8" },
  { name: "Booking.com", logo: bookingLogo, logoClass: "h-5 md:h-6" },
  { name: "Hospitable", className: "font-display text-xl md:text-2xl tracking-wide" },
  { name: "PriceLabs", className: "font-body font-medium text-xl md:text-2xl tracking-[-0.02em]" },
  { name: "Claude AI", logo: claudeLogo, logoClass: "h-6 md:h-7" },
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

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14 md:gap-y-7">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="opacity-60 hover:opacity-100 transition-opacity duration-300 select-none flex items-center"
            >
              {"logo" in p ? (
                <img
                  src={p.logo}
                  alt={p.name}
                  loading="lazy"
                  className={`${p.logoClass ?? "h-6"} w-auto object-contain [filter:grayscale(1)_brightness(0.4)]`}
                />
              ) : (
                <span className={`text-foreground ${p.className}`}>{p.name}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;