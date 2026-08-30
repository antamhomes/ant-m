import { useState } from "react";
import { MapPin, Users, Ruler, Sparkles, ChevronDown } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { OCCUPANCY_BY_FLAT } from "@/lib/yield";
import byt1 from "@/assets/byt-1.jpg.asset.json";
import byt2 from "@/assets/byt-2.jpg.asset.json";
import byt3 from "@/assets/byt-3.jpg.asset.json";
import byt4 from "@/assets/byt-4.jpg.asset.json";
import byt5 from "@/assets/byt-5.jpg.asset.json";
import byt6 from "@/assets/byt-6.jpg.asset.json";
import byt7 from "@/assets/byt-7.jpg.asset.json";

/** Results shown on the cards: owner's monthly income, rounded to thousands, plus occupancy.
 *  Method confirmed by the owner 28. 8. 2026: take what the platform actually pays out (already net
 *  of its own commission), subtract the cleaning fee, then apply the 70/30 split. Airbnb settles in
 *  CZK, Booking.com in EUR, converted at 25,00. The local tourist tax was collected separately
 *  online and is paid by the guest (owner, 28. 8. 2026); it is deliberately not mentioned in the
 *  footnote, because it is not something the owner reading this has to care about.
 *  Recomputed 28. 8. 2026 from Hospitable and cross-checked against PriceLabs (six flats match to
 *  0,0 %, the rest within 0,9 %). Three "checkpoint voided" duplicates with zero revenue are
 *  excluded; they inflated night counts, not money.
 *  Window: last 12 full months (1. 8. 2025 – 31. 7. 2026) or, for flats that joined later, from the
 *  first stay (`since`).
 *  `ratio` = owner income vs. long-term rent for the flat's ACTUAL floor area
 *  (Deloitte Rent Index Q2/2026 for the Kč/m² level, MF price map 15. 8. 2026 for the
 *  size gradient). A 2+kk can be 45 or 90 m², so disposition alone was the wrong key.
 *  Market (patch 119): ONE number per locality (PriceLabs, trailing 90 days, average across our
 *  listings there); per-flat probes differed only by sampling noise (402: 77,5 vs 405: 77,2).
 *  Occupancy (recomputed 28. 8. 2026): share of booked nights over a window that starts on the
 *  46th day of operation, so the ramp-up weeks do not drag the number down. Only flats older than
 *  three months get one.
 *  Flats younger than ~3 months get no numbers yet (`newSince`), only a note.
 *  Refresh monthly: STATS_ASOF + the numbers below. */
const STATS_ASOF = { cs: "31. 7. 2026", vi: "31/7/2026" };

type Stats = { owner: number; occupancy: number; market: number; since?: string; ratio?: number };
type Item = { src: string; name: string; loc: string; guests: number; m2?: number; stats?: Stats; newSince?: string };

/** The apartments shown publicly (owner's choice); capacities from Hospitable.
 *  byt-1…7 are Lovable assets; 402/405 (Praha 1, Čelakovského sady) are small webp files in public/portfolio.
 *  Order: measured results first (the section pays off the hero claim), longest window leading; flats without a full season follow with their honest badge. */
const items: Item[] = [
  { src: "/portfolio/byt-402.webp", name: "Elegant Museum View\u00a0Apartment", loc: "Praha 1", m2: 52, guests: 8, stats: { owner: 64000, occupancy: 96, market: 77, ratio: 2.5 } },
  { src: "/portfolio/byt-405.webp", name: "Modern Museum View\u00a0Apartment", loc: "Praha 1", m2: 52, guests: 8, stats: { owner: 57000, occupancy: 94, market: 77, ratio: 2.2 } },
  { src: "/portfolio/byt-modern-ac.webp", name: "Modern AC\u00a0Apartment", loc: "Praha 3", m2: 55, guests: 6, stats: { owner: 50000, occupancy: 96, market: 73, since: "2/2026", ratio: 1.9 } },
  // Praha 3, ne Praha 4: potvrzeno majitelem 28. 8. 2026 i PSČ 130 00 v Hospitable.
  // Násobek 1,6× platí dál: Praha 4 3+kk (26 000) a Praha 3 2+kk (26 500) vyjdou skoro stejně.
  { src: byt4.url, name: "Moderní apartmán se zahradou", loc: "Praha 3", m2: 60, guests: 6, stats: { owner: 42000, occupancy: 85, market: 73, since: "4/2026", ratio: 1.5 } },
  { src: byt5.url, name: "Klement apartment s\u00a0terasou", loc: "Mladá Boleslav", m2: 85, guests: 8, stats: { owner: 30000, occupancy: 91, market: 72, since: "4/2026", ratio: 1.4 } },
  { src: byt7.url, name: "My Mozart studio", loc: "Praha 5", m2: 40, guests: 4, stats: { owner: 30000, occupancy: 97, market: 74, since: "2/2026", ratio: 1.4 } },
  { src: byt3.url, name: "Secret Garden Loft", loc: "Praha 4", m2: 110, guests: 13, newSince: "7/2026" },
  { src: byt1.url, name: "Secret Garden Studio\u00a0I", loc: "Praha 4", m2: 22, guests: 4, newSince: "7/2026" },
  { src: byt2.url, name: "Secret Garden Studio\u00a0II", loc: "Praha 4", m2: 22, guests: 4, newSince: "7/2026" },
  { src: byt6.url, name: "Klement apartment", loc: "Mladá Boleslav", m2: 80, guests: 8, newSince: "8/2026" },
];

const fmtCzk = (n: number) => n.toLocaleString("cs-CZ").replace(/\s/g, "\u00a0");

const copy = {
  cs: {
    eyebrow: "Výsledky",
    title: "Výsledky našich bytů",
    desc: "Výsledky z měsíčních vyúčtování.",
    guests: (n: number) => `až ${n} host${n === 4 ? "é" : "ů"}`,
    soonTitle: "Tady může být váš byt",
    soonDesc: "Každý byt nejdřív posoudíme, a\u00a0když unese písemné minimum, vezmeme ho. Napište nám a\u00a0do 24 hodin víte, jak je na\u00a0tom ten váš.",
    soonDescShort: "Každý byt nejdřív posoudíme. Napište nám a\u00a0do 24 hodin víte, jak je na\u00a0tom ten váš.",
    showAll: "Zobrazit všechny naše byty",
    statNoteToggle: "Jak počítáme částky na kartách",
    showLess: "Zobrazit méně",
    statOwner: "majiteli měsíčně",
    statOcc: "obsazenost",
    barMarket: (loc: string) => `trh ${loc === "Mladá Boleslav" ? "MB" : loc}`,
    statPeriod12: "průměr 12 měsíců",
    statPeriodSince: (m: string) => `průměr od ${m}`,
    statRatio: (r: number) => `${r.toLocaleString("cs-CZ")}× dlouhodobý nájem`,
    newBadge: (m: string) => `V naší správě od ${m}`,
    newNote: "Výsledky doplníme po první sezóně.",
    statNote: (d: string) => `Částky pro majitele vycházejí ze skutečných rezervací, přepočtených na aktuální odměnu 30\u00a0%: tržby za ubytování po provizi Airbnb a Booking.com, bez úklidových poplatků, po naší odměně. Tedy to, co by majitel dostal při dnešních podmínkách; energie hradí majitel. Zaokrouhleno na tisíce. Průměr za posledních 12 měsíců, u novějších bytů od začátku správy, stav k\u00a0${d}. Obsazenost počítáme u\u00a0bytů starších tří měsíců a\u00a0prvních 45 dní provozu do\u00a0ní nezapočítáváme, byt se\u00a0v\u00a0nich teprve rozjíždí. Údaj o\u00a0trhu je z\u00a0PriceLabs za\u00a0posledních 90 dní a\u00a0platí pro lokalitu: průměrná obsazenost srovnatelných bytů v\u00a0okolí našich bytů v\u00a0dané lokalitě. Dva byty ve\u00a0stejné lokalitě proto ukazují stejné číslo trhu. U\u00a0nových nabídek se výsledky během prvního roku provozu teprve ustalují. Dlouhodobý nájem počítáme z\u00a0Deloitte Rent\u00a0Index Q2/2026 podle skutečné plochy bytu; rozdíl mezi dispozicemi bereme z\u00a0cenové mapy nájemního bydlení Ministerstva financí (15.\u00a08.\u00a02026). Minulé výsledky nejsou zárukou budoucích.`,
  },
  vi: {
    eyebrow: "Kết quả thực tế",
    title: "Những căn Antam lo, chủ nhà nhận được bao nhiêu",
    desc: "Số liệu thật từ bảng kê hằng tháng, không phải ước tính.",
    guests: (n: number) => `tối đa ${n} khách`,
    soonTitle: "Căn của anh chị có thể ở đây",
    soonDesc: "Căn nào Antam cũng xem kỹ trước, gánh được mức cam kết thì mới nhận. Nhắn cho Antam, trong 24 giờ anh chị biết căn nhà mình thế nào.",
    soonDescShort: "Căn nào Antam cũng xem kỹ trước. Nhắn cho Antam, trong 24 giờ anh chị biết căn nhà mình thế nào.",
    showAll: "Xem tất cả các căn của Antam",
    statNoteToggle: "Antam tính số trên thẻ thế nào",
    showLess: "Thu gọn",
    statOwner: "chủ nhà nhận / tháng",
    statOcc: "lấp phòng",
    barMarket: (loc: string) => `khu ${loc === "Mladá Boleslav" ? "MB" : loc}`,
    statPeriod12: "trung bình 12 tháng",
    statPeriodSince: (m: string) => `trung bình từ ${m}`,
    statRatio: (r: number) => `gấp ${r.toLocaleString("vi-VN")} lần cho thuê dài hạn`,
    newBadge: (m: string) => `Antam lo từ ${m}`,
    newNote: "Số liệu sẽ có sau mùa đầu tiên.",
    statNote: (d: string) => `Số tiền chủ nhà nhận dựa trên đặt phòng thật của từng căn, tính lại theo mức phí Antam hiện nay 30%: tiền phòng sau khi trừ phí Airbnb và Booking.com, không tính phí dọn dẹp, sau phí của Antam. Tức là số tiền chủ nhà sẽ nhận với điều kiện hiện nay; điện nước chủ nhà lo. Làm tròn đến hàng nghìn. Trung bình 12 tháng gần nhất, căn mới hơn thì tính từ khi Antam nhận, tính đến ${d}. Tỷ lệ lấp phòng chỉ tính cho căn đã quản lý trên ba tháng, 45 ngày đầu không tính vì nhà mới mở còn đang chạy đà. Số của khu lấy từ PriceLabs, 90 ngày gần nhất, tính chung cho từng khu vực: tỷ lệ lấp phòng trung bình của các căn tương tự quanh những căn Antam lo trong khu đó. Hai căn cùng khu vì vậy có cùng một số thị trường. Tiền thuê dài hạn tính từ Deloitte Rent\u00a0Index Q2/2026 theo đúng diện tích từng căn; phần chênh giữa các loại nhà lấy từ bản đồ giá thuê của Bộ Tài chính (15.\u00a08.\u00a02026). Kết quả đã qua không phải là cam kết cho tương lai.`,
  },
};

const PortfolioSection = () => {
  const { lang } = useLanguage();
  const c = copy[lang];
  // Only the three strongest results load the section; the rest is one tap away.
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 3);

  return (
    <section id="portfolio" className="section bg-background scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{c.eyebrow}</p>
          <h2 className="h-section-sm text-foreground">{c.title}</h2>
          <p className="lead">{c.desc}</p>
        </Reveal>

        <div id="portfolio-vsechny" className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {visible.map((item, i) => {
            /* K3 (29. 8. 2026), composition under 1024 px: the strongest result leads as a
               full-width card (phone: photo above the numbers; tablet: photo left, numbers
               right), the rest pair up. With 1 + 2 or 1 + 10 cards no card is ever left
               orphaned in a two-column grid. From lg the three-column grid is unchanged. */
            const lead = i === 0;
            return (
            <Reveal as="figure"
              key={item.name} delay={stagger(i % 3, 0.08)}
              className={`group overflow-hidden rounded-md border border-border bg-card shadow-[0_20px_45px_-30px_hsl(var(--charcoal)/0.4)] ${
                lead ? "col-span-2 lg:col-span-1 sm:grid sm:grid-cols-2 lg:block" : ""
              }`}
            >
              <div className={`relative overflow-hidden bg-secondary ${
                lead ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[300px] lg:aspect-[4/3] lg:h-auto lg:min-h-0" : "aspect-[4/3]"
              }`}>
                <img
                  src={item.src}
                  alt={`${item.name}, ${item.loc}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* K2 (29. 8. 2026): the owner's monthly result sits on the photo, lower left,
                    over a gradient that touches only the bottom half. The top of the photo stays
                    untouched, the number is the first thing the eye lands on. */}
                {item.stats && (
                  <>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(14,13,11,0.82)_0%,rgba(14,13,11,0.55)_38%,rgba(14,13,11,0.18)_72%,rgba(14,13,11,0)_100%)]"
                    />
                    <p className={`absolute ${lead ? "left-4 bottom-3.5" : "left-2.5 bottom-2"} sm:left-5 sm:bottom-4 pr-2.5 sm:pr-5 tnum`}>
                      <span className={`block font-display ${lead ? "text-[32px]" : "text-[18px]"} sm:text-[30px] lg:text-[32px] font-semibold text-white leading-none tracking-[-0.01em] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]`}>
                        {fmtCzk(item.stats.owner)}&nbsp;Kč
                      </span>
                      <span className={`mt-1 sm:mt-1.5 block font-body uppercase ${lead ? "text-[11px] tracking-[0.14em]" : "text-[8px] tracking-[0.1em]"} sm:text-[11px] sm:tracking-[0.14em] text-white/85 leading-tight`}>
                        {c.statOwner}
                      </span>
                    </p>
                  </>
                )}
              </div>
              <figcaption className={lead ? "px-4 py-4 sm:px-5 sm:py-4 sm:self-center" : "px-2.5 py-2.5 sm:px-5 sm:py-4"}>
                {/* Below the photo the story continues in one line: the multiple of long-term rent.
                    Then the flat as context, then occupancy against the locality. */}
                {item.stats?.ratio && (
                  <p className={`mb-1.5 sm:mb-2 font-body ${lead ? "text-sm" : "text-[11px]"} sm:text-sm font-semibold text-gold-deep leading-snug`}>
                    {c.statRatio(item.stats.ratio)}
                  </p>
                )}
                <h3 className={`font-display ${lead ? "text-base" : "text-[13px]"} sm:text-base font-semibold text-foreground leading-snug text-balance`}>
                  {item.name}
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {item.loc}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    {c.guests(item.guests)}
                  </span>
                  {item.m2 && (
                    <span className="inline-flex items-center gap-1.5 tnum">
                      <Ruler className="w-3.5 h-3.5 text-gold" />
                      {item.m2}&nbsp;m²
                    </span>
                  )}
                </p>
                {/* Occupancy as plain typography: the flat's number leads, the locality's market
                    number follows in muted text. No bars, no chart. New flats get a note instead. */}
                {item.stats && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border tnum">
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-none">
                      <span className={`font-display ${lead ? "text-xl" : "text-base"} sm:text-xl font-semibold text-foreground`}>
                        {item.stats.occupancy}{lang === "cs" ? "\u00a0%" : "%"}
                      </span>
                      <span className="font-body text-[9.5px] sm:text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {c.statOcc}
                      </span>
                      <span className={`${lead ? "basis-auto ml-auto" : "basis-full sm:basis-auto sm:ml-auto"} font-body text-[10.5px] sm:text-xs text-muted-foreground`}>
                        {c.barMarket(item.loc)}&nbsp;{item.stats.market}{lang === "cs" ? "\u00a0%" : "%"}
                      </span>
                    </p>
                    <p className="mt-2 font-body text-[10.5px] sm:text-xs text-muted-foreground leading-snug">
                      {item.stats.since ? c.statPeriodSince(item.stats.since) : c.statPeriod12}
                    </p>
                  </div>
                )}
                {item.newSince && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border">
                    <span className="inline-flex items-center rounded-full bg-gold/10 text-gold-deep font-body text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] px-2 sm:px-2.5 py-0.5 sm:py-1">
                      {c.newBadge(item.newSince)}
                    </span>
                    <p className="mt-1.5 font-body text-[10.5px] sm:text-xs text-muted-foreground leading-snug">
                      {c.newNote}
                    </p>
                  </div>
                )}
              </figcaption>
            </Reveal>
            );
          })}

          {showAll && (
          <Reveal delay={0.08} className="contents">
            <a
              href="#kontakt"
              className="flex flex-col items-center justify-center text-center rounded-md border border-dashed border-gold/40 bg-gold/[0.04] px-4 sm:px-6 py-8 sm:py-10 min-h-[220px] transition-colors hover:border-gold/70 hover:bg-gold/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <Sparkles className="w-6 h-6 text-gold mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {c.soonTitle}
              </h3>
              <p className="font-body text-sm text-muted-foreground max-w-[26ch] leading-relaxed">
                <span className="sm:hidden">{c.soonDescShort}</span>
                <span className="hidden sm:inline">{c.soonDesc}</span>
              </p>
            </a>
          </Reveal>
          )}

        </div>

        {!showAll && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              aria-expanded={false}
              aria-controls="portfolio-vsechny"
              className="btn btn-secondary max-sm:px-4 max-sm:tracking-[0.1em]"
            >
              {c.showAll}
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* How the numbers on the cards are computed: full method, but behind a
            toggle (patch 126), so the proof block is not followed by a 1 000-character
            wall. Same pattern as the calculator's "Jak počítáme". */}
        <Reveal delay={0.05} className="mt-4 sm:mt-5">
          <details className="group max-w-prose mx-auto">
            <summary className="list-none cursor-pointer font-body text-xs text-muted-foreground text-center underline underline-offset-4 decoration-border [&::-webkit-details-marker]:hidden">
              {c.statNoteToggle}
            </summary>
            <p className="mt-3 font-body text-[11px] sm:text-xs text-muted-foreground/90 leading-relaxed text-pretty text-left sm:text-center">
              {c.statNote(STATS_ASOF[lang])}
            </p>
          </details>
        </Reveal>

      </div>
    </section>
  );
};

export default PortfolioSection;
