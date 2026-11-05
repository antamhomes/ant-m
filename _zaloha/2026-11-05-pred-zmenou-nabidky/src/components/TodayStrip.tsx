import { useLanguage } from "@/contexts/LanguageContext";

/**
 * DNES (2. 11. 2026, vizuál, návrh): úzký pás provozu pod hero. Říká, že za
 * webem je dnešní provoz, ne katalog. Identita přes čísla a provoz, ne přes
 * font. ZATÍM UKÁZKA: čísla jsou vymyšlená (MOCK), ať je vidět, jestli pás
 * vizuálně funguje. Po schválení se napojí agregát portfolia z Hospitable
 * (obsazeno dnes, příjezdy, úklidy), generovaný jednou denně při buildu.
 * Dokud je MOCK true, pás nese viditelné „ukázka“, aby se nedal zveřejnit
 * omylem jako skutečnost.
 */
const MOCK = true;
const DATA = { units: 13, occupied: 11, arrivals: 3, departures: 2, cleanings: 4, cleaningsDone: 4, lastCheckIn: "15:40" };

const TodayStrip = () => {
  const { lang } = useLanguage();
  const d = new Date();
  const date = d.toLocaleDateString(lang === "cs" ? "cs-CZ" : "vi-VN", { weekday: "long", day: "numeric", month: "long" });
  const cells =
    lang === "cs"
      ? [
          [`${DATA.occupied} z ${DATA.units}`, "bytů dnes obsazeno"],
          [`${DATA.arrivals}`, "příjezdy"],
          [`${DATA.departures}`, "odjezdy"],
          [`${DATA.cleaningsDone} z ${DATA.cleanings}`, "úklidů hotovo"],
          [DATA.lastCheckIn, "poslední check-in"],
        ]
      : [
          [`${DATA.occupied} / ${DATA.units}`, "căn có khách hôm nay"],
          [`${DATA.arrivals}`, "khách đến"],
          [`${DATA.departures}`, "khách đi"],
          [`${DATA.cleaningsDone} / ${DATA.cleanings}`, "lượt dọn xong"],
          [DATA.lastCheckIn, "check-in gần nhất"],
        ];

  return (
    <aside aria-label={lang === "cs" ? "Dnešní provoz" : "Vận hành hôm nay"} className="bg-[hsl(var(--charcoal))] text-[#E8DED0] border-t border-white/10">
      <div className="container-wide py-4 lg:py-6 flex flex-wrap items-baseline gap-x-8 lg:gap-x-12 gap-y-2 tnum">
        <p className="m-0 font-body text-[13px] sm:text-sm lg:text-[15px] text-[rgba(232,222,208,0.7)] capitalize flex items-center gap-2.5">
          <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-[#C2A46D]" />
          {date}
          {MOCK && <span className="normal-case ml-2 text-[11px] text-[rgba(232,222,208,0.45)]">({lang === "cs" ? "ukázka" : "mẫu"})</span>}
        </p>
        <dl className="m-0 flex flex-wrap items-baseline gap-x-7 sm:gap-x-9 gap-y-2">
          {cells.map(([v, l]) => (
            <div key={l} className="flex items-baseline gap-2">
              <dd className="m-0 font-body text-[15px] sm:text-base lg:text-[1.6rem] lg:leading-none font-medium text-[#F7F1E8]">{v}</dd>
              <dt className="font-body text-[12.5px] sm:text-[13px] lg:text-sm text-[rgba(232,222,208,0.62)]">{l}</dt>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
};

export default TodayStrip;
