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
 * 22. 10. 2026 v4 (zadání V., finální pass): dělení 70/30 JE vizuální identita
 * sekce a jede přes šířku kontejneru. 70 % je plakát (až 19rem), 30 % zhruba
 * poloviční. 22. 10. 2026 v4.1 (hodnocení V., 8,8/10): mřížka už není tvrdě
 * ~70/30 (dělala mrtvý pruh mezi čísly) — levý sloupec je auto podle čísla,
 * 30 % stojí blíž a obě procenta jsou zarovnaná na společnou účaří
 * (items-baseline), což je to „záměrné" zarovnání místo odhadnutého pt.
 * Uvedení do provozu je finanční řádek bez šipky (šipka se četla
 * jako navigace): název vlevo, cena vpravo. Tok garance 01 → 02 → 03 odešel
 * (druhý vizuální systém v sekci, na mobilu stál výšku) — mechaniku nesou
 * dvě věty v pr6_note a vedle ní stojí krytí škod jako druhý benefit;
 * na desktopu dva sloupce, na mobilu pod sebou s tenkou linkou. Prázdný
 * pricing_foot se přestal kreslit (dělal mrtvý pruh před CTA). Plná věta
 * o základu dělení zůstává pro čtečky a SEO v sr-only h2 (audit P0) a malým
 * písmem pod labelem 70 %.
 */

/** Jednorázové a doplňkové položky za rozbalovákem. */
const MORE_ROWS = ["pr2", "pr3", "pr4", "pr5", "pr8"] as const;

/** Dva benefity v odměně: garance (pr6, nese kotvu #garance) a krytí škod (pr7). */
const BENEFITS = ["pr6", "pr7"] as const;

const PricingSection = () => {
  const { lang } = useLanguage();
  const core = ([1, 2, 3] as const);

  return (
    <section id="cenik" className="section-cont chapter-edge bg-secondary scroll-mt-20">
      <div className="container-wide">
        <Reveal className="mb-8 md:mb-12">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          <h2 className="sr-only">{t(lang, "pricing_split1")}</h2>
        </Reveal>

        <Reveal delay={0.05}>
          {/* Horní kompozice: mřížka ~70/30 přes šířku. Obě čísla jsou dekorace
              nad sr-only větou, proto aria-hidden. */}
          <div aria-hidden="true" className="lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-24 xl:gap-x-32 lg:items-baseline">
            {/* 70 % — hrdina sekce. Procento menší a zlaté, ať číslo nese tíhu. */}
            <div>
              <p className="m-0 font-display font-medium text-foreground leading-[0.8] tracking-[-0.035em] tnum text-[clamp(7.5rem,21vw,19rem)]">
                70<span className="text-[0.38em] font-normal text-gold-deep align-baseline">{lang === "cs" ? " " : ""}%</span>
              </p>
              <p className="mt-4 md:mt-5 font-body text-[12px] md:text-[13px] uppercase tracking-[0.24em] text-foreground">
                {t(lang, "pr1_owner_label")}
              </p>
              <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
                {t(lang, "pr1_base_note")}
              </p>
            </div>

            {/* 30 % — druhá polovina téže kompozice: ~poloviční, na společné účaří se 70 %. */}
            <div className="mt-9 lg:mt-0">
              <p className="m-0 font-display font-medium text-foreground leading-[0.8] tracking-[-0.025em] tnum text-[clamp(3.5rem,9vw,8.5rem)]">
                30<span className="text-[0.42em] font-normal text-gold-deep align-baseline">{lang === "cs" ? " " : ""}%</span>
              </p>
              <p className="mt-2.5 font-body text-[11px] md:text-[12px] uppercase tracking-[0.24em] text-foreground">
                {t(lang, "pr1_fee_label")}
              </p>
              <ul className="mt-5 md:mt-6 list-none m-0 p-0">
                {core.map((n) => (
                  <li key={n} className="py-[3px] font-display text-[17px] md:text-[19px] font-semibold text-foreground leading-snug">
                    {t(lang, `pr1_core_${n}` as const)}
                  </li>
                ))}
              </ul>
              <p className="mt-4 mb-0 font-body text-[13px] font-semibold text-foreground/85">
                {t(lang, "pr1_ops_plus")}
              </p>
              <p className="mt-1 font-body text-[13px] text-muted-foreground leading-relaxed max-w-[52ch]">
                {t(lang, "pr1_incl_items")}
              </p>
            </div>
          </div>

          {/* Uvedení do provozu: čistý finanční řádek pod tenkou linkou.
              Název vlevo, cena vpravo o stupeň silnější; žádná šipka. */}
          <div className="mt-12 md:mt-14 pt-4 border-t border-border flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="m-0 font-body text-[13.5px] text-muted-foreground">{t(lang, "pr1_setup_name")}</p>
            <p className="m-0 font-body text-[14px] md:text-[14.5px] text-foreground tnum">{t(lang, "pr1_setup_price")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {/* Dva benefity v odměně, bez karet: typografie a tenké linky. Na
              desktopu vyvážené sloupce, na mobilu pod sebou s linkou mezi. */}
          <div className="mt-12 md:mt-16 pt-9 md:pt-12 border-t border-foreground/25 grid md:grid-cols-2 md:gap-x-16 xl:gap-x-24">
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
