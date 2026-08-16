import { useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

const items: { titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { titleKey: "foryou1_title", descKey: "foryou1_desc" },
  { titleKey: "foryou2_title", descKey: "foryou2_desc" },
  { titleKey: "foryou3_title", descKey: "foryou3_desc" },
  { titleKey: "foryou4_title", descKey: "foryou4_desc" },
  { titleKey: "foryou5_title", descKey: "foryou5_desc" },
  { titleKey: "foryou6_title", descKey: "foryou6_desc" },
];

/** One <details name> group = the browser keeps exactly one item open. */
const GROUP = "pro-koho";

/**
 * Phone version of "Pro koho" (ForYouSection keeps the card grid from 768 px up):
 * a native <details>/<summary> register. Works without JS, one item open at a
 * time via the `name` attribute, first item open. Styling and the 0fr → 1fr
 * animation live in index.css under `.reasons` (::details-content, so browsers
 * without it simply snap). The only JS here is the exclusivity fallback for
 * browsers that don't know `name` on <details>.
 */
const ReasonsAccordion = () => {
  const { lang } = useLanguage();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("name" in HTMLDetailsElement.prototype) return;
    const list = listRef.current;
    if (!list) return;
    const onToggle = (e: Event) => {
      const opened = e.target as HTMLDetailsElement;
      if (!opened.open) return;
      list.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((d) => {
        if (d !== opened) d.open = false;
      });
    };
    list.addEventListener("toggle", onToggle, true);
    return () => list.removeEventListener("toggle", onToggle, true);
  }, []);

  return (
    <Reveal>
      <div ref={listRef} className="reasons max-w-2xl mx-auto">
        {items.map(({ titleKey, descKey }, i) => (
          <details key={titleKey} name={GROUP} open={i === 0} className="group">
            <summary className="reasons-summary flex items-center gap-2.5 min-h-[56px] py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-[3px]">
              {/* Fixed gutter so the titles line up whatever the number */}
              <span
                aria-hidden="true"
                className="reasons-num w-8 shrink-0 font-mono text-[12px] tracking-[0.05em] leading-none text-primary/40 group-open:text-gold"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="min-w-0 flex-1 m-0 font-display font-normal text-[14px] min-[360px]:text-[17px] leading-[1.35] text-primary whitespace-nowrap">
                {t(lang, titleKey)}
              </h3>
              {/* Plus → minus: the vertical bar turns 90° into the horizontal one */}
              <span aria-hidden="true" className="reasons-icon relative w-4 h-4 shrink-0">
                <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-primary/40 group-open:bg-gold" />
                <span className="reasons-icon-v absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-primary/40 group-open:bg-gold group-open:rotate-90" />
              </span>
            </summary>
            {/* Panel text sits on the title's axis (gutter + gap), not under the number */}
            <div className="reasons-panel min-h-0 overflow-hidden">
              <p className="font-body text-[0.9375rem] leading-[1.6] text-primary/75 text-pretty pl-[2.625rem] pr-7 pb-4 m-0">
                {t(lang, descKey)}
              </p>
            </div>
          </details>
        ))}
      </div>
    </Reveal>
  );
};

export default ReasonsAccordion;
