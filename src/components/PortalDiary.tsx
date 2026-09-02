import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * Ukázka deníku bytu z portálu majitele.
 *
 * Data jsou vymyšlená (skutečné obrazovky nesou jména hostů a příjem konkrétní
 * majitelky), ale mechanika je skutečná: u každé položky je vidět, kdo ji platí.
 *
 * Proč ne zeleně/červeně: červená u řádku placeného majitelem tvrdí, že jeho
 * vlastní náklad je chyba, a z Antamu dělá hodnou půlku každého řádku. Zelená
 * s červenou je navíc nejhorší dvojice pro barvoslepé a do palety by přidala dvě
 * signální barvy, které v ní nejsou. Rozlišuje proto znaménko a štítek: co platí
 * Antam, nemá u majitele částku.
 */
type Entry = {
  day: string;
  titleKey: "pd1" | "pd2" | "pd5" | "pd3" | "pd4";
  /** kladné = přišlo majiteli, záporné = strženo z výnosu, 0 = platí Antam */
  amount: number;
  payer: "antam" | "owner" | "income";
};

/*
 * Kdo co platí, se řídí VOP čl. IV: drobné opravy a údržbu do 5 000 Kč zajistí
 * Správce a odečte z výnosu Vlastníka. Roční limit (5 000 u 1+kk až 25 000
 * u větších) je proti tomu krytí ŠKOD ZPŮSOBENÝCH HOSTEM, ne údržby. Proto tu
 * žárovku platí majitel a z limitu se čerpá jen poškozený stůl. Kdyby se ta
 * pravidla někdy měnila, mění se současně VOP, faq11_a, pr7_note, pricing_foot
 * a MCP nástroj get-services, jinak si web a smlouva začnou odporovat.
 */
const ENTRIES: Entry[] = [
  { day: "3. 9.", titleKey: "pd1", amount: 0, payer: "antam" },
  { day: "9. 9.", titleKey: "pd2", amount: -200, payer: "owner" },
  { day: "12. 9.", titleKey: "pd5", amount: 1850, payer: "antam" },
  { day: "15. 9.", titleKey: "pd3", amount: 10900, payer: "income" },
  { day: "21. 9.", titleKey: "pd4", amount: -1450, payer: "owner" },
];

/**
 * Roční limit se řídí velikostí bytu (1+kk 5 000, 2+kk 10 000 … strop 25 000).
 * Ukázka je 2+kk, stejný byt jako výpis pod ní, takže tu nesmí stát strop:
 * majitel 2+kk by si z 25 000 odvodil dvaapůlkrát víc, než na co má nárok.
 */
const SPENT = 1850;
const LIMIT = 10000;

const czk = (n: number) => Math.abs(n).toLocaleString("cs-CZ").replace(/\s/g, " ");

const PortalDiary = () => {
  const { lang } = useLanguage();

  return (
    <Reveal className="mt-10 sm:mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-3 border-b border-foreground/25">
        <p className="font-body text-[11px] uppercase tracking-[0.13em] text-foreground">
          {t(lang, "pd_title")}
        </p>
        <p className="font-body text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
          {t(lang, "pd_flat")} · {t(lang, "pd_period")}
        </p>
      </div>

      <ul className="m-0 p-0 list-none">
        {ENTRIES.map((e) => (
          <li
            key={e.titleKey}
            className="grid grid-cols-[3.6rem_minmax(0,1fr)_auto] gap-x-4 sm:gap-x-6 items-baseline py-3.5 border-b border-border"
          >
            <span className="font-body text-[12.5px] text-muted-foreground tnum">{e.day}</span>
            <span className="min-w-0">
              <span className="block font-body text-[14.5px] text-foreground leading-snug">
                {t(lang, `${e.titleKey}_name` as const)}
              </span>
              <span className="mt-0.5 block font-body text-[12.5px] text-muted-foreground leading-snug">
                {t(lang, `${e.titleKey}_note` as const)}
              </span>
            </span>
            <span className="text-right whitespace-nowrap">
              {e.payer === "antam" ? (
                <>
                  <span className="block font-body text-[11px] uppercase tracking-[0.1em] text-gold-deep">
                    {t(lang, "pd_by_antam")}
                  </span>
                  <span className="mt-0.5 block font-display text-[15px] text-muted-foreground tnum">
                    {e.amount ? `${czk(e.amount)} Kč` : t(lang, "pd_free")}
                  </span>
                </>
              ) : (
                <span
                  className={`font-display tnum text-[19px] ${
                    e.payer === "income" ? "text-gold-deep font-semibold" : "text-foreground"
                  }`}
                >
                  {e.amount > 0 ? "+" : "−"}
                  {czk(e.amount)}&nbsp;Kč
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Pruh tady něco měří (kolik z limitu zbývá), na rozdíl od pruhu 70/30
          v ceníku, který jen opakoval dvě čísla vedle sebe. */}
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="font-body text-[12.5px] text-muted-foreground">{t(lang, "pd_budget")}</p>
          <p className="font-display text-[15px] text-foreground tnum">
            {czk(SPENT)}&nbsp;Kč <span className="text-muted-foreground">/ {czk(LIMIT)}&nbsp;Kč</span>
          </p>
        </div>
        <div className="mt-2 h-1 w-full max-w-sm bg-muted overflow-hidden rounded-full" aria-hidden="true">
          <div className="h-full bg-gold" style={{ width: `${(SPENT / LIMIT) * 100}%` }} />
        </div>
      </div>

      <p className="mt-4 font-body text-[12.5px] text-muted-foreground leading-relaxed max-w-[74ch]">
        {t(lang, "pd_note")}
      </p>
    </Reveal>
  );
};

export default PortalDiary;
