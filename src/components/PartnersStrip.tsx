import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import airbnbLogo from "@/assets/partners/airbnb.png";
import bookingLogo from "@/assets/partners/booking.png";
import hospitableLogo from "@/assets/partners/hospitable.png";
import pricelabsLogo from "@/assets/partners/pricelabs.png";
import claudeLogo from "@/assets/partners/claude.png";
import ttlockLogo from "@/assets/partners/ttlock.png";

const partners = [
  { name: "Airbnb", logo: airbnbLogo },
  { name: "Booking.com", logo: bookingLogo },
  { name: "Hospitable", logo: hospitableLogo },
  { name: "PriceLabs", logo: pricelabsLogo },
  { name: "Claude", logo: claudeLogo },
  { name: "TTLock", logo: ttlockLogo },
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

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14 md:gap-y-8">
          {partners.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="opacity-80 hover:opacity-100 transition-opacity duration-300"
              title={p.name}
            >
              <img
                src={p.logo}
                alt={p.name}
                loading="lazy"
                className="h-10 md:h-12 w-auto object-contain rounded-md"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;