import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";

/**
 * PROVOZNÍ SYSTÉM ANTAM (2. 11. 2026, Offer v2, patch 2). Stojí hned pod
 * ceníkem a je důkazem za cenou 180/270/360 tisíc: majitel nekupuje inzerát,
 * kupuje provozní systém. Tři vrstvy, od nejlehčí po nejtěžší:
 *
 *  1. šest pilířů: název + jedna věta o výsledku; podrobné dodávky jsou
 *     v rozbalovači (details), ať stránka nenese seznam konzultanta;
 *  2. „Chyby, které už nemusíte udělat": deset provozních lekcí V. z vlastních
 *     bytů, bez čísel a bez strašení; seznam na dva sloupce s drobným 01 až 10
 *     pro orientaci (V., 2. 11.);
 *  3. předání: sedm řádků, jak vypadá konec projektu a co následuje.
 *
 * Žádná čísla ani ceny: ty nese ceník nad sekcí.
 */
const PILLARS = [1, 2, 3, 4, 5, 6] as const;
const MISTAKES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const HANDOVER = [1, 2, 3, 4, 5, 6, 7] as const;

const SystemSection = () => {
  const { lang } = useLanguage();
  const k = (s: string) => s as TranslationKey;

  return (
    <section id="system" className="section chapter-edge bg-background scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "sys_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "sys_title")}</h2>
          <p className="lead mt-4 font-body text-[16px] md:text-[17px] text-muted-foreground leading-relaxed max-w-[60ch] text-pretty">
            {t(lang, "sys_lead")}
          </p>
        </Reveal>

        {/* 1. Šest pilířů. Každý je <details>: zavřený nese název a větu o
            výsledku, otevřený seznam dodávek. */}
        <Reveal delay={0.05}>
          <div className="grid gap-x-10 gap-y-0 md:grid-cols-2 border-t border-foreground/15">
            {PILLARS.map((n) => (
              <details key={n} className="group border-b border-foreground/15 py-5 md:py-6">
                <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-display text-[21px] md:text-[23px] font-semibold text-foreground leading-snug">
                      {t(lang, k(`sys_p${n}_t`))}
                    </span>
                    <span className="block mt-1.5 font-body text-[15px] text-muted-foreground leading-relaxed text-pretty max-w-[46ch]">
                      {t(lang, k(`sys_p${n}_d`))}
                    </span>
                  </span>
                  <ChevronDown className="mt-2 w-4 h-4 shrink-0 text-gold-deep transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-4 mb-0 list-none p-0 space-y-1.5 max-w-[52ch]">
                  {t(lang, k(`sys_p${n}_items`)).split(" · ").map((item) => (
                    <li key={item} className="font-body text-[14px] text-foreground/85 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-gold-deep">
                      {item}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          <p className="mt-4 mb-0 font-body text-[13px] text-muted-foreground">{t(lang, "sys_pillars_note")}</p>
        </Reveal>

        {/* 2. Chyby, které už nemusíte udělat: provozní lekce, dva sloupce. */}
        <Reveal delay={0.08} className="mt-14 md:mt-20">
          <h3 className="m-0 font-display text-[26px] md:text-[30px] font-semibold text-foreground leading-tight">
            {t(lang, "sys_mistakes_title")}
          </h3>
          <p className="mt-3 mb-0 font-body text-[15px] md:text-[16px] text-muted-foreground leading-relaxed max-w-[60ch] text-pretty">
            {t(lang, "sys_mistakes_lead")}
          </p>
          <ol className="mt-7 mb-0 list-none p-0 grid gap-x-10 md:grid-cols-2 border-t border-foreground/15">
            {MISTAKES.map((n) => (
              <li key={n} className="border-b border-foreground/15 py-3.5 grid grid-cols-[2.25rem_1fr] gap-x-2 font-body text-[15px] text-foreground leading-relaxed text-pretty">
                <span className="tnum text-[12px] tracking-[0.12em] text-gold-deep pt-[5px]">{String(n).padStart(2, "0")}</span>
                <span>{t(lang, k(`sys_m${n}`))}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* 3. Předání: konkrétní konec projektu. */}
        <Reveal delay={0.1} className="mt-14 md:mt-20">
          <div className="rounded-sm bg-card border border-border px-6 py-8 md:px-10 md:py-10 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-16">
            <div className="flex flex-col">
              <h3 className="m-0 font-display text-[26px] md:text-[30px] font-semibold text-foreground leading-tight">
                {t(lang, "sys_handover_title")}
              </h3>
              <p className="mt-3 mb-0 font-body text-[15px] md:text-[16px] text-muted-foreground leading-relaxed text-pretty max-w-[44ch]">
                {t(lang, "sys_handover_lead")}
              </p>
              {/* Závěr v levém sloupci: po 90 dnech je provoz majitele. Na mobilu
                  až pod seznamem, ať čtenář nejdřív vidí, co dostane. */}
              <p className="hidden lg:block mt-auto pt-10 mb-0 font-display text-[22px] font-semibold text-foreground leading-snug text-pretty max-w-[20ch]">
                {t(lang, "sys_handover_close")}
                <span className="block mt-2 font-body text-[15px] font-normal text-muted-foreground">{t(lang, "sys_handover_close2")}</span>
              </p>
            </div>
            <dl className="mt-7 lg:mt-0 m-0 border-t border-foreground/15">
              {HANDOVER.map((n) => (
                <div key={n} className="grid sm:grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 py-3 border-b border-foreground/15">
                  <dt className="m-0 font-body text-[12px] uppercase tracking-[0.14em] text-gold-deep sm:w-[12ch] pt-[3px]">
                    {t(lang, k(`sys_h${n}_k`))}
                  </dt>
                  <dd className="m-0 font-body text-[15px] text-foreground leading-relaxed text-pretty">
                    {t(lang, k(`sys_h${n}_v`))}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="lg:hidden mt-7 mb-0 font-display text-[21px] font-semibold text-foreground leading-snug text-pretty">
              {t(lang, "sys_handover_close")}
              <span className="block mt-2 font-body text-[15px] font-normal text-muted-foreground">{t(lang, "sys_handover_close2")}</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SystemSection;
