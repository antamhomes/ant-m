import { motion } from "framer-motion";
import { Eye, TrendingUp, CalendarCheck, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const compIcons = [Eye, TrendingUp, CalendarCheck, Wallet];
const compTitleKeys = ["comp1_title", "comp2_title", "comp3_title", "comp4_title"] as const;
const compLongKeys = ["comp1_long", "comp2_long", "comp3_long", "comp4_long"] as const;
const compShortKeys = ["comp1_short", "comp2_short", "comp3_short", "comp4_short"] as const;

const WhyBetterSection = () => {
  const { lang } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="eyebrow eyebrow-center mb-5">
            {t(lang, "whyBetter_label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
            {t(lang, "whyBetter_title1")}
            <span className="text-gradient-gold">{t(lang, "whyBetter_title2")}</span>
            {t(lang, "whyBetter_title3")}
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-3xl mx-auto">
            {t(lang, "whyBetter_desc")}
          </p>
        </motion.div>

        {isMobile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Accordion type="single" collapsible defaultValue="item-0" className="divide-y divide-border/70 border-y border-border/70">
              {compIcons.map((Icon, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-0"
                >
                  <AccordionTrigger className="px-1 py-5 hover:no-underline transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      <Icon className="w-5 h-5 text-gold shrink-0" strokeWidth={1.5} />
                      <span className="font-display text-lg font-medium tracking-tight text-foreground">
                        {t(lang, compTitleKeys[index])}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-1">
                    <div className="relative pl-5 mb-6">
                      <span
                        aria-hidden
                        className="absolute left-0 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-gold via-gold/60 to-transparent"
                      />
                      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                        {t(lang, "shortTerm_label")}
                      </span>
                      <p className="mt-2 font-body text-[15px] text-foreground leading-[1.55]">
                        {t(lang, compShortKeys[index])}
                      </p>
                    </div>
                    <div className="pl-5 border-l border-border/60">
                      <span className="font-body text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground/70">
                        {t(lang, "longTerm_label")}
                      </span>
                      <p className="mt-2 font-body text-[15px] text-muted-foreground leading-[1.55]">
                        {t(lang, compLongKeys[index])}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-x-16 gap-y-16">
            {compIcons.map((Icon, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="w-6 h-6 text-gold shrink-0" strokeWidth={1.5} />
                    <h3 className="font-display text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] text-foreground leading-[1.1]">
                      {t(lang, compTitleKeys[index])}
                    </h3>
                  </div>

                  {/* Antam answer — hero */}
                  <div className="relative pl-5 mb-7">
                    <span
                      aria-hidden
                      className="absolute left-0 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-gold via-gold/60 to-transparent"
                    />
                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                      {t(lang, "shortTerm_label")}
                    </span>
                    <p className="mt-2 font-body text-[17px] text-foreground leading-[1.55]">
                      {t(lang, compShortKeys[index])}
                    </p>
                  </div>

                  {/* Long-term — quiet footnote */}
                  <div className="pl-5 border-l border-border/60">
                    <span className="font-body text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground/70">
                      {t(lang, "longTerm_label")}
                    </span>
                    <p className="mt-2 font-body text-[17px] text-muted-foreground leading-[1.55]">
                      {t(lang, compLongKeys[index])}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WhyBetterSection;
