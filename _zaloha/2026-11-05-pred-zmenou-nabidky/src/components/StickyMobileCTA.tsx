import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import type { LeadCalcPayload } from "@/lib/leadBand";

/**
 * Lišta na mobilu (patch 3, docs/funnel-spec-2026-09-07.md §2): jedna lišta,
 * tři stavy podle toho, kde návštěvník je.
 *
 * - mimo kalkulačku: „Poslat byt" (mobile_cta) → #kontakt, jako dosud;
 * - v kalkulačce s výsledkem: aktuální číslo a TOTÉŽ tlačítko, jaké má karta
 *   („~63 000 Kč / měsíc · Chci výpočet pro svůj byt"). Karta je na mobilu
 *   ZA vstupy, takže kdo ladí dispozici nahoře, vidí, jak se číslo hýbe, aniž
 *   by scrolloval; klik nese do poptávky stejný snapshot jako karta;
 * - když je na obrazovce samotná karta nebo formulář: lišta mizí. Dvě tlačítka
 *   se stejným cílem nad sebou byl nález auditu (B7).
 *
 * Stav kalkulačky lišta nečte z kontextu (stojí mimo CalcProvider), ale z
 * eventu antam:calc-state, který kalkulačka posílá při každé změně; je to
 * tentýž payload, jaký jde do poptávky, takže se čísla nemohou rozejít.
 */
/** Kolik px POD spodní hranou okna ještě smí být horní hrana karty, než lišta zmizí.
 *  Stránka scrolluje plynule (html { scroll-behavior: smooth }), karta při
 *  automatickém posunu na první výsledek urazí i ~60 px za snímek; náskok musí
 *  být aspoň takový, jinak karta na jeden snímek vjede pod lištu. Větší náskok
 *  zase schovává lištu příliš brzy: na 390×844 začíná karta ~760 px pod horní
 *  hranou vstupů, takže každých 100 px náskoku navíc ubírá 100 px vstupů, u
 *  kterých je lišta vidět. 64 px je změřený kompromis (7. 9. 2026). */
const STICKY_CARD_LEAD = 64;

const StickyMobileCTA = () => {
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [inCalc, setInCalc] = useState(false);
  // Skryto kvůli blížící se kartě: bez přechodu, ať se lišta nestáhne až
  // 300 ms poté, co pod ní karta projela. Objevení zpět zůstává animované.
  const [nearCard, setNearCard] = useState(false);
  const [calc, setCalc] = useState<LeadCalcPayload | null>(null);

  useEffect(() => {
    const onCalcState = (e: Event) => setCalc((e as CustomEvent<LeadCalcPayload>).detail ?? null);
    window.addEventListener("antam:calc-state", onCalcState);
    // Lišta se montuje lazy: kdyby kalkulačka už stav poslala (sdílený odkaz),
    // vyžádá si ho znovu.
    window.dispatchEvent(new Event("antam:calc-state-request"));
    return () => window.removeEventListener("antam:calc-state", onCalcState);
  }, []);

  useEffect(() => {
    // #kontakt, #kalkulacka a karta se načítají lazy, takže při mountu ještě
    // nemusí existovat. Hledají se při scrollu, dokud se nenajdou, a pak se drží.
    let contact: HTMLElement | null = null;
    let calcSection: HTMLElement | null = null;
    let card: HTMLElement | null = null;
    const inView = (el: HTMLElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    // Lišta mizí DŘÍV, než se pod ni karta dostane: jakmile se horní hrana karty
    // přiblíží na STICKY_CARD_LEAD px ke spodní hraně okna, je pryč, takže nikdy
    // neleží přes eyebrow karty (ani během automatického posunu na první
    // výsledek). Cena: na 390×844 karta vykukuje už při horním okraji vstupů
    // (~85 px), tam je lišta schovaná a vrací se ~150 px výš (u Lokality);
    // na 320×640 drží přes celý blok vstupů. Předchozí pravidlo „schovat, až je
    // vidět 240 px karty" nechávalo lištu chvíli ležet přes eyebrow, což vadilo víc.
    const cardNear = (el: HTMLElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight + STICKY_CARD_LEAD && r.bottom > 0;
    };
    const onScroll = () => {
      // Zobrazit po scrollu pod hero (~60 % viewportu)
      const belowHero = window.scrollY > window.innerHeight * 0.6;
      if (!contact) contact = document.getElementById("kontakt");
      if (!calcSection) calcSection = document.getElementById("kalkulacka");
      if (!card) card = document.querySelector<HTMLElement>(".calc-result");
      // SCHOVAT NAD FORMULÁŘEM (2A) a NAD KARTOU (patch 3): obojí má vlastní
      // tlačítko se stejným cílem; nad nimi i pod nimi se lišta vrací.
      const near = cardNear(card);
      setNearCard(near);
      setVisible(belowHero && !inView(contact) && !near);
      setInCalc(inView(calcSection));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Výsledek se v liště ukazuje jen tam, kde ho ukazuje i karta: podporovaný
  // byt s číslem. Nepodporovaná lokalita a nadměrný byt mají na kartě vlastní
  // poctivé zavření, lišta u nich zůstává obecná.
  const result = inCalc && calc && typeof calc.owner_high === "number" ? calc : null;
  const weak = result?.result_band === "weak";
  const label = result ? t(lang, weak ? "calc_cta_weak" : "calc_cta") : t(lang, "mobile_cta");

  const onClick = () => {
    if (result) {
      trackEvent("cta_click", { location: "sticky_calc", target: "contact", district: result.district, size: result.dispozice, band: result.result_band });
      window.dispatchEvent(
        new CustomEvent("antam:prefill-contact", {
          detail: { location: result.district_label, ctvrt: result.ctvrt, size: result.size_label, m2: result.representative_m2 ?? undefined, calc: result },
        })
      );
      return;
    }
    trackEvent("cta_click", { location: "sticky_mobile", target: "contact" });
  };

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 ${
        nearCard && !visible ? "transition-none" : "transition-all duration-300"
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}
      aria-hidden={!visible}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/0 pointer-events-none" />
      <a
        href="#kontakt"
        onClick={onClick}
        data-sticky-state={result ? "calc" : "generic"}
        className={`btn btn-primary relative w-full py-3.5 shadow-lg shadow-charcoal/20 ${
          result ? "max-sm:px-4 max-sm:tracking-[0.06em] max-sm:text-[12px]" : ""
        }`}
      >
        {/* Číslo i popisek v JEDNOM textovém toku, ne dvě flex položky vedle sebe:
            jinak se popisek na 320 px lámal do úzkého sloupce na tři řádky. */}
        <span className="min-w-0 text-center">
          {result && (
            /* Číslo bez verzálek a bez prostrkání: „~63 000 Kč / měsíc" je údaj, ne heslo. */
            <span className="tnum whitespace-nowrap font-semibold normal-case tracking-normal">
              ~{(Math.round(result.owner_high! / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč {t(lang, "calc_month_suffix")}
              <span aria-hidden="true" className="mx-1.5 opacity-60">·</span>
            </span>
          )}
          {label}
        </span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </a>
    </div>
  );
};

export default StickyMobileCTA;
