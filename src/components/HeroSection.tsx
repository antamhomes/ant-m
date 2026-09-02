import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { useSplashDone } from "@/hooks/use-splash-done";

/** Entrance timing per element (seconds); the CSS in index.css does the animating once `.is-ready` is set. */
const enter = (y: number, delay: number, duration = 0.7) =>
  ({
    "data-enter": "",
    style: { "--enter-y": `${y}px`, "--enter-delay": `${delay}s`, "--enter-dur": `${duration}s` } as React.CSSProperties,
  }) as const;

/**
 * AD 2. 9. 2026: dělený hero místo fotky přes celou plochu s textem na ní.
 * Fotka bytu je důkaz, ne pozadí; přes tmavý závoj, který jí musel dělat
 * čitelné podloží, z ní zbyla nálada. Text má teď vlastní tmavě zelenou
 * plochu (stejná firemní barva jako sekce Co za vás řešíme) a fotka běží
 * vedle ní v plné kvalitě. Pod textem stojí tři čísla ze stejného zdroje
 * jako sekce Kdo jsme, takže se nemůžou rozejít.
 *
 * 2. 9. 2026, mobil: rozdělení se pod lg nereprodukuje doslova. Fotka nad
 * textem dělala dva bloky za sebou a první obrazovka patřila cizí ložnici,
 * než návštěvník věděl, kdo Antam je. Pod lg proto fotka drží ~44 vh a zelená
 * plocha na ni najíždí o 76 px nahoru: tvrdá hrana firemní zelené, ne černý
 * gradient s bílým textem. Desktop se nemění.
 */
const HeroSection = () => {
  const { lang } = useLanguage();
  // Empty copy keys switch off hero elements per language. CZ runs a short hero:
  // one sentence, one button straight to the calculator, no proof line (the
  // numbers live in Portfolio with their context). VI keeps the two-step hero,
  // where the primary button goes to the form and the secondary to the calculator.
  const secondCta = t(lang, "hero_cta2");
  const proof = t(lang, "hero_extra");
  const primaryHref = secondCta ? "#kontakt" : "#kalkulacka";
  const ref = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const ready = useSplashDone();

  // Very subtle parallax on the photo column: it moves at ~18 % of scroll speed
  // while the hero is on screen. One passive scroll listener + rAF, no library.
  useEffect(() => {
    const section = ref.current;
    const media = mediaRef.current;
    if (!section || !media) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = section.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / h));
      media.style.transform = `translate3d(0, ${(p * 12).toFixed(2)}%, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden bg-gradient-dark ${ready ? "is-ready" : ""}`}
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:min-h-[min(88vh,780px)]">
        {/* Text na vlastní ploše: žádný závoj přes fotku, žádný radiální gradient. */}
        <div className="order-2 lg:order-1 relative z-10 max-lg:bg-gradient-dark max-lg:-mt-[76px] max-lg:shadow-[0_-26px_50px_-18px_rgba(10,12,11,0.72)] flex flex-col justify-between px-6 sm:px-10 lg:pl-[max(1.5rem,calc((100vw-75rem)/2+1.5rem))] lg:pr-14 pt-9 sm:pt-11 pb-12 lg:pt-32 lg:pb-16">
          <div>
            <p
              {...enter(12, 0.35, 0.6)}
              className="font-body text-[0.7rem] sm:text-xs tracking-[0.22em] uppercase mb-6 text-gold-on-dark"
            >
              {t(lang, "hero_subtitle")}
            </p>

            <h1
              {...enter(20, 0.45, 0.8)}
              className="font-display text-[clamp(2.1rem,3.5vw,3.3rem)] font-medium leading-[1.08] tracking-[-0.018em] text-balance text-[#F7F1E8] max-w-[17ch]"
            >
              {t(lang, "hero_title1")}
              <br />
              {t(lang, "hero_title2")}
            </h1>

            <p
              {...enter(16, 0.65, 0.6)}
              className="mt-6 font-body text-base sm:text-lg leading-relaxed max-w-[42ch] text-pretty text-[#E8DED0]"
            >
              {t(lang, "hero_desc")}
            </p>

            <div {...enter(16, 0.8, 0.6)} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href={primaryHref}
                onClick={() =>
                  trackEvent("cta_click", { location: "hero", target: secondCta ? "contact" : "calculator" })
                }
                className="btn btn-primary-inverse px-8 py-4"
              >
                {t(lang, "hero_cta")}
              </a>
              {secondCta && (
                <a
                  href="#kalkulacka"
                  onClick={() => trackEvent("cta_click", { location: "hero", target: "calculator" })}
                  className="btn btn-secondary-inverse px-8 py-4"
                >
                  {secondCta}
                  <span className="text-gold" aria-hidden="true">→</span>
                </a>
              )}
            </div>

            {/* Proof teaser under the CTAs: one checkable fact, no adjectives.
                The numbers must match the portfolio cards one scroll below. */}
            {proof && (
              <p
                {...enter(10, 1.0, 0.6)}
                className="mt-6 font-body text-[13px] sm:text-sm tracking-wide text-[rgba(232,222,208,0.72)] tnum max-w-[46ch]"
              >
                {proof}
              </p>
            )}
          </div>

          {/* Tři čísla ze stejných klíčů jako sekce Kdo jsme (about_stat*),
              aby se hero a medailonek nemohly rozejít. */}
          <dl
            {...enter(12, 1.15, 0.6)}
            className="mt-8 lg:mt-10 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/15 pt-6"
          >
            {(["about_stat1", "about_stat2"] as const).map((k) => (
              <div key={k}>
                <dt className="font-body text-[10px] uppercase tracking-[0.15em] text-white/45">
                  {t(lang, `${k}_label` as const)}
                </dt>
                <dd className="m-0 mt-1.5 font-display text-[1.7rem] text-[#F7F1E8] tnum leading-none">
                  {t(lang, `${k}_value` as const)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Fotka bez závoje. Měkký přechod jen na levé hraně, ať se švem
            neřeže tmavá plocha od obrázku. */}
        <div className="order-1 lg:order-2 relative overflow-hidden h-[48vh] min-h-[280px] max-h-[460px] lg:h-auto lg:max-h-none">
          <div ref={mediaRef} className="absolute inset-0 will-change-transform">
            <div className="absolute inset-0 hero-zoom">
              <img
                src="/hero/bedroom-1280.webp"
                srcSet="/hero/bedroom-768.webp 768w, /hero/bedroom-1280.webp 1280w, /hero/bedroom-1920.webp 1920w"
                sizes="(min-width: 1024px) 52vw, 100vw"
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                decoding="async"
                onLoad={() => window.dispatchEvent(new Event("antam:hero-ready"))}
                className="w-full h-[112%] object-cover"
                width={1920}
                height={1530}
              />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--charcoal))_0%,hsl(var(--charcoal)/0.35)_9%,transparent_26%)] max-lg:bg-none"
          />
          {/* Navigace teď leží nad fotkou, ne nad tmavou plochou: bez tohohle
              se odkazy vpravo ztratí ve světlé části snímku. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,hsl(var(--charcoal)/0.80)_0%,hsl(var(--charcoal)/0.40)_55%,transparent_100%)]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
