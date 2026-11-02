import { useState } from "react";
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
const MISTAKES_VISIBLE = 5;
const HANDOVER = [1, 2, 3, 4, 5, 6, 7] as const;

const SystemSection = () => {
  const { lang } = useLanguage();
  const k = (s: string) => s as TranslationKey;
  const [allMistakes, setAllMistakes] = useState(false);
  const mistakes = allMistakes ? MISTAKES : MISTAKES.slice(0, MISTAKES_VISIBLE);

  return (
    <section id="system" className="section chapter-edge bg-background scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <h2 className="h-section-sm h-serif text-foreground">{t(lang, "sys_title")}</h2>
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
                    <span className="block font-body text-[22px] md:text-[24px] font-medium text-foreground leading-snug">
                      {t(lang, k(`sys_p${n}_t`))}
                    </span>
                    <span className="block mt-2 font-body text-[16px] md:text-[17px] text-foreground/80 leading-relaxed text-pretty max-w-[44ch]">
                      {t(lang, k(`sys_p${n}_d`))}
                    </span>
                  </span>
                  <ChevronDown className="mt-2.5 w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-4 mb-0 list-none p-0 space-y-1.5 max-w-[52ch]">
                  {t(lang, k(`sys_p${n}_items`)).split(" · ").map((item) => (
                    <li key={item} className="font-body text-[15px] text-foreground/85 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-px before:bg-foreground/40">
                      {item}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          <p className="mt-4 mb-0 font-body text-[14px] text-muted-foreground">{t(lang, "sys_pillars_note")}</p>
        </Reveal>

        {/* 2. Chyby, které už nemusíte udělat: provozní lekce, dva sloupce. */}
        <Reveal delay={0.08} className="mt-14 md:mt-20">
          <h3 className="m-0 font-body text-[26px] md:text-[30px] font-medium text-foreground leading-tight">
            {t(lang, "sys_mistakes_title")}
          </h3>
          <p className="mt-3 mb-0 font-body text-[15px] md:text-[16px] text-muted-foreground leading-relaxed max-w-[60ch] text-pretty">
            {t(lang, "sys_mistakes_lead")}
          </p>
          <ol className="mt-7 mb-0 list-none p-0 border-t border-foreground/15 max-w-[60rem]">
            {mistakes.map((n) => (
              <li key={n} className="border-b border-foreground/15 py-4 grid grid-cols-[2.5rem_1fr] gap-x-2 font-body text-[16px] md:text-[17px] text-foreground leading-relaxed text-pretty">
                <span className="tnum text-[14px] text-muted-foreground pt-[3px]">{String(n).padStart(2, "0")}</span>
                <span>{t(lang, k(`sys_m${n}`))}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setAllMistakes((v) => !v)}
            aria-expanded={allMistakes}
            className="mt-5 font-body text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
          >
            {allMistakes ? (lang === "cs" ? "Zobrazit méně" : "Thu gọn") : (lang === "cs" ? `Dalších ${MISTAKES.length - MISTAKES_VISIBLE}` : `Thêm ${MISTAKES.length - MISTAKES_VISIBLE} điều nữa`)}
          </button>
        </Reveal>

      </div>

      {/* 3. Předání jako tmavý pás (brand direction 2. 11. 2026): jediná tmavá
          plocha stránky mezi hero a závěrem. Playfair věta nese sekci, zlaté
          linky a popisky jsou materiál. Pravý sloupec je připravený na fotku
          předání (4:5), do té doby nese seznam. */}
      <Reveal delay={0.1} className="mt-14 md:mt-20 bg-gradient-dark">
        <div className="container-wide py-14 md:py-20 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-16">
          <div className="flex flex-col">
            <h3 className="m-0 font-body text-[15px] text-[#C2A46D]">
              {t(lang, "sys_handover_title")}
            </h3>
            <p className="mt-4 mb-0 font-display text-[1.9rem] md:text-[2.5rem] font-medium text-primary-foreground leading-[1.15] text-balance max-w-[18ch]">
              {t(lang, "sys_handover_close")}
            </p>
            <p className="mt-5 mb-0 font-body text-[16px] md:text-[17px] text-primary-foreground/75 leading-relaxed text-pretty max-w-[44ch]">
              {t(lang, "sys_handover_lead")}
            </p>
            <p className="mt-3 mb-0 font-body text-[15px] text-primary-foreground/60">{t(lang, "sys_handover_close2")}</p>
          </div>
          <dl className="mt-9 lg:mt-0 m-0 border-t border-[#C2A46D]/40">
            {HANDOVER.map((n) => (
              <div key={n} className="grid sm:grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 py-3.5 border-b border-[#C2A46D]/25">
                <dt className="m-0 font-body text-[14px] text-[#C2A46D] sm:w-[12ch] pt-[2px]">
                  {t(lang, k(`sys_h${n}_k`))}
                </dt>
                <dd className="m-0 font-body text-[15.5px] text-primary-foreground/90 leading-relaxed text-pretty">
                  {t(lang, k(`sys_h${n}_v`))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
};

export default SystemSection;
