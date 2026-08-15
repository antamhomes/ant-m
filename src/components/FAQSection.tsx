import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { reveal, revealDelayed } from "@/lib/motion";

const items: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "faq1_q", a: "faq1_a" },
  { q: "faq2_q", a: "faq2_a" },
  { q: "faq3_q", a: "faq3_a" },
  { q: "faq4_q", a: "faq4_a" },
  { q: "faq5_q", a: "faq5_a" },
  { q: "faq6_q", a: "faq6_a" },
  { q: "faq7_q", a: "faq7_a" },
  { q: "faq8_q", a: "faq8_a" },
];

const FAQSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="faq" className="section bg-background scroll-mt-16">
      <div className="container-prose">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "faq_label")}</p>
          <h2 className="h-section text-foreground">{t(lang, "faq_title")}</h2>
        </motion.div>

        <motion.div {...revealDelayed(0.1)}>
          <Accordion type="single" collapsible className="w-full">
            {items.map(({ q, a }, i) => (
              <AccordionItem
                key={q}
                value={`item-${i}`}
                className="border-b border-border last:border-b-0"
              >
                <AccordionTrigger className="font-display text-lg md:text-xl font-semibold text-foreground text-left py-5 hover:no-underline">
                  {t(lang, q)}
                </AccordionTrigger>
                <AccordionContent className="font-body text-[15px] md:text-base text-muted-foreground leading-relaxed pb-6 pr-8 text-pretty">
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
