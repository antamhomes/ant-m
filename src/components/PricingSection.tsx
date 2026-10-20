import { ChevronRight } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";

/**
 * Ceník: všechno, co může majitel zaplatit, na jednom místě a s cenou.
 * Existuje proto, že "žádné vstupní poplatky" přestalo platit ve chvíli,
 * kdy má Uvedení do provozu svou cenu. Radši to říct dřív než na schůzce.
 *
 * AD 2. 9. 2026: sazba je největší číslo v sekci a nestojí v kartě. Cenu
 * neschováváme, tak ji ani vizuálně nebalíme. Rámečky, vyplněné pozadí
 * a pruh 70/30 šly pryč: ten pruh nic neměřil, jen dekoroval poměr, který
 * je o dva řádky níž vypsaný v korunách.
 *
 * PATCH 2 (7. 9. 2026, spec §1/§6): sem se sloučila samostatná sekce Garance.
 * Cena a garance odpovídají na jednu otázku („co si berete a co když to
 * nevyjde“); dvě sekce ji říkaly dvakrát a mezi číslem a formulářem stálo
 * o 887 px víc. Řádek „Garance výnosu · v odměně“ nese pravidlo (g_desc)
 * a tři kroky (g_step1..3); ilustrační dvojice 28 000 / 31 500 odešla,
 * protože majitel svůj nájem už viděl na kartě. Kotva #garance zůstává,
 * vede na ten řádek. Sekce končí jedním CTA na formulář.
 */
type Row = { k: "pr6" | "pr7" };

/** Co je v odměně navíc: garance a krytí škod stojí hned pod sazbou. */
const CORE_ROWS: Row[] = [{ k: "pr6" }, { k: "pr7" }];

/** Tři kroky garance, dřív v GaranceSection. Mechanika dál žije ve smlouvě. */
const G_STEPS = [
  { title: "g_step1_title", desc: "g_step1" },
  { title: "g_step2_title", desc: "g_step2" },
  { title: "g_step3_title", desc: "g_step3" },
] as const;

/** Jednorázové a doplňkové položky za rozbalovákem. */
const MORE_ROWS = ["pr2", "pr3", "pr4", "pr5", "pr8"] as const;

const PricingSection = () => {
  const { lang } = useLanguage();
  const core = ([1, 2, 3] as const);

  return (
    <section id="cenik" className="section-cont chapter-edge bg-secondary scroll-mt-20">
      <div className="container-wide">
        {/* AD 2. 9. 2026: model, ne obhajoba, ale ani slogan. „70 % vám,
            30 % nám" v nadpisu znělo jako dělení kořisti vedle vážného zbytku
            stránky. Nadpis je obyčejný, dělení řeknou dvě věty a závěr si
            čtenář udělá z výpočtu pod nimi. */}
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "pricing_label")}</p>
          {/* Nadpisem je rovnou ta věta o dělení. Samostatné "Naše odměna"
              nad ní bylo menší než ona, takže hierarchie šla obráceně a sekce
              působila nedodělaně. Eyebrow "Ceník" štítek stejně nese. */}
          <h2 className="h-section-xs text-foreground tnum text-balance max-w-[22ch]">
            {t(lang, "pricing_split1")}
          </h2>
        </Reveal>

        {/* 20. 10. 2026 v2 (zadání V.): žádný vzorový výpočet, kalkulačku má
            stránka jinde. Sekce nese jen tři fakta: 70 % majiteli, 30 % Antam
            (a jen z výnosu), 25 000 Kč jednorázově. Těžiště 30 % je obchodní
            provoz (průzkum trhu, cenová strategie, optimalizace výnosu),
            každodenní servis je druhý plán. Bez koláčů, barů a karet; Antamova
            odměna se nikdy nevyčísluje v korunách. */}
        <div className="max-w-5xl">
          <Reveal delay={0.05}>
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-20 xl:gap-x-28 lg:items-start">
              {/* Levá: druhá strana dělení, jedna věta podmínky. Víc vzduchu než textu. */}
              <div>
                <p className="font-display text-foreground leading-[1.3] text-[clamp(1.25rem,1.9vw,1.6rem)] tnum">
                  {t(lang, "pricing_split2")}
                </p>
                <p className="mt-2.5 font-body text-[15.5px] md:text-base text-muted-foreground leading-relaxed">
                  {t(lang, "pricing_desc")}
                </p>
              </div>

              {/* Pravá: co ve 30 % je. Napřed obchodní práce, pak provoz. */}
              <div className="mt-12 lg:mt-1">
                <h3 className="font-display text-[20px] md:text-[22px] font-semibold text-foreground leading-snug text-balance tnum max-w-[20ch]">
                  {t(lang, "pr1_incl_title")}
                </h3>
                <ul className="mt-5 list-none m-0 p-0 border-t border-foreground/25">
                  {core.map((n) => (
                    <li key={n} className="border-b border-border py-3 font-display text-[17px] md:text-[18px] font-semibold text-foreground leading-snug">
                      {t(lang, `pr1_core_${n}` as const)}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-body text-[13px] text-muted-foreground leading-relaxed max-w-[52ch]">
                  {t(lang, "pr1_incl_items")}
                </p>
              </div>
            </div>

            {/* Jednorázové uvedení do provozu: třetí fakt, nejnižší priorita,
                ale na očích. Detail nese rozbalovací ceník níž. */}
            <div className="mt-12 md:mt-14 pt-5 border-t border-border flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <p className="m-0 font-body text-[13.5px] text-foreground/85">{t(lang, "pr1_setup_name")}</p>
              <p className="m-0 font-body text-[13px] text-muted-foreground tnum">{t(lang, "pr1_setup_price")}</p>
            </div>
          </Reveal>
        </div>

        <div className="max-w-3xl">
          <Reveal delay={0.08}>
            {/* Garance a krytí škod: jediné místo, kde je vidět, co je v těch 30 % navíc.
                AD 2. 9. 2026: o stupeň víc váhy. Jsou to dvě podstatné podmínky
                obchodu, ale mezi ostatními poznámkami se četly jako další řádek
                textu. Víc vzduchu, silnější serif v názvu a „v odměně" vpravo
                jako u řádků toku peněz výš: stejná gramatika, žádná nová karta. */}
            <dl className="mt-12 md:mt-14 border-t border-foreground/25">
              {CORE_ROWS.map(({ k }) => (
                <div key={k} id={k === "pr6" ? "garance" : undefined} className="border-b border-border py-6 md:py-7 scroll-mt-24">
                  {/* 9. 9. 2026: „v odměně" bylo tlačené justify-between na protější
                      hranu řádku, na 1440 to dělalo 541 px prázdna mezi názvem a jeho
                      vlastním štítkem. Četlo se to jako samostatný prvek u pravého
                      okraje, ne jako upřesnění toho nadpisu. Teď stojí hned za ním. */}
                  <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-[20px] md:text-[22px] font-semibold text-foreground leading-snug">
                      {t(lang, `${k}_name` as const)}
                    </span>
                    <span className="shrink-0 font-body text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
                      {t(lang, `${k}_price` as const)}
                    </span>
                  </dt>
                  <dd className="m-0 mt-2 font-body text-[14.5px] text-muted-foreground leading-relaxed max-w-[62ch]">
                    {/* Garance: věta z bývalého nadpisu sekce + pravidlo (nejméně nájem plus
                        energie, rozdíl z naší odměny), které pr6_note nese už od 2. 9. 2026. */}
                    {/* 20. 10. 2026: tučný úvod (g_title1+2 + dlouhá pr6_note) říkal
                        totéž co kroky pod ním, dvakrát. Zbyla jedna věta; mechaniku
                        nese tok 01 → 02 → 03. */}
                    {t(lang, `${k}_note` as const)}
                  </dd>
                  {k === "pr6" && (
                    /* 20. 10. 2026: kroky garance jako vizuální tok 01 → 02 → 03,
                       čitelný za pár vteřin: velká zlatá serifová čísla, tenká zlatá
                       linka mezi nimi, krok 03 (pointa) o stupeň silnější. Žádné
                       karty, rámečky ani stíny; na telefonu kroky pod sebou a linka
                       pokračuje svisle. */
                    <dd className="m-0 mt-8 md:mt-10">
                      <ol className="list-none m-0 p-0 grid sm:grid-cols-3 sm:gap-x-8">
                        {G_STEPS.map(({ title, desc }, i) => {
                          const last = i === G_STEPS.length - 1;
                          return (
                            <Reveal as="li" key={title} delay={stagger(i, 0.07)} className="flex sm:block gap-4">
                              {/* Číslo + spojnice: vodorovná od sm, na telefonu svislá pod číslem. */}
                              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-3 shrink-0 sm:mb-3">
                                <span
                                  aria-hidden="true"
                                  className={`font-display tnum font-semibold leading-none text-[30px] md:text-[36px] ${
                                    last ? "text-gold-deep" : "text-gold-deep/60"
                                  }`}
                                >
                                  0{i + 1}
                                </span>
                                {!last && (
                                  <>
                                    <span aria-hidden="true" className="hidden sm:flex flex-1 items-center min-w-0">
                                      <span className="h-px flex-1 bg-gradient-to-r from-gold/45 to-gold/15" />
                                      <ChevronRight className="w-3.5 h-3.5 -ml-1 text-gold/50 shrink-0" strokeWidth={1.8} />
                                    </span>
                                    <span aria-hidden="true" className="sm:hidden w-px flex-1 bg-gradient-to-b from-gold/45 to-gold/15 mt-2.5" />
                                  </>
                                )}
                              </div>
                              <div className={last ? "sm:mt-0" : "pb-7 sm:pb-0"}>
                                <p className="font-display text-[16px] md:text-[17px] font-semibold text-foreground leading-snug text-balance">
                                  {t(lang, title)}
                                </p>
                                <p
                                  className={`mt-1.5 font-body text-[13.5px] leading-relaxed text-pretty max-w-[30ch] ${
                                    last ? "text-foreground/85" : "text-muted-foreground"
                                  }`}
                                >
                                  {t(lang, desc)}
                                </p>
                              </div>
                            </Reveal>
                          );
                        })}
                      </ol>
                    </dd>
                  )}
                </div>
              ))}
            </dl>

            <details className="group mt-7">
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

            <p className="mt-10 pt-7 border-t border-border font-body text-[13px] text-muted-foreground leading-relaxed text-pretty max-w-[68ch]">
              {t(lang, "pricing_foot")}
            </p>

            {/* Jedno CTA za cenou a garancí (spec §1): stejná slovní zásoba jako
                odeslání formuláře a závěr stránky. */}
            <a
              href="#kontakt"
              onClick={() => trackEvent("cta_click", { location: "pricing", target: "contact" })}
              className="btn btn-primary mt-8"
            >
              {t(lang, "g_cta")}
              <ChevronRight className="w-4 h-4" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
