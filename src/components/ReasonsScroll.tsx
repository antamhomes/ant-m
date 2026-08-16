import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Clock, ShieldCheck, TrendingUp, CalendarHeart, UserX, Plane } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

type Item = { icon: typeof Clock; titleKey: TranslationKey; descKey: TranslationKey };

const items: Item[] = [
  { icon: UserX,         titleKey: "foryou1_title", descKey: "foryou1_desc" },
  { icon: Clock,         titleKey: "foryou2_title", descKey: "foryou2_desc" },
  { icon: TrendingUp,    titleKey: "foryou3_title", descKey: "foryou3_desc" },
  { icon: ShieldCheck,   titleKey: "foryou4_title", descKey: "foryou4_desc" },
  { icon: CalendarHeart, titleKey: "foryou5_title", descKey: "foryou5_desc" },
  { icon: Plane,         titleKey: "foryou6_title", descKey: "foryou6_desc" },
];

/** Viewport band (the middle 10 %) that decides which reason is in focus while scrolling. */
const BAND = "-45% 0px -45% 0px";
/** After a click the observer is ignored until the card has opened and the smooth scroll has landed. */
const CLICK_LOCK_MS = 1400;
/** How long the open/close transition runs (see the duration-300 classes below) plus a little slack. */
const SETTLE_MS = 380;

/**
 * Keep `el` where it is on screen while cards above it collapse. Without this,
 * closing the previous card shifts the whole list up, the band lands on the
 * next card and the list "runs away" (worst with the longer Vietnamese texts).
 * Compares document positions, so the reader's own scrolling is left alone.
 */
const holdInPlace = (el: HTMLElement, ms = SETTLE_MS) => {
  const root = document.documentElement;
  const prevBehavior = root.style.scrollBehavior;
  // The page scrolls smoothly (CSS); the compensation must not, or it lags behind the transition.
  root.style.scrollBehavior = "auto";
  let last = el.getBoundingClientRect().top + window.scrollY;
  const start = performance.now();
  const tick = () => {
    const now = el.getBoundingClientRect().top + window.scrollY;
    if (now !== last) {
      window.scrollBy(0, now - last);
      last = now;
    }
    if (performance.now() - start < ms) requestAnimationFrame(tick);
    else root.style.scrollBehavior = prevBehavior;
  };
  requestAnimationFrame(tick);
};

/**
 * One column of reasons, desktop included. The card crossing the middle of the
 * viewport is open, the others are dimmed and collapsed. Click (or focus +
 * Enter) opens a card and scrolls it into the band. With prefers-reduced-motion,
 * or without IntersectionObserver, everything is simply open and nothing moves.
 */
const ReasonsScroll = () => {
  const { lang } = useLanguage();
  const [active, setActive] = useState(0);
  const [allOpen, setAllOpen] = useState(false);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const overlap = useRef<number[]>(items.map(() => 0));
  const lockUntil = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || typeof IntersectionObserver === "undefined") {
      setAllOpen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = cardRefs.current.indexOf(e.target as HTMLElement);
          if (i >= 0) overlap.current[i] = e.isIntersecting ? e.intersectionRect.height : 0;
        }
        if (Date.now() < lockUntil.current) return;
        // The card with the most pixels inside the band wins; nothing in the band → keep the current one.
        let best = -1;
        let bestPx = 0;
        overlap.current.forEach((px, i) => {
          if (px > bestPx) { best = i; bestPx = px; }
        });
        if (best >= 0) setActive(best);
      },
      { rootMargin: BAND, threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );
    cardRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Runs before paint on every change of the open card: measure the new card's
  // position while the old layout still stands, then follow it through the transition.
  useLayoutEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const el = cardRefs.current[active];
    if (el && !allOpen) holdInPlace(el);
  }, [active, allOpen]);

  const pick = (i: number) => {
    if (allOpen) return;
    lockUntil.current = Date.now() + CLICK_LOCK_MS;
    setActive(i);
    // Open first (in place), then bring the card into the band so the observer agrees with the click.
    window.setTimeout(() => {
      cardRefs.current[i]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, i === active ? 0 : SETTLE_MS + 40);
  };

  // overflow-anchor off: holdInPlace does the scroll compensation; the browser's own anchoring would double it.
  return (
    <ol className="max-w-2xl mx-auto flex flex-col gap-2.5 sm:gap-3 list-none m-0 p-0 [overflow-anchor:none]">
      {items.map(({ icon: Icon, titleKey, descKey }, i) => {
        const open = allOpen || i === active;
        return (
          <Reveal as="li" key={titleKey} delay={stagger(i, 0.05)}>
            <article
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`rounded-sm bg-card border border-border border-l-2 transition-[opacity,border-color,box-shadow] duration-300 ease-out ${
                open
                  ? "opacity-100 border-l-gold shadow-[0_10px_30px_-22px_hsl(var(--charcoal)/0.35)]"
                  : "opacity-[0.55] border-l-transparent hover:opacity-80"
              }`}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-expanded={open}
                  aria-controls={`reason-${i}`}
                  disabled={allOpen}
                  className="flex w-full items-center gap-2.5 sm:gap-3.5 md:gap-4 px-3.5 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 text-left disabled:cursor-default"
                >
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm bg-gold/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1 font-display text-[14px] min-[360px]:text-[16px] sm:text-[17px] md:text-[1.2rem] font-semibold text-foreground leading-snug whitespace-nowrap">
                    {t(lang, titleKey)}
                  </span>
                </button>
              </h3>
              {/* 0fr → 1fr animates the height without measuring; older browsers just snap. */}
              <div
                id={`reason-${i}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  {/* Left padding = card padding + icon + gap, so the text lines up with the title. */}
                  <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed text-pretty pl-14 pr-3.5 pb-3.5 sm:pl-[4.375rem] sm:pr-4 sm:pb-4 md:pl-[4.75rem] md:pr-5 md:pb-5 m-0">
                    {t(lang, descKey)}
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        );
      })}
    </ol>
  );
};

export default ReasonsScroll;
