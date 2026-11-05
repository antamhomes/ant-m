import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { useSplashDone } from "@/hooks/use-splash-done";
import { pathFor, type PageKey } from "@/lib/pages";

const enter = (y: number, delay: number, duration = 0.7) =>
  ({
    "data-enter": "",
    style: { "--enter-y": `${y}px`, "--enter-delay": `${delay}s`, "--enter-dur": `${duration}s` } as React.CSSProperties,
  }) as const;

/**
 * Hero podstránky (2. 11. 2026): stejná tmavě zelená plocha jako na homepage,
 * bez fotky, kratší. Jedna věta pro jednoho člověka, jedna řádka s čísly
 * nabídky, jedno tlačítko, a pod ním tichý odkaz na druhou cestu, ať se
 * nikdo nezasekne na špatné stránce.
 */
type Copy = { label: TranslationKey; title: TranslationKey; desc: TranslationKey; line: TranslationKey; cta: TranslationKey; ctaHref: string; other: TranslationKey; otherPage: PageKey };
const COPY: Record<"sprava" | "vlastni-provoz", Copy> = {
  sprava: { label: "sprava_hero_label", title: "sprava_hero_title", desc: "sprava_hero_desc", line: "sprava_hero_line", cta: "sprava_hero_cta", ctaHref: "#kalkulacka", other: "sprava_hero_other", otherPage: "vlastni-provoz" },
  "vlastni-provoz": { label: "own_hero_label", title: "own_hero_title", desc: "own_hero_desc", line: "own_hero_line", cta: "own_hero_cta", ctaHref: "#system", other: "own_hero_other", otherPage: "sprava" },
};

const PageHero = ({ page }: { page: "sprava" | "vlastni-provoz" }) => {
  const { lang } = useLanguage();
  const ready = useSplashDone();
  const c = COPY[page];
  return (
    <section className={`relative overflow-hidden bg-gradient-dark ${ready ? "is-ready" : ""}`}>
      <div className="container-wide pt-32 pb-14 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20">
        <h1
          {...enter(20, 0.45, 0.8)}
          className="font-display text-[clamp(2.1rem,3.5vw,3.3rem)] font-medium leading-[1.08] tracking-[-0.018em] text-balance text-[#F7F1E8] max-w-[22ch]"
        >
          {t(lang, c.title)}
        </h1>
        <p {...enter(16, 0.65, 0.6)} className="mt-6 font-body text-base sm:text-lg leading-relaxed max-w-[46ch] text-pretty text-[#E8DED0]">
          {t(lang, c.desc)}
        </p>
        <p {...enter(12, 0.75, 0.6)} className="mt-6 font-body text-[15px] sm:text-base lg:text-[17px] leading-relaxed text-[rgba(232,222,208,0.85)] tnum max-w-[40ch]">
          {t(lang, c.line)}
        </p>
        <div {...enter(16, 0.85, 0.6)} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
          <a
            href={c.ctaHref}
            onClick={() => trackEvent("cta_click", { location: "page-hero", target: page })}
            className="btn btn-primary-inverse px-8 py-4"
          >
            {t(lang, c.cta)}
          </a>
          <a
            href={pathFor(c.otherPage, lang)}
            className="font-body text-sm text-[rgba(232,222,208,0.72)] underline underline-offset-4 decoration-gold/40 hover:text-[#F7F1E8] transition-colors"
          >
            {t(lang, c.other)}
          </a>
        </div>
      </div>
    </section>
  );
};

export default PageHero;
