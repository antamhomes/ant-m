import { ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * Ceník: všechno, co může majitel zaplatit, na jednom místě a s cenou.
 * Existuje proto, že "žádné vstupní poplatky" přestalo platit ve chvíli,
 * kdy má Uvedení do provozu svou cenu. Radši to říct dřív než na schůzce.
 *
 * PATCH 2 (7. 9. 2026, spec §1/§6): sem se sloučila samostatná sekce Garance.
 * Kotva #garance zůstává a vede na benefit níž. Sekce končí jedním CTA.
 *
 * 22. 10. 2026 v5 (zadání V.: „jak by to udělal profesionál"): sekce přestala
 * být zároveň plakát a zároveň ceník. Dvě plakátová čísla spolu vždycky
 * soupeřila (70 je číslo, 30 za sebou táhne obsah), proto se rozdělila:
 * ECONOMICS nahoře = jediné hero číslo 70 % s labelem a vedle něj lead věta
 * s přesným základem a odměnou (fakta z auditu P0 jsou tím viditelně v kopii,
 * sr-only h2 zůstává pro SEO). VALUE pod tím = klidný sazebník: řádek
 * Odměna Antam (30 %, pod ním rozsah a provozní řádek) a řádek Uvedení do
 * provozu, stejná gramatika jako rozbalovací položky. Důvěra se tu staví
 * přesností, ne velikostí čísel. Benefity, odkaz a CTA z v4.1 beze změny.
 */

/** Jednorázové a doplňkové položky za rozbalovákem. */
const MORE_ROWS = ["pr2", "pr3", "pr4", "pr9", "pr5", "pr8"] as const;

/** Tři cesty (29. 10. 2026): správa, vlastní provoz, přestavba běžícího bytu. */
// 29. 10. 2026 odpoledne: tři karty cest z ceníku odešly (duplikovaly sekci
// Volba a dělaly z ceníku stěnu textu). Vlastní provoz a přestavba jsou dva
// vždy viditelné řádky sazebníku; detail nese rozbalovací ceník níž.
const PATH_ROWS = ["pr4", "pr9"] as const;

/** Dva benefity v odměně: garance (pr6, nese kotvu #garance) a krytí škod (pr7). */
const BENEFITS = ["pr6", "pr7"] as const;

const PricingSection = () => {
  const { lang } = useLanguage();

  return (
    <section id="cenik" className="section-cont chapter-edge bg-secondary scroll-mt-20">
      <div className="container-wide">
        <Reveal className="mb-8 md:mb-12">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          <h2 className="sr-only">{t(lang, "pricing_split1")}</h2>
        </Reveal>

        <Reveal delay={0.05}>
          {/* ECONOMICS: jediné hero číslo. Od 29. 10. 2026 je to naše odměna
              (20 % + DPH), ne podíl majitele: dvě cesty už nejdou vyjádřit jedním
              podílem. Lead visí první řádkou na účaří číslice (items-baseline). */}
          <div className="lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-20 xl:gap-x-28 lg:items-baseline">
            <div aria-hidden="true">
              <p className="m-0 font-display font-medium text-foreground leading-[0.8] tracking-[-0.03em] tnum text-[clamp(6rem,14vw,12rem)]">
                20<span className="text-[0.4em] font-normal text-gold-deep align-baseline">{lang === "cs" ? " " : ""}%</span>
              </p>
              <p className="mt-4 font-body text-[12px] md:text-[13px] uppercase tracking-[0.24em] text-foreground">
                {t(lang, "pr1_owner_label")}
              </p>
            </div>
            <p className="mt-7 lg:mt-0 mb-0 font-display text-[20px] md:text-[23px] leading-[1.45] text-foreground max-w-[44ch] text-pretty">
              {t(lang, "pricing_lead")}
            </p>
          </div>

          {/* VALUE: sazebník. Silná linka otevírá listinu, mezi řádky tenká;
              název vlevo, hodnota vpravo v tabulkových číslicích. */}
          <div className="mt-12 md:mt-16">
            <div className="border-t border-foreground/25 py-6 md:py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="m-0 font-display text-[18px] md:text-[19px] font-semibold text-foreground leading-snug">
                  {t(lang, "pr1_fee_label")}
                </p>
                <p className="m-0 font-body tnum text-[15px] md:text-[16px] text-foreground">
                  {t(lang, "pr1_fee_value")}
                </p>
              </div>
              <p className="mt-3 mb-0 font-body text-[13.5px] md:text-[14px] font-medium text-foreground/90 leading-relaxed max-w-[72ch]">
                {t(lang, "pr1_fee_scope")}
              </p>
              <p className="mt-1.5 mb-0 font-body text-[13px] text-muted-foreground leading-relaxed max-w-[72ch]">
                {t(lang, "pr1_incl_items")}
              </p>
            </div>
            <div className="border-t border-border py-6 md:py-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="m-0 font-display text-[18px] md:text-[19px] font-semibold text-foreground leading-snug">
                {t(lang, "pr1_setup_name")}
              </p>
              <p className="m-0 font-body tnum text-[15px] md:text-[16px] text-foreground">
                {t(lang, "pr1_setup_price")}
              </p>
            </div>
            {PATH_ROWS.map((k) => (
              <div key={k} className="border-t border-border py-6 md:py-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="m-0 font-display text-[18px] md:text-[19px] font-semibold text-foreground leading-snug">
                  {t(lang, `${k}_name` as const)}
                </p>
                <p className="m-0 font-body tnum text-[15px] md:text-[16px] text-foreground">
                  {t(lang, `${k}_price` as const)}
                </p>
              </div>
            ))}
            <p className="mt-3 mb-0 font-body text-[13px] text-muted-foreground">{t(lang, "path_note")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {/* Dva benefity v odměně, bez karet: typografie a tenké linky. Na
              desktopu vyvážené sloupce, na mobilu pod sebou s linkou mezi. */}
          <div className="mt-6 md:mt-8 pt-9 md:pt-12 border-t border-foreground/25 grid md:grid-cols-2 md:gap-x-16 xl:gap-x-24">
            {BENEFITS.map((k, i) => (
              <div
                key={k}
                id={k === "pr6" ? "garance" : undefined}
                className={i === 0 ? "scroll-mt-24" : "mt-9 pt-9 border-t border-border md:mt-0 md:pt-0 md:border-t-0"}
              >
                <h3 className="m-0 font-display text-[23px] md:text-[26px] font-semibold text-foreground leading-snug">
                  {t(lang, `${k}_name` as const)}
                </h3>
                <p className="mt-2 mb-0 font-body text-[11px] uppercase tracking-[0.16em] text-gold-deep">
                  {t(lang, `${k}_price` as const)}
                </p>
                <p className="mt-3.5 mb-0 font-body text-[15px] text-muted-foreground leading-relaxed max-w-[52ch]">
                  {t(lang, `${k}_note` as const)}
                </p>
              </div>
            ))}
          </div>

          <details className="group mt-9 md:mt-11">
            <summary className="list-none cursor-pointer font-body text-sm text-gold-deep underline underline-offset-4 decoration-gold/40 [&::-webkit-details-marker]:hidden">
              {t(lang, "pricing_more")}
            </summary>
            <dl className="mt-4 border-t border-border">
              {MORE_ROWS.map((k) => (
                <div key={k} className="border-b border-border py-4">
                  <dt className="font-display text-[16px] text-foreground">
                    {t(lang, `${k}_name` as const)}
                    <span className="ml-2 font-body text-[13px] text-muted-foreground tnum">{t(lang, `${k}_price` as const)}</span>
                  </dt>
                  <dd className="m-0 mt-1 font-body text-[14px] text-muted-foreground leading-relaxed max-w-[62ch]">
                    {t(lang, `${k}_note` as const)}
                  </dd>
                </div>
              ))}
            </dl>
          </details>

          {/* Jedno CTA jako přirozený závěr sekce (spec §1): stejná slovní
              zásoba jako odeslání formuláře a závěr stránky. 22. 10. 2026
              v4.1: o stupeň výraznější (padding + 13,5px) a dál od odkazu
              na podrobný ceník, ať se nečte jako jeho součást; na desktopu
              zůstává inline, žádný full-width pás. */}
          <a
            href="#kontakt"
            onClick={() => trackEvent("cta_click", { location: "pricing", target: "contact" })}
            className="btn btn-primary mt-12 md:mt-16 !py-[1.05rem] !px-9 md:!px-11 !text-[13.5px]"
          >
            {t(lang, "g_cta")}
            <ChevronRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default PricingSection;
