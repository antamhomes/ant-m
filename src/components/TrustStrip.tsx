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
    <section className="py-8 px-6 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {items.map(({ icon: Icon, key }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card"
          >
            <Icon className="w-4 h-4 text-gold" />
            <span className="font-body text-sm text-foreground">{t(lang, key)}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrustStrip;
