import { useState } from "react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { MARKET_OCC, ratioFor } from "@/lib/yield";
import byt1 from "@/assets/byt-1.jpg.asset.json";
import byt2 from "@/assets/byt-2.jpg.asset.json";
import byt3 from "@/assets/byt-3.jpg.asset.json";
import byt4 from "@/assets/byt-4.jpg.asset.json";
import byt5 from "@/assets/byt-5.jpg.asset.json";

/** Results shown on the cards: owner's monthly income, rounded to thousands, plus occupancy.
 *  Method confirmed by the owner 28. 8. 2026: take what the platform actually pays out (already net
 *  of its own commission), subtract the cleaning fee, then apply the 20 % + VAT fee. Airbnb settles in
 *  CZK, Booking.com in EUR, converted at 25,00. The local tourist tax was collected separately
 *  online and is paid by the guest (owner, 28. 8. 2026); it is deliberately not mentioned in the
 *  footnote, because it is not something the owner reading this has to care about.
 *  Recomputed 28. 8. 2026 from Hospitable and cross-checked against PriceLabs (six flats match to
 *  0,0 %, the rest within 0,9 %). Three "checkpoint voided" duplicates with zero revenue are
 *  excluded; they inflated night counts, not money.
 *  Window: last 12 full months (1. 8. 2025 – 31. 7. 2026) or, for flats that joined later, from the
 *  first stay (`since`).
 *  `ratio` (patch 127) is COMPUTED, not typed: owner income / rentFor(district, actual m²),
 *  the same function the calculator uses (Sreality medians 8/2026, district level × citywide
 *  size curve; Deloitte Q2/2026 kept as a test anchor).
 *  Klement (Mladá Boleslav): správa skončila 10/2026, ale měřená karta ZŮSTÁVÁ se
 *  stejnými čísly jako historický výsledek (rozhodnutí V. 22. 10. 2026). Druhá karta
 *  „od 8/2026" bez čísel odešla: slibovala výsledky po sezóně, která už nepřijde.
 *  Market (patch 127): ONE source with the calculator (MARKET_OCC from the PriceLabs district
 *  dataset, 12 months, bedroom band of the flat); the old 90-day comp-set probes are gone, so
 *  the page no longer shows two different "market" numbers for one district.
 *  Occupancy (recomputed 28. 8. 2026): share of booked nights over a window that starts on the
 *  46th day of operation, so the ramp-up weeks do not drag the number down. Only flats older than
 *  three months get one.
 *  Flats younger than ~3 months get no numbers yet (`newSince`), only a note.
 *  Refresh monthly: STATS_ASOF + the numbers below. */
const STATS_ASOF = { cs: "31. 7. 2026", vi: "31/7/2026" };

type Stats = { owner: number; occupancy: number; market: number; since?: string };
/** focus: kam se má ořez fotky držet, když má snímek jiný poměr než rám.
 *  Default je střed; u fotky, které centrování usekne to podstatné, stačí
 *  dopsat "top" nebo "bottom", layout se nemění. */
type Item = { src: string; name: string; loc: string; guests: number; m2?: number; stats?: Stats; newSince?: string; focus?: "top" | "bottom" };
const ratioOf = (item: Item) => item.stats && item.m2 ? ratioFor(item.loc, item.m2, item.stats.owner) : null;

/** The apartments shown publicly (owner's choice); capacities from Hospitable.
 *  byt-1…7 are Lovable assets; 402/405 (Praha 1, Čelakovského sady) are small webp files in public/portfolio.
 *  Order: measured results first (the section pays off the hero claim), longest window leading; flats without a full season follow with their honest badge. */
const items: Item[] = [
  { src: "/portfolio/byt-402.webp", name: "Elegant Museum View\u00a0Apartment", loc: "Praha 1", m2: 52, guests: 8, stats: { owner: 69000, occupancy: 96, market: MARKET_OCC.praha1 } },
  { src: "/portfolio/byt-405.webp", name: "Modern Museum View\u00a0Apartment", loc: "Praha 1", m2: 52, guests: 8, stats: { owner: 62000, occupancy: 94, market: MARKET_OCC.praha1 } },
  { src: "/portfolio/byt-modern-ac.webp", name: "Modern AC\u00a0Apartment", loc: "Praha 3", m2: 55, guests: 6, stats: { owner: 54000, occupancy: 96, market: MARKET_OCC.praha3, since: "2/2026" } },
  // Praha 3, ne Praha 4: potvrzeno majitelem 28. 8. 2026 i PSČ 130 00 v Hospitable.
  { src: byt4.url, name: "Moderní apartmán se zahradou", loc: "Praha 3", m2: 60, guests: 6, stats: { owner: 45000, occupancy: 85, market: MARKET_OCC.praha3, since: "4/2026" } },
  { src: byt5.url, name: "Klement apartment s\u00a0terasou", loc: "Mladá Boleslav", m2: 85, guests: 8, stats: { owner: 32000, occupancy: 91, market: MARKET_OCC.mb, since: "4/2026" } },
  { src: byt3.url, name: "Secret Garden Loft", loc: "Praha 4", m2: 110, guests: 13, newSince: "7/2026" },
  { src: byt1.url, name: "Secret Garden Studio\u00a0I", loc: "Praha 4", m2: 22, guests: 4, newSince: "7/2026" },
  { src: byt2.url, name: "Secret Garden Studio\u00a0II", loc: "Praha 4", m2: 22, guests: 4, newSince: "7/2026" },
];

const fmtCzk = (n: number) => n.toLocaleString("cs-CZ").replace(/\s/g, "\u00a0");

const copy = {
  cs: {
    eyebrow: "Výsledky",
    title: "Stejný trh. Jiná čísla.",
    desc: "Skutečné částky pro majitele z měsíčních vyúčtování a obsazenost proti průměru okolí.",
    guests: (n: number) => `až ${n} host${n === 4 ? "é" : "ů"}`,
    soonTitle: "Tady může být váš byt",
    soonDesc: "Napište nám a\u00a0do 24 hodin víte, jak je na\u00a0tom ten váš. Zdarma a\u00a0nezávazně.",
    soonDescShort: "Napište nám a\u00a0do 24 hodin víte, jak je na\u00a0tom ten váš.",
    showAll: "Zobrazit další výsledky",
    prevFlat: "Předchozí byt",
    nextFlat: "Další byt",
    featOwner: "průměrně měsíčně majiteli",
    calcBridge: "Odhad v\u00a0kalkulačce vychází z\u00a0trhu. Výsledky výš jsou skutečné byty z\u00a0naší správy.",
    statNoteToggle: "Jak počítáme částky na kartách",
    showLess: "Zobrazit méně",
    statOwner: "majiteli měsíčně",
    statOcc: "obsazenost",
    barMarket: (loc: string) => `trh ${loc === "Mladá Boleslav" ? "MB" : loc}:`,
    market: "trh",
    statPeriod12: "průměr 12 měsíců",
    statPeriodSince: (m: string) => `průměr od ${m}`,
    statRatio: (r: number) => `${r.toLocaleString("cs-CZ")}× dlouhodobý nájem`,
    newBadge: (m: string) => `V naší správě od ${m}`,
    newNote: "Výsledky doplníme po první sezóně.",
    statNote: (d: string) => `Částka, kterou majitel obdrží, vychází ze skutečných rezervací každého bytu a je počítána podle naší současné odměny 20 % + DPH, po odečtení poplatků Airbnb a Booking.com a bez poplatků za úklid. Údaje představují průměr za posledních 12 měsíců; u novějších bytů počítáme období od začátku naší správy. Obsazenost v dané lokalitě vychází z dat PriceLabs. Dlouhodobé nájemné vychází z více než 1 300 nabídek na Sreality podle městské části a velikosti bytu a je porovnáno s Deloitte Rent Indexem. Skutečné výsledky se mohou v čase měnit a nejsou příslibem budoucích výnosů.\n`,
  },
  vi: {
    eyebrow: "Kết quả thực tế",
    title: "Những căn Antam quản lý, chủ nhà nhận về bao nhiêu",
    desc: "Số liệu thật từ bảng kê hằng tháng, không phải ước tính.",
    guests: (n: number) => `tối đa ${n} khách`,
    soonTitle: "Căn của anh chị có thể ở đây",
    soonDesc: "Nhắn cho Antam, trong 24 giờ anh chị biết căn nhà mình thế nào. Miễn phí, không ràng buộc.",
    soonDescShort: "Nhắn cho Antam, trong 24 giờ anh chị biết căn nhà mình thế nào.",
    showAll: "Xem thêm kết quả",
    prevFlat: "Căn trước",
    nextFlat: "Căn sau",
    featOwner: "trung bình mỗi tháng chủ nhà nhận",
    calcBridge: "Ước tính ở phần tính thử dựa trên thị trường. Kết quả ở trên là những căn thật Antam đang quản lý.",
    statNoteToggle: "Antam tính số trên thẻ thế nào",
    showLess: "Thu gọn",
    statOwner: "chủ nhà nhận / tháng",
    statOcc: "lấp phòng",
    barMarket: (loc: string) => `khu ${loc === "Mladá Boleslav" ? "MB" : loc}:`,
    market: "khu",
    statPeriod12: "trung bình 12 tháng",
    statPeriodSince: (m: string) => `trung bình từ ${m}`,
    statRatio: (r: number) => `gấp ${r.toLocaleString("vi-VN")} lần cho thuê dài hạn`,
    newBadge: (m: string) => `Antam lo từ ${m}`,
    newNote: "Số liệu sẽ có sau mùa đầu tiên.",
    statNote: (d: string) => `Số tiền chủ nhà nhận tính từ đặt phòng thật của từng căn, theo mức phí Antam hiện nay 20% + VAT, sau khi trừ phí Airbnb, Booking.com và không tính phí dọn dẹp. Đây là trung bình 12 tháng gần nhất, căn mới hơn thì tính từ khi Antam nhận, tính đến ${d}. Tỷ lệ lấp phòng của khu lấy từ PriceLabs. Tiền thuê dài hạn lấy từ hơn 1\u00a0300 tin đăng trên Sreality theo quận và diện tích, có đối chiếu với Deloitte Rent\u00a0Index. Kết quả đã qua không phải là cam kết cho\u00a0tương\u00a0lai.`,
  },
};

/** Jedna dlaždice mozaiky: fotka, částka na fotce dole vlevo, pod ní název a
 *  obsazenost proti trhu jako prostý text. Žádný rámeček, žádný stín. */
const Tile = ({ item, big, c, lang }: { item: Item; big?: boolean; c: (typeof copy)["cs"]; lang: "cs" | "vi" }) => (
  <figure className={`m-0 min-w-0 ${big ? "lg:flex lg:flex-col lg:h-full" : ""}`}>
    <div className={`relative overflow-hidden bg-secondary ${big ? "aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-[420px]" : "aspect-[4/3] lg:aspect-[16/10]"}`}>
      <img
        src={item.src}
        alt={`${item.name}, ${item.loc}`}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover ${item.focus === "top" ? "object-top" : item.focus === "bottom" ? "object-bottom" : "object-center"}`}
      />
      {item.stats && (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(to_top,rgba(14,13,11,0.82)_0%,rgba(14,13,11,0.5)_45%,rgba(14,13,11,0)_100%)]" />
          <p className={`absolute left-4 bottom-3.5 sm:left-5 sm:bottom-4 m-0 tnum ${big ? "lg:left-7 lg:bottom-6" : ""}`}>
            <span className={`block font-display font-semibold text-white leading-none tracking-[-0.02em] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] ${big ? "text-[2.4rem] sm:text-[3rem] lg:text-[3.6rem]" : "text-[1.6rem] sm:text-[1.9rem]"}`}>
              {fmtCzk(item.stats.owner)}
              <span className="ml-2 text-[0.42em] font-normal text-white/85">Kč</span>
            </span>
            <span className="mt-1.5 block font-body text-[12px] sm:text-[13px] text-white/85 leading-tight">{c.statOwner}</span>
          </p>
        </>
      )}
    </div>
    <figcaption className="pt-3 sm:pt-3.5 tnum">
      <h3 className={`m-0 font-body font-medium text-foreground leading-snug text-balance ${big ? "text-[17px] sm:text-lg" : "text-[15px] sm:text-base"}`}>
        {item.name}
      </h3>
      <p className="m-0 mt-1 font-body text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
        {item.loc} · {item.m2}&nbsp;m² · {c.guests(item.guests)}
      </p>
      {item.stats ? (
        <p className="m-0 mt-1 font-body text-[13px] sm:text-sm text-foreground/80 leading-relaxed">
          <b className="font-medium text-foreground">{item.stats.occupancy}{lang === "cs" ? "\u00a0%" : "%"}</b> {c.statOcc}, {c.barMarket(item.loc)}&nbsp;{item.stats.market}{lang === "cs" ? "\u00a0%" : "%"}
          <span className="text-muted-foreground"> · {item.stats.since ? c.statPeriodSince(item.stats.since) : c.statPeriod12}</span>
        </p>
      ) : (
        <p className="m-0 mt-1 font-body text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
          {c.newBadge(item.newSince!)}. {c.newNote}
        </p>
      )}
    </figcaption>
  </figure>
);

const PortfolioSection = () => {
  const { lang } = useLanguage();
  const c = copy[lang];
  /* 2. 11. 2026 (vizuál C10): asymetrická mozaika místo carouselu. Jedna velká
     dlaždice (nejdelší měřené okno), dvě menší vedle ní; zbytek na rozkliknutí
     ve třech sloupcích. Bez šipek, bez počítadla. */
  const [showAll, setShowAll] = useState(false);
  const [lead, second, third, ...rest] = items;

  return (
    <section id="portfolio" className="section bg-background scroll-mt-20">
      <div className="container-wide">
        <Reveal className="section-head">
          <h2 className="h-section-sm text-foreground">{c.title}</h2>
          <p className="lead">{c.desc}</p>
        </Reveal>

        <Reveal className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-x-6 gap-y-8 lg:items-stretch">
          <Tile item={lead} big c={c} lang={lang} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-8 lg:gap-y-6">
            <Tile item={second} c={c} lang={lang} />
            <Tile item={third} c={c} lang={lang} />
          </div>
        </Reveal>

        <div id="portfolio-vsechny" className={showAll ? "mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8" : "hidden"}>
          {rest.map((item) => (
            <Tile key={item.name} item={item} c={c} lang={lang} />
          ))}
          {showAll && (
            <a href="#kontakt" className="flex flex-col justify-end border border-foreground/15 px-5 py-6 min-h-[200px] no-underline">
              <h3 className="m-0 font-body text-lg font-medium text-foreground">{c.soonTitle}</h3>
              <p className="m-0 mt-2 font-body text-sm text-muted-foreground leading-relaxed text-pretty max-w-[28ch]">
                <span className="sm:hidden">{c.soonDescShort}</span>
                <span className="hidden sm:inline">{c.soonDesc}</span>
              </p>
            </a>
          )}
        </div>

        <Reveal className="mt-8 sm:mt-10 pt-5 border-t border-foreground/15 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className="m-0 font-body text-[14.5px] sm:text-[15px] text-muted-foreground leading-relaxed text-pretty max-w-[58ch]">
            {c.calcBridge}
          </p>
          {!showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              aria-expanded={false}
              aria-controls="portfolio-vsechny"
              className="font-body text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              {c.showAll} ({rest.length})
            </button>
          )}
        </Reveal>

        {/* How the numbers on the cards are computed: full method, behind a toggle. */}
        <Reveal delay={0.05} className="mt-4 sm:mt-5">
          <details className="group max-w-prose">
            <summary className="list-none cursor-pointer font-body text-xs text-muted-foreground underline underline-offset-4 decoration-border [&::-webkit-details-marker]:hidden">
              {c.statNoteToggle}
            </summary>
            <p className="mt-3 font-body text-[11px] sm:text-xs text-muted-foreground/90 leading-relaxed text-pretty max-w-[58ch]">
              {c.statNote(STATS_ASOF[lang])}
            </p>
          </details>
        </Reveal>
      </div>
    </section>
  );
};

export default PortfolioSection;
