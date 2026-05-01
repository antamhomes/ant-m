import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "faq1_q", a: "faq1_a" },
  { q: "faq2_q", a: "faq2_a" },
  { q: "faq3_q", a: "faq3_a" },
  { q: "faq4_q", a: "faq4_a" },
];

const FAQSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="faq" className="py-16 md:py-28 px-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-4">
            {t(lang, "faq_label")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            {t(lang, "faq_title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {items.map(({ q, a }, i) => (
              <AccordionItem
                key={q}
                value={`item-${i}`}
                className="border-b border-border last:border-b-0"
              >
                <AccordionTrigger className="font-display text-base md:text-lg font-semibold text-foreground text-left py-5 hover:no-underline">
                  {t(lang, q)}
                </AccordionTrigger>
                <AccordionContent className="font-body text-[15px] text-muted-foreground leading-relaxed pb-5 pr-6">
                  {t(lang, a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
