import { ChevronRight } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * Garance výnosu — risk reversal, not another forecast. Portfolio and the
 * calculator already sell the upside; this section removes the downside of
 * leaving a safe long-term rent: two numbers only (long-term rent vs. the
 * written minimum with Antam), so the reader sees that even the contractual
 * floor sits above what they are leaving. Then three steps and the second
 * protection that completes the offer: ordinary guest-caused damage.
 * Mechanics stay in the contract; this is the concept, not the addendum.
 * The third "expected result" slot (g_num3_*) is intentionally empty and
 * skipped; keep it that way.
 */
const NUMS = [
  { label: "g_num1_label", value: "g_num1_value" },
  { label: "g_num2_label", value: "g_num2_value" },
  { label: "g_num3_label", value: "g_num3_value" },
] as const;

const STEPS = [
  { title: "g_step1_title", desc: "g_step1" },
  { title: "g_step2_title", desc: "g_step2" },
  { title: "g_step3_title", desc: "g_step3" },
] as const;

/** Two protections, said once, side by side: the income floor and the flat itself. */
const PAIR = [
  { label: "g_pair1_label", text: "g_pair1_text" },
  // 2C: krytí škod z hlavní hierarchie garance pryč. Vysvětlení výjimek
  // dělá garanci slabší, ne silnější; mechanika žije ve FAQ (faq11_a)
  // a v podrobném ceníku (pr7_note).
  { label: "g_pair2_label", text: "g_pair2_text" },
] as const;

const GaranceSection = () => {
  const { lang } = useLanguage();
  // Empty copy keys switch parts of the section off per language: CZ carries the
  // mechanics in the three steps, so the "why" quote and the income card of the
  // pair are dropped and only the property protection stays.
  const why = t(lang, "g_why");
  const pairTitle = t(lang, "g_pair_title");
  const pairs = PAIR.filter(({ label }) => t(lang, label));
  const nums = NUMS.filter(({ value }) => t(lang, value));
  const last = nums.length - 1;

  return (
    <section id="garance" className="section-cont bg-background scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          {/* 2D: bez eyebrow. Garance není nová kapitola, je to třetí věta
              jedné úvahy: proč krátkodobě, co si bereme, co když to nevyjde. */}
          <h2 className="h-section-xs text-foreground">
            {t(lang, "g_title1")}
            <span className="text-gradient-gold">{t(lang, "g_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "g_desc")}</p>
        </Reveal>

        {/* AD 2. 9. 2026: dvě čísla bez karet. Stejně velké částky ve dvou
            rámečcích tvrdí, že jsou srovnatelné; nejsou. Nájem je odrazová
            čára, minimum je to, co si majitel odnese, tak stojí větší
            a čtou se na jedné účaří. */}
        <Reveal delay={0.05}>
          <div className="grid gap-x-16 gap-y-7 sm:grid-cols-[auto_auto] sm:justify-start items-end pb-7 border-b border-foreground/25">
            {nums.map(({ label, value }, i) => (
              <div key={label}>
                <p
                  className={`font-body text-[11px] uppercase tracking-[0.14em] leading-tight mb-2.5 ${
                    i === last ? "text-gold-deep" : "text-muted-foreground"
                  }`}
                >
                  {t(lang, label)}
                </p>
                <p
                  className={`font-display font-semibold leading-[0.9] tnum tracking-[-0.03em] ${
                    i === last
                      ? "text-foreground text-[clamp(3rem,6.4vw,5.75rem)]"
                      : "text-muted-foreground/80 text-[clamp(1.6rem,2.4vw,2rem)]"
                  }`}
                >
                  {t(lang, value)}
                  <span className="ml-2 font-body text-[0.24em] font-normal tracking-normal text-muted-foreground whitespace-nowrap">
                    {t(lang, "calc_month_suffix")}
                  </span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-body text-xs text-muted-foreground leading-relaxed max-w-[74ch]">
            {t(lang, "g_num_note")}
          </p>
        </Reveal>

        {/* Three steps of the mechanism, kept short; the contract carries the rest. */}
        <div className="grid sm:grid-cols-3 gap-y-6 sm:gap-x-0 mt-10 md:mt-12 border-t border-border pt-1">
          {STEPS.map(({ title, desc }, i) => (
            <Reveal key={title} delay={stagger(i, 0.08)} className="sm:pr-8 sm:border-r sm:border-border sm:last:border-r-0 sm:last:pr-0 pt-6">
              <p className="font-display text-base font-semibold text-foreground mb-1.5 leading-snug">
                <span className="text-gold-deep tnum mr-2">{i + 1}.</span>
                {t(lang, title)}
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed text-pretty">
                {t(lang, desc)}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Why Antam can afford this: incentive alignment, said once. */}
        {why && (
          <Reveal delay={0.1} className="mt-8 md:mt-10 max-w-3xl mx-auto">
            <p className="font-body text-[15px] text-foreground/85 leading-relaxed text-pretty border-l-2 border-gold/60 pl-4">
              {why}
            </p>
          </Reveal>
        )}

        {/* The second protection. It sits inside this section on purpose: the owner
            should read one offer, not two. Scope and exclusions live in the FAQ
            and in the contract, never here. */}
        <Reveal delay={0.12} className="mt-10 md:mt-12 max-w-3xl mx-auto">
          {pairTitle && (
            <p className="font-display text-lg md:text-xl text-foreground text-center text-pretty mb-5 md:mb-6">
              {pairTitle}
            </p>
          )}
          <div className={`grid gap-4 sm:gap-5 ${pairs.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {pairs.map(({ label, text }) => (
              <div key={label} className="rounded-md border border-border bg-card px-5 py-5">
                <p className="eyebrow mb-2">{t(lang, label)}</p>
                <p className="font-body text-[14.5px] text-muted-foreground leading-relaxed text-pretty">
                  {t(lang, text)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 text-center">
          <a
            href="#kontakt"
            onClick={() => trackEvent("cta_click", { location: "garance", target: "contact" })}
            className="btn btn-primary"
          >
            {t(lang, "g_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
          {t(lang, "g_small") && (
            <p className="mt-4 font-body text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t(lang, "g_small")}
          </p>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default GaranceSection;
