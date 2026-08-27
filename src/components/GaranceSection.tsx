import { ArrowRight, ChevronRight } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * Garance výnosu — the section the funnel pivots on. It answers the question
 * the calculator just created ("nice estimate, what if it doesn't happen?"):
 * three numbers (rent → written minimum → expected), three steps, one honest
 * reason why Antam can afford it, and the second protection that completes the
 * offer: ordinary guest-caused damage. Mechanics stay in the contract; this is
 * the concept, not the addendum.
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

  return (
    <section id="garance" className="section bg-background scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "g_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "g_title1")}
            <span className="text-gradient-gold">{t(lang, "g_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "g_desc")}</p>
        </Reveal>

        {/* Three numbers: rent → written minimum → expected. The minimum is the
            floor the owner keeps either way; the expected number is why they call. */}
        <Reveal delay={0.05}>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2 sm:gap-0 max-w-3xl mx-auto">
            {NUMS.map(({ label, value }, i) => (
              <div key={label} className="flex flex-col sm:flex-row items-center flex-1">
                <div
                  className={`w-full text-center rounded-md border px-4 py-5 sm:py-6 ${
                    i === 2
                      ? "border-gold/50 bg-gold/[0.07]"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="font-body text-[11px] uppercase tracking-[0.14em] text-muted-foreground leading-tight mb-2">
                    {t(lang, label)}
                  </p>
                  <p
                    className={`font-display text-2xl md:text-[1.75rem] font-semibold leading-none tnum ${
                      i === 2 ? "text-gold-deep" : i === 1 ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t(lang, value)}
                  </p>
                </div>
                {i < 2 && (
                  <ArrowRight
                    className="hidden sm:block w-5 h-5 text-gold mx-2 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 font-body text-xs text-muted-foreground text-center leading-relaxed">
            {t(lang, "g_num_note")}
          </p>
        </Reveal>

        {/* Three steps of the mechanism, kept short; the contract carries the rest. */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-10 md:mt-12 max-w-3xl mx-auto">
          {STEPS.map(({ title, desc }, i) => (
            <Reveal key={title} delay={stagger(i, 0.08)}>
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
          <p className="mt-4 font-body text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t(lang, "g_small")}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default GaranceSection;
