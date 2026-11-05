import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { useSplashDone } from "@/hooks/use-splash-done";
import { quoteLease } from "@/lib/lease";
import TermSheet from "@/components/lease/TermSheet";

const enter = (y: number, delay: number, duration = 0.7) =>
  ({
    "data-enter": "",
    style: { "--enter-y": `${y}px`, "--enter-delay": `${delay}s`, "--enter-dur": `${duration}s` } as React.CSSProperties,
  }) as const;

/**
 * HERO (5. 11. 2026, nová nabídka): papír, žádná fotka. Vlevo čtyři řádky a
 * jedno tlačítko, vpravo nabídkový list s příkladem. Příklad je 2+kk v Novém
 * Městě za 9 400 000 Kč; splátku i nájem počítá lib/lease.ts, takže se číslo
 * v hero nemůže rozejít s kalkulačkou níž.
 */
export const HERO_EXAMPLE = { price: 9_400_000, loc: "praha1", size: "2kk", ctvrt: "nove_mesto" } as const;

const LeaseHero = () => {
  const { lang } = useLanguage();
  const ready = useSplashDone();
  const quote = quoteLease(HERO_EXAMPLE.price, HERO_EXAMPLE.loc, HERO_EXAMPLE.size, { ctvrt: HERO_EXAMPLE.ctvrt });

  return (
    <section className={`relative bg-background ${ready ? "is-ready" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 pt-28 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="lg:pt-4">
          <p {...enter(10, 0.35, 0.6)} className="font-body text-[11px] tracking-[0.2em] uppercase text-gold">
            {t(lang, "lz_hero_label")}
          </p>
          <h1
            {...enter(20, 0.45, 0.8)}
            className="mt-6 font-display font-medium text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02] tracking-[-0.02em] text-balance text-foreground max-w-[15ch]"
          >
            {t(lang, "lz_hero_title")}
          </h1>
          <p {...enter(16, 0.65, 0.6)} className="mt-7 font-body text-lg sm:text-xl leading-relaxed max-w-[40ch] text-pretty text-muted-foreground">
            {t(lang, "lz_hero_desc")}
          </p>
          <div {...enter(16, 0.8, 0.6)} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="#kontakt"
              onClick={() => trackEvent("cta_click", { location: "hero", target: "contact" })}
              className="btn btn-primary px-8 py-4"
            >
              {t(lang, "lz_hero_cta")}
            </a>
            <a href="#jak" className="font-body text-[14px] text-foreground border-b border-gold pb-0.5">
              {t(lang, "nav_jak")}
            </a>
          </div>
          <p {...enter(10, 1.0, 0.6)} className="mt-10 font-body text-[13px] sm:text-sm text-muted-foreground tnum">
            {t(lang, "lz_hero_line")}
          </p>
        </div>
        <div {...enter(24, 0.7, 0.9)}>
          <TermSheet quote={quote} label={t(lang, "lz_sheet_label")} flat={t(lang, "lz_sheet_flat")} />
        </div>
      </div>
    </section>
  );
};

export default LeaseHero;
