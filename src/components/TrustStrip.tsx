import { motion } from "framer-motion";
import { ShieldCheck, LineChart, Sparkles, FileBarChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const items = [
  { icon: ShieldCheck, key: "trust1" as const },
  { icon: LineChart, key: "trust2" as const },
  { icon: Sparkles, key: "trust3" as const },
  { icon: FileBarChart, key: "trust4" as const },
];

const TrustStrip = () => {
  const { lang } = useLanguage();
  return (
    <section className="pt-8 pb-10 md:pb-12 px-6 bg-secondary/40">
      <div className="max-w-6xl mx-auto flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-2 md:gap-4 overflow-x-auto scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
        {items.map(({ icon: Icon, key }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border bg-card"
          >
            <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold shrink-0" />
            <span className="font-body text-xs md:text-sm text-foreground whitespace-nowrap">{t(lang, key)}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrustStrip;
